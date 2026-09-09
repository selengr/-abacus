import { NextResponse } from "next/server";
import {
  getRoom,
  newPlayerId,
  saveRoom,
  type Room,
  type RoomPlayer,
} from "@/lib/server-store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ code: string }> };

function publicRoom(room: Room) {
  return {
    code: room.code,
    difficulty: room.difficulty,
    seed: room.seed,
    status: room.status,
    hostId: room.hostId,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      solved: p.solved,
      problemIndex: p.problemIndex,
      ready: p.ready,
      finished: p.finished,
    })),
    createdAt: room.createdAt,
    startedAt: room.startedAt,
    roundSeconds: room.roundSeconds,
  };
}

function maybeFinish(room: Room) {
  if (room.status !== "playing" || !room.startedAt) return;
  const elapsed = Date.now() - room.startedAt;
  const timedOut = elapsed >= room.roundSeconds * 1000;
  const allDone = room.players.every((p) => p.finished);
  if (timedOut || allDone) {
    room.status = "finished";
    for (const player of room.players) {
      player.finished = true;
    }
  }
}

export async function GET(_request: Request, context: Ctx) {
  const { code } = await context.params;
  const room = await getRoom(code);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  maybeFinish(room);
  if (room.status === "finished") {
    await saveRoom(room);
  }
  return NextResponse.json({ room: publicRoom(room) });
}

export async function POST(request: Request, context: Ctx) {
  const { code } = await context.params;
  const room = await getRoom(code);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.status !== "waiting") {
    return NextResponse.json({ error: "Race already started" }, { status: 409 });
  }
  if (room.players.length >= 2) {
    return NextResponse.json({ error: "Room is full" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const data = body as { name?: string };
  const name = (data.name ?? "Rival").trim().slice(0, 16) || "Rival";
  const playerId = newPlayerId();
  const guest: RoomPlayer = {
    id: playerId,
    name,
    score: 0,
    solved: 0,
    problemIndex: 0,
    ready: true,
    finished: false,
  };
  room.players.push(guest);
  await saveRoom(room);
  return NextResponse.json({ room: publicRoom(room), playerId });
}

export async function PATCH(request: Request, context: Ctx) {
  const { code } = await context.params;
  const room = await getRoom(code);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as {
    playerId?: string;
    action?: "start" | "progress" | "finish";
    score?: number;
    solved?: number;
    problemIndex?: number;
  };

  const playerId = String(data.playerId ?? "");
  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return NextResponse.json({ error: "Unknown player" }, { status: 403 });
  }

  if (data.action === "start") {
    if (playerId !== room.hostId) {
      return NextResponse.json({ error: "Only host can start" }, { status: 403 });
    }
    if (room.players.length < 2) {
      return NextResponse.json({ error: "Need two players" }, { status: 400 });
    }
    if (room.status === "waiting") {
      room.status = "playing";
      room.startedAt = Date.now();
    }
  }

  if (data.action === "progress" && room.status === "playing") {
    if (typeof data.score === "number" && Number.isFinite(data.score)) {
      player.score = Math.max(0, Math.min(1_000_000, Math.floor(data.score)));
    }
    if (typeof data.solved === "number" && Number.isFinite(data.solved)) {
      player.solved = Math.max(0, Math.min(10_000, Math.floor(data.solved)));
    }
    if (
      typeof data.problemIndex === "number" &&
      Number.isFinite(data.problemIndex)
    ) {
      player.problemIndex = Math.max(
        0,
        Math.min(10_000, Math.floor(data.problemIndex)),
      );
    }
  }

  if (data.action === "finish") {
    player.finished = true;
    if (typeof data.score === "number" && Number.isFinite(data.score)) {
      player.score = Math.max(0, Math.min(1_000_000, Math.floor(data.score)));
    }
    if (typeof data.solved === "number" && Number.isFinite(data.solved)) {
      player.solved = Math.max(0, Math.min(10_000, Math.floor(data.solved)));
    }
  }

  maybeFinish(room);
  await saveRoom(room);
  return NextResponse.json({ room: publicRoom(room) });
}
