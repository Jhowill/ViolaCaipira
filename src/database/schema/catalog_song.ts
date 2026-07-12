import { quoteSqlValues } from "@/database/schema/helpers";

const DIFFICULTY_LEVELS = quoteSqlValues(["beginner", "easy", "intermediate", "advanced"]);
const SONG_COPYRIGHT_STATUSES = quoteSqlValues(["public_domain", "original", "authorized", "licensed"]);
const SONG_KEY_MODES = quoteSqlValues(["major", "minor", "modal", "unknown"]);
const SONG_VERIFICATION_STATUSES = quoteSqlValues(["verified", "deprecated"]);
const ARRANGEMENT_STATUSES = quoteSqlValues(["verified", "calculated", "symbols_only", "unavailable"]);
const ARRANGEMENT_CHORD_STATUSES = quoteSqlValues(["verified", "calculated", "symbol_only", "missing"]);
const SONG_RHYTHM_RELEVANCE = quoteSqlValues(["primary", "alternative", "practice"]);

export const CATALOG_SONGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_songs (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  artist TEXT,
  normalized_artist TEXT,
  composer TEXT,
  rights_holder TEXT,
  license_id TEXT NOT NULL,
  source_id TEXT,
  copyright_status TEXT NOT NULL
    CHECK (copyright_status IN (${SONG_COPYRIGHT_STATUSES})),
  original_key_pitch_class INTEGER
    CHECK (
      original_key_pitch_class IS NULL
      OR original_key_pitch_class BETWEEN 0 AND 11
    ),
  original_key_mode TEXT NOT NULL
    CHECK (original_key_mode IN (${SONG_KEY_MODES})),
  default_rhythm_id TEXT,
  default_bpm INTEGER
    CHECK (default_bpm IS NULL OR default_bpm BETWEEN 20 AND 400),
  time_signature_numerator INTEGER
    CHECK (time_signature_numerator IS NULL OR time_signature_numerator BETWEEN 1 AND 32),
  time_signature_denominator INTEGER
    CHECK (time_signature_denominator IS NULL OR time_signature_denominator IN (2, 4, 8, 16)),
  difficulty TEXT NOT NULL
    CHECK (difficulty IN (${DIFFICULTY_LEVELS})),
  document_format_version INTEGER NOT NULL
    CHECK (document_format_version >= 1),
  document_json TEXT NOT NULL,
  search_text TEXT NOT NULL,
  is_featured INTEGER NOT NULL DEFAULT 0
    CHECK (is_featured IN (0, 1)),
  sort_order INTEGER NOT NULL,
  verification_status TEXT NOT NULL
    CHECK (verification_status IN (${SONG_VERIFICATION_STATUSES})),
  reviewer_id TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (license_id) REFERENCES catalog_licenses(id),
  FOREIGN KEY (source_id) REFERENCES catalog_sources(id),
  FOREIGN KEY (default_rhythm_id) REFERENCES catalog_rhythms(id),
  FOREIGN KEY (reviewer_id) REFERENCES catalog_reviewers(id)
);`.trim();

export const CATALOG_SONG_CHORD_INDEX_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_song_chord_index (
  song_id TEXT NOT NULL,
  chord_id TEXT NOT NULL,
  first_occurrence_order INTEGER NOT NULL
    CHECK (first_occurrence_order >= 0),
  occurrence_count INTEGER NOT NULL
    CHECK (occurrence_count >= 1),
  PRIMARY KEY (song_id, chord_id),
  FOREIGN KEY (song_id) REFERENCES catalog_songs(id) ON DELETE CASCADE,
  FOREIGN KEY (chord_id) REFERENCES catalog_chords(id) ON DELETE CASCADE
);`.trim();

