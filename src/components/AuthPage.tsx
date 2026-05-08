import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { isEmailAllowed } from "../lib/api";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";
const LIME = "#C8E976";
const LIME_D = "#A8D14F";
const BG = "#F2EEE3";
const BORDER = "rgba(26,26,26,0.10)";
const TEXT = "#1A1A1A";
const MUTED = "#3A3A3A";
const FAINT = "#7A7A7A";

interface Props {
  onAuth: () => void;
}

export function AuthPage({ onAuth }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Listen for when the user comes back from the magic link
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN") onAuth();
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const trimmed = email.trim().toLowerCase();
      const allowed = await isEmailAllowed(trimmed);
      if (!allowed) throw new Error("Questa email non è autorizzata. Contatta l'organizzatore del corso.");

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 font-sans" style={{ background: BG }}>
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src={LOGO} alt="AI per Psicologi" className="h-9 w-auto mb-6 object-contain" />
          <h1 className="font-serif text-3xl font-normal tracking-tight" style={{ color: TEXT, letterSpacing: "-0.02em" }}>
            {sent ? "Controlla la email" : "Accedi al corso"}
          </h1>
          <p className="text-sm mt-2 text-center" style={{ color: MUTED, lineHeight: 1.6 }}>
            {sent
              ? `Abbiamo inviato un link di accesso a ${email}. Clicca il link per entrare.`
              : "Inserisci la tua email. Ti mandiamo un link di accesso — nessuna password."}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

          {sent ? (
            /* Sent state */
            <div className="flex flex-col items-center gap-5 text-center">
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: LIME, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail style={{ width: 24, height: 24, color: TEXT }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: TEXT, marginBottom: 6 }}>Link inviato!</p>
                <p className="text-sm" style={{ color: MUTED, lineHeight: 1.6 }}>
                  Controlla anche la cartella spam se non lo vedi entro un minuto.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(""); setError(""); }}
                className="text-sm underline transition-colors"
                style={{ color: FAINT }}
                onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                onMouseLeave={e => (e.currentTarget.style.color = FAINT)}
              >
                Usa un'altra email
              </button>
            </div>
          ) : (
            /* Email form */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@esempio.com"
                  required
                  autoFocus
                  style={{
                    width: "100%", padding: "10px 14px", fontSize: 14,
                    border: `1px solid ${BORDER}`, borderRadius: 8,
                    background: BG, color: TEXT, outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(26,26,26,0.35)")}
                  onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
                />
              </div>

              {error && (
                <div style={{ padding: "10px 14px", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#b91c1c" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: "100%", padding: "12px", borderRadius: 999,
                  border: "none", cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                  background: loading || !email.trim() ? "rgba(200,233,118,0.5)" : LIME,
                  color: TEXT, fontSize: 14, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (!loading && email.trim()) e.currentTarget.style.background = LIME_D; }}
                onMouseLeave={e => { if (!loading && email.trim()) e.currentTarget.style.background = LIME; }}
              >
                {loading && <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />}
                {loading ? "Invio in corso…" : "Invia link di accesso"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: FAINT }}>
          Accesso riservato ai partecipanti del corso · <a href="mailto:info@unozen.it" style={{ color: FAINT, textDecoration: "underline" }}>info@unozen.it</a>
        </p>
      </div>
    </div>
  );
}
