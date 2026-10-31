"use client";

import type { SeasonEvent } from "@/data/events";
import { getEventEndDateTime, getEventStartDateTime } from "./datetime";
import { REGISTRATION_CLOSED_NOTE } from "./notices";

/**
 * إعدادات ربط التسجيل الفعلي:
 * - ضعي هنا رابط نشر Google Apps Script (Web App) بعد نشره ليحفظ التأكيد في Google Sheet.
 * - الإبقاء على القيمة فارغة يعني «وضع المعاينة»: التأكيد يُحاكى محليًا بلا أي حفظ خارجي،
 *   مع إظهار تنبيه واضح داخل النافذة أن الحفظ الفعلي غير مفعّل بعد.
 * - مهم جدًا: لا تُدفع قيمة تجريبية إلى Git. القيم المسموح بها هنا: رابط النشر الرسمي أو الفراغ.
 */
export const MIRAS_REGISTRATION_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwYSYx9HEMNmNS0dpHJFeLUtdBXcUPMs3xZBq26Sws5W5kRvQ2e9h52ljbQPoxu-2jc_g/exec";

/** يُغلق التأكيد قبل نهاية البرنامج بـ15 دقيقة (توقيت الرياض — اعتمدتها المشرفة). */
export const REGISTRATION_CLOSE_BEFORE_END_MS = 15 * 60 * 1000;

export function getRegistrationCloseTime(event: SeasonEvent): number {
  return getEventEndDateTime(event) - REGISTRATION_CLOSE_BEFORE_END_MS;
}

export function isRegistrationOpen(event: SeasonEvent, now: number): boolean {
  return now < getRegistrationCloseTime(event);
}

/** تطبيع رقم الجوال السعودي إلى الصيغة 9665XXXXXXXX — مطابق تمامًا لقواعد الخادم في الرمز.js. */
export function normalizeSaudiPhone(raw: string): string | null {
  const digits = raw.replace(/\D+/g, "");
  if (/^05\d{8}$/.test(digits)) return "966" + digits.slice(1);
  if (/^5\d{8}$/.test(digits)) return "966" + digits;
  if (/^009665\d{8}$/.test(digits)) return digits.slice(2);
  if (/^9665\d{8}$/.test(digits)) return digits;
  return null;
}

export type AttendanceMode = "حضوري" | "عن بُعد";

export type AttendanceResult =
  | { kind: "ok"; message: string }
  | { kind: "updated"; message: string }
  | { kind: "duplicate"; message: string }
  | { kind: "closed"; message: string }
  | { kind: "invalid"; message: string }
  | { kind: "server"; message: string }
  | { kind: "network" };

export interface AttendancePayload {
  /** المعرف الداخلي الثابت للبرنامج من data/events.ts — يُرسل مخفيًا ولا يُدخل يدويًا. */
  programId: string;
  programName: string;
  fullName: string;
  phone: string;
  /** بريد إلكتروني مطلوب — يتحقق منه الخادم مجددًا بغض النظر عن تحقق الواجهة. */
  email: string;
  /** اسم الشركة أو الجهة — مطلوب. */
  organization: string;
  mode?: AttendanceMode;
}

const SERVER_MESSAGES: Record<string, string> = {
  success: "تم تأكيد حضوركِ بنجاح، نسعد بمشاركتكِ!",
  updated: "تم تحديث طريقة حضوركِ على نفس السجل بنجاح.",
  duplicate: "حضوركِ مؤكد مسبقًا، ونسعد بلقائكِ في البرنامج!",
  // توحيد الألفاظ مع التسمية المعتمدة «التسجيل» — يُستخدم فقط إن لم تُرسل الخادم رسالة
  closed: REGISTRATION_CLOSED_NOTE,
};

/** وسم إلزامي على كل رسالة نجاح في وضع المعاينة: يمنع ظهور «تم» دون حفظ فعلي في Google. */
const PREVIEW_NOTICE = " — وضع المعاينة: لم يُحفظ في Google بعد.";

/**
 * ذاكرة جلسة محلية لوضع المعاينة فقط: تُمسح عند إعادة تحميل الصفحة،
 * ولا تُخزن أي بيانات دائمًا (بلا localStorage) — ليست تحققًا من الهوية.
 */
const previewRecords = new Map<string, AttendanceMode>();

