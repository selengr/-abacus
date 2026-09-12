import { NextResponse } from "next/server";
import { isScorePeriod } from "@/lib/score-period";
import { addScore, listScores } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodRaw = searchParams.get("period") ?? "all";
  const period = isScorePeriod(periodRaw) ? periodRaw : "all";
  const scores = await listScores(period);
  return NextResponse.json(scores.slice(0, 20));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as {
    name?: string;
    score?: number;
    difficulty?: string;
    solved?: number;
  };

  const name = (data.name ?? "Player").trim().slice(0, 16) || "Player";
  const score = Number(data.score);
  const solved = Number(data.solved ?? 0);
  const difficulty = String(data.difficulty ?? "easy").slice(0, 16);

  if (!Number.isFinite(score) || score < 0 || score > 1_000_000) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }
  if (!Number.isFinite(solved) || solved < 0 || solved > 10_000) {
    return NextResponse.json({ error: "Invalid solved count" }, { status: 400 });
  }

  const ranked = await addScore({ name, score, difficulty, solved });
  return NextResponse.json(ranked.slice(0, 20));
}
