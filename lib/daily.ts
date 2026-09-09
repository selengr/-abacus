import { createRng } from "@/lib/rng";

/** Stable UTC day key like 2026-09-09 */
export function todayKey(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Deterministic seed shared by every player for a calendar day. */
export function dailySeed(dayKey = todayKey()): number {
  const rng = createRng(
    Array.from(dayKey).reduce(
      (acc, ch) => (Math.imul(acc, 31) + ch.charCodeAt(0)) >>> 0,
      2166136261,
    ),
  );
  return (rng() * 0xffffffff) >>> 0;
}

export function formatDayLabel(dayKey = todayKey()): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
