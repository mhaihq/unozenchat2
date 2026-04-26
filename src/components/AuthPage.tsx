import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";
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

  const inputClass = "w-full px-3.5 py-2.5 text-sm border border-[rgba(20,20,20,0.12)] rounded-md bg-white text-tx placeholder-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all";

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={LOGO} alt="AI per Psicologi" className="h-10 w-auto mb-5 object-contain" />
          <h1 className="font-serif text-2xl font-normal tracking-tight text-tx">
            {mode === "login" ? "Accedi" : mode === "register" ? "Crea un account" : "Reimposta la password"}
          </h1>
          <p className="text-sm text-muted mt-1.5 text-center">
            {mode === "login" ? "Bentornato nel corso AI per Psicologi" : mode === "register" ? "Inizia il tuo percorso" : "Ti invieremo un link via email"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-[rgba(20,20,20,0.08)] rounded-xl shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Nome completo</label>
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
              <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
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
                  <label className="block text-xs font-medium text-muted">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); reset(); }}
                      className="text-xs text-accent hover:text-accent-deep font-medium transition-colors"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}
            {info && (
              <div className="px-3.5 py-2.5 bg-accent-soft border border-accent/20 rounded-md text-sm text-accent-deep">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-deep disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 px-4 rounded-md transition-colors mt-1"
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
        <p className="text-center text-sm text-muted mt-5">
          {mode === "login" && (
            <>Non hai un account?{" "}
              <button onClick={() => { setMode("register"); reset(); }} className="text-tx font-medium hover:underline">
                Registrati
              </button>
            </>
          )}
          {mode === "register" && (
            <>Hai già un account?{" "}
              <button onClick={() => { setMode("login"); reset(); }} className="text-tx font-medium hover:underline">
                Accedi
              </button>
            </>
          )}
          {mode === "forgot" && (
            <button onClick={() => { setMode("login"); reset(); }} className="text-tx font-medium hover:underline">
              ← Torna al login
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
