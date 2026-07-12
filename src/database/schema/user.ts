import { quoteSqlValues } from "@/database/schema/helpers";

const DIAGRAM_ORIENTATIONS = quoteSqlValues(["standard", "mirrored"]);
const DIAGRAM_MODES = quoteSqlValues(["five_courses", "ten_strings"]);
const HANDEDNESSES = quoteSqlValues(["right", "left"]);
const THEME_MODES = quoteSqlValues(["system", "light", "dark"]);
const INTERNAL_TEXT_SCALES = quoteSqlValues(["system", "large", "extra_large"]);
const NOISE_FILTER_LEVELS = quoteSqlValues(["low", "medium", "high"]);
const TUNER_MODES = quoteSqlValues(["guided", "chromatic", "reference"]);
const PREFERRED_ORIENTATIONS = quoteSqlValues(["system", "portrait", "landscape"]);
const DIFFICULTY_LEVELS = quoteSqlValues(["beginner", "easy", "intermediate", "advanced"]);
const SONG_MODES = quoteSqlValues(["major", "minor", "modal", "unknown"]);
const SONG_COPYRIGHT_CONFIRMATIONS = quoteSqlValues([
  "own_work",
  "authorized",
  "personal_use_confirmed",
  "unknown",
]);
const USER_SONG_CHANGE_REASONS = quoteSqlValues([
  "manual_save",
  "autosave_recovery",
  "import",
  "restore",
  "before_delete",
]);
const USER_DRAFT_TYPES = quoteSqlValues(["new", "edit", "import"]);
const USER_DRAFT_RECOVERY_STATUSES = quoteSqlValues(["active", "recovered", "discarded"]);
const USER_RESUME_TYPES = quoteSqlValues(["song", "rhythm", "exercise", "draft", "tuner_session"]);
const USER_TUNING_SESSION_MODES = quoteSqlValues(["guided", "chromatic"]);
const USER_TUNING_SESSION_STATUSES = quoteSqlValues(["started", "completed", "cancelled", "interrupted"]);
const USER_TUNING_SESSION_RESULTS = quoteSqlValues(["in_tune", "skipped", "not_completed"]);
const USER_PRACTICE_TYPES = quoteSqlValues(["rhythm", "exercise", "song", "metronome", "chord"]);
const USER_PRACTICE_STATUSES = quoteSqlValues(["completed", "cancelled", "interrupted"]);
const USER_FAVORITE_ENTITY_TYPES = quoteSqlValues(["tuning", "chord_shape", "song", "rhythm", "exercise"]);
const USER_RECENT_ENTITY_TYPES = quoteSqlValues(["tuning", "chord_shape", "song", "rhythm", "exercise"]);
const USER_CHORD_SHAPE_FINGERS = quoteSqlValues(["1", "2", "3", "4", "T"]);
const CONTENT_ORIGINS = quoteSqlValues(["catalog", "user"]);
const ACCIDENTAL_PREFERENCES = quoteSqlValues(["contextual", "sharps", "flats"]);

export const USER_PROFILE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY NOT NULL
    CHECK (id = 'local_user'),
  experience_level TEXT NOT NULL
    CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  onboarding_status TEXT NOT NULL
    CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed')),
  onboarding_step TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`.trim();

export const USER_APP_PREFERENCES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_app_preferences (
  id TEXT PRIMARY KEY NOT NULL
    CHECK (id = 'app_preferences'),
  active_tuning_origin TEXT NOT NULL
    CHECK (active_tuning_origin IN (${CONTENT_ORIGINS})),
  active_tuning_id TEXT NOT NULL,
  accidental_preference TEXT NOT NULL
    CHECK (accidental_preference IN (${ACCIDENTAL_PREFERENCES})),
  handedness TEXT NOT NULL
    CHECK (handedness IN (${HANDEDNESSES})),
  diagram_orientation TEXT NOT NULL
    CHECK (diagram_orientation IN (${DIAGRAM_ORIENTATIONS})),
  diagram_mode TEXT NOT NULL
    CHECK (diagram_mode IN (${DIAGRAM_MODES})),
  show_calculated_shapes INTEGER NOT NULL
    CHECK (show_calculated_shapes IN (0, 1)),
  expand_theory_details INTEGER NOT NULL
    CHECK (expand_theory_details IN (0, 1)),
  locale TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`.trim();

