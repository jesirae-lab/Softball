"use client";

import { useState, useEffect } from "react";
import { Team } from "@/lib/types";

type SendResult = {
  preview: boolean;
  recipients: string[];
  previewContent?: string;
};

export default function AdminEmailPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const [to, setTo] = useState("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("League Admin");

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((d) => {
        setTeams(d.data ?? []);
        setLoading(false);
      });
  }, []);

  const selectedTeam =
    to !== "all" ? teams.find((t) => t.id === to) : null;

  const recipientLabel =
    to === "all"
      ? `All Teams (${teams.length} teams)`
      : selectedTeam
      ? `${selectedTeam.name} <${selectedTeam.contactEmail}>`
      : "—";

  const handleSend = async () => {
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, message, senderName }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to send");
      setResult(data.data as SendResult);
      setSubject("");
      setMessage("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const TEMPLATES = [
    {
      label: "Game Reminder",
      subject: "Upcoming Game Reminder",
      body: `Hi team,\n\nThis is a friendly reminder that you have a game coming up soon!\n\nPlease make sure all players arrive 15 minutes early to warm up.\n\nBring:\n- Your team uniform\n- Water and snacks\n- A positive attitude!\n\nSee you on the field!\n\nRec League Administration`,
    },
    {
      label: "Schedule Update",
      subject: "Schedule Update",
      body: `Hi team,\n\nWe wanted to let you know that the schedule has been updated.\n\nPlease check the latest schedule at your earliest convenience.\n\nIf you have any questions, please reply to this email.\n\nRec League Administration`,
    },
    {
      label: "General Announcement",
      subject: "League Announcement",
      body: `Hi everyone,\n\nWe have an important update for all teams in the Rec League Co-Ed Softball 2026 season.\n\n[Add your message here]\n\nThank you for your participation!\n\nRec League Administration`,
    },
    {
      label: "Rainout Notice",
      subject: "Game Cancellation — Rain Out",
      body: `Hi team,\n\nDue to inclement weather, tonight's game has been cancelled.\n\nWe will be in touch with makeup game details as soon as possible.\n\nWe apologize for any inconvenience. Stay dry!\n\nRec League Administration`,
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">
          ← Admin
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Send Email</h1>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              {result.preview ? (
                <>
                  <p className="font-semibold text-green-800">
                    Preview Mode (SMTP not configured)
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Email would have been sent to:{" "}
                    {result.recipients.join(", ")}
                  </p>
                  {result.previewContent && (
                    <pre className="mt-3 text-xs bg-white border border-green-200 rounded-lg p-3 whitespace-pre-wrap text-gray-700 font-mono overflow-x-auto">
                      {result.previewContent}
                    </pre>
                  )}
                  <p className="text-xs text-green-600 mt-2">
                    To enable real email sending, configure SMTP settings in{" "}
                    <code>.env.local</code>.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-green-800">
                    Email sent successfully!
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Delivered to: {result.recipients.join(", ")}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-green-500 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="card p-6 space-y-5">
        {/* Recipient */}
        <div>
          <label className="form-label">To</label>
          {loading ? (
            <div className="text-sm text-gray-500">Loading teams…</div>
          ) : (
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="form-input"
            >
              <option value="all">All Teams ({teams.length} teams)</option>
              <optgroup label="Individual Teams">
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.contactEmail}
                  </option>
                ))}
              </optgroup>
            </select>
          )}
          {selectedTeam && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedTeam.color }}
              />
              <span>
                Manager: {selectedTeam.managerName} &middot;{" "}
                <a
                  href={`mailto:${selectedTeam.contactEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {selectedTeam.contactEmail}
                </a>
              </span>
            </div>
          )}
          {to === "all" && teams.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {teams.map((t) => (
                <span
                  key={t.id}
                  className="badge text-white text-xs"
                  style={{ backgroundColor: t.color }}
                >
                  {t.shortName}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* From */}
        <div>
          <label className="form-label">From (Sender Name)</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="form-input"
            placeholder="League Admin"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="form-label">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-input"
            placeholder="e.g. Game Reminder — Tuesday April 14"
          />
        </div>

        {/* Message */}
        <div>
          <label className="form-label">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={10}
            className="form-input resize-y"
            placeholder="Type your message here…"
          />
          <div className="text-xs text-gray-400 mt-1 text-right">
            {message.length} characters
          </div>
        </div>

        {/* Preview */}
        {(subject || message) && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Email Preview
            </div>
            <div className="bg-[#1e3a5f] text-white px-4 py-3 rounded-t-lg">
              <span className="font-bold">⚾ Rec League</span>
            </div>
            <div className="border border-t-0 border-gray-200 rounded-b-lg p-4">
              <div className="text-xs text-gray-500 mb-2">
                <span className="font-medium">To:</span> {recipientLabel}
              </div>
              <div className="text-xs text-gray-500 mb-3">
                <span className="font-medium">Subject:</span>{" "}
                {subject || "(no subject)"}
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {message || "(no message)"}
              </pre>
            </div>
          </div>
        )}

        {/* Send button */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSend}
            disabled={sending || loading}
            className="btn-primary"
          >
            {sending ? "Sending…" : "Send Email"}
          </button>
        </div>
      </div>

      {/* Templates */}
      <div className="card overflow-hidden">
        <div className="card-header">Quick Templates</div>
        <div className="divide-y divide-gray-100">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.label}
              onClick={() => {
                setSubject(tpl.subject);
                setMessage(tpl.body);
                setResult(null);
                setError(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-sm text-gray-800">
                {tpl.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{tpl.subject}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
