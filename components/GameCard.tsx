import { Game, Team } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/data";

interface Props {
  game: Game;
  teams: Team[];
  showDate?: boolean;
}

function getTeam(teams: Team[], id: string): Team {
  return (
    teams.find((t) => t.id === id) ?? {
      id,
      name: "Unknown",
      shortName: "UNK",
      color: "#9ca3af",
      contactEmail: "",
      managerName: "",
      players: 0,
    }
  );
}

export default function GameCard({ game, teams, showDate = true }: Props) {
  const home = getTeam(teams, game.homeTeamId);
  const away = getTeam(teams, game.awayTeamId);
  const isCompleted = game.status === "completed";
  const isCancelled = game.status === "cancelled";

  const homeWon =
    isCompleted &&
    game.homeScore !== null &&
    game.awayScore !== null &&
    game.homeScore > game.awayScore;
  const awayWon =
    isCompleted &&
    game.homeScore !== null &&
    game.awayScore !== null &&
    game.awayScore > game.homeScore;

  return (
    <div
      className={`card p-4 ${
        isCancelled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Meta */}
        <div className="shrink-0 text-xs text-gray-500 w-28">
          {showDate && (
            <div className="font-medium text-gray-700">
              {formatDate(game.date)}
            </div>
          )}
          <div>{formatTime(game.time)}</div>
          <div className="mt-1">{game.field}</div>
          {isCancelled && (
            <span className="badge bg-red-100 text-red-700 mt-1">
              Cancelled
            </span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="flex-1 min-w-0">
          {/* Away */}
          <div
            className={`flex items-center justify-between py-1 ${
              awayWon ? "font-bold" : ""
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: away.color }}
              />
              <span className="truncate text-sm">{away.name}</span>
              <span className="text-xs text-gray-400 shrink-0">(Away)</span>
            </div>
            {isCompleted && game.awayScore !== null && (
              <span
                className={`ml-2 text-lg tabular-nums shrink-0 ${
                  awayWon ? "text-green-700" : "text-gray-500"
                }`}
              >
                {game.awayScore}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* Home */}
          <div
            className={`flex items-center justify-between py-1 ${
              homeWon ? "font-bold" : ""
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: home.color }}
              />
              <span className="truncate text-sm">{home.name}</span>
              <span className="text-xs text-gray-400 shrink-0">(Home)</span>
            </div>
            {isCompleted && game.homeScore !== null && (
              <span
                className={`ml-2 text-lg tabular-nums shrink-0 ${
                  homeWon ? "text-green-700" : "text-gray-500"
                }`}
              >
                {game.homeScore}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {!isCompleted && !isCancelled && (
            <span className="badge bg-blue-100 text-blue-700">Upcoming</span>
          )}
          {isCompleted && (
            <span className="badge bg-green-100 text-green-700">Final</span>
          )}
        </div>
      </div>
    </div>
  );
}
