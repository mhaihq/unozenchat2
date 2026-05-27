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
