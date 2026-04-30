import { motion } from "motion/react";
import { CORSO } from "../lib/courseData";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";

interface Props {
  onLogin: () => void;
}

const REVIEWS = [
  { text: "Ho imparato cose che da sola avrei fatto molta fatica a mettere insieme. Si sente la competenza e la chiarezza con cui riesce a portare temi complessi.", author: "Iliana Sardi", role: "Psicologa" },
  { text: "Ho apprezzato il taglio pratico, la qualità dei materiali e la guida attenta e competente — uno strumento concretamente spendibile nel lavoro quotidiano.", author: "Daniela Iacopini", role: "Professionista" },
  { text: "Usavo ChatGPT, Claude, Perplexity, Gemini — ma nella mia mente si era creato il caos. Matteo mi ha aiutato a mettere ordine. Finalmente so cosa uso e perché.", author: "Delia Duccoli", role: "Psicologa, Docente universitaria" },
  { text: "Ho apprezzato la chiarezza espositiva e l'approccio pratico. Ho consigliato caldamente il corso ai colleghi del gruppo di lavoro dell'Ordine.", author: "Monica Viganò", role: "Psicologa, Ordine" },
  { text: "Corso molto valido. Con passione e capacità professionale mi ha permesso di familiarizzare con l'intelligenza artificiale.", author: "Patrizia Stella", role: "Psicologa" },
  { text: "Mi avvicinavo al tema dell'AI per la prima volta. Nonostante questo sono riuscito a seguire bene e ho appreso molte cose pratiche.", author: "Damiano Suzzi", role: "Professionista" },
];

const BLUE = "#5b8dee";
const NAVY = "#132044";
const SKY = "#b8d4f8";

