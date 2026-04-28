# Coach-Dad Seed Data

Source of truth for the initial Coach-Dad database.
Five JSON files. Import order: **source_documents → teams → drills → schedules → plans**.

The Claude Code build prompt at `../CLAUDE_CODE_PROMPT.md` references this folder by relative path.

---

## Files

### `source_documents.json`

11 rows. The PDFs we ship in the app so coach can tap a drill's "Source" link and jump to the exact page in the original document.

```ts
type SourceDocument = {
  slug: string;                    // PK (e.g. "perfect-90")
  title: string;                   // "The Perfect 90 Practice Plan"
  subtitle: string;                // "Marietta Baseball Academy"
  filename: string;                // "perfect-90.pdf" — clean name in Supabase Storage
  original_filename: string;       // original filename in the workspace folder, for reference
  pages: number;
  level_tags: ("AAA" | "Farm 2" | "Tee Ball")[];
};
```

The 11 documents:
- `perfect-90` — The Perfect 90 Practice Plan (Marietta) — primary AAA reference
- `ll-coach-pitch` — LL Coach Pitch 12-Week Program (2015) — primary Farm 2 reference
- `ll-tball` — LL Tee Ball Program — primary Tee Ball reference
- `mba-defensive-situations` — MBA Defensive Situations Booklet
- `mba-game-planner`, `mba-10-fielder-game-planner`
- `ultimate-infield-pack`, `ultimate-outfield-pack`, `ultimate-pitching-pack`, `hitting-drill-pack`, `base-running-guide`

### `teams.json`

Three rows. One per team.

```ts
type Team = {
  slug: string;                    // PK (e.g. "lugnuts-aaa")
  display_name: string;            // "Lugnuts"
  full_name: string;               // "NSELL AAA Lugnuts"
  level: "AAA" | "Farm 2" | "Tee Ball";
  league: string;                  // "NSELL"
  kid_name: string;                // "Thomas" | "Max" | "Henry"
  roster_size: number;
  head_coach: string;              // "Ryan"
  assistant_coaches: number;       // 2
  practice_template: string;       // "perfect-90-compressed-60" | "ll-coach-pitch-weekly" | "ll-tball-weekly"
  practice_block_count: number | null;
  default_practice_duration_min: number;
  primary_sources: string[];
  notes: string;
};
```

### `drills.json`

139 cards. Every drill in the system. All cards now have proper instructions — no placeholders.

```ts
type Drill = {
  slug: string;                    // PK
  name: string;
  category: "warmup" | "throwing" | "hitting" | "infield" | "outfield" |
            "pitching" | "baserunning" | "catcher" | "fielding" |
            "stations" | "situational" | "game";
  level_tags: ("AAA" | "Farm 2" | "Tee Ball")[];
  equipment: string;
  setup: string;
  instructions: string;
  coaching_points: string;
  source: {
    document_slug: string | null;  // FK to source_documents.slug
    page: number | null;           // page number for deep-linking the PDF
    display: string;               // human-readable label like "Perfect 90 p.7"
  };
};
```

**Slug prefixes** identify origin: `p90-` (Perfect 90), `cp-` (LL Coach Pitch), `tb-` (LL Tee Ball).

**Source linking.** When the coach taps "Source: Perfect 90 p.7" on a drill card, the app should open the hosted PDF at that page. Use the URL fragment `#page=N` — most browser PDF viewers (and `react-pdf`) honor it:

```
https://<supabase-project>.supabase.co/storage/v1/object/public/source-docs/perfect-90.pdf#page=7
```

If `page` is null, link to the document home (page 1). If `document_slug` is null, render as plain text.

102 of 139 drills have page-level deep links. The rest link to the document.

### `schedules.json`

A map of `team_slug → events[]`. Each event is a practice or a game.

```ts
type Event = {
  team_slug: string;
  kind: "practice" | "game";
  summary: string;
  start_local: string;             // ISO with -04:00 (EDT)
  end_local: string;
  start_utc: string;
  end_utc: string;
  duration_min: number;
  field_name: string;
  address: string;
  source_uid: string;

  // Games only:
  opponent?: string;
  home_or_away?: "home" | "away";
  pregame_practice?: {             // implicit pre-game practice for AAA & Farm 2
    start_local: string;           // = game start - 60min
    end_local: string;
    duration_min: number;
    type: "pregame";
  };
};
```

**Counts**:
- `lugnuts-aaa`: 1 standalone practice + 12 games (each game has a pregame_practice block)
- `white-sox-farm2`: 1 standalone practice + 10 games (each with pregame_practice)
- `dodgers-teeball`: 7 standalone practices + 7 games (no pre-game blocks)

