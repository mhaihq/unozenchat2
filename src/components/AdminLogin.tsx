import { useState } from "react";
import { Lock, Eye, EyeOff, BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { verifyAdminPassword } from "../lib/api";

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

export function AdminLogin({ onSuccess, onBack }: Props) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    try {
      const ok = await verifyAdminPassword(password);
      if (ok) {
        onSuccess();
      } else {
        setError("Password errata.");
      }
    } catch {
      setError("Impossibile verificare la password. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-0 flex flex-col items-center justify-center px-4 font-sans">
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
          <h1 className="text-2xl font-semibold text-text-100 tracking-tight">Pannello Admin</h1>
          <p className="text-sm text-text-400 mt-1.5 text-center leading-relaxed">
            Inserisci la password di amministrazione per continuare.
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-100 rounded-3xl border border-bg-300 shadow-input p-7">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-bg-200 mx-auto mb-6">
            <Lock className="w-5 h-5 text-text-300" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-300 uppercase tracking-wider">Password admin</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-bg-300 bg-bg-0 text-sm text-text-100 placeholder-text-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-400 hover:text-text-200 transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-150 shadow-lg shadow-accent/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accedi come admin"}
            </button>
          </form>
        </div>

        <button
          onClick={onBack}
          className="mt-5 w-full flex items-center justify-center gap-1.5 text-sm text-text-400 hover:text-text-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla chat
        </button>

        <p className="mt-4 text-center text-xs text-text-500">Password predefinita: admin123</p>
      </div>
    </div>
  );
}
