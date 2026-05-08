/*
  Add lesson_number to document_chunks so we can scope retrieval to a specific lesson.

  Strategy:
  - Add a nullable integer `lesson_number` column to document_chunks.
  - Backfill from the parent document's name using a regex like "Corso 2", "Corso_2", "Corso-2", etc.
    Documents whose names don't match are left NULL (treated as global / fallback).
  - Add a partial index for fast lookups by lesson.
  - Add a new RPC `match_document_chunks_for_lesson` that filters by lesson_number.
*/

ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS lesson_number integer;

-- Backfill existing rows from documents.name (e.g. "Corso_2_trascrizione.txt" → 2)
UPDATE document_chunks dc
SET lesson_number = (
  SELECT NULLIF(substring(d.name FROM 'Corso[ _\-]*([0-9]+)'), '')::integer
  FROM documents d
  WHERE d.id = dc.document_id
)
WHERE dc.lesson_number IS NULL;

CREATE INDEX IF NOT EXISTS document_chunks_lesson_number_idx
  ON document_chunks(lesson_number);

CREATE OR REPLACE FUNCTION match_document_chunks_for_lesson(
  query_embedding vector(1536),
  target_lesson_number integer,
  match_count integer DEFAULT 5,
  similarity_threshold float DEFAULT 0.3
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
    AND dc.lesson_number = target_lesson_number
    AND 1 - (dc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
