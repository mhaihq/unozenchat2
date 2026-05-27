import { supabase, EDGE_FUNCTION_URL } from "./supabase";
import type { Document, Message, Course, Cohort, Lesson, Subtopic, Enrollment, Progress } from "./types";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createSession(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: user?.id })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function sendMessage(
  message: string,
  sessionId: string,
  history: Message[]
): Promise<{ message: string; sourcesFound: number }> {
  const response = await fetch(`${EDGE_FUNCTION_URL}/chat`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      message,
      sessionId,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Request failed");
  }

  return response.json();
}

export async function uploadDocument(
  name: string,
  type: string,
  size: number,
  content: string
): Promise<Document> {
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({ name, type, size })
    .select("id, name, type, size, created_at")
    .single();

  if (docError) throw new Error(docError.message);

  const response = await fetch(`${EDGE_FUNCTION_URL}/ingest`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ documentId: doc.id, content }),
  });

  if (!response.ok) {
    await supabase.from("documents").delete().eq("id", doc.id);
    const err = await response.json().catch(() => ({ error: "Processing failed" }));
    throw new Error(err.error ?? "Processing failed");
  }

  return {
    id: doc.id,
    name: doc.name,
    type: doc.type,
    size: doc.size,
    createdAt: new Date(doc.created_at),
  };
}

export async function fetchDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("id, name, type, size, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    size: d.size,
    createdAt: new Date(d.created_at),
  }));
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  // Hash the password client-side using SubtleCrypto and compare to stored hash
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const { data: setting, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "admin_password_hash")
    .maybeSingle();

  if (error || !setting) return false;
  return setting.value === hashHex;
}

export async function isEmailAllowed(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("allowed_emails")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) return false;
  return data !== null;
}