/** إرسال التأكيد: في وضع المعاينة يُحاكى محليًا؛ وفي الوضع الفعلي POST بجسم نصي بلا ترويسات مخصصة (يمنع طلب Preflight CORS). */
export async function submitAttendance(payload: AttendancePayload): Promise<AttendanceResult> {
  if (!MIRAS_REGISTRATION_ENDPOINT) {
    // ===== وضع المعاينة (لا شبكة ولا حفظ فعلي) =====
    await new Promise((r) => setTimeout(r, 900));
    const key = `${payload.programId}|${normalizeSaudiPhone(payload.phone) || payload.phone}`;
    const previous = previewRecords.get(key);
    if (previous && previous === payload.mode) {
      rememberSessionConfirmation(payload);
      return { kind: "duplicate", message: SERVER_MESSAGES.duplicate + PREVIEW_NOTICE };
    }
    if (previous && previous !== payload.mode) {
      previewRecords.set(key, payload.mode as AttendanceMode);
      rememberSessionConfirmation(payload);
      return { kind: "updated", message: SERVER_MESSAGES.updated + PREVIEW_NOTICE };
    }
    previewRecords.set(key, payload.mode as AttendanceMode);
    rememberSessionConfirmation(payload);
    return { kind: "ok", message: SERVER_MESSAGES.success + PREVIEW_NOTICE };
  }

  // ===== الوضع الفعلي (Google Apps Script) =====
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(MIRAS_REGISTRATION_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      return { kind: "server", message: "تعذر إكمال التسجيل، حاولي لاحقًا." };
    }
    const data = (await res.json()) as { status?: string; message?: string };
    switch (data.status) {
      case "success":
        rememberSessionConfirmation(payload);
        return { kind: "ok", message: data.message || SERVER_MESSAGES.success };
      case "updated":
        rememberSessionConfirmation(payload);
        return { kind: "updated", message: data.message || SERVER_MESSAGES.updated };
      case "duplicate":
        // المسجلة أصلاً: تُعتبر مؤكدة لغرض فتح الدخول عبر Zoom خلال الجلسة نفسها.
        rememberSessionConfirmation(payload);
        return { kind: "duplicate", message: data.message || SERVER_MESSAGES.duplicate };
      case "closed":
        return { kind: "closed", message: data.message || SERVER_MESSAGES.closed };
      case "invalid_program":
      case "invalid_name":
      case "invalid_phone":
      case "invalid_email":
      case "invalid_organization":
      case "invalid_mode":
        return { kind: "invalid", message: data.message || "البيانات المدخلة غير مقبولة." };
      default:
        return { kind: "server", message: data.message || "تعذر إكمال التسجيل، حاولي لاحقًا." };
    }
  } catch {
    clearTimeout(timer);
    return { kind: "network" };
  }
}

// ====================== نافذة الدخول عبر Zoom ======================

/** تُفتح نافذة الدخول عبر Zoom قبل بداية البرنامج بساعة (اعتمدتها المشرفة). */
export const ZOOM_WINDOW_BEFORE_START_MS = 60 * 60 * 1000;

/** وتستمر حتى ساعة بعد نهايته، بعدها يغلق الدخول وتظهر حالة «منفذ». */
export const ZOOM_WINDOW_AFTER_END_MS = 60 * 60 * 1000;

/** حدود نافذة Zoom بتوقيت الرياض المشتق من بيانات البرنامج نفسه (لا من ساعة جهاز الزائرة). */
export function getZoomWindowBounds(event: SeasonEvent): { start: number; end: number } {
  return {
    start: getEventStartDateTime(event) - ZOOM_WINDOW_BEFORE_START_MS,
    end: getEventEndDateTime(event) + ZOOM_WINDOW_AFTER_END_MS,
  };
}

export type ZoomPhase = "before_window" | "open" | "ended";

/** قبل (بداية−1س) = before_window، داخل [بداية−1س .. نهاية+1س] = open، بعدها = ended («منفذ»). */
export function getZoomPhase(event: SeasonEvent, now: number): ZoomPhase {
  const w = getZoomWindowBounds(event);
  if (now < w.start) return "before_window";
  if (now > w.end) return "ended";
  return "open";
}

// ====================== ذاكرة جلسة للتأكيد الناجح (بلا localStorage) ======================

/**
 * تُمسح عند إعادة تحميل الصفحة ولا تُخزن أي بيانات على الجهاز. الغرض الوحيد:
 * فتح الدخول عبر Zoom مباشرة لمن أكدت حضورها في الجلسة نفسها (قرار المشرفة رقم 6)
 * مع أن فتح Zoom لا يُعد دليلًا على الحضور الفعلي — لا يُسجل شيء عند الفتح.
 */
