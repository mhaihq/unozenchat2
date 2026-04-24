/*
  # Course Assistant Schema

  ## Overview
  Sets up the full schema for a RAG-based course assistant chatbot.

  ## Tables

  ### documents
  - Stores uploaded course materials (PDFs, transcripts, etc.)
  - Fields: id, name, type, size, created_at

  ### document_chunks
  - Text chunks extracted from documents with vector embeddings for semantic search
  - Fields: id, document_id, content, embedding (vector 1536), chunk_index, created_at

  ### chat_sessions
  - Groups messages into conversation sessions
  - Fields: id, created_at

  ### messages
  - Individual chat messages (user and assistant)
  - Fields: id, session_id, role, content, created_at

  ## Extensions
  - Enables pgvector for semantic similarity search

  ## Security
  - RLS enabled on all tables
  - Public read/write access for documents, chunks, sessions, and messages
    (anonymous users can use the chat, no auth required for this public course tool)
*/

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  size integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view documents"
  ON documents FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert documents"
  ON documents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can delete documents"
  ON documents FOR DELETE
  TO anon, authenticated
  USING (true);

-- Document chunks with embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content text NOT NULL,
  embedding vector(1536),
  chunk_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chunks"
  ON document_chunks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert chunks"
  ON document_chunks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sessions"
  ON chat_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert sessions"
  ON chat_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_count integer DEFAULT 5,
  similarity_threshold float DEFAULT 0.5
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  chunk_index integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages(session_id);
