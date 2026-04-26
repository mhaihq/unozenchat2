import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Square, ChevronRight, LogOut, Settings, Check, Menu, X, ChevronLeft } from "lucide-react";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";
import { CORSO } from "../lib/courseData";
import type { Lezione, Subtopic } from "../lib/courseData";
import { LessonChat } from "./LessonChat";

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
  const lessonPct = Math.round((lessonCompleted / activeLezione.subtopics.length) * 100);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Lesson label */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-grey-400 mb-1">
          Lezione {activeLezione.number}
        </p>
        <p className="text-sm font-semibold text-grey-950 leading-snug">{activeLezione.title}</p>

        {/* Mini progress bar */}
        <div className="mt-3 h-0.5 bg-grey-150 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-300 rounded-full"
            animate={{ width: `${lessonPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-[11px] text-grey-400 mt-1.5 tabular-nums">
          {lessonCompleted} di {activeLezione.subtopics.length} completati
        </p>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-grey-150" />

      {/* Subtopics */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-px">
        {activeLezione.subtopics.map((sub, idx) => {
          const isActive = sub.id === activeSubtopic.id;
          const isDone = completed.has(sub.id);
          return (
            <button
              key={sub.id}
              onClick={() => selectSubtopic(sub)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? "bg-grey-950 text-white"
                  : "text-grey-700 hover:bg-grey-100 hover:text-grey-950"
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleCompleted(sub.id); }}
                className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
                  isDone
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "border-grey-500 hover:border-white"
                    : "border-grey-300 group-hover:border-grey-400"
                }`}
              >
                {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </button>

              <span className={`text-xs leading-snug flex-1 min-w-0 truncate ${
                isDone && !isActive ? "text-grey-400 line-through" : ""
              }`}>
                <span className={`mr-1 ${isActive ? "text-grey-400" : "text-grey-400"}`}>{idx + 1}.</span>
                {sub.title}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-grey-100 font-sans overflow-hidden">

      {/* Top nav */}
      <header className="flex-shrink-0 h-13 flex items-stretch bg-white border-b border-grey-200 px-0">
        <div className="flex items-center gap-3 px-4 border-r border-grey-150 flex-shrink-0">
          {/* Mobile menu */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="md:hidden w-7 h-7 rounded flex items-center justify-center text-grey-500 hover:text-grey-900 hover:bg-grey-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Back + Logo */}
          <button onClick={onBack} className="flex items-center gap-2 group">
            <ChevronLeft className="w-3.5 h-3.5 text-grey-400 group-hover:text-grey-700 transition-colors" />
            <img src={LOGO} alt="AI per Psicologi" className="h-7 w-auto object-contain" />
          </button>
        </div>

        {/* Lesson tabs — underline style */}
        <nav className="hidden md:flex flex-1 items-stretch overflow-x-auto">
          {CORSO.map((lezione) => {
            const isActive = lezione.id === activeLezione.id;
            const done = lezione.subtopics.every((s) => completed.has(s.id));
            return (
              <button
                key={lezione.id}
                onClick={() => selectLezione(lezione)}
                className={`relative flex items-center gap-2 px-5 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? "text-grey-950 border-grey-950"
                    : "text-grey-500 border-transparent hover:text-grey-800 hover:border-grey-300"
                }`}
              >
                {done && (
                  <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </span>
                )}
                Lezione {lezione.number}
              </button>
            );
          })}
        </nav>

        {/* Mobile: current context */}
        <div className="flex-1 md:hidden flex items-center px-4 min-w-0">
          <span className="text-sm font-medium text-grey-700 truncate">Lezione {activeLezione.number} · {activeSubtopic.title}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 px-4 border-l border-grey-150 flex-shrink-0">
          {/* Overall progress */}
          <div className="hidden md:flex items-center gap-2.5 mr-2">
            <div className="relative w-6 h-6">
              <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" fill="none" stroke="#e4e4e4" strokeWidth="2.5" />
                <circle
                  cx="12" cy="12" r="9" fill="none"
                  stroke="#2463eb" strokeWidth="2.5"
                  strokeDasharray={`${2 * Math.PI * 9}`}
                  strokeDashoffset={`${2 * Math.PI * 9 * (1 - overallPct / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-grey-700 tabular-nums">{overallPct}%</span>
          </div>

          <img src={userAvatar} className="w-6 h-6 rounded-full border border-grey-200" alt="" />
          <span className="hidden lg:block text-xs text-grey-600 font-medium ml-1 mr-1">{displayName}</span>

          <button onClick={onAdmin} title="Amministrazione" className="w-8 h-8 rounded-lg flex items-center justify-center text-grey-400 hover:text-grey-800 hover:bg-grey-100 transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button onClick={onSignOut} title="Esci" className="w-8 h-8 rounded-lg flex items-center justify-center text-grey-400 hover:text-grey-800 hover:bg-grey-100 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute inset-0 bg-grey-950/50 z-20"
            />
          )}
        </AnimatePresence>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="md:hidden absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-grey-200 z-30 shadow-xl"
            >
              <SidebarContent />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-60 flex-shrink-0 bg-white border-r border-grey-200 flex-col overflow-hidden">
          <SidebarContent />
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubtopic.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="max-w-[680px] mx-auto px-5 sm:px-8 pt-8 pb-16 space-y-6"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-grey-400">
                <span>Lezione {activeLezione.number}</span>
                <span className="text-grey-300">·</span>
                <span>{activeLezione.title}</span>
              </div>

              {/* Title */}
              <h1 className="text-[26px] sm:text-[32px] font-bold text-grey-950 leading-[1.15] tracking-tight -mt-1">
                {activeSubtopic.title}
              </h1>

              {/* Bullets */}
              <ul className="space-y-3 pt-1">
                {activeSubtopic.bullets.map((bullet, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3.5"
                  >
                    <span className="mt-[9px] w-1 h-1 rounded-full bg-grey-400 flex-shrink-0" />
                    <span className="text-[15px] text-grey-700 leading-[1.65]">{bullet}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Divider */}
              <div className="border-t border-grey-150 pt-2" />

              {/* AI Chat */}
              <LessonChat subtopic={activeSubtopic} lezione={activeLezione} />

              {/* Footer nav */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => toggleCompleted(activeSubtopic.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    completed.has(activeSubtopic.id)
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-white text-grey-700 border-grey-200 hover:border-grey-300 hover:text-grey-950"
                  }`}
                >
                  {completed.has(activeSubtopic.id)
                    ? <><Check className="w-4 h-4" /> Completato</>
                    : <><Square className="w-4 h-4" /> Segna come completato</>
                  }
                </button>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => prevSubtopic && setActiveSubtopic(prevSubtopic)}
                    disabled={!prevSubtopic}
                    className="px-4 py-2.5 text-sm font-medium text-grey-500 hover:text-grey-900 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Precedente
                  </button>
                  <button
                    onClick={() => nextSubtopic && setActiveSubtopic(nextSubtopic)}
                    disabled={!nextSubtopic}
                    className="px-5 py-2.5 text-sm font-semibold bg-grey-950 text-white rounded-lg hover:bg-grey-800 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
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
  );
}
