import type { Difficulty } from "@/lib/abacus";

const STORAGE_KEY = "soroban-difficulty-v1";

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
}
