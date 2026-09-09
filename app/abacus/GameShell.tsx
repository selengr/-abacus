import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/abacus/game.module.css";
import { AbacusBoard } from "./AbacusBoard";
import {
  abacusValue,
  emptyRods,
  generateProblem,
  loadLeaderboard,
  PLAYER_KEY,
  saveScore,
  scoreForSolve,
} from "./scoring";
import type { Difficulty, GamePhase, Problem, ScoreEntry } from "./types";
import { DIFFICULTY_LABELS } from "./types";

const ROUNDS_PER_RUN = 10;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function GameShell() {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [rods, setRods] = useState(emptyRods());
  const [problem, setProblem] = useState<Problem | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [toast, setToast] = useState("");
  const [board, setBoard] = useState<ScoreEntry[]>([]);
  const roundStartedAt = useRef<number>(Date.now());

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(PLAYER_KEY) : null;
    if (saved) setName(saved);
    setBoard(loadLeaderboard());
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || !problem) return;
    if (abacusValue(rods) !== problem.answer) return;

    const gained = scoreForSolve(Date.now() - roundStartedAt.current, streak + 1, difficulty);
    const nextStreak = streak + 1;
    setScore((s) => s + gained);
    setStreak(nextStreak);
    setBestStreak((b) => Math.max(b, nextStreak));
    setSolved((n) => n + 1);
    setToast(`درست! +${gained}`);
    setPhase("correct");

    window.setTimeout(() => {
      if (round >= ROUNDS_PER_RUN) {
        finishRun(score + gained, solved + 1, Math.max(bestStreak, nextStreak));
      } else {
        startRound(round + 1);
      }
    }, 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rods, problem, phase]);

  const startRound = (nextRound: number) => {
    setRound(nextRound);
    setRods(emptyRods());
    setProblem(generateProblem(difficulty, nextRound));
    roundStartedAt.current = Date.now();
    setPhase("playing");
    setToast("");
  };

  const beginGame = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || "مهمان";
    setName(trimmed);
    localStorage.setItem(PLAYER_KEY, trimmed);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSolved(0);
    setElapsed(0);
    startRound(1);
  };

  const finishRun = (finalScore: number, finalSolved: number, finalBest: number) => {
    setPhase("finished");
    setToast("");
    const entry: ScoreEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || "مهمان",
      score: finalScore,
      solved: finalSolved,
      bestStreak: finalBest,
      difficulty,
      createdAt: Date.now(),
    };
    setBoard(saveScore(entry));
  };

  const resetBoard = () => setRods(emptyRods());

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.inner}>
        <header className={styles.topBar}>
          <a className={styles.brandMark} href="/">
            <span>چرتکه</span>SOROBAN
          </a>
          {phase !== "idle" && (
            <div className={styles.metaRow}>
              <span className={styles.chip}>
                امتیاز <strong>{score}</strong>
              </span>
              <span className={styles.chip}>
                دور <strong>
                  {Math.min(round, ROUNDS_PER_RUN)}/{ROUNDS_PER_RUN}
                </strong>
              </span>
              <span className={styles.chip}>
                زنجیره <strong>{streak}</strong>
              </span>
              <span className={styles.chip}>
                زمان <strong>{formatTime(elapsed)}</strong>
              </span>
            </div>
          )}
        </header>

        {phase === "idle" && (
          <form className={styles.lobby} onSubmit={beginGame}>
            <h1 className={styles.lobbyTitle}>SOROBAN</h1>
            <p className={styles.lobbySub}>
              جمع را با مهره‌های چرتکه بساز. سریع‌تر و دقیق‌تر = امتیاز بیشتر.
            </p>
            <div className={styles.field}>
              <label htmlFor="player-name">نام بازیکن</label>
              <input
                id="player-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً رضا"
                maxLength={24}
                autoComplete="nickname"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="difficulty">سختی</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((key) => (
                  <option key={key} value={key}>
                    {DIFFICULTY_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              شروع بازی
            </button>
          </form>
        )}

        {(phase === "playing" || phase === "correct") && problem && (
          <div className={styles.stage}>
            <div className={styles.problemBlock}>
              <div className={styles.problemLabel}>حاصل را روی چرتکه بساز</div>
              <div
                className={`${styles.problemMath} ${phase === "correct" ? styles.correct : ""}`}
              >
                {problem.terms.join(" + ")} = ?
              </div>
              <div className={styles.toast}>{toast}</div>
            </div>

            <AbacusBoard
              rods={rods}
              disabled={phase === "correct"}
              onChange={setRods}
            />

            <div className={styles.actions}>
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={resetBoard}>
                ریست مهره‌ها
              </button>
            </div>
          </div>
        )}

        {phase === "finished" && (
          <div className={styles.finished}>
            <h2>پایان دور</h2>
            <p>
              {solved} مسئله درست · بهترین زنجیره {bestStreak} · {formatTime(elapsed)}
            </p>
            <div className={styles.bigScore}>{score}</div>
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => setPhase("idle")}
              >
                بازی دوباره
              </button>
            </div>
          </div>
        )}

        <section className={styles.leaderboard} aria-label="جدول امتیازات">
          <h2>جدول امتیازات</h2>
          {board.length === 0 ? (
            <p className={styles.lobbySub} style={{ textAlign: "center" }}>
              هنوز امتیازی ثبت نشده — اولین نفر باش.
            </p>
          ) : (
            <ol>
              {board.map((entry, i) => (
                <li key={entry.id}>
                  <em>{i + 1}</em>
                  <span>
                    {entry.name}{" "}
                    <small style={{ opacity: 0.55 }}>
                      · {DIFFICULTY_LABELS[entry.difficulty]}
                    </small>
                  </span>
                  <strong>{entry.score}</strong>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

export default GameShell;
