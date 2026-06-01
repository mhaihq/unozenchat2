import { useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

// Tracks dwell time per lesson. When a lesson's minimum time is met,
// logs ecm_activity_log(event_type='lesson_fruita') and marks fruition_complete
// on ecm_participation once all lessons are fruited.
//
// Minimum time per lesson = lesson.duration_minutes ?? DEFAULT_MINUTES.
// This satisfies AGENAS C2: test unlockable only after content consumed.

const DEFAULT_MINUTES = 15; // fallback if lesson has no duration set
const TICK_MS = 10_000;     // check every 10 s

interface Lesson {
  id: string;
  duration_minutes?: number | null;
}

interface Options {
  activeLessonId: string | null;
  cohortId: string | null | undefined;
  lessons: Lesson[];
  onAllFruited: () => void;
}

export function useFruitionTracker({ activeLessonId, cohortId, lessons, onAllFruited }: Options) {
  const dwellRef = useRef<Record<string, number>>({});   // lessonId → seconds spent
  const fruitedRef = useRef<Set<string>>(new Set());     // lessonIds already logged
  const allFruitedFired = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onAllFruitedRef = useRef(onAllFruited);
  onAllFruitedRef.current = onAllFruited;

  // Load already-fruited lessons from activity log on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("ecm_activity_log")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("event_type", "lesson_fruita");
      if (data) {
        data.forEach((row: { lesson_id: string | null }) => {
          if (row.lesson_id) fruitedRef.current.add(row.lesson_id);
        });
      }
      checkAllFruited(lessons);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick: increment dwell for active lesson, check threshold
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!activeLessonId) return;

    intervalRef.current = setInterval(async () => {
      if (!activeLessonId) return;
      dwellRef.current[activeLessonId] = (dwellRef.current[activeLessonId] ?? 0) + TICK_MS / 1000;

      const lesson = lessons.find((l) => l.id === activeLessonId);
      const threshold = (lesson?.duration_minutes ?? DEFAULT_MINUTES) * 60;

      if (!fruitedRef.current.has(activeLessonId) && dwellRef.current[activeLessonId] >= threshold) {
        fruitedRef.current.add(activeLessonId);
        await logFruita(activeLessonId, cohortId ?? null);
        checkAllFruited(lessons);
      }
    }, TICK_MS);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLessonId, cohortId, lessons.length]);

  async function logFruita(lessonId: string, cohortId: string | null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("ecm_activity_log").insert({
      user_id: user.id,
      cohort_id: cohortId,
      lesson_id: lessonId,
      event_type: "lesson_fruita",
      detail: { seconds: dwellRef.current[lessonId] },
    });
  }

  function checkAllFruited(ls: Lesson[]) {
    if (allFruitedFired.current) return;
    const allDone = ls.every((l) => fruitedRef.current.has(l.id));
    if (!allDone) return;
    allFruitedFired.current = true;
    markFruitionComplete();
    onAllFruitedRef.current();
  }

  async function markFruitionComplete() {
    if (!cohortId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("ecm_participation").upsert({
      user_id: user.id,
      cohort_id: cohortId,
      fruition_complete: true,
    }, { onConflict: "user_id,cohort_id" });
  }

  const isFruited = useCallback((lessonId: string) => fruitedRef.current.has(lessonId), []);

  return { isFruited, dwellRef };
}
