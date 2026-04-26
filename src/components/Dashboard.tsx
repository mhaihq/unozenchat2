import { motion } from "motion/react";
import { ArrowRight, Settings, LogOut, Lock } from "lucide-react";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";
import { CORSO } from "../lib/courseData";

interface Props {
  displayName: string;
  email: string;
  userAvatar: string;
  onOpenCourse: () => void;
  onAdmin: () => void;
  onSignOut: () => void;
}

export function Dashboard({ displayName, email, userAvatar, onOpenCourse, onAdmin, onSignOut }: Props) {
  return (
    <div className="min-h-screen bg-grey-100 font-sans">

      {/* Top bar */}
      <header className="h-14 bg-white border-b border-grey-200 flex items-center px-6 gap-4">
        <div className="flex items-center gap-2.5 flex-1">
          <img src={LOGO} alt="AI per Psicologi" className="h-7 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <img src={userAvatar} className="w-6 h-6 rounded-full border border-grey-200" alt="" />
          <span className="text-xs text-grey-600 hidden sm:block">{displayName}</span>
          <button onClick={onAdmin} title="Amministrazione" className="w-8 h-8 rounded-lg flex items-center justify-center text-grey-400 hover:text-grey-800 hover:bg-grey-100 transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button onClick={onSignOut} title="Esci" className="w-8 h-8 rounded-lg flex items-center justify-center text-grey-400 hover:text-grey-800 hover:bg-grey-100 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 space-y-10">

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-grey-400 mb-2">Il tuo profilo</p>
          <div className="flex items-center gap-4">
            <img src={userAvatar} className="w-14 h-14 rounded-2xl border border-grey-200 shadow-sm" alt="" />
            <div>
              <h1 className="text-2xl font-bold text-grey-950 tracking-tight">Ciao, {displayName}</h1>
              <p className="text-sm text-grey-500 mt-0.5">{email}</p>
            </div>
          </div>
        </motion.div>

        {/* Course card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.06 }}
          className="bg-white rounded-2xl border border-grey-200 shadow-sm overflow-hidden"
        >
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-grey-150">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-grey-400 mb-2">Corso disponibile</p>
                <h2 className="text-xl font-bold text-grey-950 tracking-tight leading-snug">
                  AI per Psicologi
                </h2>
                <p className="text-sm text-grey-500 mt-1">
                  {CORSO.length} lezioni · {CORSO.flatMap(l => l.subtopics).length} argomenti
                </p>
              </div>
              <img src={LOGO} alt="" className="w-12 h-12 rounded-xl object-contain bg-grey-950 p-2 flex-shrink-0" />
            </div>
          </div>

          {/* Lessons list */}
          <div className="divide-y divide-grey-100">
            {CORSO.map((lezione, i) => (
              <div key={lezione.id} className="flex items-center gap-4 px-8 py-4">
                <span className="w-7 h-7 rounded-full bg-grey-100 border border-grey-200 flex items-center justify-center text-[11px] font-bold text-grey-500 flex-shrink-0">
                  {lezione.number}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-grey-800 truncate">{lezione.title}</p>
                  <p className="text-xs text-grey-400 mt-0.5 truncate">{lezione.focus}</p>
                </div>
                {i > 0 && <Lock className="w-3.5 h-3.5 text-grey-300 flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-8 py-6 bg-grey-50 border-t border-grey-150">
            <button
              onClick={onOpenCourse}
              className="flex items-center gap-2.5 px-6 py-3 bg-grey-950 text-white text-sm font-semibold rounded-xl hover:bg-grey-800 transition-colors shadow-sm group"
            >
              Apri il corso
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="text-xs text-grey-400 mt-3">Inizia dalla Lezione 1 e prosegui al tuo ritmo.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
