import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; blockId: string; drillId: string }> }
) {
  const { drillId } = await params;
  const supabase = await createClient();

  // Get current state
  const { data: current } = await supabase
    .from("plan_block_drills")
    .select("done")
    .eq("id", drillId)
    .single();

  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("plan_block_drills")
    .update({ done: !current.done })
    .eq("id", drillId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ done: !current.done });
}
