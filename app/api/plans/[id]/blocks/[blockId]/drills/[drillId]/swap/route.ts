import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; blockId: string; drillId: string }> }
) {
  const { drillId } = await params;
  const { new_drill_slug } = await request.json();

  if (!new_drill_slug) {
    return NextResponse.json({ error: "new_drill_slug required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("plan_block_drills")
    .update({ drill_slug: new_drill_slug, done: false })
    .eq("id", drillId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
