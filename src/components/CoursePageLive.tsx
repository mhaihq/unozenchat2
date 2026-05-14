import { motion } from "motion/react";
import { CheckoutButton } from "./CheckoutButton";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";

const BG     = "#F2EEE3";
const NAVY   = "#1A1A1A";
const LIME   = "#C8E976";
const LIME_D = "#A8D14F";
const MUTED  = "#3A3A3A";
const FAINT  = "#7A7A7A";
const BORDER = "rgba(26,26,26,0.10)";
const WHITE  = "#ffffff";
const SURFACE2 = "#EAE5D6";

// Set after creating the Stripe product for the live course
const LIVE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_LIVE ?? "";

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export function CoursePageLive({ onLogin, onBack }: Props) {
  return (
    <div className="min-h-screen font-sans" style={{ background: BG, color: NAVY }}>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(242,238,227,0.92)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${BORDER}`, height: 64 }}
        className="flex items-center justify-between px-5 md:px-10">
        <img src={LOGO} alt="Unozen" style={{ height: 26, width: "auto", objectFit: "contain" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onBack} style={{ fontSize: 13, color: MUTED, background: "transparent", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
            ← Corsi
          </button>
          <button onClick={onLogin} style={{ fontSize: 14, fontWeight: 500, padding: "8px 20px", borderRadius: 999, border: "none", cursor: "pointer", background: LIME, color: NAVY, transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = LIME_D)} onMouseLeave={e => (e.currentTarget.style.background = LIME)}>
            Accedi
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 960, paddingTop: "clamp(6rem,14vw,10rem)", paddingBottom: "clamp(3rem,5vw,4rem)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT, fontFamily: "monospace", marginBottom: 16 }}>
              Dal vivo · Giugno 2026 · Max 30 posti
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}
              className="font-serif"
              style={{ fontSize: "clamp(2rem,5vw,3.8rem)", fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.03em", color: NAVY, marginBottom: 20 }}>
              AI per Psicologi<br /><em style={{ fontStyle: "italic", color: "#555" }}>Live</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.18 }}
              style={{ fontSize: 15, color: MUTED, lineHeight: 1.75, marginBottom: 32 }}>
              Sessioni in diretta in un gruppo ristretto. Interazione vera con il docente, esercitazioni pratiche e un AI tutor calibrato sulle registrazioni del tuo gruppo.
            </motion.p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {LIVE_PRICE_ID ? (
                <CheckoutButton priceId={LIVE_PRICE_ID} label="Prenota il posto — €497 →" />
              ) : (
                <button
                  onClick={onLogin}
                  style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 999, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Contattaci per iscriverti →
                </button>
              )}
            </div>
          </div>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
            style={{ background: WHITE, borderRadius: 18, border: `1px solid ${BORDER}`, padding: "clamp(24px,4vw,36px)", boxShadow: "0 8px 40px rgba(0,0,0,0.07)" }}>
            <div style={{ borderLeft: `3px solid ${LIME}`, paddingLeft: 16, marginBottom: 28 }}>
              <div className="font-serif" style={{ fontSize: 18, color: NAVY, lineHeight: 1.2, marginBottom: 6 }}>Prossima edizione</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: NAVY }}>Giugno 2026</div>
            </div>
            {[
              ["📅", "6 sessioni live", "Una a settimana, 2 ore ciascuna"],
              ["👥", "Max 30 partecipanti", "Gruppo ristretto, interazione vera"],
              ["🎥", "Registrazioni esclusive", "Accesso a vita alle sessioni del tuo gruppo"],
              ["🤖", "AI tutor personalizzato", "Calibrato sulle registrazioni delle TUE sessioni"],
              ["💬", "Community dedicata", "WhatsApp con il tuo gruppo + edizioni successive"],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex gap-4 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.6 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 13, color: MUTED }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 24, display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="font-serif" style={{ fontSize: 32, fontWeight: 500, color: NAVY }}>€497</span>
              <span style={{ fontSize: 13, color: FAINT }}>per persona · pagamento unico</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* What's included */}
      <section style={{ background: SURFACE2, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }} className="py-16 md:py-20">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 960 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT, fontFamily: "monospace", marginBottom: 14 }}>Cosa è incluso</p>
          <h2 className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, marginBottom: 40 }}>
            Tutto quello che porti <em style={{ fontStyle: "italic" }}>a casa.</em>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Sessioni live settimanali", desc: "6 sessioni da 2 ore con il docente. Fai domande, porta casi clinici reali, esercitati in gruppo." },
              { title: "Registrazioni delle sessioni", desc: "Accesso permanente alle registrazioni video del tuo gruppo — non di edizioni generiche." },
              { title: "AI tutor sul tuo materiale", desc: "L'AI tutor viene addestrato sulle trascrizioni delle TUE sessioni live. Risponde con i contenuti che hai davvero visto." },
              { title: "Stesso programma on-demand", desc: "Accesso completo ai 4 moduli video on-demand inclusi nel corso registrato." },
              { title: "Libreria prompt + Checklist GDPR", desc: "Template clinici pronti all'uso e checklist per l'uso etico e conforme dell'AI in studio." },
              { title: "Community dedicata al tuo gruppo", desc: "WhatsApp con i partecipanti della tua edizione — continui a crescere anche dopo le sessioni." },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                <div style={{ width: 28, height: 2, background: NAVY, borderRadius: 2, marginBottom: 16 }} />
                <h3 className="font-serif" style={{ fontSize: 18, fontWeight: 400, color: NAVY, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: NAVY, textAlign: "center", position: "relative", overflow: "hidden" }} className="px-5 md:px-10 py-20 md:py-28">
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: `radial-gradient(ellipse, rgba(200,233,118,0.15) 0%, transparent 65%)`, filter: "blur(50px)" }} />
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: LIME, color: NAVY, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: 999, padding: "6px 18px", marginBottom: 28, fontFamily: "monospace" }}>
            Posti limitati — Giugno 2026
          </div>
          <h2 className="font-serif" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", marginBottom: 16 }}>
            Impara l'AI <em style={{ fontStyle: "italic" }}>insieme.</em>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 36 }}>Solo 30 posti. Prima si prenota, prima si entra.</p>
          {LIVE_PRICE_ID ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CheckoutButton priceId={LIVE_PRICE_ID} label="Prenota il posto — €497 →" />
            </div>
          ) : (
            <a href="mailto:info@unozen.it"
              style={{ background: LIME, color: NAVY, textDecoration: "none", borderRadius: 999, padding: "15px 40px", fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 10 }}>
              Scrivici per iscriverti → info@unozen.it
            </a>
          )}
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", marginTop: 18 }}>
            Pagamento con bonifico? Scrivi a <strong style={{ color: "rgba(255,255,255,0.6)" }}>info@unozen.it</strong>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: NAVY, borderTop: "1px solid rgba(255,255,255,0.06)", color: "#fff" }} className="px-5 md:px-10 py-8">
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
          <img src={LOGO} alt="Unozen" style={{ height: 22, filter: "brightness(10)", opacity: 0.4 }} />
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
            © 2026 Unozen.ai &nbsp;·&nbsp; <a href="mailto:info@unozen.it" style={{ color: "rgba(255,255,255,0.4)" }}>info@unozen.it</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
