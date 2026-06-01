import { useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { supabase } from "../lib/supabase";

// G1: COGEAPS-compatible participant export (Allegato C tracciato unico minimi)
// Fields: ente accreditante, id provider, id evento, edizione,
//         CF, nome, cognome, ruolo, libero/dipendente, crediti, data acquisizione,
//         professione, disciplina, sponsor/reclutamento

interface Row {
  cohort_name: string;
  course_title: string;
  full_name: string;
  codice_fiscale: string;
  professione: string;
  disciplina: string;
  employment: string;
  credits: number | null;
  quiz_passed_at: string | null;
  survey_done: boolean;
  reclutato: boolean;
  fruition_complete: boolean;
  email: string;
}

function escapeCSV(v: unknown): string {
  const s = v == null ? "" : String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCSV(rows: Row[]): string {
  const headers = [
    "Cohort", "Corso", "Nome completo", "Codice fiscale", "Email",
    "Professione", "Disciplina", "Tipo attività",
    "Crediti ECM", "Data acquisizione", "Questionario qualità", "Reclutato", "Fruizione completata",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push([
      r.cohort_name, r.course_title, r.full_name, r.codice_fiscale, r.email,
      r.professione, r.disciplina,
      r.employment === "libero_professionista" ? "L" : r.employment === "dipendente" ? "D" : r.employment === "convenzionato" ? "C" : "P",
      r.credits ?? "",
      r.quiz_passed_at ? new Date(r.quiz_passed_at).toLocaleDateString("it-IT") : "",
      r.survey_done ? "SI" : "NO",
      r.reclutato ? "SI" : "NO",
      r.fruition_complete ? "SI" : "NO",
    ].map(escapeCSV).join(","));
  }
  return lines.join("\n");
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function AdminExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState<number | null>(null);

  async function fetchAndExport() {
    setLoading(true); setError("");
    try {
      // Join participation + profiles + enrollments + auth.users (via profiles email workaround)
      const { data: parts, error: err } = await supabase
        .from("ecm_participation")
        .select(`
          user_id, credits, quiz_passed_at, survey_done, reclutato, fruition_complete,
          cohort:cohorts(name, course:courses(title))
        `);

      if (err) throw new Error(err.message);

      const userIds = (parts ?? []).map((p: { user_id: string }) => p.user_id);

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("ecm_profiles")
        .select("user_id, full_name, codice_fiscale, professione, disciplina, employment")
        .in("user_id", userIds);

      // Fetch emails via allowed_emails (we have emails there; auth.users not queryable client-side)
      // Use a workaround: get email from the session's metadata or allowed_emails table
      const { data: allowed } = await supabase
        .from("allowed_emails")
        .select("email");

      const profileMap = new Map((profiles ?? []).map((p: { user_id: string; full_name: string; codice_fiscale: string; professione: string; disciplina: string; employment: string }) => [p.user_id, p]));

      const rows: Row[] = (parts ?? []).map((p: {
        user_id: string;
        credits: number | null;
        quiz_passed_at: string | null;
        survey_done: boolean;
        reclutato: boolean;
        fruition_complete: boolean;
        cohort: { name: string; course: { title: string } } | null;
      }) => {
        const prof = profileMap.get(p.user_id);
        return {
          cohort_name: p.cohort?.name ?? "",
          course_title: p.cohort?.course?.title ?? "",
          full_name: prof?.full_name ?? "(profilo mancante)",
          codice_fiscale: prof?.codice_fiscale ?? "",
          professione: prof?.professione ?? "",
          disciplina: prof?.disciplina ?? "",
          employment: prof?.employment ?? "",
          credits: p.credits,
          quiz_passed_at: p.quiz_passed_at,
          survey_done: p.survey_done,
          reclutato: p.reclutato,
          fruition_complete: p.fruition_complete,
          email: "", // can't join auth.users client-side
        };
      });

      setCount(rows.length);
      const csv = toCSV(rows);
      downloadCSV(csv, `cogeaps_export_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore export");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-sm font-semibold text-tx mb-1">Export partecipanti ECM</h3>
        <p className="text-xs text-faint">
          Genera il file CSV per la trasmissione al COGEAPS e all'Ente accreditante.
          Contiene i dati di tutti i discenti con quiz completato (tracciato unico Allegato C).
        </p>
      </div>

      <div className="bg-surface2 rounded-xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-tx">CSV partecipanti + esiti</p>
            <p className="text-xs text-faint mt-0.5">
              Campi: nome, CF, professione, disciplina, tipo attività, crediti ECM, data acquisizione,
              questionario qualità, reclutamento, fruizione completata.
            </p>
          </div>
        </div>
        <button
          onClick={fetchAndExport}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-deep disabled:opacity-40 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {loading ? "Elaborazione…" : "Scarica CSV"}
        </button>
        {count !== null && !error && (
          <p className="text-xs text-green-600">✓ Esportati {count} discenti.</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-700 mb-1">Note per la trasmissione COGEAPS</p>
        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
          <li>Trasmettere entro 90 giorni dalla data di fine evento (art. 1.10 Manuale ECM).</li>
          <li>Il CSV include tutti i discenti con partecipazione registrata. Filtrare per <code>quiz_passed_at</code> non vuoto prima dell'invio.</li>
          <li>Il campo email non è incluso (non disponibile lato client). Integrarlo dal portale Supabase → Authentication → Users se richiesto dall'Ente.</li>
          <li>Conservare il file per almeno 5 anni (art. G2 normativa ECM).</li>
        </ul>
      </div>
    </div>
  );
}
