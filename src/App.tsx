import { useEffect, useRef, useState } from "react";
import { BookOpen, MessageSquare, Sparkles, RotateCcw, Settings, FileText, LogOut } from "lucide-react";
import { ChatMessage } from "./components/ChatMessage";
import { TypingIndicator } from "./components/TypingIndicator";
import { AdminLogin } from "./components/AdminLogin";
import { AdminPanel } from "./components/AdminPanel";
import { AuthPage } from "./components/AuthPage";
import { ClaudeChatInput } from "./components/ui/claude-style-chat-input";
import type { AttachedFile } from "./components/ui/claude-style-chat-input";
import { supabase } from "./lib/supabase";
import { createSession, sendMessage, fetchDocuments } from "./lib/api";
import type { AppView, Document, Message } from "./lib/types";
import type { User } from "@supabase/supabase-js";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Ciao! Sono il tuo assistente del corso. Chiedimi qualsiasi cosa sul corso — troverò le risposte dai materiali caricati: trascrizioni, appunti e slide.\n\nCosa vorresti sapere?",
  createdAt: new Date(),
};

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const [view, setView] = useState<AppView>("student");
  const [adminAuthed, setAdminAuthed] = useState(false);

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showMaterials, setShowMaterials] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data once authenticated
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [sid, docs] = await Promise.all([createSession(), fetchDocuments()]);
      setSessionId(sid);
      setDocuments(docs);
    })();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSendMessage(data: {
    message: string;
    files: AttachedFile[];
    pastedContent: AttachedFile[];
    model: string;
    isThinkingEnabled: boolean;
  }) {
    const text = data.message.trim();
    if (!text || isTyping || !sessionId) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setError(null);

    try {
      const { message } = await sendMessage(text, sessionId, messages);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: message, createdAt: new Date() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsTyping(false);
    }
  }

  function handleReset() {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    createSession().then(setSessionId);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMessages([WELCOME_MESSAGE]);
    setSessionId(null);
    setDocuments([]);
    setView("student");
    setAdminAuthed(false);
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-bg-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated — show login
  if (!user) {
    return <AuthPage onAuth={() => {}} />;
  }

  // Admin flow
  if (view === "admin") {
    if (!adminAuthed) {
      return <AdminLogin onSuccess={() => { setAdminAuthed(true); }} onBack={() => setView("student")} />;
    }
    return (
      <AdminPanel
        documents={documents}
        onDocumentsChange={setDocuments}
        onLogout={() => { setAdminAuthed(false); setView("student"); }}
      />
    );
  }

  const displayName = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";

  // Student chat view
  return (
    <div className="flex flex-col h-screen bg-bg-0 font-sans overflow-hidden text-text-100">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-3.5 bg-bg-100 border-b border-bg-300 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-text-100 leading-tight">Assistente del Corso</h1>
          <p className="text-xs text-text-400 leading-tight">
            {documents.length > 0
              ? `${documents.length} material${documents.length !== 1 ? "i" : "e"} disponibil${documents.length !== 1 ? "i" : "e"}`
              : "Chiedimi qualsiasi cosa sul corso"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {documents.length > 0 && (
            <button
              onClick={() => setShowMaterials((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                showMaterials
                  ? "bg-accent/10 text-accent"
                  : "bg-bg-200 text-text-300 hover:text-text-200"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {documents.length} font{documents.length !== 1 ? "i" : "e"}
            </button>
          )}

          {/* User badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-bg-200 px-2.5 py-1 rounded-full">
            <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-[9px] font-bold text-accent uppercase">{displayName[0]}</span>
            </div>
            <span className="text-xs text-text-300 font-medium">{displayName}</span>
          </div>

          <button
            onClick={handleReset}
            title="Nuova conversazione"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-400 hover:text-text-200 hover:bg-bg-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("admin")}
            title="Amministrazione"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-400 hover:text-text-200 hover:bg-bg-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleSignOut}
            title="Esci"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-400 hover:text-text-200 hover:bg-bg-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Materials drawer */}
      {showMaterials && documents.length > 0 && (
        <div className="bg-bg-100 border-b border-bg-300 px-5 py-3 flex gap-2 flex-wrap">
          {documents.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-1.5 bg-bg-200 border border-bg-300 rounded-lg px-2.5 py-1.5 text-xs text-text-300"
            >
              <FileText className="w-3 h-3 text-accent" />
              <span className="max-w-[140px] truncate">{d.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-10 h-10 text-bg-300 mx-auto mb-3" />
              <p className="text-text-400 text-sm">Inizia la conversazione</p>
            </div>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}

          {isTyping && <TypingIndicator />}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
              <span className="font-medium">Errore:</span> {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-bg-0 border-t border-bg-300 px-4 py-5">
        <ClaudeChatInput
          onSendMessage={handleSendMessage}
          disabled={isTyping || !sessionId}
          placeholder="Fai una domanda sul corso..."
        />
        <p className="text-center text-xs text-text-500 mt-3">
          Invio per inviare &middot; Shift+Invio per andare a capo
        </p>
      </div>
    </div>
  );
}
