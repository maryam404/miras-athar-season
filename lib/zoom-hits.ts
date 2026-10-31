import { MIRAS_REGISTRATION_ENDPOINT } from "./attendance";

let cachedSessionId: string | null = null;

function freshSessionId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

/**
 * معرف جلسة مجهول لكل زائرة: قيمة عشوائية تنشأ مرة واحدة في متصفحها وتُحفظ
 * محليًا فقط، ولا علاقة لها بأي معلومة هوية — تُستخدم حصرًا لتقدير عدد الجلسات
 * الفريدة في ضغطات Zoom، وتُخزَّن في الخادم كبصمة SHA-256 لا القيمة نفسها.
 */
function zoomSessionId(): string {
  if (cachedSessionId) return cachedSessionId;
  try {
    const stored = window.localStorage.getItem("MIRAS_ZOOM_SID");
    if (stored && /^[A-Fa-f0-9-]{8,64}$/.test(stored)) {
      cachedSessionId = stored;
      return stored;
    }
    const fresh = freshSessionId();
    cachedSessionId = fresh;
    try {
      window.localStorage.setItem("MIRAS_ZOOM_SID", fresh);
    } catch {
      // تخزين محلي محجوب → نفس الجلسة تبقى الشاشة دون حفظ، والقياس يقدّر بلاها
    }
    return fresh;
  } catch {
    cachedSessionId = freshSessionId();
    return cachedSessionId;
  }
}

/**
 * تسجيل ضغطة زر Zoom (fire-and-forget): حدث مجهول قصير إلى وحدة الإحصائيات
 * في Google Apps Script — بلا أرقام، بلا أسماء، بلا بريد. لا يغيّر واجهة
 * المستخدم ولا يظهر أي مؤشر، وتُبتلع أخطاء الشبكة صامتةً دائمًا.
 *
 * kind: "press" = أي ضغط على زر Zoom (قبل النافذة/أثناءها/بعد وقوع الحدث)؛
 *       "open"  = الضغط الفعلي على رابط القاعة بعد نجاح التحقق.
 */
export function sendZoomHit(programId: string | number, kind: "press" | "open" = "press"): void {
  const endpoint = MIRAS_REGISTRATION_ENDPOINT;
  if (!endpoint) {
    // وضع المعاينة (نهاية فارغة): لا شبكة إطلاقًا — تطابق سلوك التسجيل المعايني
    return;
  }
  try {
    fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        action: "zoom_hit",
        programId: String(programId),
        session: zoomSessionId(),
        kind: kind === "open" ? "open" : "press",
      }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // إطلاق صامت — لا أثر على واجهة المستخدم مهما حدث
  }
}
