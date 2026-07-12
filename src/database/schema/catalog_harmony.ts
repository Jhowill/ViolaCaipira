import { quoteSqlValues } from "@/database/schema/helpers";

const DIFFICULTY_LEVELS = quoteSqlValues(["beginner", "easy", "intermediate", "advanced"]);
const CHORD_QUALITY_FAMILIES = quoteSqlValues([
  "major",
  "minor",
  "dominant",
  "diminished",
  "augmented",
  "suspended",
  "extended",
  "other",
]);
const CHORD_SHAPE_VERIFICATION_STATUSES = quoteSqlValues(["verified", "calculated", "deprecated"]);
const CHORD_SHAPE_REGIONS = quoteSqlValues(["open", "low", "middle", "high"]);
const CHORD_FINGERS = quoteSqlValues(["1", "2", "3", "4", "T"]);
const CHORD_SHAPE_AUDIO_ROLES = quoteSqlValues(["strum_down", "strum_up", "arpeggio"]);

export const CATALOG_CHORD_QUALITIES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_chord_qualities (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  symbol_suffix TEXT NOT NULL,
  family TEXT NOT NULL
    CHECK (
      family IN (${CHORD_QUALITY_FAMILIES})
    ),
  description TEXT,
  sort_order INTEGER NOT NULL,
  is_core_v1 INTEGER NOT NULL DEFAULT 0
    CHECK (is_core_v1 IN (0, 1))
);`.trim();

export const CATALOG_CHORD_QUALITY_INTERVALS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_chord_quality_intervals (
  id TEXT PRIMARY KEY NOT NULL,
  quality_id TEXT NOT NULL,
  semitones INTEGER NOT NULL
    CHECK (semitones BETWEEN 0 AND 23),
  degree_label TEXT NOT NULL,
  role TEXT NOT NULL
    CHECK (role IN ('root', 'third', 'fifth', 'seventh', 'extension', 'alteration')),
  sort_order INTEGER NOT NULL,
  is_required INTEGER NOT NULL DEFAULT 0
    CHECK (is_required IN (0, 1)),
  UNIQUE (quality_id, semitones, degree_label),
  FOREIGN KEY (quality_id)
    REFERENCES catalog_chord_qualities(id)
    ON DELETE CASCADE
);`.trim();

export const CATALOG_CHORDS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_chords (
  id TEXT PRIMARY KEY NOT NULL,
  root_pitch_class INTEGER NOT NULL
    CHECK (root_pitch_class BETWEEN 0 AND 11),
  quality_id TEXT NOT NULL,
  bass_pitch_class INTEGER
    CHECK (bass_pitch_class IS NULL OR bass_pitch_class BETWEEN 0 AND 11),
  canonical_symbol TEXT NOT NULL,
  normalized_search_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (root_pitch_class, quality_id, bass_pitch_class),
  FOREIGN KEY (quality_id)
    REFERENCES catalog_chord_qualities(id)
);`.trim();

export const CATALOG_CHORD_SHAPES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_chord_shapes (
  id TEXT PRIMARY KEY NOT NULL,
  chord_id TEXT NOT NULL,
  tuning_id TEXT NOT NULL,
  name TEXT,
  variation_number INTEGER NOT NULL
    CHECK (variation_number >= 1),
  starting_fret INTEGER NOT NULL
    CHECK (starting_fret BETWEEN 0 AND 30),
  ending_fret INTEGER NOT NULL
    CHECK (ending_fret BETWEEN 0 AND 30),
  fret_span INTEGER NOT NULL
    CHECK (fret_span BETWEEN 0 AND 12),
  difficulty TEXT NOT NULL
    CHECK (difficulty IN (${DIFFICULTY_LEVELS})),
  has_barre INTEGER NOT NULL DEFAULT 0
    CHECK (has_barre IN (0, 1)),
  position_region TEXT NOT NULL
    CHECK (position_region IN (${CHORD_SHAPE_REGIONS})),
  verification_status TEXT NOT NULL
    CHECK (verification_status IN (${CHORD_SHAPE_VERIFICATION_STATUSES})),
  reviewer_id TEXT,
  source_id TEXT,
  reviewed_at TEXT,
  calculation_version TEXT,
  ergonomic_score INTEGER
    CHECK (ergonomic_score IS NULL OR ergonomic_score BETWEEN 0 AND 100),
  sound_completeness_score INTEGER
    CHECK (
      sound_completeness_score IS NULL
      OR sound_completeness_score BETWEEN 0 AND 100
    ),
  is_recommended INTEGER NOT NULL DEFAULT 0
    CHECK (is_recommended IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (ending_fret >= starting_fret),
  UNIQUE (chord_id, tuning_id, variation_number),
  FOREIGN KEY (chord_id) REFERENCES catalog_chords(id),
  FOREIGN KEY (tuning_id) REFERENCES catalog_tunings(id),
  FOREIGN KEY (reviewer_id) REFERENCES catalog_reviewers(id),
  FOREIGN KEY (source_id) REFERENCES catalog_sources(id)
);`.trim();