export function HomePage({ onLogin }: Props) {
  const totalSubtopics = CORSO.flatMap(l => l.subtopics).length;

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f5", color: "#0a0a0a", fontFamily: "'Inter', sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "2px solid #0a0a0a", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <img src={LOGO} alt="Unozen" className="h-7 w-auto object-contain" />
          <div className="hidden md:flex items-center gap-8">
            {[["#programma","Programma"],["#tutor","AI Tutor"],["#docente","Docente"],["#recensioni","Recensioni"]].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#0a0a0a", textDecoration: "none", letterSpacing: "0.06em" }}>{label}</a>
            ))}
          </div>
          <button onClick={onLogin} className="text-sm font-bold uppercase px-5 py-2.5 transition-all"
            style={{ background: BLUE, color: "#fff", border: "2px solid #0a0a0a", letterSpacing: "0.06em" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#0a0a0a"; }}
            onMouseLeave={e => { e.currentTarget.style.background = BLUE; }}
          >
            Accedi →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: SKY, borderBottom: "2px solid #0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-black uppercase mb-6" style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", lineHeight: 0.92, letterSpacing: "-0.02em", color: "#0a0a0a" }}>
              L'Intelligenza<br />Artificiale<br /><span style={{ color: NAVY }}>è qui.</span><br />Impara ad<br />usarla.
            </h1>
            <p className="text-lg font-medium mb-10 max-w-sm" style={{ color: "#1a1a2e", lineHeight: 1.5 }}>
              Costruiamo soluzioni AI e insegniamo ad usarle nel proprio lavoro, in modo etico e concreto.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={onLogin} className="font-bold uppercase px-7 py-4 text-base transition-all flex items-center gap-2"
                style={{ background: BLUE, color: "#fff", border: "2px solid #0a0a0a", letterSpacing: "0.06em" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#0a0a0a"; }}
                onMouseLeave={e => { e.currentTarget.style.background = BLUE; }}
              >
                Inizia ora →
              </button>
              <button onClick={onLogin} className="font-bold uppercase px-7 py-4 text-base transition-all"
                style={{ background: "transparent", color: "#0a0a0a", border: "2px solid #0a0a0a", letterSpacing: "0.06em" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#0a0a0a"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#0a0a0a"; }}
              >
                Scopri il corso
              </button>
            </div>
          </motion.div>

          {/* Hero visual — stacked cards */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="relative hidden md:block" style={{ height: 420 }}>
            {/* Card 1 */}
            <div style={{ position: "absolute", top: 0, right: 40, width: 260, height: 200, background: NAVY, border: "2px solid #0a0a0a", transform: "rotate(4deg)", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", color: "#fff", padding: "1.5rem" }}>
                  <div style={{ fontSize: "3rem", fontWeight: 900, lineHeight: 1 }}>AI</div>
                  <div style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "0.5rem", opacity: 0.7 }}>per psicologi</div>
                </div>
              </div>
            </div>
            {/* Card 2 */}
            <div style={{ position: "absolute", top: 80, right: 10, width: 240, height: 180, background: BLUE, border: "2px solid #0a0a0a", transform: "rotate(-3deg)", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, padding: "1.5rem", color: "#fff" }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.8, marginBottom: "0.75rem" }}>AI Tutor 24/7</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.4 }}>"Come posso usare l'AI con i miei pazienti?"</div>
              </div>
            </div>
            {/* Card 3 */}
            <div style={{ position: "absolute", bottom: 20, right: 60, width: 280, height: 160, background: "#fff", border: "2px solid #0a0a0a", transform: "rotate(1deg)" }}>
              <div style={{ padding: "1.5rem" }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: BLUE, fontWeight: 700, marginBottom: "0.5rem" }}>4 lezioni · {totalSubtopics} argomenti</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, lineHeight: 1.3, color: "#0a0a0a" }}>Edizione 4<br />2026</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{ background: NAVY, borderBottom: "2px solid #0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            ["100%", "Corsi pratici da esperti del settore"],
            [`${totalSubtopics}+`, "Moduli, esercizi e risorse scaricabili"],
            ["532+", "Professionisti già formati"],
            ["4.9★", "Valutazione media del corso"],
          ].map(([num, label]) => (
            <div key={num}>
              <div className="font-black text-4xl mb-1" style={{ color: "#fff", letterSpacing: "-0.02em" }}>{num}</div>
              <div className="text-xs uppercase font-semibold" style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", lineHeight: 1.4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CARDS SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Corso On Demand",
              desc: "Il nostro corso completo. 16 ore di video dove impari subito a lavorare con l'AI nel tuo studio professionale.",
              color: SKY,
              tag: "Più popolare",
            },
            {
              title: "AI Tutor Personale",
              desc: "Corsi brevi su temi specifici. Chiedimi qualunque cosa sui contenuti del corso — rispondo in italiano, 24/7.",
              color: "#fff",
              tag: "Incluso nel corso",
            },
            {
              title: "Per Organizzazioni",
              desc: "Progettiamo ed eroghiamo corsi formativi per aziende in base alle necessità organizzative.",
              color: "#fff",
              tag: "Su misura",
            },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: card.color, border: "2px solid #0a0a0a", display: "flex", flexDirection: "column" }}>
              {/* Image placeholder */}
              <div style={{ height: 180, background: i === 0 ? NAVY : i === 1 ? BLUE : "#d4e4f7", position: "relative", overflow: "hidden", borderBottom: "2px solid #0a0a0a" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "3rem", opacity: 0.4 }}>{i === 0 ? "▶" : i === 1 ? "✦" : "⌘"}</span>
                </div>
                <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "#0a0a0a", color: "#fff", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.3rem 0.75rem", fontWeight: 700 }}>
                  {card.tag}
                </div>
              </div>
              <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 className="font-black text-xl uppercase mb-3" style={{ letterSpacing: "-0.01em", lineHeight: 1.1 }}>{card.title}</h3>
                <p className="text-sm mb-6 flex-1" style={{ lineHeight: 1.6, color: "#444" }}>{card.desc}</p>
                <button onClick={onLogin} className="font-bold uppercase text-sm px-5 py-3 self-start flex items-center gap-2 transition-all"
                  style={{ background: BLUE, color: "#fff", border: "2px solid #0a0a0a", letterSpacing: "0.06em" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#0a0a0a"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = BLUE; }}
                >
                  Vai al corso →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BLUE BANNER */}
      <div style={{ background: BLUE, borderTop: "2px solid #0a0a0a", borderBottom: "2px solid #0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="font-black uppercase text-white mb-6" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Il nostro corso on-demand<br />
            Edizione 4 — aperta.<br />
            <span style={{ color: NAVY }}>Posti limitati.</span>
          </h2>
          <div style={{ fontSize: "3rem", color: "#fff", margin: "1.5rem 0" }}>↓</div>
          <button onClick={onLogin} className="font-black uppercase px-10 py-5 text-lg transition-all"
            style={{ background: "#fff", color: "#0a0a0a", border: "2px solid #0a0a0a", letterSpacing: "0.06em" }}
            onMouseEnter={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0a0a0a"; }}
          >
            Iscriviti — €297 →
          </button>
        </div>
      </div>

      {/* COURSE DETAIL */}
      <section id="programma" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-start mb-20">
          {/* Left: label + title */}
          <div>
            <div className="text-xs font-bold uppercase mb-4" style={{ letterSpacing: "0.15em", color: BLUE }}>Corso on-demand</div>
            <h2 className="font-black uppercase mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
              Intelligenza<br />Artificiale<br />per Psicologi
            </h2>
            <p className="font-bold mb-4" style={{ color: "#0a0a0a" }}>Tutti parlano di AI. Pochi la sanno usare.</p>
            <p className="text-sm mb-6" style={{ lineHeight: 1.7, color: "#444" }}>
              Hai provato ChatGPT, hai ottenuto risposte mediocri, e hai pensato "non fa per me". Intanto i tuoi colleghi risparmiano ore ogni settimana. <strong>Non è che l'AI non funziona. È che nessuno ti ha insegnato a usarla.</strong>
            </p>
            <p className="text-sm mb-8" style={{ lineHeight: 1.7, color: "#444" }}>
              Questo corso cambia questo. In 16 ore di video on-demand impari cosa fa davvero l'AI, come usarla nel tuo studio, e come restare conforme a GDPR e codice deontologico.
            </p>
            <button onClick={onLogin} className="font-bold uppercase px-7 py-4 text-base flex items-center gap-2 transition-all"
              style={{ background: BLUE, color: "#fff", border: "2px solid #0a0a0a", letterSpacing: "0.06em" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#0a0a0a"; }}
              onMouseLeave={e => { e.currentTarget.style.background = BLUE; }}
            >
              Inizia ora →
            </button>
          </div>

          {/* Right: what's included */}
          <div style={{ border: "2px solid #0a0a0a", background: "#fff" }}>
            <div style={{ background: NAVY, padding: "1.25rem 1.5rem", borderBottom: "2px solid #0a0a0a" }}>
              <span className="text-sm font-bold uppercase text-white" style={{ letterSpacing: "0.08em" }}>Cosa è incluso</span>
            </div>
            {[
              "AI Tutor personale 24/7 — chat e voce",
              `${CORSO.length} moduli video · 16 ore on-demand`,
              "12 mesi di accesso ai contenuti",
              "Esercitazioni vocali interattive",
              "Slide e materiali scaricabili",
              "Libreria di prompt professionali",
              "Checklist conformità GDPR",
              "Community WhatsApp privata",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: i < 7 ? "1px solid #e5e5e5" : undefined }}>
                <span className="font-black text-lg flex-shrink-0" style={{ color: BLUE }}>✓</span>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
            <div style={{ padding: "1.5rem", background: SKY, borderTop: "2px solid #0a0a0a" }}>
              <div className="flex items-end gap-3">
                <span className="text-sm line-through font-medium" style={{ color: "#666" }}>€420</span>
                <span className="font-black text-4xl" style={{ color: "#0a0a0a", lineHeight: 1 }}>€297</span>
              </div>
              <button onClick={onLogin} className="w-full mt-4 font-black uppercase py-4 text-base transition-all"
                style={{ background: BLUE, color: "#fff", border: "2px solid #0a0a0a", letterSpacing: "0.06em" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#0a0a0a"; }}
                onMouseLeave={e => { e.currentTarget.style.background = BLUE; }}
              >
                Acquista ora →
              </button>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div>
          <h3 className="font-black uppercase text-2xl mb-8" style={{ letterSpacing: "-0.01em", borderBottom: "2px solid #0a0a0a", paddingBottom: "1rem" }}>Il programma</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {CORSO.map((lezione) => (
              <div key={lezione.id} style={{ border: "2px solid #0a0a0a", background: "#fff" }}>
                <div style={{ background: SKY, padding: "1rem 1.25rem", borderBottom: "2px solid #0a0a0a", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span className="font-black text-3xl" style={{ color: NAVY, lineHeight: 1 }}>0{lezione.number}</span>
                  <div>
                    <div className="text-xs font-bold uppercase mb-0.5" style={{ letterSpacing: "0.1em", color: BLUE }}>Modulo · 4h</div>
                    <div className="font-black text-base uppercase" style={{ lineHeight: 1.1 }}>{lezione.title}</div>
                  </div>
                </div>
                <ul style={{ listStyle: "none", padding: "0.75rem 1.25rem" }}>
                  {lezione.subtopics.map((sub) => (
                    <li key={sub.id} className="text-sm py-2 flex items-start gap-2" style={{ borderBottom: "1px dashed #e5e5e5", lineHeight: 1.5 }}>
                      <span style={{ color: BLUE, fontWeight: 900, flexShrink: 0 }}>→</span>
                      {sub.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI TUTOR SECTION */}
      <section id="tutor" style={{ background: NAVY, borderTop: "2px solid #0a0a0a", borderBottom: "2px solid #0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-bold uppercase mb-4" style={{ letterSpacing: "0.15em", color: BLUE }}>Incluso nel corso</div>
            <h2 className="font-black uppercase text-white mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
              Il tuo AI<br />tutor<br /><span style={{ color: SKY }}>personale.</span>
            </h2>
            <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
              Ogni studente riceve un AI tutor addestrato sui contenuti del corso. Risponde ai tuoi dubbi in italiano, 24/7 — calibrato sul tuo livello.
            </p>
            <div className="space-y-4">
              {[
                ["Principiante", "Spiega in modo semplice con analogie quotidiane"],
                ["Intermedio", "Usa termini tecnici con esempi clinici pratici"],
                ["Esperto", "Va dritto al punto, sfumature avanzate"],
              ].map(([level, desc]) => (
                <div key={level} className="flex gap-4 items-start p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <span className="font-black text-sm uppercase flex-shrink-0" style={{ color: BLUE }}>{level}</span>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat mockup */}
          <div style={{ background: "#0a0a0a", border: "2px solid rgba(255,255,255,0.15)", padding: "1.5rem" }}>
            <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="w-9 h-9 flex items-center justify-center font-black text-sm" style={{ background: BLUE, color: "#fff" }}>UZ</div>
              <div>
                <p className="text-sm font-bold text-white">AI Tutor · Unozen</p>
                <p className="text-xs flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#4ade80" }} />attivo ora
                </p>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div className="text-sm px-3.5 py-2.5 ml-auto max-w-[85%]" style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                Come struturo un prompt per analizzare un caso clinico?
              </div>
              <div className="text-sm px-3.5 py-2.5 max-w-[85%]" style={{ background: BLUE, color: "#fff" }}>
                Nel Modulo 2 vediamo l'anatomia: ruolo + contesto + dati + formato. Per un caso CBT parti dal modello ABC. Vuoi un esempio?
              </div>
              <div className="text-sm px-3.5 py-2.5 ml-auto max-w-[85%]" style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                Sì, fammi vedere
              </div>
              <div className="flex gap-1 px-3.5 py-3 w-fit" style={{ background: BLUE }}>
                {[0, 0.16, 0.32].map((d, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#fff", animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" }}>
              <span>Scrivi o parla con l'AI…</span>
              <div className="w-7 h-7 flex items-center justify-center font-bold text-xs" style={{ background: BLUE, color: "#fff" }}>●</div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTRUCTOR */}
      <section id="docente" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div style={{ border: "2px solid #0a0a0a", background: SKY, padding: "3rem" }}>
            <div className="font-black uppercase text-6xl mb-1" style={{ letterSpacing: "-0.03em", lineHeight: 0.9, color: NAVY }}>Matteo<br />Grassi</div>
            <div className="text-xs font-bold uppercase mt-3 mb-6" style={{ letterSpacing: "0.12em", color: BLUE }}>Docente · Co-founder Unozen.ai</div>
            <div className="flex flex-wrap gap-2">
              {["Psicologia", "Voice AI", "Healthcare", "Startup mentor", "Dublino"].map(tag => (
                <span key={tag} className="text-xs font-bold uppercase px-3 py-1.5" style={{ background: "#0a0a0a", color: "#fff", letterSpacing: "0.08em" }}>{tag}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase mb-4" style={{ letterSpacing: "0.15em", color: BLUE }}>Chi insegna</div>
            <h2 className="font-black uppercase mb-6 text-3xl" style={{ letterSpacing: "-0.02em", lineHeight: 1 }}>Una guida che ha attraversato il territorio.</h2>
            <p className="text-sm mb-4" style={{ lineHeight: 1.7, color: "#444" }}>
              Vivo e lavoro in Irlanda, mi sono laureato in Italia in Psicologia. Sono fondatore di Hana, una piattaforma di engagement vocale per il supporto dei pazienti, utilizzata in USA, UK ed Europa.
            </p>
            <p className="text-sm mb-8" style={{ lineHeight: 1.7, color: "#444" }}>
              Lavoro e sviluppo progetti in ambito AI da molti anni. Costruisco le stesse tecnologie che ti insegnerò ad usare.
            </p>
            <button onClick={onLogin} className="font-bold uppercase px-6 py-3.5 text-sm transition-all"
              style={{ background: BLUE, color: "#fff", border: "2px solid #0a0a0a", letterSpacing: "0.06em" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#0a0a0a"; }}
              onMouseLeave={e => { e.currentTarget.style.background = BLUE; }}
            >
              Inizia il corso →
            </button>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="recensioni" style={{ background: SKY, borderTop: "2px solid #0a0a0a", borderBottom: "2px solid #0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-black uppercase text-center mb-12" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", lineHeight: 0.95 }}>
            Cosa dicono i<br /><span style={{ color: NAVY }}>partecipanti.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ background: "#fff", border: "2px solid #0a0a0a", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="font-black text-5xl leading-none" style={{ color: BLUE, opacity: 0.35 }}>"</div>
                <p className="text-sm flex-1" style={{ lineHeight: 1.7, color: "#333" }}>{r.text}</p>
                <div>
                  <p className="font-bold text-sm">{r.author}</p>
                  <p className="text-xs font-medium uppercase" style={{ letterSpacing: "0.08em", color: BLUE }}>{r.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="iscriviti" style={{ background: BLUE, borderBottom: "2px solid #0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="text-xs font-bold uppercase mb-6 inline-block px-5 py-2" style={{ background: "#0a0a0a", color: "#fff", letterSpacing: "0.12em" }}>
            ⏱ Posti limitati — Edizione 4
          </div>
          <h2 className="font-black uppercase text-white mb-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
            Pronto a smettere<br />di improvvisare?
          </h2>
          <p className="text-base font-medium mb-10 text-white opacity-80">Solo 30 posti per edizione.</p>
          <button onClick={onLogin} className="font-black uppercase px-12 py-5 text-xl transition-all inline-block"
            style={{ background: "#fff", color: "#0a0a0a", border: "2px solid #0a0a0a", letterSpacing: "0.04em" }}
            onMouseEnter={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0a0a0a"; }}
          >
            Inizia il corso — €297 →
          </button>
          <p className="text-sm mt-6 text-white opacity-70">Bonifico? Scrivi a <strong>info@unozen.it</strong></p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0a0a0a", color: "#fff", padding: "3rem 1.5rem 2rem" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 pb-8" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="col-span-2 md:col-span-1">
            <img src={LOGO} alt="Unozen" className="h-7 w-auto object-contain mb-3" style={{ filter: "brightness(10)" }} />
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>L'ecosistema AI per i professionisti italiani della salute mentale.</p>
          </div>
          {[
            ["Corso", ["#programma:Programma", "#tutor:AI Tutor", "#docente:Docente", "#iscriviti:Iscriviti"]],
            ["Unozen", ["#:Chi siamo", "#:Contatti", "#:Community"]],
            ["Contatti", ["mailto:info@unozen.it:info@unozen.it", "#:Privacy", "#:Termini"]],
          ].map(([title, links]) => (
            <div key={title as string}>
              <h5 className="text-xs font-bold uppercase mb-3" style={{ letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>{title}</h5>
              {(links as string[]).map(link => {
                const [href, label] = link.split(":");
                return (
                  <a key={label} href={href} className="block text-sm py-1" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{label}</a>
                );
              })}
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto flex justify-between pt-6 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          <span>© 2026 Unozen.ai</span>
          <span>Edizione 4 · 2026</span>
        </div>
      </footer>
    </div>
  );
}
