import { supabase, EDGE_FUNCTION_URL } from "./supabase";
import type { Document, Message } from "./types";

const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const authHeaders = {
  Authorization: `Bearer ${anonKey}`,
  "Content-Type": "application/json",
};

export async function createSession(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: user?.id })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function sendMessage(
  message: string,
  sessionId: string,
  history: Message[]
): Promise<{ message: string; sourcesFound: number }> {
  const response = await fetch(`${EDGE_FUNCTION_URL}/chat`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      message,
      sessionId,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Request failed");
  }

  return response.json();
}

export async function uploadDocument(
  name: string,
  type: string,
  size: number,
  content: string
): Promise<Document> {
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({ name, type, size })
    .select("id, name, type, size, created_at")
    .single();

  if (docError) throw new Error(docError.message);

  const response = await fetch(`${EDGE_FUNCTION_URL}/ingest`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ documentId: doc.id, content }),
  });

  if (!response.ok) {
    await supabase.from("documents").delete().eq("id", doc.id);
    const err = await response.json().catch(() => ({ error: "Processing failed" }));
    throw new Error(err.error ?? "Processing failed");
  }

  return {
    id: doc.id,
    name: doc.name,
    type: doc.type,
    size: doc.size,
    createdAt: new Date(doc.created_at),
  };
}

export async function fetchDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("id, name, type, size, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    size: d.size,
    createdAt: new Date(d.created_at),
  }));
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  // Hash the password client-side using SubtleCrypto and compare to stored hash
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const { data: setting, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "admin_password_hash")
    .maybeSingle();

  if (error || !setting) return false;
  return setting.value === hashHex;
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  const encoder = new TextEncoder();
  const data = encoder.encode(newPassword);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const { error } = await supabase
    .from("app_settings")
    .update({ value: hashHex })
    .eq("key", "admin_password_hash");

  if (error) throw new Error(error.message);
}
