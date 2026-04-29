import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function summarize(drill: {
  name: string;
  instructions: string | null;
  setup: string | null;
  category: string;
}): string {
  const text = drill.instructions || drill.setup || "";
  if (!text) return `${drill.category} drill.`;

  // Get the first sentence (up to first period, exclamation, or question mark followed by space/end)
  const match = text.match(/^(.+?[.!?])(?:\s|$)/);
  let summary = match ? match[1] : text;

  // If first sentence is too long, truncate at ~120 chars
  if (summary.length > 140) {
    summary = summary.slice(0, 137).replace(/\s+\S*$/, "") + "...";
  }

  // If first sentence is too short/generic, grab two sentences
  if (summary.length < 30 && text.length > summary.length) {
    const match2 = text.match(/^(.+?[.!?]\s.+?[.!?])(?:\s|$)/);
    if (match2 && match2[1].length <= 150) {
      summary = match2[1];
    }
  }

  return summary;
}

async function main() {
  const { data: drills } = await supabase
    .from("drills")
    .select("slug, name, instructions, setup, category")
    .order("slug");

  if (!drills) {
    console.error("No drills found");
    return;
  }

  console.log(`Generating summaries for ${drills.length} drills...\n`);

  let updated = 0;
  for (const drill of drills) {
    const summary = summarize(drill);
    const { error } = await supabase
      .from("drills")
      .update({ summary })
      .eq("slug", drill.slug);

    if (error) {
      console.error(`  Error on ${drill.slug}: ${error.message}`);
    } else {
      updated++;
    }
  }

  console.log(`\n✓ Updated ${updated}/${drills.length} drills with summaries.`);

  // Print a few samples
  const { data: samples } = await supabase
    .from("drills")
    .select("slug, summary")
    .limit(10);
  console.log("\nSamples:");
  samples?.forEach((s) => console.log(`  ${s.slug}: ${s.summary}`));
}

main();
