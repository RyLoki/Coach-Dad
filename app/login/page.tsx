import { createClient } from "@/lib/supabase/server";
import { TEAM_LOGOS } from "@/lib/team-logos";
import Link from "next/link";
import type { Team } from "@/lib/types";

export const dynamic = "force-dynamic";

const SEASON_LABEL: Record<string, string> = {
  "2026-spring": "2026 · Spring",
  "2026-fall":   "2026 · Fall",
};

const SEASON_ORDER = ["2026-fall", "2026-spring"];

export default async function LoginLandingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teams")
    .select("*")
    .order("level");

  const teams: Team[] = (data as Team[]) || [];

  // Group by season, most recent first.
  const bySeason = new Map<string, Team[]>();
  for (const t of teams) {
    const key = t.season || "2026-spring";
    if (!bySeason.has(key)) bySeason.set(key, []);
    bySeason.get(key)!.push(t);
  }
  const orderedSeasons = SEASON_ORDER.filter((s) => bySeason.has(s)).concat(
    [...bySeason.keys()].filter((s) => !SEASON_ORDER.includes(s))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Coach Dad</h1>
          <p className="text-slate-500">Pick your team to sign in.</p>
        </header>

        {orderedSeasons.map((season) => {
          const list = bySeason.get(season) || [];
          return (
            <section key={season} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1">
                {SEASON_LABEL[season] || season}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {list.map((team) => (
                  <Link
                    key={team.slug}
                    href={`/login/${team.slug}`}
                    className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-200 p-5 text-center active:bg-slate-50 hover:border-slate-300 transition"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={TEAM_LOGOS[team.slug]}
                      alt={team.display_name}
                      className="w-20 h-20 object-contain rounded-lg"
                    />
                    <div className="space-y-0.5 min-w-0 w-full">
                      <div className="font-bold text-slate-900 truncate">
                        {team.display_name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {team.level}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <footer className="pt-6 text-center">
          <Link
            href="/login/head-coach"
            className="text-sm text-slate-400 hover:text-slate-600 underline underline-offset-2"
          >
            Head coach login
          </Link>
        </footer>
      </div>
    </div>
  );
}
