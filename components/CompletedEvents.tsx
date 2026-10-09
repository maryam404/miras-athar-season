"use client";

import { History } from "lucide-react";
import type { SeasonEvent } from "@/data/events";
import EventCard from "./EventCard";

export default function CompletedEvents({
  events,
  now,
}: {
  events: SeasonEvent[];
  now: number;
}) {
  return (
    <section aria-label="البرامج المنتهية" className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-100 text-stone-500 border border-stone-200">
            <History className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-lg font-black text-ink sm:text-xl">البرامج المنتهية</h2>
            <p className="text-xs font-semibold text-muted">الأحدث انتهاءً أولًا</p>
          </div>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-extrabold text-stone-500">
          {events.length} برنامج
        </span>
      </div>

      {events.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-stone-200 bg-white/60 p-8 text-center text-sm font-bold text-muted">
          لا توجد برامج منتهية مطابقة للفلتر الحالي
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((e, i) => (
            <EventCard key={e.id} event={e} now={now} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
