import { useState, useRef, useCallback } from "react";
import { EDGE_FUNCTION_URL, supabase } from "../lib/supabase";

async function fetchEphemeralToken(instructions: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(`${EDGE_FUNCTION_URL}/realtime-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ instructions, voice: "alloy", model: "gpt-realtime-2" }),
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${await res.text()}`);
  const data = await res.json();
  const token = data?.client_secret?.value;
  if (!token) throw new Error("No ephemeral token in response");
  return token;
}

export type VoiceState = "idle" | "connecting" | "listening" | "speaking" | "error";

interface UseRealtimeVoiceOptions {
  onUserTranscript?: (text: string) => void;
  onAssistantTranscript?: (text: string) => void;
  onStateChange?: (state: VoiceState) => void;
}

const WS_URL = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2";
const SAMPLE_RATE = 24000;

function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buffer;
}

export function useRealtimeVoice(options: UseRealtimeVoiceOptions = {}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [assistantTranscript, setAssistantTranscript] = useState("");
  const [userTranscript, setUserTranscript] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const setVoiceState = useCallback((s: VoiceState) => {
    setState(s);
    options.onStateChange?.(s);
  }, [options]);

  const stopAudio = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
  }, []);

  const playAudioChunk = useCallback((base64: string) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const pcmBuffer = base64ToArrayBuffer(base64);
    const int16 = new Int16Array(pcmBuffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

    const audioBuffer = ctx.createBuffer(1, float32.length, SAMPLE_RATE);
    audioBuffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now, nextPlayTimeRef.current);
    source.start(startAt);
    nextPlayTimeRef.current = startAt + audioBuffer.duration;
  }, []);

  const connect = useCallback(async (systemPrompt: string) => {
    if (wsRef.current) return;

    setVoiceState("connecting");
    setAssistantTranscript("");
    setUserTranscript("");

    let ephemeralToken: string;
    try {
      console.log("[Voice] Fetching ephemeral token…");
      ephemeralToken = await fetchEphemeralToken(systemPrompt);
      console.log("[Voice] Token OK, opening WebSocket…");
    } catch (err) {
      console.error("[Voice] Token fetch failed:", err);
      setVoiceState("error");
      return;
    }

    const ws = new WebSocket(WS_URL, [
      "realtime",
      `openai-insecure-api-key.${ephemeralToken}`,
    ]);
    wsRef.current = ws;

    audioCtxRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
    nextPlayTimeRef.current = 0;

    ws.onopen = async () => {
      console.log("[Voice] WebSocket opened, sending session.update");
      ws.send(JSON.stringify({
        type: "session.update",
        session: {
          type: "realtime",
          instructions: systemPrompt,
        },
      }));

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const ctx = audioCtxRef.current!;
        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;

        const processor = ctx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const input = e.inputBuffer.getChannelData(0);
          const pcm = floatTo16BitPCM(input);
          ws.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: arrayBufferToBase64(pcm),
          }));
        };

        // Connect processor to a silent node — we only need onaudioprocess to fire,
        // not to actually play the mic audio back to the user.
        const silentGain = ctx.createGain();
        silentGain.gain.value = 0;
        source.connect(processor);
        processor.connect(silentGain);
        silentGain.connect(ctx.destination);

        console.log("[Voice] Mic started, state → listening");
        setVoiceState("listening");
      } catch (micErr) {
        console.error("[Voice] Mic error:", micErr);
        setVoiceState("error");
        ws.close();
      }
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type !== "input_audio_buffer.speech_started" && msg.type !== "response.output_audio.delta") {
        console.log("[Voice] msg:", msg.type, msg.error ?? "");
      }

      switch (msg.type) {
        case "response.output_audio.delta":
          setVoiceState("speaking");
          playAudioChunk(msg.delta);
          break;

        case "response.output_audio.done":
          setVoiceState("listening");
          break;

        case "response.output_audio_transcript.delta":
          setAssistantTranscript((prev) => {
            const next = prev + msg.delta;
            options.onAssistantTranscript?.(next);
            return next;
          });
          break;

        case "response.output_audio_transcript.done":
          setAssistantTranscript("");
          break;

        case "conversation.item.input_audio_transcription.completed":
          setUserTranscript(msg.transcript ?? "");
          options.onUserTranscript?.(msg.transcript ?? "");
          break;

        case "input_audio_buffer.speech_started":
          setVoiceState("listening");
          setUserTranscript("");
          nextPlayTimeRef.current = 0;
          break;

        case "error":
          console.error("Realtime API error:", JSON.stringify(msg.error, null, 2));
          setVoiceState("error");
          break;
      }
    };

    ws.onerror = () => setVoiceState("error");
    ws.onclose = () => {
      stopAudio();
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      wsRef.current = null;
      setVoiceState("idle");
    };
  }, [playAudioChunk, setVoiceState, stopAudio, options]);

  const disconnect = useCallback(() => {
    stopAudio();
    wsRef.current?.close();
    wsRef.current = null;
    setVoiceState("idle");
    setAssistantTranscript("");
    setUserTranscript("");
  }, [stopAudio, setVoiceState]);

  return { state, assistantTranscript, userTranscript, connect, disconnect };
}
