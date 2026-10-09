"use client";

import { useMemo, useState } from "react";
import { SEASON_EVENTS } from "@/data/events";
import {
  getEventStatus,
  getSeasonStats,
  sortCompletedEvents,
  sortLiveEvents,
  sortUpcomingEvents,
} from "@/lib/datetime";
import { useNow } from "@/lib/hooks";
import HeroSection from "@/components/HeroSection";
import StatsCards from "@/components/StatsCards";
import Filters, { type ExecutionFilter, type StatusFilter } from "@/components/Filters";
import LiveEventSection from "@/components/LiveEventSection";
import UpcomingEvents from "@/components/UpcomingEvents";
import CompletedEvents from "@/components/CompletedEvents";
import Footer from "@/components/Footer";

export default function HomePage() {
  const now = useNow(1000);
  const [execution, setExecution] = useState<ExecutionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const stats = useMemo(() => getSeasonStats(now), [now]);

  const filtered = useMemo(() => {
    return SEASON_EVENTS.filter((e) => {
      if (execution !== "all" && e.execution !== execution) return false;
      if (statusFilter !== "all" && getEventStatus(e, now) !== statusFilter) return false;
      return true;
    });
  }, [execution, statusFilter, now]);

  const live = useMemo(() => sortLiveEvents(filtered, now), [filtered, now]);
  const upcoming = useMemo(() => sortUpcomingEvents(filtered, now), [filtered, now]);
  const completed = useMemo(() => sortCompletedEvents(filtered, now), [filtered, now]);

  return (
    <main className="min-h-screen bg-sand-cream pb-0">
      <HeroSection now={now} />
      <StatsCards stats={stats} />
      <Filters
        execution={execution}
        status={statusFilter}
        onExecution={setExecution}
        onStatus={setStatusFilter}
        shown={filtered.length}
        total={SEASON_EVENTS.length}
      />

      <LiveEventSection events={live} now={now} />
      <UpcomingEvents events={upcoming} now={now} />
      <CompletedEvents events={completed} now={now} />

      <Footer />
    </main>
  );
}
