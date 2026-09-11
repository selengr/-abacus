"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AbacusBoard } from "@/components/AbacusBoard";
import { ComboToast } from "@/components/ComboToast";
import { CopyInviteButton } from "@/components/CopyInviteButton";
import { CountdownOverlay } from "@/components/CountdownOverlay";
import { HowToPlay, openHowToPlay } from "@/components/HowToPlay";
import { PaceMeter } from "@/components/PaceMeter";
import { ShareScoreButton } from "@/components/ShareScoreButton";
import { SoundToggle } from "@/components/SoundToggle";
import {
  abacusValue,
  emptyRods,
  formatProblem,
  problemAt,
  scoreForSolve,
  type Difficulty,
  type Problem,
  type RodState,
} from "@/lib/abacus";
import { loadPlayerName, savePlayerName } from "@/lib/player";
import { playSound } from "@/lib/sound";
import type { Room } from "@/lib/types";

function nowMs() {
  return Date.now();
}

const RACE_COUNTDOWN_SEC = 3;

type PublicRoom = Omit<Room, "players"> & {
  players: Array<{
    id: string;
    name: string;
    score: number;
    solved: number;
    problemIndex: number;
    ready: boolean;
    finished: boolean;
  }>;
};

type RaceClientProps = {
  initialCode?: string;
};

