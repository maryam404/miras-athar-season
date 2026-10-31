"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  ClipboardCheck,
  Info,
  Loader2,
  MapPin,
  MonitorSmartphone,
  TriangleAlert,
} from "lucide-react";
import type { SeasonEvent } from "@/data/events";
import { formatEventDuration, formatEventTimeRange } from "@/lib/datetime";
import InstallModal from "./InstallModal";
import {
  MIRAS_REGISTRATION_ENDPOINT,
  isRegistrationOpen,
  normalizeSaudiPhone,
  submitAttendance,
  type AttendanceMode,
  type AttendanceResult,
} from "@/lib/attendance";
import { cn } from "@/lib/cn";
import { REGISTRATION_CLOSED_NOTE } from "@/lib/notices";

type Phase = "form" | "submitting" | "done";

/**
 * نافذة «تأكيد الحضور» — عربية RTL متجاوبة بهوية مراس (تستخدم InstallModal نفسه).
 * - تُرسم عبر Portal إلى مستوى الصفحة لأن بطاقة البرنامج تحمل overflow-hidden وتحوّل hover.
 * - الاسم ورقم الجوال وتحديد الطريقة (للبرامج الحضورية) فقط؛ والمعرّف الداخلي للبرنامج
 *   يُرسل مخفيًا ثابتًا من بيانات الموقع ولا يظهر كحقل قابل للتعديل.
 * - لا تخزين لأي بيانات على الجهاز (بلا localStorage).
 */
