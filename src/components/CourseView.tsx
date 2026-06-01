import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronLeft, Menu, X, Settings, LogOut, Loader2, ClipboardList } from "lucide-react";
import { EcmQuiz } from "./EcmQuiz";
import { EcmSurvey } from "./EcmSurvey";
import { EcmProfile } from "./EcmProfile";
import { generateCertificate } from "../lib/ecmCertificate";
import { supabase } from "../lib/supabase";
import type { Lesson, Subtopic, Enrollment } from "../lib/types";
import { fetchLessons, fetchMyEnrollment, fetchProgress, markSubtopicComplete, unmarkSubtopicComplete } from "../lib/api";
import { CORSO } from "../lib/courseData";
import { LessonChat } from "./LessonChat";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";
const RECORDED_COURSE_ID = "a1000000-0000-0000-0000-000000000001";

interface Props {
  displayName: string;
  userAvatar: string;
  onAdmin: () => void;
  onSignOut: () => void;
  onBack: () => void;
}

// Convert legacy courseData format to Lesson type so the UI works before DB is seeded
function legacyToLessons(): Lesson[] {
  return CORSO.map((l) => ({
    id: l.id,
    course_id: RECORDED_COURSE_ID,
    number: l.number,
    title: l.title,
    focus: l.focus,
    default_video_id: l.videoId ?? null,
    default_video_hash: l.videoHash ?? null,
    default_presentation_url: l.presentationUrl ?? null,
    sort_order: l.number,
    subtopics: l.subtopics.map((s) => ({
      id: s.id,
      lesson_id: l.id,
      title: s.title,
      bullets: s.bullets,
      suggested_questions: s.suggestedQuestions,
      sort_order: 0,
    })),
    video_id: l.videoId ?? null,
    presentation_url: l.presentationUrl ?? null,
    cohort_document_id: null,
  }));
}

