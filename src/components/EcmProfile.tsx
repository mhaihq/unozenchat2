import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

interface ProfileData {
  full_name: string;
  codice_fiscale: string;
  professione: string;
  disciplina: string;
  employment: string;
}

interface Props {
  onClose: () => void;
  onSaved: (profile: ProfileData) => void;
}

const PROFESSIONI = ["Psicologo", "Psicoterapeuta", "Medico chirurgo", "Infermiere", "Altro"];
const DISCIPLINE: Record<string, string[]> = {
  "Psicologo": ["Psicologia", "Psicoterapia"],
  "Psicoterapeuta": ["Psicoterapia", "Psicologia"],
  "Medico chirurgo": ["Psichiatria", "Medicina generale", "Altra disciplina"],
  "Infermiere": ["Infermiere"],
  "Altro": ["Altra disciplina"],
};

export function EcmProfile({ onClose, onSaved }: Props) {
  const [form, setForm] = useState<ProfileData>({
    full_name: "", codice_fiscale: "", professione: "Psicologo", disciplina: "Psicologia", employment: "libero_professionista",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Pre-fill from existing profile
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("ecm_profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data) setForm({ full_name: data.full_name ?? "", codice_fiscale: data.codice_fiscale ?? "", professione: data.professione ?? "Psicologo", disciplina: data.disciplina ?? "Psicologia", employment: data.employment ?? "libero_professionista" });
      });
    });
  }, []);

  async function save() {
    if (!form.full_name.trim() || !form.codice_fiscale.trim()) { setError("Nome completo e codice fiscale sono obbligatori."); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sessione scaduta."); setSaving(false); return; }
    const { error: err } = await supabase.from("ecm_profiles").upsert({ user_id: user.id, ...form, updated_at: new Date().toISOString() });
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false);
    onSaved(form);
  }

  const disciplines = DISCIPLINE[form.professione] ?? ["Altra disciplina"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(20,20,20,0.08)]">
          <div>
            <p className="text-xs uppercase tracking-widest text-faint">Attestato ECM</p>
            <p className="text-sm font-medium text-tx mt-0.5">Dati per il certificato</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-faint hover:text-tx hover:bg-surface2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-faint">Questi dati appariranno sull'attestato ECM (Allegato C). Vengono salvati per usi futuri.</p>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Nome e cognome *</label>
            <input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="Dott.ssa Maria Rossi"
              className="w-full px-3 py-2 text-sm border border-[rgba(20,20,20,0.12)] rounded-lg focus:outline-none focus:border-accent bg-surface2" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Codice fiscale *</label>
            <input value={form.codice_fiscale} onChange={(e) => setForm((p) => ({ ...p, codice_fiscale: e.target.value.toUpperCase() }))}
              placeholder="RSSMRA80A01F205X" maxLength={16}
              className="w-full px-3 py-2 text-sm border border-[rgba(20,20,20,0.12)] rounded-lg focus:outline-none focus:border-accent bg-surface2 font-mono tracking-wider" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Professione</label>
              <select value={form.professione}
                onChange={(e) => setForm((p) => ({ ...p, professione: e.target.value, disciplina: (DISCIPLINE[e.target.value] ?? ["Altra disciplina"])[0] }))}
                className="w-full px-3 py-2 text-sm border border-[rgba(20,20,20,0.12)] rounded-lg focus:outline-none focus:border-accent bg-surface2">
                {PROFESSIONI.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Disciplina</label>
              <select value={form.disciplina} onChange={(e) => setForm((p) => ({ ...p, disciplina: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-[rgba(20,20,20,0.12)] rounded-lg focus:outline-none focus:border-accent bg-surface2">
                {disciplines.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Tipo di attività</label>
            <select value={form.employment} onChange={(e) => setForm((p) => ({ ...p, employment: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[rgba(20,20,20,0.12)] rounded-lg focus:outline-none focus:border-accent bg-surface2">
              <option value="libero_professionista">Libero/a professionista</option>
              <option value="dipendente">Dipendente</option>
              <option value="convenzionato">Convenzionato/a</option>
              <option value="privo">Privo di occupazione</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-[rgba(20,20,20,0.06)] bg-surface2 rounded-b-2xl">
          <button onClick={save} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-deep disabled:opacity-40 transition-colors">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Genera attestato →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
