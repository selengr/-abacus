"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AbacusBoard } from "@/components/AbacusBoard";
import { HowToPlay, openHowToPlay } from "@/components/HowToPlay";
import { Leaderboard } from "@/components/Leaderboard";
import { SoundToggle } from "@/components/SoundToggle";
import {
  ROUND_SECONDS,
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
  refreshScores,
  saveScore,
  subscribeScores,
  type ScoreEntry,
} from "@/lib/scores";
import { playSound } from "@/lib/sound";

function nowMs() {
  return Date.now();
}

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
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const startedAt = useRef(0);
  const solvedRef = useRef(false);
  const streakRef = useRef(0);
  const difficultyRef = useRef<Difficulty>("easy");
  const problemRef = useRef<Problem | null>(null);
  const endedRef = useRef(false);

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
    void refreshScores().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!running || finished) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          if (!endedRef.current) {
            endedRef.current = true;
            playSound("end");
          }
          setRunning(false);
          setFinished(true);
          return 0;
        }
        if (s <= 10) playSound("tick");
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
    startedAt.current = nowMs();
    solvedRef.current = false;
  }, []);

  const handleRodsChange = useCallback(
    (next: RodState[]) => {
      playSound("bead");
      setRods(next);
      const current = problemRef.current;
      if (!current || !running || solvedRef.current) return;
      if (abacusValue(next) !== current.answer) return;

      solvedRef.current = true;
      const nextStreak = streakRef.current + 1;
      streakRef.current = nextStreak;
      const gained = scoreForSolve({
        difficulty: difficultyRef.current,
        elapsedMs: nowMs() - startedAt.current,
        streak: nextStreak,
      });
      setScore((s) => s + gained);
      setSolved((n) => n + 1);
      setStreak(nextStreak);
      setFlash("ok");
      playSound("success");
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
    setSaveMessage(null);
    endedRef.current = false;
    const p = generateProblem(level);
    problemRef.current = p;
    setProblem(p);
    setRods(emptyRods());
    startedAt.current = nowMs();
    solvedRef.current = false;
    playSound("start");
  }

  function resetBoard() {
    setRods(emptyRods());
    setFlash("miss");
    playSound("clear");
    window.setTimeout(() => setFlash(null), 400);
  }

  async function submitScore() {
    const trimmed = name.trim().slice(0, 16) || "Player";
    setSaving(true);
    setSaveMessage(null);
    try {
      await saveScore({
        name: trimmed,
        score,
        difficulty,
        solved,
      });
      setSaveMessage("Saved to the public board.");
    } catch {
      setSaveMessage("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function skipProblem() {
    setStreak(0);
    streakRef.current = 0;
    playSound("skip");
    nextProblem();
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <HowToPlay />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="group">
          <p className="text-[11px] uppercase tracking-[0.35em] text-ash transition group-hover:text-paper">
            Soroban
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Arena
          </h1>
        </Link>
        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          <button
            type="button"
            onClick={() => openHowToPlay()}
            className="rounded-full border border-smoke bg-ink-soft/80 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ash transition hover:border-paper hover:text-paper"
          >
            How to
          </button>
          <SoundToggle />
          <Link
            href="/play/race"
            className="rounded-full border border-smoke bg-ink-soft/80 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ash transition hover:border-lacquer hover:text-lacquer"
          >
            Race
          </Link>
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
            levels pay more. Scores post to the public board.
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
          <Link
            href="/play/race"
            className="mt-6 inline-block text-sm text-amber underline-offset-4 hover:underline"
          >
            Challenge a rival instead
          </Link>
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
              onClick={() => void submitScore()}
              disabled={saving}
              className="rounded-full bg-lacquer px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white transition hover:bg-lacquer-deep disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save score"}
            </button>
          </div>
          {saveMessage && <p className="mt-3 text-sm text-ash">{saveMessage}</p>}
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
