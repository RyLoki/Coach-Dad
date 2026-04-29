import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/time";
import { TEAM_LOGOS } from "@/lib/team-logos";
import { PlanRunner } from "@/components/PlanRunner";
import { Clock, MapPin, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { PlanWithBlocks } from "@/lib/types";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("plans")
    .select(
      `*, teams(*), plan_blocks(*, plan_block_drills(*, drills(*, source_documents(storage_url))))`
    )
    .eq("id", id)
    .single();

  if (!plan) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {TEAM_LOGOS[plan.teams.slug] && (
            <Image
              src={TEAM_LOGOS[plan.teams.slug]}
              alt={plan.teams.display_name}
              width={40}
              height={40}
              className="rounded-full object-cover shrink-0"
            />
          )}
          <div>
            <span className="text-xs font-medium text-blue-600 uppercase">
              {plan.teams.display_name}
            </span>
            <h1 className="text-xl font-bold">{plan.title}</h1>
          </div>
        </div>
        <Link
          href={`/plans/${id}/edit`}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500"
        >
          <Pencil className="h-5 w-5" />
        </Link>
      </div>

      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {formatDate(plan.starts_at)} {formatTime(plan.starts_at)} &middot;{" "}
            {plan.duration_min}min
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

      <PlanRunner plan={plan as unknown as PlanWithBlocks} />
    </div>
  );
}
