import { readGames, readTeams, formatDate, formatTime } from "@/lib/data";
import GameCard from "@/components/GameCard";

export const dynamic = "force-dynamic";

export default function SchedulePage() {
  const games = readGames();
  const teams = readTeams();

  // Group games by date
  const byDate = new Map<string, typeof games>();
  const sorted = [...games].sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );
  for (const game of sorted) {
    if (!byDate.has(game.date)) byDate.set(game.date, []);
    byDate.get(game.date)!.push(game);
  }

  const today = new Date().toISOString().split("T")[0];
  const completedCount = games.filter((g) => g.status === "completed").length;
  const scheduledCount = games.filter((g) => g.status === "scheduled").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Season Schedule</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {completedCount} games played &middot; {scheduledCount} remaining
        </p>
      </div>

      {/* Team filter legend */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          {teams.map((t) => (
            <div key={t.id} className="flex items-center gap-1.5 text-sm">
              <span
                className="w-3 h-3 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: t.color }}
              />
              <span className="font-medium">{t.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {Array.from(byDate.entries()).map(([date, dayGames]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="font-semibold text-gray-800">{formatDate(date)}</h2>
              {date === today && (
                <span className="badge bg-amber-100 text-amber-700">Today</span>
              )}
              {date < today && dayGames.every((g) => g.status === "completed") && (
                <span className="badge bg-green-100 text-green-700">
                  Completed
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dayGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  teams={teams}
                  showDate={false}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
