"use client";

import { AlarmClock } from "lucide-react";
import type { SeasonEvent } from "@/data/events";
import EventCard from "./EventCard";

export default function NearestEventSection({
  event,
  now,
}: {
  event: SeasonEvent;
  now: number;
}) {
  return (
    <section
      aria-label="البرنامج الأقرب موعدًا"
      className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-pale text-brand-deep border border-rose-brand/30">
          <AlarmClock className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="text-lg font-black text-ink sm:text-xl">البرنامج الأقرب موعدًا</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <EventCard event={event} now={now} index={0} pinned isNext />
      </div>
    </section>
  );
}
