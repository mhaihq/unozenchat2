import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckSquare, Square, ChevronRight, BookOpen, LogOut, Settings, CheckCircle2, Menu, X } from "lucide-react";
import { CORSO } from "../lib/courseData";
import type { Lezione, Subtopic } from "../lib/courseData";
import { LessonChat } from "./LessonChat";

interface Props {
  displayName: string;
  userAvatar: string;
  onAdmin: () => void;
  onSignOut: () => void;
}

export function CourseView({ displayName, userAvatar, onAdmin, onSignOut }: Props) {
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 flex-shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-grey-500 px-2 mb-1">
          Lezione {activeLezione.number}
        </p>
        <p className="text-xs font-medium text-grey-800 px-2 leading-snug">{activeLezione.title}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {activeLezione.subtopics.map((sub, idx) => {
          const isActive = sub.id === activeSubtopic.id;
          const isDone = completed.has(sub.id);
          return (
            <button
              key={sub.id}
              onClick={() => selectSubtopic(sub)}
              className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? "bg-primary-100 text-primary-300"
                  : "text-grey-800 hover:bg-grey-100"
              }`}
            >
              <button
                onClick={(e) => { e.stopPropagation(); toggleCompleted(sub.id); }}
                className={`mt-0.5 flex-shrink-0 transition-colors ${
                  isDone ? "text-green-500" : isActive ? "text-blue-300" : "text-grey-400 group-hover:text-grey-600"
                }`}
              >
                {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <span className={`block text-xs font-medium leading-snug ${isDone && !isActive ? "line-through text-grey-500" : ""}`}>
                  <span className={`text-[11px] mr-1 ${isActive ? "text-blue-400" : "text-grey-400"}`}>{idx + 1}.</span>
                  {sub.title}
                </span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary-300" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-grey-200 px-5 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-grey-500">Progresso</span>
          <span className="text-[11px] font-bold text-grey-800 tabular-nums">
            {lessonCompleted}/{activeLezione.subtopics.length}
          </span>
        </div>
        <div className="h-1.5 bg-grey-150 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-300 rounded-full"
            animate={{ width: `${(lessonCompleted / activeLezione.subtopics.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-grey-100 font-sans overflow-hidden">

      {/* Header */}
      <header className="flex-shrink-0 flex items-center h-14 px-4 md:px-6 bg-white border-b border-grey-200 gap-3 md:gap-6">

        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-grey-600 hover:bg-grey-100 transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary-300 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="hidden sm:block text-sm font-semibold text-grey-950 tracking-tight">AI per Psicologi</span>
        </div>

        {/* Lesson tabs — hidden on mobile, shown md+ */}
        <nav className="hidden md:flex flex-1 items-center gap-1 overflow-x-auto">
          {CORSO.map((lezione) => {
            const isActive = lezione.id === activeLezione.id;
            const done = lezione.subtopics.every((s) => completed.has(s.id));
            return (
              <button
                key={lezione.id}
                onClick={() => selectLezione(lezione)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary-100 text-primary-300"
                    : "text-grey-700 hover:bg-grey-100 hover:text-grey-950"
                }`}
              >
                {done && <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-primary-300" : "text-green-500"}`} />}
                <span>Lezione {lezione.number}</span>
                <span className={`hidden lg:inline text-xs ${isActive ? "text-blue-400" : "text-grey-500"}`}>
                  — {lezione.title}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Mobile: current lesson label */}
        <div className="flex-1 md:hidden min-w-0">
          <p className="text-sm font-semibold text-grey-950 truncate">Lezione {activeLezione.number}</p>
          <p className="text-xs text-grey-500 truncate">{activeSubtopic.title}</p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-20 h-1.5 bg-grey-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-300 rounded-full"
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-xs text-grey-600 font-medium tabular-nums w-7">{overallPct}%</span>
          </div>

          <div className="hidden md:block w-px h-5 bg-grey-200" />

          <img src={userAvatar} className="w-6 h-6 rounded-full border border-grey-200" alt="" />
          <span className="hidden lg:block text-xs text-grey-700 font-medium">{displayName}</span>

          <button onClick={onAdmin} title="Amministrazione" className="w-8 h-8 rounded-lg flex items-center justify-center text-grey-500 hover:text-grey-900 hover:bg-grey-150 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={onSignOut} title="Esci" className="w-8 h-8 rounded-lg flex items-center justify-center text-grey-500 hover:text-grey-900 hover:bg-grey-150 transition-colors">
            <LogOut className="w-4 h-4" />
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
              className="md:hidden absolute inset-0 bg-grey-950/40 z-20"
            />
          )}
        </AnimatePresence>

        {/* Sidebar — fixed on mobile, static on md+ */}
        <AnimatePresence>
          {(sidebarOpen) && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="md:hidden absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-grey-200 z-30 shadow-lg"
            >
              <SidebarContent />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 flex-shrink-0 bg-white border-r border-grey-200 flex-col overflow-hidden">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubtopic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 space-y-5"
            >

              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-grey-500">
                <span>Lezione {activeLezione.number}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-grey-800 font-medium truncate">{activeSubtopic.title}</span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-grey-950 leading-tight tracking-tight">
                  {activeSubtopic.title}
                </h1>
                <p className="text-sm text-grey-500 mt-1">{activeLezione.title}</p>
              </div>

              {/* Bullets card */}
              <div className="bg-white rounded-xl border border-grey-200 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-grey-150">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-grey-500">Argomenti trattati</p>
                </div>
                <ul className="px-5 sm:px-6 py-5 space-y-4">
                  {activeSubtopic.bullets.map((bullet, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-300 flex-shrink-0" />
                      <span className="text-sm text-grey-800 leading-relaxed">{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* AI Chat */}
              <LessonChat subtopic={activeSubtopic} lezione={activeLezione} />

              {/* Footer nav */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-8">
                <button
                  onClick={() => toggleCompleted(activeSubtopic.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    completed.has(activeSubtopic.id)
                      ? "bg-green-100 text-green-600 border-green-200"
                      : "bg-white text-grey-800 border-grey-200 hover:border-grey-300 hover:bg-grey-100"
                  }`}
                >
                  {completed.has(activeSubtopic.id)
                    ? <><CheckSquare className="w-4 h-4" /> Completato</>
                    : <><Square className="w-4 h-4" /> Segna come completato</>
                  }
                </button>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => prevSubtopic && setActiveSubtopic(prevSubtopic)}
                    disabled={!prevSubtopic}
                    className="px-4 py-2.5 text-sm font-medium text-grey-600 hover:text-grey-950 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Precedente
                  </button>
                  <button
                    onClick={() => nextSubtopic && setActiveSubtopic(nextSubtopic)}
                    disabled={!nextSubtopic}
                    className="px-5 py-2.5 text-sm font-semibold bg-primary-300 text-white rounded-lg hover:bg-primary-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
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
