import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Option {
  id?: string;
  text: string;
  is_correct: boolean;
}

interface Question {
  id?: string;
  text: string;
  options: Option[];
  expanded?: boolean;
}

interface Quiz {
  id: string;
  title: string;
  pass_threshold: number;
  is_active: boolean;
  cohort_id: string | null;
  course_id: string | null;
}

interface Cohort { id: string; name: string; }
interface Course { id: string; title: string; }

export function AdminQuiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New quiz form
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizCohort, setNewQuizCohort] = useState("");
  const [newQuizThreshold, setNewQuizThreshold] = useState(75);
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [{ data: qz }, { data: co }, { data: cr }] = await Promise.all([
      supabase.from("ecm_quizzes").select("id, title, pass_threshold, is_active, cohort_id, course_id").order("created_at"),
      supabase.from("cohorts").select("id, name").order("name"),
      supabase.from("courses").select("id, title").order("title"),
    ]);
    setQuizzes(qz ?? []);
    setCohorts(co ?? []);
    setCourses(cr ?? []);
    setLoading(false);
  }

  async function loadQuestions(quizId: string) {
    const { data } = await supabase
      .from("ecm_quiz_questions")
      .select("id, text, sort_order, ecm_quiz_options(id, text, is_correct, sort_order)")
      .eq("quiz_id", quizId)
      .order("sort_order");
    setQuestions((data ?? []).map((q: { id: string; text: string; sort_order: number; ecm_quiz_options: Option[] }) => ({
      id: q.id,
      text: q.text,
      options: (q.ecm_quiz_options ?? []).sort((a: Option & { sort_order?: number }, b: Option & { sort_order?: number }) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
      expanded: true,
    })));
  }

  function selectQuiz(id: string) {
    setSelectedQuizId(id);
    setQuestions([]);
    loadQuestions(id);
  }

  async function createQuiz() {
    if (!newQuizTitle.trim()) return;
    setCreatingQuiz(true);
    const payload: Record<string, unknown> = {
      title: newQuizTitle.trim(),
      pass_threshold: newQuizThreshold / 100,
      is_active: true,
    };
    if (newQuizCohort) payload.cohort_id = newQuizCohort;
    const { data, error } = await supabase.from("ecm_quizzes").insert(payload).select().single();
    if (error) { setError(error.message); } else {
      setQuizzes((prev) => [...prev, data]);
      setNewQuizTitle("");
      setNewQuizCohort("");
      selectQuiz(data.id);
    }
    setCreatingQuiz(false);
  }

  async function toggleQuizActive(quiz: Quiz) {
    await supabase.from("ecm_quizzes").update({ is_active: !quiz.is_active }).eq("id", quiz.id);
    setQuizzes((prev) => prev.map((q) => q.id === quiz.id ? { ...q, is_active: !quiz.is_active } : q));
  }

  async function deleteQuiz(id: string) {
    if (!confirm("Elimina questo quiz e tutte le sue domande?")) return;
    await supabase.from("ecm_quizzes").delete().eq("id", id);
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
    if (selectedQuizId === id) { setSelectedQuizId(null); setQuestions([]); }
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, {
      text: "",
      options: [
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ],
      expanded: true,
    }]);
  }

  function updateQuestion(idx: number, text: string) {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, text } : q));
  }

  function updateOption(qIdx: number, oIdx: number, text: string) {
    setQuestions((prev) => prev.map((q, i) => i === qIdx
      ? { ...q, options: q.options.map((o, j) => j === oIdx ? { ...o, text } : o) }
      : q));
  }

  function setCorrectOption(qIdx: number, oIdx: number) {
    setQuestions((prev) => prev.map((q, i) => i === qIdx
      ? { ...q, options: q.options.map((o, j) => ({ ...o, is_correct: j === oIdx })) }
      : q));
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleExpand(idx: number) {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, expanded: !q.expanded } : q));
  }

  function addOption(qIdx: number) {
    setQuestions((prev) => prev.map((q, i) => i === qIdx
      ? { ...q, options: [...q.options, { text: "", is_correct: false }] }
      : q));
  }

  async function saveQuestions() {
    if (!selectedQuizId) return;
    for (const q of questions) {
      if (!q.text.trim()) { setError("Tutte le domande devono avere del testo."); return; }
      if (!q.options.some((o) => o.is_correct)) { setError(`La domanda "${q.text.slice(0, 40)}…" non ha una risposta corretta.`); return; }
      if (q.options.some((o) => !o.text.trim())) { setError("Tutte le opzioni devono avere del testo."); return; }
    }
    setSaving(true);
    setError("");

    // Delete existing and re-insert (simple approach for admin UI)
    await supabase.from("ecm_quiz_questions").delete().eq("quiz_id", selectedQuizId);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const { data: qRow } = await supabase.from("ecm_quiz_questions")
        .insert({ quiz_id: selectedQuizId, text: q.text, sort_order: i })
        .select("id").single();
      if (!qRow) continue;
      for (let j = 0; j < q.options.length; j++) {
        const o = q.options[j];
        await supabase.from("ecm_quiz_options").insert({
          question_id: qRow.id,
          text: o.text,
          is_correct: o.is_correct,
          sort_order: j,
        });
      }
    }

    setSuccess(`${questions.length} domande salvate.`);
    setTimeout(() => setSuccess(""), 3000);
    await loadQuestions(selectedQuizId);
    setSaving(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-muted" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

      {/* Left: quiz list */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-tx">Quiz ECM</h3>

        {/* Create new */}
        <div className="bg-surface2 rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Nuovo quiz</p>
          <input
            value={newQuizTitle}
            onChange={(e) => setNewQuizTitle(e.target.value)}
            placeholder="Titolo del quiz"
            className="w-full px-3 py-2 text-sm border border-[rgba(20,20,20,0.12)] rounded-lg bg-surface focus:outline-none focus:border-accent"
          />
          <select
            value={newQuizCohort}
            onChange={(e) => setNewQuizCohort(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[rgba(20,20,20,0.12)] rounded-lg bg-surface focus:outline-none focus:border-accent"
          >
            <option value="">— Seleziona cohort —</option>
            {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted">Soglia:</label>
            <input type="number" min={50} max={100} value={newQuizThreshold}
              onChange={(e) => setNewQuizThreshold(Number(e.target.value))}
              className="w-16 px-2 py-1 text-sm border border-[rgba(20,20,20,0.12)] rounded-lg bg-surface focus:outline-none focus:border-accent"
            />
            <span className="text-xs text-muted">% (ECM min 75%)</span>
          </div>
          <button onClick={createQuiz} disabled={creatingQuiz || !newQuizTitle.trim()}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-deep disabled:opacity-40 transition-colors">
            {creatingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Crea quiz
          </button>
        </div>

        {/* Quiz list */}
        <div className="space-y-1.5">
          {quizzes.map((q) => (
            <div key={q.id}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                selectedQuizId === q.id ? "bg-accent-soft border border-accent/30" : "bg-surface2 hover:bg-surface border border-transparent"
              }`}
              onClick={() => selectQuiz(q.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-tx truncate">{q.title}</p>
                <p className="text-xs text-faint">{Math.round(q.pass_threshold * 100)}% · {q.is_active ? "attivo" : "disattivo"}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggleQuizActive(q); }}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.is_active ? "bg-green-100 text-green-700" : "bg-surface border border-[rgba(20,20,20,0.12)] text-faint"}`}>
                {q.is_active ? "ON" : "OFF"}
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteQuiz(q.id); }}
                className="text-faint hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {quizzes.length === 0 && <p className="text-sm text-faint text-center py-4">Nessun quiz ancora.</p>}
        </div>
      </div>

      {/* Right: question editor */}
      <div>
        {!selectedQuizId ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-faint">
            <p className="text-sm">Seleziona o crea un quiz per gestire le domande.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-tx">
                Domande ({questions.length})
              </h3>
              <div className="flex items-center gap-2">
                {error && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</span>}
                {success && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{success}</span>}
                <button onClick={addQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-accent border border-accent/30 rounded-lg hover:bg-accent-soft transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Aggiungi domanda
                </button>
                <button onClick={saveQuestions} disabled={saving || questions.length === 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-deep disabled:opacity-40 transition-colors">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Salva tutto
                </button>
              </div>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-surface border border-[rgba(20,20,20,0.08)] rounded-xl overflow-hidden">
                {/* Question header */}
                <div className="flex items-start gap-3 px-4 py-3 cursor-pointer" onClick={() => toggleExpand(qIdx)}>
                  <span className="text-xs font-semibold text-faint mt-1 w-5 flex-shrink-0">{qIdx + 1}.</span>
                  <input
                    value={q.text}
                    onChange={(e) => { e.stopPropagation(); updateQuestion(qIdx, e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Testo della domanda…"
                    className="flex-1 text-sm text-tx bg-transparent focus:outline-none placeholder:text-faint"
                  />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); removeQuestion(qIdx); }}
                      className="text-faint hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {q.expanded ? <ChevronUp className="w-4 h-4 text-faint" /> : <ChevronDown className="w-4 h-4 text-faint" />}
                  </div>
                </div>

                {/* Options */}
                {q.expanded && (
                  <div className="border-t border-[rgba(20,20,20,0.06)] px-4 py-3 space-y-2">
                    <p className="text-xs text-faint mb-1">Opzioni — clicca il cerchio per segnare la risposta corretta</p>
                    {q.options.map((o, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2.5">
                        <button onClick={() => setCorrectOption(qIdx, oIdx)} className="flex-shrink-0">
                          {o.is_correct
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                            : <Circle className="w-4 h-4 text-faint" />}
                        </button>
                        <input
                          value={o.text}
                          onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Opzione ${oIdx + 1}…`}
                          className={`flex-1 text-sm px-2.5 py-1.5 rounded-lg border focus:outline-none focus:border-accent transition-colors ${
                            o.is_correct ? "border-green-300 bg-green-50" : "border-[rgba(20,20,20,0.1)] bg-surface2"
                          }`}
                        />
                      </div>
                    ))}
                    <button onClick={() => addOption(qIdx)}
                      className="text-xs text-accent hover:underline mt-1">
                      + Aggiungi opzione
                    </button>
                  </div>
                )}
              </div>
            ))}

            {questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-[rgba(20,20,20,0.1)] rounded-xl">
                <p className="text-sm text-faint mb-3">Nessuna domanda ancora.</p>
                <button onClick={addQuestion}
                  className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-deep transition-colors">
                  <Plus className="w-4 h-4" /> Prima domanda
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
