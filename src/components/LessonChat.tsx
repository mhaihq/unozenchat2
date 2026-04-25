import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import type { Lezione, Subtopic } from "../lib/courseData";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

type Level = "beginner" | "intermediate" | "advanced";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface Props {
  subtopic: Subtopic;
  lezione: Lezione;
}

const BOT_AVATAR = "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=corso&backgroundColor=dbe9fe";

const LEVELS: { value: Level; label: string }[] = [
  { value: "beginner",     label: "Principiante" },
  { value: "intermediate", label: "Intermedio"   },
  { value: "advanced",     label: "Esperto"      },
];

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/>{1,}\s*/gm, "")
    .replace(/_{1,2}(.+?)_{1,2}/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const LEVEL_INSTRUCTIONS: Record<Level, string> = {
  beginner: `Lo studente è alle prime armi con l'AI:
- Usa un linguaggio semplice, evita tecnicismi o spiegali subito con analogie quotidiane
- Procedi passo per passo, sii incoraggiante e paziente`,
  intermediate: `Lo studente ha qualche esperienza con l'AI:
- Puoi usare termini tecnici di base ma spiegali brevemente
- Fornisci esempi pratici applicati alla psicologia clinica`,
  advanced: `Lo studente usa l'AI regolarmente:
- Usa terminologia tecnica senza spiegarla (token, RAG, fine-tuning, ecc.)
- Vai diretto al punto, approfondisci sfumature e casi d'uso avanzati`,
};

function buildSystemPrompt(lezione: Lezione, subtopic: Subtopic, level: Level): string {
  return `Sei un assistente didattico per un corso professionale di AI per psicologi italiani.

Argomento attuale:
- Lezione ${lezione.number}: "${lezione.title}"
- Subtema: "${subtopic.title}"
- Contenuti: ${subtopic.bullets.join("; ")}

Livello dello studente:
${LEVEL_INSTRUCTIONS[level]}

Regole:
- Rispondi sempre in italiano
- NON usare markdown: niente asterischi, hashtag, backtick. Solo testo normale.
- Se la domanda è fuori tema, riporta gentilmente il focus sull'argomento
- Non inventare: se non sei sicuro, dillo chiaramente`;
}

export function LessonChat({ subtopic, lezione }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [level, setLevel] = useState<Level>("intermediate");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [subtopic.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "", streaming: true }]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          stream: true,
          messages: [
            { role: "system", content: buildSystemPrompt(lezione, subtopic, level) },
            ...history,
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
            if (delta) {
              accumulated += delta;
              const clean = stripMarkdown(accumulated);
              setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: clean } : m));
            }
          } catch { /* partial chunk */ }
        }
      }

      setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, streaming: false } : m));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId
          ? { ...m, content: "Si è verificato un errore. Riprova tra un momento.", streaming: false }
          : m
      ));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, isStreaming, lezione, subtopic, level]);

  const { state: voiceState, toggle: toggleVoice } = useVoiceRecorder({
    onTranscript: (text) => { setInput(text); inputRef.current?.focus(); },
  });

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="bg-white rounded-xl border border-grey-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-grey-150 flex-wrap gap-y-2">
        <Sparkles className="w-4 h-4 text-primary-300 flex-shrink-0" />
        <span className="text-sm font-semibold text-grey-900 flex-1">Chatta con l'AI</span>

        {/* Level pills */}
        <div className="flex items-center gap-px bg-grey-150 rounded-lg p-0.5">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => { setLevel(l.value); setMessages([]); }}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                level === l.value
                  ? "bg-white text-grey-950 shadow-xs"
                  : "text-grey-600 hover:text-grey-900"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested questions — empty state */}
      {!hasMessages && (
        <div className="px-4 sm:px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-grey-500 mb-3">Domande suggerite</p>
          <div className="flex flex-col gap-2">
            {subtopic.suggestedQuestions.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => sendMessage(q)}
                className="w-full text-left px-4 py-2.5 rounded-lg border border-grey-200 bg-grey-100 hover:bg-grey-150 hover:border-grey-300 text-sm text-grey-800 transition-all"
              >
                {q}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {hasMessages && (
        <div className="px-4 sm:px-5 py-4 space-y-5 max-h-80 sm:max-h-96 overflow-y-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16 }}
                className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "assistant" && (
                  <img src={BOT_AVATAR} className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 border border-grey-200" alt="" />
                )}
                <div className={`max-w-[84%] px-4 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary-300 text-white rounded-br-sm"
                    : "bg-grey-100 text-grey-900 rounded-bl-sm border border-grey-200"
                }`}>
                  {msg.content}
                  {msg.streaming && (
                    <span className="inline-block w-0.5 h-3.5 bg-primary-300 ml-0.5 align-middle animate-pulse" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      )}

      {/* Compact chips after first message */}
      {hasMessages && (
        <div className="px-4 sm:px-5 pb-3 flex flex-wrap gap-1.5">
          {subtopic.suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              disabled={isStreaming}
              className="text-xs px-3 py-1 rounded-full border border-grey-200 bg-grey-100 text-grey-700 hover:border-grey-300 hover:text-grey-950 transition-all disabled:opacity-40 truncate max-w-[220px]"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 sm:px-4 py-3 border-t border-grey-150 flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scrivi una domanda su questo argomento..."
          rows={1}
          className="flex-1 resize-none px-3.5 py-2.5 text-sm bg-grey-100 rounded-lg border border-grey-200 focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-blue-200 text-grey-950 placeholder-grey-500 transition-all max-h-32 leading-relaxed"
          style={{ overflowY: "auto" }}
        />
        <button
          onClick={toggleVoice}
          title={voiceState === "recording" ? "Ferma registrazione" : "Registra messaggio vocale"}
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all border ${
            voiceState === "recording"
              ? "bg-red-500 border-red-500 text-white"
              : voiceState === "transcribing"
              ? "bg-grey-150 border-grey-200 text-grey-500"
              : "bg-grey-100 border-grey-200 text-grey-600 hover:border-grey-300 hover:text-grey-950"
          }`}
        >
          {voiceState === "transcribing" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : voiceState === "recording" ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isStreaming}
          className="w-9 h-9 rounded-lg bg-primary-300 text-white flex items-center justify-center flex-shrink-0 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
        >
          {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
