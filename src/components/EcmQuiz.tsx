import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, RotateCcw, BookOpen } from "lucide-react";
import { EDGE_FUNCTION_URL, supabase } from "../lib/supabase";

// Per Allegato F (AGENAS FAD rules):
// - Test only after content fruition ✓ (gate in CourseView)
// - Show only WHICH questions were wrong — never the correct answer ✓
// - "Potrà essere data indicazione di dove trovare l'argomento nel materiale" ✓ (lesson ref)
// - Correct answers only after event closes ✓ (is_correct never sent to client)
// - Retakes allowed ✓ — each attempt gets fresh randomization of both questions AND options

interface Option { id: string; text: string; }
interface Question { id: string; text: string; options: Option[]; lesson_ref?: string; }
interface QuizResult {
  passed: boolean;
  score: number;
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

// Knuth shuffle — guarantees uniform randomization
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchQuestions(quizId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("ecm_quiz_questions")
    .select("id, text, ecm_quiz_options(id, text)")
    .eq("quiz_id", quizId);
  if (error) throw new Error(error.message);

  // Double randomization: shuffle questions, then shuffle each question's options independently
  const shuffledQuestions = shuffle(data ?? []);
  return shuffledQuestions.map((q: { id: string; text: string; ecm_quiz_options: { id: string; text: string }[] }) => ({
    id: q.id,
    text: q.text,
    options: shuffle(q.ecm_quiz_options ?? []),
  }));
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

  const loadQuestions = useCallback(async () => {
    setScreen("loading");
    setAnswers({});
    setCurrent(0);
    setResult(null);
    try {
      const qs = await fetchQuestions(quizId);
      if (qs.length === 0) { setError("Nessuna domanda disponibile per questo quiz."); setScreen("error"); return; }
      setQuestions(qs);
      setScreen("taking");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore caricamento");
      setScreen("error");
    }
  }, [quizId]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const q = questions[current];
  const answered = Object.keys(answers).length;
  const total = questions.length;

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

  // Retry: full fresh attempt with NEW randomization (both questions and options)
  function retry() { loadQuestions(); }

  const wrongQuestions = result ? questions.filter(q => result.wrong_question_ids.includes(q.id)) : [];

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
                Domanda {current + 1} di {total} · {answered} risposte date
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

            {screen === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              </motion.div>
            )}

            {screen === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-sm text-muted">{error}</p>
                <button onClick={onClose} className="text-sm text-accent underline">Chiudi</button>
              </motion.div>
            )}

            {screen === "taking" && q && (
              <motion.div key={`q-${current}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col">
                <div className="h-1 bg-surface2 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${((current + 1) / total) * 100}%` }} />
                </div>
                <p className="text-base font-medium text-tx leading-relaxed mb-6">{q.text}</p>
                <div className="space-y-2.5 flex-1">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.id;
                    return (
                      <button key={opt.id}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                          selected ? "border-accent bg-accent-soft text-accent font-medium" : "border-[rgba(20,20,20,0.1)] bg-surface2 text-muted hover:border-accent/50 hover:text-tx"
                        }`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {screen === "result" && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col gap-5">

                {/* Score summary */}
                <div className={`flex flex-col items-center text-center pt-2 pb-4 border-b border-[rgba(20,20,20,0.06)] ${result.passed ? "" : ""}`}>
                  {result.passed ? (
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
                  )}
                  <h3 className="font-serif text-xl font-normal text-tx">
                    {result.passed ? "Test superato!" : "Non superato"}
                  </h3>
                  <p className="text-muted text-sm mt-1">
                    {result.correct} su {result.total} corrette · {Math.round(result.score * 100)}%
                    {!result.passed && <span className="text-faint"> (soglia: 75%)</span>}
                  </p>
                </div>

                {/* Passed: next step */}
                {result.passed && (
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-faint text-center">
                      Completa il questionario di qualità per ricevere l'attestato ECM.
                    </p>
                    <button onClick={onClose}
                      className="px-6 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-deep transition-colors">
                      Continua →
                    </button>
                  </div>
                )}

                {/* Failed: show wrong questions with lesson hint (Allegato F) */}
                {!result.passed && wrongQuestions.length > 0 && (
                  <div className="flex-1 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Domande da rivedere ({wrongQuestions.length})
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      {wrongQuestions.map((wq) => (
                        <div key={wq.id} className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                          <p className="text-sm text-amber-900 leading-snug">{wq.text}</p>
                          {wq.lesson_ref && (
                            <p className="text-xs text-amber-600 mt-1.5">
                              → Rivedi: {wq.lesson_ref}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-faint mt-3 italic">
                      Le risposte corrette saranno disponibili al termine del corso (Allegato F, normativa ECM).
                    </p>
                  </div>
                )}

                {!result.passed && (
                  <button onClick={retry}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 border border-[rgba(20,20,20,0.15)] text-sm text-muted rounded-xl hover:text-tx hover:border-[rgba(20,20,20,0.3)] transition-colors mt-2">
                    <RotateCcw className="w-4 h-4" /> Riprova con nuovo ordine casuale
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav */}
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
                onClick={() => setCurrent((c) => c + 1)}
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
