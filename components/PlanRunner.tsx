"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, Square, ArrowLeftRight } from "lucide-react";
import { BlockTimer } from "./BlockTimer";
import { DefensivePlaysCard } from "./DefensivePlaysCard";
import { SourceLink } from "./SourceLink";
import { DrillSwapDrawer } from "./DrillSwapDrawer";
import { createClient } from "@/lib/supabase/client";
import type { PlanWithBlocks, DrillWithSource } from "@/lib/types";

type Props = {
  plan: PlanWithBlocks;
};

export function PlanRunner({ plan: initialPlan }: Props) {
  const [plan, setPlan] = useState(initialPlan);
  const [swapTarget, setSwapTarget] = useState<{
    blockId: number;
    drillId: number;
    drill: DrillWithSource;
  } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const startPractice = async () => {
    const now = new Date().toISOString();
    await supabase.from("plans").update({ status: "active", started_at: now }).eq("id", plan.id);
    setPlan((p) => ({ ...p, status: "active", started_at: now }));
  };

  const toggleDone = useCallback(
    async (drillId: number, currentDone: boolean) => {
      // Optimistic update
      setPlan((p) => ({
        ...p,
        plan_blocks: p.plan_blocks.map((b) => ({
          ...b,
          plan_block_drills: b.plan_block_drills.map((d) =>
            d.id === drillId ? { ...d, done: !currentDone } : d
          ),
        })),
      }));
      await supabase.from("plan_block_drills").update({ done: !currentDone }).eq("id", drillId);
    },
    [supabase]
  );

  const handleSwap = useCallback(
    async (newSlug: string) => {
      if (!swapTarget) return;
      const { blockId, drillId } = swapTarget;

      await supabase
        .from("plan_block_drills")
        .update({ drill_slug: newSlug, done: false })
        .eq("id", drillId);

      // Fetch the new drill
      const { data: newDrill } = await supabase
        .from("drills")
        .select("*, source_documents(storage_url)")
        .eq("slug", newSlug)
        .single();

      if (newDrill) {
        setPlan((p) => ({
          ...p,
          plan_blocks: p.plan_blocks.map((b) =>
            b.id === blockId
              ? {
                  ...b,
                  plan_block_drills: b.plan_block_drills.map((d) =>
                    d.id === drillId
                      ? { ...d, drill_slug: newSlug, done: false, drills: newDrill as DrillWithSource }
                      : d
                  ),
                }
              : b
          ),
        }));
      }

      setSwapTarget(null);
    },
    [swapTarget, supabase]
  );

  const blocks = [...plan.plan_blocks].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-4">
      {plan.status === "upcoming" && (
        <button
          onClick={startPractice}
          className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-xl active:bg-green-700 min-h-[56px]"
        >
          Start Practice
        </button>
      )}

      {plan.status === "active" && plan.started_at && (
        <BlockTimer
          startedAt={plan.started_at}
          blocks={blocks.map((b) => ({
            start_offset_min: b.start_offset_min,
            duration_min: b.duration_min,
            title: b.title,
          }))}
        />
      )}

      {blocks.map((block) => (
        <div key={block.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">{block.title}</h3>
            <span className="text-xs text-muted-foreground">{block.duration_min}min</span>
          </div>

          {block.notes && (
            <p className="text-sm text-muted-foreground">{block.notes}</p>
          )}

          {block.defensive_plays && block.defensive_plays.length > 0 && (
            <DefensivePlaysCard plays={block.defensive_plays} blockId={block.id} />
          )}

          {block.plan_block_drills.length > 0 && (
            <div className="space-y-1">
              {block.plan_block_drills
                .sort((a, b) => a.sequence - b.sequence)
                .map((pbd) => {
                  const drill = pbd.drills;
                  const storageUrl = drill.source_documents?.storage_url;
                  return (
                    <div
                      key={pbd.id}
                      className="flex items-center gap-2 bg-white rounded-lg border p-3 min-h-[44px]"
                    >
                      <button
                        onClick={() => toggleDone(pbd.id, pbd.done)}
                        className="shrink-0 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        {pbd.done ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        {pbd.station_label && (
                          <span className="text-xs font-medium text-blue-600 uppercase">
                            {pbd.station_label}
                          </span>
                        )}
                        <p className={`text-sm font-medium truncate ${pbd.done ? "line-through text-slate-400" : ""}`}>
                          {drill.name}
                        </p>
                        {drill.source_display && (
                          <SourceLink
                            document_slug={drill.source_document_slug}
                            page={drill.source_page}
                            display={drill.source_display}
                            storage_url={storageUrl}
                          />
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setSwapTarget({ blockId: block.id, drillId: pbd.id, drill })
                        }
                        className="shrink-0 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ))}

      {swapTarget && (
        <DrillSwapDrawer
          open={!!swapTarget}
          onClose={() => setSwapTarget(null)}
          currentDrill={swapTarget.drill}
          teamLevel={plan.teams.level}
          onSwap={handleSwap}
        />
      )}
    </div>
  );
}
