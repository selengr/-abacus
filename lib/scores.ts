import type { ScoreEntry } from "@/lib/server-store";

export type { ScoreEntry };

let cache = "[]";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeScores(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getScoresSnapshot() {
  return cache;
}

export function getScoresServerSnapshot() {
  return "[]";
}

export async function refreshScores(): Promise<ScoreEntry[]> {
  const res = await fetch("/api/scores", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load scores");
  const scores = (await res.json()) as ScoreEntry[];
  cache = JSON.stringify(scores);
  emit();
  return scores;
}

export async function saveScore(
  entry: Omit<ScoreEntry, "id" | "createdAt">,
): Promise<ScoreEntry[]> {
  const res = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Failed to save score");
  const scores = (await res.json()) as ScoreEntry[];
  cache = JSON.stringify(scores);
  emit();
  return scores;
}
