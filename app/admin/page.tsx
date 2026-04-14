import Link from "next/link";
import { readGames, readTeams } from "@/lib/data";

export const dynamic = "force-dynamic";

const adminSections = [
  {
    href: "/admin/scores",
    icon: "🏆",
    title: "Update Scores",
    description: "Enter final scores for completed games",
    color: "bg-green-50 border-green-200 hover:border-green-400",
    iconBg: "bg-green-100",
  },
  {
    href: "/admin/schedule",
    icon: "📅",
    title: "Manage Schedule",
    description: "Add, edit, or cancel games",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
    iconBg: "bg-blue-100",
  },
  {
    href: "/admin/email",
    icon: "✉️",
    title: "Send Email",
    description: "Communicate with teams or the whole league",
    color: "bg-purple-50 border-purple-200 hover:border-purple-400",
    iconBg: "bg-purple-100",
  },
];

export default function AdminPage() {
  const games = readGames();
  const teams = readTeams();

  const needsScores = games.filter(
    (g) =>
      g.status === "scheduled" &&
      g.date < new Date().toISOString().split("T")[0]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage scores, schedule, and team communications
        </p>
      </div>

      {needsScores.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800">
              {needsScores.length} game{needsScores.length > 1 ? "s" : ""}{" "}
              missing scores
            </p>
            <p className="text-amber-700 text-sm mt-0.5">
              Past games haven&apos;t had scores entered yet.{" "}
              <Link href="/admin/scores" className="underline font-medium">
                Update scores
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Teams", value: teams.length, icon: "👥" },
          {
            label: "Total Games",
            value: games.length,
            icon: "⚾",
          },
          {
            label: "Completed",
            value: games.filter((g) => g.status === "completed").length,
            icon: "✅",
          },
          {
            label: "Upcoming",
            value: games.filter((g) => g.status === "scheduled").length,
            icon: "📅",
          },
        ].map((stat) => (
          <div key={stat.label} className="card px-5 py-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-[#1e3a5f]">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Admin sections */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {adminSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={`card border-2 p-6 transition-colors ${section.color}`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${section.iconBg}`}
            >
              {section.icon}
            </div>
            <h2 className="font-bold text-gray-900 text-lg">{section.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
