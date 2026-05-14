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

      {/* AI Tutor section */}
      <section style={{ background: NAVY, position: "relative", overflow: "hidden" }} className="py-16 md:py-24">
        <div style={{ position: "absolute", top: "40%", left: "30%", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(200,233,118,0.10) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div className="relative mx-auto px-5 md:px-10" style={{ maxWidth: 960, zIndex: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* Left — text */}
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: LIME, fontFamily: "monospace", display: "inline-block", marginBottom: 20 }}>AI Tutor — incluso per sempre</span>
              <h2 className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", marginBottom: 20 }}>
                Un tutor che conosce<br />il corso <em style={{ fontStyle: "italic", color: LIME }}>a memoria.</em>
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

            {/* Right — mock chat */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.12 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, overflow: "hidden" }}>
                {/* Chat header */}
                <div style={{ background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: LIME, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>AI Tutor</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Online · Risponde subito</div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 14, minHeight: 280 }}>
                  {[
                    { role: "user", text: "Qual è la differenza tra ChatGPT e un modello fine-tuned?" },
                    { role: "ai", text: "Ottima domanda. Come abbiamo visto nel Modulo 1, ChatGPT è un modello base addestrato su dati generici. Un modello fine-tuned viene invece ulteriormente addestrato su dati specifici — come le note cliniche di uno studio o il protocollo di un servizio. Il risultato è un modello che \"parla il tuo linguaggio\"." },
                    { role: "user", text: "E quando mi conviene usare l'uno piuttosto che l'altro?" },
                    { role: "ai", text: "Dipende dal caso d'uso. Per redazione di referti o comunicazioni con pazienti, ChatGPT con un buon prompt spesso basta. Per applicazioni più strutturate — come un triage automatico o un sistema di screening — il fine-tuning dà risultati notevolmente migliori." },
                  ].map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div style={{
                        maxWidth: "82%", padding: "10px 14px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        background: msg.role === "user" ? LIME : "rgba(255,255,255,0.08)",
                        color: msg.role === "user" ? NAVY : "rgba(255,255,255,0.85)",
                        fontSize: 13, lineHeight: 1.6,
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input bar */}
                <div style={{ margin: "8px 20px 20px", background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", flex: 1 }}>Fai una domanda sul corso…</span>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: LIME, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Recensioni */}
      <section style={{ background: SURFACE2, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }} className="py-16 md:py-24">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 960 }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT, fontFamily: "monospace" }}>Recensioni</span>
              <h2 className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, marginTop: 10 }}>
                Cosa dicono i <em style={{ fontStyle: "italic", fontWeight: 400 }}>partecipanti.</em>
              </h2>
            </div>
            <p className="font-serif" style={{ fontSize: 14, fontStyle: "italic", color: FAINT }}>Recensioni vere, non inventate.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { tag: "Esperienza", text: "Ho imparato cose che da sola avrei fatto molta fatica a mettere insieme. La cosa più bella è che mi ha acceso ancora di più la curiosità. Si sente la competenza e la chiarezza con cui riesce a portare temi complessi.", author: "Iliana Sardi", role: "Psicologa" },
              { tag: "Praticità", text: "Ho apprezzato particolarmente il taglio pratico, la qualità dei materiali e la guida attenta e competente di Matteo — uno strumento concretamente spendibile nel lavoro quotidiano.", author: "Daniela Iacopini", role: "Professionista" },
              { tag: "Qualità", text: "Corso molto valido per merito del bravissimo Matteo, che con passione, capacità professionale e dedizione mi ha permesso di familiarizzare con l'intelligenza artificiale. Esperienza ottima sotto qualsiasi punto di vista.", author: "Patrizia Stella", role: "Psicologa" },
              { tag: "Consigliato", text: "Ho apprezzato la chiarezza espositiva, l'approccio pratico e interattivo senza rinunciare alla qualità del contenuto. Ho consigliato caldamente il corso ai colleghi del gruppo di lavoro dell'Ordine.", author: "Monica Viganò", role: "Psicologa, Ordine" },
              { tag: "Metodo", text: "Usavo ChatGPT, Claude, Perplexity, Gemini e Notebook LM — ma nella mia mente si era creato il caos. Matteo mi ha aiutato a mettere ordine. Finalmente so cosa uso e perché.", author: "Delia Duccoli", role: "Psicologa e Docente universitaria" },
              { tag: "Accessibilità", text: "Spiegazioni chiare e accessibili, strumenti concreti per sperimentare l'AI in modo più ampio e consapevole. Molto utile poter accedere alle registrazioni rispettando i propri ritmi.", author: "Barbara", role: "Studio Pizzagalli" },
              { tag: "Per principianti", text: "Mi avvicinavo al tema dell'AI per la prima volta. Nonostante questo sono riuscito a seguire bene e ho appreso molte cose, sia teoriche che pratiche. Le prime prove che ho fatto sono state soddisfacenti.", author: "Damiano Suzzi", role: "Professionista" },
              { tag: "Consigliato", text: "Il corso è stato davvero interessante e utile. Si vede che Matteo ha tanta confidenza con le varie AI — e riesce a trasmetterla. Ho già consigliato il corso a diversi colleghi.", author: "Lucia Canestrari", role: "Psicologa" },
              { tag: "Praticità", text: "Ringrazio moltissimo Matteo per la disponibilità! Apprezzo i video dove mostra nel concreto come si fanno le cose. Il corso l'ho trovato molto utile — vuole solo che tu voglia davvero imparare.", author: "Simona Sartori", role: "Professionista" },
            ].map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 3) * 0.07 }}
                style={{ background: WHITE, borderRadius: 14, padding: "24px 22px", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: NAVY, fontFamily: "monospace", background: SURFACE2, borderRadius: 999, padding: "3px 10px", display: "inline-block", marginBottom: 16, width: "fit-content" }}>{r.tag}</span>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, flex: 1, marginBottom: 20 }}>"{r.text}"</p>
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{r.author}</div>
                  <div style={{ fontSize: 12, color: FAINT }}>{r.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chi siamo */}
      <section style={{ background: WHITE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }} className="py-16 md:py-24">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 960 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* Photos — staggered stack */}
            <div style={{ position: "relative", height: 420 }} className="hidden md:block">
              <motion.div
                initial={{ opacity: 0, y: -12, rotate: -2 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                style={{ position: "absolute", top: 0, left: "10%", width: 220, borderRadius: 4, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.13)", border: `3px solid ${WHITE}`, transform: "rotate(-3deg)" }}>
                <img
                  src="https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6935ed01e1dd66f3db9dad0d_Matteo%20Grassi.jpg"
                  alt="Alessandro Lombardo"
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", filter: "grayscale(20%)" }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12, rotate: 2 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.12 }}
                style={{ position: "absolute", bottom: 0, right: "5%", width: 220, borderRadius: 4, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.13)", border: `3px solid ${WHITE}`, transform: "rotate(2.5deg)" }}>
                <img
                  src="https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6935ed01e1dd66f3db9dad0d_Matteo%20Grassi.jpg"
                  alt="Matteo Grassi"
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", filter: "grayscale(20%)" }}
                />
              </motion.div>
            </div>

            {/* Text */}
            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT, fontFamily: "monospace", display: "inline-block", border: `1px solid ${BORDER}`, borderRadius: 999, padding: "4px 12px", marginBottom: 24 }}>Chi siamo</span>
              <h2 className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, marginBottom: 36 }}>
                La migliore piattaforma<br />di formazione AI per<br /><em style={{ fontStyle: "italic", fontWeight: 400 }}>professionisti.</em>
              </h2>

              <div className="flex flex-col gap-6">
                {[
                  {
                    name: "Alessandro Lombardo",
                    bio: "Co-fondatore Unozen. Psicologo e Psicoterapeuta. Ho fondato e diretto, fino a maggio 2026, la più grande comunità di apprendimento per psicologi in Italia. Lavoro come psicoterapeuta a Torino.",
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
