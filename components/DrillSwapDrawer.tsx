"use client";

import { useState, useEffect } from "react";
import { X, ArrowLeftRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SourceLink } from "./SourceLink";
import type { DrillWithSource } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  currentDrill: DrillWithSource;
  teamLevel: string;
  onSwap: (newSlug: string) => void;
};

export function DrillSwapDrawer({ open, onClose, currentDrill, teamLevel, onSwap }: Props) {
  const [alternatives, setAlternatives] = useState<DrillWithSource[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("drills")
      .select("*, source_documents(storage_url)")
      .eq("category", currentDrill.category)
      .contains("level_tags", [teamLevel])
      .neq("slug", currentDrill.slug)
      .order("name")
      .then(({ data }) => {
        setAlternatives((data as DrillWithSource[]) || []);
        setLoading(false);
      });
  }, [open, currentDrill.slug, currentDrill.category, teamLevel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Swap Drill</h3>
            <p className="text-sm text-muted-foreground">
              Replacing: {currentDrill.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2">
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && alternatives.length === 0 && (
            <p className="text-sm text-muted-foreground">No alternatives found.</p>
          )}
          {alternatives.map((drill) => (
            <button
              key={drill.slug}
              onClick={() => onSwap(drill.slug)}
              className="w-full text-left p-3 rounded-lg border hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 min-h-[44px]"
            >
              <ArrowLeftRight className="h-4 w-4 shrink-0 text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{drill.name}</p>
                {drill.source_display && (
                  <SourceLink
                    document_slug={drill.source_document_slug}
                    page={drill.source_page}
                    display={drill.source_display}
                    storage_url={drill.source_documents?.storage_url}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
