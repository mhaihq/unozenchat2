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

      const chunks = chunkText(content);
      let processed = 0;

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await getEmbedding(chunks[i]);
        const { error } = await supabase.from("document_chunks").insert({
          document_id: documentId,
          content: chunks[i],
          embedding,
          chunk_index: i,
        });
        if (error) throw new Error(error.message);
        processed++;
      }

      return new Response(JSON.stringify({ success: true, chunksProcessed: processed }), {
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

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
