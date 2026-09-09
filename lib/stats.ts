export type PersonalStats = {
  gamesPlayed: number;
  totalSolved: number;
  bestScore: number;
  bestStreak: number;
  lastDailyKey: string | null;
  lastDailyScore: number;
  bestDailyScore: number;
};

const STORAGE_KEY = "soroban-stats-v1";
const CHANGE_EVENT = "soroban-stats-changed";

const EMPTY: PersonalStats = {
  gamesPlayed: 0,
  totalSolved: 0,
  bestScore: 0,
  bestStreak: 0,
  lastDailyKey: null,
  lastDailyScore: 0,
  bestDailyScore: 0,
};

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export function loadStats(): PersonalStats {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<PersonalStats>) };
  } catch {
    return { ...EMPTY };
  }
}

function saveStats(next: PersonalStats) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
  return next;
}

export function recordRun(params: {
  score: number;
  solved: number;
  streak: number;
  dailyKey?: string | null;
}): PersonalStats {
  const current = loadStats();
  const next: PersonalStats = {
    ...current,
    gamesPlayed: current.gamesPlayed + 1,
    totalSolved: current.totalSolved + params.solved,
    bestScore: Math.max(current.bestScore, params.score),
    bestStreak: Math.max(current.bestStreak, params.streak),
  };

  if (params.dailyKey) {
    next.lastDailyKey = params.dailyKey;
    next.lastDailyScore = params.score;
    next.bestDailyScore = Math.max(current.bestDailyScore, params.score);
  }

  return saveStats(next);
}

export function subscribeStats(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getStatsSnapshot() {
  return JSON.stringify(loadStats());
}

export function getStatsServerSnapshot() {
  return JSON.stringify(EMPTY);
}