export default function AttendanceConfirm({
  event,
  now,
  open,
  onClose,
}: {
  event: SeasonEvent;
  now: number;
  open: boolean;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [mode, setMode] = useState<AttendanceMode | "">("");
  const [phase, setPhase] = useState<Phase>("form");
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [error, setError] = useState("");

  const needsModeChoice = event.execution === "حضوري";
  const attendingOpen = isRegistrationOpen(event, now);

  useEffect(() => {
    if (open) {
      setPhase("form");
      setResult(null);
      setError("");
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phase === "submitting") return; // منع الإرسال المتكرر
    setError("");

    if (!navigator.onLine) {
      setError("لا يوجد اتصال بالإنترنت الآن — تحققي من الشبكة وحاولي مجددًا.");
      return;
    }
    const name = fullName.trim().replace(/\s+/g, " ");
    if (name.length < 2) {
      setError("الرجاء إدخال الاسم الكامل (حرفان على الأقل).");
      return;
    }
    if (name.length > 100) {
      setError("الاسم طويل جدًا.");
      return;
    }
    if (!normalizeSaudiPhone(phone)) {
      setError("رقم الجوال غير صحيح — أدخلي رقمًا سعوديًا مثل 05XXXXXXXX.");
      return;
    }
    const emailValue = email.trim();
    if (!emailValue) {
      setError("الرجاء إدخال البريد الإلكتروني.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue)) {
      setError("صيغة البريد الإلكتروني غير صحيحة — مثل: name@example.com");
      return;
    }
    const org = organization.trim().replace(/\s+/g, " ");
    if (org.length < 2) {
      setError("الرجاء إدخال اسم الشركة أو الجهة.");
      return;
    }
    if (org.length > 120) {
      setError("اسم الشركة أو الجهة طويل جدًا.");
      return;
    }
    if (needsModeChoice && !mode) {
      setError("اختاري طريقة الحضور أولًا: حضوري أو عن بُعد.");
      return;
    }

    setPhase("submitting");
    const outcome = await submitAttendance({
      programId: String(event.id),
      programName: event.title,
      fullName: name,
      phone,
      email: emailValue,
      organization: org,
      mode: needsModeChoice ? (mode as AttendanceMode) : "عن بُعد",
    });

    if (outcome.kind === "network") {
      // نبقي النموذج كما هو مع رسالة واضحة فوق زر التأكيد
      setPhase("form");
      setError("تعذر الاتصال بالخادم — تحققي من الإنترنت وحاولي مجددًا.");
      return;
    }
    if (outcome.kind === "invalid") {
      setPhase("form");
      setError(outcome.message);
      return;
    }
    if (outcome.kind === "server") {
      // خطأ من الخادم: النموذج يبقى معبّأً ويمكن إعادة المحاولة
      setPhase("form");
      setError(outcome.message);
      return;
    }
    setResult(outcome);
    setPhase("done");
  }

  const doneStyle =
    result?.kind === "ok" || result?.kind === "updated"
      ? { box: "border-emerald-200 bg-emerald-50", icon: "bg-emerald-100 text-emerald-700", tone: "text-emerald-800" }
      : result?.kind === "duplicate"
        ? { box: "border-amber-200 bg-amber-50", icon: "bg-amber-100 text-amber-700", tone: "text-amber-800" }
        : { box: "border-stone-200 bg-stone-50", icon: "bg-stone-100 text-stone-500", tone: "text-stone-600" };
  const doneMessage = result && "message" in result ? result.message : "";

  return createPortal(
    <InstallModal open={open} title="تأكيد الحضور" onClose={onClose}>
      {/* بطاقة ملخص البرنامج */}
      <div className="mb-4 rounded-2xl bg-sand-pale/70 p-3">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-brand-deep">
          <span className="rounded-full bg-white px-2.5 py-0.5">{event.type}</span>
          <span className="rounded-full bg-white px-2.5 py-0.5">
            {event.execution === "حضوري" ? "حضوري وعن بُعد" : "عن بُعد"}
          </span>
        </div>
        <p className="mt-2 text-sm font-extrabold leading-7 text-ink">{event.title}</p>
        <p className="text-xs font-semibold text-muted">
          {event.displayGregorianDate} • {formatEventTimeRange(event)} {formatEventDuration(event)}
        </p>
      </div>

      {!attendingOpen ? (
        <>
          {/* الملاحظة المعتمدة عند إغلاق التسجيل (قبل النهاية بـ15 دقيقة) — بلا نموذج */}
          <div className="flex items-start gap-2 rounded-2xl border border-brand/20 bg-brand/[0.05] p-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="text-[13px] font-bold leading-6 text-brand-deep">{REGISTRATION_CLOSED_NOTE}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm font-extrabold text-brand-deep transition-colors hover:bg-sand-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pale"
          >
            إغلاق
          </button>
        </>
      ) : phase !== "done" ? (
        <form onSubmit={handleSubmit} noValidate>
          {/* تنبيه وضع المعاينة */}
          {!MIRAS_REGISTRATION_ENDPOINT && (
            <p className="mb-4 flex items-start gap-2 rounded-2xl border border-brand/20 bg-brand/[0.05] p-3 text-xs font-bold leading-6 text-brand-deep">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              وضع المعاينة: التأكيد يُحاكى محليًا ولن يُحفظ في Google فعليًا حتى اكتمال الربط.
            </p>
          )}

          {/* الاسم */}
          <label className="mb-1.5 block text-xs font-extrabold text-brand-deep">الاسم الكامل</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={phase === "submitting"}
            autoComplete="name"
            maxLength={100}
            placeholder="الاسم الثلاثي"
            className="mb-3 w-full rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm font-semibold text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand-pale disabled:opacity-60"
          />

          {/* الجوال */}
          <label className="mb-1.5 block text-xs font-extrabold text-brand-deep">رقم الجوال السعودي</label>
          <input
            type="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={phase === "submitting"}
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
            placeholder="05XXXXXXXX"
            className="mb-3 w-full rounded-2xl border border-sand bg-white px-4 py-2.5 text-left text-sm font-semibold text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand-pale disabled:opacity-60"
          />

          {/* البريد الإلكتروني */}
          <label className="mb-1.5 block text-xs font-extrabold text-brand-deep">البريد الإلكتروني</label>
          <input
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={phase === "submitting"}
            autoComplete="email"
            inputMode="email"
            maxLength={120}
            placeholder="name@example.com"
            className="mb-3 w-full rounded-2xl border border-sand bg-white px-4 py-2.5 text-left text-sm font-semibold text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand-pale disabled:opacity-60"
          />

          {/* اسم الشركة أو الجهة */}
          <label className="mb-1.5 block text-xs font-extrabold text-brand-deep">اسم الشركة أو الجهة</label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            disabled={phase === "submitting"}
            autoComplete="organization"
            maxLength={120}
            placeholder="اسم الشركة أو الجهة التي تعملين بها"
            className="mb-3 w-full rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm font-semibold text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand-pale disabled:opacity-60"
          />

          {/* طريقة الحضور: مطلوبة للبرامج الحضورية فقط؛ والبرامج عن بُعد تُحفظ تلقائيًا */}
          {needsModeChoice && (
            <fieldset className="mb-1">
              <legend className="mb-1.5 text-xs font-extrabold text-brand-deep">طريقة الحضور</legend>
              <div className="flex flex-wrap gap-2">
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors",
                    mode === "حضوري"
                      ? "border-brand bg-brand/[0.07] text-brand-deep"
                      : "border-sand bg-sand-pale/60 text-ink/75 hover:border-brand/50",
                  )}
                >
                  <input
                    type="radio"
                    name="attendance-mode"
                    value="حضوري"
                    checked={mode === "حضوري"}
                    onChange={() => setMode("حضوري")}
                    disabled={phase === "submitting"}
                    className="shrink-0 accent-brand"
                  />
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                  حضوري
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors",
                    mode === "عن بُعد"
                      ? "border-brand bg-brand/[0.07] text-brand-deep"
                      : "border-sand bg-sand-pale/60 text-ink/75 hover:border-brand/50",
                  )}
                >
                  <input
                    type="radio"
                    name="attendance-mode"
                    value="عن بُعد"
                    checked={mode === "عن بُعد"}
                    onChange={() => setMode("عن بُعد")}
                    disabled={phase === "submitting"}
                    className="shrink-0 accent-brand"
                  />
                  <MonitorSmartphone className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                  عن بُعد
                </label>
              </div>
            </fieldset>
          )}

          {/* رسالة الخطأ/التحقق */}
          {error && (
            <p
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold leading-6 text-red-700"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          {/* زر التأكيد */}
          <button
            type="submit"
            disabled={phase === "submitting"}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-black text-white shadow-sm transition-all hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {phase === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                جارٍ التأكيد…
              </>
            ) : (
              <>
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                تأكيد الحضور
              </>
            )}
          </button>
        </form>
      ) : (
        <div className={cn("rounded-2xl border p-4 text-center", doneStyle.box)}>
          <div className={cn("mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full", doneStyle.icon)}>
            {result?.kind === "ok" || result?.kind === "updated" ? (
              <CheckCircle2 className="h-7 w-7" />
            ) : result?.kind === "duplicate" ? (
              <Info className="h-7 w-7" />
            ) : (
              <TriangleAlert className="h-7 w-7" />
            )}
          </div>
          <p className={cn("text-sm font-black leading-7", doneStyle.tone)}>{doneMessage}</p>
          <p className="mt-1 text-[11px] font-bold text-muted">معرّف البرنامج: {event.id} (ثابت من بيانات الموقع)</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm font-extrabold text-brand-deep transition-colors hover:bg-sand-pale"
          >
            إغلاق
          </button>
        </div>
      )}
    </InstallModal>,
    document.body,
  );
}
