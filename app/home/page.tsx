import { createClient } from "@/lib/supabase/server";
import { TEAM_LOGOS } from "@/lib/team-logos";
import Link from "next/link";
import type { Team } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("level");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Teams</h1>

      <div className="space-y-4">
        {(teams as Team[] || []).map((team) => (
          <Link
            key={team.slug}
            href={`/teams/${team.slug}`}
            className="flex items-center gap-4 bg-white rounded-xl border p-4 active:bg-slate-50 min-h-[88px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TEAM_LOGOS[team.slug]}
              alt={team.display_name}
              className="w-16 h-16 object-contain rounded-lg shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg">{team.display_name}</h2>
              <p className="text-sm text-muted-foreground">{team.full_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5">
                  {team.level}
                </span>
                <span className="text-xs text-muted-foreground">
                  {team.kid_name} &middot; {team.roster_size} kids
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
