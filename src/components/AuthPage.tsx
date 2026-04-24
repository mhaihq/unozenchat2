import { useState } from "react";
import { BookOpen, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

type AuthMode = "login" | "register" | "forgot";

interface Props {
  onAuth: () => void;
}

export function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function reset() {
    setError("");
    setInfo("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth();
      } else if (mode === "register") {
        if (!name.trim()) throw new Error("Inserisci il tuo nome.");
        if (password.length < 6) throw new Error("La password deve contenere almeno 6 caratteri.");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) throw error;
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onAuth();
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setInfo("Controlla la tua email per il link di reimpostazione password.");
        setEmail("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto");
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<AuthMode, string> = {
    login: "Bentornato",
    register: "Crea un account",
    forgot: "Reimposta password",
  };

  const subtitles: Record<AuthMode, string> = {
    login: "Accedi al tuo assistente del corso.",
    register: "Iscriviti per ricevere aiuto con i materiali del corso.",
    forgot: "Ti invieremo un link di reimpostazione via email.",
  };

  const submitLabels: Record<AuthMode, string> = {
    login: "Accedi",
    register: "Crea account",
    forgot: "Invia link di reimpostazione",
  };

  return (
    <div className="min-h-screen bg-bg-0 flex flex-col items-center justify-center px-4 font-sans">
      {/* Soft background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full bg-accent/6 blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-accent/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-5 shadow-xl shadow-accent/25 ring-4 ring-accent/10">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-text-100 tracking-tight">{titles[mode]}</h1>
          <p className="text-sm text-text-400 mt-1.5 text-center leading-relaxed">{subtitles[mode]}</p>
        </div>

        {/* Card */}
        <div className="bg-bg-100 rounded-3xl border border-bg-300 shadow-input p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — register only */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-300 uppercase tracking-wider">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mario Rossi"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-bg-300 bg-bg-0 text-sm text-text-100 placeholder-text-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-300 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@esempio.it"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-bg-300 bg-bg-0 text-sm text-text-100 placeholder-text-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-300 uppercase tracking-wider">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); reset(); }}
                      className="text-xs text-accent hover:text-accent-hover transition-colors font-medium"
                    >
                      Password dimenticata?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Almeno 6 caratteri" : "••••••••"}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-bg-300 bg-bg-0 text-sm text-text-100 placeholder-text-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-400 hover:text-text-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Feedback */}
            {error && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 leading-relaxed">
                {error}
              </div>
            )}
            {info && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 leading-relaxed">
                {info}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-150 shadow-lg shadow-accent/20 mt-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {submitLabels[mode]}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Mode switcher */}
        <div className="mt-6 text-center text-sm text-text-400">
          {mode === "login" && (
            <>
              Non hai un account?{" "}
              <button onClick={() => { setMode("register"); reset(); }} className="text-accent hover:text-accent-hover font-semibold transition-colors">
                Registrati
              </button>
            </>
          )}
          {mode === "register" && (
            <>
              Hai gia un account?{" "}
              <button onClick={() => { setMode("login"); reset(); }} className="text-accent hover:text-accent-hover font-semibold transition-colors">
                Accedi
              </button>
            </>
          )}
          {mode === "forgot" && (
            <button onClick={() => { setMode("login"); reset(); }} className="text-accent hover:text-accent-hover font-semibold transition-colors">
              Torna al login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
