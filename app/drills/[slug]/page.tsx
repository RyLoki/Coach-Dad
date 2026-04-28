import { createClient } from "@/lib/supabase/server";
import { SourceLink } from "@/components/SourceLink";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DrillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: drill } = await supabase
    .from("drills")
    .select("*, source_documents(storage_url)")
    .eq("slug", slug)
    .single();

  if (!drill) notFound();

  const storageUrl = drill.source_documents?.storage_url;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/drills"
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{drill.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-slate-100 text-slate-600 rounded px-2 py-0.5 capitalize">
              {drill.category}
            </span>
            {drill.level_tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Link
          href={`/drills/${slug}/edit`}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500"
        >
          <Pencil className="h-5 w-5" />
        </Link>
      </div>

      {drill.source_display && (
        <div className="bg-blue-50 rounded-lg p-3">
          <SourceLink
            document_slug={drill.source_document_slug}
            page={drill.source_page}
            display={drill.source_display}
            storage_url={storageUrl}
          />
        </div>
      )}

      {drill.equipment && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Equipment</h3>
          <p className="text-sm mt-1">{drill.equipment}</p>
        </div>
      )}

      {drill.setup && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Setup</h3>
          <p className="text-sm mt-1 whitespace-pre-line">{drill.setup}</p>
        </div>
      )}

      {drill.instructions && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Instructions</h3>
          <p className="text-sm mt-1 whitespace-pre-line">{drill.instructions}</p>
        </div>
      )}

      {drill.coaching_points && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Coaching Points</h3>
          <p className="text-sm mt-1 whitespace-pre-line">{drill.coaching_points}</p>
        </div>
      )}
    </div>
  );
}
