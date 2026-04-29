import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SOURCE = "mba-defensive-situations";

type Position = { position: string; role: string };

const plays: {
  slug: string;
  name: string;
  source_page: number;
  description: string;
  positions: Position[];
}[] = [
  {
    slug: "cutoff-relay-single-gap",
    name: "Cut-off and relay from the outfield (single in the gap)",
    source_page: 8,
    description:
      "Ball is hit to the gap. The outfielder fields and throws to the relay man, who turns and throws to the base where the lead runner is heading.",
    positions: [
      { position: "CF/RF/LF", role: "Field the ball quickly, hit the cutoff man chest-high. Call out where to throw." },
      { position: "SS (or 2B)", role: "Line up as the relay/cutoff man between outfielder and target base. Arms up, give a target. Listen for call from infielder at the base." },
      { position: "3B", role: "Cover 3rd base. Call 'cut' or 'let it go' to the relay man based on runner position." },
      { position: "P", role: "Back up the base the throw is going to (usually 3B or home)." },
      { position: "C", role: "If throw is coming home, set up in front of the plate. If not, back up the throw to the appropriate base." },
      { position: "1B", role: "Stay on 1st base in case batter-runner rounds too far." },
    ],
  },
  {
    slug: "field-groundball-throw-1b",
    name: "Field a ground ball, throw to 1B for the out (every infield position)",
    source_page: 4,
    description:
      "The most fundamental defensive play. Every infielder must field a routine ground ball and make an accurate throw to first base.",
    positions: [
      { position: "Fielding infielder", role: "Get in front of the ball, field with two hands (glove out front, butt down). Crow-hop and throw chest-high to 1B." },
      { position: "1B", role: "Get to the bag early, stretch toward the throw with the glove-side foot on the bag. Give a big target." },
      { position: "P", role: "On balls hit to the right side, break toward 1B to cover if the 1B fields it away from the bag." },
      { position: "Other infielders", role: "Back up the throw or cover your base in case of an errant throw." },
      { position: "RF", role: "Back up the throw to 1B — always." },
    ],
  },
  {
    slug: "pitcher-cover-1b-right-side",
    name: "Pitcher covering 1B on a ball hit to the right side",
    source_page: 6,
    description:
      "When the ball is hit to the 1B or 2B side and the first baseman fields it away from the bag, the pitcher sprints to cover first.",
    positions: [
      { position: "P", role: "On contact to the right side, break immediately toward 1B. Run a banana path (arc toward foul territory) so you arrive at the bag running parallel to the baseline. Catch the toss, touch the bag, peel into foul territory." },
      { position: "1B", role: "Field the ball, give the pitcher a chest-high underhand toss well before the bag. Lead him to the base." },
      { position: "2B", role: "If you field it, flip to the pitcher covering. If 1B fields it, trail the play as a backup." },
      { position: "C", role: "Point and communicate. Back up 1B on errant throws." },
    ],
  },
  {
    slug: "popup-communication",
    name: "Pop-up communication (infield + catcher calling for the ball)",
    source_page: 10,
    description:
      "On a pop fly in the infield, one player calls it loudly and everyone else backs off. Priority: catcher > pitcher; 3B/SS > 2B/1B; any infielder > pitcher.",
    positions: [
      { position: "Player making the catch", role: "Call 'I got it! I got it!' loudly at least twice. Wave off other players. Camp under the ball, catch with two hands above the forehead." },
      { position: "Nearby players", role: "If you hear someone call it, back off immediately and say 'You got it!' Point at the caller." },
      { position: "C", role: "On pop-ups near the plate, you have priority. Rip off your mask, find the ball, call for it." },
      { position: "P", role: "Lowest priority. Back off unless no one else can get there." },
    ],
  },
  {
    slug: "popup-infielder-calling",
    name: "Pop-up: infielder calling 'I got it!' and others backing off",
    source_page: 10,
    description:
      "Same fundamental as pop-up communication. One voice, loud and clear. Everyone else yields.",
    positions: [
      { position: "Calling infielder", role: "Track the ball immediately, move under it. Call loud: 'I got it! I got it!' Catch above forehead with two hands." },
      { position: "Other infielders", role: "Freeze, listen for the call, then clear out. Say 'Take it!' to confirm." },
      { position: "OF behind the play", role: "Come in as backup in case the ball is dropped." },
    ],
  },
  {
    slug: "bunt-coverage",
    name: "Bunt coverage (charging 1B/3B, pitcher fielding, covering)",
    source_page: 14,
    description:
      "On a bunt, the corners charge, the pitcher breaks toward the ball, and someone covers the vacated bases.",
    positions: [
      { position: "3B", role: "Charge hard toward the plate on the bunt. Field if it goes to your side. If P or C fields it, retreat to cover 3B." },
      { position: "1B", role: "Charge toward the plate. If you field it, shovel to the pitcher covering 1B or throw to 2B." },
      { position: "P", role: "Break off the mound toward the ball. Field it, turn, and throw to the base where you can get the lead runner." },
      { position: "C", role: "Pounce on bunts near the plate. Call out where to throw: 'First! First!' or 'Two! Two!'" },
      { position: "SS", role: "Cover 3rd base if the 3B charged." },
      { position: "2B", role: "Cover 1st base if the 1B charged and pitcher is fielding." },
    ],
  },
  {
    slug: "catcher-bunt-throw-1b",
    name: "Catcher fielding a bunt and throwing to 1B",
    source_page: 14,
    description:
      "Catcher pounces on a bunt in front of the plate and makes a strong throw to first for the out.",
    positions: [
      { position: "C", role: "Mask off, sprint to the ball. Field with two hands, feet pointed toward 1B. Crow-hop and throw. Call out 'I got it!' to avoid collision with pitcher." },
      { position: "P", role: "Break toward the ball but pull up if catcher calls it. Then cover home plate." },
      { position: "1B", role: "Get back to the bag quickly and give a target." },
      { position: "3B", role: "Charge in for bunt coverage but pull up. Cover 3B if runners are moving." },
    ],
  },
  {
    slug: "force-play-2b-runner-1b",
    name: "Force play at 2B (runner on 1B, ground ball to SS)",
    source_page: 16,
    description:
      "With a runner on first, the SS fields a ground ball and throws to 2B for the force out.",
    positions: [
      { position: "SS", role: "Field the ball, look the runner back if needed, then throw chest-high to the 2B covering second base." },
      { position: "2B", role: "Get to the bag, straddle it. Catch the throw, tag the bag with your foot, get out of the way of the sliding runner. Optional: turn the double play to 1B." },
      { position: "1B", role: "Stay on the bag in case of a double play throw." },
      { position: "P", role: "Duck and get out of the throwing lane." },
    ],
  },
  {
    slug: "force-play-2b-runners-1b",
    name: "Force play at 2B with runners on 1B",
    source_page: 16,
    description:
      "Same as above — any infielder fields and throws to 2B for the force. Key is footwork at the bag.",
    positions: [
      { position: "Fielding infielder", role: "Field cleanly, throw to 2B. Aim for the chest of the covering player." },
      { position: "SS or 2B (covering)", role: "Get to the bag quickly. Left foot on the bag, catch, drag the foot across. Clear the runner." },
      { position: "1B", role: "Stretch for the relay if double play is on." },
      { position: "OF", role: "Back up the base behind the play." },
    ],
  },
  {
    slug: "double-play-turn",
    name: "Double play turn (4-6-3 and 6-4-3)",
    source_page: 18,
    description:
      "Turn two! The middle infielders receive a throw at second, touch the bag, and relay to first to complete the double play.",
    positions: [
      { position: "2B (4-6-3)", role: "Field the ball, underhand toss or throw to SS at the bag. Be quick and accurate." },
      { position: "SS (receiving 4-6-3)", role: "Arrive at the bag, catch the feed, left foot on the bag, pivot and throw hard to 1B. Avoid the runner." },
      { position: "SS (6-4-3)", role: "Field the ball, throw or flip to 2B at the bag." },
      { position: "2B (receiving 6-4-3)", role: "Get to the bag, right foot on the edge. Catch, step toward 1B, throw. Clear the slide." },
      { position: "1B", role: "Stretch and catch the relay throw. Scoop low throws." },
      { position: "P", role: "Hit the deck or get out of the throwing lane." },
    ],
  },
  {
    slug: "rundown-pickle",
    name: "Rundown between bases (pickle drill)",
    source_page: 20,
    description:
      "Runner is caught between bases. Goal: get the out in as few throws as possible (ideally 1-2). Run the runner back toward the previous base.",
    positions: [
      { position: "Player with the ball", role: "Sprint hard at the runner, ball up in your throwing hand (visible). Force the runner to commit, then throw to your teammate at the base they're running toward." },
      { position: "Player at receiving base", role: "Stand just in front of the bag on the inside of the baseline. Give a target. When you catch it, tag immediately." },
      { position: "Backup players", role: "Line up behind teammates at each base. After a throw, rotate in to cover the empty base." },
      { position: "Key rule", role: "Always run the runner BACK to the base they came from. Never more than 2-3 throws." },
    ],
  },
  {
    slug: "first-and-third-defense",
    name: "First-and-third defense (runner steals 2B)",
    source_page: 22,
    description:
      "Runners on 1st and 3rd. Runner on 1st breaks for 2B. Key: don't let the runner on 3rd score on the throw to 2B.",
    positions: [
      { position: "C", role: "Look the runner at 3B back. Quick throw to 2B (or fake and throw back to 3B). Use the 'cutoff' play: throw to pitcher/SS in front of 2B who checks the runner at 3rd." },
      { position: "SS", role: "One of two options: (A) cover 2B for the throw, or (B) line up as the cutoff in front of 2B to check the runner at 3rd. Pre-call with the catcher." },
      { position: "2B", role: "If SS is the cutoff, cover 2B behind them." },
      { position: "3B", role: "Stay near the bag and watch the runner. Yell 'Going!' if runner at 3B breaks." },
      { position: "P", role: "Step off the rubber, look at 3B. Be ready to cut the throw." },
    ],
  },
  {
    slug: "tag-play-home",
    name: "Tag play at home (outfielder fielding a single with runner on 2B)",
    source_page: 24,
    description:
      "Runner on 2nd scores on a base hit. The outfielder must field quickly and throw home. The catcher sets up for a tag play.",
    positions: [
      { position: "OF (fielding)", role: "Charge the ball, field on your throwing side, crow-hop and throw home. Hit the cutoff man if the throw won't beat the runner." },
      { position: "Cutoff (1B or 3B)", role: "Line up between the outfielder and home plate. Arms up, be the target. Cut it off if catcher waves you off, relay to another base." },
      { position: "C", role: "Set up in front of the plate (not blocking it until you have the ball). Catch the throw, swipe tag low. Let the runner come to you." },
      { position: "P", role: "Back up home plate — at least 20 feet behind the catcher." },
      { position: "SS/2B", role: "Cover the bases. Watch the batter-runner." },
    ],
  },
  {
    slug: "tagging-runner-home-outfield",
    name: "Tagging out a runner at home from the outfield",
    source_page: 24,
    description:
      "Same concept — the outfielder throws home and the catcher applies the tag. Focus: throw accuracy and catcher positioning.",
    positions: [
      { position: "OF", role: "Get behind the ball, field cleanly, throw to the glove-side of home plate. Low and on a hop is better than high and sailing." },
      { position: "C", role: "Position in front of plate, give target (glove-side). Receive throw, sweep tag down on the runner's hand/body as they slide in." },
      { position: "Cutoff man", role: "Line up. If the throw is off line or won't beat the runner, cut it and throw to another base to get trailing runners." },
      { position: "P", role: "Back up home plate, 20+ feet behind catcher in foul territory." },
    ],
  },
  {
    slug: "outfielder-base-hit-cutoff",
    name: "Outfielder fielding a base hit and throwing to the cut-off (SS or 2B)",
    source_page: 12,
    description:
      "On a clean single, the outfielder must field quickly and get the ball to the cutoff man to prevent the runner from advancing extra bases.",
    positions: [
      { position: "OF", role: "Charge the ball (don't wait for it). Field on your glove side, crow-hop, throw to the cutoff man's chest. Quick release beats arm strength." },
      { position: "SS or 2B (cutoff)", role: "Sprint out to line up between the outfielder and the base. Hands up, yell 'Hit me!' Turn and throw or hold based on the runner." },
      { position: "Other infielders", role: "Cover bases. 3B covers 3rd. Someone covers 2nd." },
      { position: "P", role: "Back up the base where the throw is headed." },
    ],
  },
  {
    slug: "outfielder-backup-throw-cutoff",
    name: "Outfielder backing up the throw to the cut-off",
    source_page: 12,
    description:
      "The outfielder who is NOT fielding the ball sprints behind the play as a backup in case the ball gets by the fielder or the throw goes offline.",
    positions: [
      { position: "Backup OF", role: "As soon as the ball is hit, sprint to back up the fielding outfielder (or back up the base a throw is going to). Stay 20-30 feet behind." },
      { position: "Fielding OF", role: "Field and throw as normal. Knowing backup is there lets you be aggressive." },
      { position: "Infield", role: "Run cutoff and cover bases as usual." },
    ],
  },
  {
    slug: "backup-throw-of-behind-2b",
    name: "Backing up the throw — outfielder behind 2B",
    source_page: 12,
    description:
      "CF backs up throws to 2nd base. On any throw from the catcher to 2B or relay throw to 2B, center field is the safety net.",
    positions: [
      { position: "CF", role: "On any steal attempt or throw to 2B, sprint in behind second base. Be 20-30 feet back, ready to field an overthrow." },
      { position: "SS/2B", role: "Cover the base and receive the throw normally." },
      { position: "C", role: "Make the throw to 2B. Knowing CF is backing up lets you be aggressive." },
    ],
  },
  {
    slug: "outfielder-hit-cutoff-or-home",
    name: "Outfielder hit-the-cutoff vs throw-it-home decision",
    source_page: 26,
    description:
      "The outfielder must decide: can I throw out the runner at home? Or should I hit the cutoff to prevent other runners from advancing? Rule of thumb: if you can't beat the runner by 2 steps, hit the cutoff.",
    positions: [
      { position: "OF", role: "Read the runner's speed and head start. If you can gun him out, throw home. If not, hit the cutoff man to keep the batter at 1B and other runners from advancing." },
      { position: "Cutoff man", role: "Line up, arms up, yell 'Hit me!' If the OF throws over you, let it go unless you hear 'Cut!'" },
      { position: "C", role: "Read the play. If the runner will score easily, yell 'CUT!' and direct the cutoff where to throw next (2B, 3B)." },
      { position: "3B or SS", role: "Be ready at 3B for a redirected throw if the cutoff man cuts it." },
    ],
  },
  {
    slug: "1b-groundball-tag-bag",
    name: "First baseman fielding a ground ball, tagging the bag",
    source_page: 5,
    description:
      "Ground ball hit right at the first baseman. If close enough to the bag, field it and step on the base yourself. No throw needed.",
    positions: [
      { position: "1B", role: "Field the ball cleanly. If you're within a step or two of the bag, take it yourself — touch the bag with your foot. If you're far from the bag, flip to the pitcher covering." },
      { position: "P", role: "Break to cover 1B on every ball hit to the right side. If 1B fields it and takes the bag, pull up." },
      { position: "2B", role: "Shift toward 1B to back up or cover if needed." },
    ],
  },
  {
    slug: "3b-slow-roller-throw-1b",
    name: "Third baseman fielding a slow roller, throwing to 1B",
    source_page: 5,
    description:
      "Slow ground ball or swinging bunt toward third. The 3B must charge, barehand (or glove), and make a strong throw on the run.",
    positions: [
      { position: "3B", role: "Charge hard. For a slow roller, barehand it (or short-hop with the glove). Plant your back foot, throw across your body to 1B. Don't rush — you have more time than you think." },
      { position: "SS", role: "Shift toward 3B to cover. If it's a bunt situation, be ready at 3B for a runner advancing." },
      { position: "1B", role: "Stretch toward the throw. Expect it to be lower or to your right side — be ready to pick it." },
      { position: "P", role: "Stay out of the throwing lane. Cover home if needed." },
    ],
  },
  {
    slug: "throwing-right-base",
    name: "Throwing to the right base on a base hit",
    source_page: 28,
    description:
      "Situational awareness: with runners on, the outfielder (or infielder) must know where to throw BEFORE the ball is hit. Always throw ahead of the lead runner.",
    positions: [
      { position: "All fielders", role: "Before every pitch, know: how many outs, where are the runners, where does the throw go if the ball comes to me? Think 'throw ahead of the lead runner.'" },
      { position: "OF", role: "Pre-pitch: if runner on 2B, throw goes home. If runner on 1B, throw goes to 3B. Nobody on, throw to 2B." },
      { position: "IF", role: "After fielding, look the lead runner back, then throw to the base for the out." },
      { position: "C/Coach", role: "Remind everyone before the pitch: 'Play is at ___!' Point to the base." },
    ],
  },
  {
    slug: "infield-positioning-count",
    name: "Infield positioning by count and game situation",
    source_page: 30,
    description:
      "Standard depth vs in (on the grass) vs double-play depth. Adjustments by count: early counts play deeper, 2-strike counts guard the lines.",
    positions: [
      { position: "All infielders", role: "Standard: halfway between grass and outfield. Double play depth: 2 steps back, shade toward 2B. Bunt D: charge position. 2-out, runner in scoring position: play in (on the edge of the grass)." },
      { position: "Coach signal", role: "Call out the depth before each pitch. 'Normal!' or 'In!' or 'Double play depth!' or 'Guard the lines!'" },
      { position: "SS/2B", role: "Double play depth: shade 2 steps toward 2B from normal position." },
      { position: "Corners", role: "Guarding the lines: 1B/3B move 2 steps toward their foul line in late innings with the lead." },
    ],
  },
  {
    slug: "infielder-positioning-hitter",
    name: "Infielder positioning by hitter (left vs right)",
    source_page: 30,
    description:
      "Shift based on whether the batter is left or right-handed. Pull hitters get more coverage on the pull side.",
    positions: [
      { position: "All infielders", role: "Right-handed hitter: shift slightly toward 3B/SS side (pull side). Left-handed hitter: shift slightly toward 1B/2B side." },
      { position: "SS", role: "vs RHH: shade toward the hole (between SS and 3B). vs LHH: move toward 2B." },
      { position: "2B", role: "vs RHH: shade toward 2B. vs LHH: shade toward the hole (between 1B and 2B)." },
      { position: "Coach note", role: "At this age, keep shifts small (1-2 steps). Big shifts create holes. Focus on fundamentals over advanced positioning." },
    ],
  },
  {
    slug: "outfield-positioning-hitter",
    name: "Outfield positioning by hitter / count",
    source_page: 32,
    description:
      "Outfielders adjust depth and angle based on hitter tendencies, game situation, and count. No fly ball over your head is the cardinal rule.",
    positions: [
      { position: "All outfielders", role: "Default: deep enough that nothing goes over your head. 2 outs / runner on 2B: play shallower to cut off singles. Strong hitter: back up 3-5 steps." },
      { position: "CF", role: "You're the captain. Talk to LF and RF. Shade toward the gap the hitter is most likely to hit to." },
      { position: "Corner OF", role: "Down the line: play fair by 2-3 steps from the line. Don't let a double go down the line in a close game." },
      { position: "Coach note", role: "Remind kids: 'It's easier to run forward than backward. Start deep.'" },
    ],
  },
  {
    slug: "pickoff-backpick-catcher",
    name: "Pickoff move and back-pick from catcher",
    source_page: 34,
    description:
      "The pitcher or catcher picks off a runner who's wandered too far off base. Quick snap throw to catch them leaning.",
    positions: [
      { position: "P (pickoff to 1B)", role: "Come set. Quick head fake or no-look move. Step toward 1B with your lead foot (must be direct — no balk). Throw to 1B's inside shoulder." },
      { position: "P (pickoff to 2B)", role: "Spin move (RHP: spin to glove side). Or use the 'daylight' play — when SS/2B flashes behind the runner, throw." },
      { position: "C (back-pick)", role: "After receiving the pitch, snap throw to a base where the runner is leaning. Most common: throw to 1B with a runner leading off, or 3B on a steal attempt." },
      { position: "1B/SS/3B (receiving)", role: "Break to the bag when you see the pickoff starting. Give a low target, catch and swipe tag down." },
    ],
  },
];