export const USER_APPEARANCE_PREFERENCES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_appearance_preferences (
  id TEXT PRIMARY KEY NOT NULL
    CHECK (id = 'appearance_preferences'),
  theme_mode TEXT NOT NULL
    CHECK (theme_mode IN (${THEME_MODES})),
  high_contrast INTEGER NOT NULL
    CHECK (high_contrast IN (0, 1)),
  internal_text_scale TEXT NOT NULL
    CHECK (internal_text_scale IN (${INTERNAL_TEXT_SCALES})),
  reduce_decorative_textures INTEGER NOT NULL
    CHECK (reduce_decorative_textures IN (0, 1)),
  updated_at TEXT NOT NULL
);`.trim();

export const USER_TUNER_PREFERENCES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_tuner_preferences (
  id TEXT PRIMARY KEY NOT NULL
    CHECK (id = 'tuner_preferences'),
  calibration_a4 REAL NOT NULL
    CHECK (calibration_a4 BETWEEN 415 AND 466),
  tolerance_cents INTEGER NOT NULL
    CHECK (tolerance_cents BETWEEN 1 AND 20),
  auto_advance INTEGER NOT NULL
    CHECK (auto_advance IN (0, 1)),
  vibrate_when_in_tune INTEGER NOT NULL
    CHECK (vibrate_when_in_tune IN (0, 1)),
  keep_screen_awake INTEGER NOT NULL
    CHECK (keep_screen_awake IN (0, 1)),
  show_frequency INTEGER NOT NULL
    CHECK (show_frequency IN (0, 1)),
  noise_filter_level TEXT NOT NULL
    CHECK (noise_filter_level IN (${NOISE_FILTER_LEVELS})),
  last_mode TEXT NOT NULL
    CHECK (last_mode IN (${TUNER_MODES})),
  updated_at TEXT NOT NULL
);`.trim();

export const USER_AUDIO_PREFERENCES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_audio_preferences (
  id TEXT PRIMARY KEY NOT NULL
    CHECK (id = 'audio_preferences'),
  reference_volume REAL NOT NULL
    CHECK (reference_volume BETWEEN 0 AND 1),
  metronome_volume REAL NOT NULL
    CHECK (metronome_volume BETWEEN 0 AND 1),
  first_beat_accent INTEGER NOT NULL
    CHECK (first_beat_accent IN (0, 1)),
  spoken_count_in INTEGER NOT NULL
    CHECK (spoken_count_in IN (0, 1)),
  haptics_enabled INTEGER NOT NULL
    CHECK (haptics_enabled IN (0, 1)),
  confirmation_sounds_enabled INTEGER NOT NULL
    CHECK (confirmation_sounds_enabled IN (0, 1)),
  updated_at TEXT NOT NULL
);`.trim();

export const USER_STAGE_PREFERENCES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_stage_preferences (
  id TEXT PRIMARY KEY NOT NULL
    CHECK (id = 'stage_preferences'),
  keep_screen_awake INTEGER NOT NULL
    CHECK (keep_screen_awake IN (0, 1)),
  auto_hide_controls INTEGER NOT NULL
    CHECK (auto_hide_controls IN (0, 1)),
  tap_to_pause INTEGER NOT NULL
    CHECK (tap_to_pause IN (0, 1)),
  default_scroll_speed REAL NOT NULL
    CHECK (default_scroll_speed > 0),
  default_font_scale REAL NOT NULL
    CHECK (default_font_scale > 0),
  preferred_orientation TEXT NOT NULL
    CHECK (preferred_orientation IN (${PREFERRED_ORIENTATIONS})),
  force_high_contrast INTEGER NOT NULL
    CHECK (force_high_contrast IN (0, 1)),
  lock_controls_on_start INTEGER NOT NULL
    CHECK (lock_controls_on_start IN (0, 1)),
  updated_at TEXT NOT NULL
);`.trim();

