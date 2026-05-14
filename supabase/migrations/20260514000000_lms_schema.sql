/*
  LMS Schema — full rewrite
  ─────────────────────────
  courses         : course templates (live | recorded)
  cohorts         : instances of a live course (one per edition)
  lessons         : curriculum units belonging to a course
  cohort_lessons  : per-cohort video + transcript overrides
  enrollments     : user → cohort membership (replaces allowed_emails for access control)
  progress        : per-user, per-lesson completion
  document_chunks : unchanged — lesson_number stays, cohort_id added for scoped RAG
*/

-- ─── Courses ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,            -- e.g. "ai-per-psicologi"
  title       text NOT NULL,
  description text,
  type        text NOT NULL CHECK (type IN ('live', 'recorded')),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Cohorts (instances of a live course) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS cohorts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name        text NOT NULL,                   -- e.g. "Edizione 4 — Maggio 2026"
  starts_at   date,
  ends_at     date,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Lessons ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  number           integer NOT NULL,
  title            text NOT NULL,
  focus            text,
  -- default video / presentation for recorded courses (or fallback for live)
  default_video_id text,
  default_presentation_url text,
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, number)
);

-- ─── Subtopics ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subtopics (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id          uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title              text NOT NULL,
  bullets            text[] NOT NULL DEFAULT '{}',
  suggested_questions text[] NOT NULL DEFAULT '{}',
  sort_order         integer NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ─── Cohort lessons (per-cohort video + RAG overrides) ─────────────────────────
CREATE TABLE IF NOT EXISTS cohort_lessons (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id     uuid NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  lesson_id     uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  -- live recording uploaded after session — overrides default_video_id
  video_id      text,
  presentation_url text,
  -- document linked for this cohort's lesson RAG
  document_id   uuid REFERENCES documents(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_id, lesson_id)
);

-- ─── Enrollments (user ↔ cohort) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id  uuid NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, cohort_id)
);

-- ─── Progress ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subtopic_id  uuid NOT NULL REFERENCES subtopics(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, subtopic_id)
);

-- ─── Add cohort_id to document_chunks for scoped RAG ───────────────────────────
ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES cohorts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS document_chunks_cohort_lesson_idx
  ON document_chunks(cohort_id, lesson_number);

-- ─── RPC: match chunks scoped to a cohort + lesson ─────────────────────────────
CREATE OR REPLACE FUNCTION match_chunks_for_cohort_lesson(
  query_embedding      vector(1536),
  p_cohort_id          uuid,
  p_lesson_number      integer,
  match_count          integer DEFAULT 6,
  similarity_threshold float   DEFAULT 0.3
)
RETURNS TABLE (
  id          uuid,
  document_id uuid,
  content     text,
  chunk_index integer,
  similarity  float
)
LANGUAGE plpgsql AS $$
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
    AND dc.cohort_id = p_cohort_id
    AND dc.lesson_number = p_lesson_number
    AND 1 - (dc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ─── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE courses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopics    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress     ENABLE ROW LEVEL SECURITY;

-- Public read for course content
CREATE POLICY "courses_public_read"       ON courses       FOR SELECT USING (true);
CREATE POLICY "cohorts_public_read"       ON cohorts       FOR SELECT USING (true);
CREATE POLICY "lessons_public_read"       ON lessons       FOR SELECT USING (true);
CREATE POLICY "subtopics_public_read"     ON subtopics     FOR SELECT USING (true);
CREATE POLICY "cohort_lessons_public_read" ON cohort_lessons FOR SELECT USING (true);

-- Enrollments: users see their own
CREATE POLICY "enrollments_own_read"  ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "enrollments_own_write" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Progress: users manage their own
CREATE POLICY "progress_own_read"   ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_own_insert" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_own_delete" ON progress FOR DELETE USING (auth.uid() = user_id);

-- ─── Seed: migrate existing hardcoded course data ──────────────────────────────
-- Insert the recorded course
INSERT INTO courses (id, slug, title, description, type)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'ai-per-psicologi',
  'AI per Psicologi',
  'Corso on-demand per professionisti della salute mentale',
  'recorded'
) ON CONFLICT (slug) DO NOTHING;

-- Lessons (matching current courseData.ts)
INSERT INTO lessons (id, course_id, number, title, focus, default_video_id, default_presentation_url, sort_order)
VALUES
  ('b1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001', 1,
   'Le Fondamenta',
   'Come funziona l''AI, mercato, etica e rischi. Focus: Teoria, mercato, regolamentazione e privacy.',
   '1186228117',
   'https://docs.google.com/presentation/d/1YKWj0Uc5VA2MFmEJkLwLrzoX2708ixWD/preview',
   1),
  ('b1000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001', 2,
   'Prompt Engineering per Psicologi',
   'Imparare a comunicare con l''AI, framework testuali e simulazioni cliniche.',
   NULL, NULL, 2),
  ('b1000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001', 3,
   'Strumenti AI per la Pratica Clinica',
   'Tool specifici per la professione: automazione, documentazione e ricerca.',
   NULL, NULL, 3),
  ('b1000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001', 4,
   'AI per la Ricerca e la Supervisione',
   'Analisi della letteratura, supervisione AI-assistita e scenari futuri.',
   NULL, NULL, 4)
ON CONFLICT DO NOTHING;
