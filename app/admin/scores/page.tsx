"use client";

import { useState, useEffect, useCallback } from "react";
import { Game, Team } from "@/lib/types";

type GameWithTeams = Game & { homeTeam: Team; awayTeam: Team };

export default function AdminScoresPage() {
  const [games, setGames] = useState<GameWithTeams[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filter, setFilter] = useState<"all" | "needs_score" | "completed">("all");

  const load = useCallback(async () => {
    setLoading(true);
    const [gRes, tRes] = await Promise.all([
      fetch("/api/games"),
      fetch("/api/teams"),
    ]);
    const gData = await gRes.json();
    const tData = await tRes.json();

    const teamsMap = new Map<string, Team>(
      (tData.data as Team[]).map((t) => [t.id, t])
    );

    const enriched: GameWithTeams[] = (gData.data as Game[])
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
      .map((g) => ({
        ...g,
        homeTeam: teamsMap.get(g.homeTeamId)!,
        awayTeam: teamsMap.get(g.awayTeamId)!,
      }));

    setGames(enriched);
    setTeams(tData.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (game: GameWithTeams) => {
    setEditId(game.id);
    setHomeScore(game.homeScore?.toString() ?? "");
    setAwayScore(game.awayScore?.toString() ?? "");
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setHomeScore("");
    setAwayScore("");
  };

  const saveScore = async (gameId: string) => {
    const hs = parseInt(homeScore);
    const as_ = parseInt(awayScore);
    if (isNaN(hs) || isNaN(as_) || hs < 0 || as_ < 0) {
      setMessage({ type: "error", text: "Please enter valid scores (0 or more)." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeScore: hs,
          awayScore: as_,
          status: "completed",
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to save");
      setMessage({ type: "success", text: "Score saved!" });
      setEditId(null);
      await load();
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Error saving score" });
    } finally {
      setSaving(false);
    }
  };

  const markScheduled = async (gameId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeScore: null, awayScore: null, status: "scheduled" }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const filtered = games.filter((g) => {
    if (filter === "needs_score")
      return g.status === "scheduled" && g.date < new Date().toISOString().split("T")[0];
    if (filter === "completed") return g.status === "completed";
    return true;
  });

  function formatDateShort(d: string) {
    const [y, m, day] = d.split("-");
    return `${m}/${day}/${y}`;
  }
  function formatTime12(t: string) {
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">
          ← Admin
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Update Scores</h1>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "needs_score", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            {f === "all" ? "All Games" : f === "needs_score" ? "Needs Score" : "Completed"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-gray-500">
              No games match this filter
            </div>
          )}
          {filtered.map((game) => (
            <div key={game.id} className="card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Date/field */}
                <div className="shrink-0 text-xs text-gray-500 min-w-[120px]">
                  <div className="font-semibold text-gray-700">
                    {formatDateShort(game.date)}
                  </div>
                  <div>{formatTime12(game.time)}</div>
                  <div>{game.field}</div>
                </div>

                {/* Matchup */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: game.awayTeam?.color }}
                    />
                    <span className="font-medium">{game.awayTeam?.name}</span>
                    <span className="text-gray-400 text-xs">(Away)</span>
                    <span className="mx-2 text-gray-300">vs</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: game.homeTeam?.color }}
                    />
                    <span className="font-medium">{game.homeTeam?.name}</span>
                    <span className="text-gray-400 text-xs">(Home)</span>
                  </div>

                  {game.status === "completed" && editId !== game.id && (
                    <div className="mt-1 text-sm font-semibold text-gray-700">
                      Score:{" "}
                      <span style={{ color: game.awayTeam?.color }}>
                        {game.awayTeam?.shortName} {game.awayScore}
                      </span>{" "}
                      –{" "}
                      <span style={{ color: game.homeTeam?.color }}>
                        {game.homeTeam?.shortName} {game.homeScore}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2">
                  {editId === game.id ? (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <div>
                          <label className="text-xs text-gray-500 block">
                            {game.awayTeam?.shortName}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={awayScore}
                            onChange={(e) => setAwayScore(e.target.value)}
                            className="form-input w-16 text-center"
                            placeholder="0"
                          />
                        </div>
                        <span className="text-gray-400 mt-4">–</span>
                        <div>
                          <label className="text-xs text-gray-500 block">
                            {game.homeTeam?.shortName}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={homeScore}
                            onChange={(e) => setHomeScore(e.target.value)}
                            className="form-input w-16 text-center"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => saveScore(game.id)}
                        disabled={saving}
                        className="btn-primary text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(game)}
                        className="btn-primary text-sm"
                      >
                        {game.status === "completed" ? "Edit Score" : "Enter Score"}
                      </button>
                      {game.status === "completed" && (
                        <button
                          onClick={() => markScheduled(game.id)}
                          className="btn-secondary text-sm"
                          title="Mark as not played (remove score)"
                        >
                          Reset
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