const sessionConfirmations = new Map<string, AttendanceMode | "">();

function sessionKey(programId: string, normalizedPhone: string): string {
  return `${programId}|${normalizedPhone}`;
}

/** تسجيل تأكيد ناجح في ذاكرة الجلسة (تُستدعى من submitAttendance فقط). */
function rememberSessionConfirmation(payload: AttendancePayload): void {
  const phone = normalizeSaudiPhone(payload.phone) || payload.phone.replace(/\D+/g, "");
  sessionConfirmations.set(sessionKey(payload.programId, phone), payload.mode ?? "");
}

/** فحص ذاكرة الجلسة: هل هذا الرقم أكد حضوره لهذا البرنامج في الجلسة الحالية؟ */
export function hasStoredConfirmation(programId: string, phoneRaw: string): boolean {
  const phone = normalizeSaudiPhone(phoneRaw);
  if (!phone) return false;
  const key = sessionKey(programId, phone);
  return sessionConfirmations.has(key) || previewRecords.has(key);
}

export type AttendanceCheckResult =
  | { kind: "confirmed"; message: string; mode?: AttendanceMode }
  | { kind: "not_found"; message: string }
  | { kind: "invalid"; message: string }
  | { kind: "server"; message: string }
  | { kind: "network" };

/**
 * استعلام التحقق لزر الدخول عبر Zoom: رقم الجوال + البرنامج فقط.
 * وضع المعاينة: يقرأ ذاكرة الجلسة محليًا بلا شبكة. الوضع الفعلي: POST action=check
 * إلى الخادم (يرد بالحد الأدنى: مؤكدة/غير موجودة + طريقة الحضور، بلا أسماء).
 */
/** توحيد ما يرد من الخادم إلى قيم الواجهة المعتمدة: السجلات القديمة تخزّن «حضوري في القاعة» (توافق كامل مع v4). */
export function toUiMode_(raw: unknown): AttendanceMode | undefined {
  const v = String(raw || "").trim();
  if (!v) return undefined;
  if (v.includes("حضوري")) return "حضوري";
  if (v.includes("عن بُعد")) return "عن بُعد";
  return undefined;
}

export async function checkAttendanceStatus(
  programId: string,
  phoneRaw: string,
): Promise<AttendanceCheckResult> {
  const phone = normalizeSaudiPhone(phoneRaw);
  if (!phone) {
    return { kind: "invalid", message: "رقم الجوال غير صحيح — أدخلي رقمًا سعوديًا مثل 05XXXXXXXX." };
  }
  const key = sessionKey(programId, phone);
  const local = sessionConfirmations.has(key)
    ? sessionConfirmations.get(key)
    : previewRecords.get(key);

  if (!MIRAS_REGISTRATION_ENDPOINT) {
    if (local) {
      return { kind: "confirmed", message: "تأكيدكِ مسجل في هذه الجلسة (وضع المعاينة).", mode: local || undefined };
    }
    return {
      kind: "not_found",
      message: "وضع المعاينة: التحقق متاح ضمن الجلسة نفسها فقط، ولن يُسأل الخادم حتى اكتمال الربط.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(MIRAS_REGISTRATION_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ action: "check", programId, phone: phoneRaw }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      return { kind: "server", message: "تعذر التحقق الآن، حاولي لاحقًا." };
    }
    // الخادم يخزّن ويردّ بالاسم المعتمد «حضوري في القاعة» للسجلات القديمة — تُوحَّد للواجهة لتطابق قيم الإرسال الجديدة.
    const data = (await res.json()) as { status?: string; message?: string; mode?: string };
    switch (data.status) {
      case "confirmed":
        return { kind: "confirmed", message: "حضوركِ مؤكد جاهز — يمكنك الدخول.", mode: toUiMode_(data.mode) };
      case "not_found":
        return { kind: "not_found", message: data.message || "لم نجد تأكيد حضور له هذا البرنامج بهذا الرقم." };
      case "invalid_program":
      case "invalid_phone":
        return { kind: "invalid", message: data.message || "بيانات التحقق غير مقبولة." };
      default:
        return { kind: "server", message: data.message || "تعذر التحقق الآن، حاولي لاحقًا." };
    }
  } catch {
    clearTimeout(timer);
    return { kind: "network" };
  }
}
