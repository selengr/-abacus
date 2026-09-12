import { createRng } from "@/lib/rng";

export type RodState = {
  heaven: boolean;
  earth: number;
};

export type Difficulty = "easy" | "medium" | "hard";

export type Problem = {
  addends: number[];
  answer: number;
};

export type Rng = () => number;

export const ROD_COUNT = 5;
export const ROUND_SECONDS = 90;

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; points: number; detail: string }
> = {
  easy: {
    label: "Easy",
    points: 100,
    detail: "Small numbers. Great to start.",
  },
  medium: {
    label: "Medium",
    points: 200,
    detail: "Bigger numbers.",
  },
  hard: {
    label: "Hard",
    points: 350,
    detail: "Three numbers. Extra challenge.",
  },
};

export function emptyRods(count = ROD_COUNT): RodState[] {
  return Array.from({ length: count }, () => ({ heaven: false, earth: 0 }));
}

export function rodValue(rod: RodState): number {
  return (rod.heaven ? 5 : 0) + rod.earth;
}

export function abacusValue(rods: RodState[]): number {
  return rods.reduce((sum, rod, index) => {
    const place = 10 ** (rods.length - 1 - index);
    return sum + rodValue(rod) * place;
  }, 0);
}

function randomInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

const DIFFICULTY_RANGES: Record<
  Difficulty,
  { addendCount: number; maxAddend: number; maxAnswer: number }
> = {
  easy: { addendCount: 2, maxAddend: 20, maxAnswer: 40 },
  medium: { addendCount: 2, maxAddend: 90, maxAnswer: 180 },
  hard: { addendCount: 3, maxAddend: 250, maxAnswer: 750 },
};

export function generateProblem(
  difficulty: Difficulty,
  rng: Rng = Math.random,
): Problem {
  const { addendCount, maxAddend, maxAnswer } = DIFFICULTY_RANGES[difficulty];

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const addends = Array.from({ length: addendCount }, () =>
      randomInt(rng, 1, maxAddend),
    );
    const answer = addends.reduce((sum, n) => sum + n, 0);
    if (answer <= maxAnswer) {
      return { addends, answer };
    }
  }

  return { addends: [7, 8], answer: 15 };
}

/** Same problem for every player given seed + index. */
export function problemAt(
  difficulty: Difficulty,
  seed: number,
  index: number,
): Problem {
  const rng = createRng(seed);
  let problem = generateProblem(difficulty, rng);
  for (let i = 0; i < index; i += 1) {
    problem = generateProblem(difficulty, rng);
  }
  return problem;
}

export function formatProblem(problem: Problem): string {
  return problem.addends.join(" + ");
}

export function scoreForSolve(params: {
  difficulty: Difficulty;
  elapsedMs: number;
  streak: number;
}): number {
  const base = { easy: 100, medium: 200, hard: 350 }[params.difficulty];
  const seconds = params.elapsedMs / 1000;
  const timeBonus = Math.max(0, Math.round(80 - seconds * 4));
  const streakBonus = Math.min(params.streak, 8) * 25;
  return base + timeBonus + streakBonus;
}
