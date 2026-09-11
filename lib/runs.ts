export type RunRecord = {
  id: string;
  mode: string;
  score: number;
  solved: number;
  skipped: number;
  createdAt: number;
};

const STORAGE_KEY = "soroban-runs-v1";
const CHANGE_EVENT = "soroban-runs-changed";
const MAX_RUNS = 12;

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export function loadRuns(): RunRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RunRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRun(
  entry: Omit<RunRecord, "id" | "createdAt">,
): RunRecord[] {
  const next: RunRecord = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  const ranked = [next, ...loadRuns()].slice(0, MAX_RUNS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
  emit();
  return ranked;
}

export function subscribeRuns(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getRunsSnapshot() {
  return JSON.stringify(loadRuns());
}

export function getRunsServerSnapshot() {
  return "[]";
}
