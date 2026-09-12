export type ScorePeriod = "all" | "week" | "day";

export function isScorePeriod(value: string): value is ScorePeriod {
  return value === "all" || value === "week" || value === "day";
}

/** UTC day start, or rolling 7 days for week. */
export function periodCutoffMs(period: ScorePeriod, now = Date.now()): number | null {
  if (period === "all") return null;
  if (period === "day") {
    const d = new Date(now);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  return now - 7 * 24 * 60 * 60 * 1000;
}

export function filterScoresByPeriod<T extends { createdAt: number }>(
  entries: T[],
  period: ScorePeriod,
  now = Date.now(),
): T[] {
  const cutoff = periodCutoffMs(period, now);
  if (cutoff === null) return entries;
  return entries.filter((entry) => entry.createdAt >= cutoff);
}
