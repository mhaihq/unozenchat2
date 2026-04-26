export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: Date;
}

export type UploadStatus = "idle" | "reading" | "processing" | "done" | "error";

export type AppView = "dashboard" | "course" | "admin";
