"use client";

import { SourceLink } from "./SourceLink";
import type { DrillWithSource } from "@/lib/types";
import Link from "next/link";

type Props = {
  drill: DrillWithSource;
  compact?: boolean;
};

export function DrillCard({ drill, compact }: Props) {
  const storageUrl = drill.source_documents?.storage_url;

  if (compact) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border">
        <Link href={`/drills/${drill.slug}`} className="font-medium text-sm flex-1 min-w-0 truncate">
          {drill.name}
        </Link>
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
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/drills/${drill.slug}`} className="font-semibold text-base">
          {drill.name}
        </Link>
        <span className="text-xs bg-slate-100 text-slate-600 rounded px-2 py-0.5 shrink-0 capitalize">
          {drill.category}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {drill.level_tags.map((tag) => (
          <span key={tag} className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5">
            {tag}
          </span>
        ))}
      </div>

      {drill.equipment && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Equipment:</span> {drill.equipment}
        </p>
      )}

      {drill.instructions && (
        <p className="text-sm line-clamp-3">{drill.instructions}</p>
      )}

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
