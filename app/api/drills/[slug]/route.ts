import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();

  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if ("equipment" in body) updates.equipment = body.equipment;
  if ("setup" in body) updates.setup = body.setup;
  if ("instructions" in body) updates.instructions = body.instructions;
  if ("coaching_points" in body) updates.coaching_points = body.coaching_points;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("drills")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
