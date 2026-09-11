"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AbacusBoard } from "@/components/AbacusBoard";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { Celebration } from "@/components/Celebration";
import { ComboToast } from "@/components/ComboToast";
import { DailyResetClock } from "@/components/DailyResetClock";
import { HowToPlay, openHowToPlay } from "@/components/HowToPlay";
import { Leaderboard } from "@/components/Leaderboard";
import {
  ProblemHistory,
  type HistoryEntry,
} from "@/components/ProblemHistory";
import { RecentRuns } from "@/components/RecentRuns";
import { ShareScoreButton } from "@/components/ShareScoreButton";
import { SoundToggle } from "@/components/SoundToggle";
import { StatsPanel } from "@/components/StatsPanel";
import {
  ROUND_SECONDS,
  abacusValue,
  emptyRods,
  formatProblem,
  generateProblem,
  problemAt,
  scoreForSolve,
  type Difficulty,
  type Problem,
  type RodState,
} from "@/lib/abacus";
import {
  ACHIEVEMENTS,
  evaluateAchievements,
  type AchievementId,
} from "@/lib/achievements";
import { dailySeed, formatDayLabel, todayKey } from "@/lib/daily";
import { loadPlayerName, savePlayerName } from "@/lib/player";
import { saveRun } from "@/lib/runs";
import {
  getScoresServerSnapshot,
  getScoresSnapshot,
  refreshScores,
  saveScore,
  subscribeScores,
  type ScoreEntry,
} from "@/lib/scores";
import { playSound } from "@/lib/sound";
import {
  getStatsServerSnapshot,
  getStatsSnapshot,
  recordRun,
  subscribeStats,
  type PersonalStats,
} from "@/lib/stats";

function nowMs() {
  return Date.now();
}

export type GameMode = "timed" | "practice" | "daily";

type GameClientProps = {
  mode?: GameMode;
};

const MODE_META: Record<
  GameMode,
  { title: string; eyebrow: string; blurb: string }
> = {
  timed: {
    title: "Arena",
    eyebrow: "Timed solo",
    blurb: `${ROUND_SECONDS} seconds. Harder levels pay more. Scores post to the public board.`,
  },
  practice: {
    title: "Practice",
    eyebrow: "No clock",
    blurb: "Warm up freely. No timer, no pressure — just beads and sums.",
  },
  daily: {
    title: "Daily",
    eyebrow: "Same board worldwide",
    blurb: "One seeded run for everyone today. Beat yesterday’s hands.",
  },
};

