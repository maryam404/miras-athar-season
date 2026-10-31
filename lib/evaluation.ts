import type { SeasonEvent } from "@/data/events";
import { getEventEndDateTime } from "./datetime";

/**
 * نافذة التقييم لكل البرامج (قرار المشرفة 2026-10-31 — توقيت الرياض):
 * تفتح قبل نهاية البرنامج بـ15 دقيقة، وتنتهي بعد نهاية البرنامج بـ60 دقيقة.
 * الحساب مشتق من وقت نهاية كل برنامج الفعلي في data/events.ts (لا من ساعة جهاز الزائرة).
 */

/** يفتح التقييم قبل نهاية البرنامج بـ15 دقيقة (نفس لحظة إغلاق التسجيل اعتمادًا). */
export const EVALUATION_OPEN_BEFORE_END_MS = 15 * 60 * 1000;

/** وتُغلق نافذة التقييم بعد نهاية البرنامج بـ60 دقيقة بالضبط. */
export const EVALUATION_CLOSE_AFTER_END_MS = 60 * 60 * 1000;

export function getEvaluationWindowBounds(event: SeasonEvent): { start: number; end: number } {
  const end = getEventEndDateTime(event);
  return {
    start: end - EVALUATION_OPEN_BEFORE_END_MS,
    end: end + EVALUATION_CLOSE_AFTER_END_MS,
  };
}

export type EvaluationPhase = "before_window" | "open" | "ended";

/**
 * الحالة الزمنية لنافذة التقييم — قبل (نهاية−15د) = قبل_النافذة،
 * داخل [نهاية−15د .. نهاية+60د] = مفتوحة، بعدها = انتهت.
 * لا تعتمد على وجود الرابط (غياب الرابط يعالجه التوقيع بنافذة «التقييم غير متاح حاليًا» في أي وقت).
 */
export function getEvaluationPhase(event: SeasonEvent, now: number): EvaluationPhase {
  const w = getEvaluationWindowBounds(event);
  if (now < w.start) return "before_window";
  if (now > w.end) return "ended";
  return "open";
}
