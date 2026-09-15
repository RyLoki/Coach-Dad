-- Add a season tag to teams so we can group Spring vs Fall rosters.
-- Values look like '2026-spring', '2026-fall'.
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS season TEXT NOT NULL DEFAULT '2026-spring';

-- Backfill the existing Spring 2026 teams (idempotent).
UPDATE teams SET season = '2026-spring'
  WHERE slug IN ('lugnuts-aaa', 'white-sox-farm2', 'dodgers-teeball');

-- Add the two Fall 2026 teams (idempotent via ON CONFLICT).
INSERT INTO teams (
  slug, display_name, full_name, level, league, kid_name, roster_size,
  head_coach, assistant_coaches, practice_template, practice_block_count,
  default_practice_duration_min, primary_sources, season, notes
) VALUES
  ('river-cats-aaa', 'River Cats', 'AAA River Cats', 'AAA',
   'Newton Baseball', 'Thomas', 12, 'Ryan', 2, 'standalone', 4, 60,
   ARRAY[]::TEXT[], '2026-fall', 'Fall 2026'),
  ('astros-tball',   'Astros',     'T-Ball Astros',  'Tee Ball',
   'Newton Baseball', 'Henry',  12, 'Ryan', 2, 'standalone', 4, 45,
   ARRAY[]::TEXT[], '2026-fall', 'Fall 2026')
ON CONFLICT (slug) DO UPDATE SET
  season = EXCLUDED.season,
  display_name = EXCLUDED.display_name,
  full_name = EXCLUDED.full_name;
