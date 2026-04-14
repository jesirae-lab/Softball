"use client";

import { useState, useEffect, useCallback } from "react";
import { Game, Team } from "@/lib/types";

type GameWithTeams = Game & { homeTeam: Team; awayTeam: Team };

const FIELDS = ["Field 1", "Field 2", "Field 3"];

export default function AdminSchedulePage() {
  const [games, setGames] = useState<GameWithTeams[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const emptyForm = {
    date: "",
    time: "18:30",
    field: "Field 1",
    homeTeamId: "",
    awayTeamId: "",
  };
  const [form, setForm] = useState(emptyForm);

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
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
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

  const setField = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const startEdit = (game: GameWithTeams) => {
    setEditId(game.id);
    setForm({
      date: game.date,
      time: game.time,
      field: game.field,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
    });
    setShowAdd(false);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const validateForm = (): string | null => {
    if (!form.date) return "Please select a date.";
    if (!form.time) return "Please enter a time.";
    if (!form.homeTeamId || !form.awayTeamId)
      return "Please select both teams.";
    if (form.homeTeamId === form.awayTeamId)
      return "Home and away teams must be different.";
    return null;
  };

  const addGame = async () => {
    const err = validateForm();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "scheduled" }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setMessage({ type: "success", text: "Game added!" });
      setShowAdd(false);
      setForm(emptyForm);
      await load();
    } catch (e: unknown) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Error adding game",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    const err = validateForm();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/games/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setMessage({ type: "success", text: "Game updated!" });
      cancelEdit();
      await load();
    } catch (e: unknown) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Error updating game",
      });
    } finally {
      setSaving(false);
    }
  };

  const cancelGame = async (gameId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const restoreGame = async (gameId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "scheduled" }),
      });
      await res.json();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const deleteGame = async (gameId: string) => {
    if (!confirm("Delete this game permanently?")) return;
    setDeleting(gameId);
    try {
      const res = await fetch(`/api/games/${gameId}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      await load();
    } finally {
      setDeleting(null);
    }
  };

  function formatDateShort(d: string) {
    const [y, m, day] = d.split("-");
    return `${m}/${day}/${y}`;
  }
  function formatTime12(t: string) {
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${
      h >= 12 ? "PM" : "AM"
    }`;
  }

  const GameForm = ({ onSave, onCancel, label }: { onSave: () => void; onCancel: () => void; label: string }) => (
    <div className="card p-5 border-2 border-blue-200 bg-blue-50/30">
      <h3 className="font-semibold text-gray-800 mb-4">{label}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setField("date", e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Time</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => setField("time", e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Field</label>
          <select
            value={form.field}
            onChange={(e) => setField("field", e.target.value)}
            className="form-input"
          >
            {FIELDS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Away Team</label>
          <select
            value={form.awayTeamId}
            onChange={(e) => setField("awayTeamId", e.target.value)}
            className="form-input"
          >
            <option value="">Select team…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Home Team</label>
          <select
            value={form.homeTeamId}
            onChange={(e) => setField("homeTeamId", e.target.value)}
            className="form-input"
          >
            <option value="">Select team…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {message && (
        <p className="mt-3 text-sm text-red-700">{message.text}</p>
      )}
      <div className="flex gap-2 mt-4">
        <button onClick={onSave} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : label}
        </button>
        <button onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-gray-400 hover:text-gray-600">
            ← Admin
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Manage Schedule</h1>
        </div>
        {!showAdd && editId === null && (
          <button
            onClick={() => {
              setShowAdd(true);
              setMessage(null);
            }}
            className="btn-primary"
          >
            + Add Game
          </button>
        )}
      </div>

      {message && editId === null && !showAdd && (
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

      {showAdd && (
        <GameForm
          label="Add Game"
          onSave={addGame}
          onCancel={() => {
            setShowAdd(false);
            setForm(emptyForm);
            setMessage(null);
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {games.map((game) =>
            editId === game.id ? (
              <GameForm
                key={game.id}
                label="Save Changes"
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            ) : (
              <div
                key={game.id}
                className={`card p-4 ${
                  game.status === "cancelled" ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="shrink-0 text-xs text-gray-500 min-w-[110px]">
                    <div className="font-semibold text-gray-700">
                      {formatDateShort(game.date)}
                    </div>
                    <div>{formatTime12(game.time)}</div>
                    <div>{game.field}</div>
                    {game.status === "cancelled" && (
                      <span className="badge bg-red-100 text-red-700 mt-1">
                        Cancelled
                      </span>
                    )}
                    {game.status === "completed" && (
                      <span className="badge bg-green-100 text-green-700 mt-1">
                        Final
                      </span>
                    )}
                  </div>

                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: game.awayTeam?.color }}
                      />
                      <span className="font-medium">
                        {game.awayTeam?.name}
                      </span>
                      <span className="text-gray-400 text-xs">(Away)</span>
                      {game.status === "completed" && (
                        <span className="font-bold ml-1">
                          {game.awayScore}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: game.homeTeam?.color }}
                      />
                      <span className="font-medium">
                        {game.homeTeam?.name}
                      </span>
                      <span className="text-gray-400 text-xs">(Home)</span>
                      {game.status === "completed" && (
                        <span className="font-bold ml-1">
                          {game.homeScore}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {game.status !== "completed" && (
                      <button
                        onClick={() => startEdit(game)}
                        className="btn-secondary text-sm"
                      >
                        Edit
                      </button>
                    )}
                    {game.status === "scheduled" && (
                      <button
                        onClick={() => cancelGame(game.id)}
                        className="text-sm px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        Cancel Game
                      </button>
                    )}
                    {game.status === "cancelled" && (
                      <button
                        onClick={() => restoreGame(game.id)}
                        className="btn-secondary text-sm"
                      >
                        Restore
                      </button>
                    )}
                    <button
                      onClick={() => deleteGame(game.id)}
                      disabled={deleting === game.id}
                      className="btn-danger text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
