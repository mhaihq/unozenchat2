import { useRef, useState } from "react";
import {
  Upload, FileText, Trash2, AlertCircle, CheckCircle, Loader2, X,
  LogOut, Key, BookOpen, Sparkles, RefreshCw,
} from "lucide-react";
import type { Document, UploadStatus } from "../lib/types";
import { uploadDocument, deleteDocument, updateAdminPassword } from "../lib/api";

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
  const [tab, setTab] = useState<"materials" | "settings">("materials");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState("");

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
      updateUpload(uploadId, {
        status: "error",
        error: err instanceof Error ? err.message : "Caricamento fallito",
      });
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
    for (const file of Array.from(files)) {
      await processFile(file);
    }
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
    if (newPassword.length < 6) {
      setPwError("La password deve contenere almeno 6 caratteri.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Le password non coincidono.");
      return;
    }
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

  const tabLabels: Record<"materials" | "settings", string> = {
    materials: "Materiali",
    settings: "Impostazioni",
  };

  return (
    <div className="min-h-screen bg-bg-0 font-sans">
      {/* Header */}
      <header className="bg-bg-100 border-b border-bg-300 px-6 py-4 flex items-center gap-4">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-md shadow-accent/20">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-text-100">Assistente del Corso</h1>
          <p className="text-xs text-text-400">Pannello di amministrazione</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-100">
            <Sparkles className="w-3 h-3" />
            Admin
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-text-400 hover:text-text-100 bg-bg-200 hover:bg-bg-300 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Esci
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-bg-100 rounded-2xl border border-bg-300 px-6 py-5 shadow-input">
            <p className="text-xs font-semibold text-text-400 uppercase tracking-wider mb-1">Materiali</p>
            <p className="text-3xl font-bold text-text-100">{documents.length}</p>
            <p className="text-xs text-text-400 mt-1">file caricati</p>
          </div>
          <div className="bg-bg-100 rounded-2xl border border-bg-300 px-6 py-5 shadow-input">
            <p className="text-xs font-semibold text-text-400 uppercase tracking-wider mb-1">Spazio utilizzato</p>
            <p className="text-3xl font-bold text-text-100">{formatBytes(totalSize)}</p>
            <p className="text-xs text-text-400 mt-1">su tutti i documenti</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-bg-100 rounded-xl border border-bg-300 p-1 w-fit shadow-input">
          {(["materials", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                tab === t
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-400 hover:text-text-200"
              }`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {tab === "materials" && (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-accent bg-accent/5"
                  : "border-bg-300 bg-bg-100 hover:border-accent/50 hover:bg-bg-0 shadow-input"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors ${isDragging ? "bg-accent/10" : "bg-bg-200"}`}>
                <Upload className={`w-5 h-5 transition-colors ${isDragging ? "text-accent" : "text-text-400"}`} />
              </div>
              <p className="text-sm font-semibold text-text-200 mb-1.5">
                Trascina i file del corso qui o clicca per caricare
              </p>
              <p className="text-xs text-text-400">
                Supporta .txt, .md, .csv, .srt, .vtt, .json e altri formati di testo
              </p>
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
                  <div key={u.id} className="flex items-center gap-3 bg-bg-100 rounded-xl border border-bg-300 px-4 py-3 shadow-input">
                    {u.status === "reading" || u.status === "processing" ? (
                      <Loader2 className="w-4 h-4 text-accent animate-spin flex-shrink-0" />
                    ) : u.status === "done" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-100 truncate">{u.name}</p>
                      <p className="text-xs text-text-400">
                        {u.status === "reading" && "Lettura file in corso..."}
                        {u.status === "processing" && "Generazione embeddings — potrebbe richiedere un momento..."}
                        {u.status === "done" && "Elaborato e indicizzato con successo"}
                        {u.status === "error" && (u.error ?? "Errore")}
                      </p>
                    </div>
                    {(u.status === "done" || u.status === "error") && (
                      <button
                        onClick={() => setUploads((p) => p.filter((x) => x.id !== u.id))}
                        className="text-text-400 hover:text-text-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Documents table */}
            {documents.length > 0 ? (
              <div className="bg-bg-100 rounded-2xl border border-bg-300 overflow-hidden shadow-input">
                <div className="px-5 py-4 border-b border-bg-300 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-text-100">Materiali caricati</h2>
                  <span className="text-xs text-text-400 bg-bg-200 px-2.5 py-1 rounded-full">
                    {documents.length} file
                  </span>
                </div>
                <div className="divide-y divide-bg-300">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-0 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-100 truncate">{doc.name}</p>
                        <p className="text-xs text-text-400">{formatBytes(doc.size)} &middot; Aggiunto il {formatDate(doc.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-all px-2.5 py-1.5 rounded-lg hover:bg-red-50 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Elimina
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-bg-100 rounded-2xl border border-bg-300 py-20 text-center shadow-input">
                <div className="w-12 h-12 rounded-2xl bg-bg-200 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-5 h-5 text-text-400" />
                </div>
                <p className="text-sm font-semibold text-text-300">Nessun materiale caricato</p>
                <p className="text-xs text-text-400 mt-1.5">
                  Carica trascrizioni, PDF o appunti per iniziare.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="bg-bg-100 rounded-2xl border border-bg-300 p-6 max-w-md shadow-input">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-bg-200 flex items-center justify-center">
                <Key className="w-4 h-4 text-text-300" />
              </div>
              <h2 className="text-sm font-semibold text-text-100">Cambia password admin</h2>
            </div>
            <form onSubmit={handlePasswordSave} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-300 uppercase tracking-wider">Nuova password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nuova password"
                  className="w-full px-4 py-2.5 rounded-xl border border-bg-300 bg-bg-0 text-sm text-text-100 placeholder-text-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-300 uppercase tracking-wider">Conferma password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Conferma nuova password"
                  className="w-full px-4 py-2.5 rounded-xl border border-bg-300 bg-bg-0 text-sm text-text-100 placeholder-text-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                />
              </div>
              {pwError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{pwError}</p>
              )}
              {pwStatus === "saved" && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">Password aggiornata con successo.</p>
              )}
              <button
                type="submit"
                disabled={pwStatus === "saving"}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-accent/20 mt-1"
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
