export type GamePhase = "idle" | "playing" | "correct" | "finished";

export type Difficulty = "easy" | "normal" | "hard";

export interface Problem {
  terms: number[];
  answer: number;
}

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  solved: number;
  bestStreak: number;
  difficulty: Difficulty;
  createdAt: number;
}

export interface RodState {
  /** Heaven bead active → contributes 5 */
  heaven: boolean;
  /** Number of earth beads toward the bar (0–4) */
  earth: number;
}

export const ROD_COUNT = 5;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "آسان",
  normal: "عادی",
  hard: "سخت",
};
