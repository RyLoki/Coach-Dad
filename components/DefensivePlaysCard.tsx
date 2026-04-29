"use client";

import { useState, useEffect } from "react";
import { Check, Square, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SourceLink } from "./SourceLink";

type CatalogEntry = {
  slug: string;
  name: string;
  description: string;
  source_document_slug: string | null;
  source_page: number | null;
  source_display: string | null;
  positions: { position: string; role: string }[];
  source_documents: { storage_url: string } | null;
};

type Props = {
  plays: string[];
  blockId: number;
};

export function DefensivePlaysCard({ plays, blockId }: Props) {
  const [doneIndices, setDoneIndices] = useState<Set<number>>(new Set());
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [catalog, setCatalog] = useState<Record<string, CatalogEntry>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("defensive_plays_catalog")
      .select("*, source_documents(storage_url)")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, CatalogEntry> = {};
          for (const entry of data as CatalogEntry[]) {
            map[entry.name] = entry;
          }
          setCatalog(map);
        }
      });
  }, []);

  const toggle = (idx: number) => {
    setDoneIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleExpand = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <div className="space-y-2" data-block-id={blockId}>
      {plays.map((play, idx) => {
        const entry = catalog[play];
        const expanded = expandedIdx === idx;
        const done = doneIndices.has(idx);

        return (
          <div key={idx} className="bg-white rounded-lg border overflow-hidden">
            <div className="flex items-start gap-2 p-3 min-h-[44px]">
              <button
                onClick={() => toggle(idx)}
                className="shrink-0 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {done ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Square className="h-5 w-5 text-slate-400" />
                )}
              </button>

              <button
                onClick={() => toggleExpand(idx)}
                className="flex-1 text-left min-w-0"
              >
                <p className={`text-sm font-medium ${done ? "line-through text-slate-400" : ""}`}>
                  {play}
                </p>
                {entry?.source_display && (
                  <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                    <SourceLink
                      document_slug={entry.source_document_slug}
                      page={entry.source_page}
                      display={entry.source_display}
                      storage_url={entry.source_documents?.storage_url}
                    />
                  </div>
                )}
              </button>

              <button
                onClick={() => toggleExpand(idx)}
                className="shrink-0 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400"
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {expanded && entry && (
              <div className="px-4 pb-4 space-y-3 border-t bg-slate-50">
                <p className="text-sm text-slate-700 pt-3">{entry.description}</p>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Position Responsibilities
                  </h5>
                  {entry.positions.map((pos, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 rounded px-2 py-1 shrink-0 min-w-[48px] text-center">
                        {pos.position}
                      </span>
                      <p className="text-sm text-slate-600">{pos.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expanded && !entry && (
              <div className="px-4 pb-4 border-t bg-slate-50 pt-3">
                <p className="text-sm text-muted-foreground">No details available for this play.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
