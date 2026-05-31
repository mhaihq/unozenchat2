import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { EDGE_FUNCTION_URL, supabase } from "../lib/supabase";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface QuizResult {
  passed: boolean;
  score: number;          // 0..1
  correct: number;
  total: number;
  wrong_question_ids: string[];
  attempt_id: string;
}

interface Props {
  quizId: string;
  cohortId?: string | null;
  onClose: () => void;
  onPassed: () => void;
}

async function fetchQuestions(quizId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("ecm_quiz_questions")
    .select("id, text, ecm_quiz_options(id, text)")
    .eq("quiz_id", quizId)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((q: { id: string; text: string; ecm_quiz_options: { id: string; text: string }[] }) => ({
    id: q.id,
    text: q.text,
    options: (q.ecm_quiz_options ?? []).sort(() => Math.random() - 0.5),
  })).sort(() => Math.random() - 0.5);
}

async function submitQuiz(
  quizId: string,
  cohortId: string | null | undefined,
  answers: Record<string, string>
): Promise<QuizResult> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(`${EDGE_FUNCTION_URL}/quiz-submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ quiz_id: quizId, cohort_id: cohortId, answers }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

type Screen = "loading" | "taking" | "result" | "error";

export function EcmQuiz({ quizId, cohortId, onClose, onPassed }: Props) {
  const [screen, setScreen] = useState<Screen>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuestions(quizId)
      .then((qs) => {
        if (qs.length === 0) { setError("Nessuna domanda disponibile per questo quiz."); setScreen("error"); return; }
        setQuestions(qs);
        setScreen("taking");
      })
      .catch((e) => { setError(e.message); setScreen("error"); });
  }, [quizId]);

  const q = questions[current];
  const answered = Object.keys(answers).length;
  const total = questions.length;
  const isWrong = result ? result.wrong_question_ids.includes(q?.id ?? "") : false;

  async function handleSubmit() {
    if (answered < total) return;
    setSubmitting(true);
    try {
      const res = await submitQuiz(quizId, cohortId, answers);
      setResult(res);
      setScreen("result");
      if (res.passed) onPassed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore durante l'invio.");
      setScreen("error");
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setCurrent(0);
    setResult(null);
    setScreen("loading");
    fetchQuestions(quizId)
      .then((qs) => { setQuestions(qs); setScreen("taking"); })
      .catch((e) => { setError(e.message); setScreen("error"); });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }} transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(20,20,20,0.08)]">
          <div>
            <p className="text-xs uppercase tracking-widest text-faint">Verifica dell'apprendimento ECM</p>
            {screen === "taking" && (
              <p className="text-sm font-medium text-muted mt-0.5">
                Domanda {current + 1} di {total} · {answered}/{total} risposte date
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-faint hover:text-tx hover:bg-surface2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 min-h-[340px] flex flex-col">
          <AnimatePresence mode="wait">

            {/* Loading */}
            {screen === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              </motion.div>
            )}

            {/* Error */}
            {screen === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-sm text-muted">{error}</p>
                <button onClick={onClose} className="text-sm text-accent underline">Chiudi</button>
              </motion.div>
            )}

            {/* Quiz taking */}
            {screen === "taking" && q && (
              <motion.div key={`q-${current}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col">

                {/* Progress bar */}
                <div className="h-1 bg-surface2 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${((current + 1) / total) * 100}%` }} />
                </div>

                <p className="text-base font-medium text-tx leading-relaxed mb-6">{q.text}</p>

                <div className="space-y-2.5 flex-1">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                          selected
                            ? "border-accent bg-accent-soft text-accent font-medium"
                            : "border-[rgba(20,20,20,0.1)] bg-surface2 text-muted hover:border-accent/50 hover:text-tx"
                        }`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Result */}
            {screen === "result" && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center gap-5">

                {result.passed ? (
                  <>
                    <CheckCircle2 className="w-14 h-14 text-green-500" />
                    <div>
                      <h3 className="font-serif text-2xl font-normal text-tx">Test superato!</h3>
                      <p className="text-muted text-sm mt-1">
                        {result.correct} su {result.total} risposte corrette ({Math.round(result.score * 100)}%)
                      </p>
                    </div>
                    <p className="text-sm text-faint max-w-xs">
                      Completa il questionario di qualità per ricevere il tuo attestato ECM.
                    </p>
                    <button onClick={onClose}
                      className="px-6 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-deep transition-colors">
                      Continua →
                    </button>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-14 h-14 text-amber-400" />
                    <div>
                      <h3 className="font-serif text-2xl font-normal text-tx">Non superato</h3>
                      <p className="text-muted text-sm mt-1">
                        {result.correct} su {result.total} corrette ({Math.round(result.score * 100)}%) · soglia: 75%
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-left max-w-sm w-full">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                        Domande errate ({result.wrong_question_ids.length})
                      </p>
                      <ul className="space-y-1">
                        {result.wrong_question_ids.map((id) => {
                          const wq = questions.find((q) => q.id === id);
                          return wq ? (
                            <li key={id} className="text-sm text-amber-800 leading-snug">• {wq.text}</li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                    <button onClick={retry}
                      className="flex items-center gap-2 px-6 py-2.5 border border-[rgba(20,20,20,0.15)] text-sm text-muted rounded-xl hover:text-tx hover:border-[rgba(20,20,20,0.3)] transition-colors">
                      <RotateCcw className="w-4 h-4" /> Riprova
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav (taking screen only) */}
        {screen === "taking" && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(20,20,20,0.06)] bg-surface2">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-tx disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Precedente
            </button>

            {current < total - 1 ? (
              <button
                onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-deep transition-colors"
              >
                Prossima <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={answered < total || submitting}
                className="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-deep disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Invio…" : answered < total ? `Rispondi a tutte (${total - answered} mancanti)` : "Consegna il test"}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
