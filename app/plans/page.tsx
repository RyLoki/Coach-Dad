import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/time";
import { TEAM_LOGOS } from "@/lib/team-logos";
import Image from "next/image";
import Link from "next/link";
import type { Plan, Team } from "@/lib/types";

export default async function PlansPage() {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("plans")
    .select("*, teams(*)")
    .order("starts_at");

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("level");

  const grouped = (teams || []).map((team) => ({
    team,
    plans: ((plans || []) as (Plan & { teams: Team })[]).filter(
      (p) => p.team_slug === team.slug
    ),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plans</h1>

      {grouped.map(({ team, plans }) => (
        <div key={team.slug} className="space-y-2">
          <div className="flex items-center gap-2">
            {TEAM_LOGOS[team.slug] && (
              <Image
                src={TEAM_LOGOS[team.slug]}
                alt={team.display_name}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            )}
            <h2 className="font-semibold text-lg text-slate-700">
              {team.display_name}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {team.level}
              </span>
            </h2>
          </div>

          {plans.map((plan) => (
            <Link
              key={plan.id}
              href={`/plans/${plan.id}`}
              className="block bg-white rounded-lg border p-3 active:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{plan.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(plan.starts_at)} {formatTime(plan.starts_at)} &middot;{" "}
                    {plan.field_name}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded shrink-0 ml-2 ${
                    plan.status === "active"
                      ? "bg-green-100 text-green-800"
                      : plan.status === "done"
                      ? "bg-slate-100 text-slate-500"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {plan.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
