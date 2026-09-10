"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  ACHIEVEMENTS,
  getAchievementsServerSnapshot,
  getAchievementsSnapshot,
  subscribeAchievements,
  type AchievementId,
} from "@/lib/achievements";

export function AchievementsPanel() {
  const json = useSyncExternalStore(
    subscribeAchievements,
    getAchievementsSnapshot,
    getAchievementsServerSnapshot,
  );
  const unlocked = useMemo(
    () => new Set(JSON.parse(json) as AchievementId[]),
    [json],
  );

  return (
    <section className="mt-8 rounded-2xl border border-smoke/70 bg-ink-soft/40 p-4">
      <h3 className="text-[11px] uppercase tracking-[0.3em] text-ash">
        Achievements
      </h3>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {ACHIEVEMENTS.map((item) => {
          const on = unlocked.has(item.id);
          return (
            <li
              key={item.id}
              className={[
                "rounded-xl border px-3 py-3",
                on
                  ? "border-amber/40 bg-ink/50"
                  : "border-smoke/50 bg-ink/20 opacity-55",
              ].join(" ")}
            >
              <p className={on ? "text-amber" : "text-ash"}>{item.title}</p>
              <p className="mt-1 text-xs text-ash">{item.detail}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
