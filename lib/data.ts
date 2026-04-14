import fs from "fs";
import path from "path";
import { Team, Game, StandingRow } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const TEAMS_FILE = path.join(DATA_DIR, "teams.json");
const GAMES_FILE = path.join(DATA_DIR, "games.json");

export function readTeams(): Team[] {
  const raw = fs.readFileSync(TEAMS_FILE, "utf-8");
  return JSON.parse(raw) as Team[];
}

export function readGames(): Game[] {
  const raw = fs.readFileSync(GAMES_FILE, "utf-8");
  return JSON.parse(raw) as Game[];
}

export function writeTeams(teams: Team[]): void {
  fs.writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2), "utf-8");
}

export function writeGames(games: Game[]): void {
  fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2), "utf-8");
}

export function getTeamById(id: string): Team | undefined {
  return readTeams().find((t) => t.id === id);
}

export function computeStandings(): StandingRow[] {
  const teams = readTeams();
  const games = readGames();
  const completedGames = games.filter((g) => g.status === "completed");

  const stats = new Map<
    string,
    { wins: number; losses: number; ties: number; rs: number; ra: number }
  >();
  teams.forEach((t) =>
    stats.set(t.id, { wins: 0, losses: 0, ties: 0, rs: 0, ra: 0 })
  );

  completedGames.forEach((game) => {
    const home = stats.get(game.homeTeamId);
    const away = stats.get(game.awayTeamId);
    if (!home || !away) return;

    const hs = game.homeScore ?? 0;
    const as_ = game.awayScore ?? 0;

    home.rs += hs;
    home.ra += as_;
    away.rs += as_;
    away.ra += hs;

    if (hs > as_) {
      home.wins++;
      away.losses++;
    } else if (as_ > hs) {
      away.wins++;
      home.losses++;
    } else {
      home.ties++;
      away.ties++;
    }
  });

  const rows: StandingRow[] = teams.map((team) => {
    const s = stats.get(team.id)!;
    const gp = s.wins + s.losses + s.ties;
    const pts = s.wins * 2 + s.ties;
    const diff = s.rs - s.ra;
    const pct =
      gp === 0
        ? ".000"
        : (s.wins / gp).toFixed(3).replace(/^0/, "");
    return { rank: 0, team, gp, ...s, pts, diff, pct };
  });

  rows.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.diff !== a.diff) return b.diff - a.diff;
    return b.rs - a.rs;
  });

  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}
