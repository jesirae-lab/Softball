import Link from "next/link";
import { computeStandings, readGames, readTeams, formatDate, formatTime } from "@/lib/data";
import StandingsTable from "@/components/StandingsTable";
import GameCard from "@/components/GameCard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const standings = computeStandings();
  const games = readGames();
  const teams = readTeams();

  const today = new Date().toISOString().split("T")[0];

  const upcoming = games
    .filter((g) => g.status === "scheduled" && g.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);

  const recent = games
    .filter((g) => g.status === "completed")
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 4);

  const leader = standings[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] rounded-2xl text-white p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Co-Ed Softball 2026</h1>
            <p className="text-blue-200 mt-1">
              Recreation League &mdash; Spring Season
            </p>
            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <div className="text-blue-300 text-xs uppercase tracking-wide">
                  Teams
                </div>
                <div className="font-bold text-xl">{teams.length}</div>
              </div>
              <div>
                <div className="text-blue-300 text-xs uppercase tracking-wide">
                  Games Played
                </div>
                <div className="font-bold text-xl">
                  {games.filter((g) => g.status === "completed").length}
                </div>
              </div>
              <div>
                <div className="text-blue-300 text-xs uppercase tracking-wide">
                  Remaining
                </div>
                <div className="font-bold text-xl">
                  {games.filter((g) => g.status === "scheduled").length}
                </div>
              </div>
            </div>
          </div>
          {leader && (
            <div className="bg-white/15 rounded-xl px-6 py-4 text-center">
              <div className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                Current Leader
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span
                  className="w-4 h-4 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: leader.team.color }}
                />
                <span className="font-bold text-lg">{leader.team.name}</span>
              </div>
              <div className="text-blue-200 text-sm mt-1">
                {leader.wins}W – {leader.losses}L &nbsp;|&nbsp; {leader.pts} pts
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Standings */}
        <div className="xl:col-span-2">
          <div className="card overflow-hidden">
            <div className="card-header flex items-center justify-between">
              <span>League Standings</span>
              <Link href="/schedule" className="text-sm text-blue-600 hover:underline font-normal">
                Full schedule →
              </Link>
            </div>
            <StandingsTable standings={standings} />
          </div>
        </div>

        {/* Upcoming Games */}
        <div className="space-y-6">
          <div className="card overflow-hidden">
            <div className="card-header flex items-center justify-between">
              <span>Upcoming Games</span>
              <Link href="/schedule" className="text-sm text-blue-600 hover:underline font-normal">
                All →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {upcoming.length === 0 && (
                <p className="px-4 py-6 text-center text-gray-500 text-sm">
                  No upcoming games
                </p>
              )}
              {upcoming.map((game) => (
                <div key={game.id} className="px-4 py-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    {formatDate(game.date)} &middot; {formatTime(game.time)} &middot; {game.field}
                  </div>
                  {[game.awayTeamId, game.homeTeamId].map((tid, idx) => {
                    const t = teams.find((x) => x.id === tid);
                    return t ? (
                      <div key={tid} className="flex items-center gap-2 py-0.5 text-sm">
                        <span
                          className="w-2 h-2 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: t.color }}
                        />
                        <span>{t.name}</span>
                        <span className="text-xs text-gray-400">
                          {idx === 0 ? "Away" : "Home"}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Results */}
          <div className="card overflow-hidden">
            <div className="card-header">Recent Results</div>
            <div className="divide-y divide-gray-100">
              {recent.length === 0 && (
                <p className="px-4 py-6 text-center text-gray-500 text-sm">
                  No results yet
                </p>
              )}
              {recent.map((game) => {
                const home = teams.find((t) => t.id === game.homeTeamId);
                const away = teams.find((t) => t.id === game.awayTeamId);
                const homeWon =
                  (game.homeScore ?? 0) > (game.awayScore ?? 0);
                return (
                  <div key={game.id} className="px-4 py-3 text-sm">
                    <div className="text-xs text-gray-400 mb-1">
                      {formatDate(game.date)}
                    </div>
                    <div
                      className={`flex justify-between ${
                        homeWon ? "" : "font-semibold"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: away?.color }}
                        />
                        {away?.name}
                      </div>
                      <span className={homeWon ? "text-gray-500" : "text-green-700"}>
                        {game.awayScore}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between mt-0.5 ${
                        homeWon ? "font-semibold" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: home?.color }}
                        />
                        {home?.name}
                      </div>
                      <span className={homeWon ? "text-green-700" : "text-gray-500"}>
                        {game.homeScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
