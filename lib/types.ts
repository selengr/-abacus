import type { Difficulty } from "@/lib/abacus";

export type ScoreEntry = {
  id: string;
  name: string;
  score: number;
  difficulty: string;
  solved: number;
  createdAt: number;
};

export type RoomPlayer = {
  id: string;
  name: string;
  score: number;
  solved: number;
  problemIndex: number;
  ready: boolean;
  finished: boolean;
};

export type RoomStatus = "waiting" | "playing" | "finished";

export type Room = {
  code: string;
  difficulty: Difficulty;
  seed: number;
  status: RoomStatus;
  hostId: string;
  players: RoomPlayer[];
  createdAt: number;
  startedAt?: number;
  roundSeconds: number;
};
