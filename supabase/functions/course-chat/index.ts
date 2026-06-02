import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-ada-002",
      input: text.slice(0, 8000),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Embedding error: ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

function extractLessonNumber(name: string): number | null {
  const m = name.match(/Corso[ _\-]*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end).trim());
    start += chunkSize - overlap;
  }
  return chunks.filter((c) => c.length > 50);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const url = new URL(req.url);
    const path = url.pathname.replace("/course-chat", "");

    // POST /ingest - Upload and process a document
    if (path === "/ingest" && req.method === "POST") {
      const { documentId, content } = await req.json();

      if (!documentId || !content) {
        return new Response(JSON.stringify({ error: "documentId and content are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Look up the document name to derive lesson_number (e.g. "Corso_2_trascrizione.txt" → 2)
      const { data: doc } = await supabase.from("documents").select("name").eq("id", documentId).single();
      const lessonNumber = doc?.name ? extractLessonNumber(doc.name) : null;

      const chunks = chunkText(content);
      let processed = 0;

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await getEmbedding(chunks[i]);
        const { error } = await supabase.from("document_chunks").insert({
          document_id: documentId,
          content: chunks[i],
          embedding,
          chunk_index: i,
          lesson_number: lessonNumber,
        });
        if (error) throw new Error(error.message);
        processed++;
      }

      return new Response(JSON.stringify({ success: true, chunksProcessed: processed, lessonNumber }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /chat - Chat with the course assistant
    if (path === "/chat" && req.method === "POST") {
      const { message, sessionId, history } = await req.json();

      if (!message) {
        return new Response(JSON.stringify({ error: "message is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get embedding for the user's question
      const queryEmbedding = await getEmbedding(message);

      // Find relevant document chunks
      const { data: chunks, error: searchError } = await supabase.rpc("match_document_chunks", {
        query_embedding: queryEmbedding,
        match_count: 6,
        similarity_threshold: 0.3,
      });

      if (searchError) throw new Error(searchError.message);

      // Build context from chunks
      const context = chunks && chunks.length > 0
        ? chunks.map((c: { content: string }) => c.content).join("\n\n---\n\n")
        : "";

      const systemPrompt = context
        ? `You are a helpful course assistant. Answer questions based on the course materials provided below. Be clear, concise, and educational. If the answer is not found in the provided context, say so honestly and offer general guidance.\n\nCOURSE MATERIAL CONTEXT:\n${context}`
        : `You are a helpful course assistant. No course materials have been uploaded yet. Encourage the user to upload course materials (PDFs, transcripts, etc.) so you can answer specific questions about them. You can still answer general questions.`;

      // Build messages array
      const historyMessages = (history || []).slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }));

      const chatMessages = [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: message },
      ];

      // Call OpenAI
      const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!chatResponse.ok) {
        const err = await chatResponse.text();
        throw new Error(`OpenAI error: ${err}`);
      }

      const chatData = await chatResponse.json();
      const assistantMessage = chatData.choices[0].message.content;

      // Persist messages if sessionId is provided
      if (sessionId) {
        await supabase.from("messages").insert([
          { session_id: sessionId, role: "user", content: message },
          { session_id: sessionId, role: "assistant", content: assistantMessage },
        ]);
      }

      return new Response(
        JSON.stringify({
          message: assistantMessage,
          sourcesFound: chunks?.length ?? 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /lesson-chat - Streaming chat for the per-lesson assistant.
    // Supports cohort-scoped RAG (cohortId + lessonNumber) and global lesson RAG (lessonNumber only).
    if (path === "/lesson-chat" && req.method === "POST") {
      const { messages, model, temperature, max_completion_tokens, lessonNumber, cohortId } = await req.json();

      if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: "messages array is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let augmentedMessages = messages;

      if (typeof lessonNumber === "number") {
        const lastUser = [...messages].reverse().find((m: { role: string; content: string }) => m.role === "user");
        if (lastUser?.content) {
          try {
            const queryEmbedding = await getEmbedding(lastUser.content);

            // Prefer cohort-scoped chunks; fall back to global lesson chunks
            let chunks: { content: string }[] | null = null;

            if (cohortId) {
              const { data } = await supabase.rpc("match_chunks_for_cohort_lesson", {
                query_embedding: queryEmbedding,
                p_cohort_id: cohortId,
                p_lesson_number: lessonNumber,
                match_count: 6,
                similarity_threshold: 0.3,
              });
              if (data && data.length > 0) chunks = data;
            }

            if (!chunks || chunks.length === 0) {
              const { data } = await supabase.rpc("match_document_chunks_for_lesson", {
                query_embedding: queryEmbedding,
                target_lesson_number: lessonNumber,
                match_count: 6,
                similarity_threshold: 0.3,
              });
              if (data && data.length > 0) chunks = data;
            }

            if (chunks && chunks.length > 0) {
              const context = chunks.map((c: { content: string }) => c.content).join("\n\n---\n\n");
              const ragNote = `\n\nMATERIALE DEL CORSO (Lezione ${lessonNumber}) — usa questo come fonte primaria per rispondere. Cita i contenuti quando rilevante; se la risposta non è nel materiale, dillo onestamente.\n\n${context}`;

              const firstSystemIdx = messages.findIndex((m: { role: string }) => m.role === "system");
              if (firstSystemIdx >= 0) {
                augmentedMessages = messages.map((m: { role: string; content: string }, i: number) =>
                  i === firstSystemIdx ? { ...m, content: m.content + ragNote } : m
                );
              } else {
                augmentedMessages = [{ role: "system", content: ragNote.trim() }, ...messages];
              }
            }
          } catch (e) {
            console.error("RAG retrieval failed, falling back to bare prompt:", e);
          }
        }
      }

      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model ?? "gpt-4o-mini",
          stream: true,
          messages: augmentedMessages,
          temperature: temperature ?? 0.7,
          max_completion_tokens: max_completion_tokens ?? 1024,
        }),
      });

      if (!upstream.ok || !upstream.body) {
        const errText = await upstream.text();
        return new Response(JSON.stringify({ error: errText }), {
          status: upstream.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Pass the SSE stream straight through
      return new Response(upstream.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // POST /transcribe - Whisper transcription (proxies multipart audio)
    if (path === "/transcribe" && req.method === "POST") {
      const inboundForm = await req.formData();
      const file = inboundForm.get("file");
      if (!(file instanceof File)) {
        return new Response(JSON.stringify({ error: "file is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const outboundForm = new FormData();
      outboundForm.append("file", file, file.name);
      outboundForm.append("model", String(inboundForm.get("model") ?? "whisper-1"));

      const upstream = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: outboundForm,
      });

      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /voice-key - Returns OpenAI key to authenticated users for WebSocket voice
    if (path === "/voice-key" && req.method === "GET") {
      const { data: { user } } = await supabase.auth.getUser(
        req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
      );
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ key: OPENAI_API_KEY }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /quiz-submit - Server-side quiz scoring (is_correct never sent to client)
    if (path === "/quiz-submit" && req.method === "POST") {
      const { data: { user } } = await supabase.auth.getUser(
        req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
      );
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { quiz_id, cohort_id, answers } = await req.json() as {
        quiz_id: string;
        cohort_id?: string;
        answers: Record<string, string>; // { question_id: option_id }
      };

      if (!quiz_id || !answers) {
        return new Response(JSON.stringify({ error: "quiz_id and answers are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch quiz config
      const { data: quiz } = await supabase.from("ecm_quizzes").select("pass_threshold").eq("id", quiz_id).single();
      if (!quiz) {
        return new Response(JSON.stringify({ error: "Quiz not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch all options with correct flag (service role — never exposed to client)
      const { data: options } = await supabase
        .from("ecm_quiz_options")
        .select("id, question_id, is_correct");

      const correctMap: Record<string, string> = {}; // question_id → correct option_id
      for (const opt of options ?? []) {
        if (opt.is_correct) correctMap[opt.question_id] = opt.id;
      }

      const questionIds = Object.keys(answers);
      let correctCount = 0;
      const wrongQuestionIds: string[] = [];
      const answerRows: { attempt_id: string; question_id: string; option_id: string; is_correct: boolean }[] = [];

      // Create attempt record
      const { data: attempt } = await supabase.from("ecm_quiz_attempts").insert({
        user_id: user.id,
        quiz_id,
        cohort_id: cohort_id ?? null,
        submitted_at: new Date().toISOString(),
        score: 0,
        passed: false,
      }).select("id").single();

      if (!attempt) {
        return new Response(JSON.stringify({ error: "Failed to create attempt" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      for (const qid of questionIds) {
        const chosen = answers[qid];
        const isCorrect = correctMap[qid] === chosen;
        if (isCorrect) correctCount++;
        else wrongQuestionIds.push(qid);
        answerRows.push({ attempt_id: attempt.id, question_id: qid, option_id: chosen, is_correct: isCorrect });
      }

      const score = questionIds.length > 0 ? correctCount / questionIds.length : 0;
      const passed = score >= (quiz.pass_threshold ?? 0.75);

      // Update attempt with score
      await supabase.from("ecm_quiz_attempts").update({ score, passed, submitted_at: new Date().toISOString() }).eq("id", attempt.id);

      // Insert answers
      if (answerRows.length > 0) await supabase.from("ecm_quiz_answers").insert(answerRows);

      // If passed, update ecm_participation
      if (passed && cohort_id) {
        await supabase.from("ecm_participation").upsert({
          user_id: user.id,
          cohort_id,
          quiz_passed_at: new Date().toISOString(),
        }, { onConflict: "user_id,cohort_id" });
      }

      return new Response(JSON.stringify({
        passed,
        score,
        correct: correctCount,
        total: questionIds.length,
        wrong_question_ids: wrongQuestionIds,
        attempt_id: attempt.id,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // POST /realtime-sdp - WebRTC SDP proxy.
    if (path === "/realtime-sdp" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const { sdp, model } = body as { sdp?: string; model?: string };
      if (!sdp) {
        return new Response(JSON.stringify({ error: "sdp is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const realtimeModel = model ?? "gpt-realtime-2";
      const upstream = await fetch(
        `https://api.openai.com/v1/realtime?model=${encodeURIComponent(realtimeModel)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/sdp" },
          body: sdp,
        },
      );
      if (!upstream.ok) {
        const errText = await upstream.text();
        console.error("OpenAI Realtime SDP error:", upstream.status, errText);
        return new Response(JSON.stringify({ error: errText }), {
          status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const answerSdp = await upstream.text();
      return new Response(JSON.stringify({ sdp: answerSdp }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /realtime-token - ephemeral token (GA model, minimal body)
    if (path === "/realtime-token" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const { instructions, voice, model } = body as { instructions?: string; voice?: string; model?: string };
      const realtimeModel = model ?? "gpt-realtime-2";
      const upstream = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: realtimeModel, voice: voice ?? "alloy", instructions: instructions ?? "" }),
      });
      if (!upstream.ok) {
        const errText = await upstream.text();
        console.error("OpenAI Realtime sessions error:", upstream.status, errText);
        return new Response(JSON.stringify({ error: errText }), {
          status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await upstream.text();
      return new Response(text, { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
