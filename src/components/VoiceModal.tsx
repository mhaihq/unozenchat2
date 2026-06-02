import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useRealtimeVoice } from "../hooks/useRealtimeVoice";
import type { VoiceState } from "../hooks/useRealtimeVoice";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
}

const STATUS: Record<VoiceState, string> = {
  idle:       "Inizializzazione…",
  connecting: "Connessione in corso…",
  listening:  "In ascolto…",
  speaking:   "Zen sta rispondendo…",
  error:      "Errore di connessione. Riprova.",
};

const ORB_VARIANTS: Record<VoiceState, object> = {
  idle:       { scale: 1,    opacity: 0.4 },
  connecting: { scale: 1,    opacity: 0.5 },
  listening:  { scale: [1, 1.08, 1], opacity: 0.7 },
  speaking:   { scale: [1, 1.18, 0.96, 1.12, 1], opacity: 1 },
  error:      { scale: 1,    opacity: 0.3 },
};

const ORB_TRANSITION: Record<VoiceState, object> = {
  idle:       { duration: 2, repeat: Infinity, ease: "easeInOut" },
  connecting: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  listening:  { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
  speaking:   { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  error:      { duration: 2, repeat: Infinity, ease: "easeInOut" },
};

export function VoiceModal({ isOpen, onClose, systemPrompt }: Props) {
  const { state, connect, disconnect } = useRealtimeVoice();

  useEffect(() => {
    if (isOpen) {
      connect(systemPrompt);
    } else {
      disconnect();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    disconnect();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-sm mx-4 bg-surface rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-faint hover:text-tx hover:bg-surface2 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center px-8 py-12 gap-8">

              {/* Orb */}
              <div className="relative flex items-center justify-center">
                {/* Outer ring */}
                <motion.div
                  className="absolute rounded-full border border-accent/20"
                  animate={state === "speaking" ? { scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] } : { scale: 1, opacity: 0 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
                  style={{ width: 160, height: 160 }}
                />
                {/* Mid ring */}
                <motion.div
                  className="absolute rounded-full border border-accent/30"
                  animate={state === "listening" || state === "speaking"
                    ? { scale: [1, 1.2, 1], opacity: [0.4, 0.1, 0.4] }
                    : { scale: 1, opacity: 0.1 }
                  }
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: 120, height: 120 }}
                />
                {/* Core orb */}
                <motion.div
                  className="rounded-full bg-accent"
                  animate={ORB_VARIANTS[state]}
                  transition={ORB_TRANSITION[state]}
                  style={{ width: 80, height: 80 }}
                />
              </div>

              {/* Status */}
              <p className="text-sm font-medium text-muted text-center">{STATUS[state]}</p>

              {/* Stop button */}
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-full border border-[rgba(20,20,20,0.12)] text-sm text-muted hover:text-tx hover:border-[rgba(20,20,20,0.24)] transition-colors"
              >
                Termina conversazione
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
