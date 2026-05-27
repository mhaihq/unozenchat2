import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Settings, LogOut, Sparkles, MessageCircle, BookOpen, Trophy, Flame, CheckCircle2 } from "lucide-react";
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

const ACHIEVEMENTS = [
  { id: "first_step",  label: "Primo Passo",        desc: "Completa il primo argomento",      icon: "🌱", threshold: (c: number) => c >= 1 },
  { id: "lesson1",     label: "Fondamenta Solide",   desc: "Completa la Lezione 1",            icon: "🏛️", threshold: (_c: number, byLesson: number[]) => byLesson[0] === CORSO[0].subtopics.length },
  { id: "halfway",     label: "A Metà Strada",       desc: "Completa il 50% del corso",        icon: "⚡", threshold: (c: number) => c >= Math.ceil(CORSO.flatMap(l => l.subtopics).length / 2) },
  { id: "lesson3",     label: "Esploratore AI",      desc: "Completa 3 lezioni",               icon: "🔭", threshold: (_c: number, byLesson: number[]) => byLesson.filter((d, i) => d === CORSO[i].subtopics.length).length >= 3 },
  { id: "complete",    label: "Esperto AI",          desc: "Completa l'intero corso",          icon: "🏆", threshold: (c: number) => c === CORSO.flatMap(l => l.subtopics).length },
];

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div className="bg-surface2 rounded-xl px-4 py-3.5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-lg font-semibold text-tx leading-none">{value}</p>
        <p className="text-xs text-faint mt-0.5">{label}</p>
      </div>
    </div>
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
        const [enr, { data: { user } }] = await Promise.all([fetchMyEnrollment(), supabase.auth.getUser()]);
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
  const overallPct = totalSubtopics > 0 ? Math.round((totalCompleted / totalSubtopics) * 100) : 0;
  const completedByLesson = CORSO.map((l) => l.subtopics.filter((s) => completedIds.has(s.id)).length);
  const lessonsCompleted = CORSO.filter((l, i) => completedByLesson[i] === l.subtopics.length).length;
  const hasStarted = totalCompleted > 0;

  const activeLesson = CORSO.find((l) => l.subtopics.some((s) => !completedIds.has(s.id))) ?? CORSO[CORSO.length - 1];
  const activeSubtopic = activeLesson.subtopics.find((s) => !completedIds.has(s.id)) ?? activeLesson.subtopics[0];
  const suggestedQs = activeSubtopic.suggestedQuestions.slice(0, 3);

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.threshold(totalCompleted, completedByLesson));
  const lockedAchievements = ACHIEVEMENTS.filter((a) => !a.threshold(totalCompleted, completedByLesson));

  const courseName = enrollment?.cohort?.course?.title ?? "AI per Psicologi";
  const cohortName = enrollment?.cohort?.name ?? null;

  return (
    <div className="min-h-screen bg-bg font-sans">
      {/* Top bar */}
      <header className="h-14 bg-surface border-b border-[rgba(20,20,20,0.08)] flex items-center px-6 gap-4">
        <img src={LOGO} alt="AI per Psicologi" className="h-6 w-auto object-contain flex-1" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[10px] font-semibold">{initials}</div>
          <span className="text-xs text-muted hidden sm:block">{displayName}</span>
          <button onClick={onAdmin} className="w-8 h-8 rounded-md flex items-center justify-center text-faint hover:text-muted hover:bg-surface2 transition-colors"><Settings className="w-3.5 h-3.5" /></button>
          <button onClick={onSignOut} className="w-8 h-8 rounded-md flex items-center justify-center text-faint hover:text-muted hover:bg-surface2 transition-colors"><LogOut className="w-3.5 h-3.5" /></button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">

            {/* Profile card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className="bg-accent rounded-2xl overflow-hidden shadow-lg relative"
            >
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
              <div className="relative px-6 pt-7 pb-6">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-semibold mb-4 shadow-sm">
                  {initials}
                </div>
                <h2 className="text-white font-serif text-xl font-normal leading-tight">{displayName}</h2>
                <p className="text-white/70 text-sm mt-0.5">{cohortName ?? "Studente"}</p>
                <p className="text-white/50 text-xs mt-0.5 truncate">{email}</p>

                {/* Big progress circle */}
                <div className="mt-5 flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="-rotate-90 w-16 h-16">
                      <circle cx="32" cy="32" r="26" fill="none" strokeWidth="4" stroke="rgba(255,255,255,0.2)" />
                      <motion.circle
                        cx="32" cy="32" r="26" fill="none" strokeWidth="4"
                        stroke="white" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - overallPct / 100) }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">{overallPct}%</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Completamento</p>
                    <p className="text-white/60 text-xs mt-0.5">{totalCompleted} di {totalSubtopics} argomenti</p>
                    <p className="text-white/60 text-xs">{lessonsCompleted} di {CORSO.length} lezioni</p>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10">
                <div className="px-4 py-3 text-center">
                  <p className="text-white font-semibold text-lg">{totalCompleted}</p>
                  <p className="text-white/60 text-xs">Argomenti</p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-white font-semibold text-lg">{lessonsCompleted}</p>
                  <p className="text-white/60 text-xs">Lezioni</p>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.08 }}
              className="bg-surface rounded-2xl border border-[rgba(20,20,20,0.08)] shadow-card overflow-hidden"
            >
              <div className="px-5 py-3.5 border-b border-[rgba(20,20,20,0.06)] flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-accent" />
                <p className="text-xs font-semibold uppercase tracking-widest text-faint">Traguardi</p>
                {!loading && <span className="ml-auto text-xs text-faint">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>}
              </div>
              <div className="p-4 space-y-2.5">
                {ACHIEVEMENTS.map((a) => {
                  const unlocked = a.threshold(totalCompleted, completedByLesson);
                  return (
                    <div key={a.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${unlocked ? "bg-accent-soft/40" : "opacity-40"}`}>
                      <span className="text-xl w-8 text-center flex-shrink-0">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${unlocked ? "text-tx" : "text-muted"}`}>{a.label}</p>
                        <p className="text-xs text-faint truncate">{a.desc}</p>
                      </div>
                      {unlocked && <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">

            {/* Resume CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.04 }}
              className="bg-surface rounded-2xl border border-[rgba(20,20,20,0.08)] shadow-card p-6 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-faint uppercase tracking-wider mb-0.5">{hasStarted ? "Continua da" : "Inizia da"}</p>
                  <p className="text-sm font-semibold text-tx truncate">Lezione {activeLesson.number}: {activeLesson.title}</p>
                  <p className="text-xs text-muted truncate mt-0.5">{activeSubtopic.title}</p>
                </div>
              </div>
              <button
                onClick={onOpenCourse}
                className="flex-shrink-0 flex items-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-accent-deep transition-colors group shadow-sm"
              >
                {hasStarted ? "Riprendi" : "Inizia"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>

            {/* Lesson progress */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.08 }}
              className="bg-surface rounded-2xl border border-[rgba(20,20,20,0.08)] shadow-card overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[rgba(20,20,20,0.06)] flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <p className="text-xs font-semibold uppercase tracking-widest text-faint">Progresso lezioni</p>
              </div>
              <div className="p-5 space-y-5">
                {CORSO.map((lezione, i) => {
                  const done = completedByLesson[i];
                  const total = lezione.subtopics.length;
                  const pct = total > 0 ? done / total : 0;
                  const isActive = lezione.id === activeLesson.id;
                  return (
                    <button key={lezione.id} onClick={onOpenCourse} className="w-full text-left group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${pct === 1 ? "bg-accent text-white" : isActive ? "bg-accent-soft text-accent" : "bg-surface2 text-muted"}`}>
                            {lezione.number}
                          </span>
                          <span className={`text-sm font-medium group-hover:text-accent transition-colors ${isActive ? "text-accent" : "text-tx"}`}>
                            {lezione.title}
                          </span>
                        </div>
                        <span className="text-xs text-faint tabular-nums">{done}/{total}</span>
                      </div>
                      <div className="h-1.5 bg-surface2 rounded-full overflow-hidden ml-7">
                        <motion.div
                          className={`h-full rounded-full ${pct === 1 ? "bg-accent" : "bg-accent/60"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct * 100}%` }}
                          transition={{ duration: 0.7, delay: 0.1 * i + 0.2, ease: "easeOut" }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Suggested questions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.12 }}
              className="bg-surface rounded-2xl border border-[rgba(20,20,20,0.08)] shadow-card overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[rgba(20,20,20,0.06)] flex items-center gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <p className="text-xs font-semibold uppercase tracking-widest text-faint">Da esplorare oggi</p>
                <span className="ml-auto text-xs text-faint">Lezione {activeLesson.number} · {activeSubtopic.title}</span>
              </div>
              <div className="divide-y divide-[rgba(20,20,20,0.05)]">
                {suggestedQs.map((q, i) => (
                  <button
                    key={i}
                    onClick={onOpenCourse}
                    className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-surface2 transition-colors group"
                  >
                    <MessageCircle className="w-4 h-4 text-faint group-hover:text-accent transition-colors flex-shrink-0" />
                    <p className="text-sm text-muted group-hover:text-tx transition-colors flex-1 leading-snug">{q}</p>
                    <ArrowRight className="w-3.5 h-3.5 text-faint flex-shrink-0 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
