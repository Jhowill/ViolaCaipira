import { quoteSqlValues } from "@/database/schema/helpers";

const DIFFICULTY_LEVELS = quoteSqlValues(["beginner", "easy", "intermediate", "advanced"]);
const VERIFICATION_STATUSES = quoteSqlValues(["verified", "deprecated"]);
const PAIR_TYPES = quoteSqlValues(["unison", "octave", "custom"]);
const AUDIO_ROLES = quoteSqlValues(["single_string", "course_pair", "all_open", "sequence"]);

export const CATALOG_TUNINGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_tunings (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT NOT NULL,
  origin_region TEXT,
  open_chord_id TEXT,
  difficulty TEXT NOT NULL
    CHECK (difficulty IN (${DIFFICULTY_LEVELS})),
  verification_status TEXT NOT NULL
    CHECK (verification_status IN (${VERIFICATION_STATUSES})),
  reviewer_id TEXT,
  source_id TEXT,
  reviewed_at TEXT,
  tension_warning TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0
    CHECK (is_featured IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (open_chord_id) REFERENCES catalog_chords(id),
  FOREIGN KEY (reviewer_id) REFERENCES catalog_reviewers(id),
  FOREIGN KEY (source_id) REFERENCES catalog_sources(id)
);`.trim();

export const CATALOG_TUNING_ALIASES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_tuning_aliases (
  id TEXT PRIMARY KEY NOT NULL,
  tuning_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  region TEXT,
  notes TEXT,
  normalized_alias TEXT NOT NULL,
  UNIQUE (tuning_id, normalized_alias),
  FOREIGN KEY (tuning_id)
    REFERENCES catalog_tunings(id)
    ON DELETE CASCADE
);`.trim();

export const CATALOG_TUNING_COURSES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_tuning_courses (
  id TEXT PRIMARY KEY NOT NULL,
  tuning_id TEXT NOT NULL,
  course_number INTEGER NOT NULL
    CHECK (course_number BETWEEN 1 AND 5),
  pair_type TEXT NOT NULL
    CHECK (pair_type IN (${PAIR_TYPES})),
  label TEXT,
  sort_order INTEGER NOT NULL,
  UNIQUE (tuning_id, course_number),
  FOREIGN KEY (tuning_id)
    REFERENCES catalog_tunings(id)
    ON DELETE CASCADE
);`.trim();

export const CATALOG_TUNING_STRINGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_tuning_strings (
  id TEXT PRIMARY KEY NOT NULL,
  course_id TEXT NOT NULL,
  tuning_id TEXT NOT NULL,
  course_number INTEGER NOT NULL
    CHECK (course_number BETWEEN 1 AND 5),
  string_in_course INTEGER NOT NULL
    CHECK (string_in_course BETWEEN 1 AND 2),
  physical_string_number INTEGER NOT NULL
    CHECK (physical_string_number BETWEEN 1 AND 10),
  pitch_class INTEGER NOT NULL
    CHECK (pitch_class BETWEEN 0 AND 11),
  octave INTEGER NOT NULL
    CHECK (octave BETWEEN 0 AND 8),
  midi_note INTEGER NOT NULL
    CHECK (midi_note BETWEEN 0 AND 127),
  reference_frequency_440 REAL NOT NULL
    CHECK (reference_frequency_440 > 0),
  gauge_hint TEXT,
  material_hint TEXT,
  display_order INTEGER NOT NULL,
  UNIQUE (tuning_id, physical_string_number),
  UNIQUE (course_id, string_in_course),
  FOREIGN KEY (course_id)
    REFERENCES catalog_tuning_courses(id)
    ON DELETE CASCADE,
  FOREIGN KEY (tuning_id)
    REFERENCES catalog_tunings(id)
    ON DELETE CASCADE
);`.trim();

export const CATALOG_TUNING_AUDIO_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_tuning_audio (
  id TEXT PRIMARY KEY NOT NULL,
  tuning_id TEXT NOT NULL,
  course_id TEXT,
  string_id TEXT,
  asset_id TEXT NOT NULL,
  audio_role TEXT NOT NULL
    CHECK (audio_role IN (${AUDIO_ROLES})),
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (tuning_id) REFERENCES catalog_tunings(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES catalog_tuning_courses(id) ON DELETE CASCADE,
  FOREIGN KEY (string_id) REFERENCES catalog_tuning_strings(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES catalog_assets(id)
);`.trim();

export const CATALOG_TUNINGS_STATEMENTS = [
  CATALOG_TUNINGS_TABLE_SQL,
  CATALOG_TUNING_ALIASES_TABLE_SQL,
  CATALOG_TUNING_COURSES_TABLE_SQL,
  CATALOG_TUNING_STRINGS_TABLE_SQL,
  CATALOG_TUNING_AUDIO_TABLE_SQL,
  "CREATE INDEX IF NOT EXISTS idx_tuning_alias_normalized ON catalog_tuning_aliases(normalized_alias);",
  "CREATE INDEX IF NOT EXISTS idx_tuning_strings_tuning ON catalog_tuning_strings(tuning_id, physical_string_number);",
] as const;
