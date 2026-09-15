import { createClient } from "@/lib/supabase/server";
import { TEAM_LOGOS } from "@/lib/team-logos";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Team } from "@/lib/types";
import { HEAD_COACH_SCOPE } from "@/lib/auth";
import { TeamLoginForm } from "./form";

export const dynamic = "force-dynamic";

export default async function TeamLoginPage({
  params,
}: {
  params: Promise<{ team: string }>;
}) {
  const { team: slug } = await params;

  // Head-coach login is a special slug.
  if (slug === "head-coach") {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto px-4 py-16 space-y-6">
          <Link
            href="/login"
            className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2"
          >
            ← Back to teams
          </Link>
          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Head coach</h1>
            <p className="text-slate-500 text-sm">
              Sign in to view every team.
            </p>
          </header>
          <TeamLoginForm scope={HEAD_COACH_SCOPE} label="Head coach" />
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!team) notFound();
  const t = team as Team;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto px-4 py-12 space-y-6">
        <Link
          href="/login"
          className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2"
        >
          ← Back to teams
        </Link>

        <header className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TEAM_LOGOS[t.slug]}
            alt={t.display_name}
            className="w-20 h-20 object-contain rounded-lg shrink-0"
          />
          <div className="space-y-0.5 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 truncate">
              {t.display_name}
            </h1>
            <p className="text-sm text-slate-500 truncate">{t.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{t.level}</p>
          </div>
        </header>

        <TeamLoginForm scope={t.slug} label={t.display_name} />
      </div>
    </div>
  );
}
