"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SourceLink } from "./SourceLink";
import { levelColor, categoryColor } from "@/lib/tag-colors";
import type { DrillWithSource } from "@/lib/types";

type Props = {
  drill: DrillWithSource;
  compact?: boolean;
};

export function DrillCard({ drill, compact }: Props) {
  const [expanded, setExpanded] = useState(false);
  const storageUrl = drill.source_documents?.storage_url;

  if (compact) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border">
        <span className="font-medium text-sm flex-1 min-w-0 truncate">
          {drill.name}
        </span>
        {drill.source_display && (
          <SourceLink
            document_slug={drill.source_document_slug}
            page={drill.source_page}
            display={drill.source_display}
            storage_url={storageUrl}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 space-y-2"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-base">{drill.name}</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-xs rounded px-2 py-0.5 capitalize ${categoryColor(drill.category)}`}>
              {drill.category}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {drill.level_tags.map((tag) => (
            <span key={tag} className={`text-xs rounded px-2 py-0.5 ${levelColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>

        {!expanded && (drill.summary || drill.instructions) && (
          <p className="text-sm text-muted-foreground">{drill.summary || drill.instructions}</p>
        )}

        {drill.source_display && (
          <div onClick={(e) => e.stopPropagation()}>
            <SourceLink
              document_slug={drill.source_document_slug}
              page={drill.source_page}
              display={drill.source_display}
              storage_url={storageUrl}
            />
          </div>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t bg-slate-50 pt-3">
          {drill.equipment && (
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Equipment</span>
              <p className="text-sm mt-0.5">{drill.equipment}</p>
            </div>
          )}
          {drill.setup && (
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Setup</span>
              <p className="text-sm mt-0.5 whitespace-pre-line">{drill.setup}</p>
            </div>
          )}
          {drill.instructions && (
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Instructions</span>
              <p className="text-sm mt-0.5 whitespace-pre-line">{drill.instructions}</p>
            </div>
          )}
          {drill.coaching_points && (
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Coaching Points</span>
              <p className="text-sm mt-0.5 whitespace-pre-line">{drill.coaching_points}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
