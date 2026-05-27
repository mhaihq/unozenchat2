import { useState, useEffect } from "react";
import {
  Plus, ChevronRight, ChevronDown, Pencil, Trash2, Check, X, Loader2,
  BookOpen, Users, Calendar, Video, Presentation, UserPlus, UserMinus,
  ToggleLeft, ToggleRight, AlertCircle,
} from "lucide-react";
import type { Course, Cohort, Lesson, Subtopic } from "../lib/types";
import {
  fetchAllCoursesAdmin, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
  fetchAllCohortsAdmin, createCohort, adminUpdateCohort, adminDeleteCohort,
  fetchAllLessonsAdmin, adminCreateLesson, adminUpdateLesson, adminDeleteLesson,
  adminCreateSubtopic, adminUpdateSubtopic, adminDeleteSubtopic,
  adminSetCohortLessonOverride,
  adminListEnrollments, adminEnrollUserByEmail, adminRemoveEnrollment,
  type AdminEnrollment,
} from "../lib/api";

interface Props {
  adminPassword: string;
}

type View = "courses" | "course-detail";
type CourseSubTab = "lezioni" | "edizioni";

function Badge({ children, variant = "grey" }: { children: React.ReactNode; variant?: "grey" | "green" | "blue" | "red" }) {
  const styles = {
    grey: "bg-grey-100 text-grey-600 border-grey-200",
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function InlineInput({ value, onChange, placeholder, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`px-2.5 py-1.5 text-sm border border-grey-200 rounded-lg bg-white text-grey-950 placeholder-grey-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 transition-all ${className}`}
    />
  );
}

function SaveCancelButtons({ onSave, onCancel, saving }: { onSave: () => void; onCancel: () => void; saving?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-1 px-2.5 py-1 bg-grey-950 text-white text-xs font-medium rounded-lg hover:bg-grey-800 disabled:opacity-50 transition-colors"
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        Salva
      </button>
      <button onClick={onCancel} className="p-1 text-grey-400 hover:text-grey-700 rounded transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Subtopic editor ───────────────────────────────────────────────────────────

function SubtopicRow({ subtopic, onSaved, onDeleted }: {
  subtopic: Subtopic;
  onSaved: (s: Subtopic) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(subtopic.title);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await adminUpdateSubtopic(subtopic.id, { title: title.trim() });
      onSaved({ ...subtopic, title: title.trim() });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Eliminare il sottoargomento "${subtopic.title}"?`)) return;
    await adminDeleteSubtopic(subtopic.id);
    onDeleted(subtopic.id);
  }

  return (
    <div className="flex items-center gap-2 py-1.5 group">
      <span className="w-1.5 h-1.5 rounded-full bg-grey-300 flex-shrink-0 mt-0.5" />
      {editing ? (
        <div className="flex items-center gap-2 flex-1">
          <InlineInput value={title} onChange={setTitle} className="flex-1" />
          <SaveCancelButtons onSave={save} onCancel={() => { setTitle(subtopic.title); setEditing(false); }} saving={saving} />
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm text-grey-700">{subtopic.title}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="p-1 text-grey-400 hover:text-grey-700 rounded transition-colors">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={remove} className="p-1 text-grey-400 hover:text-red-500 rounded transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Lesson row ────────────────────────────────────────────────────────────────

function LessonRow({ lesson, onSaved, onDeleted }: {
  lesson: Lesson;
  onSaved: (l: Lesson) => void;
  onDeleted: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [subtopics, setSubtopics] = useState<Subtopic[]>(lesson.subtopics ?? []);
  const [title, setTitle] = useState(lesson.title);
  const [focus, setFocus] = useState(lesson.focus ?? "");
  const [videoId, setVideoId] = useState(lesson.default_video_id ?? "");
  const [presentationUrl, setPresentationUrl] = useState(lesson.default_presentation_url ?? "");
  const [saving, setSaving] = useState(false);
  const [addingSubtopic, setAddingSubtopic] = useState(false);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState("");

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await adminUpdateLesson(lesson.id, {
        title: title.trim(),
        focus: focus.trim() || null,
        default_video_id: videoId.trim() || null,
        default_presentation_url: presentationUrl.trim() || null,
      });
      onSaved({ ...lesson, title: title.trim(), focus: focus.trim() || null, default_video_id: videoId.trim() || null, default_presentation_url: presentationUrl.trim() || null, subtopics });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Eliminare la lezione "${lesson.title}"? Verranno eliminati anche tutti i sottoargomenti.`)) return;
    await adminDeleteLesson(lesson.id);
    onDeleted(lesson.id);
  }

  async function addSubtopic() {
    if (!newSubtopicTitle.trim()) return;
    const s = await adminCreateSubtopic({ lesson_id: lesson.id, title: newSubtopicTitle.trim(), sort_order: subtopics.length + 1 });
    setSubtopics((p) => [...p, s]);
    setNewSubtopicTitle("");
    setAddingSubtopic(false);
  }

  return (
    <div className="border border-grey-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <button onClick={() => setExpanded((v) => !v)} className="text-grey-400 hover:text-grey-700 transition-colors flex-shrink-0">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <span className="w-6 h-6 rounded-full bg-grey-100 border border-grey-200 flex items-center justify-center text-xs font-bold text-grey-600 flex-shrink-0">
          {lesson.number}
        </span>
        {editing ? (
          <div className="flex-1 space-y-2">
            <InlineInput value={title} onChange={setTitle} placeholder="Titolo lezione" className="w-full" />
            <InlineInput value={focus} onChange={setFocus} placeholder="Focus / descrizione" className="w-full" />
            <div className="flex gap-2">
              <InlineInput value={videoId} onChange={setVideoId} placeholder="Vimeo video ID" className="flex-1" />
              <InlineInput value={presentationUrl} onChange={setPresentationUrl} placeholder="URL presentazione" className="flex-1" />
            </div>
            <SaveCancelButtons
              onSave={save}
              onCancel={() => { setTitle(lesson.title); setFocus(lesson.focus ?? ""); setVideoId(lesson.default_video_id ?? ""); setPresentationUrl(lesson.default_presentation_url ?? ""); setEditing(false); }}
              saving={saving}
            />
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-grey-950 truncate">{lesson.title}</p>
              {lesson.focus && <p className="text-xs text-grey-500 truncate mt-0.5">{lesson.focus}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {lesson.default_video_id && <Badge variant="blue"><Video className="w-2.5 h-2.5 mr-1" />Video</Badge>}
              <Badge>{subtopics.length} arg.</Badge>
              <button onClick={() => setEditing(true)} className="p-1.5 text-grey-400 hover:text-grey-700 rounded-lg hover:bg-grey-100 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={remove} className="p-1.5 text-grey-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      {expanded && (
        <div className="border-t border-grey-100 bg-grey-50 px-6 py-3 space-y-1">
          {subtopics.map((s) => (
            <SubtopicRow
              key={s.id}
              subtopic={s}
              onSaved={(updated) => setSubtopics((p) => p.map((x) => x.id === updated.id ? updated : x))}
              onDeleted={(id) => setSubtopics((p) => p.filter((x) => x.id !== id))}
            />
          ))}
          {subtopics.length === 0 && !addingSubtopic && (
            <p className="text-xs text-grey-400 py-1">Nessun sottoargomento</p>
          )}
          {addingSubtopic ? (
            <div className="flex items-center gap-2 pt-1">
              <InlineInput
                value={newSubtopicTitle}
                onChange={setNewSubtopicTitle}
                placeholder="Nuovo sottoargomento"
                className="flex-1"
              />
              <SaveCancelButtons onSave={addSubtopic} onCancel={() => { setNewSubtopicTitle(""); setAddingSubtopic(false); }} />
            </div>
          ) : (
            <button
              onClick={() => setAddingSubtopic(true)}
              className="flex items-center gap-1.5 text-xs text-grey-500 hover:text-grey-800 py-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Aggiungi sottoargomento
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Cohort enrollments ────────────────────────────────────────────────────────

function CohortEnrollments({ cohortId, adminPassword }: { cohortId: string; adminPassword: string }) {
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    load();
  }, [cohortId]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await adminListEnrollments(cohortId, adminPassword);
      setEnrollments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore caricamento");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    const email = newEmail.trim().toLowerCase();
    if (!email.includes("@")) { setAddError("Email non valida"); return; }
    setAdding(true);
    try {
      await adminEnrollUserByEmail(cohortId, email, adminPassword);
      setNewEmail("");
      await load();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Errore");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string, email: string) {
    if (!confirm(`Rimuovere l'iscrizione di ${email}?`)) return;
    await adminRemoveEnrollment(id, adminPassword);
    setEnrollments((p) => p.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-3 pt-1">
      <form onSubmit={handleAdd} className="flex gap-2">
        <InlineInput
          value={newEmail}
          onChange={setNewEmail}
          placeholder="email@esempio.com"
          className="flex-1"
        />
        <button
          type="submit"
          disabled={adding}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-grey-950 text-white text-xs font-medium rounded-lg hover:bg-grey-800 disabled:opacity-50 transition-colors"
        >
          {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
          Iscrivi
        </button>
      </form>
      {addError && <p className="text-xs text-red-600">{addError}</p>}

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-grey-400" /></div>
      ) : error ? (
        <div className="flex items-center gap-2 text-xs text-red-600 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      ) : enrollments.length === 0 ? (
        <p className="text-xs text-grey-400 py-2">Nessun iscritto</p>
      ) : (
        <div className="divide-y divide-grey-100 border border-grey-200 rounded-xl overflow-hidden">
          {enrollments.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-3 py-2 bg-white group">
              <span className="flex-1 text-xs text-grey-800 font-medium">{e.email}</span>
              <span className="text-xs text-grey-400">{new Date(e.enrolled_at).toLocaleDateString("it-IT")}</span>
              <button
                onClick={() => handleRemove(e.id, e.email)}
                className="opacity-0 group-hover:opacity-100 p-1 text-grey-400 hover:text-red-500 rounded transition-all"
              >
                <UserMinus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Cohort video overrides ────────────────────────────────────────────────────

function CohortVideoOverrides({ cohort, lessons }: { cohort: Cohort; lessons: Lesson[] }) {
  const [values, setValues] = useState<Record<string, { video_id: string; presentation_url: string }>>(() =>
    Object.fromEntries(lessons.map((l) => [l.id, { video_id: l.video_id ?? "", presentation_url: l.presentation_url ?? "" }]))
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function save(lessonId: string) {
    setSaving(lessonId);
    try {
      const v = values[lessonId];
      await adminSetCohortLessonOverride(cohort.id, lessonId, {
        video_id: v.video_id.trim() || null,
        presentation_url: v.presentation_url.trim() || null,
      });
      setSaved(lessonId);
      setTimeout(() => setSaved(null), 2000);
    } finally {
      setSaving(null);
    }
  }

  if (lessons.length === 0) return <p className="text-xs text-grey-400 py-2">Nessuna lezione nel corso</p>;

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="border border-grey-200 rounded-xl p-3 bg-white">
          <p className="text-xs font-semibold text-grey-700 mb-2">Lezione {lesson.number}: {lesson.title}</p>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-grey-500 mb-1">Vimeo ID registrazione</label>
              <InlineInput
                value={values[lesson.id]?.video_id ?? ""}
                onChange={(v) => setValues((p) => ({ ...p, [lesson.id]: { ...p[lesson.id], video_id: v } }))}
                placeholder="es. 1186228117"
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-grey-500 mb-1">URL presentazione</label>
              <InlineInput
                value={values[lesson.id]?.presentation_url ?? ""}
                onChange={(v) => setValues((p) => ({ ...p, [lesson.id]: { ...p[lesson.id], presentation_url: v } }))}
                placeholder="https://..."
                className="w-full"
              />
            </div>
            <button
              onClick={() => save(lesson.id)}
              disabled={saving === lesson.id}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-grey-950 text-white text-xs font-medium rounded-lg hover:bg-grey-800 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              {saving === lesson.id ? <Loader2 className="w-3 h-3 animate-spin" /> : saved === lesson.id ? <Check className="w-3 h-3" /> : null}
              {saved === lesson.id ? "Salvato" : "Salva"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Cohort row ────────────────────────────────────────────────────────────────

function CohortRow({ cohort, lessons, adminPassword, onSaved, onDeleted }: {
  cohort: Cohort;
  lessons: Lesson[];
  adminPassword: string;
  onSaved: (c: Cohort) => void;
  onDeleted: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [subTab, setSubTab] = useState<"iscritti" | "video">("iscritti");
  const [name, setName] = useState(cohort.name);
  const [startsAt, setStartsAt] = useState(cohort.starts_at ?? "");
  const [endsAt, setEndsAt] = useState(cohort.ends_at ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await adminUpdateCohort(cohort.id, {
        name: name.trim(),
        starts_at: startsAt || null,
        ends_at: endsAt || null,
      });
      onSaved({ ...cohort, name: name.trim(), starts_at: startsAt || null, ends_at: endsAt || null });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive() {
    await adminUpdateCohort(cohort.id, { is_active: !cohort.is_active });
    onSaved({ ...cohort, is_active: !cohort.is_active });
  }

  async function remove() {
    if (!confirm(`Eliminare l'edizione "${cohort.name}"? Verranno rimosse tutte le iscrizioni.`)) return;
    await adminDeleteCohort(cohort.id);
    onDeleted(cohort.id);
  }

  return (
    <div className="border border-grey-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <button onClick={() => setExpanded((v) => !v)} className="text-grey-400 hover:text-grey-700 transition-colors flex-shrink-0">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <Calendar className="w-4 h-4 text-grey-400 flex-shrink-0" />
        {editing ? (
          <div className="flex-1 space-y-2">
            <InlineInput value={name} onChange={setName} placeholder="Nome edizione" className="w-full" />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-grey-500 mb-1">Inizio</label>
                <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm border border-grey-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-grey-500 mb-1">Fine</label>
                <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm border border-grey-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200" />
              </div>
            </div>
            <SaveCancelButtons onSave={save} onCancel={() => { setName(cohort.name); setStartsAt(cohort.starts_at ?? ""); setEndsAt(cohort.ends_at ?? ""); setEditing(false); }} saving={saving} />
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-grey-950">{cohort.name}</p>
              {(cohort.starts_at || cohort.ends_at) && (
                <p className="text-xs text-grey-500 mt-0.5">
                  {cohort.starts_at && new Date(cohort.starts_at).toLocaleDateString("it-IT")}
                  {cohort.starts_at && cohort.ends_at && " → "}
                  {cohort.ends_at && new Date(cohort.ends_at).toLocaleDateString("it-IT")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={toggleActive} className="flex items-center gap-1.5 text-xs text-grey-500 hover:text-grey-800 transition-colors">
                {cohort.is_active
                  ? <><ToggleRight className="w-4 h-4 text-green-600" /><span className="text-green-700">Attiva</span></>
                  : <><ToggleLeft className="w-4 h-4 text-grey-400" /><span>Inattiva</span></>}
              </button>
              <button onClick={() => setEditing(true)} className="p-1.5 text-grey-400 hover:text-grey-700 rounded-lg hover:bg-grey-100 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={remove} className="p-1.5 text-grey-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      {expanded && (
        <div className="border-t border-grey-100 bg-grey-50 px-4 py-3">
          <div className="flex gap-4 mb-3 border-b border-grey-200">
            {(["iscritti", "video"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                className={`pb-2 text-xs font-medium border-b-2 transition-colors ${subTab === t ? "border-grey-950 text-grey-950" : "border-transparent text-grey-500 hover:text-grey-700"}`}
              >
                {t === "iscritti" ? <><Users className="w-3 h-3 inline mr-1" />Iscritti</> : <><Video className="w-3 h-3 inline mr-1" />Video & Slide</>}
              </button>
            ))}
          </div>
          {subTab === "iscritti" ? (
            <CohortEnrollments cohortId={cohort.id} adminPassword={adminPassword} />
          ) : (
            <CohortVideoOverrides cohort={cohort} lessons={lessons} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Course detail ─────────────────────────────────────────────────────────────

function CourseDetail({ course, onBack, onCourseUpdated, adminPassword }: {
  course: Course;
  onBack: () => void;
  onCourseUpdated: (c: Course) => void;
  adminPassword: string;
}) {
  const [subTab, setSubTab] = useState<CourseSubTab>("lezioni");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingLesson, setAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [addingCohort, setAddingCohort] = useState(false);
  const [newCohortName, setNewCohortName] = useState("");
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseTitle, setCourseTitle] = useState(course.title);
  const [courseDesc, setCourseDesc] = useState(course.description ?? "");
  const [savingCourse, setSavingCourse] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [l, c] = await Promise.all([fetchAllLessonsAdmin(course.id), fetchAllCohortsAdmin(course.id)]);
      setLessons(l);
      setCohorts(c);
      setLoading(false);
    })();
  }, [course.id]);

  async function saveCourse() {
    if (!courseTitle.trim()) return;
    setSavingCourse(true);
    try {
      await adminUpdateCourse(course.id, { title: courseTitle.trim(), description: courseDesc.trim() || null });
      onCourseUpdated({ ...course, title: courseTitle.trim(), description: courseDesc.trim() || null });
      setEditingCourse(false);
    } finally {
      setSavingCourse(false);
    }
  }

  async function addLesson() {
    if (!newLessonTitle.trim()) return;
    const nextNum = lessons.length > 0 ? Math.max(...lessons.map((l) => l.number)) + 1 : 1;
    const l = await adminCreateLesson({ course_id: course.id, number: nextNum, title: newLessonTitle.trim(), sort_order: nextNum });
    setLessons((p) => [...p, l]);
    setNewLessonTitle("");
    setAddingLesson(false);
  }

  async function addCohort() {
    if (!newCohortName.trim()) return;
    const c = await createCohort(course.id, newCohortName.trim());
    setCohorts((p) => [...p, c]);
    setNewCohortName("");
    setAddingCohort(false);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="mt-0.5 p-1.5 text-grey-400 hover:text-grey-700 rounded-lg hover:bg-grey-100 transition-colors flex-shrink-0">
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          {editingCourse ? (
            <div className="space-y-2">
              <InlineInput value={courseTitle} onChange={setCourseTitle} placeholder="Titolo corso" className="w-full text-base font-semibold" />
              <InlineInput value={courseDesc} onChange={setCourseDesc} placeholder="Descrizione" className="w-full" />
              <SaveCancelButtons onSave={saveCourse} onCancel={() => { setCourseTitle(course.title); setCourseDesc(course.description ?? ""); setEditingCourse(false); }} saving={savingCourse} />
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-grey-950 truncate">{course.title}</h2>
                {course.description && <p className="text-sm text-grey-500 mt-0.5">{course.description}</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge variant={course.type === "live" ? "green" : "blue"}>{course.type}</Badge>
                <button onClick={() => setEditingCourse(true)} className="p-1.5 text-grey-400 hover:text-grey-700 rounded-lg hover:bg-grey-100 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-grey-200">
        {(["lezioni", "edizioni"] as const).map((t) => (
          <button key={t} onClick={() => setSubTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${subTab === t ? "border-grey-950 text-grey-950" : "border-transparent text-grey-500 hover:text-grey-800"}`}
          >
            {t === "lezioni" ? <><BookOpen className="w-3.5 h-3.5 inline mr-1.5" />Lezioni</> : <><Calendar className="w-3.5 h-3.5 inline mr-1.5" />Edizioni</>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-grey-400" /></div>
      ) : subTab === "lezioni" ? (
        <div className="space-y-3">
          {lessons.map((l) => (
            <LessonRow
              key={l.id}
              lesson={l}
              onSaved={(updated) => setLessons((p) => p.map((x) => x.id === updated.id ? updated : x))}
              onDeleted={(id) => setLessons((p) => p.filter((x) => x.id !== id))}
            />
          ))}
          {lessons.length === 0 && !addingLesson && (
            <div className="bg-grey-50 border border-grey-200 rounded-xl py-8 text-center">
              <BookOpen className="w-6 h-6 text-grey-300 mx-auto mb-2" />
              <p className="text-sm text-grey-500">Nessuna lezione</p>
            </div>
          )}
          {addingLesson ? (
            <div className="flex items-center gap-2 border border-grey-200 rounded-xl px-4 py-3 bg-white">
              <span className="w-6 h-6 rounded-full bg-grey-100 border border-grey-200 flex items-center justify-center text-xs font-bold text-grey-600 flex-shrink-0">
                {lessons.length + 1}
              </span>
              <InlineInput value={newLessonTitle} onChange={setNewLessonTitle} placeholder="Titolo nuova lezione" className="flex-1" />
              <SaveCancelButtons onSave={addLesson} onCancel={() => { setNewLessonTitle(""); setAddingLesson(false); }} />
            </div>
          ) : (
            <button
              onClick={() => setAddingLesson(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-grey-200 rounded-xl py-3 text-sm text-grey-500 hover:text-grey-800 hover:border-grey-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Aggiungi lezione
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {cohorts.map((c) => (
            <CohortRow
              key={c.id}
              cohort={c}
              lessons={lessons}
              adminPassword={adminPassword}
              onSaved={(updated) => setCohorts((p) => p.map((x) => x.id === updated.id ? updated : x))}
              onDeleted={(id) => setCohorts((p) => p.filter((x) => x.id !== id))}
            />
          ))}
          {cohorts.length === 0 && !addingCohort && (
            <div className="bg-grey-50 border border-grey-200 rounded-xl py-8 text-center">
              <Calendar className="w-6 h-6 text-grey-300 mx-auto mb-2" />
              <p className="text-sm text-grey-500">Nessuna edizione</p>
            </div>
          )}
          {addingCohort ? (
            <div className="flex items-center gap-2 border border-grey-200 rounded-xl px-4 py-3 bg-white">
              <Calendar className="w-4 h-4 text-grey-400 flex-shrink-0" />
              <InlineInput value={newCohortName} onChange={setNewCohortName} placeholder="Nome edizione (es. Edizione 4 — Maggio 2026)" className="flex-1" />
              <SaveCancelButtons onSave={addCohort} onCancel={() => { setNewCohortName(""); setAddingCohort(false); }} />
            </div>
          ) : (
            <button
              onClick={() => setAddingCohort(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-grey-200 rounded-xl py-3 text-sm text-grey-500 hover:text-grey-800 hover:border-grey-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Aggiungi edizione
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Courses list ──────────────────────────────────────────────────────────────

function CourseCard({ course, onClick, onToggleActive, onDelete }: {
  course: Course;
  onClick: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-grey-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-grey-100 border border-grey-200 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4.5 h-4.5 text-grey-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-grey-950 truncate">{course.title}</h3>
            <Badge variant={course.type === "live" ? "green" : "blue"}>{course.type}</Badge>
            {!course.is_active && <Badge variant="red">Inattivo</Badge>}
          </div>
          {course.description && <p className="text-xs text-grey-500 line-clamp-2">{course.description}</p>}
          <p className="text-xs text-grey-400 mt-1 font-mono">/{course.slug}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-grey-100">
        <button
          onClick={onClick}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-grey-950 text-white text-xs font-medium rounded-lg hover:bg-grey-800 transition-colors"
        >
          Gestisci
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggleActive}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-grey-200 text-xs font-medium rounded-lg hover:bg-grey-50 transition-colors text-grey-600"
        >
          {course.is_active ? <ToggleRight className="w-3.5 h-3.5 text-green-600" /> : <ToggleLeft className="w-3.5 h-3.5" />}
          {course.is_active ? "Attivo" : "Inattivo"}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-grey-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Add course form ───────────────────────────────────────────────────────────

function AddCourseForm({ onCreated, onCancel }: { onCreated: (c: Course) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"live" | "recorded">("recorded");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setError("");
    if (!title.trim() || !slug.trim()) { setError("Titolo e slug sono obbligatori"); return; }
    setSaving(true);
    try {
      const c = await adminCreateCourse({ title: title.trim(), slug: slug.trim().toLowerCase().replace(/\s+/g, "-"), description: description.trim() || undefined, type });
      onCreated(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-grey-200 rounded-xl p-5 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-grey-950">Nuovo corso</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-grey-500 mb-1">Titolo *</label>
          <InlineInput value={title} onChange={(v) => { setTitle(v); if (!slug) setSlug(v.toLowerCase().replace(/\s+/g, "-")); }} placeholder="AI per Psicologi" className="w-full" />
        </div>
        <div>
          <label className="block text-xs text-grey-500 mb-1">Slug *</label>
          <InlineInput value={slug} onChange={setSlug} placeholder="ai-per-psicologi" className="w-full" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-grey-500 mb-1">Descrizione</label>
        <InlineInput value={description} onChange={setDescription} placeholder="Descrizione breve" className="w-full" />
      </div>
      <div>
        <label className="block text-xs text-grey-500 mb-1">Tipo</label>
        <div className="flex gap-3">
          {(["recorded", "live"] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value={t} checked={type === t} onChange={() => setType(t)} className="accent-grey-950" />
              <span className="text-sm text-grey-700 capitalize">{t}</span>
            </label>
          ))}
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2 pt-1">
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-grey-950 text-white text-sm font-medium rounded-lg hover:bg-grey-800 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Crea corso
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-grey-600 hover:text-grey-900 rounded-lg hover:bg-grey-100 transition-colors">
          Annulla
        </button>
      </div>
    </div>
  );
}

// ─── Root component ────────────────────────────────────────────────────────────

export function AdminCourses({ adminPassword }: Props) {
  const [view, setView] = useState<View>("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchAllCoursesAdmin().then((data) => { setCourses(data); setLoading(false); });
  }, []);

  async function toggleActive(course: Course) {
    await adminUpdateCourse(course.id, { is_active: !course.is_active });
    setCourses((p) => p.map((c) => c.id === course.id ? { ...c, is_active: !c.is_active } : c));
  }

  async function deleteCourse(course: Course) {
    if (!confirm(`Eliminare il corso "${course.title}"? Tutti i dati (lezioni, edizioni, iscrizioni) verranno rimossi.`)) return;
    await adminDeleteCourse(course.id);
    setCourses((p) => p.filter((c) => c.id !== course.id));
  }

  if (view === "course-detail" && selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        adminPassword={adminPassword}
        onBack={() => { setSelectedCourse(null); setView("courses"); }}
        onCourseUpdated={(updated) => {
          setSelectedCourse(updated);
          setCourses((p) => p.map((c) => c.id === updated.id ? updated : c));
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-grey-950">Corsi</h2>
          <p className="text-xs text-grey-500 mt-0.5">{courses.length} corso{courses.length !== 1 ? "i" : ""}</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-grey-950 text-white text-sm font-medium rounded-lg hover:bg-grey-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuovo corso
          </button>
        )}
      </div>

      {showAddForm && (
        <AddCourseForm
          onCreated={(c) => { setCourses((p) => [...p, c]); setShowAddForm(false); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-grey-400" /></div>
      ) : courses.length === 0 && !showAddForm ? (
        <div className="bg-grey-50 border border-grey-200 rounded-xl py-12 text-center">
          <BookOpen className="w-8 h-8 text-grey-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-grey-600">Nessun corso</p>
          <p className="text-xs text-grey-400 mt-1">Crea il tuo primo corso per iniziare.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onClick={() => { setSelectedCourse(c); setView("course-detail"); }}
              onToggleActive={() => toggleActive(c)}
              onDelete={() => deleteCourse(c)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
