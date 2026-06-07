import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";

const BG      = "#F2EEE3";
const NAVY    = "#1A1A1A";
const LIME    = "#C8E976";
const LIME_D  = "#A8D14F";
const MUTED   = "#3A3A3A";
const FAINT   = "#7A7A7A";
const BORDER  = "rgba(26,26,26,0.10)";
const WHITE   = "#ffffff";
const SURFACE2 = "#EAE5D6";

const CHAT_MSGS = [
  { role: "user", text: "Qual è la differenza tra ChatGPT e un modello fine-tuned?" },
  { role: "ai",   text: "ChatGPT è un modello base addestrato su dati generici. Un modello fine-tuned viene addestrato su dati specifici — come le note cliniche di uno studio. Il risultato è un modello che \"parla il tuo linguaggio\"." },
  { role: "user", text: "E quando mi conviene usare l'uno piuttosto che l'altro?" },
  { role: "ai",   text: "Per comunicazioni con pazienti, ChatGPT con un buon prompt spesso basta. Per applicazioni strutturate — triage automatico, screening — il fine-tuning dà risultati notevolmente migliori." },
];

// Timings (ms): how long each message is revealed before next appears
const MSG_DELAYS = [600, 2200, 4800, 6800];
// After last message, wait this long then switch to voice
const VOICE_DELAY = 9600;
// Total loop duration
const LOOP_MS = 14000;

