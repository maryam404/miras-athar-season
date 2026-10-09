"use client";

import { getTimeRemaining, pad2 } from "@/lib/datetime";
import type { SeasonEvent } from "@/data/events";

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[64px] flex-1 flex-col items-center rounded-xl border border-brand/10 bg-white/80 px-2 py-2.5 shadow-sm">
      <span className="text-xl font-extrabold tabular-nums text-brand-deep">{value}</span>
      <span className="mt-0.5 text-[11px] font-semibold text-muted">{label}</span>
    </div>
  );
}

export default function Countdown({ event, now }: { event: SeasonEvent; now: number }) {
  const r = getTimeRemaining(event, now);
  if (r.isOverdue) return null;
  return (
    <div dir="rtl" aria-live="polite">
      <p className="mb-2 text-xs font-bold text-brand">متبقي على بداية البرنامج</p>
      <div className="flex items-stretch gap-2">
        <Cell value={String(r.days)} label="يوم" />
        <Cell value={pad2(r.hours)} label="ساعة" />
        <Cell value={pad2(r.minutes)} label="دقيقة" />
        <Cell value={pad2(r.seconds)} label="ثانية" />
      </div>
    </div>
  );
}
