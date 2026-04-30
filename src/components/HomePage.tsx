import { useState } from "react";
import { motion } from "motion/react";
import { CORSO } from "../lib/courseData";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";

const NAVY = "#0f1f3d";
const BLUE = "#1a3a6b";
const ACCENT = "#2563c7";
const LIGHT_BG = "#f5f7fa";
const CARD_BG = "#ffffff";
const BORDER = "#e2e8f0";
const TEXT = "#1a2540";
const MUTED = "#64748b";
const HERO_BG = "#dde8f7"; // soft blue like screenshot

interface Props {
  onLogin: () => void;
}

const REVIEWS = [
  { text: "Ho imparato cose che da sola avrei fatto molta fatica a mettere insieme. Si sente la competenza e la chiarezza con cui riesce a portare temi complessi.", author: "Iliana Sardi", role: "Psicologa" },
  { text: "Ho apprezzato il taglio pratico, la qualità dei materiali e la guida attenta e competente — uno strumento concretamente spendibile nel lavoro quotidiano.", author: "Daniela Iacopini", role: "Professionista" },
  { text: "Corso molto valido. Con passione e capacità professionale mi ha permesso di familiarizzare con l'intelligenza artificiale.", author: "Patrizia Stella", role: "Psicologa" },
  { text: "Ho apprezzato la chiarezza espositiva e l'approccio pratico. Ho consigliato caldamente il corso ai colleghi del gruppo di lavoro dell'Ordine.", author: "Monica Viganò", role: "Psicologa, Ordine" },
  { text: "Usavo ChatGPT, Claude, Perplexity, Gemini — ma nella mia mente si era creato il caos. Matteo mi ha aiutato a mettere ordine. Finalmente so cosa uso e perché.", author: "Delia Duccoli", role: "Psicologa, Docente universitaria" },
  { text: "Mi avvicinavo al tema dell'AI per la prima volta. Nonostante questo sono riuscito a seguire bene e ho appreso molte cose, sia teoriche che pratiche.", author: "Damiano Suzzi", role: "Professionista" },
];