export const USER_METRONOME_PREFERENCES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_metronome_preferences (
  id TEXT PRIMARY KEY NOT NULL
    CHECK (id = 'metronome_preferences'),
  last_bpm REAL NOT NULL
    CHECK (last_bpm BETWEEN 20 AND 400),
  time_signature_numerator INTEGER NOT NULL
    CHECK (time_signature_numerator BETWEEN 1 AND 32),
  time_signature_denominator INTEGER NOT NULL
    CHECK (time_signature_denominator IN (2, 4, 8, 16)),
  accent_first_beat INTEGER NOT NULL
    CHECK (accent_first_beat IN (0, 1)),
  count_in_bars INTEGER NOT NULL
    CHECK (count_in_bars BETWEEN 0 AND 32),
  visual_pulse_enabled INTEGER NOT NULL
    CHECK (visual_pulse_enabled IN (0, 1)),
  updated_at TEXT NOT NULL
);`.trim();

export const USER_SONG_PREFERENCES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_song_preferences (
  id TEXT PRIMARY KEY NOT NULL,
  song_origin TEXT NOT NULL
    CHECK (song_origin IN (${CONTENT_ORIGINS})),
  song_id TEXT NOT NULL,
  remembered_key_pitch_class INTEGER
    CHECK (
      remembered_key_pitch_class IS NULL
      OR remembered_key_pitch_class BETWEEN 0 AND 11
    ),
  remembered_key_mode TEXT
    CHECK (remembered_key_mode IS NULL OR remembered_key_mode IN (${SONG_MODES})),
  remember_key INTEGER NOT NULL
    CHECK (remember_key IN (0, 1)),
  last_scroll_position REAL NOT NULL
    CHECK (last_scroll_position >= 0),
  stage_font_scale REAL
    CHECK (stage_font_scale IS NULL OR stage_font_scale > 0),
  stage_scroll_speed REAL
    CHECK (stage_scroll_speed IS NULL OR stage_scroll_speed > 0),
  preferred_arrangement_id TEXT,
  preferred_shape_overrides_json TEXT,
  last_opened_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (song_origin, song_id)
);`.trim();

export const USER_FAVORITES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_favorites (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL
    CHECK (entity_type IN (${USER_FAVORITE_ENTITY_TYPES})),
  entity_origin TEXT NOT NULL
    CHECK (entity_origin IN (${CONTENT_ORIGINS})),
  entity_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (entity_type, entity_origin, entity_id)
);`.trim();

export const USER_RECENT_ITEMS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_recent_items (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL
    CHECK (entity_type IN (${USER_RECENT_ENTITY_TYPES})),
  entity_origin TEXT NOT NULL
    CHECK (entity_origin IN (${CONTENT_ORIGINS})),
  entity_id TEXT NOT NULL,
  opened_at TEXT NOT NULL,
  open_count INTEGER NOT NULL DEFAULT 1
    CHECK (open_count >= 1),
  context_json TEXT,
  UNIQUE (entity_type, entity_origin, entity_id)
);`.trim();

