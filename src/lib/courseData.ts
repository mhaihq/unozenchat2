export interface Subtopic {
  id: string;
  title: string;
  bullets: string[];
  suggestedQuestions: string[];
}

export interface Lezione {
  id: string;
  number: number;
  title: string;
  focus: string;
  videoId?: string;
  presentationUrl?: string;
  subtopics: Subtopic[];
}

export const CORSO: Lezione[] = [
  {
    id: "lezione-1",
    number: 1,
    title: "Le Fondamenta",
    focus: "Come funziona l'AI, mercato, etica e rischi. Focus: Teoria, mercato, regolamentazione e privacy.",
    videoId: "1186228117",
    presentationUrl: "https://docs.google.com/presentation/d/1YKWj0Uc5VA2MFmEJkLwLrzoX2708ixWD/preview",
    subtopics: [
      {
        id: "l1-s1",
        title: "Storia e funzionamento dell'AI",
        bullets: [
          "Evoluzione: dal primo Inverno dell'AI ai modelli di oggi.",
          "Machine Learning e Deep Learning spiegati semplicemente.",
          "Come nasce un LLM e la \"Metafora dello Chef\" (Training vs. Context Window).",
          "Capire e gestire le \"Allucinazioni\" (Next-token prediction vs. confabulazione).",
        ],
        suggestedQuestions: [
          "Cos'è il Machine Learning in parole semplici?",
          "Spiega la Metafora dello Chef per i modelli LLM",
          "Perché i modelli AI allucinano e come posso ridurlo?",
          "Qual è la differenza tra Training e Context Window?",
        ],
      },
      {
        id: "l1-s2",
        title: "Il mercato AI oggi",
        bullets: [
          "La differenza tra Tecnologia (Modello), Prodotto e Azienda.",
          "I principali player (OpenAI, Anthropic, Google, Meta, DeepSeek).",
          "La \"bolla AI\" e il dibattito Open Source vs. Modelli Proprietari.",
        ],
        suggestedQuestions: [
          "Qual è la differenza tra OpenAI, Anthropic e Google nel mercato AI?",
          "Cosa significa che un modello è \"open source\"? Quali sono i vantaggi?",
          "Come scelgo il modello AI giusto per il mio studio?",
          "Esiste davvero una bolla speculativa attorno all'AI?",
        ],
      },
      {
        id: "l1-s3",
        title: "Etica, Rischi e Regolamentazione",
        bullets: [
          "Privacy: I limiti di ChatGPT con i dati dei pazienti (Server extra-UE, opt-out).",
          "I tre pilastri regolatori: GDPR (dati sanitari), AI Act europeo e Codice Deontologico CNOP.",
          "Checklist etica pratica per l'uso dell'AI in studio.",
        ],
        suggestedQuestions: [
          "Posso usare ChatGPT per scrivere note cliniche sui pazienti?",
          "Cosa dice il GDPR sull'uso dell'AI con dati sanitari?",
          "Come posso usare l'AI rispettando il Codice Deontologico CNOP?",
          "Quali strumenti AI sono conformi alla normativa europea?",
        ],
      },
    ],
  },
  {
    id: "lezione-2",
    number: 2,
    title: "Prompt Engineering per Psicologi",
    focus: "Imparare a comunicare con l'AI, framework testuali e simulazioni cliniche.",
    subtopics: [
      {
        id: "l2-s1",
        title: "Il cambio di mentalità",
        bullets: [
          "L'AI come \"specializzando\" brillante ma acerbo.",
          "Chat usa-e-getta vs. System Prompt permanenti.",
        ],
        suggestedQuestions: [
          "Come devo approcciarmi all'AI per ottenere risultati migliori?",
          "Cosa sono i System Prompt e come li uso?",
          "Perché ogni nuova chat riparte da zero?",
          "Come mantenere coerenza tra sessioni diverse con l'AI?",
        ],
      },
      {
        id: "l2-s2",
        title: "Costruire istruzioni inattaccabili",
        bullets: [
          "Il Framework R.I.C.E.V.O. (Ruolo, Istruzione, Contesto, Esempi, Vincoli, Output).",
          "L'importanza dei Vincoli come strumento anti-allucinazione.",
        ],
        suggestedQuestions: [
          "Spiegami il framework R.I.C.E.V.O. con un esempio clinico",
          "Come uso i Vincoli per evitare che l'AI inventi informazioni?",
          "Scrivimi un prompt usando R.I.C.E.V.O. per redigere una relazione psicologica",
          "Quali errori comuni si fanno scrivendo prompt per uso clinico?",
        ],
      },
      {
        id: "l2-s3",
        title: "Tecniche Avanzate e Ragionamento",
        bullets: [
          "Chain of Thought (Catena di pensieri).",
          "Il concetto di RAG (Retrieval-Augmented Generation) per ancorare l'AI alle fonti.",
          "Critical Analysis Filter: usare l'AI per auto-revisionarsi.",
        ],
        suggestedQuestions: [
          "Cos'è il Chain of Thought e come lo applico in pratica?",
          "Come funziona il RAG e perché riduce le allucinazioni?",
          "Come posso usare l'AI per revisionare criticamente il mio lavoro?",
          "Dammi un esempio di prompt Chain of Thought per una diagnosi differenziale",
        ],
      },
      {
        id: "l2-s4",
        title: "L'AI come Paziente Simulato (Role-Play)",
        bullets: [
          "Costruire un prompt-paziente (Storia, difese, stile comunicativo).",
          "Evitare il \"Therapy Drift\" (quando l'AI smette di fare il paziente).",
          "Workshop Pratico: Costruzione del primo \"Mega-Prompt\" clinico individuale.",
        ],
        suggestedQuestions: [
          "Come costruisco un prompt-paziente realistico per simulare una sessione?",
          "Cos'è il Therapy Drift e come lo prevengo nel role-play?",
          "Scrivimi un esempio di Mega-Prompt per simulare un paziente con ansia sociale",
          "Quali limiti etici devo considerare nel role-play clinico con l'AI?",
        ],
      },
    ],
  },
  {
    id: "lezione-3",
    number: 3,
    title: "ChatGPT e Claude",
    focus: "L'Arsenale del Professionista. Deep-dive demo-centrico sui due strumenti leader e le loro funzioni più avanzate.",
    subtopics: [
      {
        id: "l3-s1",
        title: "L'Ecosistema OpenAI (ChatGPT)",
        bullets: [
          "La flotta dei modelli: GPT-4o, GPT-5, modello o3 (per il ragionamento logico).",
          "Scrittura collaborativa con ChatGPT \"Canvas\".",
          "Advanced Voice Mode: debriefing clinico a voce e riflessione guidata.",
          "Costruire \"Custom GPTs\" per automatizzare task ricorrenti.",
        ],
        suggestedQuestions: [
          "Qual è la differenza pratica tra GPT-4o e il modello o3?",
          "Come uso Canvas di ChatGPT per scrivere relazioni cliniche?",
          "Come costruisco un Custom GPT per il mio studio psicologico?",
          "Posso usare la Advanced Voice Mode per il debriefing clinico?",
        ],
      },
      {
        id: "l3-s2",
        title: "L'Ecosistema Anthropic (Claude)",
        bullets: [
          "La famiglia Claude 4 (Haiku 4.5, Sonnet 4.6, Opus 4.7) e la \"Constitutional AI\".",
          "Il salto generazionale: l'\"Adaptive Thinking\" per le diagnosi differenziali.",
          "Utilizzo strategico della sintassi XML per farsi capire meglio.",
        ],
        suggestedQuestions: [
          "Quando uso Haiku vs Sonnet vs Opus di Claude?",
          "Cos'è la Constitutional AI e perché è rilevante per i clinici?",
          "Come uso i tag XML nei prompt di Claude per risultati migliori?",
          "Come sfrutto l'Adaptive Thinking per le diagnosi differenziali?",
        ],
      },
      {
        id: "l3-s3",
        title: "La vostra Clinica Digitale su Claude",
        bullets: [
          "La nuova Memoria Persistente di Claude.",
          "I \"Projects\": stanze di lavoro chiuse con tonnellate di PDF (1 Milione di Token).",
          "Gli \"Artifacts\": generare schede cliniche visive, diari e genogrammi interattivi.",
        ],
        suggestedQuestions: [
          "Come funziona la Memoria Persistente di Claude?",
          "Come organizzo i miei documenti clinici in un Project su Claude?",
          "Cosa posso creare con gli Artifacts di Claude in ambito clinico?",
          "Come genero un genogramma interattivo con Claude?",
        ],
      },
      {
        id: "l3-s4",
        title: "Automazione Locale e Ricerca",
        bullets: [
          "\"Claude Cowork\" (App Desktop) e il Model Context Protocol (MCP) per lavorare direttamente sui file locali in sicurezza.",
          "Workshop Pratico: Costruzione di un Custom GPT o di un Progetto/Artifact su Claude.",
        ],
        suggestedQuestions: [
          "Come funziona il Model Context Protocol (MCP) di Claude?",
          "È sicuro far leggere a Claude i miei file locali?",
          "Come avvio un workshop pratico per costruire il mio Progetto Claude?",
          "Quali automazioni posso creare con Claude per il mio flusso di lavoro clinico?",
        ],
      },
    ],
  },
  {
    id: "lezione-4",
    number: 4,
    title: "Toolkit del Ricercatore",
    focus: "Gemini, NotebookLM, Perplexity. AI ancorata alle fonti, ricerca della letteratura e gestione documentale.",
    subtopics: [
      {
        id: "l4-s1",
        title: "L'ecosistema Google Workspace (Gemini)",
        bullets: [
          "Integrazione nativa di Gemini in Docs, Drive e Gmail (es. stesura automatica di note cliniche).",
          "Le \"Gems\" (l'alternativa Google ai Custom GPTs).",
          "Gemini \"Deep Research\" per esplorazioni di letteratura multi-fonte.",
        ],
        suggestedQuestions: [
          "Come integro Gemini nel mio workflow su Google Docs?",
          "Cosa sono le Gems di Gemini e come le creo?",
          "Come uso Gemini Deep Research per la letteratura psicologica?",
          "Gemini è più adatto di ChatGPT per certi compiti clinici?",
        ],
      },
      {
        id: "l4-s2",
        title: "NotebookLM (Il grounding puro)",
        bullets: [
          "Creare un'AI basata esclusivamente sui propri documenti (paper, linee guida).",
          "Interrogare le fonti: sintesi, gap, citazioni con pagine esatte.",
          "La magia di \"Audio Overview\": trasformare i PDF clinici in podcast.",
        ],
        suggestedQuestions: [
          "Come carico le linee guida cliniche su NotebookLM?",
          "Come faccio a trovare gap nella letteratura con NotebookLM?",
          "Come funziona Audio Overview e quando è utile?",
          "NotebookLM può sostituire una ricerca bibliografica tradizionale?",
        ],
      },
      {
        id: "l4-s3",
        title: "Motori di ricerca basati su evidenze",
        bullets: [
          "Perplexity AI in azione: ricerca web con citazioni obbligatorie.",
          "Panoramica degli strumenti super-specializzati per ricercatori: Elicit (revisioni sistematiche), Consensus (evidenze scientifiche), SciSpace.",
        ],
        suggestedQuestions: [
          "Come uso Perplexity AI per trovare ricerche psicologiche affidabili?",
          "Quando uso Elicit invece di Consensus per la ricerca?",
          "Come verifico la qualità delle citazioni che mi dà Perplexity?",
          "Qual è il miglior strumento AI per una revisione sistematica?",
        ],
      },
      {
        id: "l4-s4",
        title: "Chiusura del Corso e Futuro della Professione",
        bullets: [
          "Il \"Caso Therabot\" (primo RCT su chatbot terapeutici).",
          "Il ruolo futuro dello psicologo nell'era dell'AI.",
          "Consegna del \"Toolkit Completo\" (checklist, prompt e mappa degli strumenti).",
        ],
        suggestedQuestions: [
          "Cosa ci insegna il Caso Therabot sul futuro della psicoterapia?",
          "L'AI sostituirà gli psicologi? Qual è la tua opinione?",
          "Quali competenze dovrà avere lo psicologo del futuro?",
          "Come posso continuare ad aggiornarmi sull'AI dopo il corso?",
        ],
      },
    ],
  },
];
