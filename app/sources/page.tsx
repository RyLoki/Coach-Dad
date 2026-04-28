import { createClient } from "@/lib/supabase/server";
import { ExternalLink, FileText } from "lucide-react";

export default async function SourcesPage() {
  const supabase = await createClient();

  const { data: docs } = await supabase
    .from("source_documents")
    .select("*")
    .order("title");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Source Documents</h1>
      <p className="text-sm text-muted-foreground">
        {docs?.length || 0} reference PDFs
      </p>

      <div className="space-y-2">
        {(docs || []).map((doc) => (
          <a
            key={doc.slug}
            href={doc.storage_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3 bg-white rounded-lg border p-4 active:bg-slate-50 min-h-[44px]"
          >
            <FileText className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{doc.title}</p>
              {doc.subtitle && (
                <p className="text-xs text-muted-foreground">{doc.subtitle}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {doc.pages} pages
                </span>
                {doc.level_tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-blue-600 shrink-0 mt-1" />
          </a>
        ))}
      </div>
    </div>
  );
}
