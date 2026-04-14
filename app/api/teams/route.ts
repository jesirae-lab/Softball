import { NextResponse } from "next/server";
import { readTeams } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const teams = readTeams();
    return NextResponse.json({ ok: true, data: teams });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to read teams" },
      { status: 500 }
    );
  }
}
