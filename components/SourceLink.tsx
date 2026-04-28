"use client";

import { ExternalLink } from "lucide-react";

type Props = {
  document_slug: string | null;
  page: number | null;
  display: string;
  storage_url?: string;
};

export function SourceLink({ display, storage_url, page }: Props) {
  if (!storage_url) {
    return <span className="text-muted-foreground text-sm">{display}</span>;
  }
  const href = page ? `${storage_url}#page=${page}` : storage_url;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 underline text-sm active:text-blue-800"
    >
      <ExternalLink className="h-3 w-3 shrink-0" />
      {display}
    </a>
  );
}
