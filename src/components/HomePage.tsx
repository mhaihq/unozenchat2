import { motion } from "motion/react";

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

interface Props {
  onLogin: () => void;
  onCourseOndemand: () => void;
  onCourseLive: () => void;
}

export function HomePage({ onLogin, onCourseOndemand, onCourseLive }: Props) {
  return (
    <div className="min-h-screen font-sans" style={{ background: BG, color: NAVY }}>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(242,238,227,0.92)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${BORDER}`, height: 64 }}
        className="flex items-center justify-between px-5 md:px-10">
        <img src={LOGO} alt="Unozen" style={{ height: 26, width: "auto", objectFit: "contain" }} />
        <button onClick={onLogin}
          style={{ fontSize: 14, fontWeight: 500, padding: "8px 20px", borderRadius: 999, border: "none", cursor: "pointer", background: LIME, color: NAVY, transition: "background 0.15s", display: "inline-flex", alignItems: "center", gap: 6 }}
          onMouseEnter={e => (e.currentTarget.style.background = LIME_D)} onMouseLeave={e => (e.currentTarget.style.background = LIME)}>
          Accedi <span>→</span>
        </button>
      </nav>

      {/* Hero */}
      <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 960, paddingTop: "clamp(6rem,14vw,10rem)", paddingBottom: "clamp(2rem,4vw,3rem)", textAlign: "center" }}>
        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT, fontFamily: "monospace", marginBottom: 20 }}>
          Unozen.ai — Formazione AI per professionisti
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}
          className="font-serif"
          style={{ fontSize: "clamp(2.4rem,6vw,5rem)", fontWeight: 500, lineHeight: 1.06, letterSpacing: "-0.03em", color: NAVY, marginBottom: 20 }}>
          Intelligenza <em style={{ fontStyle: "italic", fontWeight: 400 }}>Artificiale.</em><br />
          Spiegata semplice.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.18 }}
          style={{ fontSize: "clamp(15px,2vw,17px)", color: MUTED, lineHeight: 1.65, maxWidth: "52ch", margin: "0 auto" }}>
          Scegli il formato che fa per te — on-demand al tuo ritmo,<br className="hidden sm:block" />
          o dal vivo con un gruppo ristretto.
        </motion.p>
      </div>

      {/* Hero video */}
      <div className="mx-auto px-5 md:px-10 pb-10 md:pb-14" style={{ maxWidth: 960 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
          style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 60px rgba(26,26,26,0.12)", border: `1px solid ${BORDER}` }}>
          {/* @ts-ignore */}
          <wistia-player media-id="0obed6jcc6" aspect="1.7777777777777777" style={{ display: "block", width: "100%" }} />
        </motion.div>
      </div>

      {/* Two course cards */}
      <div className="mx-auto px-5 md:px-10 pb-20 md:pb-28" style={{ maxWidth: 960 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">

          {/* On-demand card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
            style={{ background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
            {/* Card top band */}
            <div style={{ background: "linear-gradient(135deg, #E89968 0%, #CFC9E8 100%)", height: 8 }} />
            <div style={{ padding: "clamp(24px,4vw,36px)", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT, fontFamily: "monospace" }}>On-demand</span>
                <span style={{ background: SURFACE2, borderRadius: 999, fontSize: 11, fontFamily: "monospace", padding: "3px 10px", color: MUTED }}>4 moduli · 16 ore</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, marginBottom: 14 }}>
                AI per Psicologi<br /><em style={{ fontStyle: "italic" }}>On-demand</em>
              </h2>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 24, flex: 1 }}>
                Guarda quando vuoi. AI tutor incluso 24/7. Esercitazioni vocali, community privata e libreria di prompt clinici. Accesso 12 mesi.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
                {["AI Tutor 24/7", "Chat & voce", "16 ore video", "Community", "Prompt clinici"].map(tag => (
                  <span key={tag} style={{ background: SURFACE2, border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 999, fontSize: 11, padding: "3px 10px", fontFamily: "monospace" }}>{tag}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
                <div>
                  <span style={{ fontSize: 12, textDecoration: "line-through", color: FAINT, fontFamily: "monospace" }}>€420</span>
                  <span className="font-serif" style={{ fontSize: 28, fontWeight: 500, color: NAVY, marginLeft: 8, lineHeight: 1 }}>€297</span>
                </div>
                <button
                  onClick={onCourseOndemand}
                  style={{ background: LIME, color: NAVY, border: "none", borderRadius: 999, padding: "11px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.15s", display: "inline-flex", alignItems: "center", gap: 7 }}
                  onMouseEnter={e => (e.currentTarget.style.background = LIME_D)} onMouseLeave={e => (e.currentTarget.style.background = LIME)}>
                  Scopri il corso <span>→</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Live card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            style={{ background: NAVY, borderRadius: 20, border: `1px solid rgba(255,255,255,0.08)`, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column" }}>
            <div style={{ background: `linear-gradient(135deg, ${LIME} 0%, #A8D14F 100%)`, height: 8 }} />
            <div style={{ padding: "clamp(24px,4vw,36px)", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>Dal vivo</span>
                <span style={{ background: "rgba(200,233,118,0.15)", borderRadius: 999, fontSize: 11, fontFamily: "monospace", padding: "3px 10px", color: LIME, border: "1px solid rgba(200,233,118,0.3)" }}>Posti limitati</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", marginBottom: 14 }}>
                AI per Psicologi<br /><em style={{ fontStyle: "italic", color: LIME }}>Live</em>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 24, flex: 1 }}>
                Sessioni dal vivo in gruppo ristretto (max 30 partecipanti). Interazione diretta, registrazioni esclusive e AI tutor calibrato sulle tue sessioni.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
                {["Sessioni live", "Max 30 posti", "Registrazioni", "AI Tutor", "Gruppo ristretto"].map(tag => (
                  <span key={tag} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", borderRadius: 999, fontSize: 11, padding: "3px 10px", fontFamily: "monospace" }}>{tag}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginBottom: 2 }}>Prossima edizione</div>
                  <span className="font-serif" style={{ fontSize: 22, fontWeight: 400, color: "#fff", lineHeight: 1 }}>Giugno 2026</span>
                </div>
                <button
                  onClick={onCourseLive}
                  style={{ background: LIME, color: NAVY, border: "none", borderRadius: 999, padding: "11px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.15s", display: "inline-flex", alignItems: "center", gap: 7 }}
                  onMouseEnter={e => (e.currentTarget.style.background = LIME_D)} onMouseLeave={e => (e.currentTarget.style.background = LIME)}>
                  Scopri il corso <span>→</span>
                </button>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-10"
          style={{ fontSize: 13, color: FAINT }}>
          <span>⭐⭐⭐⭐⭐ &nbsp;4.9/5 — oltre 200 professionisti formati</span>
          <span style={{ color: BORDER }}>|</span>
          <span>Conforme GDPR · Dati in Europa</span>
          <span style={{ color: BORDER }}>|</span>
          <span>AI tutor in italiano</span>
        </motion.div>
      </div>

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
