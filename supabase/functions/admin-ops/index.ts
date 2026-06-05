import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// Usage analytics — cross-user aggregation. Runs with the service role so it can
// read every user's rows (the browser cannot, because of RLS). Written
// defensively: a missing table/column degrades a single metric to 0 rather than
// failing the whole dashboard.
// ─────────────────────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
type SB = any;

function dayKey(ts: string | null): string | null {
  if (!ts) return null;
  return ts.slice(0, 10); // YYYY-MM-DD
}

// Last N days as YYYY-MM-DD, oldest → newest. `today` is injected (no Date.now
// reliance on a particular tz beyond the function host's clock).
function lastNDays(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (_e) {
    return fallback;
  }
}

async function computeUsageStats(supabase: SB) {
  const DAYS = 30;
  const sinceIso = (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (DAYS - 1));
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
  })();

  // ── Map user_id → email (for the compliance table) ──────────────────────────
  const emailById = new Map<string, string>();
  await safe(async () => {
    // listUsers is paginated (default 50). Walk pages until exhausted.
    for (let page = 1; page <= 40; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      const users = data?.users ?? [];
      for (const u of users) if (u.email) emailById.set(u.id, u.email);
      if (users.length < 200) break;
    }
  }, undefined);

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalUsers = emailById.size;

  const enrollments = await safe(async () => {
    const { data, error } = await supabase
      .from("enrollments")
      .select("id, user_id, cohort_id, enrolled_at");
    if (error) throw error;
    return data ?? [];
  }, [] as SB[]);

  const cohorts = await safe(async () => {
    const { data, error } = await supabase
      .from("cohorts")
      .select("id, name, course:courses(title)");
    if (error) throw error;
    return data ?? [];
  }, [] as SB[]);
  const cohortName = new Map<string, string>(
    cohorts.map((c: SB) => [c.id, c.course?.title ? `${c.course.title} — ${c.name}` : c.name]),
  );

  // ── AI usage: chat messages + sessions ──────────────────────────────────────
  // messages has no user_id (only session_id); chat_sessions MAY carry user_id.
  const messages = await safe(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("session_id, role, created_at");
    if (error) throw error;
    return data ?? [];
  }, [] as SB[]);

  const sessions = await safe(async () => {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*");
    if (error) throw error;
    return data ?? [];
  }, [] as SB[]);

  const userMessages = messages.filter((m: SB) => m.role === "user");
  const assistantMessages = messages.filter((m: SB) => m.role === "assistant");
  const sessionHasUserId = sessions.some((s: SB) => s.user_id);

  // Per-user AI message counts when chat_sessions.user_id exists.
  const sessionUserId = new Map<string, string>();
  for (const s of sessions) if (s.user_id) sessionUserId.set(s.id, s.user_id);
  const aiMsgByUser = new Map<string, number>();
  for (const m of userMessages) {
    const uid = sessionUserId.get(m.session_id);
    if (uid) aiMsgByUser.set(uid, (aiMsgByUser.get(uid) ?? 0) + 1);
  }

  // ── Activity log (engagement signals) ───────────────────────────────────────
  const activity = await safe(async () => {
    const { data, error } = await supabase
      .from("ecm_activity_log")
      .select("user_id, cohort_id, event_type, created_at")
      .gte("created_at", sinceIso);
    if (error) throw error;
    return data ?? [];
  }, [] as SB[]);

  const eventTypeCounts: Record<string, number> = {};
  for (const a of activity) {
    eventTypeCounts[a.event_type] = (eventTypeCounts[a.event_type] ?? 0) + 1;
  }

  // ── Daily activity trend (last 30 days): merge chat + activity-log signals ───
  const days = lastNDays(DAYS);
  const dayIndex = new Map<string, number>(days.map((d, i) => [d, i]));
  const trendMessages = new Array(DAYS).fill(0);
  const trendActiveUsers = days.map(() => new Set<string>());

  for (const m of userMessages) {
    const k = dayKey(m.created_at);
    if (k != null && dayIndex.has(k)) trendMessages[dayIndex.get(k)!]++;
  }
  for (const a of activity) {
    const k = dayKey(a.created_at);
    if (k != null && dayIndex.has(k) && a.user_id) trendActiveUsers[dayIndex.get(k)!].add(a.user_id);
  }
  const trend = days.map((date, i) => ({
    date,
    messages: trendMessages[i],
    activeUsers: trendActiveUsers[i].size,
  }));

  // Active users in window = distinct users seen in activity log OR AI chat.
  const activeUserSet = new Set<string>();
  for (const a of activity) if (a.user_id) activeUserSet.add(a.user_id);
  for (const [uid, n] of aiMsgByUser) if (n > 0) activeUserSet.add(uid);

  // ── Course completion ───────────────────────────────────────────────────────
  // progress rows = completed subtopics; total subtopics gives the denominator.
  const subtopicsCount = await safe(async () => {
    const { count, error } = await supabase
      .from("subtopics")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  }, 0);

  const progress = await safe(async () => {
    const { data, error } = await supabase
      .from("progress")
      .select("user_id, completed_at");
    if (error) throw error;
    return data ?? [];
  }, [] as SB[]);
  const completedByUser = new Map<string, number>();
  for (const p of progress) {
    completedByUser.set(p.user_id, (completedByUser.get(p.user_id) ?? 0) + 1);
  }

  // ── Quiz performance ────────────────────────────────────────────────────────
  const attempts = await safe(async () => {
    const { data, error } = await supabase
      .from("ecm_quiz_attempts")
      .select("user_id, quiz_id, score, passed, submitted_at");
    if (error) throw error;
    return data ?? [];
  }, [] as SB[]);
  const submitted = attempts.filter((a: SB) => a.submitted_at);
  const passedCount = submitted.filter((a: SB) => a.passed).length;
  const scores = submitted.map((a: SB) => Number(a.score)).filter((s: number) => !Number.isNaN(s));
  const avgScore = scores.length ? scores.reduce((x: number, y: number) => x + y, 0) / scores.length : null;
  const distinctQuizTakers = new Set(submitted.map((a: SB) => a.user_id)).size;

  // ── ECM compliance (per-participation) ──────────────────────────────────────
  const participation = await safe(async () => {
    const { data, error } = await supabase
      .from("ecm_participation")
      .select("user_id, cohort_id, fruition_complete, quiz_passed_at, survey_done, reclutato, attestato_issued_at, credits");
    if (error) throw error;
    return data ?? [];
  }, [] as SB[]);

  const profiles = await safe(async () => {
    const ids = participation.map((p: SB) => p.user_id);
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from("ecm_profiles")
      .select("user_id, full_name")
      .in("user_id", ids);
    if (error) throw error;
    return data ?? [];
  }, [] as SB[]);
  const nameById = new Map<string, string>(profiles.map((p: SB) => [p.user_id, p.full_name]));

  const compliance = participation.map((p: SB) => ({
    user_id: p.user_id,
    name: nameById.get(p.user_id) ?? null,
    email: emailById.get(p.user_id) ?? null,
    cohort: cohortName.get(p.cohort_id) ?? null,
    fruition_complete: !!p.fruition_complete,
    quiz_passed: !!p.quiz_passed_at,
    survey_done: !!p.survey_done,
    attestato_issued: !!p.attestato_issued_at,
    credits: p.credits ?? null,
    ai_messages: aiMsgByUser.get(p.user_id) ?? 0,
    subtopics_done: completedByUser.get(p.user_id) ?? 0,
  }));
  const attestatiIssued = compliance.filter((c) => c.attestato_issued).length;

  return {
    generatedAt: new Date().toISOString(),
    windowDays: DAYS,
    totals: {
      totalUsers,
      activeUsers: activeUserSet.size,
      enrollments: enrollments.length,
      cohorts: cohorts.length,
    },
    ai: {
      sessions: sessions.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      perUserAttributable: sessionHasUserId,
      topUsers: sessionHasUserId
        ? [...aiMsgByUser.entries()]
            .map(([uid, n]) => ({ email: emailById.get(uid) ?? uid, messages: n }))
            .sort((a, b) => b.messages - a.messages)
            .slice(0, 10)
        : [],
    },
    engagement: {
      eventTypeCounts,
      trend,
    },
    completion: {
      totalSubtopics: subtopicsCount,
      usersWithProgress: completedByUser.size,
      totalCompletions: progress.length,
    },
    quiz: {
      attempts: submitted.length,
      distinctTakers: distinctQuizTakers,
      passed: passedCount,
      passRate: submitted.length ? passedCount / submitted.length : null,
      avgScore,
    },
    compliance: {
      attestatiIssued,
      rows: compliance,
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await req.json();
    const { action, adminPassword, ...params } = body;

    // Verify admin password
    const hash = await hashPassword(adminPassword ?? "");
    const { data: setting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "admin_password_hash")
      .maybeSingle();

    if (!setting || setting.value !== hash) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: unknown = null;

    if (action === "list_enrollments") {
      const { cohortId } = params;
      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select("id, user_id, enrolled_at")
        .eq("cohort_id", cohortId)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

      // Fetch emails via admin API
      const rows = await Promise.all(
        (enrollments ?? []).map(async (e) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(e.user_id);
          return { id: e.id, user_id: e.user_id, email: user?.email ?? e.user_id, enrolled_at: e.enrolled_at };
        })
      );
      result = rows;

    } else if (action === "enroll_user") {
      const { cohortId, email } = params;
      const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) throw listErr;
      const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase().trim());
      if (!user) throw new Error(`Nessun utente trovato con email: ${email}`);

      const { error } = await supabase
        .from("enrollments")
        .insert({ user_id: user.id, cohort_id: cohortId });
      if (error) throw error;
      result = { ok: true };

    } else if (action === "remove_enrollment") {
      const { enrollmentId } = params;
      const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);
      if (error) throw error;
      result = { ok: true };

    } else if (action === "usage_stats") {
      result = await computeUsageStats(supabase);

    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
