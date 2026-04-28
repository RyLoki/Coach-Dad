export type SourceDocument = {
  slug: string;
  title: string;
  subtitle: string | null;
  filename: string;
  pages: number;
  level_tags: string[];
  storage_url: string;
};

export type Team = {
  slug: string;
  display_name: string;
  full_name: string;
  level: string;
  league: string;
  kid_name: string;
  roster_size: number;
  head_coach: string;
  assistant_coaches: number;
  practice_template: string;
  practice_block_count: number | null;
  default_practice_duration_min: number;
  primary_sources: string[];
  notes: string | null;
};

export type Drill = {
  slug: string;
  name: string;
  category: string;
  level_tags: string[];
  equipment: string | null;
  setup: string | null;
  instructions: string | null;
  coaching_points: string | null;
  source_document_slug: string | null;
  source_page: number | null;
  source_display: string | null;
  created_at: string;
  updated_at: string;
};

export type DrillWithSource = Drill & {
  source_documents: { storage_url: string } | null;
};

export type Event = {
  id: number;
  team_slug: string;
  kind: "practice" | "game";
  summary: string | null;
  starts_at: string;
  ends_at: string;
  field_name: string | null;
  address: string | null;
  source_uid: string | null;
  opponent: string | null;
  home_or_away: string | null;
};

export type Plan = {
  id: number;
  team_slug: string;
  starts_at: string;
  ends_at: string;
  duration_min: number;
  type: string;
  title: string;
  location: string | null;
  field_name: string | null;
  linked_game_event_id: number | null;
  theme: string | null;
  status: "upcoming" | "active" | "done";
  started_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PlanBlock = {
  id: number;
  plan_id: number;
  sequence: number;
  start_offset_min: number;
  duration_min: number;
  block_type: string;
  title: string;
  notes: string | null;
  defensive_plays: string[] | null;
};

export type PlanBlockDrill = {
  id: number;
  block_id: number;
  sequence: number;
  drill_slug: string;
  station_label: string | null;
  done: boolean;
  override_notes: string | null;
};

export type PlanBlockWithDrills = PlanBlock & {
  plan_block_drills: (PlanBlockDrill & {
    drills: DrillWithSource;
  })[];
};

export type PlanWithBlocks = Plan & {
  teams: Team;
  plan_blocks: PlanBlockWithDrills[];
};
