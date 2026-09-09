import type { Difficulty, Problem, RodState } from "./types";
import { ROD_COUNT } from "./types";

export function emptyRods(count = ROD_COUNT): RodState[] {
  return Array.from({ length: count }, () => ({ heaven: false, earth: 0 }));
}

export function rodValue(rod: RodState): number {
  return (rod.heaven ? 5 : 0) + rod.earth;
}

export function abacusValue(rods: RodState[]): number {
  return rods.reduce((sum, rod, index) => {
    const place = Math.pow(10, rods.length - 1 - index);
    return sum + rodValue(rod) * place;
  }, 0);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateProblem(difficulty: Difficulty, round: number): Problem {
  const termCount = difficulty === "hard" || round > 5 ? 3 : 2;
  let maxDigit: number;

  if (difficulty === "easy") maxDigit = round < 3 ? 9 : 49;
  else if (difficulty === "normal") maxDigit = round < 4 ? 99 : 199;
  else maxDigit = round < 3 ? 99 : 499;

  const terms = Array.from({ length: termCount }, () => randomInt(1, maxDigit));
  const answer = terms.reduce((a, b) => a + b, 0);

  // Keep answers within 5-digit soroban capacity
  if (answer > 99999) {
    return generateProblem(difficulty, Math.max(1, round - 2));
  }

  return { terms, answer };
}

export function scoreForSolve(elapsedMs: number, streak: number, difficulty: Difficulty): number {
  const base = difficulty === "easy" ? 80 : difficulty === "normal" ? 120 : 180;
  const speedBonus = Math.max(0, 100 - Math.floor(elapsedMs / 100));
  const streakBonus = Math.min(streak, 10) * 15;
  return base + speedBonus + streakBonus;
}

export const LEADERBOARD_KEY = "soroban-leaderboard-v1";
export const PLAYER_KEY = "soroban-player-name";

export function loadLeaderboard(): import("./types").ScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as import("./types").ScoreEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScore(entry: import("./types").ScoreEntry): import("./types").ScoreEntry[] {
  const next = [...loadLeaderboard(), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next));
  return next;
}
