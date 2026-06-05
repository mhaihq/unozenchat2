import { useEffect, useState } from "react";
import {
  Loader2, RefreshCw, Users, Activity, MessageSquare, Mic,
  GraduationCap, CheckCircle2, XCircle, Award, BarChart3, AlertCircle,
} from "lucide-react";
import { fetchUsageStats, type UsageStats } from "../lib/api";

interface Props {
  adminPassword: string;
}

// Italian labels for the activity-log event types we know about.
const EVENT_LABELS: Record<string, string> = {
  lesson_fruita: "Lezioni fruite",
  lesson_open: "Lezioni aperte",
  login: "Accessi",
  video_progress: "Avanzamento video",
  page_view: "Pagine viste",
  quiz_start: "Quiz iniziati",
  quiz_submit: "Quiz inviati",
  survey_submit: "Questionari inviati",
  attestato_download: "Attestati scaricati",
};

function pct(n: number | null): string {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

export function AdminUsage({ adminPassword }: Props) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUsageStats(adminPassword);
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore nel caricamento delle statistiche.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <p className="text-sm text-faint">Caricamento statistiche…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-pink-soft border border-pink-deep/20 rounded-xl p-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-pink-deep flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-pink-deep">Impossibile caricare le statistiche</p>
          <p className="text-xs text-pink-deep/80 mt-1">{error}</p>
          <button
            onClick={load}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-pink-deep hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const maxTrend = Math.max(1, ...stats.engagement.trend.map((d) => Math.max(d.messages, d.activeUsers)));
  const eventEntries = Object.entries(stats.engagement.eventTypeCounts).sort((a, b) => b[1] - a[1]);
  const completionRate =
    stats.totals.totalUsers > 0 && stats.completion.totalSubtopics > 0
      ? stats.completion.totalCompletions / (stats.totals.totalUsers * stats.completion.totalSubtopics)
      : null;

  return (
    <div className="space-y-6">
      {/* Header + refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-tx">Utilizzo della piattaforma</h3>
          <p className="text-xs text-faint mt-0.5">
            Finestra: ultimi {stats.windowDays} giorni · aggiornato {new Date(stats.generatedAt).toLocaleString("it-IT")}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-tx bg-surface2 hover:bg-border px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Aggiorna
        </button>
      </div>

      {/* ── Top stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Utenti totali" value={stats.totals.totalUsers} tint="blue" />
        <StatCard icon={Activity} label="Utenti attivi" hint={`ultimi ${stats.windowDays}gg`} value={stats.totals.activeUsers} tint="accent" />
        <StatCard icon={GraduationCap} label="Iscrizioni" value={stats.totals.enrollments} tint="purple" />
        <StatCard icon={Award} label="Attestati emessi" value={stats.compliance.attestatiIssued} tint="pink" />
      </div>

      {/* ── AI usage ────────────────────────────────────────────────────── */}
      <section className="bg-surface rounded-xl border border-border p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-accent" />
          <h4 className="text-sm font-semibold text-tx">Utilizzo assistente AI</h4>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <MiniStat label="Domande utenti" value={stats.ai.userMessages} />
          <MiniStat label="Risposte AI" value={stats.ai.assistantMessages} />
          <MiniStat label="Sessioni chat" value={stats.ai.sessions} />
        </div>

        {stats.ai.perUserAttributable && stats.ai.topUsers.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-faint uppercase tracking-wider mb-2">Top utilizzatori AI</p>
            <div className="space-y-1.5">
              {stats.ai.topUsers.map((u, i) => {
                const max = stats.ai.topUsers[0].messages || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-48 truncate">{u.email}</span>
                    <div className="flex-1 h-2 bg-surface2 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${(u.messages / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-tx w-10 text-right">{u.messages}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-faint bg-surface2 rounded-lg px-3 py-2 flex items-center gap-2">
            <Mic className="w-3.5 h-3.5" />
            Il dettaglio per singolo utente non è disponibile (le sessioni di chat non sono associate a un utente).
            Vengono mostrati solo i totali aggregati.
          </p>
        )}
      </section>

      {/* ── Daily activity trend ────────────────────────────────────────── */}
      <section className="bg-surface rounded-xl border border-border p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-blue-deep" />
          <h4 className="text-sm font-semibold text-tx">Attività giornaliera</h4>
          <div className="flex items-center gap-3 ml-auto text-2xs uppercase tracking-wider">
            <span className="flex items-center gap-1 text-faint"><span className="w-2 h-2 rounded-sm bg-accent inline-block" /> Messaggi</span>
            <span className="flex items-center gap-1 text-faint"><span className="w-2 h-2 rounded-sm bg-blue-deep inline-block" /> Utenti attivi</span>
          </div>
        </div>
        <div className="flex items-end gap-0.5 h-32">
          {stats.engagement.trend.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end items-center gap-px group relative" title={`${d.date}\n${d.messages} messaggi · ${d.activeUsers} utenti attivi`}>
              <div className="w-full flex items-end justify-center gap-px h-full">
                <div className="w-1/2 bg-accent/80 rounded-t-sm transition-all" style={{ height: `${(d.messages / maxTrend) * 100}%` }} />
                <div className="w-1/2 bg-blue-deep/70 rounded-t-sm transition-all" style={{ height: `${(d.activeUsers / maxTrend) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5 text-2xs text-faint">
          <span>{stats.engagement.trend[0]?.date.slice(5)}</span>
          <span>{stats.engagement.trend[stats.engagement.trend.length - 1]?.date.slice(5)}</span>
        </div>

        {eventEntries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5 pt-4 border-t border-border">
            {eventEntries.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between bg-surface2 rounded-lg px-3 py-1.5">
                <span className="text-xs text-muted truncate">{EVENT_LABELS[type] ?? type}</span>
                <span className="text-xs font-semibold text-tx">{count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Completion + Quiz side by side ──────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-3">
        <section className="bg-surface rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-semibold text-tx">Completamento corsi</h4>
          </div>
          <div className="space-y-3">
            <ProgressRow label="Tasso di completamento medio" value={pct(completionRate)} ratio={completionRate ?? 0} />
            <div className="grid grid-cols-3 gap-3 pt-1">
              <MiniStat label="Argomenti totali" value={stats.completion.totalSubtopics} />
              <MiniStat label="Completamenti" value={stats.completion.totalCompletions} />
              <MiniStat label="Utenti con progresso" value={stats.completion.usersWithProgress} />
            </div>
          </div>
        </section>

        <section className="bg-surface rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-4 h-4 text-purple-deep" />
            <h4 className="text-sm font-semibold text-tx">Quiz ECM</h4>
          </div>
          <div className="space-y-3">
            <ProgressRow label="Tasso di superamento" value={pct(stats.quiz.passRate)} ratio={stats.quiz.passRate ?? 0} />
            <ProgressRow label="Punteggio medio" value={pct(stats.quiz.avgScore)} ratio={stats.quiz.avgScore ?? 0} />
            <div className="grid grid-cols-3 gap-3 pt-1">
              <MiniStat label="Tentativi" value={stats.quiz.attempts} />
              <MiniStat label="Superati" value={stats.quiz.passed} />
              <MiniStat label="Partecipanti" value={stats.quiz.distinctTakers} />
            </div>
          </div>
        </section>
      </div>

      {/* ── ECM compliance table ────────────────────────────────────────── */}
      <section className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-deep" />
            <h4 className="text-sm font-semibold text-tx">Stato compliance ECM</h4>
          </div>
          <span className="text-xs text-faint bg-surface2 px-2 py-0.5 rounded-full">{stats.compliance.rows.length} partecipanti</span>
        </div>
        {stats.compliance.rows.length === 0 ? (
          <div className="py-12 text-center">
            <Award className="w-8 h-8 text-faint/40 mx-auto mb-2" />
            <p className="text-sm text-faint">Nessuna partecipazione ECM registrata.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-2xs uppercase tracking-wider text-faint border-b border-border">
                  <th className="text-left font-medium px-4 py-2.5">Partecipante</th>
                  <th className="text-left font-medium px-3 py-2.5">Cohort</th>
                  <th className="text-center font-medium px-2 py-2.5">Fruizione</th>
                  <th className="text-center font-medium px-2 py-2.5">Quiz</th>
                  <th className="text-center font-medium px-2 py-2.5">Questionario</th>
                  <th className="text-center font-medium px-2 py-2.5">Attestato</th>
                  <th className="text-right font-medium px-2 py-2.5">AI</th>
                  <th className="text-right font-medium px-4 py-2.5">Crediti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.compliance.rows.map((r) => (
                  <tr key={r.user_id} className="hover:bg-surface2 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-tx truncate max-w-[180px]">{r.name ?? "(profilo mancante)"}</div>
                      <div className="text-xs text-faint truncate max-w-[180px]">{r.email ?? r.user_id.slice(0, 8)}</div>
                    </td>
                    <td className="px-3 py-2.5 text-muted text-xs truncate max-w-[140px]">{r.cohort ?? "—"}</td>
                    <td className="px-2 py-2.5 text-center"><Check ok={r.fruition_complete} /></td>
                    <td className="px-2 py-2.5 text-center"><Check ok={r.quiz_passed} /></td>
                    <td className="px-2 py-2.5 text-center"><Check ok={r.survey_done} /></td>
                    <td className="px-2 py-2.5 text-center"><Check ok={r.attestato_issued} /></td>
                    <td className="px-2 py-2.5 text-right text-muted tabular-nums">{r.ai_messages || "—"}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-tx tabular-nums">{r.credits ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ── small presentational helpers ──────────────────────────────────────────────

const TINTS: Record<string, string> = {
  accent: "bg-accent-soft text-accent",
  blue: "bg-blue-soft text-blue-deep",
  purple: "bg-purple-soft text-purple-deep",
  pink: "bg-pink-soft text-pink-deep",
};

function StatCard({ icon: Icon, label, value, hint, tint }: { icon: typeof Users; label: string; value: number; hint?: string; tint: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border px-4 py-3.5 shadow-card">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${TINTS[tint]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-tx tabular-nums leading-none">{value}</p>
      <p className="text-xs text-faint mt-1">{label}{hint ? <span className="text-faint/70"> · {hint}</span> : null}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface2 rounded-lg px-3 py-2">
      <p className="text-lg font-bold text-tx tabular-nums leading-none">{value}</p>
      <p className="text-2xs text-faint uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

function ProgressRow({ label, value, ratio }: { label: string; value: string; ratio: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-sm font-semibold text-tx tabular-nums">{value}</span>
      </div>
      <div className="h-2 bg-surface2 rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%` }} />
      </div>
    </div>
  );
}

function Check({ ok }: { ok: boolean }) {
  return ok
    ? <CheckCircle2 className="w-4 h-4 text-accent inline-block" />
    : <XCircle className="w-4 h-4 text-faint/40 inline-block" />;
}