export function HomePage({ onLogin }: Props) {
  const totalSubtopics = CORSO.flatMap(l => l.subtopics).length;

  return (
    <div className="min-h-screen font-sans" style={{ background: LIGHT_BG, color: TEXT }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(245,247,250,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2.5rem", height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={LOGO} alt="Unozen" style={{ height: 28, width: "auto", objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="hidden md:flex">
          {[["#programma","Programma"],["#tutor","AI Tutor"],["#docente","Docente"],["#recensioni","Recensioni"]].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: 14, color: MUTED, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >{label}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onLogin} style={{ fontSize: 14, color: MUTED, background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>
            Accedi
          </button>
          <button
            onClick={onLogin}
            style={{
              fontSize: 14, fontWeight: 600, padding: "9px 22px",
              borderRadius: 8, border: "none", cursor: "pointer",
              background: NAVY, color: "#fff", transition: "background 0.15s"
            }}
            onMouseEnter={e => (e.currentTarget.style.background = ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.background = NAVY)}
          >
            Inizia il corso
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header style={{ background: `linear-gradient(160deg, ${HERO_BG} 0%, #edf3fc 60%, #f5f7fa 100%)`, paddingTop: 120, paddingBottom: 0 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem", textAlign: "center" }}>

          {/* Pill badge */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.8)", border: `1px solid ${BORDER}`,
              borderRadius: 999, padding: "6px 16px 6px 10px", marginBottom: 36,
              fontSize: 13, color: MUTED, boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
            }}>
              <span style={{
                background: NAVY, color: "#fff", borderRadius: 999,
                fontSize: 11, fontWeight: 600, padding: "2px 10px", letterSpacing: "0.04em"
              }}>NUOVO</span>
              AI clinica per psicologi italiani &nbsp;·&nbsp; <span style={{ color: ACCENT, fontWeight: 500 }}>Edizione 4 →</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
            className="font-serif"
            style={{ fontSize: "clamp(2.6rem,6vw,4.4rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.025em", color: NAVY, marginBottom: 24 }}
          >
            Porta l'AI nella tua<br />pratica clinica,<br />
            <span style={{ fontStyle: "italic" }}>senza perdere il controllo.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            style={{ fontSize: 17, color: MUTED, lineHeight: 1.65, maxWidth: "52ch", margin: "0 auto 36px", fontWeight: 400 }}
          >
            Un corso on-demand con un AI tutor che risponde ai tuoi dubbi in italiano,
            esercitazioni vocali interattive e materiali pratici usabili da subito in studio.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}
          >
            <button
              onClick={onLogin}
              style={{
                background: NAVY, color: "#fff", border: "none", borderRadius: 10,
                padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(15,31,61,0.18)", transition: "background 0.15s, transform 0.1s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = ACCENT; }}
              onMouseLeave={e => { e.currentTarget.style.background = NAVY; }}
            >
              Richiedi accesso anticipato
            </button>
            <button
              onClick={onLogin}
              style={{
                background: "#fff", color: NAVY, border: `1.5px solid ${BORDER}`, borderRadius: 10,
                padding: "14px 28px", fontSize: 15, fontWeight: 500, cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#aac0e0"; e.currentTarget.style.background = HERO_BG; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = "#fff"; }}
            >
              Scopri di più →
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{ fontSize: 12, color: "#94a3b8", marginBottom: 52 }}>
            Conforme GDPR · Dati in Europa · Anonimizzazione automatica
          </motion.p>

          {/* Hero cards illustration */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ position: "relative", maxWidth: 860, margin: "0 auto", display: "flex", gap: 20, alignItems: "flex-start", justifyContent: "center", paddingBottom: 0 }}
          >
            {/* Card 1: Session summary */}
            <div style={{
              flex: "0 0 340px", background: CARD_BG, borderRadius: 16,
              border: `1px solid ${BORDER}`, boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
              padding: "20px 20px", textAlign: "left", marginTop: 16
            }}>
              <div style={{ display: "flex", gap: 8, borderBottom: `1px solid ${BORDER}`, paddingBottom: 12, marginBottom: 14, fontSize: 13, fontWeight: 500, color: MUTED }}>
                <span style={{ color: NAVY, fontWeight: 600, borderBottom: "2px solid " + NAVY, paddingBottom: 12, marginBottom: -13 }}>Riepilogo seduta</span>
                <span style={{ marginLeft: 12 }}>Note cliente</span>
                <span style={{ marginLeft: "auto", color: ACCENT, fontSize: 12, fontWeight: 600 }}>+ Nuova</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e0edff", border: `1px solid #aac4ef`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: ACCENT }}>M</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Marco Bellini</span>
                <span style={{ fontSize: 11, background: "#e0f2fe", color: "#0284c7", borderRadius: 4, padding: "1px 6px", marginLeft: 4 }}>CBT</span>
                <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", borderRadius: 4, padding: "1px 6px" }}>ACT</span>
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>📅 4 Giu 2025 · 16:00–17:30 · Online</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Soggetto</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 10 }}>Tensioni familiari e difficoltà comunicative col coniuge. Resistenza verso alcune indicazioni terapeutiche.</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Obiettivo</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>Atteggiamento collaborativo. Buona alleanza terapeutica.</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#16a34a", fontWeight: 500, marginBottom: 8 }}>
                <span>✓</span> Riepilogo pronto
              </div>
              <div style={{ fontSize: 12, color: MUTED, fontStyle: "italic", borderLeft: "3px solid #dde8f7", paddingLeft: 10, lineHeight: 1.5 }}>
                "Marco ha mostrato apertura ma resistenza sul tema familiare…"
              </div>
            </div>

            {/* Card 2: AI chat */}
            <div style={{
              flex: "0 0 280px", background: CARD_BG, borderRadius: 16,
              border: `1px solid ${BORDER}`, boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
              padding: "20px", textAlign: "left", marginTop: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, borderBottom: `1px solid ${BORDER}`, paddingBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1a3a6b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>G</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Giovanni Rossi</div>
                  <div style={{ fontSize: 11, color: MUTED }}>Cartella clinica n#8629</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>ETÀ</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>34 anni</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>SEDUTA</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>12ª</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 12 }}>
                <span style={{ color: ACCENT, fontWeight: 500 }}>✦ Zen AI</span>
                <span style={{ marginLeft: "auto", color: "#16a34a", fontWeight: 600, fontSize: 11 }}>ATTIVO</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.45 }}>Seduta attiva. Come posso aiutarti con Giovanni?</div>
                <div style={{ alignSelf: "flex-end", background: NAVY, color: "#fff", borderRadius: "12px 12px 2px 12px", padding: "8px 12px", fontSize: 12, maxWidth: "90%", lineHeight: 1.45 }}>
                  Come sta rispondendo alle tecniche ACT?
                </div>
                <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.5 }}>Nelle ultime tre sedute ha mostrato maggiore apertura. Il tema familiare torna spesso — è un filo conduttore ricorrente.</div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* FEATURES GRID */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 2rem 0" }} id="features">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Il corso</div>
          <h2 className="font-serif" style={{ fontSize: "clamp(2rem,4.5vw,3.2rem)", fontWeight: 400, lineHeight: 1.15, color: NAVY, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Chiedi all'AI tutto quello che<br />normalmente dovresti cercare a mano.
          </h2>
          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.65, maxWidth: "56ch", margin: "0 auto" }}>
            Non è un semplice corso video. Ogni modulo viene studiato con un AI tutor addestrato sui contenuti — che risponde, spiega e si adatta al tuo livello.
          </p>
        </div>

        {/* Scrolling question chips */}
        <div style={{ overflow: "hidden", marginBottom: 56 }}>
          {[
            ["Su cosa eravamo rimasti?", "Cosa dovrei tenere presente oggi?", "Come è andata l'ultima seduta?", "Cosa è cambiato nelle ultime settimane?", "Quali temi sono emersi?"],
            ["Quali pattern emergono nello storico?", "Quali temi sembrano ripetersi?", "Quali temi ricorrenti emergono?", "Riassumi le ultime 3 sedute", "Aggiorna il contesto del caso"],
            ["Aggiorna lo storico del paziente", "Quali elementi potrei voler rivedere?", "Genera la nota clinica in formato SOAP", "Come faccio un prompt per la diagnosi?"],
          ].map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 8, flexWrap: "nowrap", marginBottom: 8, justifyContent: ri === 1 ? "flex-start" : ri === 2 ? "flex-end" : "center" }}>
              {row.map((q) => (
                <span key={q} style={{
                  whiteSpace: "nowrap", fontSize: 13, padding: "8px 16px",
                  borderRadius: 999, border: `1.5px solid ${BORDER}`,
                  background: "#fff", color: TEXT, boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                }}>{q}</span>
              ))}
            </div>
          ))}
        </div>

        {/* 4 feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 24 }}>
          {[
            { icon: "📄", title: "Contenuti pratici e aggiornati", desc: "Ogni lezione copre strumenti reali usabili in studio, con casi clinici e prompt pronti all'uso." },
            { icon: "🎙️", title: "AI Tutor incluso", desc: "Registra una domanda, carica un audio o scrivi. L'AI risponde sul contenuto del corso." },
            { icon: "🧠", title: "AI sullo storico del corso", desc: "Fai domande sui concetti visti, ritrova il contesto e approfondisci nel tuo ritmo." },
            { icon: "⚡", title: "Adattato al tuo orientamento", desc: "Supporta diversi stili clinici: CBT, psicodinamico, sistemico, ACT, EMDR." },
          ].map((f) => (
            <div key={f.title} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "28px 24px" }}>
              <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 8 }} className="font-serif">{f.title}</div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS — 3 step cards */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 2rem" }} id="tutor">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Come funziona</div>
          <h2 className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400, lineHeight: 1.15, color: NAVY, letterSpacing: "-0.02em", marginBottom: 14 }}>
            Non dimenticarti di niente:<br />studia e ricordati di tutto.
          </h2>
          <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.65, maxWidth: "50ch", margin: "0 auto" }}>
            Ogni modulo aggiunge contesto: concetti, domande aperte, intuizioni cliniche.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {[
            {
              phase: "Prima della lezione",
              accent: "#dde8f7",
              sub: "Ritrovi subito il contesto.",
              desc: "Apri il modulo e ritrovi subito il riepilogo del contenuto precedente, i temi del corso e i punti da approfondire. Generato automaticamente, senza nulla da scrivere.",
              mock: (
                <div style={{ background: "#f8faff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", fontSize: 12, color: MUTED }}>
                  <div style={{ fontWeight: 600, color: TEXT, marginBottom: 6 }}>Lezione 2 · Prompt Engineering</div>
                  <div style={{ marginBottom: 4 }}>→ Riepilogo lezione precedente</div>
                  <div style={{ height: 6, background: BORDER, borderRadius: 4, marginBottom: 6, width: "80%" }} />
                  <div style={{ height: 6, background: BORDER, borderRadius: 4, marginBottom: 10, width: "60%" }} />
                  <div style={{ color: ACCENT, fontSize: 11, fontWeight: 500 }}>Chiedi qualsiasi cosa su questo modulo</div>
                </div>
              )
            },
            {
              phase: "Durante la lezione",
              accent: "#e0edff",
              sub: "L'AI risponde. Tu studi.",
              desc: "Guarda il video, interagisci con il tutor integrato. Fai domande sui concetti, approfondisci, chiedi esempi pratici. Il tutor conosce ogni argomento.",
              mock: (
                <div style={{ background: "#f8faff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", fontSize: 12 }}>
                  <div style={{ textAlign: "center", color: MUTED, fontWeight: 500, marginBottom: 8 }}>Lezione in corso…</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 10 }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} style={{ width: 3, borderRadius: 2, background: ACCENT, height: 6 + Math.sin(i) * 8 + 8, opacity: 0.7 + Math.sin(i) * 0.3 }} />
                    ))}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ background: NAVY, color: "#fff", fontSize: 12, borderRadius: 8, padding: "7px 18px", fontWeight: 500 }}>✓ Parla con l'AI</span>
                  </div>
                </div>
              )
            },
            {
              phase: "Dopo la lezione",
              accent: "#f0f7ff",
              sub: "Nota pronta. Storico aggiornato.",
              desc: "L'AI genera un riepilogo strutturato, aggiorna il tuo storico e ti permette di fare domande sui concetti: cosa ricordare, come applicare, cosa ripassare.",
              mock: (
                <div style={{ background: "#f8faff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", fontSize: 12, color: MUTED }}>
                  <div style={{ fontWeight: 600, color: TEXT, marginBottom: 8 }}>Concetti acquisiti</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                    {["R.I.C.E.V.O.", "Chain of Thought", "RAG", "Role-Play"].map(t => (
                      <span key={t} style={{ background: "#e0edff", color: ACCENT, borderRadius: 4, fontSize: 11, padding: "2px 8px", fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                  <button onClick={() => {}} style={{ width: "100%", background: NAVY, color: "#fff", borderRadius: 8, border: "none", padding: "8px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    📋 Riepilogo modulo
                  </button>
                </div>
              )
            },
          ].map((step) => (
            <div key={step.phase} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 24px" }}>
              <div style={{ background: step.accent, borderRadius: 12, padding: "14px", marginBottom: 20 }}>{step.mock}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 4 }} className="font-serif">{step.phase}</div>
              <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 10 }}>{step.sub}</div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.65 }}>{step.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button
            onClick={onLogin}
            style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(15,31,61,0.15)" }}
            onMouseEnter={e => (e.currentTarget.style.background = ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.background = NAVY)}
          >
            Entra nel corso →
          </button>
        </div>
      </section>

      {/* PROGRAMMA */}
      <section id="programma" style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "80px 0" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Programma</div>
            <h2 className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400, lineHeight: 1.15, color: NAVY, letterSpacing: "-0.02em" }}>
              {CORSO.length} moduli. {totalSubtopics} argomenti.<br />Un AI che ti guida su tutto.
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
            {CORSO.map((lezione, i) => (
              <div key={lezione.id} style={{
                display: "grid", gridTemplateColumns: "64px 1fr 2fr",
                gap: "0 32px", padding: "28px 32px", borderBottom: i < CORSO.length - 1 ? `1px solid ${BORDER}` : "none",
                background: "#fff", alignItems: "start"
              }}>
                <div className="font-serif" style={{ fontSize: 40, fontWeight: 300, color: "#c8d8f0", lineHeight: 1 }}>0{lezione.number}</div>
                <div>
                  <div style={{ fontSize: 11, color: ACCENT, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    ▶ Modulo video
                  </div>
                  <div className="font-serif" style={{ fontSize: 18, fontWeight: 500, color: NAVY, marginBottom: 6, lineHeight: 1.2 }}>{lezione.title}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{i === 0 ? "Disponibile ora" : `Modulo ${i + 1}`}</div>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {lezione.subtopics.map((sub) => (
                    <li key={sub.id} style={{ fontSize: 13, color: MUTED, padding: "5px 0 5px 16px", position: "relative", borderBottom: `1px solid ${BORDER}`, lineHeight: 1.45 }}>
                      <span style={{ position: "absolute", left: 0, color: ACCENT }}>→</span>
                      {sub.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTRUCTOR */}
      <section id="docente" style={{ maxWidth: 960, margin: "0 auto", padding: "80px 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="md:grid-cols-2 grid-cols-1">
          <div>
            <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Il docente</div>
            <h2 className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400, lineHeight: 1.15, color: NAVY, letterSpacing: "-0.02em", marginBottom: 20 }}>
              Matteo Grassi
            </h2>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, marginBottom: 16 }}>
              Psicologo, fondatore di Hana — una piattaforma di engagement vocale per il supporto dei pazienti, utilizzata in USA, UK ed Europa.
            </p>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, marginBottom: 24 }}>
              Vivo e lavoro a Dublino. Costruisco tecnologie AI per la salute mentale da molti anni — e insegno le stesse cose che uso ogni giorno.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Psicologia", "Voice AI", "Healthcare", "Startup", "Open-source"].map(tag => (
                <span key={tag} style={{ background: HERO_BG, color: BLUE, border: `1px solid #c5d8f0`, borderRadius: 999, fontSize: 12, padding: "4px 12px", fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 12, fontWeight: 500 }}>CO-FOUNDER · UNOZEN.AI</div>
            <div className="font-serif" style={{ fontSize: 26, fontWeight: 400, color: NAVY, marginBottom: 16, lineHeight: 1.1 }}>
              "Costruisco le stesse tecnologie che ti insegno ad usare."
            </div>
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
              {[
                "Fondatore di Hana (USA, UK, Europa)",
                "Laureato in Psicologia in Italia",
                "Esperto di Voice AI e LLM clinici",
                "Docente di AI per professionisti",
              ].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: MUTED, padding: "6px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ color: ACCENT, fontSize: 16 }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="recensioni" style={{ background: HERO_BG, borderTop: `1px solid #c5d8f0`, borderBottom: `1px solid #c5d8f0`, padding: "80px 0" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Recensioni</div>
            <h2 className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400, lineHeight: 1.15, color: NAVY, letterSpacing: "-0.02em" }}>
              Cosa dicono i partecipanti.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 14, padding: "28px 24px",
                border: `1px solid #d0e3f7`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                display: "flex", flexDirection: "column", gap: 16,
                transform: i % 2 === 1 ? "translateY(12px)" : undefined
              }}>
                <div style={{ fontSize: 36, lineHeight: 1, color: "#b8d4f8", fontFamily: "Georgia, serif", marginBottom: -8 }}>"</div>
                <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.65, flex: 1 }}>{r.text}</p>
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{r.author}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{r.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: ACCENT, padding: "80px 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 999, padding: "6px 16px", marginBottom: 24 }}>
            Posti limitati · Edizione 4
          </div>
          <h2 className="font-serif" style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 400, lineHeight: 1.15, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>
            Pronto a portare l'AI<br />nella tua pratica?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 36 }}>
            Accesso immediato a tutti i moduli, AI tutor incluso, materiali scaricabili.
          </p>
          <button
            onClick={onLogin}
            style={{ background: "#fff", color: NAVY, border: "none", borderRadius: 10, padding: "15px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", transition: "transform 0.1s" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "none")}
          >
            Inizia il corso →
          </button>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 16 }}>
            Pagamento con bonifico? Scrivi a <strong style={{ color: "#fff" }}>info@unozen.it</strong>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: NAVY, color: "#fff", padding: "48px 2rem 28px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32, paddingBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 24 }}>
            <div>
              <img src={LOGO} alt="Unozen" style={{ height: 28, width: "auto", objectFit: "contain", marginBottom: 12, filter: "brightness(10)" }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: "28ch" }}>L'ecosistema AI per i professionisti italiani della salute mentale.</p>
            </div>
            {[
              ["Corso", ["Programma", "AI Tutor", "Docente", "Iscriviti"]],
              ["Unozen", ["Chi siamo", "Contatti", "Community"]],
              ["Legal", ["Privacy", "Termini", "Cookie"]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>{title}</div>
                {(links as string[]).map(link => (
                  <a key={link} href="#" style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "4px 0", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                  >{link}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            <span>© 2026 Unozen.ai — Tutti i diritti riservati</span>
            <span>Conforme GDPR · Dati in Europa</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
