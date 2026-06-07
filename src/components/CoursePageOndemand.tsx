import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CORSO } from "../lib/courseData";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";

/* ── Warm cream + dusty pastel palette ──────────────────────────────────── */
const NAVY    = "#1A1A1A";
const GREEN   = "#1A1A1A";        // primary buttons go to deep black
const LIME    = "#C8E976";        // signature highlight pill
const LIME_D  = "#A8D14F";
const BG      = "#F2EEE3";        // warm cream
const SURFACE2 = "#EAE5D6";       // slightly darker cream stripe
const WHITE   = "#ffffff";
const BORDER  = "rgba(26,26,26,0.10)";
const DASH    = "rgba(26,26,26,0.18)";
const TEXT    = "#1A1A1A";
const MUTED   = "#3A3A3A";
const FAINT   = "#7A7A7A";
const HERO_BG = "#F2EEE3";

/* Dusty pastel tile colors */
const TILE_LAVENDER   = "#CFC9E8";
const TILE_OLIVE      = "#B5B36B";
const TILE_TERRACOTTA = "#E89968";
const TILE_SAGE       = "#A8C49A";

const MODULE_GRADIENTS = [
  { from: TILE_TERRACOTTA, to: "#D88555", accent: "#5A2A12", tag: "Fondamenta" },
  { from: TILE_LAVENDER,   to: "#B8B0DE", accent: "#3C3489", tag: "Prompting"  },
  { from: TILE_OLIVE,      to: "#9C9A55", accent: "#3A3A1A", tag: "Strumenti"  },
  { from: TILE_SAGE,       to: "#8FB082", accent: "#2A4A1F", tag: "Ricerca"    },
];

// Stripe Price ID for the on-demand course — set this after creating the product in Stripe
const ONDEMAND_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ONDEMAND ?? "";
const ONDEMAND_COURSE_ID = "a1000000-0000-0000-0000-000000000001";

interface Props { onLogin: () => void; onBuy: (priceId: string, courseId: string) => void; onBack: () => void; }

const REVIEWS = [
  { text: "Ho imparato cose che da sola avrei fatto molta fatica a mettere insieme. Si sente la competenza e la chiarezza con cui riesce a portare temi complessi.", author: "Iliana Sardi", role: "Psicologa" },
  { text: "Ho apprezzato il taglio pratico, la qualità dei materiali e la guida attenta e competente — uno strumento concretamente spendibile nel lavoro quotidiano.", author: "Daniela Iacopini", role: "Professionista" },
  { text: "Corso molto valido. Con passione e capacità professionale mi ha permesso di familiarizzare con l'intelligenza artificiale.", author: "Patrizia Stella", role: "Psicologa" },
  { text: "Ho apprezzato la chiarezza espositiva e l'approccio pratico. Ho consigliato caldamente il corso ai colleghi del gruppo di lavoro dell'Ordine.", author: "Monica Viganò", role: "Psicologa, Ordine" },
  { text: "Usavo ChatGPT, Claude, Perplexity, Gemini — ma nella mia mente si era creato il caos. Matteo mi ha aiutato a mettere ordine. Finalmente so cosa uso e perché.", author: "Delia Duccoli", role: "Psicologa, Docente universitaria" },
  { text: "Mi avvicinavo al tema dell'AI per la prima volta. Nonostante questo sono riuscito a seguire bene e ho appreso molte cose, sia teoriche che pratiche.", author: "Damiano Suzzi", role: "Professionista" },
];

/* ── Corner plus (used only in bento benefits) ─────────────────────────── */
const PlusIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.2}
    style={{ position: "absolute", color: DASH, ...style }}>
    <path strokeLinecap="round" d="M12 6v12M6 12h12" />
  </svg>
);
const BentoCorners = () => (
  <>
    <PlusIcon style={{ top: -9, left: -9 }} />
    <PlusIcon style={{ top: -9, right: -9 }} />
    <PlusIcon style={{ bottom: -9, left: -9 }} />
    <PlusIcon style={{ bottom: -9, right: -9 }} />
  </>
);

