import { quoteSqlValues } from "@/database/schema/helpers";

const DIFFICULTY_LEVELS = quoteSqlValues(["beginner", "easy", "intermediate", "advanced"]);
const RHYTHM_VERIFICATION_STATUSES = quoteSqlValues(["verified", "deprecated"]);
const RHYTHM_PATTERN_HAND_MODES = quoteSqlValues(["neutral", "right_hand_reference"]);
const RHYTHM_STEP_DIRECTIONS = quoteSqlValues(["down", "up", "none"]);
const RHYTHM_STEP_ACTIONS = quoteSqlValues(["strike", "mute", "percussion", "rest", "brush", "pluck"]);
const RHYTHM_STEP_HAND_PARTS = quoteSqlValues(["thumb", "index", "middle", "ring", "multiple", "unspecified"]);
const RHYTHM_AUDIO_ROLES = quoteSqlValues(["slow", "normal", "metronome", "count_in", "demonstration"]);
const TUNING_RELATION_RELEVANCE = quoteSqlValues(["primary", "common", "possible"]);

export const CATALOG_RHYTHMS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_rhythms (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT,
  origin_region TEXT,
  time_signature_numerator INTEGER NOT NULL
    CHECK (time_signature_numerator BETWEEN 1 AND 32),
  time_signature_denominator INTEGER NOT NULL
    CHECK (time_signature_denominator IN (2, 4, 8, 16)),
  default_bpm INTEGER NOT NULL
    CHECK (default_bpm BETWEEN 20 AND 300),
  min_practice_bpm INTEGER NOT NULL
    CHECK (min_practice_bpm BETWEEN 20 AND 300),
  max_recommended_bpm INTEGER NOT NULL
    CHECK (max_recommended_bpm BETWEEN 20 AND 400),
  pulses_per_quarter INTEGER NOT NULL
    CHECK (pulses_per_quarter IN (96, 120, 240, 480, 960)),
  difficulty TEXT NOT NULL
    CHECK (difficulty IN (${DIFFICULTY_LEVELS})),
  verification_status TEXT NOT NULL
    CHECK (verification_status IN (${RHYTHM_VERIFICATION_STATUSES})),
  reviewer_id TEXT,
  source_id TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0
    CHECK (is_featured IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (reviewer_id) REFERENCES catalog_reviewers(id),
  FOREIGN KEY (source_id) REFERENCES catalog_sources(id)
);`.trim();

export const CATALOG_RHYTHM_PATTERNS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_rhythm_patterns (
  id TEXT PRIMARY KEY NOT NULL,
  rhythm_id TEXT NOT NULL,
  name TEXT NOT NULL,
  level TEXT NOT NULL
    CHECK (level IN (${DIFFICULTY_LEVELS})),
  hand_mode TEXT NOT NULL
    CHECK (hand_mode IN (${RHYTHM_PATTERN_HAND_MODES})),
  total_ticks INTEGER NOT NULL
    CHECK (total_ticks >= 0),
  bars INTEGER NOT NULL
    CHECK (bars >= 1),
  is_primary INTEGER NOT NULL DEFAULT 0
    CHECK (is_primary IN (0, 1)),
  sort_order INTEGER NOT NULL,
  notes TEXT,
  FOREIGN KEY (rhythm_id) REFERENCES catalog_rhythms(id) ON DELETE CASCADE
);`.trim();

export const CATALOG_RHYTHM_STEPS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_rhythm_steps (
  id TEXT PRIMARY KEY NOT NULL,
  pattern_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  position_ticks INTEGER NOT NULL
    CHECK (position_ticks >= 0),
  duration_ticks INTEGER NOT NULL
    CHECK (duration_ticks > 0),
  beat_label TEXT,
  direction TEXT NOT NULL
    CHECK (direction IN (${RHYTHM_STEP_DIRECTIONS})),
  action TEXT NOT NULL
    CHECK (action IN (${RHYTHM_STEP_ACTIONS})),
  hand_part TEXT NOT NULL
    CHECK (hand_part IN (${RHYTHM_STEP_HAND_PARTS})),
  string_range_from INTEGER
    CHECK (string_range_from IS NULL OR string_range_from BETWEEN 1 AND 10),
  string_range_to INTEGER
    CHECK (string_range_to IS NULL OR string_range_to BETWEEN 1 AND 10),
  intensity INTEGER NOT NULL
    CHECK (intensity BETWEEN 0 AND 100),
  is_accent INTEGER NOT NULL DEFAULT 0
    CHECK (is_accent IN (0, 1)),
  label TEXT,
  UNIQUE (pattern_id, step_order),
  FOREIGN KEY (pattern_id) REFERENCES catalog_rhythm_patterns(id) ON DELETE CASCADE
);`.trim();

export const CATALOG_RHYTHM_AUDIO_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_rhythm_audio (
  id TEXT PRIMARY KEY NOT NULL,
  rhythm_id TEXT NOT NULL,
  pattern_id TEXT,
  asset_id TEXT NOT NULL,
  role TEXT NOT NULL
    CHECK (role IN (${RHYTHM_AUDIO_ROLES})),
  bpm INTEGER
    CHECK (bpm IS NULL OR bpm BETWEEN 20 AND 400),
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (rhythm_id) REFERENCES catalog_rhythms(id) ON DELETE CASCADE,
  FOREIGN KEY (pattern_id) REFERENCES catalog_rhythm_patterns(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES catalog_assets(id)
);`.trim();

export const CATALOG_RHYTHM_STATEMENTS = [
  CATALOG_RHYTHMS_TABLE_SQL,
  CATALOG_RHYTHM_PATTERNS_TABLE_SQL,
  CATALOG_RHYTHM_STEPS_TABLE_SQL,
  CATALOG_RHYTHM_AUDIO_TABLE_SQL,
  `CREATE TABLE IF NOT EXISTS catalog_tuning_style_links (
  tuning_id TEXT NOT NULL,
  rhythm_id TEXT NOT NULL,
  relevance TEXT NOT NULL
    CHECK (relevance IN (${TUNING_RELATION_RELEVANCE})),
  notes TEXT,
  PRIMARY KEY (tuning_id, rhythm_id),
  FOREIGN KEY (tuning_id) REFERENCES catalog_tunings(id) ON DELETE CASCADE,
  FOREIGN KEY (rhythm_id) REFERENCES catalog_rhythms(id) ON DELETE CASCADE
);`.trim(),
  "CREATE INDEX IF NOT EXISTS idx_rhythm_steps_pattern_order ON catalog_rhythm_steps(pattern_id, step_order);",
] as const;
