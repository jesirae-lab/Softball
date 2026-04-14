import { NextRequest, NextResponse } from "next/server";
import { readTeams } from "@/lib/data";
import { sendLeagueEmail } from "@/lib/email";
import { EmailRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: EmailRequest = await req.json();
    const { to, subject, message } = body;

    if (!to) {
      return NextResponse.json(
        { ok: false, error: "Recipient is required" },
        { status: 400 }
      );
    }
    if (!subject?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Subject is required" },
        { status: 400 }
      );
    }
    if (!message?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const teams = readTeams();

    // Validate team id if targeting a specific team
    if (to !== "all") {
      const team = teams.find((t) => t.id === to);
      if (!team) {
        return NextResponse.json(
          { ok: false, error: "Team not found" },
          { status: 404 }
        );
      }
    }

    const result = await sendLeagueEmail(body, teams);
    return NextResponse.json({ ok: true, data: result });
  } catch (e: unknown) {
    console.error("Email error:", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
