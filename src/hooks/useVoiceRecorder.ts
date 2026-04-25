import { useState, useRef, useCallback } from "react";

export type RecordingState = "idle" | "recording" | "transcribing" | "error";

interface UseVoiceRecorderOptions {
  onTranscript: (text: string) => void;
  onError?: (msg: string) => void;
}

export function useVoiceRecorder({ onTranscript, onError }: UseVoiceRecorderOptions) {
  const [state, setState] = useState<RecordingState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setState("transcribing");
        try {
          const formData = new FormData();
          formData.append("file", blob, `audio.${mimeType.split("/")[1]}`);
          formData.append("model", "whisper-1");
          const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` },
            body: formData,
          });
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();
          onTranscript(data.text?.trim() ?? "");
          setState("idle");
        } catch (err) {
          setState("error");
          onError?.(err instanceof Error ? err.message : "Trascrizione fallita");
          setTimeout(() => setState("idle"), 3000);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setState("recording");
    } catch (err) {
      setState("error");
      onError?.(err instanceof Error ? err.message : "Accesso al microfono negato");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [onTranscript, onError]);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (state === "recording") stop();
    else if (state === "idle") start();
  }, [state, start, stop]);

  return { state, toggle, stop };
}
