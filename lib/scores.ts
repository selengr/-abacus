export type ScoreEntry = {
  id: string;
  name: string;
  score: number;
  difficulty: string;
  solved: number;
  createdAt: number;
};

const STORAGE_KEY = "soroban-scores-v1";
const MAX_ENTRIES = 10;

export function loadScores(): ScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScoreEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScore(entry: Omit<ScoreEntry, "id" | "createdAt">): ScoreEntry[] {
  const next: ScoreEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const ranked = [...loadScores(), next]
    .sort((a, b) => b.score - a.score || a.createdAt - b.createdAt)
    .slice(0, MAX_ENTRIES);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
  return ranked;
}