function TutorDemo() {
  const [phase, setPhase] = useState<"chat" | "voice">("chat");
  const [visibleCount, setVisibleCount] = useState(0);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startLoop = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    setPhase("chat");
    setVisibleCount(0);

    MSG_DELAYS.forEach((delay, i) => {
      timerRefs.current.push(setTimeout(() => setVisibleCount(i + 1), delay));
    });
    timerRefs.current.push(setTimeout(() => setPhase("voice"), VOICE_DELAY));
    timerRefs.current.push(setTimeout(startLoop, LOOP_MS));
  };

  useEffect(() => {
    startLoop();
    return () => timerRefs.current.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ position: "relative", height: 420 }}>
      <AnimatePresence mode="wait">
        {phase === "chat" ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45 }}
            style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>

            {/* Chat header */}
            <div style={{ background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: LIME, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>AI Tutor</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: LIME, display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Online · Risponde subito</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 14, flex: 1, overflowY: "auto" }}>
              <AnimatePresence>
                {CHAT_MSGS.slice(0, visibleCount).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "82%", padding: "10px 14px",
                      borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: msg.role === "user" ? LIME : "rgba(255,255,255,0.09)",
                      color: msg.role === "user" ? NAVY : "rgba(255,255,255,0.85)",
                      fontSize: 13, lineHeight: 1.6,
                    }}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {/* Typing indicator while AI message is pending */}
              <AnimatePresence>
                {(visibleCount === 0 || (visibleCount % 2 === 1 && visibleCount < CHAT_MSGS.length)) && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{ background: "rgba(255,255,255,0.09)", borderRadius: "14px 14px 14px 4px", padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
                      {[0, 1, 2].map(d => (
                        <motion.span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)", display: "inline-block" }}
                          animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: d * 0.15 }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input bar */}
            <div style={{ margin: "8px 20px 20px", background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", flex: 1 }}>Fai una domanda sul corso…</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: LIME, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              </div>
            </div>
          </motion.div>

        ) : (
          <motion.div
            key="voice"
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>

            {/* Orb */}
            <div style={{ position: "relative", width: 160, height: 160, marginBottom: 28 }}>
              {/* Outermost pulse ring */}
              <motion.div
                style={{ position: "absolute", inset: -20, borderRadius: "50%", border: `1px solid ${LIME}`, opacity: 0 }}
                animate={{ scale: [1, 1.35], opacity: [0.18, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
              {/* Middle pulse ring */}
              <motion.div
                style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `1px solid ${LIME}`, opacity: 0 }}
                animate={{ scale: [1, 1.2], opacity: [0.28, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.3 }} />
              {/* Orb core */}
              <motion.div
                style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 38% 36%, rgba(200,233,118,0.95) 0%, rgba(168,209,79,0.85) 45%, rgba(26,26,26,0.9) 100%)`, boxShadow: `0 0 60px rgba(200,233,118,0.35), 0 0 120px rgba(200,233,118,0.15)` }}
                animate={{ scale: [1, 1.04, 0.98, 1.03, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
                {/* Sound wave bars inside orb */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  {[0.6, 1, 0.75, 1, 0.5, 0.85, 0.6].map((amp, i) => (
                    <motion.div key={i}
                      style={{ width: 3, borderRadius: 4, background: NAVY, opacity: 0.6 }}
                      animate={{ height: [8 * amp, 28 * amp, 12 * amp, 22 * amp, 8 * amp] }}
                      transition={{ duration: 0.9 + i * 0.08, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }} />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Label */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Modalità vocale attiva</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <motion.span style={{ width: 6, height: 6, borderRadius: "50%", background: LIME, display: "inline-block" }}
                  animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>In ascolto…</span>
              </div>
            </div>

            {/* Transcript snippet */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              style={{ marginTop: 28, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 18px", maxWidth: 300, textAlign: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontStyle: "italic", lineHeight: 1.6 }}>
                "Puoi spiegarmi come usare il fine-tuning per le note cliniche?"
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Props {
  onLogin: () => void;
  onCourseOndemand: () => void;
  onCourseLive: () => void;
  onCourseAiLiteracy: () => void;
}

export function HomePage({ onLogin, onCourseOndemand, onCourseLive, onCourseAiLiteracy }: Props) {
  return (
    <div className="min-h-screen font-sans" style={{ background: BG, color: NAVY }}>

      {/* AI Act value bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 51, background: NAVY, color: "rgba(255,255,255,0.92)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        className="flex items-center justify-center px-5 md:px-10 text-center" >
        <p style={{ fontSize: 12, lineHeight: 1.35, fontWeight: 500, padding: "7px 0" }}>
          <span style={{ color: LIME, fontWeight: 700 }}>Conforme all'AI Act</span> · formazione pensata per chi lavora nella salute.
        </p>
      </div>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 34, left: 0, right: 0, zIndex: 50, background: "rgba(242,238,227,0.92)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${BORDER}`, height: 64 }}
        className="flex items-center justify-between px-5 md:px-10">
        <img src={LOGO} alt="Unozen" style={{ height: 26, width: "auto", objectFit: "contain" }} />

        {/* Links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Corsi", href: "#corsi" },
            { label: "AI Tutor", href: "#ai-tutor" },
            { label: "Recensioni", href: "#recensioni" },
            { label: "Chi siamo", href: "#chi-siamo" },
          ].map(({ label, href }) => (
            <a key={href} href={href}
              style={{ fontSize: 13, fontWeight: 500, color: MUTED, textDecoration: "none", padding: "6px 14px", borderRadius: 999, transition: "background 0.15s, color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = SURFACE2; e.currentTarget.style.color = NAVY; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = MUTED; }}>
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onLogin}
            style={{ fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 999, border: `1px solid ${BORDER}`, cursor: "pointer", background: "transparent", color: MUTED, transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = SURFACE2)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            Accedi
          </button>
          <a href="#corsi"
            style={{ fontSize: 13, fontWeight: 600, padding: "8px 20px", borderRadius: 999, border: "none", cursor: "pointer", background: LIME, color: NAVY, transition: "background 0.15s", display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = LIME_D)} onMouseLeave={e => (e.currentTarget.style.background = LIME)}>
            Scopri i corsi <span>→</span>
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 960, paddingTop: "clamp(6rem,14vw,10rem)", paddingBottom: "clamp(3rem,6vw,5rem)", textAlign: "center" }}>
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT, fontFamily: "monospace", marginBottom: 20 }}>
            Unozen.ai — Formazione AI per professionisti
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}
            className="font-serif"
            style={{ fontSize: "clamp(2.4rem,6vw,5rem)", fontWeight: 500, lineHeight: 1.06, letterSpacing: "-0.03em", color: NAVY, marginBottom: 20 }}>
            Intelligenza <em style={{ fontStyle: "italic", fontWeight: 400 }}>artificiale</em><br />
            per professionisti della salute.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.18 }}
            style={{ fontSize: "clamp(15px,2vw,17px)", color: MUTED, lineHeight: 1.65, maxWidth: "56ch", margin: "0 auto 36px" }}>
            Fatta da clinici che usano questi strumenti ogni giorno.<br className="hidden sm:block" />
            Pratica, conforme all'AI Act, con AI Tutor incluso.
          </motion.p>

          {/* Video */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
            style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 60px rgba(26,26,26,0.12)", border: `1px solid ${BORDER}`, marginBottom: 40 }}>
            {/* @ts-ignore */}
            <wistia-player media-id="0obed6jcc6" aspect="1.7777777777777777" style={{ display: "block", width: "100%" }} />
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.44 }}
            className="grid grid-cols-1 sm:grid-cols-3"
            style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${BORDER}`, background: WHITE, boxShadow: "0 2px 20px rgba(0,0,0,0.05)", textAlign: "left" }}>
            {[
              { value: "4.9 / 5", label: "Valutazione media", sub: "Basata su oltre 200 iscritti" },
              { value: "200+",    label: "Professionisti formati", sub: "Psicologi, operatori sanitari, insegnanti" },
              { value: "100%",    label: "Conforme GDPR", sub: "Dati elaborati in Europa · AI in italiano" },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: "24px 28px",
                borderRight: i < 2 ? `1px solid ${BORDER}` : "none",
                borderTop: i > 0 ? `1px solid ${BORDER}` : "none",
                background: i === 1 ? SURFACE2 : WHITE,
              }} className={i > 0 ? "sm:border-t-0" : ""}>
                <div className="font-serif" style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)", fontWeight: 500, color: NAVY, lineHeight: 1, marginBottom: 6 }}>{stat.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 11, color: FAINT, fontFamily: "monospace", lineHeight: 1.5 }}>{stat.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CORSI ── */}
      <section id="corsi" style={{ background: SURFACE2, borderBottom: `1px solid ${BORDER}` }} className="py-16 md:py-20">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 1040 }}>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: FAINT, fontFamily: "monospace" }}>I nostri corsi</span>
              <h2 className="font-serif" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.025em", color: NAVY, marginTop: 10 }}>
                I <em style={{ fontStyle: "italic", fontWeight: 400 }}>corsi.</em>
              </h2>
            </div>
            <p style={{ fontSize: 13, color: FAINT, fontFamily: "monospace" }}>3 percorsi · due obiettivi</p>
          </motion.div>

          <div className="flex flex-col gap-5 md:gap-6">
            {[
              {
                dark: false,
                accent: "linear-gradient(180deg, #E89968 0%, #D97B4A 100%)",
                eyebrow: "Conformità",
                eyebrowColor: "#C25E32",
                badge: "Conforme Art. 4",
                badgeStyle: { background: "rgba(217,123,74,0.12)", border: "1px solid rgba(217,123,74,0.3)", color: "#C25E32" },
                title: "AI Literacy & AI Act",
                desc: "Una base solida e documentabile per usare l'AI con competenza nella tua professione. Attestato incluso. Aperto a tutti gli operatori sanitari, non solo agli psicologi. ECM in accreditamento.",
                tags: ["8 ore", "Operatori sanitari", "Attestato", "ECM in arrivo"],
                metaLabel: "Obbligo Art. 4",
                metaValue: "8 ore",
                cta: { label: "Scopri il corso", onClick: onCourseAiLiteracy, variant: "dark" as const },
              },
              {
                dark: false,
                accent: "linear-gradient(180deg, #E89968 0%, #CFC9E8 100%)",
                eyebrow: "On-demand",
                eyebrowColor: FAINT,
                badge: "4 moduli · 16 ore",
                badgeStyle: { background: SURFACE2, border: `1px solid ${BORDER}`, color: MUTED },
                title: "AI per Psicologi · On-demand",
                desc: "Guarda quando vuoi. AI tutor incluso 24/7. Esercitazioni vocali, community privata e libreria di prompt clinici. Accesso 12 mesi.",
                tags: ["AI Tutor 24/7", "Chat & voce", "16 ore video", "Community", "Prompt clinici"],
                priceOld: "€420",
                priceNew: "€297",
                cta: { label: "Scopri il corso", onClick: onCourseOndemand, variant: "lime" as const },
              },
              {
                dark: true,
                accent: `linear-gradient(180deg, ${LIME} 0%, #A8D14F 100%)`,
                eyebrow: "Dal vivo",
                eyebrowColor: "rgba(255,255,255,0.35)",
                badge: "Posti limitati",
                badgeStyle: { background: "rgba(200,233,118,0.15)", border: "1px solid rgba(200,233,118,0.3)", color: LIME },
                title: "AI per Psicologi · Live",
                desc: "Sessioni dal vivo in gruppo ristretto (max 30 partecipanti). Interazione diretta, registrazioni esclusive e AI tutor calibrato sulle tue sessioni.",
                tags: ["Sessioni live", "Max 30 posti", "Registrazioni", "AI Tutor", "Gruppo ristretto"],
                metaLabel: "Prossima edizione",
                metaValue: "Giugno 2026",
                cta: { label: "Scopri il corso", onClick: onCourseLive, variant: "lime" as const },
              },
            ].map((c, i) => {
              const txMain = c.dark ? "#fff" : NAVY;
              const txBody = c.dark ? "rgba(255,255,255,0.65)" : MUTED;
              const txFaint = c.dark ? "rgba(255,255,255,0.4)" : FAINT;
              const divider = c.dark ? "1px solid rgba(255,255,255,0.12)" : `1px solid ${BORDER}`;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                  style={{
                    background: c.dark ? NAVY : WHITE,
                    borderRadius: 20,
                    border: c.dark ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${BORDER}`,
                    overflow: "hidden",
                    boxShadow: c.dark ? "0 4px 24px rgba(0,0,0,0.18)" : "0 4px 24px rgba(0,0,0,0.06)",
                  }}
                  className="flex flex-col md:flex-row">

                  {/* Accent rail (left on desktop, top on mobile) */}
                  <div style={{ background: c.accent }} className="h-2 md:h-auto md:w-2 flex-shrink-0" />

                  {/* Main content */}
                  <div style={{ padding: "clamp(22px,3.2vw,34px)" }} className="flex-1 flex flex-col">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: c.eyebrowColor, fontFamily: "monospace" }}>{c.eyebrow}</span>
                      <span style={{ ...c.badgeStyle, borderRadius: 999, fontSize: 11, fontFamily: "monospace", padding: "3px 10px" }}>{c.badge}</span>
                    </div>
                    <h3 className="font-serif" style={{ fontSize: "clamp(1.4rem,2.6vw,1.9rem)", fontWeight: 400, lineHeight: 1.12, letterSpacing: "-0.02em", color: txMain, marginBottom: 12 }}>
                      {c.title}
                    </h3>
                    <p style={{ fontSize: 14, color: txBody, lineHeight: 1.7, marginBottom: 18, maxWidth: "62ch" }}>
                      {c.desc}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                      {c.tags.map(tag => (
                        <span key={tag} style={{
                          background: c.dark ? "rgba(255,255,255,0.07)" : SURFACE2,
                          border: c.dark ? "1px solid rgba(255,255,255,0.12)" : `1px solid ${BORDER}`,
                          color: c.dark ? "rgba(255,255,255,0.55)" : MUTED,
                          borderRadius: 999, fontSize: 11, padding: "3px 10px", fontFamily: "monospace",
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Price / CTA panel (right on desktop, bottom on mobile) */}
                  <div style={{
                    borderTop: divider,
                    padding: "clamp(22px,3.2vw,34px)",
                    background: c.dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                  }}
                    className="md:border-t-0 md:border-l flex flex-row md:flex-col items-center md:items-start justify-between gap-4 md:justify-center md:w-56 flex-shrink-0">
                    <div className="md:mb-2">
                      {c.priceNew ? (
                        <div className="flex items-baseline gap-2 md:flex-col md:items-start md:gap-0">
                          {c.priceOld && <span style={{ fontSize: 12, textDecoration: "line-through", color: txFaint, fontFamily: "monospace" }}>{c.priceOld}</span>}
                          <span className="font-serif" style={{ fontSize: 30, fontWeight: 500, color: txMain, lineHeight: 1 }}>{c.priceNew}</span>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 11, color: txFaint, fontFamily: "monospace", marginBottom: 3 }}>{c.metaLabel}</div>
                          <span className="font-serif" style={{ fontSize: 22, fontWeight: 400, color: txMain, lineHeight: 1 }}>{c.metaValue}</span>
                        </div>
                      )}
                    </div>
                    {c.cta.href ? (
                      <a href={c.cta.href}
                        style={{
                          background: c.cta.variant === "lime" ? LIME : NAVY, color: c.cta.variant === "lime" ? NAVY : "#fff",
                          border: "none", borderRadius: 999, padding: "11px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                          transition: "opacity 0.15s, background 0.15s", display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", whiteSpace: "nowrap",
                        }}
                        className="md:w-full md:justify-center"
                        onMouseEnter={e => { if (c.cta.variant === "lime") e.currentTarget.style.background = LIME_D; else e.currentTarget.style.opacity = "0.85"; }}
                        onMouseLeave={e => { if (c.cta.variant === "lime") e.currentTarget.style.background = LIME; else e.currentTarget.style.opacity = "1"; }}>
                        {c.cta.label} <span>→</span>
                      </a>
                    ) : c.cta.variant === "dark" ? (
                      <button onClick={c.cta.onClick}
                        style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 999, padding: "11px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "opacity 0.15s", display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}
                        className="md:w-full md:justify-center"
                        onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                        {c.cta.label} <span>→</span>
                      </button>
                    ) : (
                      <button onClick={c.cta.onClick}
                        style={{ background: LIME, color: NAVY, border: "none", borderRadius: 999, padding: "11px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.15s", display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}
                        className="md:w-full md:justify-center"
                        onMouseEnter={e => (e.currentTarget.style.background = LIME_D)} onMouseLeave={e => (e.currentTarget.style.background = LIME)}>
                        {c.cta.label} <span>→</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Tutor section */}
      <section id="ai-tutor" style={{ background: NAVY, position: "relative", overflow: "hidden" }} className="py-16 md:py-24">
        <div style={{ position: "absolute", top: "40%", left: "30%", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(200,233,118,0.10) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div className="relative mx-auto px-5 md:px-10" style={{ maxWidth: 960, zIndex: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* Left — text */}
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: LIME, fontFamily: "monospace", display: "inline-block", marginBottom: 20 }}>AI Tutor — incluso per sempre</span>
              <h2 className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", marginBottom: 20 }}>
                Il tuo tutor personale.<br /><em style={{ fontStyle: "italic", color: LIME }}>Sempre disponibile.</em>
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, marginBottom: 36 }}>
                Non è un chatbot generico. È addestrato sui contenuti del corso — video, trascrizioni, materiali — e risponde ai tuoi dubbi specifici in italiano, 24 ore su 24, per sempre.
              </p>
              <div className="flex flex-col gap-0">
                {[
                  ["Chat e voce", "Scrivi o parla direttamente — risponde in modo naturale"],
                  ["Calibrato sul tuo livello", "Principiante, intermedio o esperto: adatta il linguaggio"],
                  ["Risponde 24/7", "Nessuna attesa. Nessun orario di ricevimento"],
                  ["Incluso per sempre", "Non scade con il corso — continua ad usarlo anche dopo"],
                ].map(([title, desc], i) => (
                  <div key={i} className="flex gap-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: LIME, flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — animated chat → voice orb */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.12 }}>
              <TutorDemo />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Recensioni */}
      <section id="recensioni" style={{ background: BG }} className="py-20 md:py-28 overflow-hidden">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 1080 }}>

          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: FAINT, fontFamily: "monospace" }}>Recensioni verificate</span>
              <h2 className="font-serif" style={{ fontSize: "clamp(2rem,4.5vw,3.2rem)", fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.025em", color: NAVY, marginTop: 12 }}>
                Cosa dicono i<br /><em style={{ fontStyle: "italic", fontWeight: 400 }}>partecipanti.</em>
              </h2>
            </div>
            {/* Stars summary pill */}
            <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
              style={{ display: "flex", alignItems: "center", gap: 16, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "16px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", flexShrink: 0, alignSelf: "flex-start" }}>
              <div style={{ textAlign: "center" }}>
                <div className="font-serif" style={{ fontSize: 36, fontWeight: 500, color: NAVY, lineHeight: 1 }}>4.9</div>
                <div style={{ fontSize: 11, color: FAINT, marginTop: 4, fontFamily: "monospace" }}>su 5</div>
              </div>
              <div style={{ width: 1, height: 40, background: BORDER }} />
              <div>
                <div style={{ fontSize: 12, color: FAINT }}>200+ professionisti</div>
              </div>
            </motion.div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {[
              { featured: true,  text: "Usavo ChatGPT, Claude, Perplexity, Gemini e Notebook LM — ma nella mia mente si era creato il caos. Matteo mi ha aiutato a mettere ordine. Finalmente so cosa uso e perché.", author: "Delia Duccoli", role: "Psicologa e Docente universitaria" },
              { featured: false, text: "Ho imparato cose che da sola avrei fatto molta fatica a mettere insieme. La cosa più bella è che mi ha acceso ancora di più la curiosità. Si sente la competenza e la chiarezza con cui riesce a portare temi complessi.", author: "Iliana Sardi", role: "Psicologa" },
              { featured: false, text: "Ho apprezzato la chiarezza espositiva, l'approccio pratico e interattivo senza rinunciare alla qualità del contenuto. Ho consigliato caldamente il corso ai colleghi del gruppo di lavoro dell'Ordine.", author: "Monica Viganò", role: "Psicologa, Ordine degli Psicologi" },
              { featured: false, text: "Ho apprezzato particolarmente il taglio pratico, la qualità dei materiali e la guida attenta e competente di Matteo — uno strumento concretamente spendibile nel lavoro quotidiano.", author: "Daniela Iacopini", role: "Professionista" },
              { featured: true,  text: "Corso molto valido per merito del bravissimo Matteo, che con passione, capacità professionale e dedizione mi ha permesso di familiarizzare con l'intelligenza artificiale. Esperienza ottima sotto qualsiasi punto di vista.", author: "Patrizia Stella", role: "Psicologa" },
              { featured: false, text: "Spiegazioni chiare e accessibili, strumenti concreti per sperimentare l'AI in modo più ampio e consapevole. Molto utile poter accedere alle registrazioni rispettando i propri ritmi.", author: "Barbara", role: "Studio Pizzagalli" },
              { featured: false, text: "Mi avvicinavo al tema dell'AI per la prima volta. Nonostante questo sono riuscito a seguire bene e ho appreso molte cose, sia teoriche che pratiche. Le prime prove che ho fatto sono state soddisfacenti.", author: "Damiano Suzzi", role: "Professionista" },
              { featured: false, text: "Il corso è stato davvero interessante e utile. Si vede che Matteo ha tanta confidenza con le varie AI — e riesce a trasmetterla. Ho già consigliato il corso a diversi colleghi.", author: "Lucia Canestrari", role: "Psicologa" },
              { featured: false, text: "Ringrazio moltissimo Matteo per la disponibilità! Apprezzo i video dove mostra nel concreto come si fanno le cose. Il corso l'ho trovato molto utile — vuole solo che tu voglia davvero imparare.", author: "Simona Sartori", role: "Professionista" },
            ].map((r, i) => {
              const initials = r.author.split(" ").slice(0, 2).map((w: string) => w[0]).join("");
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.45, delay: (i % 3) * 0.09 }}
                  style={{
                    borderRadius: 20,
                    padding: "28px 26px",
                    display: "flex",
                    flexDirection: "column",
                    ...(r.featured
                      ? { background: NAVY, border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 12px 48px rgba(0,0,0,0.22)" }
                      : { background: WHITE, border: `1px solid ${BORDER}`, boxShadow: "0 2px 20px rgba(0,0,0,0.05)" }
                    ),
                  }}>

                  {/* Top: quote mark */}
                  <div style={{ marginBottom: 16 }}>
                    <div className="font-serif" style={{ fontSize: 52, lineHeight: 0.75, color: r.featured ? LIME : SURFACE2, fontWeight: 700, userSelect: "none" }}>"</div>
                  </div>

                  {/* Quote text */}
                  <p className="font-serif" style={{ fontSize: 15, lineHeight: 1.74, flex: 1, marginBottom: 24, fontStyle: "italic", color: r.featured ? "rgba(255,255,255,0.82)" : MUTED }}>
                    {r.text}
                  </p>

                  {/* Author */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 18, borderTop: r.featured ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${BORDER}` }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.04em",
                      background: r.featured ? LIME : SURFACE2,
                      color: r.featured ? NAVY : MUTED,
                    }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2, color: r.featured ? "#fff" : NAVY }}>{r.author}</div>
                      <div style={{ fontSize: 12, marginTop: 2, color: r.featured ? "rgba(255,255,255,0.38)" : FAINT }}>{r.role}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chi siamo */}
      <section id="chi-siamo" style={{ background: WHITE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }} className="py-16 md:py-24">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 720 }}>
          <div>

            {/* Text */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT, fontFamily: "monospace", display: "inline-block", border: `1px solid ${BORDER}`, borderRadius: 999, padding: "4px 12px", marginBottom: 24 }}>Chi siamo</span>
              <h2 className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, marginBottom: 36 }}>
                Costruita da clinici,<br />per <em style={{ fontStyle: "italic", fontWeight: 400 }}>clinici.</em>
              </h2>

              <div className="flex flex-col gap-6">
                {[
                  {
                    name: "Alessandro Lombardo",
                    bio: "Co-fondatore Unozen. Psicologo e Psicoterapeuta. Ho fondato la più grande comunità di apprendimento per psicologi in Italia. Lavoro come psicoterapeuta a Torino.",
                  },
                  {
                    name: "Matteo Grassi",
                    bio: "Co-fondatore Unozen. Laureato in Psicologia. Sviluppo progetti AI nella sanità digitale. Vivo tra Irlanda e Italia dove implemento soluzioni con enti governativi e privati.",
                  },
                ].map((person) => (
                  <div key={person.name} className="flex gap-4">
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: LIME, flexShrink: 0, marginTop: 5 }} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: NAVY, marginBottom: 6 }}>{person.name}</div>
                      <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{person.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* B2B / Enterprise */}
      <section id="b2b" style={{ background: NAVY, position: "relative", overflow: "hidden" }} className="py-16 md:py-24">
        <div style={{ position: "absolute", top: "30%", right: "20%", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(200,233,118,0.08) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div className="relative mx-auto px-5 md:px-10" style={{ maxWidth: 960, zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div style={{ maxWidth: "60ch" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: LIME, fontFamily: "monospace", display: "inline-block", marginBottom: 18 }}>Per le strutture</span>
              <h2 className="font-serif" style={{ fontSize: "clamp(1.6rem,3.5vw,2.6rem)", fontWeight: 400, lineHeight: 1.12, letterSpacing: "-0.02em", color: "#fff", marginBottom: 16 }}>
                Sei una struttura sanitaria<br />o uno studio <em style={{ fontStyle: "italic", color: LIME }}>associato?</em>
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
                Acquista licenze per il tuo team. Formazione conforme all'AI Act, attestati per ogni operatore e gestione centralizzata degli accessi.
              </p>
            </div>
            <a href="mailto:info@unozen.it?subject=Licenze%20team%20%E2%80%94%20Unozen"
              style={{ background: LIME, color: NAVY, border: "none", borderRadius: 999, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "background 0.15s", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}
              onMouseEnter={e => (e.currentTarget.style.background = LIME_D)} onMouseLeave={e => (e.currentTarget.style.background = LIME)}>
              Contattaci <span>→</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, background: BG }} className="px-5 md:px-10 py-8">
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
          <img src={LOGO} alt="Unozen" style={{ height: 22, width: "auto", objectFit: "contain", opacity: 0.5 }} />
          <div style={{ fontSize: 12, color: FAINT, fontFamily: "monospace" }}>
            © 2026 Unozen.ai &nbsp;·&nbsp; <a href="mailto:info@unozen.it" style={{ color: FAINT }}>info@unozen.it</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
