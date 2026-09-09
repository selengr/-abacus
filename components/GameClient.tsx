"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AbacusBoard } from "@/components/AbacusBoard";
import {
  abacusValue,
  emptyRods,
  formatProblem,
  generateProblem,
  scoreForSolve,
  type Difficulty,
  type Problem,
  type RodState,
} from "@/lib/abacus";
import {
  getScoresServerSnapshot,
  getScoresSnapshot,
  saveScore,
  subscribeScores,
  type ScoreEntry,
} from "@/lib/scores";

const ROUND_SECONDS = 90;

export function GameClient() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [rods, setRods] = useState<RodState[]>(() => emptyRods());
  const [problem, setProblem] = useState<Problem | null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [name, setName] = useState("");
  const [flash, setFlash] = useState<"ok" | "miss" | null>(null);
  const startedAt = useRef<number>(Date.now());
  const solvedRef = useRef(false);
  const streakRef = useRef(0);
  const difficultyRef = useRef<Difficulty>(difficulty);
  const problemRef = useRef<Problem | null>(null);

  const scoresJson = useSyncExternalStore(
    subscribeScores,
    getScoresSnapshot,
    getScoresServerSnapshot,
  );
  const leaderboard = useMemo(
    () => JSON.parse(scoresJson) as ScoreEntry[],
    [scoresJson],
  );

  const value = useMemo(() => abacusValue(rods), [rods]);
  const matched = problem !== null && value === problem.answer && running;

  useEffect(() => {
    if (!running || finished) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, finished]);

  const nextProblem = useCallback(() => {
    const p = generateProblem(difficultyRef.current);
    problemRef.current = p;
    setProblem(p);
    setRods(emptyRods());
    startedAt.current = Date.now();
    solvedRef.current = false;
  }, []);

  const handleRodsChange = useCallback(
    (next: RodState[]) => {
      setRods(next);
      const current = problemRef.current;
      if (!current || !running || solvedRef.current) return;
      if (abacusValue(next) !== current.answer) return;

      solvedRef.current = true;
      const nextStreak = streakRef.current + 1;
      streakRef.current = nextStreak;
      const gained = scoreForSolve({
        difficulty: difficultyRef.current,
        elapsedMs: Date.now() - startedAt.current,
        streak: nextStreak,
      });
      setScore((s) => s + gained);
      setSolved((n) => n + 1);
      setStreak(nextStreak);
      setFlash("ok");
      window.setTimeout(() => {
        setFlash(null);
        nextProblem();
      }, 650);
    },
    [running, nextProblem],
  );

  function startGame(level: Difficulty = difficulty) {
    setDifficulty(level);
    difficultyRef.current = level;
    setScore(0);
    setSolved(0);
    setStreak(0);
    streakRef.current = 0;
    setSecondsLeft(ROUND_SECONDS);
    setFinished(false);
    setRunning(true);
    setName("");
    setFlash(null);
    const p = generateProblem(level);
    problemRef.current = p;
    setProblem(p);
    setRods(emptyRods());
    startedAt.current = Date.now();
    solvedRef.current = false;
  }

  function resetBoard() {
    setRods(emptyRods());
    setFlash("miss");
    window.setTimeout(() => setFlash(null), 400);
  }

  function submitScore() {
    const trimmed = name.trim().slice(0, 16) || "Player";
    saveScore({
      name: trimmed,
      score,
      difficulty,
      solved,
    });
  }

  function skipProblem() {
    setStreak(0);
    streakRef.current = 0;
    nextProblem();
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-4">
        <Link href="/" className="group">
          <p className="text-[11px] uppercase tracking-[0.35em] text-ash transition group-hover:text-paper">
            Soroban
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Arena
          </h1>
        </Link>
        <div className="flex gap-2 font-mono text-sm">
          <Stat label="score" value={score} />
          <Stat label="time" value={`${secondsLeft}s`} hot={secondsLeft <= 15} />
          <Stat label="streak" value={streak} />
        </div>
      </header>

      {!running && !finished && (
        <section className="animate-rise mx-auto mt-10 max-w-xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Set the beads.
            <span className="block text-lacquer">Bank the points.</span>
          </h2>
          <p className="mt-4 text-ash">
            {ROUND_SECONDS} seconds. Solve additions on a real soroban. Harder
            levels pay more.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => startGame(level)}
                className="rounded-full border border-smoke bg-ink-soft px-5 py-3 text-sm uppercase tracking-[0.2em] text-paper transition hover:border-lacquer hover:text-lacquer"
              >
                {level}
              </button>
            ))}
          </div>
        </section>
      )}

      {running && problem && (
        <section className="animate-rise flex flex-1 flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-ash">
              Make this sum
            </p>
            <p
              className={[
                "mt-2 font-mono text-4xl font-semibold tracking-tight sm:text-5xl",
                flash === "ok" ? "text-amber" : "text-paper",
              ].join(" ")}
            >
              {formatProblem(problem)}
            </p>
            <p className="mt-3 font-mono text-sm text-ash">
              abacus reads{" "}
              <span className={matched ? "text-amber" : "text-paper"}>
                {value}
              </span>
            </p>
          </div>

          <AbacusBoard
            rods={rods}
            onChange={handleRodsChange}
            matched={matched}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetBoard}
              className="rounded-full border border-smoke px-4 py-2 text-sm text-ash transition hover:border-paper hover:text-paper"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={skipProblem}
              className="rounded-full border border-smoke px-4 py-2 text-sm text-ash transition hover:border-paper hover:text-paper"
            >
              Skip
            </button>
          </div>
        </section>
      )}

      {finished && (
        <section className="animate-rise mx-auto mt-8 w-full max-w-lg text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-ash">
            Round over
          </p>
          <h2 className="mt-2 text-5xl font-semibold text-amber">{score}</h2>
          <p className="mt-2 text-ash">
            {solved} solved on {difficulty}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={16}
              className="flex-1 rounded-full border border-smoke bg-ink-soft px-4 py-3 text-center outline-none focus:border-amber"
            />
            <button
              type="button"
              onClick={submitScore}
              className="rounded-full bg-lacquer px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white transition hover:bg-lacquer-deep"
            >
              Save score
            </button>
          </div>
          <button
            type="button"
            onClick={() => startGame(difficulty)}
            className="mt-4 text-sm text-ash underline-offset-4 hover:text-paper hover:underline"
          >
            Play again
          </button>
        </section>
      )}

      <Leaderboard entries={leaderboard} />
    </div>
  );
}

function Stat({
  label,
  value,
  hot,
}: {
  label: string;
  value: string | number;
  hot?: boolean;
}) {
  return (
    <div className="min-w-[70px] rounded-xl border border-smoke bg-ink-soft/80 px-3 py-2 text-center backdrop-blur">
      <p className="text-[10px] uppercase tracking-[0.2em] text-ash">{label}</p>
      <p className={hot ? "text-lacquer" : "text-paper"}>{value}</p>
    </div>
  );
}

function Leaderboard({ entries }: { entries: ScoreEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section className="animate-rise-late mt-auto border-t border-smoke/80 pt-6">
      <h3 className="text-[11px] uppercase tracking-[0.3em] text-ash">
        Leaderboard
      </h3>
      <ol className="mt-3 space-y-2">
        {entries.map((entry, index) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-smoke/70 bg-ink-soft/50 px-3 py-2 font-mono text-sm"
          >
            <span className="text-ash">{index + 1}</span>
            <span className="flex-1 truncate text-paper">{entry.name}</span>
            <span className="text-ash">{entry.difficulty}</span>
            <span className="text-amber">{entry.score}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
