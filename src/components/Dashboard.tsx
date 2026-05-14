import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Settings, LogOut, Lock } from "lucide-react";
import { CORSO } from "../lib/courseData";
import { fetchMyEnrollment } from "../lib/api";
import type { Enrollment } from "../lib/types";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";

interface Props {
  displayName: string;
  email: string;
  userAvatar: string;
  onOpenCourse: () => void;
  onAdmin: () => void;
  onSignOut: () => void;
}

export function Dashboard({ displayName, email, userAvatar, onOpenCourse, onAdmin, onSignOut }: Props) {
  const initials = displayName.slice(0, 2).toUpperCase();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

  useEffect(() => {
    fetchMyEnrollment().then(setEnrollment).catch(() => {});
  }, []);

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

      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 space-y-10">

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <p className="text-2xs uppercase tracking-[0.1em] text-faint mb-2">Il tuo profilo</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-accent-soft text-accent flex items-center justify-center text-xl font-semibold tracking-wide">
              {initials}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-normal tracking-tight text-tx">Ciao, {displayName}</h1>
              <p className="text-sm text-muted mt-0.5">{email}</p>
            </div>
          </div>
        </motion.div>

        {/* Course card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.06 }}
          className="bg-surface rounded-xl border border-[rgba(20,20,20,0.08)] shadow-card overflow-hidden"
        >
          {/* Card header */}
          <div className="px-7 pt-7 pb-5 border-b border-[rgba(20,20,20,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xs uppercase tracking-[0.1em] text-faint mb-2">
                  {cohortName ? `${cohortName}` : "Corso disponibile"}
                </p>
                <h2 className="font-serif text-xl font-normal tracking-tight text-tx leading-snug">
                  {courseName}
                </h2>
                <p className="text-sm text-muted mt-1">
                  {CORSO.length} lezioni · {CORSO.flatMap(l => l.subtopics).length} argomenti
                </p>
              </div>
              <img src={LOGO} alt="" className="w-10 h-10 rounded-lg object-contain bg-tx p-1.5 flex-shrink-0" />
            </div>
          </div>

          {/* Lessons list */}
          <div className="divide-y divide-[rgba(20,20,20,0.05)]">
            {CORSO.map((lezione, i) => (
              <div key={lezione.id} className="flex items-center gap-4 px-7 py-3.5">
                <span className="w-6 h-6 rounded-full bg-surface2 flex items-center justify-center text-xs font-medium text-muted flex-shrink-0">
                  {lezione.number}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tx truncate">{lezione.title}</p>
                  <p className="text-xs text-faint mt-0.5 truncate">{lezione.focus}</p>
                </div>
                {i > 0 && <Lock className="w-3 h-3 text-faint flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-7 py-5 bg-surface2 border-t border-[rgba(20,20,20,0.06)]">
            <button
              onClick={onOpenCourse}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-deep transition-colors group"
            >
              Apri il corso
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="text-xs text-faint mt-2.5">Inizia dalla Lezione 1 e prosegui al tuo ritmo.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
