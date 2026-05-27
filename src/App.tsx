import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCcw, Settings, LogOut, BookOpen, FileText, ChevronDown, SendHorizonal, Mic, MicOff, Loader2, X } from "lucide-react"; // BookOpen used in unreachable legacy code below
import { motion, AnimatePresence } from "motion/react";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
import { useCheckoutResult } from "./hooks/useCheckoutResult";
import { AdminLogin } from "./components/AdminLogin";
import { AdminPanel } from "./components/AdminPanel";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";
import { CourseView } from "./components/CourseView";
import { HomePage } from "./components/HomePage";
import { CoursePageOndemand } from "./components/CoursePageOndemand";
import { CoursePageLive } from "./components/CoursePageLive";
import { supabase, EDGE_FUNCTION_URL } from "./lib/supabase";
import { createSession, sendMessage, fetchDocuments } from "./lib/api";
import type { AppView, Document, Message } from "./lib/types";
import type { User } from "@supabase/supabase-js";

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Ciao! Sono il tuo assistente del corso. Chiedimi qualsiasi cosa — troverò le risposte dai materiali caricati.\n\nCosa vorresti sapere?",
  createdAt: new Date(),
};

const BOT_AVATAR = "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=coursebot&backgroundColor=b6e3f4";

function MessageBubble({ message, userAvatar }: { message: Message; userAvatar: string }) {
  const isUser = message.role === "user";
  const avatar = isUser ? userAvatar : BOT_AVATAR;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <img src={avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0 object-cover" />
      <div
        className={`max-w-[70%] px-4 py-3 text-sm leading-relaxed shadow-sage-sm ${
          isUser
            ? "bg-primary-700 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl"
            : "bg-white text-charcoal-900 border border-charcoal-200 rounded-tl-xl rounded-tr-xl rounded-br-xl"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1.5 ${isUser ? "text-primary-200" : "text-charcoal-400"}`}>
          {message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-3"
    >
      <img src={BOT_AVATAR} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0 object-cover" />
      <div className="bg-white border border-charcoal-200 rounded-tl-xl rounded-tr-xl rounded-br-xl px-4 py-3 shadow-sage-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 0.15, 0.3].map((d, i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 bg-primary-400 rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: d }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function getInitialView(): AppView {
  const { hash, pathname, search } = window.location;
  if (pathname === "/admin" || hash === "#admin" || search.includes("admin")) return "admin";
  return "dashboard";
}

async function autoEnrollIfNeeded(userId: string, email: string) {
  if (!email) return;
  // Check if this email has a cohort assigned
  const { data: allowed } = await supabase
    .from("allowed_emails")
    .select("cohort_id")
    .eq("email", email.toLowerCase())
    .single();
  if (!allowed?.cohort_id) return;
  // Enroll if not already enrolled
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("cohort_id", allowed.cohort_id)
    .maybeSingle();
  if (existing) return;
  await supabase.from("enrollments").insert({ user_id: userId, cohort_id: allowed.cohort_id });
}

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [view, setView] = useState<AppView>(getInitialView);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const { result: checkoutResult, clear: clearCheckout } = useCheckoutResult();

  async function handleBuy(priceId: string, courseId: string, cohortId?: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${EDGE_FUNCTION_URL.replace("/course-chat", "")}/stripe-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ priceId, courseId, cohortId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else console.error("No checkout URL returned", data);
    } catch (err) {
      console.error("Checkout error:", err);
    }
  }
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showMaterials, setShowMaterials] = useState(false);
  const [input, setInput] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { state: recordingState, toggle: toggleRecording } = useVoiceRecorder({
    onTranscript: (text) => setInput((prev) => (prev ? prev + " " + text : text)),
    onError: (msg) => { setVoiceError(msg); setTimeout(() => setVoiceError(null), 3000); },
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) autoEnrollIfNeeded(session.user.id, session.user.email ?? "");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) autoEnrollIfNeeded(session.user.id, session.user.email ?? "");
    });
    return () => subscription.unsubscribe();
  }, []);

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping || !sessionId) return;
    setInput("");
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text, createdAt: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setError(null);
    try {
      const { message } = await sendMessage(text, sessionId, messages);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: message, createdAt: new Date() }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, sessionId, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  function handleReset() {
    setMessages([WELCOME]);
    setError(null);
    createSession().then(setSessionId);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMessages([WELCOME]);
    setSessionId(null);
    setDocuments([]);
    setView("dashboard");
    setAdminAuthed(false);
    setAdminPassword("");
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1">
            {[0, 150, 300].map((d) => (
              <span key={d} className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (view === "admin") return <AdminLogin onSuccess={(pw) => { setAdminAuthed(true); setAdminPassword(pw); window.location.hash = "admin"; }} onBack={() => { setView("home"); window.location.hash = ""; }} />;
    if (view === "auth") return <AuthPage onAuth={() => setView("dashboard")} />;
    if (view === "course-page-ondemand") return (
      <CoursePageOndemand
        onLogin={() => setView("auth")}
        onBack={() => setView("home")}
        onBuy={handleBuy}
      />
    );
    if (view === "course-page-live") return (
      <CoursePageLive
        onLogin={() => setView("auth")}
        onBack={() => setView("home")}
      />
    );
    return (
      <HomePage
        onLogin={() => setView("auth")}
        onCourseOndemand={() => setView("course-page-ondemand")}
        onCourseLive={() => setView("course-page-live")}
      />
    );
  }

  if (view === "admin") {
    if (!adminAuthed) return <AdminLogin onSuccess={(pw) => { setAdminAuthed(true); setAdminPassword(pw); window.location.hash = "admin"; }} onBack={() => { setView("dashboard"); window.location.hash = ""; }} />;
    return <AdminPanel documents={documents} onDocumentsChange={setDocuments} adminPassword={adminPassword} onLogout={() => { setAdminAuthed(false); setAdminPassword(""); setView("dashboard"); window.location.hash = ""; }} />;
  }

  const displayName = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "Tu";
  const userAvatar = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=d1d4f9`;

  if (view === "dashboard") {
    return (
      <>
        {/* Checkout result banner */}
        <AnimatePresence>
          {checkoutResult && (
            <motion.div
              initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
              className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 text-sm font-medium ${
                checkoutResult === "success"
                  ? "bg-[#C8E976] text-[#1A1A1A]"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <span>
                {checkoutResult === "success"
                  ? "Pagamento completato. Benvenuto nel corso!"
                  : "Pagamento annullato. Puoi riprovare quando vuoi."}
              </span>
              <button onClick={clearCheckout}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>
        <Dashboard
          displayName={displayName}
          email={user.email ?? ""}
        userAvatar={userAvatar}
        onOpenCourse={() => setView("course")}
        onAdmin={() => setView("admin")}
        onSignOut={handleSignOut}
      />
      </>
    );
  }

  return (
    <CourseView
      displayName={displayName}
      userAvatar={userAvatar}
      onAdmin={() => setView("admin")}
      onSignOut={handleSignOut}
      onBack={() => setView("dashboard")}
    />
  );

  // eslint-disable-next-line no-unreachable
  return (
    <div className="flex flex-col h-screen bg-charcoal-50 font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-3 bg-white border-b border-charcoal-200 flex-shrink-0 shadow-sage-sm z-10">
        <div className="w-8 h-8 rounded-sage-lg bg-primary-700 flex items-center justify-center shadow-sm">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-charcoal-900">Assistente del Corso</h1>
          <p className="text-xs text-charcoal-400">
            {documents.length > 0 ? `${documents.length} fonte${documents.length !== 1 ? "i" : "e"} caricata${documents.length !== 1 ? "i" : ""}` : "Nessuna fonte caricata"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {documents.length > 0 && (
            <button
              onClick={() => setShowMaterials((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sage transition-all ${
                showMaterials ? "bg-primary-50 text-primary-700 border border-primary-200" : "text-charcoal-500 hover:bg-charcoal-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Fonti
              <ChevronDown className={`w-3 h-3 transition-transform ${showMaterials ? "rotate-180" : ""}`} />
            </button>
          )}
          <div className="w-px h-5 bg-charcoal-200 mx-1" />
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-charcoal-500 font-medium px-2">
            <img src={userAvatar} className="w-5 h-5 rounded-full border border-charcoal-200" alt="" />
            {displayName}
          </div>
          {[
            { icon: RotateCcw, title: "Nuova conversazione", action: handleReset },
            { icon: Settings, title: "Amministrazione", action: () => setView("admin") },
            { icon: LogOut, title: "Esci", action: handleSignOut },
          ].map(({ icon: Icon, title, action }) => (
            <button key={title} onClick={action} title={title} className="w-8 h-8 rounded-sage flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors">
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </header>

      {/* Materials drawer */}
      <AnimatePresence>
        {showMaterials && documents.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-b border-charcoal-200 bg-white z-10"
          >
            <div className="px-5 py-2.5 flex gap-2 flex-wrap">
              {documents.map((d) => (
                <div key={d.id} className="flex items-center gap-1.5 bg-charcoal-50 border border-charcoal-200 rounded-sage px-2.5 py-1 text-xs text-charcoal-600">
                  <FileText className="w-3 h-3 text-primary-600" />
                  <span className="max-w-[200px] truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto px-6 py-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} userAvatar={userAvatar} />
            ))}
            {isTyping && <TypingBubble key="typing" />}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-sage px-3.5 py-2.5 text-sm text-red-700"
            >
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-charcoal-200 px-4 py-3">
        <div className="w-full max-w-3xl mx-auto">
          <div className={`flex items-end gap-2 bg-charcoal-50 border rounded-sage-xl px-4 py-2.5 transition-all shadow-sage-sm ${
            recordingState === "recording"
              ? "border-red-400 ring-2 ring-red-100"
              : "border-charcoal-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100"
          }`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={recordingState === "recording" ? "In ascolto…" : recordingState === "transcribing" ? "Trascrizione in corso…" : "Fai una domanda sul corso..."}
              disabled={isTyping || !sessionId || recordingState === "transcribing"}
              rows={1}
              className="flex-1 bg-transparent text-sm text-charcoal-900 placeholder-charcoal-400 resize-none outline-none leading-relaxed py-1 disabled:opacity-50"
              style={{ minHeight: "1.5rem", maxHeight: "160px" }}
            />
            <div className="flex items-center gap-1.5 flex-shrink-0 mb-0.5">
              {/* Mic button */}
              <motion.button
                onClick={toggleRecording}
                disabled={isTyping || !sessionId || recordingState === "transcribing"}
                whileTap={{ scale: 0.9 }}
                title={recordingState === "recording" ? "Interrompi registrazione" : "Registra messaggio vocale"}
                className={`relative w-8 h-8 rounded-sage flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  recordingState === "recording"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : recordingState === "transcribing"
                    ? "bg-charcoal-200 text-charcoal-500"
                    : "bg-charcoal-100 text-charcoal-500 hover:bg-charcoal-200 hover:text-charcoal-700"
                }`}
              >
                {recordingState === "transcribing" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : recordingState === "recording" ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                {/* Pulse ring when recording */}
                {recordingState === "recording" && (
                  <span className="absolute w-8 h-8 rounded-sage bg-red-400 animate-ping opacity-40 pointer-events-none" />
                )}
              </motion.button>

              {/* Send button */}
              <motion.button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || !sessionId}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-sage flex items-center justify-center bg-primary-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-800 transition-colors"
              >
                <SendHorizonal className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          {voiceError && (
            <p className="text-xs text-red-500 mt-1.5 text-center">{voiceError}</p>
          )}
          <p className="text-center text-xs text-charcoal-400 mt-2">Invio per inviare · Shift+Invio per andare a capo · Microfono per registrare</p>
        </div>
      </div>
    </div>
  );
}
