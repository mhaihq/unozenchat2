import { motion } from "motion/react";
import { useEffect, useState } from "react";

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
const TERRA  = "#C25E32";

// Waitlist destination — change if enterprise/info inbox differs.
const WAITLIST_EMAIL = "info@unozen.it";

const MODULES = [
  {
    n: 1, hours: "1h", title: "Capire l'intelligenza artificiale",
    desc: "Cosa sono davvero i modelli di linguaggio e gli strumenti generativi, come producono le risposte e dove finiscono le loro capacità. Un vocabolario chiaro per orientarti senza tecnicismi e senza miti.",
  },
  {
    n: 2, hours: "1h", title: "L'AI Act in parole semplici",
    desc: "Una lettura accessibile del regolamento europeo: a cosa serve, il principio di alfabetizzazione dell'Art. 4 e cosa significa concretamente per chi lavora nella salute. Niente burocrazia: solo ciò che ti è utile sapere.",
  },
  {
    n: 3, hours: "1.5h", title: "Limiti, errori e affidabilità",
    desc: "Allucinazioni, bias e fonti poco affidabili: come riconoscerli e verificarli. Imparerai quando l'AI è uno strumento valido e — altrettanto importante — quando è meglio non usarla.",
  },
  {
    n: 4, hours: "1.5h", title: "Privacy, GDPR e dati sanitari",
    desc: "Come trattare i dati con responsabilità: categorie particolari, dati dei pazienti, cosa non inserire mai negli strumenti AI e le pratiche di base per restare conforme al GDPR nella tua attività quotidiana.",
  },
  {
    n: 5, hours: "1.5h", title: "Usare l'AI nella pratica quotidiana",
    desc: "Casi d'uso reali per la professione sanitaria: scrivere e sintetizzare testi, preparare materiali, organizzare il lavoro. Prompt sicuri, esempi pratici e flussi che puoi adottare da subito.",
  },
  {
    n: 6, hours: "1.5h", title: "Uso etico e responsabile",
    desc: "Trasparenza con i pazienti, supervisione umana e confini deontologici. Come integrare l'AI mantenendo la responsabilità clinica e la fiducia al centro della relazione di cura.",
  },
];

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export function CoursePageAiLiteracy({ onLogin, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  // Open at the top regardless of the previous page's scroll position.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    const subject = encodeURIComponent("Lista d'attesa — AI Literacy & AI Act");
    const body = encodeURIComponent(
      `Vorrei essere avvisato/a all'apertura delle iscrizioni del corso AI Literacy & AI Act.\n\nEmail: ${trimmed}`,
    );
    window.location.href = `mailto:${WAITLIST_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

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
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(217,123,74,0.1)", border: `1px solid rgba(217,123,74,0.3)`, color: TERRA, borderRadius: 999, padding: "5px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 18 }}>
              Conforme Art. 4 AI Act
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}
              className="font-serif"
              style={{ fontSize: "clamp(2rem,5vw,3.8rem)", fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.03em", color: NAVY, marginBottom: 20 }}>
              AI Literacy<br /><em style={{ fontStyle: "italic", color: TERRA }}>& AI Act</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.18 }}
              style={{ fontSize: 15, color: MUTED, lineHeight: 1.75, marginBottom: 28 }}>
              Una base solida per usare l'AI con competenza e consapevolezza nel tuo lavoro. Conforme all'AI Act, aperto a tutti gli operatori sanitari — non solo agli psicologi. Attestato incluso · ECM in accreditamento.
            </motion.p>

            {/* Waitlist form */}
            {sent ? (
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Grazie! Ci sei. ✓</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                  Ti avviseremo all'apertura delle iscrizioni. Se il client email non si è aperto, scrivici a{" "}
                  <a href={`mailto:${WAITLIST_EMAIL}`} style={{ color: TERRA }}>{WAITLIST_EMAIL}</a>.
                </div>
              </div>
            ) : (
              <motion.form
                onSubmit={joinWaitlist}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.26 }}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="la-tua-email@esempio.com"
                    required
                    style={{ flex: "1 1 220px", padding: "13px 16px", borderRadius: 999, border: `1px solid ${BORDER}`, background: WHITE, fontSize: 14, color: NAVY, outline: "none" }}
                  />
                  <button type="submit"
                    style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 999, padding: "13px 26px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 7 }}>
                    Avvisami all'avvio <span>→</span>
                  </button>
                </div>
                <span style={{ fontSize: 12, color: FAINT }}>
                  Iscrizioni in apertura · nessun pagamento richiesto ora.
                </span>
              </motion.form>
            )}
          </div>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
            style={{ background: WHITE, borderRadius: 18, border: `1px solid ${BORDER}`, padding: "clamp(24px,4vw,36px)", boxShadow: "0 8px 40px rgba(0,0,0,0.07)" }}>
            <div style={{ borderLeft: `3px solid ${TERRA}`, paddingLeft: 16, marginBottom: 28 }}>
              <div className="font-serif" style={{ fontSize: 18, color: NAVY, lineHeight: 1.2, marginBottom: 6 }}>Durata totale</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: NAVY }}>8 ore</div>
            </div>
            {[
              ["⚖️", "Conforme all'AI Act", "Allineato al principio di alfabetizzazione AI dell'Art. 4"],
              ["🏥", "Per tutti gli operatori sanitari", "Non solo psicologi — aperto a tutta la sanità"],
              ["📜", "Attestato incluso", "Documento di completamento per dimostrare la formazione"],
              ["🎓", "ECM in accreditamento", "Crediti ECM in arrivo — riserva il tuo posto ora"],
              ["💻", "100% online", "Al tuo ritmo, con materiali sempre accessibili"],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex gap-4 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.6 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 13, color: MUTED }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 24, fontSize: 13, color: FAINT, lineHeight: 1.6 }}>
              Prezzo in definizione · iscriviti alla lista d'attesa per essere avvisato per primo.
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Act context strip */}
      <section style={{ background: NAVY }} className="px-5 md:px-10 py-12 md:py-16">
        <div className="mx-auto" style={{ maxWidth: 960 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              ["Competenza", "Capisci davvero cosa fa l'AI, così la usi con sicurezza e senza affidarti al caso."],
              ["Conformità", "Allineato all'AI Act e al principio di alfabetizzazione previsto dall'Art. 4."],
              ["Attestato", "Un documento di completamento che certifica la formazione svolta."],
            ].map(([big, small]) => (
              <div key={big}>
                <div className="font-serif" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 500, color: LIME, lineHeight: 1.1, marginBottom: 8 }}>{big}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{small}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section style={{ background: SURFACE2, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }} className="py-16 md:py-20">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 960 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT, fontFamily: "monospace", marginBottom: 14 }}>Programma · 8 ore</p>
          <h2 className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, marginBottom: 40 }}>
            Cosa <em style={{ fontStyle: "italic" }}>imparerai.</em>
          </h2>
          <div className="flex flex-col gap-3">
            {MODULES.map((m, i) => (
              <motion.div key={m.n}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 22px", display: "flex", gap: 18, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: "rgba(217,123,74,0.1)", color: TERRA, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontWeight: 700, fontSize: 15 }}>
                  {m.n.toString().padStart(2, "0")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <h3 className="font-serif" style={{ fontSize: 18, fontWeight: 400, color: NAVY }}>{m.title}</h3>
                    <span style={{ fontSize: 11, color: FAINT, fontFamily: "monospace", background: SURFACE2, borderRadius: 999, padding: "2px 9px" }}>{m.hours}</span>
                  </div>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: NAVY, textAlign: "center", position: "relative", overflow: "hidden" }} className="px-5 md:px-10 py-20 md:py-28">
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: `radial-gradient(ellipse, rgba(217,123,74,0.18) 0%, transparent 65%)`, filter: "blur(50px)" }} />
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: TERRA, color: "#fff", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: 999, padding: "6px 18px", marginBottom: 28, fontFamily: "monospace" }}>
            Iscrizioni in apertura
          </div>
          <h2 className="font-serif" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", marginBottom: 16 }}>
            Usa l'AI con <em style={{ fontStyle: "italic" }}>competenza.</em>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 36 }}>
            Riserva il tuo posto: ti avvisiamo all'apertura delle iscrizioni.
          </p>
          <a href={`mailto:${WAITLIST_EMAIL}?subject=${encodeURIComponent("Lista d'attesa — AI Literacy & AI Act")}`}
            style={{ background: LIME, color: NAVY, textDecoration: "none", borderRadius: 999, padding: "15px 40px", fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 10 }}>
            Iscriviti alla lista d'attesa →
          </a>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", marginTop: 18 }}>
            Domande? Scrivi a <strong style={{ color: "rgba(255,255,255,0.6)" }}>{WAITLIST_EMAIL}</strong>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: NAVY, borderTop: "1px solid rgba(255,255,255,0.06)", color: "#fff" }} className="px-5 md:px-10 py-8">
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
          <img src={LOGO} alt="Unozen" style={{ height: 22, filter: "brightness(10)", opacity: 0.4 }} />
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
            © 2026 Unozen.ai &nbsp;·&nbsp; <a href={`mailto:${WAITLIST_EMAIL}`} style={{ color: "rgba(255,255,255,0.4)" }}>{WAITLIST_EMAIL}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
