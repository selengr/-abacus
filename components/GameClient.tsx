"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AbacusBoard } from "@/components/AbacusBoard";
import { Celebration } from "@/components/Celebration";
import { ComboToast } from "@/components/ComboToast";
import { HowToPlay, openHowToPlay } from "@/components/HowToPlay";
import { Leaderboard } from "@/components/Leaderboard";
import { ShareScoreButton } from "@/components/ShareScoreButton";
import { SoundToggle } from "@/components/SoundToggle";
import {
  ROUND_SECONDS,
  DIFFICULTY_META,
  abacusValue,
  answerToRods,
  emptyRods,
  formatProblem,
  generateProblem,
  problemAt,
  rodCountForDifficulty,
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
import { dailySeed, todayKey } from "@/lib/daily";
import {
  getDifficultyServerSnapshot,
  getDifficultySnapshot,
  saveLastDifficulty,
  subscribeDifficulty,
} from "@/lib/difficulty-prefs";
import { loadPlayerName, savePlayerName } from "@/lib/player";
import { saveRun } from "@/lib/runs";
import { saveScore } from "@/lib/scores";
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
  { title: string; blurb: string }
> = {
  timed: {
    title: "Play",
    blurb: "You have 90 seconds. Make each sum with the beads.",
  },
  practice: {
    title: "Practice",
    blurb: "No timer. Practice as long as you want.",
  },
  daily: {
    title: "Today",
    blurb: "One special puzzle for everyone today.",
  },
};

export function GameClient({ mode = "timed" }: GameClientProps) {
  const storedDifficulty = useSyncExternalStore(
    subscribeDifficulty,
    getDifficultySnapshot,
    getDifficultyServerSnapshot,
  );
  const [pickedDifficulty, setPickedDifficulty] = useState<Difficulty | null>(
    null,
  );
  const difficulty =
    mode === "daily"
      ? "medium"
      : (pickedDifficulty ?? storedDifficulty);
  const boardRods = rodCountForDifficulty(
    mode === "daily" ? "medium" : difficulty,
  );
  const [rods, setRods] = useState<RodState[]>(() => emptyRods(2));
  const [problem, setProblem] = useState<Problem | null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
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
  const [hintRods, setHintRods] = useState<RodState[] | null>(null);
  const [showHelpNudge, setShowHelpNudge] = useState(false);

  const startedAt = useRef(0);
  const solvedLock = useRef(false);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const difficultyRef = useRef<Difficulty>(
    mode === "daily" ? "medium" : "easy",
  );
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
  const helpAllowed =
    running &&
    problem !== null &&
    (mode === "practice" ||
      (mode === "timed" && difficulty === "easy"));

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    if (!helpAllowed || matched || hintRods) return;
    const id = window.setTimeout(() => setShowHelpNudge(true), 8000);
    return () => {
      window.clearTimeout(id);
    };
  }, [helpAllowed, matched, hintRods, problem]);

  const helpNudgeVisible =
    showHelpNudge && helpAllowed && !matched && !hintRods;

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
    const level =
      modeRef.current === "daily" ? "medium" : difficultyRef.current;
    const count = rodCountForDifficulty(level);
    if (modeRef.current === "daily") {
      const index = problemIndexRef.current;
      p = problemAt("medium", dailySeedRef.current, index);
      problemIndexRef.current = index + 1;
    } else {
      p = generateProblem(difficultyRef.current);
    }
    problemRef.current = p;
    setProblem(p);
    setRods(emptyRods(count));
    setHintRods(null);
    setShowHelpNudge(false);
    startedAt.current = nowMs();
    solvedLock.current = false;
  }, []);

  const handleRodsChange = useCallback(
    (next: RodState[]) => {
      playSound("bead");
      setHintRods(null);
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
      setComboPoints(gained);
      setComboStreak(nextStreak);
      setFlash("ok");
      setHintRods(null);
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
    if (mode !== "daily") {
      setPickedDifficulty(resolved);
      saveLastDifficulty(resolved);
    }
    difficultyRef.current = resolved;
    setScore(0);
    setSolved(0);
    scoreLive.current = 0;
    solvedLive.current = 0;
    skippedLive.current = 0;
    streakRef.current = 0;
    bestStreakRef.current = 0;
    problemIndexRef.current = 0;
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
    endedRef.current = false;
    bestAtStartRef.current = stats.bestScore;
    dailySeedRef.current = dailySeed();
    dayKeyRef.current = todayKey();
    loadNext();
    playSound("start");
  }

  function resetBoard() {
    setRods(emptyRods(boardRods));
    setHintRods(null);
    setFlash("miss");
    playSound("clear");
    window.setTimeout(() => setFlash(null), 400);
  }

  function showHelp() {
    const current = problemRef.current;
    if (!current || !helpAllowed) return;
    setHintRods(answerToRods(current.answer, boardRods));
    setShowHelpNudge(false);
    playSound("tick");
  }

  function skipProblem() {
    const brokeStreak = streakRef.current > 0;
    streakRef.current = 0;
    skippedLive.current += 1;
    setHintRods(null);
    playSound(brokeStreak ? "break" : "skip");
    loadNext();
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

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <HowToPlay />
      <Celebration active={finished && newBest} />
      <ComboToast points={comboPoints} streak={comboStreak} />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="group">
          <p className="text-sm text-ash transition group-hover:text-paper">
            Soroban
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {meta.title}
          </h1>
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {!running && (
            <button
              type="button"
              onClick={() => openHowToPlay()}
              className="rounded-full border border-smoke bg-ink-soft/80 px-4 py-2 text-ash transition hover:border-paper hover:text-paper"
            >
              How to play
            </button>
          )}
          <SoundToggle />
          {running && (
            <>
              <Stat label="Score" value={score} />
              {mode !== "practice" && (
                <Stat
                  label="Time"
                  value={`${secondsLeft}s`}
                  hot={secondsLeft <= 15}
                />
              )}
            </>
          )}
        </div>
      </header>

      {!running && !finished && (
        <section className="animate-rise mx-auto mt-8 max-w-lg text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {mode === "daily"
              ? "Today’s puzzle"
              : mode === "practice"
                ? "Practice mode"
                : "Ready to play?"}
          </h2>
          <p className="mt-4 text-lg text-ash">{meta.blurb}</p>
          {alreadyDidDaily && (
            <p className="mt-3 text-base text-amber">
              You scored {stats.lastDailyScore} today. Try again to beat it!
            </p>
          )}

          {(mode === "timed" || mode === "practice") && (
            <div className="mt-8 space-y-5">
              <p className="text-sm text-ash">Pick a level</p>
              <div className="flex flex-wrap justify-center gap-3">
                {(["easy", "medium", "hard"] as Difficulty[]).map((level) => {
                  const metaLevel = DIFFICULTY_META[level];
                  const active = difficulty === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        setPickedDifficulty(level);
                        saveLastDifficulty(level);
                        playSound("bead");
                      }}
                      className={[
                        "min-w-[6.5rem] rounded-full border px-5 py-3 text-base transition",
                        active
                          ? "border-lacquer bg-lacquer/10 text-lacquer"
                          : "border-smoke bg-ink-soft text-paper hover:border-amber/60",
                      ].join(" ")}
                    >
                      {metaLevel.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-ash">
                {DIFFICULTY_META[difficulty].detail}
              </p>
              <button
                type="button"
                onClick={() => startGame(difficulty)}
                className="rounded-full bg-lacquer px-10 py-4 text-base font-medium text-white transition hover:bg-lacquer-deep"
              >
                {mode === "timed" ? "Start" : "Start practice"}
              </button>
            </div>
          )}

          {mode === "daily" && (
            <button
              type="button"
              onClick={() => startGame()}
              className="mt-8 rounded-full bg-lacquer px-10 py-4 text-base font-medium text-white transition hover:bg-lacquer-deep"
            >
              Start
            </button>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-5 text-base">
            {mode !== "timed" && (
              <Link href="/play" className="text-ash hover:text-amber">
                Timed play
              </Link>
            )}
            {mode !== "practice" && (
              <Link href="/play/practice" className="text-ash hover:text-amber">
                Practice
              </Link>
            )}
            {mode !== "daily" && (
              <Link href="/play/daily" className="text-ash hover:text-amber">
                Today’s puzzle
              </Link>
            )}
          </div>
        </section>
      )}

      {running && problem && (
        <section className="animate-rise flex flex-1 flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-sm text-ash">Make this number</p>
            <p
              className={[
                "mt-2 font-mono text-4xl font-semibold tracking-tight sm:text-5xl",
                flash === "ok" ? "text-amber" : "text-paper",
              ].join(" ")}
            >
              {formatProblem(problem)}
            </p>
            <p className="mt-3 text-base text-ash">
              Your beads:{" "}
              <span className={matched ? "text-amber" : "text-paper"}>
                {value}
              </span>
            </p>
            {helpNudgeVisible && (
              <p className="mt-2 text-sm text-amber">Stuck? Tap Help.</p>
            )}
          </div>

          <AbacusBoard
            rods={rods}
            onChange={handleRodsChange}
            matched={matched}
            hintRods={hintRods}
          />

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={resetBoard}
              className="rounded-full border border-smoke px-5 py-2.5 text-base text-ash transition hover:border-paper hover:text-paper"
            >
              Clear
            </button>
            {helpAllowed && (
              <button
                type="button"
                onClick={showHelp}
                className="rounded-full border border-amber/50 px-5 py-2.5 text-base text-amber transition hover:bg-amber/10"
              >
                {hintRods ? "Hints on" : "Help"}
              </button>
            )}
            <button
              type="button"
              onClick={skipProblem}
              className="rounded-full border border-smoke px-5 py-2.5 text-base text-ash transition hover:border-paper hover:text-paper"
            >
              Skip
            </button>
            {mode === "practice" && (
              <button
                type="button"
                onClick={finishRound}
                className="rounded-full border border-lacquer/50 px-5 py-2.5 text-base text-lacquer transition hover:bg-lacquer/10"
              >
                Done
              </button>
            )}
          </div>
        </section>
      )}

      {finished && (
        <section className="animate-rise mx-auto mt-6 w-full max-w-md text-center">
          <p className="text-base text-ash">Nice work!</p>
          <h2 className="mt-2 text-6xl font-semibold text-amber">{score}</h2>
          {newBest && (
            <p className="mt-2 text-base text-lacquer">New best score!</p>
          )}
          {freshAchievements.length > 0 && (
            <ul className="mt-3 space-y-1 text-base text-amber">
              {freshAchievements.map((id) => {
                const item = ACHIEVEMENTS.find((a) => a.id === id);
                return <li key={id}>Badge: {item?.title ?? id}</li>;
              })}
            </ul>
          )}
          <p className="mt-2 text-ash">{solved} correct</p>
          {mode !== "practice" && (
            <div className="mt-6 flex flex-col gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={16}
                className="rounded-full border border-smoke bg-ink-soft px-4 py-3 text-center text-base outline-none focus:border-amber"
              />
              <button
                type="button"
                onClick={() => void submitScore()}
                disabled={saving}
                className="rounded-full bg-lacquer px-5 py-3 text-base font-medium text-white transition hover:bg-lacquer-deep disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save my score"}
              </button>
            </div>
          )}
          {saveMessage && <p className="mt-3 text-sm text-ash">{saveMessage}</p>}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => startGame(difficulty)}
              className="rounded-full bg-lacquer px-8 py-3 text-base font-medium text-white transition hover:bg-lacquer-deep"
            >
              Play again
            </button>
            <ShareScoreButton
              score={score}
              solved={solved}
              modeLabel={
                mode === "daily"
                  ? "Today"
                  : mode === "practice"
                    ? "Practice"
                    : `Play ${difficulty}`
              }
            />
          </div>
          {mode !== "practice" && (
            <Leaderboard defaultFilter={mode === "daily" ? "day" : "week"} />
          )}
        </section>
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
    <div className="min-w-[72px] rounded-2xl border border-smoke bg-ink-soft/80 px-3 py-2 text-center">
      <p className="text-xs text-ash">{label}</p>
      <p className={`text-lg font-medium ${hot ? "text-lacquer" : "text-paper"}`}>
        {value}
      </p>
    </div>
  );
}
