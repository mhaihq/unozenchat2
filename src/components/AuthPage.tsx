import { useState } from "react";
import { Eye, EyeOff, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { isEmailAllowed } from "../lib/api";

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
        const allowed = await isEmailAllowed(email);
        if (!allowed) throw new Error("Questa email non è autorizzata. Contatta l'organizzatore del corso.");
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

  const inputClass = "w-full px-3.5 py-2.5 text-sm border border-grey-200 rounded-lg bg-white text-grey-950 placeholder-grey-400 focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-blue-150 transition-all";

  return (
    <div className="min-h-screen bg-grey-100 flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-grey-950 flex items-center justify-center mb-4 shadow-sm">
            <BookOpen className="w-4.5 h-4.5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-grey-950 tracking-tight">
            {mode === "login" ? "Accedi" : mode === "register" ? "Crea un account" : "Reimposta la password"}
          </h1>
          <p className="text-sm text-grey-500 mt-1 text-center">
            {mode === "login" ? "Bentornato nel corso AI per Psicologi" : mode === "register" ? "Inizia il tuo percorso" : "Ti invieremo un link via email"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-grey-200 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-grey-700 mb-1.5">Nome completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mario Rossi"
                  required
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-grey-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-grey-700">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); reset(); }}
                      className="text-xs text-primary-300 hover:text-primary-400 font-medium transition-colors"
                    >
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
                    className={inputClass + " pr-10"}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 hover:text-grey-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="px-3.5 py-2.5 bg-red-100 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            {info && (
              <div className="px-3.5 py-2.5 bg-green-100 border border-green-200 rounded-lg text-sm text-green-700">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-grey-950 hover:bg-grey-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors mt-1"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? "Caricamento..."
                : mode === "login"
                ? "Accedi"
                : mode === "register"
                ? "Crea account"
                : "Invia link"}
            </button>
          </form>
        </div>

        {/* Mode switcher */}
        <p className="text-center text-sm text-grey-500 mt-5">
          {mode === "login" && (
            <>Non hai un account?{" "}
              <button onClick={() => { setMode("register"); reset(); }} className="text-grey-950 font-semibold hover:underline">
                Registrati
              </button>
            </>
          )}
          {mode === "register" && (
            <>Hai già un account?{" "}
              <button onClick={() => { setMode("login"); reset(); }} className="text-grey-950 font-semibold hover:underline">
                Accedi
              </button>
            </>
          )}
          {mode === "forgot" && (
            <button onClick={() => { setMode("login"); reset(); }} className="text-grey-950 font-semibold hover:underline">
              ← Torna al login
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