async function main() {
  console.log(`Seeding ${plays.length} defensive plays...`);

  const rows = plays.map((p) => ({
    slug: p.slug,
    name: p.name,
    source_document_slug: SOURCE,
    source_page: p.source_page,
    source_display: `MBA Defensive Situations p.${p.source_page}`,
    description: p.description,
    positions: p.positions,
  }));

  const { error } = await supabase
    .from("defensive_plays_catalog")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  // Now update plan_blocks to link defensive play names to slugs
  // Add a mapping column: plan_blocks.defensive_play_slugs
  console.log("✓ Defensive plays catalog seeded");

  // Create a name→slug mapping for updating plan_blocks
  const nameToSlug: Record<string, string> = {};
  for (const p of plays) {
    nameToSlug[p.name] = p.slug;
  }

  // Fetch all blocks with defensive plays
  const { data: blocks } = await supabase
    .from("plan_blocks")
    .select("id, defensive_plays")
    .not("defensive_plays", "is", null);

  if (blocks) {
    for (const block of blocks) {
      const slugs = (block.defensive_plays as string[]).map((name) => {
        // Find best match
        const exact = nameToSlug[name];
        if (exact) return exact;
        // Fuzzy match
        const match = plays.find((p) =>
          name.toLowerCase().includes(p.name.toLowerCase().slice(0, 20)) ||
          p.name.toLowerCase().includes(name.toLowerCase().slice(0, 20))
        );
        return match?.slug || null;
      });
      console.log(`  Block ${block.id}: ${slugs.filter(Boolean).length}/${(block.defensive_plays as string[]).length} matched`);
    }
  }

  console.log("\nDone!");
}

main();
