"use client";

import { useMemo, useState } from "react";
import type { ScoreEntry } from "@/lib/types";

export function Leaderboard({
  entries,
  title = "Public leaderboard",
  defaultFilter = "all",
}: {
  entries: ScoreEntry[];
  title?: string;
  defaultFilter?: "all" | "daily";
}) {
  const [filter, setFilter] = useState<"all" | "daily">(defaultFilter);

  const visible = useMemo(() => {
    if (filter === "daily") {
      return entries.filter((entry) => entry.difficulty === "daily");
    }
    return entries;
  }, [entries, filter]);

  return (
    <section className="animate-rise-late mt-auto border-t border-smoke/80 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[11px] uppercase tracking-[0.3em] text-ash">
          {title}
        </h3>
        <div className="flex gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "text-amber" : "text-ash"}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("daily")}
            className={filter === "daily" ? "text-amber" : "text-ash"}
          >
            Daily
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-3 text-sm text-ash">No scores yet. Be the first.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {visible.map((entry, index) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-smoke/70 bg-ink-soft/50 px-3 py-2 font-mono text-sm"
            >
              <span className="text-ash">{index + 1}</span>
              <span className="flex-1 truncate text-paper">{entry.name}</span>
              <span className="text-ash">{entry.difficulty}</span>
              <span className="text-amber">{entry.score}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