export const CATALOG_SONG_RHYTHMS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_song_rhythms (
  song_id TEXT NOT NULL,
  rhythm_id TEXT NOT NULL,
  pattern_id TEXT,
  relevance TEXT NOT NULL
    CHECK (relevance IN (${SONG_RHYTHM_RELEVANCE})),
  recommended_bpm INTEGER
    CHECK (recommended_bpm IS NULL OR recommended_bpm BETWEEN 20 AND 400),
  notes TEXT,
  PRIMARY KEY (song_id, rhythm_id),
  FOREIGN KEY (song_id) REFERENCES catalog_songs(id) ON DELETE CASCADE,
  FOREIGN KEY (rhythm_id) REFERENCES catalog_rhythms(id) ON DELETE CASCADE,
  FOREIGN KEY (pattern_id) REFERENCES catalog_rhythm_patterns(id) ON DELETE SET NULL
);`.trim();

export const CATALOG_SONG_ARRANGEMENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_song_arrangements (
  id TEXT PRIMARY KEY NOT NULL,
  song_id TEXT NOT NULL,
  tuning_id TEXT NOT NULL,
  name TEXT NOT NULL,
  arrangement_status TEXT NOT NULL
    CHECK (arrangement_status IN (${ARRANGEMENT_STATUSES})),
  key_pitch_class INTEGER NOT NULL
    CHECK (key_pitch_class BETWEEN 0 AND 11),
  key_mode TEXT NOT NULL
    CHECK (key_mode IN (${SONG_KEY_MODES})),
  capo_fret INTEGER NOT NULL
    CHECK (capo_fret BETWEEN 0 AND 15),
  recommended_bpm INTEGER
    CHECK (recommended_bpm IS NULL OR recommended_bpm BETWEEN 20 AND 400),
  notes TEXT,
  reviewer_id TEXT,
  source_id TEXT,
  calculation_version TEXT,
  is_recommended INTEGER NOT NULL DEFAULT 0
    CHECK (is_recommended IN (0, 1)),
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (song_id, tuning_id, key_pitch_class, key_mode, capo_fret, name),
  FOREIGN KEY (song_id) REFERENCES catalog_songs(id) ON DELETE CASCADE,
  FOREIGN KEY (tuning_id) REFERENCES catalog_tunings(id),
  FOREIGN KEY (reviewer_id) REFERENCES catalog_reviewers(id),
  FOREIGN KEY (source_id) REFERENCES catalog_sources(id)
);`.trim();

export const CATALOG_SONG_ARRANGEMENT_CHORDS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_song_arrangement_chords (
  id TEXT PRIMARY KEY NOT NULL,
  arrangement_id TEXT NOT NULL,
  chord_id TEXT NOT NULL,
  preferred_shape_id TEXT,
  fallback_shape_id TEXT,
  status TEXT NOT NULL
    CHECK (status IN (${ARRANGEMENT_CHORD_STATUSES})),
  notes TEXT,
  UNIQUE (arrangement_id, chord_id),
  FOREIGN KEY (arrangement_id) REFERENCES catalog_song_arrangements(id) ON DELETE CASCADE,
  FOREIGN KEY (chord_id) REFERENCES catalog_chords(id),
  FOREIGN KEY (preferred_shape_id) REFERENCES catalog_chord_shapes(id),
  FOREIGN KEY (fallback_shape_id) REFERENCES catalog_chord_shapes(id)
);`.trim();

export const CATALOG_SONG_SOURCES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_song_sources (
  song_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  license_id TEXT NOT NULL,
  attribution_text TEXT,
  PRIMARY KEY (song_id, source_id, license_id),
  FOREIGN KEY (song_id) REFERENCES catalog_songs(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES catalog_sources(id),
  FOREIGN KEY (license_id) REFERENCES catalog_licenses(id)
);`.trim();

export const CATALOG_SONG_STATEMENTS = [
  CATALOG_SONGS_TABLE_SQL,
  CATALOG_SONG_CHORD_INDEX_TABLE_SQL,
  CATALOG_SONG_RHYTHMS_TABLE_SQL,
  CATALOG_SONG_ARRANGEMENTS_TABLE_SQL,
  CATALOG_SONG_ARRANGEMENT_CHORDS_TABLE_SQL,
  CATALOG_SONG_SOURCES_TABLE_SQL,
  "CREATE INDEX IF NOT EXISTS idx_catalog_songs_title ON catalog_songs(normalized_title);",
  "CREATE INDEX IF NOT EXISTS idx_catalog_songs_artist ON catalog_songs(normalized_artist);",
] as const;
