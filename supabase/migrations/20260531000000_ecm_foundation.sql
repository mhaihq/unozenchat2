-- ECM / FAD compliance foundation (see ECM_COMPLIANCE.md)
-- Purely additive: new tables + nullable columns. No destructive changes.

-- ── A2: official duration per lesson (Allegato D) ──────────────────────────
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes integer;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_updated_note text;

-- ── F2: ECM identity profile (codice fiscale, professione, disciplina) ─────
CREATE TABLE IF NOT EXISTS ecm_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  codice_fiscale text,
  full_name text,
  professione text,        -- es. 'Psicologo'
  disciplina text,         -- es. 'Psicoterapia' | 'Psicologia'
  employment text,         -- 'libero_professionista' | 'dipendente' | 'convenzionato' | 'privo'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── C1: activity log (tracciabilità di tutte le operazioni) ────────────────
CREATE TABLE IF NOT EXISTS ecm_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cohort_id uuid REFERENCES cohorts(id) ON DELETE SET NULL,
  event_type text NOT NULL,   -- login | lesson_open | video_progress | page_view | quiz_start | quiz_submit | survey_submit | attestato_download
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  detail jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ecm_activity_log_user_idx ON ecm_activity_log(user_id, created_at);

-- ── D1: quiz engine ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ecm_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  cohort_id uuid REFERENCES cohorts(id) ON DELETE CASCADE,
  title text NOT NULL,
  pass_threshold numeric NOT NULL DEFAULT 0.75,  -- ≥75% ECM FAD
  questions_to_show integer,                     -- subset drawn from bank; null = all
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecm_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES ecm_quizzes(id) ON DELETE CASCADE,
  text text NOT NULL,
  author text,                 -- authorship (regola docente >25%)
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecm_quiz_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES ecm_quiz_questions(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  sort_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ecm_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES ecm_quizzes(id) ON DELETE CASCADE,
  cohort_id uuid REFERENCES cohorts(id) ON DELETE SET NULL,
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  score numeric,               -- 0..1
  passed boolean,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecm_quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES ecm_quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid REFERENCES ecm_quiz_questions(id) ON DELETE CASCADE,
  option_id uuid REFERENCES ecm_quiz_options(id) ON DELETE SET NULL,
  is_correct boolean
);

-- ── E2: anonymous quality survey (Allegato B) — intentionally NO user_id ───
CREATE TABLE IF NOT EXISTS ecm_quality_survey (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES cohorts(id) ON DELETE SET NULL,
  q1_relevance smallint,            -- 1..5 rilevanza
  q2_quality smallint,              -- 1..5 qualità educativa
  q3_usefulness smallint,           -- 1..5 utilità
  q4_time smallint,                 -- 1..5 tempo (molto inf .. molto sup)
  q5_sponsor_influence smallint,    -- 1..5 (nessuna .. molto rilevante)
  q5_example text,
  created_at timestamptz DEFAULT now()
);

-- ── C2/D2/E2/F1: per-participation ECM state (one per enrollment) ──────────
CREATE TABLE IF NOT EXISTS ecm_participation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id uuid REFERENCES cohorts(id) ON DELETE CASCADE,
  fruition_complete boolean DEFAULT false,
  quiz_passed_at timestamptz,
  survey_done boolean DEFAULT false,        -- E1: flag only; answers stored anonymously
  reclutato boolean DEFAULT false,          -- G3: dichiarazione reclutamento
  attestato_issued_at timestamptz,
  credits numeric,
  UNIQUE(user_id, cohort_id)
);

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE ecm_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecm_activity_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecm_quizzes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecm_quiz_questions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecm_quiz_options    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecm_quiz_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecm_quiz_answers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecm_quality_survey  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecm_participation   ENABLE ROW LEVEL SECURITY;

-- Profiles: user manages own row
CREATE POLICY ecm_profiles_self ON ecm_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Activity log: user inserts/reads own rows
CREATE POLICY ecm_activity_insert_self ON ecm_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY ecm_activity_select_self ON ecm_activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- Quiz content: any authenticated user may read (but correct flag handled in app/edge)
CREATE POLICY ecm_quizzes_read ON ecm_quizzes
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY ecm_questions_read ON ecm_quiz_questions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY ecm_options_read ON ecm_quiz_options
  FOR SELECT USING (auth.role() = 'authenticated');

-- Attempts/answers: user manages own
CREATE POLICY ecm_attempts_self ON ecm_quiz_attempts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY ecm_answers_self ON ecm_quiz_answers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM ecm_quiz_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM ecm_quiz_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
  );

-- Quality survey: INSERT only for authenticated; NO select (preserves anonymity).
CREATE POLICY ecm_survey_insert ON ecm_quality_survey
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Participation: user manages own row
CREATE POLICY ecm_participation_self ON ecm_participation
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
