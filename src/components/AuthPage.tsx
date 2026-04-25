import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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

  function reset() { setError(""); setInfo(""); }

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
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name.trim() } } });
        if (error) throw error;
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onAuth();
      } else {
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

  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-sage-lg bg-primary-700 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text-100">
            {mode === "login" ? "Accedi al tuo account" : mode === "register" ? "Crea un account" : "Reimposta la password"}
          </h1>
          <p className="text-sm text-text-400 mt-1">
            {mode === "login" ? "Accedi al tuo assistente del corso" : mode === "register" ? "Inizia con il tuo assistente del corso" : "Ti invieremo un link di reimpostazione"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-100 border border-bg-300 rounded-sage-xl shadow-sage p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-text-200 mb-1">Nome completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mario Rossi"
                  required
                  className="w-full px-3 py-2 text-sm border border-bg-300 rounded-sage bg-bg-100 text-text-100 placeholder-text-500 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-200 mb-1">Indirizzo email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 text-sm border border-bg-300 rounded-sage bg-bg-100 text-text-100 placeholder-text-500 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-colors"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-text-200">Password</label>
                  {mode === "login" && (
                    <button type="button" onClick={() => { setMode("forgot"); reset(); }} className="text-xs text-primary-700 hover:text-primary-800 font-medium">
                      Password dimenticata?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Almeno 6 caratteri" : "••••••••"}
                    required
                    className="w-full px-3 py-2 pr-10 text-sm border border-bg-300 rounded-sage bg-bg-100 text-text-100 placeholder-text-500 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-400 hover:text-text-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-sage text-sm text-red-700">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            {info && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-sage-50 border border-sage-200 rounded-sage text-sm text-sage-800">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-4 rounded-sage transition-colors mt-1"
            >
              {loading && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {loading ? "Caricamento..." : mode === "login" ? "Accedi" : mode === "register" ? "Crea account" : "Invia link di reimpostazione"}
            </button>
          </form>
        </div>

        {/* Mode switcher */}
        <p className="text-center text-sm text-text-400 mt-5">
          {mode === "login" && (
            <>Non hai un account?{" "}
              <button onClick={() => { setMode("register"); reset(); }} className="text-primary-700 hover:text-primary-800 font-semibold">Registrati</button>
            </>
          )}
          {mode === "register" && (
            <>Hai già un account?{" "}
              <button onClick={() => { setMode("login"); reset(); }} className="text-primary-700 hover:text-primary-800 font-semibold">Accedi</button>
            </>
          )}
          {mode === "forgot" && (
            <button onClick={() => { setMode("login"); reset(); }} className="text-primary-700 hover:text-primary-800 font-semibold">Torna al login</button>
          )}
        </p>
      </div>
    </div>
  );
}
