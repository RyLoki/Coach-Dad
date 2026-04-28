import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/time";
import Link from "next/link";
import { Clock, MapPin, Users } from "lucide-react";
import type { Plan, Team } from "@/lib/types";

export default async function TodayPage() {
  const supabase = await createClient();

  // Get active practice first
  const { data: activePlan } = await supabase
    .from("plans")
    .select("*, teams(*)")
    .eq("status", "active")
    .order("starts_at")
    .limit(1)
    .maybeSingle();

  // Then get upcoming plans (next 24h or nearest future)
  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  let { data: upcomingPlans } = await supabase
    .from("plans")
    .select("*, teams(*)")
    .eq("status", "upcoming")
    .gte("starts_at", now)
    .lte("starts_at", tomorrow)
    .order("starts_at")
    .limit(5);

  // If nothing in 24h, get next upcoming
  if (!upcomingPlans?.length) {
    const { data } = await supabase
      .from("plans")
      .select("*, teams(*)")
      .eq("status", "upcoming")
      .gte("starts_at", now)
      .order("starts_at")
      .limit(3);
    upcomingPlans = data;
  }

  const plans = [
    ...(activePlan ? [activePlan] : []),
    ...(upcomingPlans || []),
  ] as (Plan & { teams: Team })[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Today</h1>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No upcoming practices.</p>
          <Link href="/plans" className="text-blue-600 underline text-sm mt-2 inline-block">
            View all plans
          </Link>
        </div>
      )}

      {plans.map((plan) => (
        <Link
          key={plan.id}
          href={`/plans/${plan.id}`}
          className="block bg-white rounded-xl border p-4 space-y-3 active:bg-slate-50"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-blue-600 uppercase">
                {plan.teams.display_name}
              </span>
              <h2 className="font-semibold text-lg">{plan.title}</h2>
            </div>
            {plan.status === "active" && (
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                LIVE
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatDate(plan.starts_at)} {formatTime(plan.starts_at)} &middot; {plan.duration_min}min</span>
            </div>
            {plan.field_name && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{plan.field_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{plan.teams.full_name}</span>
            </div>
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
    </div>
  );
}
