import { quoteSqlValues } from "@/database/schema/helpers";

const DIFFICULTY_LEVELS = quoteSqlValues(["beginner", "easy", "intermediate", "advanced"]);
const EXERCISE_TYPES = quoteSqlValues([
  "single_chord",
  "chord_change",
  "progression",
  "rhythm",
  "scale",
  "coordination",
  "barre",
]);
const EXERCISE_EVENT_TYPES = quoteSqlValues(["chord", "rest", "instruction"]);
const EXERCISE_TAG_CATEGORIES = quoteSqlValues(["song_style", "difficulty", "region", "occasion", "technique", "custom"]);

export const CATALOG_EXERCISES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_exercises (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  exercise_type TEXT NOT NULL
    CHECK (exercise_type IN (${EXERCISE_TYPES})),
  tuning_id TEXT,
  rhythm_id TEXT,
  pattern_id TEXT,
  difficulty TEXT NOT NULL
    CHECK (difficulty IN (${DIFFICULTY_LEVELS})),
  default_bpm INTEGER
    CHECK (default_bpm IS NULL OR default_bpm BETWEEN 20 AND 400),
  min_bpm INTEGER
    CHECK (min_bpm IS NULL OR min_bpm BETWEEN 20 AND 400),
  max_bpm INTEGER
    CHECK (max_bpm IS NULL OR max_bpm BETWEEN 20 AND 400),
  duration_seconds INTEGER
    CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  verification_status TEXT NOT NULL
    CHECK (verification_status IN ('verified', 'deprecated')),
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (tuning_id) REFERENCES catalog_tunings(id),
  FOREIGN KEY (rhythm_id) REFERENCES catalog_rhythms(id),
  FOREIGN KEY (pattern_id) REFERENCES catalog_rhythm_patterns(id)
);`.trim();

export const CATALOG_EXERCISE_EVENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_exercise_events (
  id TEXT PRIMARY KEY NOT NULL,
  exercise_id TEXT NOT NULL,
  event_order INTEGER NOT NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN (${EXERCISE_EVENT_TYPES})),
  chord_id TEXT,
  shape_id TEXT,
  bars INTEGER
    CHECK (bars IS NULL OR bars >= 0),
  beats INTEGER
    CHECK (beats IS NULL OR beats >= 0),
  instruction_text TEXT,
  UNIQUE (exercise_id, event_order),
  FOREIGN KEY (exercise_id) REFERENCES catalog_exercises(id) ON DELETE CASCADE,
  FOREIGN KEY (chord_id) REFERENCES catalog_chords(id),
  FOREIGN KEY (shape_id) REFERENCES catalog_chord_shapes(id)
);`.trim();

export const CATALOG_EXERCISE_ASSETS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_exercise_assets (
  exercise_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  role TEXT NOT NULL
    CHECK (role IN ('audio', 'illustration')),
  is_primary INTEGER NOT NULL DEFAULT 0
    CHECK (is_primary IN (0, 1)),
  PRIMARY KEY (exercise_id, asset_id, role),
  FOREIGN KEY (exercise_id) REFERENCES catalog_exercises(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES catalog_assets(id)
);`.trim();

export const CATALOG_TAGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_tags (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN (${EXERCISE_TAG_CATEGORIES}))
);`.trim();

export const CATALOG_SONG_TAGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_song_tags (
  entity_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (entity_id, tag_id),
  FOREIGN KEY (entity_id) REFERENCES catalog_songs(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES catalog_tags(id) ON DELETE CASCADE
);`.trim();

export const CATALOG_RHYTHM_TAGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_rhythm_tags (
  entity_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (entity_id, tag_id),
  FOREIGN KEY (entity_id) REFERENCES catalog_rhythms(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES catalog_tags(id) ON DELETE CASCADE
);`.trim();

export const CATALOG_EXERCISE_TAGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_exercise_tags (
  entity_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (entity_id, tag_id),
  FOREIGN KEY (entity_id) REFERENCES catalog_exercises(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES catalog_tags(id) ON DELETE CASCADE
);`.trim();

export const CATALOG_EXERCISE_STATEMENTS = [
  CATALOG_EXERCISES_TABLE_SQL,
  CATALOG_EXERCISE_EVENTS_TABLE_SQL,
  CATALOG_EXERCISE_ASSETS_TABLE_SQL,
  CATALOG_TAGS_TABLE_SQL,
  CATALOG_RHYTHM_TAGS_TABLE_SQL,
  CATALOG_SONG_TAGS_TABLE_SQL,
  CATALOG_EXERCISE_TAGS_TABLE_SQL,
] as const;
