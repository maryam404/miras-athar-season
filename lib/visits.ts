"use client";

import { MIRAS_REGISTRATION_ENDPOINT } from "./attendance";

/**
 * قياس زيارات الموقع — طرف أول مجهول تمامًا (اعتماد المشرفة 2026-11-01):
 * - بلا أي خدمة خارجية ولا حساب جديد: الإرسال إلى نفس وحدة Google Apps Script القائمة.
 * - بلا كوكيز ولا بصمة جهاز ولا أي تتبع خفي: معرّفون عشوائيان من الطرف الأول يُحفظان
 *   في localStorage هذا المتصفح فقط (visiorId دائم + sessionId للجلسة القائمة).
 * - بلا أي بيانات شخصية: لا اسم ولا جوال ولا بريد ولا محتوى نماذج — يُرسل معرّفان عشوائيان فقط.
 * - قاعدة الجلسة: جلسة جديدة بعد 30 دقيقة من عدم النشاط (SESSION_IDLE_MS).
 *   تحديث الصفحة داخل الجلسة نفسها = مشاهدة صفحة إضافية وليس زيارة جديدة.
 * - الزائر الفريد «تقديري حسب المتصفح والجهاز» وليس شخصًا مؤكدًا، لأن المعرّف
 *   يُحفظ محليًا وقد يمسحه المستخدم أو يتغيّر بين متصفح/جهاز.
 * - إطفاء تام في وضع التطوير وداخل نافذة المعاينة (iframe) لتجنب عدّ بيانات غير حقيقية.
 * - إخفاقات الشبكة تُبتلع بصمت دائمًا (fire-and-forget) — لا أثر على الواجهة مهما حدث.
 */

/** معرّف الزائر: عشوائي يحفظ في هذا المتصفح ويبقى دائمًا (يُقدَّر به الزائر الفريد). */
const VISITOR_ID_KEY = "MIRAS_VISITOR_ID";

/** معرّف الجلسة القائمة: يتجدد بعد 30 دقيقة من عدم النشاط (قاعدة الجلسة المعتمدة). */
const SESSION_ID_KEY = "MIRAS_SESSION_ID";

/** آخر نشاط للجلسة (مللي ثانية) — لحساب انقضاء 30 دقيقة. */
const SESSION_LAST_ACTIVE_KEY = "MIRAS_SESSION_LAST_AT";

/** امتصاص التكرار الكاذب من إعادة تصيير/تركيب React: لا إرسالان مفصولان بواقع 5 ثوانٍ صدفة واحدة. */
export const VIEW_DEDUPE_MS = 5_000;

/** مدة الجلسة المعتمدة: 30 دقيقة من عدم النشاط تُنهي الجلسة وتفتح جلسة جديدة. */
export const SESSION_IDLE_MS = 30 * 60 * 1000;

/** صيغة المعرّفين المقبولة (نفس حارس الخادم) — ما خالفها يُرفض محليًا. */
const ID_PATTERN = /^[A-Fa-f0-9-]{8,64}$/;

export interface StoredVisitState {
  visitorId: string | null;
  sessionId: string | null;
  lastActive: number | null;
}

export interface VisitDecision {
  visitorId: string;
  sessionId: string;
  /** جلسة جديدة بدورة 30 دقيقة (تعني إمكانية «زيارة متكررة» لنفس المتصفح — يُشتق التكرار عائدًا في الخادم). */
  sessionRenewed: boolean;
  /** أول زيارة لهذا المتصفح إطلاقًا (أُنشئ له معرّف عشوائي الآن). */
  firstEver: boolean;
}

/** مُنشئ معرّف عشوائي: UUID قياسي عند توفره، وإلا بديل عشوائي كافٍ الطول. */
function freshId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}

