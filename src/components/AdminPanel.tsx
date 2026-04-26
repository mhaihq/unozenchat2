import { useRef, useState, useEffect } from "react";
import { Upload, FileText, Trash2, AlertCircle, CheckCircle, Loader2, X, LogOut, Key, RefreshCw, UserPlus, Mail } from "lucide-react";

const LOGO = "https://cdn.prod.website-files.com/6935ed01e1dd66f3db9dacf0/6940768c2d599f371637f2b7_Untitled%20design%20(7)-p-500.png";
import type { Document, UploadStatus } from "../lib/types";
import { uploadDocument, deleteDocument, updateAdminPassword, fetchAllowedEmails, addAllowedEmail, removeAllowedEmail } from "../lib/api";

interface Props {
  documents: Document[];
  onDocumentsChange: (docs: Document[]) => void;
  onLogout: () => void;
}

interface UploadItem {
  id: string;
  name: string;
  status: UploadStatus;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("it-IT", { month: "short", day: "numeric", year: "numeric" });
}

export function AdminPanel({ documents, onDocumentsChange, onLogout }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [tab, setTab] = useState<"materials" | "accessi" | "settings">("materials");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState("");

  // Accessi tab state
  const [allowedEmails, setAllowedEmails] = useState<{ id: string; email: string; created_at: string }[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (tab === "accessi") loadEmails();
  }, [tab]);

  async function loadEmails() {
    setEmailsLoading(true);
    try {
      const data = await fetchAllowedEmails();
      setAllowedEmails(data);
    } finally {
      setEmailsLoading(false);
    }
  }

  async function handleAddEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) { setEmailError("Inserisci un'email valida."); return; }
    setAddingEmail(true);
    try {
      await addAllowedEmail(trimmed);
      setNewEmail("");
      await loadEmails();
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Errore durante l'aggiunta.");
    } finally {
      setAddingEmail(false);
    }
  }

  async function handleRemoveEmail(id: string) {
    await removeAllowedEmail(id);
    setAllowedEmails((prev) => prev.filter((e) => e.id !== id));
  }

  function updateUpload(id: string, patch: Partial<UploadItem>) {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  async function processFile(file: File) {
    const uploadId = crypto.randomUUID();
    setUploads((prev) => [{ id: uploadId, name: file.name, status: "reading" }, ...prev]);
    try {
      const text = await readFile(file);
      updateUpload(uploadId, { status: "processing" });
      const doc = await uploadDocument(file.name, file.type || "text/plain", file.size, text);
      updateUpload(uploadId, { status: "done" });
      onDocumentsChange([doc, ...documents]);
      setTimeout(() => setUploads((prev) => prev.filter((u) => u.id !== uploadId)), 4000);
    } catch (err) {
      updateUpload(uploadId, { status: "error", error: err instanceof Error ? err.message : "Caricamento fallito" });
    }
  }

  function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Impossibile leggere il file"));
      reader.readAsText(file);
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) await processFile(file);
  }

  async function handleDelete(id: string) {
    await deleteDocument(id);
    onDocumentsChange(documents.filter((d) => d.id !== id));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPassword.length < 6) { setPwError("La password deve contenere almeno 6 caratteri."); return; }
    if (newPassword !== confirmPassword) { setPwError("Le password non coincidono."); return; }
    setPwStatus("saving");
    try {
      await updateAdminPassword(newPassword);
      setPwStatus("saved");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwStatus("idle"), 3000);
    } catch {
      setPwStatus("error");
      setPwError("Aggiornamento password fallito.");
    }
  }

  const totalSize = documents.reduce((s, d) => s + d.size, 0);

  return (
    <div className="min-h-screen bg-bg-0 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-grey-200 px-6 py-3 flex items-center gap-3">
        <img src={LOGO} alt="AI per Psicologi" className="h-7 w-auto object-contain" />
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-grey-950">AI per Psicologi</h1>
          <p className="text-xs text-grey-500">Pannello amministratore</p>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-700 border border-charcoal-300">
          Admin
        </span>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs text-text-400 hover:text-text-200 bg-bg-200 hover:bg-bg-300 px-3 py-1.5 rounded-sage transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Esci
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-bg-100 rounded-sage-lg border border-bg-300 px-5 py-4 shadow-sage-sm">
            <p className="text-xs font-medium text-text-400 uppercase tracking-wider mb-1">Materiali</p>
            <p className="text-2xl font-bold text-text-100">{documents.length}</p>
            <p className="text-xs text-text-400 mt-0.5">file caricati</p>
          </div>
          <div className="bg-bg-100 rounded-sage-lg border border-bg-300 px-5 py-4 shadow-sage-sm">
            <p className="text-xs font-medium text-text-400 uppercase tracking-wider mb-1">Spazio utilizzato</p>
            <p className="text-2xl font-bold text-text-100">{formatBytes(totalSize)}</p>
            <p className="text-xs text-text-400 mt-0.5">su tutti i documenti</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-grey-200 mb-6">
          {(["materials", "accessi", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-grey-950 text-grey-950"
                  : "border-transparent text-grey-500 hover:text-grey-800"
              }`}
            >
              {t === "materials" ? "Materiali" : t === "accessi" ? "Accessi" : "Impostazioni"}
            </button>
          ))}
        </div>

        {tab === "materials" && (
          <div className="space-y-5">
            {/* Upload Zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-sage-lg p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-primary-500 bg-primary-50"
                  : "border-bg-300 bg-bg-100 hover:border-primary-400 hover:bg-bg-0"
              }`}
            >
              <div className={`w-10 h-10 rounded-sage-lg mx-auto mb-3 flex items-center justify-center ${isDragging ? "bg-primary-100" : "bg-bg-200"}`}>
                <Upload className={`w-5 h-5 ${isDragging ? "text-primary-600" : "text-text-400"}`} />
              </div>
              <p className="text-sm font-medium text-text-200 mb-1">Trascina i file del corso qui o clicca per caricare</p>
              <p className="text-xs text-text-400">Supporta .txt, .md, .csv, .srt, .vtt, .json e altri formati di testo</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".txt,.md,.csv,.pdf,.json,.srt,.vtt"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Active uploads */}
            {uploads.length > 0 && (
              <div className="space-y-2">
                {uploads.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 bg-bg-100 rounded-sage-lg border border-bg-300 px-4 py-3 shadow-sage-sm">
                    {u.status === "reading" || u.status === "processing" ? (
                      <Loader2 className="w-4 h-4 text-primary-600 animate-spin flex-shrink-0" />
                    ) : u.status === "done" ? (
                      <CheckCircle className="w-4 h-4 text-sage-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-100 truncate">{u.name}</p>
                      <p className="text-xs text-text-400">
                        {u.status === "reading" && "Lettura file in corso..."}
                        {u.status === "processing" && "Generazione embeddings — potrebbe richiedere un momento..."}
                        {u.status === "done" && "Elaborato e indicizzato con successo"}
                        {u.status === "error" && (u.error ?? "Error")}
                      </p>
                    </div>
                    {(u.status === "done" || u.status === "error") && (
                      <button onClick={() => setUploads((p) => p.filter((x) => x.id !== u.id))} className="text-text-400 hover:text-text-200 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Documents table */}
            {documents.length > 0 ? (
              <div className="bg-bg-100 rounded-sage-lg border border-bg-300 overflow-hidden shadow-sage-sm">
                <div className="px-5 py-3.5 border-b border-bg-300 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-text-100">Materiali caricati</h2>
                  <span className="text-xs text-text-400 bg-bg-200 px-2 py-0.5 rounded-full">{documents.length} file</span>
                </div>
                <div className="divide-y divide-bg-300">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 px-5 py-3 hover:bg-bg-0 transition-colors group">
                      <div className="w-7 h-7 rounded-sage bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-100 truncate">{doc.name}</p>
                        <p className="text-xs text-text-400">{formatBytes(doc.size)} · Aggiunto il {formatDate(doc.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-all px-2 py-1 rounded-sage hover:bg-red-50 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Elimina
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-bg-100 rounded-sage-lg border border-bg-300 py-16 text-center shadow-sage-sm">
                <div className="w-10 h-10 rounded-sage-lg bg-bg-200 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-5 h-5 text-text-400" />
                </div>
                <p className="text-sm font-medium text-text-300">Nessun materiale caricato</p>
                <p className="text-xs text-text-400 mt-1">Carica trascrizioni, PDF o appunti per iniziare.</p>
              </div>
            )}
          </div>
        )}

        {tab === "accessi" && (
          <div className="space-y-5">
            {/* Add email form */}
            <div className="bg-white rounded-xl border border-grey-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-4 h-4 text-grey-600" />
                <h2 className="text-sm font-semibold text-grey-950">Aggiungi partecipante</h2>
              </div>
              <form onSubmit={handleAddEmail} className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@esempio.com"
                  className="flex-1 px-3.5 py-2.5 text-sm border border-grey-200 rounded-lg bg-grey-50 text-grey-950 placeholder-grey-400 focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-blue-150 transition-all"
                />
                <button
                  type="submit"
                  disabled={addingEmail}
                  className="flex items-center gap-2 px-4 py-2.5 bg-grey-950 text-white text-sm font-semibold rounded-lg hover:bg-grey-800 disabled:opacity-50 transition-colors"
                >
                  {addingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Aggiungi
                </button>
              </form>
              {emailError && <p className="text-xs text-red-600 mt-2">{emailError}</p>}
            </div>

            {/* Email list */}
            <div className="bg-white rounded-xl border border-grey-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-grey-150 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-grey-950">Email autorizzate</h2>
                <span className="text-xs text-grey-500 bg-grey-100 px-2 py-0.5 rounded-full">{allowedEmails.length} email</span>
              </div>

              {emailsLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-grey-400" />
                </div>
              ) : allowedEmails.length === 0 ? (
                <div className="py-12 text-center">
                  <Mail className="w-8 h-8 text-grey-300 mx-auto mb-2" />
                  <p className="text-sm text-grey-500">Nessuna email aggiunta</p>
                  <p className="text-xs text-grey-400 mt-1">Aggiungi le email dei partecipanti al corso.</p>
                </div>
              ) : (
                <div className="divide-y divide-grey-100">
                  {allowedEmails.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 px-5 py-3 hover:bg-grey-50 group transition-colors">
                      <div className="w-7 h-7 rounded-full bg-grey-100 border border-grey-200 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-3.5 h-3.5 text-grey-500" />
                      </div>
                      <span className="flex-1 text-sm text-grey-800 font-medium">{e.email}</span>
                      <button
                        onClick={() => handleRemoveEmail(e.id)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-all px-2 py-1 rounded-lg hover:bg-red-50 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Rimuovi
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="bg-bg-100 rounded-sage-lg border border-bg-300 p-6 max-w-md shadow-sage-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-sage bg-bg-200 flex items-center justify-center">
                <Key className="w-3.5 h-3.5 text-text-300" />
              </div>
              <h2 className="text-sm font-semibold text-text-100">Cambia password admin</h2>
            </div>
            <form onSubmit={handlePasswordSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-200 mb-1">Nuova password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nuova password"
                  className="w-full px-3 py-2 text-sm border border-bg-300 rounded-sage bg-bg-0 text-text-100 placeholder-text-500 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-200 mb-1">Conferma password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Conferma nuova password"
                  className="w-full px-3 py-2 text-sm border border-bg-300 rounded-sage bg-bg-0 text-text-100 placeholder-text-500 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-colors"
                />
              </div>
              {pwError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-sage px-3 py-2">{pwError}</p>
              )}
              {pwStatus === "saved" && (
                <p className="text-xs text-sage-700 bg-sage-50 border border-sage-200 rounded-sage px-3 py-2">Password aggiornata con successo.</p>
              )}
              <button
                type="submit"
                disabled={pwStatus === "saving"}
                className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-sage transition-colors"
              >
                {pwStatus === "saving" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {pwStatus === "saving" ? "Salvataggio..." : "Aggiorna password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
