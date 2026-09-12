import type { Difficulty } from "@/lib/abacus";

const STORAGE_KEY = "soroban-difficulty-v1";
const CHANGE_EVENT = "soroban-difficulty-changed";

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export function loadLastDifficulty(
  fallback: Difficulty = "easy",
): Difficulty {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "easy" || raw === "medium" || raw === "hard") return raw;
  } catch {
    // ignore
  }
  return fallback;
}

export function saveLastDifficulty(level: Difficulty) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, level);
  emit();
}

export function subscribeDifficulty(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getDifficultySnapshot() {
  return loadLastDifficulty("easy");
}

export function getDifficultyServerSnapshot() {
  return "easy" as Difficulty;
}
