import { promises as fs } from "fs";
import path from "path";
import {
  filterScoresByPeriod,
  type ScorePeriod,
} from "@/lib/score-period";
import type { Room, RoomPlayer, ScoreEntry } from "@/lib/types";

export type { Room, RoomPlayer, ScoreEntry };

type StoreShape = {
  scores: ScoreEntry[];
  rooms: Record<string, Room>;
};

const MAX_SCORES = 150;
const ROOM_TTL_MS = 1000 * 60 * 60;
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

type GlobalStore = {
  memory: StoreShape;
  writeQueue: Promise<void>;
};

function globalBag(): GlobalStore {
  const g = globalThis as typeof globalThis & { __sorobanStore?: GlobalStore };
  if (!g.__sorobanStore) {
    g.__sorobanStore = {
      memory: { scores: [], rooms: {} },
      writeQueue: Promise.resolve(),
    };
  }
  return g.__sorobanStore;
}

function hasUpstash() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

async function upstash<T>(
  command: (string | number)[],
): Promise<T | undefined> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return undefined;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Upstash error ${res.status}`);
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

async function ensureFileLoaded() {
  const bag = globalBag();
  if (bag.memory.scores.length || Object.keys(bag.memory.rooms).length) {
    return;
  }
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreShape;
    bag.memory = {
      scores: Array.isArray(parsed.scores) ? parsed.scores : [],
      rooms: parsed.rooms && typeof parsed.rooms === "object" ? parsed.rooms : {},
    };
  } catch {
    // first boot
  }
}

function enqueueWrite(mutate: (store: StoreShape) => void) {
  const bag = globalBag();
  bag.writeQueue = bag.writeQueue
    .then(async () => {
      mutate(bag.memory);
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(bag.memory), "utf8");
    })
    .catch(() => {
      // ignore disk errors on read-only hosts; memory still works
    });
  return bag.writeQueue;
}

function pruneRooms(rooms: Record<string, Room>) {
  const now = Date.now();
  for (const [code, room] of Object.entries(rooms)) {
    if (now - room.createdAt > ROOM_TTL_MS) {
      delete rooms[code];
    }
  }
}

export async function listScores(
  period: ScorePeriod = "all",
): Promise<ScoreEntry[]> {
  let scores: ScoreEntry[] = [];
  if (hasUpstash()) {
    const raw = await upstash<string | null>(["GET", "soroban:scores"]);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ScoreEntry[];
        scores = Array.isArray(parsed) ? parsed : [];
      } catch {
        scores = [];
      }
    }
  } else {
    await ensureFileLoaded();
    scores = [...globalBag().memory.scores];
  }

  return filterScoresByPeriod(scores, period).sort(
    (a, b) => b.score - a.score || a.createdAt - b.createdAt,
  );
}

export async function addScore(
  entry: Omit<ScoreEntry, "id" | "createdAt">,
): Promise<ScoreEntry[]> {
  const next: ScoreEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };

  if (hasUpstash()) {
    const current = await listScores();
    const ranked = [...current, next]
      .sort((a, b) => b.score - a.score || a.createdAt - b.createdAt)
      .slice(0, MAX_SCORES);
    await upstash(["SET", "soroban:scores", JSON.stringify(ranked)]);
    return ranked;
  }

  await ensureFileLoaded();
  await enqueueWrite((store) => {
    store.scores = [...store.scores, next]
      .sort((a, b) => b.score - a.score || a.createdAt - b.createdAt)
      .slice(0, MAX_SCORES);
  });
  return listScores();
}

export async function getRoom(code: string): Promise<Room | null> {
  const key = code.toUpperCase();
  if (hasUpstash()) {
    const raw = await upstash<string | null>(["GET", `soroban:room:${key}`]);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Room;
    } catch {
      return null;
    }
  }
  await ensureFileLoaded();
  pruneRooms(globalBag().memory.rooms);
  return globalBag().memory.rooms[key] ?? null;
}

export async function saveRoom(room: Room): Promise<Room> {
  const key = room.code.toUpperCase();
  room.code = key;
  if (hasUpstash()) {
    await upstash([
      "SET",
      `soroban:room:${key}`,
      JSON.stringify(room),
      "EX",
      3600,
    ]);
    return room;
  }
  await ensureFileLoaded();
  await enqueueWrite((store) => {
    pruneRooms(store.rooms);
    store.rooms[key] = room;
  });
  return room;
}

export function newPlayerId() {
  return `p_${Math.random().toString(36).slice(2, 10)}`;
}

export function newRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