export function CourseView({ displayName, userAvatar: _userAvatar, onAdmin, onSignOut, onBack }: Props) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeSubtopic, setActiveSubtopic] = useState<Subtopic | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mediaTab, setMediaTab] = useState<"video" | "presentation">("video");
  const [quizOpen, setQuizOpen] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Enrollment is optional — don't let it block loading
        let enr = null;
        try {
          enr = await fetchMyEnrollment();
        } catch { /* not enrolled or query failed, proceed with default course */ }
        setEnrollment(enr);

        const cohortId = enr?.cohort_id;
        const courseId = enr?.cohort?.course?.id ?? RECORDED_COURSE_ID;

        // Try DB first; fall back to hardcoded data if DB not seeded or subtopics missing
        let dbLessons: Lesson[] = [];
        try {
          dbLessons = await fetchLessons(courseId, cohortId);
        } catch { /* fall through to legacy data */ }

        const resolved = dbLessons.length > 0 && dbLessons.some(l => l.subtopics.length > 0)
          ? dbLessons
          : legacyToLessons();

        setLessons(resolved);
        setActiveLesson(resolved[0] ?? null);
        setActiveSubtopic(resolved[0]?.subtopics[0] ?? null);

        // Load persisted progress — non-critical
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const prog = await fetchProgress(user.id);
            setCompletedIds(new Set(prog.map((p) => p.subtopic_id)));

            // Check if quiz already passed
            if (enr?.cohort_id) {
              const { data: part } = await supabase
                .from("ecm_participation")
                .select("quiz_passed_at, survey_done")
                .eq("user_id", user.id)
                .eq("cohort_id", enr.cohort_id)
                .maybeSingle();
              if (part?.quiz_passed_at) setQuizPassed(true);
              if (part?.survey_done) setSurveyDone(true);
            }
          }
        } catch { /* progress not critical */ }

        // Fetch active quiz for this cohort/course
        try {
          const cohortId = enr?.cohort_id;
          const courseId = enr?.cohort?.course?.id ?? RECORDED_COURSE_ID;
          const query = supabase.from("ecm_quizzes").select("id").eq("is_active", true);
          cohortId ? query.eq("cohort_id", cohortId) : query.eq("course_id", courseId);
          const { data: qz } = await query.maybeSingle();
          if (qz?.id) setActiveQuizId(qz.id);
        } catch { /* no quiz yet */ }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleCompleted(subtopicId: string) {
    const isDone = completedIds.has(subtopicId);
    setCompletedIds((prev) => {
      const next = new Set(prev);
      isDone ? next.delete(subtopicId) : next.add(subtopicId);
      return next;
    });
    try {
      isDone ? await unmarkSubtopicComplete(subtopicId) : await markSubtopicComplete(subtopicId);
    } catch {
      // revert on error
      setCompletedIds((prev) => {
        const next = new Set(prev);
        isDone ? next.add(subtopicId) : next.delete(subtopicId);
        return next;
      });
    }
  }

  function selectLesson(lesson: Lesson) {
    setActiveLesson(lesson);
    setActiveSubtopic(lesson.subtopics[0]);
    setSidebarOpen(false);
  }

  function selectSubtopic(sub: Subtopic) {
    setActiveSubtopic(sub);
    setSidebarOpen(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
      </div>
    );
  }

  if (!activeLesson || !activeSubtopic) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
      <p className="text-sm text-muted">Impossibile caricare il corso.</p>
      <button onClick={onBack} className="text-sm text-accent underline">Torna alla dashboard</button>
    </div>
  );

  const currentIndex = activeLesson.subtopics.findIndex((s) => s.id === activeSubtopic.id);
  const prevSubtopic = currentIndex > 0 ? activeLesson.subtopics[currentIndex - 1] : null;
  const nextSubtopic = currentIndex < activeLesson.subtopics.length - 1 ? activeLesson.subtopics[currentIndex + 1] : null;

  const totalSubtopics = lessons.flatMap((l) => l.subtopics).length;
  const totalCompleted = lessons.flatMap((l) => l.subtopics).filter((s) => completedIds.has(s.id)).length;
  const overallPct = totalSubtopics > 0 ? Math.round((totalCompleted / totalSubtopics) * 100) : 0;
  const lessonCompleted = activeLesson.subtopics.filter((s) => completedIds.has(s.id)).length;
  const circumference = 2 * Math.PI * 14;

  const initials = displayName.slice(0, 2).toUpperCase();
  const videoId = activeLesson.video_id ?? activeLesson.default_video_id;
  const videoHash = activeLesson.default_video_hash;
  const presentationUrl = activeLesson.presentation_url ?? activeLesson.default_presentation_url;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-[18px] pt-7 pb-0">
        <p className="text-2xs uppercase tracking-[0.1em] text-faint mb-1">Lezione {activeLesson.number}</p>
        <h2 className="text-base font-semibold text-tx mb-3.5" style={{ letterSpacing: "0.02em" }}>{activeLesson.title}</h2>
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex-1 h-[3px] rounded-full bg-surface2 overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${(lessonCompleted / activeLesson.subtopics.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-faint tabular-nums">{lessonCompleted}/{activeLesson.subtopics.length}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-[18px] pb-4 flex flex-col gap-0.5">
        {activeLesson.subtopics.map((sub, idx) => {
          const isActive = sub.id === activeSubtopic.id;
          const isDone = completedIds.has(sub.id);
          return (
            <button
              key={sub.id}
              onClick={() => selectSubtopic(sub)}
              className={`flex items-center gap-3 py-[11px] px-3 rounded-md text-left transition-all ${
                isActive ? "bg-accent-soft border-l-2 border-accent pl-[10px] rounded-l-none" : "hover:bg-surface2"
              }`}
            >
              <div className={`w-[22px] h-[22px] rounded-full flex-shrink-0 flex items-center justify-center border text-xs font-medium transition-all ${
                isDone ? "bg-accent-soft border-accent-soft text-accent"
                : isActive ? "bg-accent border-accent text-white"
                : "border-[rgba(20,20,20,0.16)] text-muted"
              }`}>
                {isDone ? <Check className="w-2.5 h-2.5 stroke-[2]" /> : <span>{idx + 1}</span>}
              </div>
              <span className={`text-sm truncate ${isActive ? "text-accent-deep font-medium" : "text-muted"}`}>
                {sub.title}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
    <div className="min-h-screen bg-bg font-sans">
      <div className="max-w-[1280px] mx-auto my-6 bg-surface rounded-xl border border-[rgba(20,20,20,0.08)] overflow-hidden shadow-card">

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-[14px] border-b border-[rgba(20,20,20,0.08)]">
          <div className="flex items-center gap-8">
            <button onClick={() => setSidebarOpen((v) => !v)} className="md:hidden text-muted hover:text-tx transition-colors">
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <button onClick={onBack} className="flex items-center gap-2 group">
              <ChevronLeft className="w-3.5 h-3.5 text-faint group-hover:text-muted transition-colors" />
              <img src={LOGO} alt="Unozen" className="h-6 w-auto object-contain" />
            </button>
            <nav className="hidden md:flex gap-7">
              {lessons.map((lesson) => {
                const isActive = lesson.id === activeLesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(lesson)}
                    className={`relative text-sm py-[14px] -my-[14px] transition-colors ${
                      isActive ? "text-tx font-medium" : "text-faint hover:text-muted"
                    }`}
                  >
                    Lezione {lesson.number}
                    {isActive && <span className="absolute left-0 right-0 -bottom-px h-[1.5px] bg-tx" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {enrollment?.cohort && (
              <span className="hidden md:block text-xs text-faint border border-[rgba(20,20,20,0.08)] rounded-full px-3 py-1">
                {enrollment.cohort.name}
              </span>
            )}
            <div className="hidden md:flex items-center gap-2">
              <div className="relative w-8 h-8" title={`${overallPct}% completato`}>
                <svg className="-rotate-90 w-8 h-8" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="none" stroke="var(--border)" strokeWidth="2.5" />
                  <circle
                    cx="16" cy="16" r="14" fill="none"
                    stroke="var(--accent)" strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - overallPct / 100)}
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-muted">
                  {overallPct}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-[rgba(20,20,20,0.08)] hover:bg-surface2 transition-colors cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[10px] font-semibold tracking-wide">
                {initials}
              </div>
              <span className="text-xs text-muted font-medium hidden sm:block">{displayName}</span>
            </div>
            <button onClick={onAdmin} title="Admin" className="text-faint hover:text-muted transition-colors p-1">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onSignOut} title="Esci" className="text-faint hover:text-muted transition-colors p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex relative" style={{ minHeight: 640 }}>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="md:hidden absolute inset-0 bg-black/30 z-20"
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: "spring", damping: 30, stiffness: 280 }}
                className="md:hidden absolute left-0 top-0 bottom-0 w-64 bg-surface border-r border-[rgba(20,20,20,0.08)] z-30"
              >
                <SidebarContent />
              </motion.aside>
            )}
          </AnimatePresence>
          <aside className="hidden md:block w-[248px] flex-shrink-0 border-r border-[rgba(20,20,20,0.08)]">
            <SidebarContent />
          </aside>

          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubtopic.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="px-10 sm:px-14 pt-10 pb-12 w-full"
              >
                {/* Media block — shown on first subtopic of each lesson */}
                {(videoId || presentationUrl) && activeLesson.subtopics[0].id === activeSubtopic.id && (
                  <div className="mb-10">
                    {videoId && presentationUrl && (
                      <div className="flex items-center gap-px bg-surface2 rounded-lg p-0.5 w-fit mb-4">
                        {(["video", "presentation"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setMediaTab(tab)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                              mediaTab === tab ? "bg-surface text-tx shadow-sm" : "text-muted hover:text-tx"
                            }`}
                          >
                            {tab === "video" ? "Video" : "Presentazione"}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="rounded-xl overflow-hidden border border-[rgba(20,20,20,0.08)] shadow-card" style={{ aspectRatio: "16/9" }}>
                      {(mediaTab === "video" || !presentationUrl) && videoId && (
                        <iframe
                          src={`https://player.vimeo.com/video/${videoId}?${videoHash ? `h=${videoHash}&` : ""}autopause=0&player_id=0&app_id=58479`}
                          className="w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          title={`Lezione ${activeLesson.number} — ${activeLesson.title}`}
                        />
                      )}
                      {(mediaTab === "presentation" || !videoId) && presentationUrl && (
                        <iframe
                          src={presentationUrl}
                          className="w-full h-full"
                          allow="fullscreen"
                          title={`Presentazione Lezione ${activeLesson.number}`}
                        />
                      )}
                    </div>
                  </div>
                )}

                <p className="text-2xs uppercase text-faint mb-3">
                  Lezione {activeLesson.number} · {activeLesson.title}
                </p>
                <h1 className="font-serif text-3xl font-normal leading-[1.1] mb-8">
                  {activeSubtopic.title}
                </h1>

                <div className="flex flex-col gap-[18px] mb-9">
                  {activeSubtopic.bullets.map((bullet, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex gap-3.5 items-start"
                    >
                      <div className="w-8 h-8 rounded-md bg-surface2 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <span className="text-xs font-medium text-muted">{i + 1}</span>
                      </div>
                      <p className="text-base text-tx leading-[1.55] flex-1 pt-[5px]">{bullet}</p>
                    </motion.div>
                  ))}
                </div>

                <LessonChat
                  subtopic={activeSubtopic}
                  lezione={activeLesson}
                  cohortId={enrollment?.cohort_id}
                />

                <div className="flex items-center justify-between mt-8">
                  <button
                    onClick={() => toggleCompleted(activeSubtopic.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                      completedIds.has(activeSubtopic.id)
                        ? "bg-accent-soft text-accent border-accent-soft"
                        : "bg-surface text-muted border-[rgba(20,20,20,0.08)] hover:border-[rgba(20,20,20,0.16)]"
                    }`}
                  >
                    {completedIds.has(activeSubtopic.id)
                      ? <><Check className="w-3.5 h-3.5" /> Completato</>
                      : "Segna come completato"
                    }
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => prevSubtopic && setActiveSubtopic(prevSubtopic)}
                      disabled={!prevSubtopic}
                      className="px-4 py-2 text-sm text-muted hover:text-tx disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Precedente
                    </button>
                    {!nextSubtopic && totalCompleted >= totalSubtopics && activeQuizId ? (
                      surveyDone ? (
                        <button
                          onClick={() => setProfileOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <ClipboardList className="w-4 h-4" />
                          Scarica attestato ECM
                        </button>
                      ) : quizPassed ? (
                        <button
                          onClick={() => setSurveyOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-deep transition-colors"
                        >
                          <ClipboardList className="w-4 h-4" />
                          Compila questionario qualità →
                        </button>
                      ) : (
                        <button
                          onClick={() => setQuizOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-deep transition-colors"
                        >
                          <ClipboardList className="w-4 h-4" />
                          Fai il test ECM
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => nextSubtopic && setActiveSubtopic(nextSubtopic)}
                        disabled={!nextSubtopic}
                        className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-deep disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Prossimo →
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>

    <AnimatePresence>
      {quizOpen && activeQuizId && (
        <EcmQuiz
          quizId={activeQuizId}
          cohortId={enrollment?.cohort_id}
          onClose={() => setQuizOpen(false)}
          onPassed={() => { setQuizPassed(true); setQuizOpen(false); setSurveyOpen(true); }}
        />
      )}
      {surveyOpen && (
        <EcmSurvey
          cohortId={enrollment?.cohort_id}
          onClose={() => setSurveyOpen(false)}
          onSubmitted={() => { setSurveyDone(true); setSurveyOpen(false); setProfileOpen(true); }}
        />
      )}
      {profileOpen && (
        <EcmProfile
          onClose={() => setProfileOpen(false)}
          onSaved={(profile) => {
            setProfileOpen(false);
            generateCertificate({
              fullName: profile.full_name,
              codiceFiscale: profile.codice_fiscale,
              professione: profile.professione,
              disciplina: profile.disciplina,
              employment: profile.employment,
              courseTitle: enrollment?.cohort?.course?.title ?? "AI per Psicologi",
              cohortName: enrollment?.cohort?.name ?? "4ª Edizione 2026",
              credits: 8,
              quizPassedAt: new Date().toISOString(),
              providerName: "Unozen S.r.l.",
            });
          }}
        />
      )}
    </AnimatePresence>
    </>
  );
}