/** المنطق الصافي لتحديد (الزائر، الجلسة) — دوال نقية قابلة للاختبار بلا متصفح. */
export function resolveVisitState(
  stored: StoredVisitState,
  now: number,
  makeFreshId: () => string = freshId,
): VisitDecision {
  const storedVisitor = stored.visitorId && ID_PATTERN.test(stored.visitorId) ? stored.visitorId : null;
  const firstEver = storedVisitor === null;
  const visitorId = storedVisitor ?? makeFreshId();

  const idleExpired =
    !stored.sessionId || stored.lastActive === null || !Number.isFinite(stored.lastActive)
      ? true
      : now - stored.lastActive > SESSION_IDLE_MS;

  const storedSessionValid = stored.sessionId !== null && ID_PATTERN.test(stored.sessionId);
  const sessionRenewed = !storedSessionValid || idleExpired;
  const sessionId = sessionRenewed ? makeFreshId() : (stored.sessionId as string);

  return { visitorId: visitorId, sessionId: sessionId, sessionRenewed: sessionRenewed, firstEver: firstEver };
}

function readStoredState(): StoredVisitState {
  try {
    const visitorId = window.localStorage.getItem(VISITOR_ID_KEY);
    const sessionId = window.localStorage.getItem(SESSION_ID_KEY);
    const lastRaw = window.localStorage.getItem(SESSION_LAST_ACTIVE_KEY);
    const lastActive = lastRaw === null ? null : Number(lastRaw);
    return {
      visitorId: visitorId,
      sessionId: sessionId,
      lastActive: lastActive !== null && Number.isFinite(lastActive) ? lastActive : null,
    };
  } catch {
    // تخزين محجوب (وضع خاص/إعدادات صارمة) → جلسة عابرة في الذاكرة، والقياس يقدّر بلاها لا يفشل.
    return { visitorId: null, sessionId: null, lastActive: null };
  }
}

function persistState(decision: VisitDecision, now: number): void {
  try {
    window.localStorage.setItem(VISITOR_ID_KEY, decision.visitorId);
    window.localStorage.setItem(SESSION_ID_KEY, decision.sessionId);
    window.localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(now));
  } catch {
    // محجوب → لا شيء يُحفظ؛ تنصف الجلسات عابرة والكل يبقى مجهولًا.
  }
}

/** طابع آخر إرسال فعلي بوحدة الواجهة — يمنع العدّ المكرر من إعادة التصيير الفورية. */
let lastSentAtMs = -Infinity;

/**
 * قياس مشاهدات الصفحة في كل تحميل/دخول للموقع (إحدى المرة تركّب في مستوى الجذر):
 * يحدّد الزائر والجلسة ويُرسل حدثًا مجهولًا واحدًا — بلا أي بيانات هوية إطلاقًا.
 * لا يرمي استثناءات ولا يظهر أي مؤشر في الواجهة.
 */
export function trackPageView(now: number = Date.now()): VisitDecision | null {
  if (typeof window === "undefined") return null;
  if (process.env.NODE_ENV === "development") return null;
  if (window.self !== window.top) return null; // داخل نافذة المعاينة (iframe) → لا قياس
  if (now - lastSentAtMs < VIEW_DEDUPE_MS) {
    // إعادة تصيير/تركيب متلاصقة (StrictMode أو مركّب مزدوج) → تُمتص بلا إرسال ولا إزاحات حالية
    return null;
  }
  const decision = resolveVisitState(readStoredState(), now);
  persistState(decision, now);
  lastSentAtMs = now;
  const endpoint = MIRAS_REGISTRATION_ENDPOINT;
  if (!endpoint) return decision; // وضع المعاينة: بلا شبكة إطلاقًا (تطابق سلوك التسجيل المعايني)
  try {
    fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        action: "visit_hit",
        visitorId: decision.visitorId,
        sessionId: decision.sessionId,
        kind: "view",
      }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // إطلاق صامت دائمًا — لا أثر على واجهة المستخدم مهما حدث
  }
  return decision;
}
