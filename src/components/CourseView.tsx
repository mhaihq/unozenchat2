import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronLeft, Menu, X, Settings, LogOut } from "lucide-react";
import { CORSO } from "../lib/courseData";
import type { Lezione, Subtopic } from "../lib/courseData";
import { LessonChat } from "./LessonChat";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";

interface Props {
  displayName: string;
  userAvatar: string;
  onAdmin: () => void;
  onSignOut: () => void;
  onBack: () => void;
}

export function CourseView({ displayName, userAvatar, onAdmin, onSignOut, onBack }: Props) {
  const [activeLezione, setActiveLezione] = useState<Lezione>(CORSO[0]);
  const [activeSubtopic, setActiveSubtopic] = useState<Subtopic>(CORSO[0].subtopics[0]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function toggleCompleted(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectLezione(lezione: Lezione) {
    setActiveLezione(lezione);
    setActiveSubtopic(lezione.subtopics[0]);
    setSidebarOpen(false);
  }

  function selectSubtopic(sub: Subtopic) {
    setActiveSubtopic(sub);
    setSidebarOpen(false);
  }

  const currentIndex = activeLezione.subtopics.findIndex((s) => s.id === activeSubtopic.id);
  const prevSubtopic = currentIndex > 0 ? activeLezione.subtopics[currentIndex - 1] : null;
  const nextSubtopic = currentIndex < activeLezione.subtopics.length - 1 ? activeLezione.subtopics[currentIndex + 1] : null;

  const totalSubtopics = CORSO.flatMap((l) => l.subtopics).length;
  const totalCompleted = CORSO.flatMap((l) => l.subtopics).filter((s) => completed.has(s.id)).length;
  const overallPct = Math.round((totalCompleted / totalSubtopics) * 100);
  const lessonCompleted = activeLezione.subtopics.filter((s) => completed.has(s.id)).length;
  const circumference = 2 * Math.PI * 14;

  const initials = displayName.slice(0, 2).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-[18px] pt-7 pb-0">
        <p className="text-2xs uppercase tracking-[0.1em] text-faint mb-1">Lezione {activeLezione.number}</p>
        <h2 className="text-base font-semibold text-tx mb-3.5" style={{ letterSpacing: '0.02em' }}>{activeLezione.title}</h2>

        {/* Progress bar */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex-1 h-[3px] rounded-full bg-surface2 overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${(lessonCompleted / activeLezione.subtopics.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-faint tabular-nums">{lessonCompleted}/{activeLezione.subtopics.length}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-[18px] pb-4 flex flex-col gap-0.5">
        {activeLezione.subtopics.map((sub, idx) => {
          const isActive = sub.id === activeSubtopic.id;
          const isDone = completed.has(sub.id);
          return (
            <button
              key={sub.id}
              onClick={() => selectSubtopic(sub)}
              className={`flex items-center gap-3 py-[11px] px-3 rounded-md text-left transition-all ${
                isActive
                  ? "bg-accent-soft border-l-2 border-accent pl-[10px] rounded-l-none"
                  : "hover:bg-surface2"
              }`}
            >
              <div className={`w-[22px] h-[22px] rounded-full flex-shrink-0 flex items-center justify-center border text-xs font-medium transition-all ${
                isDone
                  ? "bg-accent-soft border-accent-soft text-accent"
                  : isActive
                  ? "bg-accent border-accent text-white"
                  : "border-[rgba(20,20,20,0.16)] text-muted"
              }`}>
                {isDone
                  ? <Check className="w-2.5 h-2.5 stroke-[2]" />
                  : <span>{idx + 1}</span>
                }
              </div>
              <span className={`text-sm truncate ${
                isActive ? "text-accent-deep font-medium" : "text-muted"
              }`}>
                {sub.title}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="max-w-[1280px] mx-auto my-6 bg-surface rounded-xl border border-[rgba(20,20,20,0.08)] overflow-hidden shadow-card">

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-[14px] border-b border-[rgba(20,20,20,0.08)]">
          <div className="flex items-center gap-8">
            {/* Mobile menu */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="md:hidden text-muted hover:text-tx transition-colors"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Brand */}
            <button onClick={onBack} className="flex items-center gap-2 group">
              <ChevronLeft className="w-3.5 h-3.5 text-faint group-hover:text-muted transition-colors" />
              <img src={LOGO} alt="Unozen" className="h-6 w-auto object-contain" />
            </button>

            {/* Nav tabs */}
            <nav className="hidden md:flex gap-7">
              {CORSO.map((lezione) => {
                const isActive = lezione.id === activeLezione.id;
                return (
                  <button
                    key={lezione.id}
                    onClick={() => selectLezione(lezione)}
                    className={`relative text-sm py-[14px] -my-[14px] transition-colors ${
                      isActive ? "text-tx font-medium" : "text-faint hover:text-muted"
                    }`}
                  >
                    Lezione {lezione.number}
                    {isActive && (
                      <span className="absolute left-0 right-0 -bottom-px h-[1.5px] bg-tx" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Progress ring */}
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

            {/* User pill */}
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

          {/* Mobile overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="md:hidden absolute inset-0 bg-black/30 z-20"
              />
            )}
          </AnimatePresence>

          {/* Mobile drawer */}
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

          {/* Desktop sidebar */}
          <aside className="hidden md:block w-[248px] flex-shrink-0 border-r border-[rgba(20,20,20,0.08)]">
            <SidebarContent />
          </aside>

          {/* Main content */}
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
                {/* Eyebrow */}
                <p className="text-2xs uppercase text-faint mb-3">
                  Lezione {activeLezione.number} · {activeLezione.title}
                </p>

                {/* Title */}
                <h1 className="font-serif text-3xl font-normal leading-[1.1] mb-8">
                  {activeSubtopic.title}
                </h1>

                {/* Bullets */}
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

                {/* AI Chat */}
                <LessonChat subtopic={activeSubtopic} lezione={activeLezione} />

                {/* Footer nav */}
                <div className="flex items-center justify-between mt-8">
                  <button
                    onClick={() => toggleCompleted(activeSubtopic.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                      completed.has(activeSubtopic.id)
                        ? "bg-accent-soft text-accent border-accent-soft"
                        : "bg-surface text-muted border-[rgba(20,20,20,0.08)] hover:border-[rgba(20,20,20,0.16)]"
                    }`}
                  >
                    {completed.has(activeSubtopic.id)
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
                    <button
                      onClick={() => nextSubtopic && setActiveSubtopic(nextSubtopic)}
                      disabled={!nextSubtopic}
                      className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-deep disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Prossimo →
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
