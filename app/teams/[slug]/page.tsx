import { createClient } from "@/lib/supabase/server";
import { TEAM_LOGOS } from "@/lib/team-logos";
import { formatDate, formatTime } from "@/lib/time";
import { Clock, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Plan, Team } from "@/lib/types";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!team) notFound();

  // Active practice
  const { data: activePlan } = await supabase
    .from("plans")
    .select("*")
    .eq("team_slug", slug)
    .eq("status", "active")
    .order("starts_at")
    .limit(1)
    .maybeSingle();

  // Upcoming plans for this team
  const now = new Date().toISOString();
  const { data: upcomingPlans } = await supabase
    .from("plans")
    .select("*")
    .eq("team_slug", slug)
    .eq("status", "upcoming")
    .gte("starts_at", now)
    .order("starts_at")
    .limit(5);

  // All plans for this team
  const { data: allPlans } = await supabase
    .from("plans")
    .select("*")
    .eq("team_slug", slug)
    .order("starts_at");

  // Next upcoming events (games)
  const { data: upcomingGames } = await supabase
    .from("events")
    .select("*")
    .eq("team_slug", slug)
    .eq("kind", "game")
    .gte("starts_at", now)
    .order("starts_at")
    .limit(3);

  const todayPlans = [
    ...(activePlan ? [activePlan] : []),
    ...(upcomingPlans || []),
  ] as Plan[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/home"
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TEAM_LOGOS[slug]}
          alt={team.display_name}
          className="w-14 h-14 object-contain rounded-lg shrink-0"
        />
        <div>
          <h1 className="text-xl font-bold">{team.display_name}</h1>
          <p className="text-sm text-muted-foreground">
            {team.kid_name} &middot; {team.full_name}
          </p>
        </div>
      </div>

      {/* Today / Next Up */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">Next Up</h2>
        {todayPlans.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No upcoming practices.</p>
        )}
        {todayPlans.map((plan) => (
          <Link
            key={plan.id}
            href={`/plans/${plan.id}`}
            className="block bg-white rounded-xl border p-4 space-y-2 active:bg-slate-50"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{plan.title}</h3>
              {plan.status === "active" && (
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                  LIVE
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {formatDate(plan.starts_at)} {formatTime(plan.starts_at)} &middot; {plan.duration_min}min
                </span>
              </div>
              {plan.field_name && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{plan.field_name}</span>
                </div>
              )}
            </div>
            {plan.theme && (
              <p className="text-sm bg-amber-50 text-amber-800 rounded px-3 py-2">
                Theme: {plan.theme}
              </p>
            )}
            {plan.status === "upcoming" && (
              <div className="bg-green-600 text-white text-center font-bold py-3 rounded-lg text-base">
                Start Practice
              </div>
            )}
            {plan.status === "active" && (
              <div className="bg-slate-900 text-white text-center font-bold py-3 rounded-lg text-base">
                Continue Practice
              </div>
            )}
          </Link>
        ))}
      </section>

      {/* Upcoming Games */}
      {upcomingGames && upcomingGames.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-lg">Upcoming Games</h2>
          {upcomingGames.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-lg border p-3 space-y-1"
            >
              <p className="font-medium text-sm">
                {game.home_or_away === "home" ? "vs" : "@"} {game.opponent}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDate(game.starts_at)} {formatTime(game.starts_at)}
                </span>
                {game.field_name && (
                  <>
                    <MapPin className="h-3 w-3 ml-1" />
                    <span>{game.field_name}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* All Plans */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">All Plans</h2>
        {(allPlans || []).map((plan) => (
          <Link
            key={plan.id}
            href={`/plans/${plan.id}`}
            className="block bg-white rounded-lg border p-3 active:bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{plan.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(plan.starts_at)} {formatTime(plan.starts_at)} &middot; {plan.field_name}
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
      </section>
    </div>
  );
}
