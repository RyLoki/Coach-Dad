import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars. Export NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function readJSON(name: string) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../seed", name), "utf-8"));
}

async function seedTeams() {
  const teams = readJSON("teams.json");
  console.log(`Seeding ${teams.length} teams...`);
  const { error } = await supabase.from("teams").upsert(teams, { onConflict: "slug" });
  if (error) throw new Error(`teams: ${error.message}`);
  console.log("  ✓ teams");
}

async function seedDrills() {
  const drills = readJSON("drills.json");
  console.log(`Seeding ${drills.length} drills...`);

  const rows = drills.map((d: any) => ({
    slug: d.slug,
    name: d.name,
    category: d.category,
    level_tags: d.level_tags,
    equipment: d.equipment || null,
    setup: d.setup || null,
    instructions: d.instructions || null,
    coaching_points: d.coaching_points || null,
    source_document_slug: d.source?.document_slug || null,
    source_page: d.source?.page || null,
    source_display: d.source?.display || null,
  }));

  // Batch in chunks of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from("drills").upsert(batch, { onConflict: "slug" });
    if (error) throw new Error(`drills batch ${i}: ${error.message}`);
  }
  console.log("  ✓ drills");
}

async function seedEvents() {
  const schedules = readJSON("schedules.json");
  let total = 0;

  for (const [teamSlug, events] of Object.entries(schedules) as [string, any[]][]) {
    const rows = events.map((e: any) => ({
      team_slug: teamSlug,
      kind: e.kind,
      summary: e.summary || null,
      starts_at: e.start_utc,
      ends_at: e.end_utc,
      field_name: e.field_name || null,
      address: e.address || null,
      source_uid: e.source_uid || null,
      opponent: e.opponent || null,
      home_or_away: e.home_or_away || null,
    }));

    const { error } = await supabase
      .from("events")
      .upsert(rows, { onConflict: "source_uid" });
    if (error) throw new Error(`events (${teamSlug}): ${error.message}`);
    total += rows.length;
  }
  console.log(`  ✓ ${total} events`);
}

async function seedPlans() {
  const plans = readJSON("plans.json");
  console.log(`Seeding ${plans.length} plans...`);

  // Fetch all events for game linking
  const { data: allEvents } = await supabase.from("events").select("id, starts_at, team_slug");

  for (const plan of plans) {
    // Resolve linked_game_event_id
    let linkedGameEventId: number | null = null;
    if (plan.linked_game?.game_starts_at) {
      const gameStartsAt = new Date(plan.linked_game.game_starts_at).toISOString();
      const match = allEvents?.find(
        (e: any) =>
          e.team_slug === plan.team_slug &&
          new Date(e.starts_at).toISOString() === gameStartsAt
      );
      if (match) linkedGameEventId = match.id;
    }

    // Insert plan
    const { data: planRow, error: planError } = await supabase
      .from("plans")
      .upsert(
        {
          team_slug: plan.team_slug,
          starts_at: plan.scheduled_at,
          ends_at: plan.ends_at,
          duration_min: plan.duration_min,
          type: plan.type,
          title: plan.title,
          location: plan.location || null,
          field_name: plan.field_name || null,
          linked_game_event_id: linkedGameEventId,
          theme: plan.theme || null,
        },
        { onConflict: "id", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    if (planError) {
      // If upsert fails (no id yet), try insert
      const { data: inserted, error: insertError } = await supabase
        .from("plans")
        .insert({
          team_slug: plan.team_slug,
          starts_at: plan.scheduled_at,
          ends_at: plan.ends_at,
          duration_min: plan.duration_min,
          type: plan.type,
          title: plan.title,
          location: plan.location || null,
          field_name: plan.field_name || null,
          linked_game_event_id: linkedGameEventId,
          theme: plan.theme || null,
        })
        .select("id")
        .single();

      if (insertError) throw new Error(`plan insert: ${insertError.message}`);
      if (!inserted) throw new Error("plan insert returned no data");

      await insertBlocks(inserted.id, plan.blocks);
    } else if (planRow) {
      // Clean existing blocks for idempotency
      await supabase.from("plan_blocks").delete().eq("plan_id", planRow.id);
      await insertBlocks(planRow.id, plan.blocks);
    }
  }
  console.log("  ✓ plans + blocks + drills");
}

async function insertBlocks(planId: number, blocks: any[]) {
  for (const block of blocks) {
    const { data: blockRow, error: blockError } = await supabase
      .from("plan_blocks")
      .insert({
        plan_id: planId,
        sequence: block.sequence,
        start_offset_min: block.start_offset_min,
        duration_min: block.duration_min,
        block_type: block.type,
        title: block.title,
        notes: block.notes || null,
        defensive_plays: block.defensive_plays?.length ? block.defensive_plays : null,
      })
      .select("id")
      .single();

    if (blockError) throw new Error(`block insert: ${blockError.message}`);
    if (!blockRow) continue;

    // Insert drill assignments
    const drillRows: any[] = [];

    if (block.stations?.length) {
      block.stations.forEach((s: any, i: number) => {
        drillRows.push({
          block_id: blockRow.id,
          sequence: i + 1,
          drill_slug: s.drill_slug,
          station_label: s.label,
        });
      });
    } else if (block.drill_slugs?.length) {
      block.drill_slugs.forEach((slug: string, i: number) => {
        drillRows.push({
          block_id: blockRow.id,
          sequence: i + 1,
          drill_slug: slug,
        });
      });
    }

    if (drillRows.length > 0) {
      const { error: drillError } = await supabase
        .from("plan_block_drills")
        .insert(drillRows);
      if (drillError) throw new Error(`drill insert: ${drillError.message}`);
    }
  }
}

async function main() {
  console.log("Starting seed...\n");
  await seedTeams();
  await seedDrills();
  await seedEvents();
  await seedPlans();
  console.log("\nSeed complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
