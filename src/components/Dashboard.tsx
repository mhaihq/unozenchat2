import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Settings, LogOut, Sparkles, MessageCircle, ChevronRight } from "lucide-react";
import { CORSO } from "../lib/courseData";
import { fetchMyEnrollment, fetchProgress } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { Enrollment, Progress } from "../lib/types";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";

interface Props {
  displayName: string;
  email: string;
  userAvatar: string;
  onOpenCourse: () => void;
  onAdmin: () => void;
  onSignOut: () => void;
}

function ProgressRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3} className="stroke-[rgba(20,20,20,0.08)]" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="stroke-accent transition-all duration-700"
      />
    </svg>
  );
}

export function Dashboard({ displayName, email, userAvatar: _userAvatar, onOpenCourse, onAdmin, onSignOut }: Props) {
  const initials = displayName.slice(0, 2).toUpperCase();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [enr, { data: { user } }] = await Promise.all([
          fetchMyEnrollment(),
          supabase.auth.getUser(),
        ]);
        setEnrollment(enr);
        if (user) {
          const progress: Progress[] = await fetchProgress(user.id);
          setCompletedIds(new Set(progress.map((p) => p.subtopic_id)));
        }
      } catch {/* silent */} finally {
        setLoading(false);
      }
    })();
  }, []);

  const allSubtopics = CORSO.flatMap((l) => l.subtopics);
  const totalSubtopics = allSubtopics.length;
  const totalCompleted = allSubtopics.filter((s) => completedIds.has(s.id)).length;
  const overallPct = totalSubtopics > 0 ? totalCompleted / totalSubtopics : 0;

  // Find the active lesson (first with incomplete subtopics, or last lesson)
  const activeLesson = CORSO.find((l) => l.subtopics.some((s) => !completedIds.has(s.id))) ?? CORSO[CORSO.length - 1];
  const activeSubtopic = activeLesson.subtopics.find((s) => !completedIds.has(s.id)) ?? activeLesson.subtopics[0];
  const hasStarted = totalCompleted > 0;

  // Suggested questions from active lesson
  const suggestedQs = activeSubtopic.suggestedQuestions.slice(0, 3);

  const courseName = enrollment?.cohort?.course?.title ?? "AI per Psicologi";
  const cohortName = enrollment?.cohort?.name ?? null;

  return (
    <div className="min-h-screen bg-bg font-sans">

      {/* Top bar */}
      <header className="h-14 bg-surface border-b border-[rgba(20,20,20,0.08)] flex items-center px-6 gap-4">
        <div className="flex items-center gap-2.5 flex-1">
          <img src={LOGO} alt="AI per Psicologi" className="h-6 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[10px] font-semibold tracking-wide">
            {initials}
          </div>
          <span className="text-xs text-muted hidden sm:block">{displayName}</span>
          <button onClick={onAdmin} title="Amministrazione" className="w-8 h-8 rounded-md flex items-center justify-center text-faint hover:text-muted hover:bg-surface2 transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button onClick={onSignOut} title="Esci" className="w-8 h-8 rounded-md flex items-center justify-center text-faint hover:text-muted hover:bg-surface2 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10 space-y-6">

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <h1 className="font-serif text-2xl font-normal tracking-tight text-tx">
            {hasStarted ? `Bentornata, ${displayName}` : `Benvenuta, ${displayName}`}
          </h1>
          <p className="text-sm text-muted mt-1">
            {cohortName ? `${courseName} · ${cohortName}` : courseName}
          </p>
        </motion.div>

        {/* Resume / Start hero card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }}
          className="relative bg-accent rounded-2xl overflow-hidden shadow-lg"
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -right-2 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative px-7 py-6 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/70 uppercase tracking-widest mb-1.5">
                {hasStarted ? "Continua da" : "Inizia da"}
              </p>
              <h2 className="text-white font-serif text-lg font-normal leading-snug">
                Lezione {activeLesson.number}: {activeLesson.title}
              </h2>
              <p className="text-white/70 text-sm mt-1 truncate">{activeSubtopic.title}</p>
            </div>
            <button
              onClick={onOpenCourse}
              className="flex-shrink-0 flex items-center gap-2 bg-white text-accent text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-white/90 transition-colors group shadow-sm"
            >
              {hasStarted ? "Riprendi" : "Inizia"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Progress bar */}
          {hasStarted && (
            <div className="px-7 pb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/60">Progresso del corso</span>
                <span className="text-xs font-medium text-white/80">{totalCompleted}/{totalSubtopics} argomenti</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPct * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Lessons grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-surface rounded-2xl border border-[rgba(20,20,20,0.08)] shadow-card overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[rgba(20,20,20,0.06)] flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-faint">Lezioni del corso</p>
            {!loading && <span className="text-xs text-faint">{CORSO.length} lezioni</span>}
          </div>
          <div className="divide-y divide-[rgba(20,20,20,0.05)]">
            {CORSO.map((lezione) => {
              const done = lezione.subtopics.filter((s) => completedIds.has(s.id)).length;
              const total = lezione.subtopics.length;
              const pct = total > 0 ? done / total : 0;
              const isActive = lezione.id === activeLesson.id;
              return (
                <button
                  key={lezione.id}
                  onClick={onOpenCourse}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-surface2 ${isActive ? "bg-accent-soft/30" : ""}`}
                >
                  <div className="relative flex-shrink-0">
                    <ProgressRing pct={pct} size={40} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-tx">
                      {lezione.number}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? "text-accent" : "text-tx"}`}>{lezione.title}</p>
                    <p className="text-xs text-faint mt-0.5">
                      {done > 0 ? `${done}/${total} argomenti completati` : lezione.focus.split(".")[0]}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? "text-accent" : "text-faint"}`} />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Suggested questions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-surface rounded-2xl border border-[rgba(20,20,20,0.08)] shadow-card overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[rgba(20,20,20,0.06)] flex items-center gap-2.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <p className="text-xs font-semibold uppercase tracking-widest text-faint">Da esplorare oggi</p>
            <span className="text-xs text-faint ml-auto">Lezione {activeLesson.number} · {activeSubtopic.title}</span>
          </div>
          <div className="divide-y divide-[rgba(20,20,20,0.05)]">
            {suggestedQs.map((q, i) => (
              <button
                key={i}
                onClick={onOpenCourse}
                className="w-full flex items-center gap-3 px-6 py-3.5 text-left hover:bg-surface2 transition-colors group"
              >
                <MessageCircle className="w-3.5 h-3.5 text-faint flex-shrink-0 group-hover:text-accent transition-colors" />
                <p className="text-sm text-muted group-hover:text-tx transition-colors flex-1">{q}</p>
                <ArrowRight className="w-3.5 h-3.5 text-faint flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </motion.div>

        <p className="text-center text-xs text-faint pb-6">
          {email}
        </p>
      </div>
    </div>
  );
}
