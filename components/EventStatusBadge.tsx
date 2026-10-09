"use client";

import { CheckCircle2, Clock3, Radio } from "lucide-react";
import type { EventStatus } from "@/data/events";
import { cn } from "@/lib/cn";

const MAP: Record<EventStatus, { label: string; className: string; Icon: typeof Clock3 }> = {
  upcoming: {
    label: "قادم",
    Icon: Clock3,
    className: "bg-sand-pale text-brand-deep border-brand/20",
  },
  live: {
    label: "جاري الآن",
    Icon: Radio,
    className: "bg-brand text-white border-brand-dark",
  },
  completed: {
    label: "منتهي",
    Icon: CheckCircle2,
    className: "bg-stone-100 text-stone-500 border-stone-200",
  },
};

export default function EventStatusBadge({
  status,
  pulse = false,
}: {
  status: EventStatus;
  pulse?: boolean;
}) {
  const { label, className, Icon } = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
        className,
      )}
    >
      {status === "live" && pulse ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-soft-pulse rounded-full bg-white" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
      ) : (
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      )}
      {label}
    </span>
  );
}
