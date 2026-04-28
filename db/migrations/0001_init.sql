CREATE TABLE source_documents (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  filename TEXT NOT NULL,
  pages INT NOT NULL,
  level_tags TEXT[] NOT NULL DEFAULT '{}',
  storage_url TEXT NOT NULL
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