export const USER_RESUME_STATES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_resume_states (
  id TEXT PRIMARY KEY NOT NULL,
  resume_type TEXT NOT NULL
    CHECK (resume_type IN (${USER_RESUME_TYPES})),
  entity_origin TEXT
    CHECK (entity_origin IS NULL OR entity_origin IN (${CONTENT_ORIGINS})),
  entity_id TEXT,
  state_json TEXT NOT NULL,
  is_safe_to_resume INTEGER NOT NULL
    CHECK (is_safe_to_resume IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT
);`.trim();

export const USER_TUNINGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_tunings (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  origin_label TEXT,
  open_chord_text TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);`.trim();

export const USER_TUNING_COURSES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_tuning_courses (
  id TEXT PRIMARY KEY NOT NULL,
  tuning_id TEXT NOT NULL,
  course_number INTEGER NOT NULL
    CHECK (course_number BETWEEN 1 AND 5),
  pair_type TEXT NOT NULL
    CHECK (pair_type IN ('unison', 'octave', 'custom')),
  label TEXT,
  sort_order INTEGER NOT NULL,
  UNIQUE (tuning_id, course_number),
  FOREIGN KEY (tuning_id) REFERENCES user_tunings(id) ON DELETE CASCADE
);`.trim();

export const USER_TUNING_STRINGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_tuning_strings (
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
  FOREIGN KEY (course_id) REFERENCES user_tuning_courses(id) ON DELETE CASCADE,
  FOREIGN KEY (tuning_id) REFERENCES user_tunings(id) ON DELETE CASCADE
);`.trim();

export const USER_CHORD_SHAPES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_chord_shapes (
  id TEXT PRIMARY KEY NOT NULL,
  chord_root_pitch_class INTEGER NOT NULL
    CHECK (chord_root_pitch_class BETWEEN 0 AND 11),
  chord_quality_id TEXT NOT NULL,
  bass_pitch_class INTEGER
    CHECK (bass_pitch_class IS NULL OR bass_pitch_class BETWEEN 0 AND 11),
  tuning_origin TEXT NOT NULL
    CHECK (tuning_origin IN (${CONTENT_ORIGINS})),
  tuning_id TEXT NOT NULL,
  name TEXT,
  difficulty TEXT
    CHECK (difficulty IS NULL OR difficulty IN ('beginner', 'easy', 'intermediate', 'advanced')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (chord_quality_id) REFERENCES catalog_chord_qualities(id)
);`.trim();

export const USER_CHORD_SHAPE_POSITIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_chord_shape_positions (
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
    CHECK (finger IS NULL OR finger IN (${USER_CHORD_SHAPE_FINGERS})),
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
  FOREIGN KEY (shape_id) REFERENCES user_chord_shapes(id) ON DELETE CASCADE
);`.trim();

export const USER_CHORD_SHAPE_BARRES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_chord_shape_barres (
  id TEXT PRIMARY KEY NOT NULL,
  shape_id TEXT NOT NULL,
  fret INTEGER NOT NULL
    CHECK (fret BETWEEN 1 AND 30),
  from_physical_string INTEGER NOT NULL
    CHECK (from_physical_string BETWEEN 1 AND 10),
  to_physical_string INTEGER NOT NULL
    CHECK (to_physical_string BETWEEN 1 AND 10),
  finger TEXT NOT NULL
    CHECK (finger IN (${USER_CHORD_SHAPE_FINGERS})),
  sort_order INTEGER NOT NULL,
  CHECK (from_physical_string <= to_physical_string),
  FOREIGN KEY (shape_id) REFERENCES user_chord_shapes(id) ON DELETE CASCADE
);`.trim();

export const USER_SONGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_songs (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  artist TEXT,
  normalized_artist TEXT,
  composer TEXT,
  copyright_confirmation TEXT NOT NULL
    CHECK (copyright_confirmation IN (${SONG_COPYRIGHT_CONFIRMATIONS})),
  original_key_pitch_class INTEGER
    CHECK (
      original_key_pitch_class IS NULL
      OR original_key_pitch_class BETWEEN 0 AND 11
    ),
  original_key_mode TEXT NOT NULL
    CHECK (original_key_mode IN (${SONG_MODES})),
  tuning_origin TEXT NOT NULL
    CHECK (tuning_origin IN (${CONTENT_ORIGINS})),
  tuning_id TEXT NOT NULL,
  rhythm_id TEXT,
  custom_rhythm_name TEXT,
  bpm INTEGER
    CHECK (bpm IS NULL OR bpm BETWEEN 20 AND 400),
  time_signature_numerator INTEGER
    CHECK (time_signature_numerator IS NULL OR time_signature_numerator BETWEEN 1 AND 32),
  time_signature_denominator INTEGER
    CHECK (time_signature_denominator IS NULL OR time_signature_denominator IN (2, 4, 8, 16)),
  capo_fret INTEGER NOT NULL DEFAULT 0
    CHECK (capo_fret BETWEEN 0 AND 15),
  difficulty TEXT
    CHECK (difficulty IS NULL OR difficulty IN (${DIFFICULTY_LEVELS})),
  document_format_version INTEGER NOT NULL,
  document_json TEXT NOT NULL,
  search_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (rhythm_id) REFERENCES catalog_rhythms(id)
);`.trim();

export const USER_SONG_VERSIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_song_versions (
  id TEXT PRIMARY KEY NOT NULL,
  song_id TEXT NOT NULL,
  version_number INTEGER NOT NULL
    CHECK (version_number >= 1),
  snapshot_json TEXT NOT NULL,
  change_reason TEXT NOT NULL
    CHECK (change_reason IN (${USER_SONG_CHANGE_REASONS})),
  created_at TEXT NOT NULL,
  UNIQUE (song_id, version_number),
  FOREIGN KEY (song_id) REFERENCES user_songs(id) ON DELETE CASCADE
);`.trim();

export const USER_SONG_CHORD_INDEX_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_song_chord_index (
  song_id TEXT NOT NULL,
  root_pitch_class INTEGER NOT NULL
    CHECK (root_pitch_class BETWEEN 0 AND 11),
  quality_id TEXT NOT NULL,
  bass_pitch_class INTEGER
    CHECK (bass_pitch_class IS NULL OR bass_pitch_class BETWEEN 0 AND 11),
  first_occurrence_order INTEGER NOT NULL
    CHECK (first_occurrence_order >= 0),
  occurrence_count INTEGER NOT NULL
    CHECK (occurrence_count >= 1),
  PRIMARY KEY (song_id, root_pitch_class, quality_id, bass_pitch_class),
  FOREIGN KEY (song_id) REFERENCES user_songs(id) ON DELETE CASCADE,
  FOREIGN KEY (quality_id) REFERENCES catalog_chord_qualities(id)
);`.trim();

export const USER_SONG_NOTES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_song_notes (
  id TEXT PRIMARY KEY NOT NULL,
  song_origin TEXT NOT NULL
    CHECK (song_origin IN (${CONTENT_ORIGINS})),
  song_id TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`.trim();

export const USER_SONG_DRAFTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_song_drafts (
  id TEXT PRIMARY KEY NOT NULL,
  song_id TEXT,
  draft_type TEXT NOT NULL
    CHECK (draft_type IN (${USER_DRAFT_TYPES})),
  title TEXT,
  form_state_json TEXT NOT NULL,
  document_format_version INTEGER NOT NULL
    CHECK (document_format_version >= 1),
  document_json TEXT NOT NULL,
  last_saved_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  recovery_status TEXT NOT NULL
    CHECK (recovery_status IN (${USER_DRAFT_RECOVERY_STATUSES})),
  FOREIGN KEY (song_id) REFERENCES user_songs(id) ON DELETE CASCADE
);`.trim();

export const USER_TUNING_SESSIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_tuning_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  tuning_origin TEXT NOT NULL
    CHECK (tuning_origin IN (${CONTENT_ORIGINS})),
  tuning_id TEXT NOT NULL,
  mode TEXT NOT NULL
    CHECK (mode IN (${USER_TUNING_SESSION_MODES})),
  calibration_a4 REAL NOT NULL
    CHECK (calibration_a4 BETWEEN 415 AND 466),
  tolerance_cents INTEGER NOT NULL
    CHECK (tolerance_cents BETWEEN 1 AND 20),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL
    CHECK (status IN (${USER_TUNING_SESSION_STATUSES})),
  completed_course_count INTEGER NOT NULL
    CHECK (completed_course_count >= 0),
  total_course_count INTEGER NOT NULL
    CHECK (total_course_count BETWEEN 0 AND 5),
  CHECK (completed_course_count <= total_course_count)
);`.trim();

export const USER_TUNING_SESSION_COURSES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_tuning_session_courses (
  id TEXT PRIMARY KEY NOT NULL,
  session_id TEXT NOT NULL,
  course_number INTEGER NOT NULL
    CHECK (course_number BETWEEN 1 AND 5),
  target_midi_note_primary INTEGER NOT NULL
    CHECK (target_midi_note_primary BETWEEN 0 AND 127),
  target_midi_note_secondary INTEGER
    CHECK (
      target_midi_note_secondary IS NULL
      OR target_midi_note_secondary BETWEEN 0 AND 127
    ),
  final_cents_primary REAL,
  final_cents_secondary REAL,
  result TEXT NOT NULL
    CHECK (result IN (${USER_TUNING_SESSION_RESULTS})),
  confirmed_at TEXT,
  UNIQUE (session_id, course_number),
  FOREIGN KEY (session_id) REFERENCES user_tuning_sessions(id) ON DELETE CASCADE
);`.trim();

export const USER_PRACTICE_SESSIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_practice_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  practice_type TEXT NOT NULL
    CHECK (practice_type IN (${USER_PRACTICE_TYPES})),
  entity_origin TEXT
    CHECK (entity_origin IS NULL OR entity_origin IN (${CONTENT_ORIGINS})),
  entity_id TEXT,
  tuning_origin TEXT
    CHECK (tuning_origin IS NULL OR tuning_origin IN (${CONTENT_ORIGINS})),
  tuning_id TEXT,
  rhythm_id TEXT,
  bpm_start INTEGER
    CHECK (bpm_start IS NULL OR bpm_start BETWEEN 20 AND 400),
  bpm_end INTEGER
    CHECK (bpm_end IS NULL OR bpm_end BETWEEN 20 AND 400),
  duration_seconds INTEGER NOT NULL
    CHECK (duration_seconds >= 0),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL
    CHECK (status IN (${USER_PRACTICE_STATUSES}))
);`.trim();

export const USER_STATEMENTS = [
  USER_PROFILE_TABLE_SQL,
  USER_APP_PREFERENCES_TABLE_SQL,
  USER_APPEARANCE_PREFERENCES_TABLE_SQL,
  USER_TUNER_PREFERENCES_TABLE_SQL,
  USER_AUDIO_PREFERENCES_TABLE_SQL,
  USER_STAGE_PREFERENCES_TABLE_SQL,
  USER_METRONOME_PREFERENCES_TABLE_SQL,
  USER_SONG_PREFERENCES_TABLE_SQL,
  USER_FAVORITES_TABLE_SQL,
  USER_RECENT_ITEMS_TABLE_SQL,
  USER_RESUME_STATES_TABLE_SQL,
  USER_TUNINGS_TABLE_SQL,
  USER_TUNING_COURSES_TABLE_SQL,
  USER_TUNING_STRINGS_TABLE_SQL,
  USER_CHORD_SHAPES_TABLE_SQL,
  USER_CHORD_SHAPE_POSITIONS_TABLE_SQL,
  USER_CHORD_SHAPE_BARRES_TABLE_SQL,
  USER_SONGS_TABLE_SQL,
  USER_SONG_VERSIONS_TABLE_SQL,
  USER_SONG_CHORD_INDEX_TABLE_SQL,
  USER_SONG_NOTES_TABLE_SQL,
  USER_SONG_DRAFTS_TABLE_SQL,
  USER_TUNING_SESSIONS_TABLE_SQL,
  USER_TUNING_SESSION_COURSES_TABLE_SQL,
  USER_PRACTICE_SESSIONS_TABLE_SQL,
  "CREATE INDEX IF NOT EXISTS idx_user_song_preferences_lookup ON user_song_preferences(song_origin, song_id);",
  "CREATE INDEX IF NOT EXISTS idx_user_songs_title ON user_songs(normalized_title) WHERE deleted_at IS NULL;",
  "CREATE INDEX IF NOT EXISTS idx_user_songs_updated ON user_songs(updated_at DESC) WHERE deleted_at IS NULL;",
  "CREATE INDEX IF NOT EXISTS idx_user_recent_type_opened ON user_recent_items(entity_type, opened_at DESC);",
  "CREATE INDEX IF NOT EXISTS idx_user_practice_started ON user_practice_sessions(started_at DESC);",
  "CREATE INDEX IF NOT EXISTS idx_user_tuning_sessions_started ON user_tuning_sessions(started_at DESC);",
  "CREATE INDEX IF NOT EXISTS idx_user_song_drafts_song ON user_song_drafts(song_id);",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_user_song_drafts_active ON user_song_drafts(song_id) WHERE song_id IS NOT NULL AND recovery_status = 'active';",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_user_song_chord_index_signature ON user_song_chord_index(song_id, root_pitch_class, quality_id, COALESCE(bass_pitch_class, -1));",
] as const;