export function GameClient({ mode = "timed" }: GameClientProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(
    mode === "daily" ? "medium" : "easy",
  );
  const [rods, setRods] = useState<RodState[]>(() => emptyRods());
  const [problem, setProblem] = useState<Problem | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
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
  const [newBest, setNewBest] = useState(false);
  const [freshAchievements, setFreshAchievements] = useState<AchievementId[]>(
    [],
  );
  const [comboPoints, setComboPoints] = useState<number | null>(null);
  const [comboStreak, setComboStreak] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const startedAt = useRef(0);
  const solvedLock = useRef(false);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const difficultyRef = useRef<Difficulty>(mode === "daily" ? "medium" : "easy");
  const problemRef = useRef<Problem | null>(null);
  const problemIndexRef = useRef(0);
  const endedRef = useRef(false);
  const dailySeedRef = useRef(dailySeed());
  const dayKeyRef = useRef(todayKey());
  const scoreLive = useRef(0);
  const solvedLive = useRef(0);
  const skippedLive = useRef(0);
  const bestAtStartRef = useRef(0);
  const modeRef = useRef(mode);

  const scoresJson = useSyncExternalStore(
    subscribeScores,
    getScoresSnapshot,
    getScoresServerSnapshot,
  );
  const leaderboard = useMemo(
    () => JSON.parse(scoresJson) as ScoreEntry[],
    [scoresJson],
  );

  const statsJson = useSyncExternalStore(
    subscribeStats,
    getStatsSnapshot,
    getStatsServerSnapshot,
  );
  const stats = useMemo(
    () => JSON.parse(statsJson) as PersonalStats,
    [statsJson],
  );

  const value = useMemo(() => abacusValue(rods), [rods]);
  const matched = problem !== null && value === problem.answer && running;
  const meta = MODE_META[mode];
  const dayKey = todayKey();
  const alreadyDidDaily = mode === "daily" && stats.lastDailyKey === dayKey;

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    void refreshScores().catch(() => undefined);
  }, []);

  const finishRound = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    playSound("end");
    setRunning(false);
    setFinished(true);
    const peakStreak = Math.max(bestStreakRef.current, streakRef.current);
    const finalScore = scoreLive.current;
    const recorded = recordRun({
      score: finalScore,
      solved: solvedLive.current,
      skipped: skippedLive.current,
      streak: peakStreak,
      dailyKey: modeRef.current === "daily" ? dayKeyRef.current : null,
    });
    saveRun({
      mode: modeRef.current,
      score: finalScore,
      solved: solvedLive.current,
      skipped: skippedLive.current,
    });
    setNewBest(finalScore > bestAtStartRef.current && finalScore > 0);
    const unlocked = evaluateAchievements({
      solved: solvedLive.current,
      streak: peakStreak,
      score: finalScore,
      gamesPlayed: recorded.gamesPlayed,
      skipped: skippedLive.current,
      daily: modeRef.current === "daily",
    });
    setFreshAchievements(unlocked);
  }, []);

  useEffect(() => {
    if (!running || finished || mode === "practice") return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          finishRound();
          return 0;
        }
        if (s <= 10) playSound("tick");
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, finished, mode, finishRound]);

  const loadNext = useCallback(() => {
    let p: Problem;
    if (modeRef.current === "daily") {
      const index = problemIndexRef.current;
      p = problemAt("medium", dailySeedRef.current, index);
      problemIndexRef.current = index + 1;
      setProblemIndex(index + 1);
    } else {
      p = generateProblem(difficultyRef.current);
    }
    problemRef.current = p;
    setProblem(p);
    setRods(emptyRods());
    startedAt.current = nowMs();
    solvedLock.current = false;
  }, []);

  const handleRodsChange = useCallback(
    (next: RodState[]) => {
      playSound("bead");
      setRods(next);
      const current = problemRef.current;
      if (!current || !running || solvedLock.current) return;
      if (abacusValue(next) !== current.answer) return;

      solvedLock.current = true;
      const nextStreak = streakRef.current + 1;
      streakRef.current = nextStreak;
      bestStreakRef.current = Math.max(bestStreakRef.current, nextStreak);
      const gained = scoreForSolve({
        difficulty: modeRef.current === "daily" ? "medium" : difficultyRef.current,
        elapsedMs: nowMs() - startedAt.current,
        streak: nextStreak,
      });
      setScore((s) => {
        const nextScore = s + gained;
        scoreLive.current = nextScore;
        return nextScore;
      });
      setSolved((n) => {
        const nextSolved = n + 1;
        solvedLive.current = nextSolved;
        return nextSolved;
      });
      setStreak(nextStreak);
      setComboPoints(gained);
      setComboStreak(nextStreak);
      setHistory((prev) => [
        ...prev,
        { expression: formatProblem(current), points: gained },
      ]);
      setFlash("ok");
      playSound("success");
      window.setTimeout(() => {
        setFlash(null);
        setComboPoints(null);
        loadNext();
      }, 650);
    },
    [running, loadNext],
  );

  function startGame(level: Difficulty = difficulty) {
    const resolved = mode === "daily" ? "medium" : level;
    setDifficulty(resolved);
    difficultyRef.current = resolved;
    setScore(0);
    setSolved(0);
    setStreak(0);
    scoreLive.current = 0;
    solvedLive.current = 0;
    skippedLive.current = 0;
    streakRef.current = 0;
    bestStreakRef.current = 0;
    problemIndexRef.current = 0;
    setProblemIndex(0);
    setSecondsLeft(ROUND_SECONDS);
    setFinished(false);
    setRunning(true);
    setName(loadPlayerName());
    setFlash(null);
    setSaveMessage(null);
    setNewBest(false);
    setFreshAchievements([]);
    setComboPoints(null);
    setComboStreak(0);
    setHistory([]);
    endedRef.current = false;
    bestAtStartRef.current = stats.bestScore;
    dailySeedRef.current = dailySeed();
    dayKeyRef.current = todayKey();
    loadNext();
    playSound("start");
  }

  function resetBoard() {
    setRods(emptyRods());
    setFlash("miss");
    playSound("clear");
    window.setTimeout(() => setFlash(null), 400);
  }

  async function submitScore() {
    const trimmed = savePlayerName(name || "Player") || "Player";
    setName(trimmed);
    setSaving(true);
    setSaveMessage(null);
    try {
      await saveScore({
        name: trimmed,
        score,
        difficulty: mode === "daily" ? "daily" : difficulty,
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
    const current = problemRef.current;
    const brokeStreak = streakRef.current > 0;
    setStreak(0);
    streakRef.current = 0;
    skippedLive.current += 1;
    if (current) {
      setHistory((prev) => [
        ...prev,
        { expression: formatProblem(current), points: 0, skipped: true },
      ]);
    }
    playSound(brokeStreak ? "break" : "skip");
    loadNext();
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <HowToPlay />
      <Celebration active={finished && newBest} />
      <ComboToast points={comboPoints} streak={comboStreak} />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="group">
          <p className="text-[11px] uppercase tracking-[0.35em] text-ash transition group-hover:text-paper">
            Soroban
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {meta.title}
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
            href="/settings"
            className="rounded-full border border-smoke bg-ink-soft/80 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ash transition hover:border-paper hover:text-paper"
          >
            Settings
          </Link>
          <Link
            href="/play/race"
            className="rounded-full border border-smoke bg-ink-soft/80 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ash transition hover:border-lacquer hover:text-lacquer"
          >
            Race
          </Link>
          <Stat label="score" value={score} />
          {mode !== "practice" && (
            <Stat
              label="time"
              value={`${secondsLeft}s`}
              hot={secondsLeft <= 15}
            />
          )}
          <Stat label="streak" value={streak} />
        </div>
      </header>

      {!running && !finished && (
        <section className="animate-rise mx-auto mt-10 max-w-xl text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-lacquer">
            {meta.eyebrow}
            {mode === "daily" ? ` · ${formatDayLabel()}` : ""}
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {mode === "daily" ? (
              <>
                Today’s beads.
                <span className="block text-lacquer">One shared run.</span>
              </>
            ) : mode === "practice" ? (
              <>
                No clock.
                <span className="block text-lacquer">Just the beam.</span>
              </>
            ) : (
              <>
                Set the beads.
                <span className="block text-lacquer">Bank the points.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-ash">{meta.blurb}</p>
          {alreadyDidDaily && (
            <p className="mt-3 font-mono text-sm text-amber">
              You already posted {stats.lastDailyScore} today — play again to
              improve.
            </p>
          )}
          {mode === "daily" && (
            <div className="mt-4 flex justify-center">
              <DailyResetClock />
            </div>
          )}

          {mode === "timed" && (
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
          )}

          {mode !== "timed" && (
            <button
              type="button"
              onClick={() => startGame()}
              className="mt-8 rounded-full bg-lacquer px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-white transition hover:bg-lacquer-deep"
            >
              {mode === "daily" ? "Start daily" : "Start practice"}
            </button>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            {mode !== "daily" && (
              <Link
                href="/play/daily"
                className="text-amber underline-offset-4 hover:underline"
              >
                Daily challenge
              </Link>
            )}
            {mode !== "practice" && (
              <Link
                href="/play/practice"
                className="text-ash underline-offset-4 hover:text-paper hover:underline"
              >
                Practice mode
              </Link>
            )}
            {mode !== "timed" && (
              <Link
                href="/play"
                className="text-ash underline-offset-4 hover:text-paper hover:underline"
              >
                Timed arena
              </Link>
            )}
            <Link
              href="/play/race"
              className="text-ash underline-offset-4 hover:text-paper hover:underline"
            >
              Race a rival
            </Link>
          </div>

          <StatsPanel />
          <RecentRuns />
          <AchievementsPanel />
        </section>
      )}

      {running && problem && (
        <section className="animate-rise flex flex-1 flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-ash">
              {mode === "daily"
                ? `Daily · problem ${Math.max(problemIndex, 1)}`
                : "Make this sum"}
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

          <ProblemHistory entries={history} />

          <div className="flex flex-wrap justify-center gap-3">
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
            {mode === "practice" && (
              <button
                type="button"
                onClick={finishRound}
                className="rounded-full border border-lacquer/50 px-4 py-2 text-sm text-lacquer transition hover:bg-lacquer/10"
              >
                End session
              </button>
            )}
          </div>
        </section>
      )}

      {finished && (
        <section className="animate-rise mx-auto mt-8 w-full max-w-lg text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-ash">
            {mode === "practice" ? "Session over" : "Round over"}
          </p>
          <h2 className="mt-2 text-5xl font-semibold text-amber">{score}</h2>
          {newBest && (
            <p className="mt-2 font-mono text-sm text-lacquer">
              New personal best
            </p>
          )}
          {freshAchievements.length > 0 && (
            <ul className="mt-3 space-y-1 font-mono text-sm text-amber">
              {freshAchievements.map((id) => {
                const item = ACHIEVEMENTS.find((a) => a.id === id);
                return <li key={id}>Unlocked · {item?.title ?? id}</li>;
              })}
            </ul>
          )}
          <p className="mt-2 text-ash">
            {solved} solved
            {mode === "daily"
              ? " on daily"
              : mode === "practice"
                ? " in practice"
                : ` on ${difficulty}`}
          </p>
          {mode !== "practice" && (
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
          )}
          {saveMessage && <p className="mt-3 text-sm text-ash">{saveMessage}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <ShareScoreButton
              score={score}
              solved={solved}
              modeLabel={
                mode === "daily"
                  ? "Daily"
                  : mode === "practice"
                    ? "Practice"
                    : `Timed ${difficulty}`
              }
            />
            <button
              type="button"
              onClick={() => startGame(difficulty)}
              className="text-sm text-ash underline-offset-4 hover:text-paper hover:underline"
            >
              Play again
            </button>
          </div>
          <StatsPanel />
          <RecentRuns />
          <AchievementsPanel />
        </section>
      )}

      {mode !== "practice" && (
        <Leaderboard
          entries={leaderboard}
          defaultFilter={mode === "daily" ? "daily" : "all"}
        />
      )}
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