### `plans.json`

31 practice plans (13 AAA / 11 Farm 2 / 7 Tee Ball).

```ts
type Plan = {
  team_slug: string;
  scheduled_at: string;
  ends_at: string;
  duration_min: number;
  type: "standalone" | "pregame";
  title: string;
  location: string;
  field_name: string;
  linked_game: {
    opponent: string | null;
    home_or_away: "home" | "away" | null;
    game_starts_at: string;
  } | null;
  theme: string;
  blocks: Block[];
};

type Block = {
  sequence: number;
  start_offset_min: number;
  duration_min: number;
  type: "intro" | "warmup" | "throwing" | "stations" | "drill_block" |
        "situational" | "free_play" | "conclusion" | "game";
  title: string;
  drill_slugs?: string[];
  stations?: { label: string; drill_slug: string }[];
  defensive_plays?: string[];
  notes: string;
};
```

**Templates:**

- **lugnuts-aaa** — Compressed Perfect 90 (60min): `5 Warmup → 8 Throwing → 14 Stations 1 → 14 Stations 2 → 19 Situational + Defensive Plays`
- **white-sox-farm2** — LL Coach Pitch weekly (60min): `3 Intro → 7 Stretch/Warmup → 35 CP Drill Sequence → 13 Defensive Plays Workshop → 2 Conclusion`
- **dodgers-teeball** — LL Tee Ball weekly (60min): `3 Intro → 40 T-Ball Drill Sequence → 13 Free Play → 4 Conclusion`

---

## Suggested Postgres schema

```sql
CREATE TABLE source_documents (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  filename TEXT NOT NULL,                      -- name in storage
  pages INT NOT NULL,
  level_tags TEXT[] NOT NULL DEFAULT '{}',
  storage_url TEXT NOT NULL                    -- public URL once uploaded
);

CREATE TABLE teams (
  slug TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  level TEXT NOT NULL,
  league TEXT NOT NULL,
  kid_name TEXT NOT NULL,
  roster_size INT NOT NULL,
  head_coach TEXT NOT NULL,
  assistant_coaches INT NOT NULL DEFAULT 0,
  practice_template TEXT NOT NULL,
  practice_block_count INT,
  default_practice_duration_min INT NOT NULL DEFAULT 60,
  primary_sources TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT
);

CREATE TABLE drills (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level_tags TEXT[] NOT NULL DEFAULT '{}',
  equipment TEXT,
  setup TEXT,
  instructions TEXT,
  coaching_points TEXT,
  source_document_slug TEXT REFERENCES source_documents(slug),
  source_page INT,
  source_display TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  team_slug TEXT NOT NULL REFERENCES teams(slug),
  kind TEXT NOT NULL CHECK (kind IN ('practice','game')),
  summary TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  field_name TEXT,
  address TEXT,
  source_uid TEXT UNIQUE,
  opponent TEXT,
  home_or_away TEXT
);

CREATE TABLE plans (
  id BIGSERIAL PRIMARY KEY,
  team_slug TEXT NOT NULL REFERENCES teams(slug),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  duration_min INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('standalone','pregame','weekly')),
  title TEXT NOT NULL,
  location TEXT,
  field_name TEXT,
  linked_game_event_id BIGINT REFERENCES events(id),
  theme TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','done')),
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plan_blocks (
  id BIGSERIAL PRIMARY KEY,
  plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  sequence INT NOT NULL,
  start_offset_min INT NOT NULL,
  duration_min INT NOT NULL,
  block_type TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  defensive_plays TEXT[],
  UNIQUE (plan_id, sequence)
);

CREATE TABLE plan_block_drills (
  id BIGSERIAL PRIMARY KEY,
  block_id BIGINT NOT NULL REFERENCES plan_blocks(id) ON DELETE CASCADE,
  sequence INT NOT NULL,
  drill_slug TEXT NOT NULL REFERENCES drills(slug),
  station_label TEXT,
  done BOOLEAN NOT NULL DEFAULT false,
  override_notes TEXT,
  UNIQUE (block_id, sequence)
);
```

`station_label` distinguishes stations (when `block_type = 'stations'`) from sequential drill lists.

---

## Source PDFs

Original PDFs live in the parent `Baseball Practice Plans/` folder. The `original_filename` field in `source_documents.json` maps each `slug` to the file on disk. During app standup, Claude Code uploads them to Supabase Storage with the clean `filename` and writes the public URL to `source_documents.storage_url`.

`_quality_samples/` contains a few rendered pages (CP p.26, CP p.64, T-Ball p.12) for spot-checking that drill cards match the source.