export function RaceClient({ initialCode = "" }: RaceClientProps) {
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState(initialCode);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inviteMode = Boolean(initialCode);

  const [rods, setRods] = useState<RodState[]>(() => emptyRods());
  const [problem, setProblem] = useState<Problem | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [flash, setFlash] = useState<"ok" | "miss" | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [comboPoints, setComboPoints] = useState<number | null>(null);
  const [comboStreak, setComboStreak] = useState(0);

  const startedAt = useRef(0);
  const solvedRef = useRef(false);
  const streakRef = useRef(0);
  const problemRef = useRef<Problem | null>(null);
  const scoreRef = useRef(0);
  const solvedCountRef = useRef(0);
  const problemIndexRef = useRef(0);
  const finishedSent = useRef(false);
  const playingStarted = useRef(false);
  const roomCode = room?.code ?? null;

  const me = room?.players.find((p) => p.id === playerId) ?? null;
  const rival = room?.players.find((p) => p.id !== playerId) ?? null;
  const isHost = Boolean(room && playerId && room.hostId === playerId);
  const value = useMemo(() => abacusValue(rods), [rods]);
  const matched =
    problem !== null &&
    value === problem.answer &&
    room?.status === "playing";

  const loadProblem = useCallback((r: PublicRoom, index: number) => {
    const p = problemAt(r.difficulty, r.seed, index);
    problemRef.current = p;
    setProblem(p);
    setProblemIndex(index);
    problemIndexRef.current = index;
    setRods(emptyRods());
    startedAt.current = nowMs();
    solvedRef.current = false;
  }, []);

  async function createRoom() {
    setBusy(true);
    setError(null);
    try {
      const display = savePlayerName(name || loadPlayerName() || "Host") || "Host";
      setName(display);
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: display,
          difficulty,
        }),
      });
      const data = (await res.json()) as {
        room?: PublicRoom;
        playerId?: string;
        error?: string;
      };
      if (!res.ok || !data.room || !data.playerId) {
        throw new Error(data.error ?? "Could not create room");
      }
      setRoom(data.room);
      setPlayerId(data.playerId);
      playSound("start");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    setBusy(true);
    setError(null);
    try {
      const display = savePlayerName(name || loadPlayerName() || "Rival") || "Rival";
      setName(display);
      const code = joinCode.trim().toUpperCase();
      const res = await fetch(`/api/rooms/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: display }),
      });
      const data = (await res.json()) as {
        room?: PublicRoom;
        playerId?: string;
        error?: string;
      };
      if (!res.ok || !data.room || !data.playerId) {
        throw new Error(data.error ?? "Could not join room");
      }
      setRoom(data.room);
      setPlayerId(data.playerId);
      playSound("start");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Join failed");
    } finally {
      setBusy(false);
    }
  }

  async function startRace() {
    if (!room || !playerId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${room.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, action: "start" }),
      });
      const data = (await res.json()) as { room?: PublicRoom; error?: string };
      if (!res.ok || !data.room) {
        throw new Error(data.error ?? "Could not start");
      }
      setRoom(data.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Start failed");
    } finally {
      setBusy(false);
    }
  }

  const syncProgress = useCallback(
    async (action: "progress" | "finish") => {
      if (!room || !playerId) return;
      const res = await fetch(`/api/rooms/${room.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          action,
          score: scoreRef.current,
          solved: solvedCountRef.current,
          problemIndex: problemIndexRef.current,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { room?: PublicRoom };
      if (data.room) setRoom(data.room);
    },
    [room, playerId],
  );

  useEffect(() => {
    if (!roomCode) return;
    const id = window.setInterval(() => {
      void fetch(`/api/rooms/${roomCode}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data: { room?: PublicRoom }) => {
          if (data.room) setRoom(data.room);
        })
        .catch(() => undefined);
    }, 1000);
    return () => window.clearInterval(id);
  }, [roomCode]);

  useEffect(() => {
    if (!room || room.status !== "playing" || !room.startedAt) return;
    if (!playingStarted.current) {
      playingStarted.current = true;
      finishedSent.current = false;
      scoreRef.current = 0;
      solvedCountRef.current = 0;
      streakRef.current = 0;
      setScore(0);
      setSolved(0);
      setComboPoints(null);
      setComboStreak(0);
      loadProblem(room, 0);
      playSound("start");
    }

    const serverStarted = room.startedAt;
    const playStart = serverStarted + RACE_COUNTDOWN_SEC * 1000;
    const roundSeconds = room.roundSeconds;
    const tick = window.setInterval(() => {
      const now = nowMs();
      const untilPlay = playStart - now;
      if (untilPlay > 0) {
        const nextCount = Math.ceil(untilPlay / 1000);
        setCountdown(nextCount);
        setSecondsLeft(roundSeconds);
        return;
      }
      setCountdown(null);
      const elapsed = Math.floor((now - playStart) / 1000);
      const left = Math.max(0, roundSeconds - elapsed);
      setSecondsLeft(left);
      if (left <= 10 && left > 0) playSound("tick");
      if (left <= 0 && !finishedSent.current) {
        finishedSent.current = true;
        playSound("end");
        void syncProgress("finish");
      }
    }, 100);
    return () => window.clearInterval(tick);
  }, [room?.status, room?.startedAt, room, loadProblem, syncProgress]);

  useEffect(() => {
    if (room?.status === "finished" && !finishedSent.current) {
      finishedSent.current = true;
      playSound("end");
    }
  }, [room?.status]);

  const handleRodsChange = useCallback(
    (next: RodState[]) => {
      if (room?.status !== "playing") return;
      if (countdown !== null && countdown > 0) return;
      playSound("bead");
      setRods(next);
      const current = problemRef.current;
      if (!current || solvedRef.current || !room) return;
      if (abacusValue(next) !== current.answer) return;

      solvedRef.current = true;
      const nextStreak = streakRef.current + 1;
      streakRef.current = nextStreak;
      const gained = scoreForSolve({
        difficulty: room.difficulty,
        elapsedMs: nowMs() - startedAt.current,
        streak: nextStreak,
      });
      const nextScore = scoreRef.current + gained;
      const nextSolved = solvedCountRef.current + 1;
      const nextIndex = problemIndexRef.current + 1;
      scoreRef.current = nextScore;
      solvedCountRef.current = nextSolved;
      setScore(nextScore);
      setSolved(nextSolved);
      setComboPoints(gained);
      setComboStreak(nextStreak);
      setFlash("ok");
      playSound("success");
      void syncProgress("progress");
      window.setTimeout(() => {
        setFlash(null);
        setComboPoints(null);
        loadProblem(room, nextIndex);
        void syncProgress("progress");
      }, 550);
    },
    [countdown, room, loadProblem, syncProgress],
  );

  function resetBoard() {
    setRods(emptyRods());
    setFlash("miss");
    playSound("clear");
    window.setTimeout(() => setFlash(null), 400);
  }

  function skipProblem() {
    if (!room || room.status !== "playing") return;
    if (countdown !== null && countdown > 0) return;
    const brokeStreak = streakRef.current > 0;
    streakRef.current = 0;
    playSound(brokeStreak ? "break" : "skip");
    const nextIndex = problemIndexRef.current + 1;
    loadProblem(room, nextIndex);
    void syncProgress("progress");
  }

  function resetLobby() {
    setRoom(null);
    setPlayerId(null);
    setError(null);
    setJoinCode("");
    setProblem(null);
    setScore(0);
    setSolved(0);
    setProblemIndex(0);
    setFlash(null);
    setCountdown(null);
    setComboPoints(null);
    setComboStreak(0);
    setRods(emptyRods());
    playingStarted.current = false;
    finishedSent.current = false;
    scoreRef.current = 0;
    solvedCountRef.current = 0;
    streakRef.current = 0;
    problemIndexRef.current = 0;
  }

  const winner =
    room?.status === "finished"
      ? [...room.players].sort((a, b) => b.score - a.score)[0]
      : null;
  const boardLocked = Boolean(countdown && countdown > 0);

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <HowToPlay />
      <CountdownOverlay value={countdown} />
      <ComboToast points={comboPoints} streak={comboStreak} />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/play" className="group">
          <p className="text-[11px] uppercase tracking-[0.35em] text-ash transition group-hover:text-paper">
            Soroban
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Race
          </h1>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openHowToPlay()}
            className="rounded-full border border-smoke bg-ink-soft/80 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ash transition hover:border-paper hover:text-paper"
          >
            How to
          </button>
          <SoundToggle />
          {room && (
            <div className="rounded-xl border border-smoke bg-ink-soft/80 px-3 py-2 font-mono text-sm">
              <span className="text-ash">room </span>
              <span className="text-amber">{room.code}</span>
            </div>
          )}
        </div>
      </header>

      {!room && (
        <section className="animate-rise mx-auto mt-8 w-full max-w-lg">
          <h2 className="text-center text-4xl font-semibold tracking-tight">
            {inviteMode ? (
              <>
                You’re invited.
                <span className="block text-lacquer">Enter and race.</span>
              </>
            ) : (
              <>
                Same beads.
                <span className="block text-lacquer">Faster hands win.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-center text-ash">
            {inviteMode
              ? `Room ${initialCode} is waiting. Add your name and join.`
              : "Create a room, share the code, and race the same seeded problems."}
          </p>
          <div className="mt-8 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={16}
              className="w-full rounded-full border border-smoke bg-ink-soft px-4 py-3 text-center outline-none focus:border-amber"
            />

            {inviteMode ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void joinRoom()}
                className="w-full rounded-full bg-lacquer px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white hover:bg-lacquer-deep disabled:opacity-60"
              >
                Join {initialCode}
              </button>
            ) : (
              <>
                <div className="flex flex-wrap justify-center gap-2">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={[
                        "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em]",
                        difficulty === level
                          ? "border-lacquer text-lacquer"
                          : "border-smoke text-ash",
                      ].join(" ")}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void createRoom()}
                  className="w-full rounded-full bg-lacquer px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white hover:bg-lacquer-deep disabled:opacity-60"
                >
                  Create room
                </button>
                <div className="flex gap-2">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ROOM CODE"
                    maxLength={5}
                    className="flex-1 rounded-full border border-smoke bg-ink-soft px-4 py-3 text-center font-mono tracking-[0.3em] outline-none focus:border-amber"
                  />
                  <button
                    type="button"
                    disabled={busy || joinCode.trim().length < 4}
                    onClick={() => void joinRoom()}
                    className="rounded-full border border-smoke px-5 py-3 text-sm uppercase tracking-[0.18em] text-paper hover:border-amber disabled:opacity-60"
                  >
                    Join
                  </button>
                </div>
              </>
            )}
            {error && <p className="text-center text-sm text-lacquer">{error}</p>}
          </div>
        </section>
      )}

      {room && room.status === "waiting" && (
        <section className="animate-rise mx-auto mt-10 w-full max-w-lg text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-ash">
            Lobby · {room.difficulty}
          </p>
          <p className="mt-3 font-mono text-5xl tracking-[0.2em] text-amber">
            {room.code}
          </p>
          <p className="mt-4 text-ash">Share this code with your rival.</p>
          <div className="mt-4 flex justify-center">
            <CopyInviteButton code={room.code} />
          </div>
          <ul className="mt-8 space-y-2">
            {room.players.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-smoke bg-ink-soft/60 px-4 py-3 font-mono text-sm"
              >
                {p.name}
                {p.id === room.hostId ? " · host" : ""}
                {p.id === playerId ? " · you" : ""}
              </li>
            ))}
          </ul>
          {isHost ? (
            <button
              type="button"
              disabled={busy || room.players.length < 2}
              onClick={() => void startRace()}
              className="mt-8 rounded-full bg-lacquer px-8 py-3 text-sm uppercase tracking-[0.2em] text-white disabled:opacity-50"
            >
              {room.players.length < 2 ? "Waiting for rival…" : "Start race"}
            </button>
          ) : (
            <p className="mt-8 text-sm text-ash">Waiting for host to start…</p>
          )}
          {error && <p className="mt-3 text-sm text-lacquer">{error}</p>}
        </section>
      )}

      {room && room.status === "playing" && problem && (
        <section className="animate-rise flex flex-1 flex-col items-center gap-5">
          <div className="grid w-full max-w-xl grid-cols-2 gap-3 font-mono text-sm">
            <PlayerCard
              label={me?.name ?? "You"}
              score={score}
              solved={solved}
              you
            />
            <PlayerCard
              label={rival?.name ?? "Rival"}
              score={rival?.score ?? 0}
              solved={rival?.solved ?? 0}
            />
          </div>
          <PaceMeter
            youSolved={solved}
            rivalSolved={rival?.solved ?? 0}
            youLabel={me?.name ?? "You"}
            rivalLabel={rival?.name ?? "Rival"}
          />
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-ash">
              {secondsLeft}s · problem {problemIndex + 1}
            </p>
            <p
              className={[
                "mt-2 font-mono text-4xl font-semibold sm:text-5xl",
                flash === "ok" ? "text-amber" : "text-paper",
              ].join(" ")}
            >
              {formatProblem(problem)}
            </p>
            <p className="mt-2 font-mono text-sm text-ash">
              reads{" "}
              <span className={matched ? "text-amber" : "text-paper"}>
                {value}
              </span>
            </p>
          </div>
          <AbacusBoard
            rods={rods}
            onChange={handleRodsChange}
            matched={matched}
            disabled={boardLocked}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetBoard}
              disabled={boardLocked}
              className="rounded-full border border-smoke px-4 py-2 text-sm text-ash hover:border-paper hover:text-paper disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={skipProblem}
              disabled={boardLocked}
              className="rounded-full border border-smoke px-4 py-2 text-sm text-ash hover:border-paper hover:text-paper disabled:opacity-40"
            >
              Skip
            </button>
          </div>
        </section>
      )}

      {room && room.status === "finished" && (
        <section className="animate-rise mx-auto mt-10 w-full max-w-lg text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-ash">
            Race over
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-amber">
            {winner?.id === playerId ? "You win" : `${winner?.name ?? "Rival"} wins`}
          </h2>
          <ul className="mt-8 space-y-2">
            {[...room.players]
              .sort((a, b) => b.score - a.score)
              .map((p, index) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-smoke bg-ink-soft/60 px-4 py-3 font-mono text-sm"
                >
                  <span className="text-ash">{index + 1}</span>
                  <span className="flex-1 truncate px-3 text-left text-paper">
                    {p.name}
                    {p.id === playerId ? " · you" : ""}
                  </span>
                  <span className="text-amber">{p.score}</span>
                </li>
              ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ShareScoreButton
              score={score}
              solved={solved}
              modeLabel={`Race ${room.code}`}
            />
            <button
              type="button"
              onClick={resetLobby}
              className="rounded-full border border-smoke px-6 py-3 text-sm uppercase tracking-[0.18em]"
            >
              New race
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function PlayerCard({
  label,
  score,
  solved,
  you,
}: {
  label: string;
  score: number;
  solved: number;
  you?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border px-3 py-3",
        you ? "border-lacquer/50 bg-ink-soft" : "border-smoke bg-ink-soft/50",
      ].join(" ")}
    >
      <p className="truncate text-[11px] uppercase tracking-[0.18em] text-ash">
        {label}
      </p>
      <p className="mt-1 text-xl text-paper">{score}</p>
      <p className="text-xs text-ash">{solved} solved</p>
    </div>
  );
}
