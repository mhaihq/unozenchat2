-- Admin write policies for LMS tables
-- Gated at the app level by admin password; any authenticated session can write.

CREATE POLICY "courses_auth_insert" ON courses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "courses_auth_update" ON courses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "courses_auth_delete" ON courses FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "cohorts_auth_insert" ON cohorts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cohorts_auth_update" ON cohorts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "cohorts_auth_delete" ON cohorts FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "lessons_auth_insert" ON lessons FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "lessons_auth_update" ON lessons FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "lessons_auth_delete" ON lessons FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "subtopics_auth_insert" ON subtopics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "subtopics_auth_update" ON subtopics FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "subtopics_auth_delete" ON subtopics FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "cohort_lessons_auth_insert" ON cohort_lessons FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cohort_lessons_auth_update" ON cohort_lessons FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "cohort_lessons_auth_delete" ON cohort_lessons FOR DELETE USING (auth.uid() IS NOT NULL);

-- Admin can read all enrollments (users see their own via existing policy)
CREATE POLICY "enrollments_admin_read" ON enrollments FOR SELECT USING (auth.uid() IS NOT NULL);
-- Admin can manage enrollments for any user via edge function (service role bypasses RLS)
