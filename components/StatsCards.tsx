"use client";

import { CalendarRange, CheckCircle2, Clock3, Radio } from "lucide-react";
import type { SeasonStats } from "@/lib/datetime";

const CARDS = [
  { key: "totalEvents", label: "إجمالي البرامج", Icon: CalendarRange, accent: "text-brand-deep bg-brand/[0.07] border-brand/15" },
  { key: "completedEvents", label: "تم تنفيذها", Icon: CheckCircle2, accent: "text-stone-600 bg-stone-100 border-stone-200" },
  { key: "upcomingEvents", label: "البرامج القادمة", Icon: Clock3, accent: "text-brand bg-rose-pale border-rose-brand/30" },
  { key: "liveEvents", label: "جاري الآن", Icon: Radio, accent: "text-white bg-brand border-brand-dark" },
] as const;

export default function StatsCards({ stats }: { stats: SeasonStats }) {
  return (
    <section aria-label="ملخص الإحصائيات" className="mx-auto -mt-10 w-full max-w-6xl px-5 sm:px-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {CARDS.map(({ key, label, Icon, accent }, i) => (
          <div
            key={key}
            style={{ animationDelay: `${i * 80}ms` }}
            className="flex animate-fade-up items-center gap-3 rounded-2xl border border-brand/10 bg-white p-4 shadow-card sm:p-5"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${accent}`}>
              <Icon className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-2xl font-black tabular-nums text-ink sm:text-3xl">
                {stats[key]}
              </span>
              <span className="block text-xs font-bold text-muted sm:text-[13px]">{label}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
