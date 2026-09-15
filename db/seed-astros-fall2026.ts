/**
 * Seed the T-Ball Astros' Fall 2026 season:
 *   • 5 practices — full 60-min plans based on the Dodgers Spring 2026 template.
 *   • 5 games   — with a short 20-min pregame warmup plan, plus an `events` row
 *                 capturing the opponent + home/away so the plan links to it.
 *
 * All plans are location-blank per Ryan's ask (privacy).
 *
 * Run with: pnpm dlx tsx db/seed-astros-fall2026.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// -- load .env.local ---------------------------------------------------------
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TEAM_SLUG = "astros-tball";

// -- schedule ---------------------------------------------------------------
// Every entry is Eastern Time (-04:00 = EDT). Astros play 60-minute slots on
// Tue evenings (5:15-6:15) and Sun early afternoons (12-1).
type Event =
  | { date: string; start: string; end: string; type: "practice" }
  | { date: string; start: string; end: string; type: "game"; opponent: string; home_or_away: "home" | "away" };

const SCHEDULE: Event[] = [
  { date: "2026-09-15", start: "17:15", end: "18:15", type: "practice" },
  { date: "2026-09-20", start: "12:00", end: "13:00", type: "practice" },
  { date: "2026-09-22", start: "17:15", end: "18:15", type: "game", opponent: "Marlins", home_or_away: "home" },
  { date: "2026-09-27", start: "12:00", end: "13:00", type: "practice" },
  { date: "2026-09-29", start: "17:15", end: "18:15", type: "game", opponent: "Padres",  home_or_away: "home" },
  { date: "2026-10-04", start: "12:00", end: "13:00", type: "game", opponent: "Marlins", home_or_away: "home" },
  { date: "2026-10-06", start: "17:15", end: "18:15", type: "practice" },
  { date: "2026-10-11", start: "12:00", end: "13:00", type: "game", opponent: "Padres",  home_or_away: "home" },
  { date: "2026-10-13", start: "17:15", end: "18:15", type: "game", opponent: "Marlins", home_or_away: "home" },
  { date: "2026-10-18", start: "12:00", end: "13:00", type: "practice" },
];

const iso = (date: string, time: string) => `${date}T${time}:00-04:00`;

// -- practice templates (copied from Dodgers Spring 2026) -------------------
const PCA_THEMES = [
  "The Big Three (Have Fun, Try Hard, Be a Good Sport)",
  "Rebounding From Mistakes",
  "Filling Emotional Tanks",
  "Honoring the Game",
  "Trying Hard",
];

const WEEKLY_DRILLS: string[][] = [
  ["tb-plastic-ball-tag", "tb-grip-and-throw", "tb-throwing-practice", "tb-run-the-bases"],
  ["tb-statues", "tb-team-throwing", "tb-dry-practice-swing", "tb-practice-swing"],
  ["tb-left-field-center-field-right-field", "tb-position-fitness", "tb-swing-and-run", "tb-practice-throwing"],
  ["tb-clean-up-the-backyard", "tb-fielding", "tb-tee-hitting", "tb-run-the-bases"],
  ["tb-red-light-green-light", "tb-catching-practice", "tb-offense-and-defense-progression-3"],
];

function practiceBlocks(weekIdx: number, theme: string) {
  const drills = WEEKLY_DRILLS[weekIdx];
  return [
    {
      sequence: 1, start_offset_min: 0, duration_min: 3,
      block_type: "intro", title: "Gather + Welcome",
      notes: `Review names, PCA tip: ${theme}`,
    },
    {
      sequence: 2, start_offset_min: 3, duration_min: 40,
      block_type: "drill_block",
      title: `T-Ball Week ${weekIdx + 1}: Drill Sequence`,
      notes: "Follow the LL T-Ball weekly plan order. See per-drill cards.",
      drill_slugs: drills,
    },
    {
      sequence: 3, start_offset_min: 43, duration_min: 13,
      block_type: "free_play", title: "Free Play / Scrimmage",
      notes: "Unstructured play — kids tee up and hit, run bases, throw to a coach. Keep it FUN.",
    },
    {
      sequence: 4, start_offset_min: 56, duration_min: 4,
      block_type: "conclusion", title: "Conclusion + High Fives",
      notes: "Review what they learned, remind of next event.",
    },
  ];
}

// -- pregame template (T-Ball, ~20 min then play ball) -----------------------
function pregameBlocks(opponent: string) {
  return [
    {
      sequence: 1, start_offset_min: 0, duration_min: 3,
      block_type: "intro", title: "Team Huddle",
      notes: `Game vs ${opponent}. Big Three reminder: Have Fun, Try Hard, Be a Good Sport. Announce lineup + positions.`,
    },
    {
      sequence: 2, start_offset_min: 3, duration_min: 8,
      block_type: "warmup", title: "Warmup — Throwing + Running",
      notes: "Partner up ~10 ft apart, easy toss + catch. Then a lap of the bases together to get the legs going.",
      drill_slugs: ["tb-grip-and-throw", "tb-run-the-bases"],
    },
    {
      sequence: 3, start_offset_min: 11, duration_min: 6,
      block_type: "situational", title: "Positions Preview",
      notes: "Kids go to their starting positions. Coach walks the diamond, one reminder per player about their spot. Field a few grounders / pop-ups.",
      drill_slugs: ["tb-fielding"],
    },
    {
      sequence: 4, start_offset_min: 17, duration_min: 3,
      block_type: "conclusion", title: "Cheer + Play Ball",
      notes: `Team cheer, then play ball vs ${opponent}. Coach: feel free to shorten any block above if we're short on time — the goal is loose, warm, and ready.`,
    },
  ];
}

// ---------------------------------------------------------------------------
async function main() {
  console.log(`Seeding Astros Fall 2026: ${SCHEDULE.length} events`);

  // 1. Wipe any existing Astros plans + events (idempotent re-runs)
  const { data: prevPlans } = await supabase
    .from("plans").select("id").eq("team_slug", TEAM_SLUG);
  if (prevPlans?.length) {
    const ids = prevPlans.map((r: { id: number }) => r.id);
    await supabase.from("plan_blocks").delete().in("plan_id", ids);
    await supabase.from("plans").delete().in("id", ids);
    console.log(`  cleared ${ids.length} old plans`);
  }
  await supabase.from("events").delete().eq("team_slug", TEAM_SLUG);

  let practiceIdx = 0;
  let created = { practice: 0, pregame: 0, event: 0 };

  for (const evt of SCHEDULE) {
    const startsAt = iso(evt.date, evt.start);
    const endsAt = iso(evt.date, evt.end);

    // 2. For games: insert the event first so we can link the pregame plan to it
    let linkedEventId: number | null = null;
    if (evt.type === "game") {
      const { data: eventRow, error } = await supabase.from("events").insert({
        team_slug: TEAM_SLUG,
        kind: "game",
        summary: `vs ${evt.opponent}`,
        starts_at: startsAt,
        ends_at: endsAt,
        opponent: evt.opponent,
        home_or_away: evt.home_or_away,
      }).select("id").single();
      if (error) throw new Error(`event insert (${evt.date}): ${error.message}`);
      linkedEventId = eventRow!.id;
      created.event++;
    }

    // 3. Build the plan
    const isPractice = evt.type === "practice";
    const weekIdx = isPractice ? practiceIdx++ : -1;
    const theme = isPractice
      ? PCA_THEMES[weekIdx]
      : `Game day vs ${(evt as any).opponent} — pregame warmup (coach may shorten as needed)`;
    const title = isPractice
      ? `Practice · Week ${weekIdx + 1}`
      : `Pregame vs ${(evt as any).opponent}`;
    const blocks = isPractice
      ? practiceBlocks(weekIdx, theme)
      : pregameBlocks((evt as any).opponent);

    const { data: plan, error: planErr } = await supabase.from("plans").insert({
      team_slug: TEAM_SLUG,
      starts_at: startsAt,
      ends_at: endsAt,
      duration_min: isPractice ? 60 : 20,
      type: isPractice ? "standalone" : "pregame",
      title,
      theme,
      linked_game_event_id: linkedEventId,
    }).select("id").single();
    if (planErr || !plan) throw new Error(`plan (${evt.date}): ${planErr?.message}`);

    // 4. Insert blocks (and drill assignments)
    for (const b of blocks) {
      const { data: blockRow, error: blockErr } = await supabase
        .from("plan_blocks").insert({
          plan_id: plan.id,
          sequence: b.sequence,
          start_offset_min: b.start_offset_min,
          duration_min: b.duration_min,
          block_type: b.block_type,
          title: b.title,
          notes: b.notes,
        }).select("id").single();
      if (blockErr || !blockRow) throw new Error(`block ${b.sequence} for ${evt.date}: ${blockErr?.message}`);

      const drillSlugs: string[] = (b as any).drill_slugs || [];
      if (drillSlugs.length) {
        const rows = drillSlugs.map((slug, i) => ({
          block_id: blockRow.id,
          sequence: i + 1,
          drill_slug: slug,
        }));
        const { error: drillErr } = await supabase.from("plan_block_drills").insert(rows);
        if (drillErr) throw new Error(`drill assign (${evt.date}): ${drillErr.message}`);
      }
    }

    if (isPractice) created.practice++;
    else created.pregame++;
    console.log(`  ✓ ${evt.date} ${title}`);
  }

  console.log(`\n✅ Done: ${created.practice} practices, ${created.pregame} pregame plans, ${created.event} game events.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