export async function fetchAllowedEmails(): Promise<{ id: string; email: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from("allowed_emails")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addAllowedEmail(email: string): Promise<void> {
  const { error } = await supabase
    .from("allowed_emails")
    .insert({ email: email.toLowerCase().trim() });
  if (error) throw new Error(error.message);
}

export async function removeAllowedEmail(id: string): Promise<void> {
  const { error } = await supabase.from("allowed_emails").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  const encoder = new TextEncoder();
  const data = encoder.encode(newPassword);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const { error } = await supabase
    .from("app_settings")
    .update({ value: hashHex })
    .eq("key", "admin_password_hash");

  if (error) throw new Error(error.message);
}

// ─── LMS ──────────────────────────────────────────────────────────────────────

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("id, slug, title, description, type, is_active")
    .eq("is_active", true)
    .order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchCohorts(courseId: string): Promise<Cohort[]> {
  const { data, error } = await supabase
    .from("cohorts")
    .select("id, course_id, name, starts_at, ends_at, is_active")
    .eq("course_id", courseId)
    .eq("is_active", true)
    .order("starts_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Fetch all lessons + subtopics for a course, optionally merging cohort-specific
// video overrides when cohortId is provided.
export async function fetchLessons(courseId: string, cohortId?: string): Promise<Lesson[]> {
  const { data: lessonsRaw, error: le } = await supabase
    .from("lessons")
    .select("id, course_id, number, title, focus, default_video_id, default_presentation_url, sort_order")
    .eq("course_id", courseId)
    .order("sort_order");
  if (le) throw new Error(le.message);

  const { data: subtopicsRaw, error: se } = await supabase
    .from("subtopics")
    .select("id, lesson_id, title, bullets, suggested_questions, sort_order")
    .in("lesson_id", (lessonsRaw ?? []).map((l) => l.id))
    .order("sort_order");
  if (se) throw new Error(se.message);

  // Fetch cohort overrides if applicable
  let overrides: Record<string, { video_id: string | null; presentation_url: string | null; document_id: string | null }> = {};
  if (cohortId) {
    const { data: cl } = await supabase
      .from("cohort_lessons")
      .select("lesson_id, video_id, presentation_url, document_id")
      .eq("cohort_id", cohortId);
    for (const row of cl ?? []) {
      overrides[row.lesson_id] = { video_id: row.video_id, presentation_url: row.presentation_url, document_id: row.document_id };
    }
  }

  const subtopicsByLesson: Record<string, Subtopic[]> = {};
  for (const s of subtopicsRaw ?? []) {
    if (!subtopicsByLesson[s.lesson_id]) subtopicsByLesson[s.lesson_id] = [];
    subtopicsByLesson[s.lesson_id].push(s as Subtopic);
  }

  return (lessonsRaw ?? []).map((l) => {
    const override = overrides[l.id];
    return {
      ...l,
      subtopics: subtopicsByLesson[l.id] ?? [],
      video_id: override?.video_id ?? l.default_video_id,
      presentation_url: override?.presentation_url ?? l.default_presentation_url,
      cohort_document_id: override?.document_id ?? null,
    } as Lesson;
  });
}

// Returns the active enrollment for the current user (if any).
export async function fetchMyEnrollment(): Promise<Enrollment | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("enrollments")
    .select("id, user_id, cohort_id, enrolled_at, cohort:cohorts(id, course_id, name, starts_at, ends_at, is_active, course:courses(id, slug, title, description, type, is_active))")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Enrollment | null;
}

export async function fetchProgress(userId: string): Promise<Progress[]> {
  const { data, error } = await supabase
    .from("progress")
    .select("subtopic_id, completed_at")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function markSubtopicComplete(subtopicId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("progress")
    .upsert({ user_id: user.id, subtopic_id: subtopicId }, { onConflict: "user_id,subtopic_id" });
  if (error) throw new Error(error.message);
}

export async function unmarkSubtopicComplete(subtopicId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("progress")
    .delete()
    .eq("user_id", user.id)
    .eq("subtopic_id", subtopicId);
  if (error) throw new Error(error.message);
}

// Admin: enroll a user in a cohort by email
export async function enrollUserByEmail(email: string, cohortId: string): Promise<void> {
  // Look up the user id via allowed_emails (they must already have an account)
  const { data: authData, error: authErr } = await supabase
    .from("allowed_emails")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (authErr || !authData) throw new Error("Email not found in allowed list");

  // Use service-role via edge function for cross-table user lookup — for now insert
  // enrollment directly; admin must have RLS bypass (service role) in production.
  const { error } = await supabase
    .from("enrollments")
    .insert({ cohort_id: cohortId });
  if (error) throw new Error(error.message);
}

// Admin: create a cohort
export async function createCohort(courseId: string, name: string, startsAt?: string, endsAt?: string): Promise<Cohort> {
  const { data, error } = await supabase
    .from("cohorts")
    .insert({ course_id: courseId, name, starts_at: startsAt ?? null, ends_at: endsAt ?? null })
    .select("id, course_id, name, starts_at, ends_at, is_active")
    .single();
  if (error) throw new Error(error.message);
  return data as Cohort;
}

// Admin: set/update the live recording for a cohort lesson
export async function setCohortLessonVideo(cohortId: string, lessonId: string, videoId: string): Promise<void> {
  const { error } = await supabase
    .from("cohort_lessons")
    .upsert({ cohort_id: cohortId, lesson_id: lessonId, video_id: videoId }, { onConflict: "cohort_id,lesson_id" });
  if (error) throw new Error(error.message);
}

// ─── Admin LMS CRUD ────────────────────────────────────────────────────────────

export async function fetchAllCoursesAdmin(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("id, slug, title, description, type, is_active")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminCreateCourse(payload: {
  slug: string; title: string; description?: string; type: "live" | "recorded"; is_active?: boolean;
}): Promise<Course> {
  const { data, error } = await supabase
    .from("courses")
    .insert({ ...payload, is_active: payload.is_active ?? true })
    .select("id, slug, title, description, type, is_active")
    .single();
  if (error) throw new Error(error.message);
  return data as Course;
}

export async function adminUpdateCourse(id: string, patch: Partial<Omit<Course, "id">>): Promise<void> {
  const { error } = await supabase.from("courses").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adminDeleteCourse(id: string): Promise<void> {
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function fetchAllCohortsAdmin(courseId: string): Promise<Cohort[]> {
  const { data, error } = await supabase
    .from("cohorts")
    .select("id, course_id, name, starts_at, ends_at, is_active")
    .eq("course_id", courseId)
    .order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpdateCohort(id: string, patch: Partial<Omit<Cohort, "id" | "course_id">>): Promise<void> {
  const { error } = await supabase.from("cohorts").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adminDeleteCohort(id: string): Promise<void> {
  const { error } = await supabase.from("cohorts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function fetchAllLessonsAdmin(courseId: string): Promise<Lesson[]> {
  const { data: lessonsRaw, error: le } = await supabase
    .from("lessons")
    .select("id, course_id, number, title, focus, default_video_id, default_presentation_url, sort_order")
    .eq("course_id", courseId)
    .order("sort_order");
  if (le) throw new Error(le.message);

  const { data: subtopicsRaw, error: se } = await supabase
    .from("subtopics")
    .select("id, lesson_id, title, bullets, suggested_questions, sort_order")
    .in("lesson_id", (lessonsRaw ?? []).map((l) => l.id))
    .order("sort_order");
  if (se) throw new Error(se.message);

  const subtopicsByLesson: Record<string, Subtopic[]> = {};
  for (const s of subtopicsRaw ?? []) {
    if (!subtopicsByLesson[s.lesson_id]) subtopicsByLesson[s.lesson_id] = [];
    subtopicsByLesson[s.lesson_id].push(s as Subtopic);
  }

  return (lessonsRaw ?? []).map((l) => ({
    ...l,
    subtopics: subtopicsByLesson[l.id] ?? [],
  } as Lesson));
}

export async function adminCreateLesson(payload: {
  course_id: string; number: number; title: string; focus?: string;
  default_video_id?: string; default_presentation_url?: string; sort_order?: number;
}): Promise<Lesson> {
  const { data, error } = await supabase
    .from("lessons")
    .insert({ ...payload, sort_order: payload.sort_order ?? payload.number })
    .select("id, course_id, number, title, focus, default_video_id, default_presentation_url, sort_order")
    .single();
  if (error) throw new Error(error.message);
  return { ...data, subtopics: [] } as Lesson;
}

export async function adminUpdateLesson(id: string, patch: Partial<Omit<Lesson, "id" | "course_id" | "subtopics">>): Promise<void> {
  const { error } = await supabase.from("lessons").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adminDeleteLesson(id: string): Promise<void> {
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adminCreateSubtopic(payload: {
  lesson_id: string; title: string; bullets?: string[]; suggested_questions?: string[]; sort_order?: number;
}): Promise<Subtopic> {
  const { data, error } = await supabase
    .from("subtopics")
    .insert({ bullets: [], suggested_questions: [], ...payload })
    .select("id, lesson_id, title, bullets, suggested_questions, sort_order")
    .single();
  if (error) throw new Error(error.message);
  return data as Subtopic;
}

export async function adminUpdateSubtopic(id: string, patch: Partial<Omit<Subtopic, "id" | "lesson_id">>): Promise<void> {
  const { error } = await supabase.from("subtopics").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adminDeleteSubtopic(id: string): Promise<void> {
  const { error } = await supabase.from("subtopics").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adminSetCohortLessonOverride(
  cohortId: string,
  lessonId: string,
  overrides: { video_id?: string | null; presentation_url?: string | null }
): Promise<void> {
  const { error } = await supabase
    .from("cohort_lessons")
    .upsert({ cohort_id: cohortId, lesson_id: lessonId, ...overrides }, { onConflict: "cohort_id,lesson_id" });
  if (error) throw new Error(error.message);
}

export interface AdminEnrollment {
  id: string;
  user_id: string;
  email: string;
  enrolled_at: string;
}

async function callAdminOps(action: string, adminPassword: string, params: Record<string, unknown>): Promise<unknown> {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const url = `${SUPABASE_URL}/functions/v1/admin-ops`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ action, adminPassword, ...params }),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error ?? "Admin op failed");
  return json.data;
}

export async function adminListEnrollments(cohortId: string, adminPassword: string): Promise<AdminEnrollment[]> {
  return callAdminOps("list_enrollments", adminPassword, { cohortId }) as Promise<AdminEnrollment[]>;
}

export async function adminEnrollUserByEmail(cohortId: string, email: string, adminPassword: string): Promise<void> {
  await callAdminOps("enroll_user", adminPassword, { cohortId, email });
}

export async function adminRemoveEnrollment(enrollmentId: string, adminPassword: string): Promise<void> {
  await callAdminOps("remove_enrollment", adminPassword, { enrollmentId });
}
