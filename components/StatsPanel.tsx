"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getStatsServerSnapshot,
  getStatsSnapshot,
  subscribeStats,
  type PersonalStats,
} from "@/lib/stats";

export function StatsPanel() {
  const json = useSyncExternalStore(
    subscribeStats,
    getStatsSnapshot,
    getStatsServerSnapshot,
  );
  const stats = useMemo(() => JSON.parse(json) as PersonalStats, [json]);

  if (stats.gamesPlayed === 0) {
    return (
      <section className="mt-8 rounded-2xl border border-smoke/70 bg-ink-soft/40 p-4">
        <h3 className="text-[11px] uppercase tracking-[0.3em] text-ash">
          Your stats
        </h3>
        <p className="mt-2 text-sm text-ash">Play a round to start your ledger.</p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-smoke/70 bg-ink-soft/40 p-4">
      <h3 className="text-[11px] uppercase tracking-[0.3em] text-ash">
        Your stats
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-4">
        <Stat label="games" value={stats.gamesPlayed} />
        <Stat label="solved" value={stats.totalSolved} />
        <Stat label="best" value={stats.bestScore} />
        <Stat label="streak" value={stats.bestStreak} />
      </div>
      {stats.bestDailyScore > 0 && (
        <p className="mt-3 font-mono text-xs text-ash">
          daily best · <span className="text-amber">{stats.bestDailyScore}</span>
        </p>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-smoke/60 bg-ink/40 px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-[0.18em] text-ash">{label}</p>
      <p className="mt-1 text-paper">{value}</p>
    </div>
  );
}