export const CATALOG_CHORD_SHAPE_POSITIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_chord_shape_positions (
  id TEXT PRIMARY KEY NOT NULL,
  shape_id TEXT NOT NULL,
  tuning_string_id TEXT NOT NULL,
  physical_string_number INTEGER NOT NULL
    CHECK (physical_string_number BETWEEN 1 AND 10),
  course_number INTEGER NOT NULL
    CHECK (course_number BETWEEN 1 AND 5),
  string_in_course INTEGER NOT NULL
    CHECK (string_in_course BETWEEN 1 AND 2),
  fret INTEGER NOT NULL
    CHECK (fret BETWEEN -1 AND 30),
  finger TEXT
    CHECK (finger IS NULL OR finger IN (${CHORD_FINGERS})),
  is_root INTEGER NOT NULL DEFAULT 0
    CHECK (is_root IN (0, 1)),
  resulting_pitch_class INTEGER
    CHECK (
      resulting_pitch_class IS NULL
      OR resulting_pitch_class BETWEEN 0 AND 11
    ),
  resulting_octave INTEGER,
  interval_semitones INTEGER,
  interval_label TEXT,
  UNIQUE (shape_id, physical_string_number),
  FOREIGN KEY (shape_id)
    REFERENCES catalog_chord_shapes(id)
    ON DELETE CASCADE,
  FOREIGN KEY (tuning_string_id)
    REFERENCES catalog_tuning_strings(id)
);`.trim();

export const CATALOG_CHORD_SHAPE_BARRES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_chord_shape_barres (
  id TEXT PRIMARY KEY NOT NULL,
  shape_id TEXT NOT NULL,
  fret INTEGER NOT NULL
    CHECK (fret BETWEEN 1 AND 30),
  from_physical_string INTEGER NOT NULL
    CHECK (from_physical_string BETWEEN 1 AND 10),
  to_physical_string INTEGER NOT NULL
    CHECK (to_physical_string BETWEEN 1 AND 10),
  finger TEXT NOT NULL
    CHECK (finger IN (${CHORD_FINGERS})),
  sort_order INTEGER NOT NULL,
  CHECK (from_physical_string <= to_physical_string),
  FOREIGN KEY (shape_id)
    REFERENCES catalog_chord_shapes(id)
    ON DELETE CASCADE
);`.trim();

export const CATALOG_CHORD_SHAPE_AUDIO_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_chord_shape_audio (
  shape_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  role TEXT NOT NULL
    CHECK (role IN (${CHORD_SHAPE_AUDIO_ROLES})),
  is_primary INTEGER NOT NULL DEFAULT 0
    CHECK (is_primary IN (0, 1)),
  PRIMARY KEY (shape_id, asset_id, role),
  FOREIGN KEY (shape_id) REFERENCES catalog_chord_shapes(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES catalog_assets(id)
);`.trim();

export const CATALOG_CHORD_SHAPE_SOURCES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_chord_shape_sources (
  shape_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  reviewer_id TEXT,
  note TEXT,
  PRIMARY KEY (shape_id, source_id),
  FOREIGN KEY (shape_id) REFERENCES catalog_chord_shapes(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES catalog_sources(id),
  FOREIGN KEY (reviewer_id) REFERENCES catalog_reviewers(id)
);`.trim();

export const CATALOG_CHORDS_STATEMENTS = [
  CATALOG_CHORD_QUALITIES_TABLE_SQL,
  CATALOG_CHORD_QUALITY_INTERVALS_TABLE_SQL,
  CATALOG_CHORDS_TABLE_SQL,
  CATALOG_CHORD_SHAPES_TABLE_SQL,
  CATALOG_CHORD_SHAPE_POSITIONS_TABLE_SQL,
  CATALOG_CHORD_SHAPE_BARRES_TABLE_SQL,
  CATALOG_CHORD_SHAPE_AUDIO_TABLE_SQL,
  CATALOG_CHORD_SHAPE_SOURCES_TABLE_SQL,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_chords_unique_signature ON catalog_chords(root_pitch_class, quality_id, COALESCE(bass_pitch_class, -1));",
  "CREATE INDEX IF NOT EXISTS idx_chords_root_quality ON catalog_chords(root_pitch_class, quality_id);",
  "CREATE INDEX IF NOT EXISTS idx_shapes_tuning_chord ON catalog_chord_shapes(tuning_id, chord_id);",
  "CREATE INDEX IF NOT EXISTS idx_shapes_verified ON catalog_chord_shapes(tuning_id, verification_status, is_recommended, difficulty);",
] as const;
