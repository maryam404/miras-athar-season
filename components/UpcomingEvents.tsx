"use client";

import { CalendarClock } from "lucide-react";
import type { SeasonEvent } from "@/data/events";
import EventCard from "./EventCard";

export default function UpcomingEvents({
  events,
  now,
}: {
  events: SeasonEvent[];
  now: number;
}) {
  return (
    <section aria-label="البرامج القادمة" className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-pale text-brand-deep border border-rose-brand/30">
            <CalendarClock className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-lg font-black text-ink sm:text-xl">البرامج القادمة</h2>
            <p className="text-xs font-semibold text-muted">مرتبة من الأقرب إلى الأبعد</p>
          </div>
        </div>
        <span className="rounded-full bg-brand/[0.07] px-3 py-1 text-xs font-extrabold text-brand-deep">
          {events.length} برنامج
        </span>
      </div>

      {events.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brand/25 bg-white/60 p-8 text-center text-sm font-bold text-muted">
          لا توجد برامج قادمة مطابقة للفلتر الحالي
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((e, i) => (
            <EventCard key={e.id} event={e} now={now} isNext={i === 0} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
