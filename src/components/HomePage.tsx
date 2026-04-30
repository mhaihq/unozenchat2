import { useState } from "react";
import { motion } from "motion/react";
import { CORSO } from "../lib/courseData";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const totalSubtopics = CORSO.flatMap(l => l.subtopics).length;

  return (
    <div className="min-h-screen font-sans" style={{ background: "#f4ede1", color: "#1a1612" }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 border-b" style={{ background: "rgba(244,237,225,0.88)", backdropFilter: "blur(12px)", borderColor: "#d4c8b3" }}>
        <div className="font-serif text-xl" style={{ letterSpacing: "-0.02em" }}>
          Unozen<span style={{ color: "#c5552d" }}>.ai</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[["#programma","Programma"],["#tutor","AI Tutor"],["#docente","Docente"],["#recensioni","Recensioni"]].map(([href, label]) => (
            <a key={href} href={href} className="text-sm transition-colors" style={{ color: "#1a1612" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#c5552d")}
              onMouseLeave={e => (e.currentTarget.style.color = "#1a1612")}
            >{label}</a>
          ))}
        </div>
        <button
          onClick={onLogin}
          className="text-sm px-4 py-2 rounded-full transition-all"
          style={{ background: "#1a1612", color: "#f4ede1" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#c5552d")}
          onMouseLeave={e => (e.currentTarget.style.background = "#1a1612")}
        >
          Accedi
        </button>
      </nav>

      {/* HERO */}
      <header className="pt-32 pb-20 px-6 sm:px-10 max-w-5xl mx-auto text-center">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-xs uppercase mb-6 flex items-center justify-center gap-3"
          style={{ letterSpacing: "0.15em", color: "#6b5f4c", fontFamily: "monospace" }}
        >
          <span style={{ display: "block", width: 28, height: 1, background: "#1a1612" }} />
          Edizione 4 — 2026
          <span style={{ display: "block", width: 28, height: 1, background: "#1a1612" }} />
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif mb-6"
          style={{ fontSize: "clamp(3rem,7vw,5.5rem)", lineHeight: 0.95, letterSpacing: "-0.03em", fontWeight: 300 }}
        >
          Intelligenza <em style={{ color: "#c5552d", fontStyle: "italic" }}>Artificiale.</em><br />
          Spiegata semplice.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="font-serif mx-auto mb-10"
          style={{ fontSize: "1.25rem", lineHeight: 1.55, fontWeight: 300, maxWidth: "52ch", color: "#1a1612" }}
        >
          Un corso on-demand con un AI tutor che risponde ai tuoi dubbi, esercitazioni vocali interattive e una community privata. Imparare l'AI <em style={{ fontStyle: "italic" }}>usando</em> l'AI.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-6 flex-wrap mb-16"
        >
          <button
            onClick={onLogin}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-medium transition-all"
            style={{ background: "#1a1612", color: "#f4ede1", border: "1px solid #1a1612" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#c5552d"; e.currentTarget.style.borderColor = "#c5552d"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1a1612"; e.currentTarget.style.borderColor = "#1a1612"; }}
          >
            Inizia il corso <span>→</span>
          </button>
          <div className="flex flex-col text-left">
            <span className="text-sm line-through" style={{ color: "#6b5f4c", fontFamily: "monospace" }}>€420</span>
            <span className="font-serif text-2xl" style={{ color: "#c5552d", lineHeight: 1 }}>€297</span>
          </div>
        </motion.div>

        {/* Hero visual — dark card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto rounded-xl overflow-hidden shadow-2xl"
          style={{ maxWidth: 880, background: "#1a1612", aspectRatio: "16/9", position: "relative" }}
        >
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 25% 30%, rgba(201,150,63,0.18) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(197,85,45,0.22) 0%, transparent 55%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem 2rem", color: "#f4ede1", zIndex: 2 }}>
            <span className="text-xs px-4 py-2 rounded-full self-start" style={{ background: "rgba(244,237,225,0.1)", border: "1px solid rgba(244,237,225,0.18)", letterSpacing: "0.12em", fontFamily: "monospace", color: "#c9963f" }}>
              AI PER PSICOLOGI · {CORSO.length} LEZIONI · {totalSubtopics} ARGOMENTI
            </span>
            <div>
              <img src={LOGO} alt="Unozen" className="h-10 w-auto object-contain mb-4 opacity-80" style={{ filter: "brightness(10)" }} />
              <p className="font-serif text-xl" style={{ fontStyle: "italic", fontWeight: 300, lineHeight: 1.3 }}>
                "Ti spiego perché questo corso è diverso."
              </p>
              <p className="text-xs mt-2" style={{ fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(244,237,225,0.5)", textTransform: "uppercase" }}>— Matteo Grassi</p>
            </div>
          </div>
        </motion.div>
      </header>

      {/* FORMAT BAR */}
      <div style={{ background: "#1a1612", borderTop: "1px solid #1a1612", borderBottom: "1px solid #1a1612" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ["▶", "4 moduli video", "16 ore on-demand"],
            ["✦", "AI Tutor incluso", "Risposte 24/7 in italiano"],
            ["◐", "Voce interattiva", "Parli davvero con l'AI"],
            ["⌘", "Community privata", "WhatsApp con i partecipanti"],
          ].map(([icon, title, sub]) => (
            <div key={title} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-serif text-lg"
                style={{ border: "1px solid rgba(201,150,63,0.4)", color: "#c9963f" }}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#f4ede1" }}>{title}</p>
                <p className="text-xs" style={{ color: "rgba(244,237,225,0.55)" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
        <p className="text-xs uppercase mb-4 flex items-center gap-3" style={{ letterSpacing: "0.15em", color: "#c5552d", fontFamily: "monospace" }}>
          <span style={{ display: "block", width: 24, height: 1, background: "#c5552d" }} />01 — Il contesto
        </p>
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="font-serif mb-8" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.03em" }}>
              Perché conoscere<br /><em style={{ color: "#c5552d", fontStyle: "italic" }}>l'AI</em>, davvero.
            </h2>
            <div className="font-serif space-y-5 text-lg" style={{ fontWeight: 300, lineHeight: 1.65, color: "#1a1612" }}>
              <p>Siamo di fronte a una vera rivoluzione che modificherà — e lo sta già facendo — gran parte del nostro mondo lavorativo e professionale.</p>
              <p>Questo corso è pensato per il professionista curioso, che vuole restare competitivo e usare l'AI in modo concreto, etico e intelligente.</p>
              <p>Non serve essere informatici: serve solo curiosità.</p>
            </div>
          </div>
          <blockquote className="p-8" style={{ background: "#ebe1d0", borderLeft: "3px solid #c5552d" }}>
            <p className="font-serif text-xl" style={{ fontWeight: 300, fontStyle: "italic", lineHeight: 1.5, color: "#1a1612" }}>
              "L'AI non sostituisce il tuo lavoro. Lo amplifica. La differenza la fa chi capisce davvero come usarla — con metodo, etica e supervisione critica."
            </p>
            <span className="block mt-5 text-xs uppercase" style={{ fontFamily: "monospace", letterSpacing: "0.1em", color: "#6b5f4c" }}>— Premessa del corso</span>
          </blockquote>
        </div>
      </section>

      {/* AI TUTOR */}
      <section id="tutor" style={{ background: "#ebe1d0", borderTop: "1px solid #d4c8b3", borderBottom: "1px solid #d4c8b3" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-24 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase mb-4 flex items-center gap-3" style={{ letterSpacing: "0.15em", color: "#c5552d", fontFamily: "monospace" }}>
              <span style={{ display: "block", width: 24, height: 1, background: "#c5552d" }} />02 — La differenza
            </p>
            <h2 className="font-serif mb-6" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.03em" }}>
              Risposte al <em style={{ color: "#c5552d", fontStyle: "italic" }}>tuo livello.</em><br />Sui <em style={{ color: "#c5552d", fontStyle: "italic" }}>tuoi dubbi.</em>
            </h2>
            <p className="font-serif text-lg mb-8" style={{ fontWeight: 300, lineHeight: 1.6, color: "#1a1612", maxWidth: "38ch" }}>
              Ogni studente riceve un AI tutor personale, addestrato sui contenuti del corso. Risponde ai tuoi dubbi specifici — non con risposte generiche.
            </p>
            <ul className="space-y-0" style={{ borderTop: "1px dashed #d4c8b3" }}>
              {[
                ["i.", "Calibrato sul tuo livello", "Principiante, intermedio o esperto. Nessuna risposta generica."],
                ["ii.", "Risponde 24/7 in italiano", "Non aspetti il prossimo modulo. Chiedi quando ti serve."],
                ["iii.", "Esercitazioni vocali", "Pratichi i prompt parlando — ti correggi in tempo reale."],
                ["iv.", "Memoria del percorso", "Sa cosa hai già visto e cosa ti confonde."],
              ].map(([num, title, sub]) => (
                <li key={num as string} className="flex gap-4 py-4" style={{ borderBottom: "1px dashed #d4c8b3" }}>
                  <span className="font-serif text-xl flex-shrink-0 w-6" style={{ color: "#c5552d", fontStyle: "italic" }}>{num}</span>
                  <div>
                    <p className="font-medium text-sm mb-0.5">{title}</p>
                    <p className="text-sm" style={{ color: "#6b5f4c" }}>{sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat mockup */}
          <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: "#1a1612", color: "#f4ede1", padding: "1.5rem" }}>
            <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: "1px solid rgba(244,237,225,0.1)" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-serif font-medium" style={{ background: "linear-gradient(135deg,#c9963f,#c5552d)", color: "#1a1612" }}>UZ</div>
              <div>
                <p className="text-sm font-medium">AI Tutor · Unozen</p>
                <p className="text-xs flex items-center gap-1.5" style={{ color: "rgba(244,237,225,0.5)" }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#5cb85c" }} />attivo ora
                </p>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div className="text-sm px-3.5 py-2.5 rounded-xl rounded-br-sm ml-auto max-w-[85%]" style={{ background: "rgba(244,237,225,0.08)" }}>
                Come strutturo un prompt per analizzare un caso clinico?
              </div>
              <div className="text-sm px-3.5 py-2.5 rounded-xl rounded-bl-sm max-w-[85%]" style={{ background: "rgba(201,150,63,0.12)", border: "1px solid rgba(201,150,63,0.2)" }}>
                Nel Modulo 2 vediamo l'anatomia: ruolo + contesto + dati + formato. Per un caso CBT ti consiglio di partire dal modello ABC. Vuoi un esempio pratico?
              </div>
              <div className="text-sm px-3.5 py-2.5 rounded-xl rounded-br-sm ml-auto max-w-[85%]" style={{ background: "rgba(244,237,225,0.08)" }}>
                Sì, fammi vedere
              </div>
              <div className="flex gap-1 px-3.5 py-3 rounded-xl rounded-bl-sm w-fit" style={{ background: "rgba(201,150,63,0.12)" }}>
                {[0, 0.16, 0.32].map((d, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#c9963f", animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 rounded-full text-sm" style={{ background: "rgba(244,237,225,0.05)", border: "1px solid rgba(244,237,225,0.1)", color: "rgba(244,237,225,0.4)" }}>
              <span>Scrivi o parla con l'AI…</span>
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#c5552d", color: "#f4ede1", fontSize: "0.8rem" }}>●</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMMA */}
      <section id="programma" className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
        <div className="text-center mb-16">
          <p className="text-xs uppercase mb-4 flex items-center justify-center gap-3" style={{ letterSpacing: "0.15em", color: "#c5552d", fontFamily: "monospace" }}>
            03 — Il programma
          </p>
          <h2 className="font-serif" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.03em" }}>
            {CORSO.length} moduli. <em style={{ color: "#c5552d", fontStyle: "italic" }}>16 ore.</em>
          </h2>
        </div>
        <div style={{ borderTop: "1px solid #1a1612" }}>
          {CORSO.map((lezione, i) => (
            <div key={lezione.id} className="grid md:grid-cols-[80px_1fr_2fr] gap-6 md:gap-12 py-8 md:py-10 transition-all"
              style={{ borderBottom: "1px solid #1a1612" }}>
              <div className="font-serif text-5xl" style={{ fontWeight: 300, lineHeight: 0.85, color: "#1a1612" }}>0{lezione.number}</div>
              <div>
                <p className="text-xs uppercase mb-2 flex items-center gap-1.5" style={{ letterSpacing: "0.12em", color: "#c5552d", fontFamily: "monospace" }}>
                  ▶ Modulo video · 4h
                </p>
                <h3 className="font-serif text-2xl mb-2" style={{ fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{lezione.title}</h3>
                <p className="text-xs" style={{ fontFamily: "monospace", color: "#6b5f4c" }}>
                  {i === 0 ? "Disponibile ora" : `Modulo ${i + 1}`}
                </p>
              </div>
              <ul style={{ listStyle: "none" }}>
                {lezione.subtopics.map((sub) => (
                  <li key={sub.id} className="text-sm py-2 pl-5 relative" style={{ borderBottom: "1px dashed #d4c8b3", lineHeight: 1.5, color: "#1a1612" }}>
                    <span className="absolute left-0" style={{ color: "#c5552d", fontWeight: 600 }}>→</span>
                    {sub.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section style={{ background: "#ebe1d0", borderTop: "1px solid #d4c8b3", borderBottom: "1px solid #d4c8b3" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
          <p className="text-xs uppercase mb-4 flex items-center gap-3" style={{ letterSpacing: "0.15em", color: "#c5552d", fontFamily: "monospace" }}>
            <span style={{ display: "block", width: 24, height: 1, background: "#c5552d" }} />04 — Cosa è incluso
          </p>
          <h2 className="font-serif mb-10" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.03em" }}>
            Tutto quello che<br />porti a <em style={{ color: "#c5552d", fontStyle: "italic" }}>casa.</em>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ["№ 01 · Signature", "AI Tutor personale 24/7 — chat e voce, in italiano", true],
              ["№ 02", "16 ore di video on-demand, registrate da Matteo", false],
              ["№ 03", "12 mesi di accesso a tutti i contenuti", false],
              ["№ 04", "Esercitazioni vocali interattive nei moduli", false],
              ["№ 05", "Slide e materiali scaricabili", false],
              ["№ 06", "Libreria di prompt per diverse professioni", false],
              ["№ 07", "Checklist di conformità GDPR", false],
              ["№ 08", "Gruppo WhatsApp privato con i partecipanti", false],
              ["№ 09", "Glossario AI completo + risorse per approfondire", false],
            ].map(([num, text, highlight]) => (
              <div key={num as string} className="p-6 rounded-sm" style={{
                background: highlight ? "#1a1612" : "#f4ede1",
                color: highlight ? "#f4ede1" : "#1a1612",
                border: `1px solid ${highlight ? "#1a1612" : "#d4c8b3"}`,
              }}>
                <p className="text-xs mb-3" style={{ fontFamily: "monospace", letterSpacing: "0.1em", color: highlight ? "#c9963f" : "#c5552d" }}>{num}</p>
                <p className="font-serif text-lg" style={{ fontWeight: 400, lineHeight: 1.35 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTRUCTOR */}
      <section id="docente" style={{ background: "#1a1612", color: "#f4ede1" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-24 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase mb-4 flex items-center gap-3" style={{ letterSpacing: "0.15em", color: "#c9963f", fontFamily: "monospace" }}>
              <span style={{ display: "block", width: 24, height: 1, background: "#c9963f" }} />05 — Chi insegna
            </p>
            <h2 className="font-serif mb-6" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.03em" }}>
              Una <em style={{ color: "#c9963f", fontStyle: "italic" }}>guida</em> che ha<br />attraversato il territorio.
            </h2>
            <div className="font-serif space-y-4 text-lg" style={{ fontWeight: 300, lineHeight: 1.6, color: "rgba(244,237,225,0.85)" }}>
              <p>Vivo e lavoro in Irlanda, mi sono laureato in Italia in Psicologia. Sono fondatore di Hana, una piattaforma di engagement vocale per il supporto dei pazienti, utilizzata in USA, UK ed Europa.</p>
              <p>Lavoro e sviluppo progetti in ambito AI da molti anni. Costruisco le stesse tecnologie che ti insegnerò ad usare.</p>
            </div>
          </div>
          <div className="p-8 rounded-sm" style={{ background: "#f4ede1", color: "#1a1612" }}>
            <h3 className="font-serif text-4xl mb-1" style={{ fontWeight: 400, letterSpacing: "-0.02em" }}>Matteo Grassi</h3>
            <p className="text-xs uppercase mb-6" style={{ fontFamily: "monospace", letterSpacing: "0.1em", color: "#c5552d" }}>Docente · Co-founder Unozen.ai</p>
            <p className="font-serif text-lg mb-6" style={{ fontWeight: 300, lineHeight: 1.55 }}>
              Psicologo, fondatore, mentore. Vivo a Dublino, lavoro tra USA, UK ed Europa. Da anni progetto strumenti AI per professionisti della salute mentale.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Psicologia", "Voice AI", "Healthcare", "Startup mentor", "Open-source"].map(tag => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full" style={{ background: "#ebe1d0", border: "1px solid #d4c8b3", fontFamily: "monospace" }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="recensioni" className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
        <div className="text-center mb-16">
          <p className="text-xs uppercase mb-4 flex items-center justify-center gap-3" style={{ letterSpacing: "0.15em", color: "#c5552d", fontFamily: "monospace" }}>06 — Recensioni</p>
          <h2 className="font-serif mb-2" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.03em" }}>
            Cosa dicono i <em style={{ color: "#c5552d", fontStyle: "italic" }}>partecipanti.</em>
          </h2>
          <p className="font-serif text-lg" style={{ fontWeight: 300, fontStyle: "italic", color: "#6b5f4c" }}>Recensioni vere, non inventate.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <div key={i} className="p-8 rounded-sm flex flex-col relative" style={{ background: "#ebe1d0", border: "1px solid #d4c8b3", transform: i % 2 === 1 ? "translateY(16px)" : undefined }}>
              <span className="absolute top-4 left-5 font-serif text-6xl leading-none opacity-20" style={{ color: "#c5552d" }}>"</span>
              <p className="font-serif text-base mb-6 flex-1 mt-4" style={{ fontWeight: 400, lineHeight: 1.6, color: "#1a1612" }}>{r.text}</p>
              <div>
                <p className="font-medium text-sm">{r.author}</p>
                <p className="text-xs" style={{ color: "#6b5f4c" }}>{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="iscriviti" className="text-center py-32 px-6 relative overflow-hidden">
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle, #c5552d 0%, transparent 60%)", opacity: 0.08, filter: "blur(40px)", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="inline-block text-xs px-5 py-2.5 rounded-full mb-8" style={{ background: "#1a1612", color: "#c9963f", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            ⏱ Iscriviti — Posti limitati
          </div>
          <h2 className="font-serif mx-auto mb-4" style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.03em", maxWidth: "18ch" }}>
            Pronto a smettere di <em style={{ color: "#c5552d", fontStyle: "italic" }}>improvvisare?</em>
          </h2>
          <p className="font-serif text-xl mb-10" style={{ fontWeight: 300, color: "#6b5f4c" }}>
            Solo 30 posti per edizione.
          </p>
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-2 text-base font-medium px-8 py-4 rounded-full transition-all"
            style={{ background: "#1a1612", color: "#f4ede1", border: "1px solid #1a1612" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#c5552d"; e.currentTarget.style.borderColor = "#c5552d"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1a1612"; e.currentTarget.style.borderColor = "#1a1612"; }}
          >
            Inizia il corso — €297 <span>→</span>
          </button>
          <p className="text-sm mt-6" style={{ fontFamily: "monospace", color: "#6b5f4c" }}>
            Pagamento con bonifico? Scrivi a <strong style={{ color: "#1a1612" }}>info@unozen.it</strong>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1a1612", color: "#f4ede1", padding: "4rem 2rem 2rem" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 pb-10" style={{ borderBottom: "1px solid rgba(244,237,225,0.15)" }}>
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-serif text-3xl mb-3" style={{ fontWeight: 400 }}>Unozen<span style={{ color: "#c5552d" }}>.ai</span></h3>
            <p className="text-sm" style={{ color: "rgba(244,237,225,0.55)", maxWidth: "32ch", lineHeight: 1.6 }}>L'ecosistema AI per i professionisti italiani della salute mentale.</p>
          </div>
          {[
            ["Corso", ["#programma:Programma", "#tutor:AI Tutor", "#docente:Docente", "#iscriviti:Iscriviti"]],
            ["Unozen", ["#:Chi siamo", "#:Contatti", "#:Community", "#:Corsi"]],
            ["Contatti", ["mailto:info@unozen.it:info@unozen.it", "#:Privacy", "#:Termini"]],
          ].map(([title, links]) => (
            <div key={title as string}>
              <h5 className="text-xs uppercase mb-4" style={{ fontFamily: "monospace", letterSpacing: "0.1em", color: "#c9963f" }}>{title}</h5>
              {(links as string[]).map(link => {
                const [href, label] = link.split(":");
                return (
                  <a key={label} href={href} className="block text-sm py-1.5 transition-colors" style={{ color: "rgba(244,237,225,0.6)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#f4ede1")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(244,237,225,0.6)")}
                  >{label}</a>
                );
              })}
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between pt-6 text-xs" style={{ color: "rgba(244,237,225,0.4)", fontFamily: "monospace" }}>
          <span>© 2026 Unozen.ai — Tutti i diritti riservati</span>
          <span>Edizione 4 · 2026</span>
        </div>
      </footer>
    </div>
  );
}
