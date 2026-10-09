"use client";

import type { ReactNode } from "react";
import { ListFilter, MapPin } from "lucide-react";
import type { EventStatus } from "@/data/events";
import { cn } from "@/lib/cn";

export type ExecutionFilter = "all" | "حضوري" | "عن بُعد";
export type StatusFilter = "all" | EventStatus;

const EXEC_OPTS: Array<{ v: ExecutionFilter; label: string }> = [
  { v: "all", label: "الكل" },
  { v: "حضوري", label: "حضوري" },
  { v: "عن بُعد", label: "عن بُعد" },
];

const STATUS_OPTS: Array<{ v: StatusFilter; label: string }> = [
  { v: "all", label: "الكل" },
  { v: "upcoming", label: "قادم" },
  { v: "live", label: "جاري الآن" },
  { v: "completed", label: "منتهي" },
];

function Group<T extends string>({
  title,
  icon,
  options,
  value,
  onChange,
}: {
  title: string;
  icon: ReactNode;
  options: Array<{ v: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center gap-1.5 text-xs font-extrabold text-brand-deep">
        {icon}
        {title}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            aria-pressed={value === o.v}
            className={cn(
              "rounded-full border px-4 py-1.5 text-[13px] font-bold transition-all",
              value === o.v
                ? "border-brand bg-brand text-white shadow-sm"
                : "border-brand/20 bg-white text-ink/70 hover:border-brand/50 hover:text-brand-deep",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Filters({
  execution,
  status,
  onExecution,
  onStatus,
  shown,
  total,
}: {
  execution: ExecutionFilter;
  status: StatusFilter;
  onExecution: (v: ExecutionFilter) => void;
  onStatus: (v: StatusFilter) => void;
  shown: number;
  total: number;
}) {
  return (
    <section aria-label="الفلاتر" className="mx-auto w-full max-w-6xl px-5 pt-8 sm:px-8">
      <div className="flex flex-col gap-5 rounded-3xl border border-brand/10 bg-white/70 p-5 shadow-card backdrop-blur sm:p-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-10">
          <Group
            title="حسب التنفيذ"
            icon={<MapPin className="h-3.5 w-3.5" />}
            options={EXEC_OPTS}
            value={execution}
            onChange={onExecution}
          />
          <Group
            title="حسب الحالة"
            icon={<ListFilter className="h-3.5 w-3.5" />}
            options={STATUS_OPTS}
            value={status}
            onChange={onStatus}
          />
        </div>
        <p className="text-xs font-bold text-muted">
          عرض <span className="text-brand-deep">{shown}</span> من أصل{" "}
          <span className="text-brand-deep">{total}</span>
        </p>
      </div>
    </section>
  );
}
