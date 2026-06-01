import { useState } from "react";
import { motion } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

// Allegato B — Scheda di valutazione evento FAD / BLENDED (con FAD)
// Stored anonymously: NO user_id in ecm_quality_survey

interface Props {
  cohortId?: string | null;
  onClose: () => void;
  onSubmitted: () => void;
}

const SCALE_1_5 = ["1", "2", "3", "4", "5"];

const Q1_LABELS = ["Non rilevante", "Poco rilevante", "Rilevante", "Più che rilevante", "Molto rilevante"];
const Q2_LABELS = ["Insufficiente", "Parziale", "Sufficiente", "Buono", "Eccellente"];
const Q3_LABELS = ["Insufficiente", "Poco utile", "Utile", "Più che utile", "Molto utile"];
const Q4_LABELS = ["Molto inferiore", "Poco inferiore", "Uguale al previsto", "Poco superiore", "Molto superiore"];
const Q5_LABELS = ["Nessuna influenza", "Influenza poco rilevante", "Influenza rilevante", "Influenza più che rilevante", "Influenza molto rilevante"];

function RadioGroup({ labels, value, onChange }: { labels: string[]; value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2 mt-3">
      {labels.map((label, i) => {
        const val = i + 1;
        const selected = value === val;
        return (
          <button key={i} onClick={() => onChange(val)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all ${
              selected ? "border-accent bg-accent-soft" : "border-[rgba(20,20,20,0.1)] bg-surface2 hover:border-accent/40"
            }`}
          >
            <span className={`text-base font-semibold ${selected ? "text-accent" : "text-muted"}`}>{val}</span>
            <span className={`text-[10px] leading-tight ${selected ? "text-accent" : "text-faint"}`}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function EcmSurvey({ cohortId, onClose, onSubmitted }: Props) {
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState(0);
  const [q3, setQ3] = useState(0);
  const [q4, setQ4] = useState(0);
  const [q5, setQ5] = useState(0);
  const [q5example, setQ5example] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const allAnswered = q1 && q2 && q3 && q4 && q5;

  async function handleSubmit() {
    if (!allAnswered) { setError("Rispondi a tutte le domande prima di procedere."); return; }
    setSubmitting(true);
    setError("");

    // Insert anonymously — NO user_id
    const { error: surveyErr } = await supabase.from("ecm_quality_survey").insert({
      cohort_id: cohortId ?? null,
      q1_relevance: q1,
      q2_quality: q2,
      q3_usefulness: q3,
      q4_time: q4,
      q5_sponsor_influence: q5,
      q5_example: q5example || null,
    });

    if (surveyErr) { setError(surveyErr.message); setSubmitting(false); return; }

    // Mark survey_done on participation (user-linked flag only — answers are anonymous)
    if (cohortId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("ecm_participation").upsert({
          user_id: user.id,
          cohort_id: cohortId,
          survey_done: true,
        }, { onConflict: "user_id,cohort_id" });
      }
    }

    setSubmitting(false);
    onSubmitted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[rgba(20,20,20,0.08)]">
          <div>
            <p className="text-xs uppercase tracking-widest text-faint">Allegato B — Questionario qualità ECM</p>
            <p className="text-sm font-medium text-tx mt-0.5">Scheda di valutazione evento FAD</p>
            <p className="text-xs text-faint mt-0.5">Anonima · obbligatoria per ottenere i crediti ECM</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-faint hover:text-tx hover:bg-surface2 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* Q1 */}
          <div>
            <p className="text-sm font-medium text-tx leading-relaxed">
              1. Come valuta la <strong>rilevanza</strong> degli argomenti trattati rispetto alle sue necessità di aggiornamento?
            </p>
            <RadioGroup labels={Q1_LABELS} value={q1} onChange={setQ1} />
          </div>

          {/* Q2 */}
          <div>
            <p className="text-sm font-medium text-tx leading-relaxed">
              2. Come valuta la <strong>qualità educativa</strong> del programma ECM?
            </p>
            <RadioGroup labels={Q2_LABELS} value={q2} onChange={setQ2} />
          </div>

          {/* Q3 */}
          <div>
            <p className="text-sm font-medium text-tx leading-relaxed">
              3. Come valuta l'<strong>utilità</strong> di questo evento per la sua formazione/aggiornamento?
            </p>
            <RadioGroup labels={Q3_LABELS} value={q3} onChange={setQ3} />
          </div>

          {/* Q4 */}
          <div>
            <p className="text-sm font-medium text-tx leading-relaxed">
              4. Il <strong>tempo</strong> che ha dedicato ad acquisire le informazioni contenute nel programma FAD rispetto alle ore previste è stato:
            </p>
            <RadioGroup labels={Q4_LABELS} value={q4} onChange={setQ4} />
          </div>

          {/* Q5 */}
          <div>
            <p className="text-sm font-medium text-tx leading-relaxed">
              5. Ritiene che nel programma ci siano riferimenti, indicazioni e/o informazioni non equilibrate o non corrette <strong>per influenza dello sponsor</strong> o altri interessi commerciali?
              <span className="text-faint font-normal"> (compilare anche in assenza di sponsor)</span>
            </p>
            <RadioGroup labels={Q5_LABELS} value={q5} onChange={setQ5} />
            {q5 >= 4 && (
              <textarea
                value={q5example}
                onChange={(e) => setQ5example(e.target.value)}
                placeholder="* In caso di influenza 'più che rilevante' o 'molto rilevante' indicare qualche esempio…"
                rows={2}
                className="mt-3 w-full px-3 py-2 text-sm border border-amber-300 bg-amber-50 rounded-lg focus:outline-none focus:border-amber-500 resize-none"
              />
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[rgba(20,20,20,0.06)] bg-surface2 rounded-b-2xl flex items-center justify-between">
          <p className="text-xs text-faint max-w-xs">
            Le risposte sono raccolte in forma anonima e non saranno collegate al suo profilo.
          </p>
          <button onClick={handleSubmit} disabled={!allAnswered || submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-deep disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Invia e ottieni attestato →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
