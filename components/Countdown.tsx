"use client";

import { Hourglass } from "lucide-react";
import type { SeasonEvent } from "@/data/events";
import {
  getEventEndDateTime,
  getEventProgressDuring,
  getEventProgressTowardStart,
  getEventStartDateTime,
  splitRemainingDHM,
  splitRemainingHM,
} from "@/lib/datetime";

/** رقم + كلمة كاملة بخط أصغر بجانبه — الصيغة المعتمدة بالكلمات الكاملة بلا اختصارات. */
function Unit({ value, word }: { value: string; word: string }) {
  return (
    <span className="inline-flex items-baseline">
      <span className="tabular-nums text-[13px] font-black text-ink">{value}</span>
      <span className="ms-0.5 text-[10px] font-bold text-muted">{word}</span>
    </span>
  );
}

/**
 * العدّاد المعتمد (سطر أفقي مختصر: أيقونة ساعة رملية + أرقام صغيرة + شريط تقدم
 * رفيع بألوان الهوية — بلا مربعات وبلا ثوانٍ):
 * - قبل البداية: «متبقي على بداية البرنامج» بأيام/ساعات/دقائق بالكلمات الكاملة،
 *   وشريط تقدم بمعادلة موثقة (نهاية البرنامج السابق → بداية هذا البرنامج).
 * - أثناء البرنامج: يتحول تلقائيًا إلى «متبقي على نهاية البرنامج» بساعات/دقائق،
 *   وشريط التقدم يعكس الوقت المنقضي من مدة البرنامج نفسها.
 * - بعد النهاية: لا يُعرض شيء (حالة انتهاء البرنامج كما هي بلا أي تغيير).
 * الحساب من مواعيد البرامج الحقيقية بتوقيت الرياض المعتمد، ولا يظهر رقم سالب.
 */
export default function Countdown({ event, now }: { event: SeasonEvent; now: number }) {
  const start = getEventStartDateTime(event);
  const end = getEventEndDateTime(event);

  if (now >= end) return null; // بعد النهاية: بلا عدّاد — الحالات الخاصة بالبطاقة كما هي

  const before = now < start;
  const label = before ? "متبقي على بداية البرنامج" : "متبقي على نهاية البرنامج";
  const progress = before
    ? getEventProgressTowardStart(event, now)
    : getEventProgressDuring(event, now);
  const percent = Math.round(progress * 100);
  const percentSafe = Math.min(Math.max(percent, 0), 100);

  const beforeParts = before ? splitRemainingDHM(start - now) : null;
  const duringParts = before ? null : splitRemainingHM(end - now);
  const ariaText = beforeParts
    ? `${label}: ${beforeParts.days} يوم و${beforeParts.hours} ساعة و${beforeParts.minutes} دقيقة`
    : `${label}: ${duringParts?.hours} ساعة و${duringParts?.minutes} دقيقة`;

  return (
    <div dir="rtl" aria-live="off">
      <div className="flex items-center gap-1.5">
        <Hourglass className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
        <p className="text-[11px] font-extrabold text-brand-deep">{label}</p>
        <span className="ms-auto inline-flex items-baseline gap-1" aria-label={ariaText}>
          {beforeParts && <Unit value={String(beforeParts.days)} word="يوم" />}
          {beforeParts && <Unit value={String(beforeParts.hours)} word="ساعة" />}
          {beforeParts && <Unit value={String(beforeParts.minutes)} word="دقيقة" />}
          {duringParts && <Unit value={String(duringParts.hours)} word="ساعة" />}
          {duringParts && <Unit value={String(duringParts.minutes)} word="دقيقة" />}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="التقدم الزمني حتى بداية البرنامج"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentSafe}
        className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-sand-light"
      >
        <div
          className="h-full rounded-full bg-gradient-to-l from-brand-deep via-brand to-rose-brand transition-all duration-700 ease-out"
          style={{ width: `${percentSafe}%` }}
        />
      </div>
    </div>
  );
}
