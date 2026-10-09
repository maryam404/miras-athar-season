"use client";

import { Radio } from "lucide-react";
import type { SeasonEvent } from "@/data/events";
import EventCard from "./EventCard";

export default function LiveEventSection({
  events,
  now,
}: {
  events: SeasonEvent[];
  now: number;
}) {
  if (events.length === 0) return null;
  return (
    <section aria-label="البرنامج الجاري الآن" className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand text-white">
          <Radio className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="text-lg font-black text-ink sm:text-xl">جاري الآن</h2>
          <p className="text-xs font-semibold text-muted">برنامج منعقد في هذه اللحظة بتوقيت الرياض</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((e, i) => (
          <EventCard key={e.id} event={e} now={now} index={i} />
        ))}
      </div>
    </section>
  );
}
