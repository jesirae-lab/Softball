export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  contactEmail: string;
  managerName: string;
  players: number;
}

export type GameStatus = "scheduled" | "completed" | "cancelled";

export interface Game {
  id: string;
  date: string;       // "YYYY-MM-DD"
  time: string;       // "HH:MM" 24-hour
  field: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: GameStatus;
}

export interface StandingRow {
  rank: number;
  team: Team;
  gp: number;
  wins: number;
  losses: number;
  ties: number;
  pts: number;
  rs: number;   // runs scored
  ra: number;   // runs allowed
  diff: number; // run differential
  pct: string;  // win percentage string
}

export interface EmailRequest {
  to: "all" | string; // "all" or team id
  subject: string;
  message: string;
  senderName?: string;
}

export interface ApiResponse<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}
