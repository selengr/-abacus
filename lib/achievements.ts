export type AchievementId =
  | "first-solve"
  | "streak-5"
  | "streak-10"
  | "score-1k"
  | "score-3k"
  | "daily-done"
  | "games-10";

export type Achievement = {
  id: AchievementId;
  title: string;
  detail: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-solve",
    title: "First click",
    detail: "Solve your first problem.",
  },
  {
    id: "streak-5",
    title: "Hot hands",
    detail: "Reach a streak of 5.",
  },
  {
    id: "streak-10",
    title: "Beam master",
    detail: "Reach a streak of 10.",
  },
  {
    id: "score-1k",
    title: "Four digits",
    detail: "Score 1,000 in one run.",
  },
  {
    id: "score-3k",
    title: "Lacquer legend",
    detail: "Score 3,000 in one run.",
  },
  {
    id: "daily-done",
    title: "Same sun",
    detail: "Finish a daily challenge.",
  },
  {
    id: "games-10",
    title: "Regular",
    detail: "Play 10 games.",
  },
];

const STORAGE_KEY = "soroban-achievements-v1";
const CHANGE_EVENT = "soroban-achievements-changed";

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export function loadUnlocked(): AchievementId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AchievementId[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUnlocked(ids: AchievementId[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  emit();
}

export function unlockAchievements(candidates: AchievementId[]): AchievementId[] {
  const current = new Set(loadUnlocked());
  const freshly: AchievementId[] = [];
  for (const id of candidates) {
    if (!current.has(id)) {
      current.add(id);
      freshly.push(id);
    }
  }
  if (freshly.length) saveUnlocked([...current]);
  return freshly;
}

export function evaluateAchievements(params: {
  solved: number;
  streak: number;
  score: number;
  gamesPlayed: number;
  daily?: boolean;
}): AchievementId[] {
  const next: AchievementId[] = [];
  if (params.solved >= 1) next.push("first-solve");
  if (params.streak >= 5) next.push("streak-5");
  if (params.streak >= 10) next.push("streak-10");
  if (params.score >= 1000) next.push("score-1k");
  if (params.score >= 3000) next.push("score-3k");
  if (params.daily) next.push("daily-done");
  if (params.gamesPlayed >= 10) next.push("games-10");
  return unlockAchievements(next);
}

export function subscribeAchievements(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getAchievementsSnapshot() {
  return JSON.stringify(loadUnlocked());
}

export function getAchievementsServerSnapshot() {
  return "[]";
}
