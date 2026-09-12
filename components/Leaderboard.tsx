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

type BoardFilter = "week" | "day";

const FILTERS: { id: BoardFilter; label: string }[] = [
  { id: "week", label: "This week" },
  { id: "day", label: "Today" },
];

export function Leaderboard({
  title = "Top scores",
  defaultFilter = "week",
}: {
  title?: string;
  defaultFilter?: BoardFilter | "all" | "daily";
  /** @deprecated entries now load from the scores store */
  entries?: ScoreEntry[];
}) {
  const initial: BoardFilter =
    defaultFilter === "day" || defaultFilter === "daily" ? "day" : "week";
  const [filter, setFilter] = useState<BoardFilter>(initial);
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
    const period: ScorePeriod = filter;
    void refreshScores(period).catch(() => undefined);
  }, [filter]);

  return (
    <section className="mt-10 border-t border-smoke/70 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-medium text-paper">{title}</h3>
        <div className="flex gap-3 text-sm">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={
                filter === item.id ? "text-amber" : "text-ash hover:text-paper"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-ash">No scores yet. Be first!</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {entries.slice(0, 8).map((entry, index) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-smoke/60 bg-ink-soft/40 px-4 py-3 text-base"
            >
              <span className="w-6 text-ash">{index + 1}</span>
              <span className="flex-1 truncate text-paper">{entry.name}</span>
              <span className="font-medium text-amber">{entry.score}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
