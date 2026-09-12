"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  getScoresServerSnapshot,
  getScoresSnapshot,
  refreshScores,
  subscribeScores,
  type ScoreEntry,
} from "@/lib/scores";
import type { ScorePeriod } from "@/lib/score-period";

type BoardFilter = ScorePeriod | "daily";

const FILTERS: { id: BoardFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "week", label: "Week" },
  { id: "day", label: "Today" },
  { id: "daily", label: "Daily" },
];

export function Leaderboard({
  title = "Public leaderboard",
  defaultFilter = "all",
}: {
  title?: string;
  defaultFilter?: BoardFilter;
  /** @deprecated entries now load from the scores store */
  entries?: ScoreEntry[];
}) {
  const [filter, setFilter] = useState<BoardFilter>(defaultFilter);
  const scoresJson = useSyncExternalStore(
    subscribeScores,
    getScoresSnapshot,
    getScoresServerSnapshot,
  );
  const entries = useMemo(
    () => JSON.parse(scoresJson) as ScoreEntry[],
    [scoresJson],
  );

  useEffect(() => {
    const period: ScorePeriod = filter === "daily" ? "all" : filter;
    void refreshScores(period).catch(() => undefined);
  }, [filter]);

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
        <div className="flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.16em]">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={filter === item.id ? "text-amber" : "text-ash"}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-3 text-sm text-ash">
          {filter === "week"
            ? "No scores this week yet."
            : filter === "day"
              ? "No scores today yet."
              : filter === "daily"
                ? "No daily scores yet."
                : "No scores yet. Be the first."}
        </p>
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