/* ── Section label ──────────────────────────────────────────────────────── */
const SectionLabel = ({ n }: { n: string }) => (
  <div style={{ fontSize: 11, color: GREEN, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14, fontFamily: "monospace" }}>{n}</div>
);

/* ── Hero video — full-width below hero ── */
function HeroVideo() {
  return (
    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 60px rgba(26,26,26,0.12)", border: `1px solid ${BORDER}` }}>
      {/* @ts-ignore */}
      <wistia-player media-id="0obed6jcc6" aspect="1.7777777777777777" style={{ display: "block", width: "100%" }} />
    </div>
  );
}

/* ── Animated chat mock ─────────────────────────────────────────────────── */
function AnimatedChatMock() {
  const [chatMode, setChatMode] = useState<"text" | "voice">("text");
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [orbPulse, setOrbPulse] = useState(false);

  const messages = [
    { role: "user", text: "Come strutturo un prompt per analizzare un caso clinico?" },
    { role: "ai",   text: "Nel Modulo 2 vediamo l'anatomia: ruolo + contesto + dati + formato. Per un caso CBT ti consiglio il modello ABC. Vuoi un esempio?" },
    { role: "user", text: "Sì, fammi vedere" },
    { role: "ai",   text: "Ecco: «Sei un supervisore CBT. Applica il modello ABC — A = situazione, B = pensiero, C = emozione. Caso: [...]»" },
  ];

  // Open at the top regardless of the previous page's scroll position.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (chatMode !== "text") return;
    let cancelled = false;
    const cycle = () => {
      if (cancelled) return;
      setVisibleMessages(1); setIsTyping(false);
      let i = 1;
      const show = () => {
        if (cancelled) return;
        if (i >= messages.length) { setTimeout(cycle, 3200); return; }
        if (messages[i].role === "ai") {
          setIsTyping(true);
          setTimeout(() => { if (cancelled) return; setIsTyping(false); setVisibleMessages(i + 1); i++; setTimeout(show, 1400); }, 1600);
        } else { setVisibleMessages(i + 1); i++; setTimeout(show, 900); }
      };
      setTimeout(show, 800);
    };
    cycle();
    return () => { cancelled = true; };
  }, [chatMode]);

  useEffect(() => {
    if (chatMode !== "voice") return;
    const iv = setInterval(() => setOrbPulse(p => !p), 1200);
    return () => clearInterval(iv);
  }, [chatMode]);

  // SVG mic icon
  const MicIcon = ({ size = 14, color = MUTED }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  );

  return (
    <div style={{ background: WHITE, borderRadius: 16, boxShadow: "0 2px 24px rgba(10,15,30,0.08)", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `conic-gradient(from 200deg, ${TILE_TERRACOTTA}, ${TILE_LAVENDER}, ${TILE_OLIVE}, ${TILE_SAGE}, ${TILE_TERRACOTTA})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: "0.04em", boxShadow: "inset 0 0 8px rgba(0,0,0,0.15)" }}>UZ</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>AI Tutor · Unozen</div>
          <div style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />attivo ora
          </div>
        </div>
        {/* Mode toggle */}
        <div style={{ display: "flex", background: BG, borderRadius: 8, padding: 3, gap: 2, border: `1px solid ${BORDER}` }}>
          {(["text","voice"] as const).map(m => (
            <button key={m} onClick={() => setChatMode(m)} style={{
              padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
              background: chatMode === m ? WHITE : "transparent",
              color: chatMode === m ? (m === "voice" ? GREEN : TEXT) : MUTED,
              boxShadow: chatMode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.18s",
            }}>
              {m === "text" ? "Chat" : "Voce"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 18px 14px" }}>
        <AnimatePresence mode="wait">
          {chatMode === "text" ? (
            <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ minHeight: 200, display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {messages.slice(0, visibleMessages).map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    background: msg.role === "user" ? LIME : SURFACE2,
                    border: msg.role === "ai" ? `1px solid ${BORDER}` : "none",
                    borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                    padding: "9px 13px", fontSize: 13, color: TEXT,
                    maxWidth: "85%", lineHeight: 1.55,
                  }}>
                  {msg.text}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ display: "flex", gap: 4, padding: "10px 13px", borderRadius: "12px 12px 12px 3px", width: "fit-content", background: BG, border: `1px solid ${BORDER}` }}>
                  {[0, 0.18, 0.36].map((d, i) => (
                    <span key={i} className="animate-bounce" style={{ width: 4, height: 4, borderRadius: "50%", background: MUTED, display: "inline-block", animationDelay: `${d}s` }} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 14 }}>

              {/* Orb — clean, no emoji */}
              <div style={{ position: "relative", width: 96, height: 96 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i}
                    animate={{ scale: orbPulse ? 1 + i * 0.2 : 1 + i * 0.08, opacity: orbPulse ? 0.6 - i * 0.16 : 0.35 - i * 0.08 }}
                    transition={{ duration: 1.1, ease: "easeInOut" }}
                    style={{
                      position: "absolute", inset: -(i * 13), borderRadius: "50%",
                      background: `radial-gradient(circle, rgba(26,26,26,${0.10 - i * 0.025}) 0%, transparent 70%)`,
                      border: `1px solid rgba(26,26,26,${0.14 - i * 0.04})`,
                    }}
                  />
                ))}
                <motion.div
                  animate={{ scale: orbPulse ? 1.05 : 1 }}
                  transition={{ duration: 1.0, ease: "easeInOut" }}
                  style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: `linear-gradient(145deg, ${TILE_TERRACOTTA} 0%, ${TILE_LAVENDER} 50%, ${TILE_SAGE} 100%)`,
                    boxShadow: orbPulse ? `0 0 0 8px rgba(26,26,26,0.06), 0 8px 28px rgba(26,26,26,0.18)` : `0 4px 20px rgba(26,26,26,0.12)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "box-shadow 1.0s ease",
                  }}>
                  <MicIcon size={28} color="rgba(255,255,255,0.9)" />
                </motion.div>
              </div>

              {/* Status + waveform */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: GREEN, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>In ascolto</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 36 }}>
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div key={i}
                      animate={{ height: orbPulse ? 5 + Math.abs(Math.sin(i * 0.65)) * 22 + 4 : 3 + Math.abs(Math.sin(i * 0.5)) * 8 + 3 }}
                      transition={{ duration: 0.5, ease: "easeInOut", delay: i * 0.025 }}
                      style={{ width: 3, borderRadius: 3, background: TEXT, opacity: 0.7 }}
                    />
                  ))}
                </div>
              </div>

              <p style={{ fontSize: 13, color: MUTED, textAlign: "center", maxWidth: "24ch", lineHeight: 1.6 }}>
                Parla con l'AI tutor in italiano
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 8px 8px 14px" }}>
          <span style={{ fontSize: 13, color: FAINT, flex: 1 }}>{chatMode === "text" ? "Scrivi con l'AI…" : "Parla con l'AI…"}</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: chatMode === "voice" ? LIME : WHITE,
              border: chatMode === "voice" ? "none" : `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: chatMode === "voice" ? "0 2px 8px rgba(168,209,79,0.35)" : "none",
              transition: "all 0.2s",
            }}>
              <MicIcon size={13} color={chatMode === "voice" ? TEXT : MUTED} />
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: LIME, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(168,209,79,0.35)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.2" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
export function CoursePageOndemand({ onLogin, onBuy, onBack }: Props) {
  const totalSubtopics = CORSO.flatMap(l => l.subtopics).length;

  return (
    <div className="min-h-screen font-sans" style={{ background: BG, color: TEXT }}>

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(250,250,247,0.92)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${BORDER}`, height: 64 }}
        className="flex items-center justify-between px-5 md:px-10">
        <img src={LOGO} alt="Unozen" style={{ height: 26, width: "auto", objectFit: "contain" }} />
        <div className="hidden md:flex items-center gap-8">
          {[["#programma","Programma"],["#tutor","AI Tutor"],["#docente","Docente"],["#recensioni","Recensioni"]].map(([href, l]) => (
            <a key={href} href={href} style={{ fontSize: 14, color: MUTED, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT)} onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onBack} style={{ fontSize: 13, color: MUTED, background: "transparent", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
            ← Corsi
          </button>
          <button onClick={() => onBuy(ONDEMAND_PRICE_ID, ONDEMAND_COURSE_ID)} style={{ fontSize: 14, fontWeight: 600, padding: "8px 20px", borderRadius: 999, border: "none", cursor: "pointer", background: LIME, color: TEXT, transition: "background 0.15s", display: "inline-flex", alignItems: "center", gap: 6 }}
            onMouseEnter={e => (e.currentTarget.style.background = LIME_D)} onMouseLeave={e => (e.currentTarget.style.background = LIME)}>
            Acquista — €297 <span>→</span>
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <header style={{ background: BG, paddingTop: 64 }}>
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 1280, paddingTop: "clamp(2.5rem,6vw,5rem)", paddingBottom: "clamp(2rem,4vw,3rem)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20">

            {/* Left: heading only */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
              className="font-serif self-start"
              style={{ fontSize: "clamp(2.2rem,5.5vw,4.8rem)", fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.03em", color: TEXT, margin: 0 }}>
              Intelligenza <em style={{ fontStyle: "italic", fontWeight: 400 }}>Artificiale.</em><br />
              Spiegata semplice.
            </motion.h1>

            {/* Right: description + buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
              className="flex flex-col gap-6 md:gap-8">
              <p style={{ fontSize: "clamp(14px,1.8vw,16px)", color: MUTED, lineHeight: 1.65, marginBottom: 20 }}>
                Un corso on-demand con un AI tutor che risponde ai tuoi dubbi.<br className="hidden sm:block" />
                Esercitazioni vocali interattive e community privata.<br className="hidden sm:block" />
                Imparare l'AI <em>usando</em> l'AI.
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <button onClick={() => onBuy(ONDEMAND_PRICE_ID, ONDEMAND_COURSE_ID)}
                  style={{ background: LIME, color: TEXT, border: `1px solid ${TEXT}`, borderRadius: 999, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.15s", display: "inline-flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={e => (e.currentTarget.style.background = LIME_D)} onMouseLeave={e => (e.currentTarget.style.background = LIME)}>
                  Acquista il corso — €297 <span>→</span>
                </button>
                <button onClick={() => onBuy(ONDEMAND_PRICE_ID, ONDEMAND_COURSE_ID)}
                  style={{ background: "transparent", color: TEXT, border: `1px solid ${TEXT}`, borderRadius: 999, padding: "11px 22px", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(26,26,26,0.06)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  Vedi il programma
                </button>
                <div className="flex items-baseline gap-1.5">
                  <span style={{ fontSize: 12, textDecoration: "line-through", color: FAINT, fontFamily: "monospace" }}>€420</span>
                  <span className="font-serif" style={{ fontSize: 20, color: TEXT, lineHeight: 1, fontWeight: 500 }}>€297</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: FAINT, marginTop: -8 }}>Conforme GDPR · Dati in Europa · Anonimizzazione automatica</p>
            </motion.div>

          </div>
        </div>

        {/* Video full-width below hero columns */}
        <div className="mx-auto px-5 md:px-10 pb-10 md:pb-14" style={{ maxWidth: 1280 }}>
          <HeroVideo />
        </div>
      </header>

      {/* ── FORMAT BAR ───────────────────────────────────────────────────── */}
      <div className="px-5 md:px-10 pb-6" style={{ background: BG }}>
        <div className="mx-auto grid grid-cols-2 md:grid-cols-4 overflow-hidden rounded-2xl gap-px" style={{ maxWidth: 1000, background: "rgba(255,255,255,0.08)" }}>
          {[
            ["4", "moduli video", "16 ore on-demand"],
            ["24/7", "AI Tutor incluso", "Chat & voce in italiano"],
            ["↗", "Voce interattiva", "Parli davvero con l'AI"],
            ["∞", "Community privata", "WhatsApp con i partecipanti"],
          ].map(([icon, title, sub]) => (
            <div key={title} className="flex items-center gap-3 p-5 md:p-6" style={{ background: NAVY }}>
              <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: LIME, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: TEXT, fontWeight: 600 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHY ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto px-5 md:px-10 py-16 md:py-24" style={{ maxWidth: 1000 }}>
        <SectionLabel n="01 — Il contesto" />
        <div className="grid grid-cols-1 md:grid-cols-[5fr_4fr] gap-10 md:gap-16 items-start">
          <div>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, marginBottom: 28 }}>
              Perché conoscere<br /><em style={{ fontStyle: "italic", color: GREEN }}>l'AI</em>, davvero.
            </h2>
          </div>
          <blockquote style={{ borderLeft: `3px solid ${GREEN}`, paddingLeft: 24, paddingTop: 4 }}>
            <div style={{ fontSize: 44, lineHeight: 1, color: HERO_BG, fontFamily: "Georgia,serif", marginBottom: 4 }}>"</div>
            <p className="font-serif" style={{ fontSize: "clamp(15px,2vw,18px)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.65, color: NAVY, marginBottom: 16 }}>
              L'AI non sostituisce il tuo lavoro. Lo amplifica. La differenza la fa chi capisce come usarla — con metodo, etica e supervisione critica.
            </p>
            <cite style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: MUTED, fontFamily: "monospace", fontStyle: "normal" }}>— Premessa del corso</cite>
            <div className="flex gap-8 mt-8 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
              {[[String(CORSO.length), "moduli"], [String(totalSubtopics), "argomenti"], ["24/7", "AI tutor"]].map(([n, l]) => (
                <div key={l}>
                  <div className="font-serif" style={{ fontSize: 32, fontWeight: 300, color: GREEN, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </blockquote>
        </div>
      </section>

      {/* ── AI TUTOR ─────────────────────────────────────────────────────── */}
      <section id="tutor" style={{ background: SURFACE2, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }} className="py-16 md:py-24">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 1000 }}>
          <SectionLabel n="02 — La differenza" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="font-serif" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, marginBottom: 16 }}>
                Risposte al <em style={{ fontStyle: "italic", color: GREEN }}>tuo livello.</em><br />Sui tuoi dubbi.
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: MUTED, marginBottom: 28 }}>
                Ogni studente riceve un AI tutor personale, addestrato sui contenuti del corso. Risponde ai tuoi dubbi — non con risposte generiche.
              </p>
              <div className="flex flex-col">
                {[
                  ["Chat e voce", "Scrivi o parla direttamente in italiano"],
                  ["Risponde 24/7", "Non aspetti il prossimo modulo"],
                  ["Calibrato sul tuo livello", "Principiante, intermedio o esperto"],
                  ["Memoria del percorso", "Sa cosa hai già visto e cosa ti confonde"],
                ].map(([title, desc], i) => (
                  <div key={i} className="flex gap-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: 12, color: GREEN, fontWeight: 700, fontFamily: "monospace", flexShrink: 0, paddingTop: 2 }}>0{i+1}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 13, color: MUTED }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <AnimatedChatMock />
          </div>
        </div>
      </section>

      {/* ── PROGRAMMA ────────────────────────────────────────────────────── */}
      <section id="programma" className="mx-auto px-5 md:px-10 py-16 md:py-24" style={{ maxWidth: 1000 }}>
        <SectionLabel n="03 — Il programma" />
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 md:mb-10">
          <h2 className="font-serif" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY }}>
            {CORSO.length} moduli. <em style={{ fontStyle: "italic", color: GREEN }}>16 ore.</em>
          </h2>
          <p style={{ fontSize: 13, color: MUTED, maxWidth: "28ch", lineHeight: 1.6 }} className="sm:text-right">
            Ogni modulo include video, materiali e accesso all'AI tutor.
          </p>
        </div>
        {/* Mobile: 1 col stack. Tablet: 2 col. Desktop: alternating 4+2/2+4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {CORSO.map((lezione, i) => {
            const g = MODULE_GRADIENTS[i];
            const span = [4,2,2,4][i];
            const spanClass = span === 4 ? "lg:col-span-4" : "lg:col-span-2";
            return (
              <motion.div key={lezione.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.09 }}
                className={spanClass}
                style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: g.from, minHeight: 240 }}>
                <div style={{ padding: "24px", position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
                  <div className="flex items-start justify-between mb-4">
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: TEXT, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
                      {lezione.number}
                    </div>
                    <span style={{ fontSize: 10, color: TEXT, opacity: 0.6, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>{g.tag}</span>
                  </div>
                  <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: TEXT, lineHeight: 1.15, letterSpacing: "-0.01em", marginBottom: 10 }}>{lezione.title}</h3>
                  <p style={{ fontSize: 13, color: TEXT, opacity: 0.7, lineHeight: 1.55, marginBottom: 14 }}>{lezione.focus}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    {lezione.subtopics.map(sub => (
                      <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.07)", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: TEXT, lineHeight: 1.3 }}>
                        <span style={{ fontSize: 8, flexShrink: 0, opacity: 0.6 }}>▶</span>{sub.title}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <span style={{ fontSize: 11, background: TEXT, color: "#fff", borderRadius: 999, padding: "4px 12px", fontFamily: "monospace" }}>
                      {i === 0 ? "Disponibile ora" : `Modulo ${i+1}`}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", background: "linear-gradient(135deg, #1A1A1A 0%, #0F2A1A 50%, #1A2A0A 100%)", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", right: "20%", width: 600, height: 600, background: "radial-gradient(ellipse, rgba(200,233,118,0.12) 0%, transparent 65%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div className="relative mx-auto px-5 md:px-10 py-16 md:py-24" style={{ maxWidth: 1280, zIndex: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-12 lg:gap-24 items-start">

            {/* Left */}
            <div>
              <div style={{ fontSize: 11, color: LIME, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14, fontFamily: "monospace" }}>04 — Cosa è incluso</div>
              <h2 className="font-serif" style={{ fontSize: "clamp(2rem,4.5vw,3.6rem)", fontWeight: 400, lineHeight: 1.08, letterSpacing: "-0.02em", color: "#fff", marginBottom: 20 }}>
                Tutto quello che<br />porti a <em style={{ fontStyle: "italic", color: LIME }}>casa.</em>
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 32 }}>
                Un ecosistema completo pensato per continuare a crescere anche dopo il corso — non solo durante.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => onBuy(ONDEMAND_PRICE_ID, ONDEMAND_COURSE_ID)}
                  style={{ fontSize: 14, fontWeight: 600, padding: "11px 26px", borderRadius: 999, border: "none", cursor: "pointer", background: LIME, color: TEXT, transition: "background 0.15s", display: "inline-flex", alignItems: "center", gap: 8, width: "fit-content" }}
                  onMouseEnter={e => (e.currentTarget.style.background = LIME_D)} onMouseLeave={e => (e.currentTarget.style.background = LIME)}>
                  Inizia ora <span>→</span>
                </button>
                <button onClick={() => onBuy(ONDEMAND_PRICE_ID, ONDEMAND_COURSE_ID)}
                  style={{ fontSize: 14, fontWeight: 500, background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.75)", display: "inline-flex", alignItems: "center", gap: 6, transition: "color 0.15s", width: "fit-content", padding: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}>
                  Scopri il programma <span style={{ fontSize: 13 }}>›</span>
                </button>
              </div>
            </div>

            {/* Right 2×2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-12">
              {[
                { title: "AI Tutor 24/7", desc: "Chat e voce in italiano, calibrato sui contenuti del corso. Risponde ai tuoi dubbi specifici — non con risposte generiche." },
                { title: "12 mesi di accesso", desc: "Accedi alla piattaforma per un anno intero. Inclusa la community privata su WhatsApp." },
                { title: "16 ore on-demand", desc: "Video suddivisi in argomenti brevi. Guarda quando vuoi, quante volte vuoi, al tuo ritmo." },
                { title: "Libreria prompt + Checklist GDPR", desc: "Template clinici pronti all'uso e checklist di conformità per usare l'AI in studio in modo etico." },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                  <div style={{ width: 28, height: 2, background: LIME, borderRadius: 2, marginBottom: 18 }} />
                  <h3 className="font-serif" style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", fontWeight: 400, color: "#fff", lineHeight: 1.2, marginBottom: 10, letterSpacing: "-0.01em" }}>{item.title}</h3>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.75 }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── INSTRUCTOR ───────────────────────────────────────────────────── */}
      <section id="docente" style={{ background: BG, borderTop: `1px solid ${BORDER}` }} className="py-16 md:py-24">
        <div className="mx-auto px-5 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center" style={{ maxWidth: 1000 }}>
          <div>
            <div style={{ fontSize: 11, color: GREEN, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14, fontFamily: "monospace" }}>05 — Chi insegna</div>
            <h2 className="font-serif" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, marginBottom: 24 }}>
              Una <em style={{ fontStyle: "italic" }}>guida</em> che ha<br />attraversato il territorio.
            </h2>
            {[
              "Vivo e lavoro in Irlanda, mi sono laureato in Italia in Psicologia. Sono fondatore di Hana, una piattaforma di engagement vocale per il supporto dei pazienti, utilizzata in USA, UK ed Europa.",
              "Lavoro e sviluppo progetti in ambito AI da molti anni. Costruisco le stesse tecnologie che ti insegnerò ad usare.",
            ].map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: MUTED, marginBottom: 14 }}>{p}</p>)}
          </div>

          <div style={{ background: WHITE, borderRadius: 18, padding: "clamp(24px,4vw,36px)", boxShadow: "0 8px 48px rgba(0,0,0,0.10)", border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-4 mb-6">
              <img src="https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6935ed01e1dd66f3db9dad0d_Matteo%20Grassi.jpg"
                alt="Matteo Grassi"
                style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: `2px solid ${BORDER}`, flexShrink: 0 }} />
              <div>
                <h3 className="font-serif" style={{ fontSize: 24, fontWeight: 400, letterSpacing: "-0.02em", color: NAVY, marginBottom: 3, lineHeight: 1.1 }}>Matteo Grassi</h3>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: FAINT, fontFamily: "monospace" }}>Docente · Co-founder Unozen.ai</div>
              </div>
            </div>
            <p className="font-serif" style={{ fontSize: 15, lineHeight: 1.65, color: MUTED, marginBottom: 20 }}>
              Psicologo, fondatore, mentore. Vivo a Dublino, lavoro tra USA, UK ed Europa. Da anni progetto strumenti AI per professionisti della salute mentale.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Psicologia", "Voice AI", "Healthcare", "Startup mentor", "Open-source"].map(tag => (
                <span key={tag} style={{ background: SURFACE2, border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 999, fontSize: 12, padding: "4px 12px", fontFamily: "monospace" }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────────────── */}
      <section id="recensioni" className="mx-auto px-5 md:px-10 py-16 md:py-24" style={{ maxWidth: 1000 }}>
        <SectionLabel n="06 — Recensioni" />
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-10 md:mb-12">
          <h2 className="font-serif" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY }}>
            Cosa dicono i <em style={{ fontStyle: "italic", color: GREEN }}>partecipanti.</em>
          </h2>
          <p className="font-serif" style={{ fontSize: 15, fontStyle: "italic", color: MUTED }}>Recensioni vere, non inventate.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {REVIEWS.map((r, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
              style={{ background: WHITE, borderRadius: 14, padding: "24px 20px", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div className="font-serif" style={{ fontSize: 44, lineHeight: 1, color: SURFACE2, marginBottom: -4 }}>"</div>
              <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, flex: 1, marginBottom: 18 }}>{r.text}</p>
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{r.author}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{r.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section id="iscriviti" style={{ background: NAVY, position: "relative", overflow: "hidden", textAlign: "center" }} className="px-5 md:px-10 py-20 md:py-28">
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 500, background: `radial-gradient(ellipse, rgba(200,233,118,0.18) 0%, transparent 65%)`, filter: "blur(60px)" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: LIME, color: TEXT, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: 999, padding: "6px 18px", marginBottom: 28, fontFamily: "monospace" }}>
            Posti limitati
          </div>
          <h2 className="font-serif" style={{ fontSize: "clamp(2rem,5vw,4rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", marginBottom: 16 }}>
            Pronto a smettere di <em style={{ fontStyle: "italic" }}>improvvisare?</em>
          </h2>
          <p style={{ fontSize: "clamp(15px,2vw,17px)", color: "rgba(255,255,255,0.55)", marginBottom: 36 }}>Solo 30 posti per edizione.</p>
          <button onClick={() => onBuy(ONDEMAND_PRICE_ID, ONDEMAND_COURSE_ID)}
            style={{ background: LIME, color: TEXT, border: "none", borderRadius: 999, padding: "15px 40px", fontSize: 15, fontWeight: 500, cursor: "pointer", transition: "background 0.15s", display: "inline-flex", alignItems: "center", gap: 10 }}
            onMouseEnter={e => (e.currentTarget.style.background = LIME_D)} onMouseLeave={e => (e.currentTarget.style.background = LIME)}>
            Inizia il corso — €297 <span>→</span>
          </button>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 18 }}>
            Pagamento con bonifico? Scrivi a <strong style={{ color: "rgba(255,255,255,0.7)" }}>info@unozen.it</strong>
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: NAVY, color: "#fff", borderTop: "1px solid rgba(255,255,255,0.06)" }} className="px-5 md:px-10 pt-12 pb-8">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 pb-8 mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="col-span-2 md:col-span-1">
              <img src={LOGO} alt="Unozen" style={{ height: 26, width: "auto", objectFit: "contain", marginBottom: 12, filter: "brightness(10)" }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.65, maxWidth: "28ch" }}>L'ecosistema AI per i professionisti italiani della salute mentale.</p>
            </div>
            {[
              ["Corso", ["#programma:Programma","#tutor:AI Tutor","#docente:Docente","#iscriviti:Iscriviti"]],
              ["Unozen", ["#:Chi siamo","#:Contatti","#:Community","#:Corsi"]],
              ["Contatti", ["mailto:info@unozen.it:info@unozen.it","#:Privacy","#:Termini"]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.22)", marginBottom: 12, fontFamily: "monospace" }}>{title}</div>
                {(links as string[]).map(link => {
                  const [href, lbl] = link.split(":");
                  return (
                    <a key={lbl} href={href} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.42)", textDecoration: "none", padding: "3px 0", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}>{lbl}</a>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2" style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", fontFamily: "monospace" }}>
            <span>© 2026 Unozen.ai — Tutti i diritti riservati</span>
            <span>Edizione 4 · 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
