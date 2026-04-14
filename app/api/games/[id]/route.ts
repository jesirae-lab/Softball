import { NextRequest, NextResponse } from "next/server";
import { readGames, writeGames } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const games = readGames();
    const idx = games.findIndex((g) => g.id === id);

    if (idx === -1) {
      return NextResponse.json(
        { ok: false, error: "Game not found" },
        { status: 404 }
      );
    }

    const existing = games[idx];

    // Merge only allowed fields
    const updated = {
      ...existing,
      ...(body.date !== undefined && { date: body.date }),
      ...(body.time !== undefined && { time: body.time }),
      ...(body.field !== undefined && { field: body.field }),
      ...(body.homeTeamId !== undefined && { homeTeamId: body.homeTeamId }),
      ...(body.awayTeamId !== undefined && { awayTeamId: body.awayTeamId }),
      ...(body.status !== undefined && { status: body.status }),
      ...("homeScore" in body && { homeScore: body.homeScore }),
      ...("awayScore" in body && { awayScore: body.awayScore }),
    };

    if (updated.homeTeamId === updated.awayTeamId) {
      return NextResponse.json(
        { ok: false, error: "Home and away teams must differ" },
        { status: 400 }
      );
    }

    games[idx] = updated;
    writeGames(games);
    return NextResponse.json({ ok: true, data: updated });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const games = readGames();
    const idx = games.findIndex((g) => g.id === id);

    if (idx === -1) {
      return NextResponse.json(
        { ok: false, error: "Game not found" },
        { status: 404 }
      );
    }

    games.splice(idx, 1);
    writeGames(games);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
