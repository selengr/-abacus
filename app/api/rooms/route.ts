import { NextResponse } from "next/server";
import { ROUND_SECONDS, type Difficulty } from "@/lib/abacus";
import { randomSeed } from "@/lib/rng";
import {
  newPlayerId,
  newRoomCode,
  saveRoom,
  type Room,
  type RoomPlayer,
} from "@/lib/server-store";

export const dynamic = "force-dynamic";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as { name?: string; difficulty?: string };
  const name = (data.name ?? "Host").trim().slice(0, 16) || "Host";
  const difficulty = DIFFICULTIES.includes(data.difficulty as Difficulty)
    ? (data.difficulty as Difficulty)
    : "easy";

  const hostId = newPlayerId();
  const host: RoomPlayer = {
    id: hostId,
    name,
    score: 0,
    solved: 0,
    problemIndex: 0,
    ready: true,
    finished: false,
  };

  const room: Room = {
    code: newRoomCode(),
    difficulty,
    seed: randomSeed(),
    status: "waiting",
    hostId,
    players: [host],
    createdAt: Date.now(),
    roundSeconds: ROUND_SECONDS,
  };

  await saveRoom(room);
  return NextResponse.json({ room, playerId: hostId });
}
