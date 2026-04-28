"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronUp, ChevronDown, X, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DrillSwapDrawer } from "@/components/DrillSwapDrawer";
import type { DrillWithSource } from "@/lib/types";

type Block = {
  id: number;
  sequence: number;
  block_type: string;
  title: string;
  notes: string | null;
  defensive_plays: string[] | null;
  duration_min: number;
  plan_block_drills: {
    id: number;
    sequence: number;
    drill_slug: string;
    station_label: string | null;
    drills: DrillWithSource;
  }[];
};

type PlanData = {
  id: number;
  title: string;
  theme: string | null;
  team_slug: string;
  teams: { level: string; display_name: string };
  plan_blocks: Block[];
};

export default function PlanEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [plan, setPlan] = useState<PlanData | null>(null);
  const [theme, setTheme] = useState("");
  const [saving, setSaving] = useState(false);
  const [swapTarget, setSwapTarget] = useState<{
    blockId: number;
    drillId: number;
    drill: DrillWithSource;
  } | null>(null);

  useEffect(() => {
    supabase
      .from("plans")
      .select(
        "id, title, theme, team_slug, teams(level, display_name), plan_blocks(*, plan_block_drills(*, drills(*, source_documents(storage_url))))"
      )
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPlan(data as unknown as PlanData);
          setTheme(data.theme || "");
        }
      });
  }, [id, supabase]);

  const saveTheme = async () => {
    if (!plan) return;
    setSaving(true);
    await supabase.from("plans").update({ theme }).eq("id", plan.id);
    setSaving(false);
  };

  const saveDefensivePlays = async (blockId: number, text: string) => {
    const plays = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    await supabase
      .from("plan_blocks")
      .update({ defensive_plays: plays })
      .eq("id", blockId);
    setPlan((p) => {
      if (!p) return p;
      return {
        ...p,
        plan_blocks: p.plan_blocks.map((b) =>
          b.id === blockId ? { ...b, defensive_plays: plays } : b
        ),
      };
    });
  };

  const removeDrill = async (drillRowId: number, blockId: number) => {
    await supabase.from("plan_block_drills").delete().eq("id", drillRowId);
    setPlan((p) => {
      if (!p) return p;
      return {
        ...p,
        plan_blocks: p.plan_blocks.map((b) =>
          b.id === blockId
            ? { ...b, plan_block_drills: b.plan_block_drills.filter((d) => d.id !== drillRowId) }
            : b
        ),
      };
    });
  };

  const handleSwap = async (newSlug: string) => {
    if (!swapTarget) return;
    await supabase
      .from("plan_block_drills")
      .update({ drill_slug: newSlug, done: false })
      .eq("id", swapTarget.drillId);

    const { data: newDrill } = await supabase
      .from("drills")
      .select("*, source_documents(storage_url)")
      .eq("slug", newSlug)
      .single();

    if (newDrill) {
      setPlan((p) => {
        if (!p) return p;
        return {
          ...p,
          plan_blocks: p.plan_blocks.map((b) =>
            b.id === swapTarget.blockId
              ? {
                  ...b,
                  plan_block_drills: b.plan_block_drills.map((d) =>
                    d.id === swapTarget.drillId
                      ? { ...d, drill_slug: newSlug, drills: newDrill as DrillWithSource }
                      : d
                  ),
                }
              : b
          ),
        };
      });
    }
    setSwapTarget(null);
  };

  if (!plan) return <div className="py-8 text-center text-muted-foreground">Loading...</div>;

  const blocks = [...plan.plan_blocks].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/plans/${id}`}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <span className="text-xs font-medium text-blue-600 uppercase">
            {plan.teams.display_name}
          </span>
          <h1 className="text-xl font-bold">Edit Plan</h1>
        </div>
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Theme</label>
        <textarea
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          onBlur={saveTheme}
          className="w-full border rounded-lg p-3 text-sm min-h-[60px]"
          placeholder="PCA theme for this practice..."
        />
        {saving && <p className="text-xs text-muted-foreground">Saving...</p>}
      </div>

      {/* Blocks */}
      {blocks.map((block) => (
        <div key={block.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{block.title}</h3>
            <span className="text-xs text-muted-foreground">{block.duration_min}min</span>
          </div>

          {block.defensive_plays && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Defensive Plays (one per line)</label>
              <textarea
                defaultValue={block.defensive_plays.join("\n")}
                onBlur={(e) => saveDefensivePlays(block.id, e.target.value)}
                className="w-full border rounded-lg p-3 text-sm min-h-[80px]"
              />
            </div>
          )}

          {block.plan_block_drills
            .sort((a, b) => a.sequence - b.sequence)
            .map((pbd) => (
              <div
                key={pbd.id}
                className="flex items-center gap-2 bg-white rounded-lg border p-3 min-h-[44px]"
              >
                <div className="flex-1 min-w-0">
                  {pbd.station_label && (
                    <span className="text-xs font-medium text-blue-600 uppercase">
                      {pbd.station_label}
                    </span>
                  )}
                  <p className="text-sm font-medium truncate">{pbd.drills.name}</p>
                </div>
                <button
                  onClick={() =>
                    setSwapTarget({
                      blockId: block.id,
                      drillId: pbd.id,
                      drill: pbd.drills,
                    })
                  }
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600"
                  title="Swap"
                >
                  <Plus className="h-4 w-4 rotate-45" />
                </button>
                <button
                  onClick={() => removeDrill(pbd.id, block.id)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-red-500"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      ))}

      {swapTarget && plan && (
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
