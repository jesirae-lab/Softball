import { StandingRow } from "@/lib/types";

interface Props {
  standings: StandingRow[];
  compact?: boolean;
}

export default function StandingsTable({ standings, compact = false }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#1e3a5f] text-white text-xs uppercase tracking-wider">
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Team</th>
            <th className="px-4 py-3 text-center">GP</th>
            <th className="px-4 py-3 text-center">W</th>
            <th className="px-4 py-3 text-center">L</th>
            {!compact && <th className="px-4 py-3 text-center">T</th>}
            <th className="px-4 py-3 text-center">PTS</th>
            {!compact && <th className="px-4 py-3 text-center">RS</th>}
            {!compact && <th className="px-4 py-3 text-center">RA</th>}
            <th className="px-4 py-3 text-center">DIFF</th>
            {!compact && <th className="px-4 py-3 text-center">PCT</th>}
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr
              key={row.team.id}
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              <td className="px-4 py-3 font-bold text-gray-500">{row.rank}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: row.team.color }}
                  />
                  <span className="font-semibold text-gray-900">
                    {row.team.name}
                  </span>
                  <span className="hidden sm:inline text-xs text-gray-400">
                    {row.team.shortName}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center text-gray-600">{row.gp}</td>
              <td className="px-4 py-3 text-center font-semibold text-green-700">
                {row.wins}
              </td>
              <td className="px-4 py-3 text-center font-semibold text-red-600">
                {row.losses}
              </td>
              {!compact && (
                <td className="px-4 py-3 text-center text-gray-600">
                  {row.ties}
                </td>
              )}
              <td className="px-4 py-3 text-center">
                <span className="font-bold text-[#1e3a5f]">{row.pts}</span>
              </td>
              {!compact && (
                <td className="px-4 py-3 text-center text-gray-600">
                  {row.rs}
                </td>
              )}
              {!compact && (
                <td className="px-4 py-3 text-center text-gray-600">
                  {row.ra}
                </td>
              )}
              <td className="px-4 py-3 text-center">
                <span
                  className={`font-medium ${
                    row.diff > 0
                      ? "text-green-700"
                      : row.diff < 0
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {row.diff > 0 ? `+${row.diff}` : row.diff}
                </span>
              </td>
              {!compact && (
                <td className="px-4 py-3 text-center text-gray-600">
                  {row.pct}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
        PTS: Win=2, Tie=1, Loss=0 &nbsp;|&nbsp; Tiebreaker: Run Differential
      </div>
    </div>
  );
}
