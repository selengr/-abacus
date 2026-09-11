"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getRunsServerSnapshot,
  getRunsSnapshot,
  subscribeRuns,
  type RunRecord,
} from "@/lib/runs";

export function RecentRuns() {
  const json = useSyncExternalStore(
    subscribeRuns,
    getRunsSnapshot,
    getRunsServerSnapshot,
  );
  const runs = useMemo(() => JSON.parse(json) as RunRecord[], [json]);

  if (runs.length === 0) return null;

  return (
    <section className="mt-8 rounded-2xl border border-smoke/70 bg-ink-soft/40 p-4">
      <h3 className="text-[11px] uppercase tracking-[0.3em] text-ash">
        Recent runs
      </h3>
      <ol className="mt-3 space-y-2">
        {runs.slice(0, 6).map((run) => (
          <li
            key={run.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-smoke/60 bg-ink/30 px-3 py-2 font-mono text-sm"
          >
            <span className="text-ash">{run.mode}</span>
            <span className="text-paper">{run.score}</span>
            <span className="text-ash">
              {run.solved} solved · {run.skipped} skip
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
