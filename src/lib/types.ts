export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: Date;
}

export type UploadStatus = "idle" | "reading" | "processing" | "done" | "error";

export type AppView = "home" | "course-page-ondemand" | "course-page-live" | "course-page-ai-literacy" | "dashboard" | "course" | "admin" | "auth";

// ─── LMS types ────────────────────────────────────────────────────────────────

export type CourseType = "live" | "recorded";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: CourseType;
  is_active: boolean;
}

export interface Cohort {
  id: string;
  course_id: string;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

export interface Lesson {
  id: string;
  course_id: string;
  number: number;
  title: string;
  focus: string | null;
  default_video_id: string | null;
  default_video_hash: string | null;
  default_presentation_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
  subtopics: Subtopic[];
  // resolved from cohort_lessons when enrolled in a live cohort
  video_id?: string | null;
  presentation_url?: string | null;
  cohort_document_id?: string | null;
}

export interface Subtopic {
  id: string;
  lesson_id: string;
  title: string;
  bullets: string[];
  suggested_questions: string[];
  sort_order: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  cohort_id: string;
  enrolled_at: string;
  cohort: Cohort & { course: Course };
}

export interface Progress {
  subtopic_id: string;
  completed_at: string;
}
