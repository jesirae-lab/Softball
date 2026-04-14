import { NextRequest, NextResponse } from "next/server";
import { readGames, writeGames } from "@/lib/data";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const games = readGames();
    return NextResponse.json({ ok: true, data: games });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, time, field, homeTeamId, awayTeamId } = body;

    if (!date || !time || !homeTeamId || !awayTeamId) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (homeTeamId === awayTeamId) {
      return NextResponse.json(
        { ok: false, error: "Home and away teams must differ" },
        { status: 400 }
      );
    }

    const games = readGames();
    const newGame = {
      id: `game-${uuidv4().slice(0, 8)}`,
      date,
      time,
      field: field ?? "Field 1",
      homeTeamId,
      awayTeamId,
      homeScore: null,
      awayScore: null,
      status: "scheduled" as const,
    };
    games.push(newGame);
    writeGames(games);
    return NextResponse.json({ ok: true, data: newGame }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
