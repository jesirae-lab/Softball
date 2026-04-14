import { readTeams, readGames, computeStandings, formatDate, formatTime } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function TeamsPage() {
  const teams = readTeams();
  const games = readGames();
  const standings = computeStandings();

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {teams.length} teams &mdash; Co-Ed Softball 2026
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {standings.map((row) => {
          const teamGames = games
            .filter(
              (g) =>
                g.homeTeamId === row.team.id || g.awayTeamId === row.team.id
            )
            .sort((a, b) =>
              (a.date + a.time).localeCompare(b.date + b.time)
            );

          const nextGame = teamGames.find(
            (g) => g.status === "scheduled" && g.date >= today
          );
          const nextOpponent = nextGame
            ? teams.find(
                (t) =>
                  t.id ===
                  (nextGame.homeTeamId === row.team.id
                    ? nextGame.awayTeamId
                    : nextGame.homeTeamId)
              )
            : null;

          return (
            <div key={row.team.id} className="card overflow-hidden">
              {/* Team header */}
              <div
                className="px-6 py-5"
                style={{
                  background: `linear-gradient(135deg, ${row.team.color}22, ${row.team.color}08)`,
                  borderLeft: `4px solid ${row.team.color}`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: row.team.color }}
                      />
                      <h2 className="font-bold text-lg text-gray-900">
                        {row.team.name}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Manager: {row.team.managerName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {row.team.players} players
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">
                      #{row.rank}
                    </div>
                    <div className="text-xs text-gray-500">Rank</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-4 gap-2 text-center mb-4">
                  <div>
                    <div className="text-xl font-bold text-green-700">
                      {row.wins}
                    </div>
                    <div className="text-xs text-gray-500">W</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-600">
                      {row.losses}
                    </div>
                    <div className="text-xs text-gray-500">L</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-600">
                      {row.ties}
                    </div>
                    <div className="text-xs text-gray-500">T</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#1e3a5f]">
                      {row.pts}
                    </div>
                    <div className="text-xs text-gray-500">PTS</div>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  <span>
                    RS: <strong>{row.rs}</strong>
                  </span>
                  <span>
                    RA: <strong>{row.ra}</strong>
                  </span>
                  <span>
                    DIFF:{" "}
                    <strong
                      className={
                        row.diff > 0
                          ? "text-green-700"
                          : row.diff < 0
                          ? "text-red-600"
                          : ""
                      }
                    >
                      {row.diff > 0 ? "+" : ""}
                      {row.diff}
                    </strong>
                  </span>
                </div>

                {nextGame && nextOpponent && (
                  <div className="mt-3 text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2">
                    <span className="font-medium text-blue-700">Next:</span>{" "}
                    {formatDate(nextGame.date)} vs{" "}
                    <span
                      className="font-semibold"
                      style={{ color: nextOpponent.color }}
                    >
                      {nextOpponent.name}
                    </span>{" "}
                    &middot; {nextGame.field}
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                <span className="font-medium">Contact:</span>{" "}
                <a
                  href={`mailto:${row.team.contactEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {row.team.contactEmail}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
