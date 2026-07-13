import { withDatabaseTransaction } from "@/database/transaction";
import type { BackupImportMode, BackupImportOptions, BackupRepository } from "@/types/backup";
import type {
  BackupPayloadV1,
  ContentOrigin,
  JsonObject,
  Origin,
  PitchClass,
  PreferenceThemeMode,
  SongMode,
  TunerMode,
  TimeSignatureDenominator,
  UserPreferences,
  UserAppearancePreferences,
  UserAppPreferences,
  UserAudioPreferences,
  UserMetronomePreferences,
  UserProfile,
  UserSongPreference,
  UserStagePreferences,
  UserTunerPreferences,
} from "@/types/music";
import type { SQLiteDatabaseLike } from "@/types/database";

import { BACKUP_SECTION_ORDER } from "@/domain/backup";

interface UserProfileRow {
  readonly id: "local_user";
  readonly experience_level: UserProfile["experienceLevel"];
  readonly onboarding_status: UserProfile["onboardingStatus"];
  readonly onboarding_step: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

interface UserSongPreferenceRow {
  readonly id: string;
  readonly song_origin: Origin;
  readonly song_id: string;
  readonly remembered_key_pitch_class: PitchClass | null;
  readonly remembered_key_mode: SongMode | null;
  readonly remember_key: number;
  readonly last_scroll_position: number;
  readonly stage_font_scale: number | null;
  readonly stage_scroll_speed: number | null;
  readonly preferred_arrangement_id: string | null;
  readonly preferred_shape_overrides_json: string | null;
  readonly last_opened_at: string;
  readonly updated_at: string;
}

interface UserAppPreferencesRow {
  readonly id: "app_preferences";
  readonly active_tuning_origin: ContentOrigin;
  readonly active_tuning_id: string;
  readonly accidental_preference: UserAppPreferences["accidentalPreference"];
  readonly handedness: UserAppPreferences["handedness"];
  readonly diagram_orientation: UserAppPreferences["diagramOrientation"];
  readonly diagram_mode: UserAppPreferences["diagramMode"];
  readonly show_calculated_shapes: number;
  readonly expand_theory_details: number;
  readonly locale: string;
  readonly updated_at: string;
}

interface UserAppearancePreferencesRow {
  readonly id: "appearance_preferences";
  readonly theme_mode: PreferenceThemeMode;
  readonly high_contrast: number;
  readonly internal_text_scale: UserAppearancePreferences["internalTextScale"];
  readonly reduce_decorative_textures: number;
  readonly updated_at: string;
}

interface UserTunerPreferencesRow {
  readonly id: "tuner_preferences";
  readonly calibration_a4: number;
  readonly tolerance_cents: number;
  readonly auto_advance: number;
  readonly vibrate_when_in_tune: number;
  readonly keep_screen_awake: number;
  readonly show_frequency: number;
  readonly noise_filter_level: UserTunerPreferences["noiseFilterLevel"];
  readonly last_mode: TunerMode;
  readonly updated_at: string;
}

interface UserAudioPreferencesRow {
  readonly id: "audio_preferences";
  readonly reference_volume: number;
  readonly metronome_volume: number;
  readonly first_beat_accent: number;
  readonly spoken_count_in: number;
  readonly haptics_enabled: number;
  readonly confirmation_sounds_enabled: number;
  readonly updated_at: string;
}

interface UserStagePreferencesRow {
  readonly id: "stage_preferences";
  readonly keep_screen_awake: number;
  readonly auto_hide_controls: number;
  readonly tap_to_pause: number;
  readonly default_scroll_speed: number;
  readonly default_font_scale: number;
  readonly preferred_orientation: UserStagePreferences["preferredOrientation"];
  readonly force_high_contrast: number;
  readonly lock_controls_on_start: number;
  readonly updated_at: string;
}

interface UserMetronomePreferencesRow {
  readonly id: "metronome_preferences";
  readonly last_bpm: number;
  readonly time_signature_numerator: number;
  readonly time_signature_denominator: TimeSignatureDenominator;
  readonly accent_first_beat: number;
  readonly count_in_bars: number;
  readonly visual_pulse_enabled: number;
  readonly updated_at: string;
}

type BackupRow = object;

const SELECT_PROFILE_SQL = "SELECT * FROM user_profile LIMIT 1";
const SELECT_APP_PREFERENCES_SQL = "SELECT * FROM user_app_preferences LIMIT 1";
const SELECT_APPEARANCE_PREFERENCES_SQL = "SELECT * FROM user_appearance_preferences LIMIT 1";
const SELECT_TUNER_PREFERENCES_SQL = "SELECT * FROM user_tuner_preferences LIMIT 1";
const SELECT_AUDIO_PREFERENCES_SQL = "SELECT * FROM user_audio_preferences LIMIT 1";
const SELECT_STAGE_PREFERENCES_SQL = "SELECT * FROM user_stage_preferences LIMIT 1";
const SELECT_METRONOME_PREFERENCES_SQL = "SELECT * FROM user_metronome_preferences LIMIT 1";
const SELECT_SONG_PREFERENCES_SQL = "SELECT * FROM user_song_preferences ORDER BY last_opened_at DESC, song_origin ASC, song_id ASC, id ASC";

const SELECT_SONGS_SQL = "SELECT * FROM user_songs ORDER BY created_at ASC, id ASC";
const SELECT_SONG_VERSIONS_SQL = "SELECT * FROM user_song_versions ORDER BY song_id ASC, version_number ASC, id ASC";
const SELECT_SONG_NOTES_SQL = "SELECT * FROM user_song_notes ORDER BY song_id ASC, created_at ASC, id ASC";
const SELECT_TUNINGS_SQL = "SELECT * FROM user_tunings ORDER BY created_at ASC, id ASC";
const SELECT_TUNING_COURSES_SQL = "SELECT * FROM user_tuning_courses ORDER BY tuning_id ASC, course_number ASC, id ASC";
const SELECT_TUNING_STRINGS_SQL = "SELECT * FROM user_tuning_strings ORDER BY tuning_id ASC, physical_string_number ASC, id ASC";
const SELECT_CHORD_SHAPES_SQL = "SELECT * FROM user_chord_shapes ORDER BY created_at ASC, id ASC";
const SELECT_CHORD_SHAPE_POSITIONS_SQL = "SELECT * FROM user_chord_shape_positions ORDER BY shape_id ASC, physical_string_number ASC, id ASC";
const SELECT_CHORD_SHAPE_BARRES_SQL = "SELECT * FROM user_chord_shape_barres ORDER BY shape_id ASC, sort_order ASC, id ASC";
const SELECT_FAVORITES_SQL = "SELECT * FROM user_favorites ORDER BY created_at ASC, entity_type ASC, entity_origin ASC, entity_id ASC, id ASC";
const SELECT_RECENT_ITEMS_SQL = "SELECT * FROM user_recent_items ORDER BY opened_at ASC, open_count ASC, entity_type ASC, entity_origin ASC, entity_id ASC, id ASC";
const SELECT_PRACTICE_SESSIONS_SQL = "SELECT * FROM user_practice_sessions ORDER BY started_at ASC, id ASC";
const SELECT_TUNING_SESSIONS_SQL = "SELECT * FROM user_tuning_sessions ORDER BY started_at ASC, id ASC";
const SELECT_TUNING_SESSION_COURSES_SQL = "SELECT * FROM user_tuning_session_courses ORDER BY session_id ASC, course_number ASC, id ASC";

const CLEAR_TABLE_ORDER = [
  "user_tuning_session_courses",
  "user_tuning_sessions",
  "user_practice_sessions",
  "user_recent_items",
  "user_favorites",
  "user_chord_shape_barres",
  "user_chord_shape_positions",
  "user_chord_shapes",
  "user_tuning_strings",
  "user_tuning_courses",
  "user_tunings",
  "user_song_notes",
  "user_song_versions",
  "user_song_preferences",
  "user_songs",
  "user_metronome_preferences",
  "user_stage_preferences",
  "user_audio_preferences",
  "user_tuner_preferences",
  "user_appearance_preferences",
  "user_app_preferences",
  "user_profile",
] as const;

function comparePrimitiveValues(
  left: string | number | boolean | null | undefined,
  right: string | number | boolean | null | undefined,
): number {
  if (left === right) {
    return 0;
  }

  if (left === null || left === undefined) {
    return -1;
  }

  if (right === null || right === undefined) {
    return 1;
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right));
}

function toComparableText(value: unknown): string {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  return "";
}

function sortRowsByKeys<T extends object>(rows: readonly T[], keys: readonly string[]): T[] {
  return [...rows].sort((left, right) => {
    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;

    for (const key of keys) {
      const delta = comparePrimitiveValues(
        leftRecord[key] as string | number | boolean | null | undefined,
        rightRecord[key] as string | number | boolean | null | undefined,
      );

      if (delta !== 0) {
        return delta;
      }
    }

    return 0;
  });
}

function stripNestedKeys<T extends object>(row: T, keys: readonly string[]): BackupRow {
  const clone: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
    if (keys.includes(key)) {
      continue;
    }

    clone[key] = value;
  }

  return clone;
}

function toDbBoolean(value: boolean): number {
  return value ? 1 : 0;
}

function fromDbBoolean(value: number): boolean {
  return value === 1;
}

function buildInsertSql(table: string, row: BackupRow): { readonly sql: string; readonly params: readonly unknown[] } {
  const record = row as Record<string, unknown>;
  const columns = Object.keys(record);
  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
  const params = columns.map((column) => record[column]);

  return { sql, params };
}

function toJsonObjectCollection(rows: readonly object[]): readonly JsonObject[] {
  return rows as unknown as readonly JsonObject[];
}

function buildBackupProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    experienceLevel: row.experience_level,
    onboardingStatus: row.onboarding_status,
    onboardingStep: row.onboarding_step,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildProfileRow(profile: UserProfile): UserProfileRow {
  return {
    id: profile.id,
    experience_level: profile.experienceLevel,
    onboarding_status: profile.onboardingStatus,
    onboarding_step: profile.onboardingStep,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
}

function buildBackupAppPreferences(row: UserAppPreferencesRow): UserAppPreferences {
  return {
    id: row.id,
    activeTuningOrigin: row.active_tuning_origin,
    activeTuningId: row.active_tuning_id,
    accidentalPreference: row.accidental_preference,
    handedness: row.handedness,
    diagramOrientation: row.diagram_orientation,
    diagramMode: row.diagram_mode,
    showCalculatedShapes: fromDbBoolean(row.show_calculated_shapes),
    expandTheoryDetails: fromDbBoolean(row.expand_theory_details),
    locale: row.locale,
    updatedAt: row.updated_at,
  };
}

function buildAppPreferencesRow(preferences: UserAppPreferences): UserAppPreferencesRow {
  return {
    id: preferences.id,
    active_tuning_origin: preferences.activeTuningOrigin,
    active_tuning_id: preferences.activeTuningId,
    accidental_preference: preferences.accidentalPreference,
    handedness: preferences.handedness,
    diagram_orientation: preferences.diagramOrientation,
    diagram_mode: preferences.diagramMode,
    show_calculated_shapes: toDbBoolean(preferences.showCalculatedShapes),
    expand_theory_details: toDbBoolean(preferences.expandTheoryDetails),
    locale: preferences.locale,
    updated_at: preferences.updatedAt,
  };
}

function buildBackupAppearancePreferences(row: UserAppearancePreferencesRow): UserAppearancePreferences {
  return {
    id: row.id,
    themeMode: row.theme_mode,
    highContrast: fromDbBoolean(row.high_contrast),
    internalTextScale: row.internal_text_scale,
    reduceDecorativeTextures: fromDbBoolean(row.reduce_decorative_textures),
    updatedAt: row.updated_at,
  };
}

function buildAppearancePreferencesRow(preferences: UserAppearancePreferences): UserAppearancePreferencesRow {
  return {
    id: preferences.id,
    theme_mode: preferences.themeMode,
    high_contrast: toDbBoolean(preferences.highContrast),
    internal_text_scale: preferences.internalTextScale,
    reduce_decorative_textures: toDbBoolean(preferences.reduceDecorativeTextures),
    updated_at: preferences.updatedAt,
  };
}

function buildBackupTunerPreferences(row: UserTunerPreferencesRow): UserTunerPreferences {
  return {
    id: row.id,
    calibrationA4: row.calibration_a4,
    toleranceCents: row.tolerance_cents,
    autoAdvance: fromDbBoolean(row.auto_advance),
    vibrateWhenInTune: fromDbBoolean(row.vibrate_when_in_tune),
    keepScreenAwake: fromDbBoolean(row.keep_screen_awake),
    showFrequency: fromDbBoolean(row.show_frequency),
    noiseFilterLevel: row.noise_filter_level,
    lastMode: row.last_mode,
    updatedAt: row.updated_at,
  };
}

function buildTunerPreferencesRow(preferences: UserTunerPreferences): UserTunerPreferencesRow {
  return {
    id: preferences.id,
    calibration_a4: preferences.calibrationA4,
    tolerance_cents: preferences.toleranceCents,
    auto_advance: toDbBoolean(preferences.autoAdvance),
    vibrate_when_in_tune: toDbBoolean(preferences.vibrateWhenInTune),
    keep_screen_awake: toDbBoolean(preferences.keepScreenAwake),
    show_frequency: toDbBoolean(preferences.showFrequency),
    noise_filter_level: preferences.noiseFilterLevel,
    last_mode: preferences.lastMode,
    updated_at: preferences.updatedAt,
  };
}

function buildBackupAudioPreferences(row: UserAudioPreferencesRow): UserAudioPreferences {
  return {
    id: row.id,
    referenceVolume: row.reference_volume,
    metronomeVolume: row.metronome_volume,
    firstBeatAccent: fromDbBoolean(row.first_beat_accent),
    spokenCountIn: fromDbBoolean(row.spoken_count_in),
    hapticsEnabled: fromDbBoolean(row.haptics_enabled),
    confirmationSoundsEnabled: fromDbBoolean(row.confirmation_sounds_enabled),
    updatedAt: row.updated_at,
  };
}

function buildAudioPreferencesRow(preferences: UserAudioPreferences): UserAudioPreferencesRow {
  return {
    id: preferences.id,
    reference_volume: preferences.referenceVolume,
    metronome_volume: preferences.metronomeVolume,
    first_beat_accent: toDbBoolean(preferences.firstBeatAccent),
    spoken_count_in: toDbBoolean(preferences.spokenCountIn),
    haptics_enabled: toDbBoolean(preferences.hapticsEnabled),
    confirmation_sounds_enabled: toDbBoolean(preferences.confirmationSoundsEnabled),
    updated_at: preferences.updatedAt,
  };
}

function buildBackupStagePreferences(row: UserStagePreferencesRow): UserStagePreferences {
  return {
    id: row.id,
    keepScreenAwake: fromDbBoolean(row.keep_screen_awake),
    autoHideControls: fromDbBoolean(row.auto_hide_controls),
    tapToPause: fromDbBoolean(row.tap_to_pause),
    defaultScrollSpeed: row.default_scroll_speed,
    defaultFontScale: row.default_font_scale,
    preferredOrientation: row.preferred_orientation,
    forceHighContrast: fromDbBoolean(row.force_high_contrast),
    lockControlsOnStart: fromDbBoolean(row.lock_controls_on_start),
    updatedAt: row.updated_at,
  };
}

function buildStagePreferencesRow(preferences: UserStagePreferences): UserStagePreferencesRow {
  return {
    id: preferences.id,
    keep_screen_awake: toDbBoolean(preferences.keepScreenAwake),
    auto_hide_controls: toDbBoolean(preferences.autoHideControls),
    tap_to_pause: toDbBoolean(preferences.tapToPause),
    default_scroll_speed: preferences.defaultScrollSpeed,
    default_font_scale: preferences.defaultFontScale,
    preferred_orientation: preferences.preferredOrientation,
    force_high_contrast: toDbBoolean(preferences.forceHighContrast),
    lock_controls_on_start: toDbBoolean(preferences.lockControlsOnStart),
    updated_at: preferences.updatedAt,
  };
}

function buildBackupMetronomePreferences(row: UserMetronomePreferencesRow): UserMetronomePreferences {
  return {
    id: row.id,
    lastBpm: row.last_bpm,
    timeSignatureNumerator: row.time_signature_numerator,
    timeSignatureDenominator: row.time_signature_denominator,
    accentFirstBeat: fromDbBoolean(row.accent_first_beat),
    countInBars: row.count_in_bars,
    visualPulseEnabled: fromDbBoolean(row.visual_pulse_enabled),
    updatedAt: row.updated_at,
  };
}

function buildMetronomePreferencesRow(preferences: UserMetronomePreferences): UserMetronomePreferencesRow {
  return {
    id: preferences.id,
    last_bpm: preferences.lastBpm,
    time_signature_numerator: preferences.timeSignatureNumerator,
    time_signature_denominator: preferences.timeSignatureDenominator,
    accent_first_beat: toDbBoolean(preferences.accentFirstBeat),
    count_in_bars: preferences.countInBars,
    visual_pulse_enabled: toDbBoolean(preferences.visualPulseEnabled),
    updated_at: preferences.updatedAt,
  };
}

function buildBackupPreferences(rows: {
  readonly app: UserAppPreferencesRow;
  readonly appearance: UserAppearancePreferencesRow;
  readonly tuner: UserTunerPreferencesRow;
  readonly audio: UserAudioPreferencesRow;
  readonly stage: UserStagePreferencesRow;
  readonly metronome: UserMetronomePreferencesRow;
}): UserPreferences {
  return {
    app: buildBackupAppPreferences(rows.app),
    appearance: buildBackupAppearancePreferences(rows.appearance),
    tuner: buildBackupTunerPreferences(rows.tuner),
    audio: buildBackupAudioPreferences(rows.audio),
    stage: buildBackupStagePreferences(rows.stage),
    metronome: buildBackupMetronomePreferences(rows.metronome),
  };
}

function buildPreferencesRows(preferences: UserPreferences): {
  readonly app: UserAppPreferencesRow;
  readonly appearance: UserAppearancePreferencesRow;
  readonly tuner: UserTunerPreferencesRow;
  readonly audio: UserAudioPreferencesRow;
  readonly stage: UserStagePreferencesRow;
  readonly metronome: UserMetronomePreferencesRow;
} {
  return {
    app: buildAppPreferencesRow(preferences.app),
    appearance: buildAppearancePreferencesRow(preferences.appearance),
    tuner: buildTunerPreferencesRow(preferences.tuner),
    audio: buildAudioPreferencesRow(preferences.audio),
    stage: buildStagePreferencesRow(preferences.stage),
    metronome: buildMetronomePreferencesRow(preferences.metronome),
  };
}

function buildSongPreference(row: UserSongPreferenceRow): UserSongPreference {
  return {
    id: row.id,
    songOrigin: row.song_origin,
    songId: row.song_id,
    rememberedKeyPitchClass: row.remembered_key_pitch_class,
    rememberedKeyMode: row.remembered_key_mode,
    rememberKey: fromDbBoolean(row.remember_key),
    lastScrollPosition: row.last_scroll_position,
    stageFontScale: row.stage_font_scale,
    stageScrollSpeed: row.stage_scroll_speed,
    preferredArrangementId: row.preferred_arrangement_id,
    preferredShapeOverridesJson: row.preferred_shape_overrides_json,
    lastOpenedAt: row.last_opened_at,
    updatedAt: row.updated_at,
  };
}

function buildSongPreferenceRow(preference: UserSongPreference): UserSongPreferenceRow {
  return {
    id: preference.id,
    song_origin: preference.songOrigin,
    song_id: preference.songId,
    remembered_key_pitch_class: preference.rememberedKeyPitchClass,
    remembered_key_mode: preference.rememberedKeyMode,
    remember_key: toDbBoolean(preference.rememberKey),
    last_scroll_position: preference.lastScrollPosition,
    stage_font_scale: preference.stageFontScale,
    stage_scroll_speed: preference.stageScrollSpeed,
    preferred_arrangement_id: preference.preferredArrangementId,
    preferred_shape_overrides_json: preference.preferredShapeOverridesJson,
    last_opened_at: preference.lastOpenedAt,
    updated_at: preference.updatedAt,
  };
}

async function getSingleRow<T extends object>(database: SQLiteDatabaseLike, sql: string): Promise<T | null> {
  return database.getFirstAsync<T>(sql);
}

async function getAllRows<T extends object>(database: SQLiteDatabaseLike, sql: string): Promise<readonly T[]> {
  return database.getAllAsync<T>(sql);
}

async function clearTable(database: SQLiteDatabaseLike, table: string): Promise<void> {
  await database.runAsync(`DELETE FROM ${table}`);
}

async function insertRow(database: SQLiteDatabaseLike, table: string, row: BackupRow): Promise<void> {
  const statement = buildInsertSql(table, row);
  await database.runAsync(statement.sql, ...statement.params);
}

async function clearBackupTables(database: SQLiteDatabaseLike): Promise<void> {
  for (const table of CLEAR_TABLE_ORDER) {
    await clearTable(database, table);
  }
}

function attachNestedRows<T extends object, K extends string, V extends readonly object[] | undefined>(
  row: T,
  key: K,
  value: V,
): T & Partial<Record<K, V>> {
  const clone = structuredClone(row) as Record<string, unknown> & Partial<Record<K, V>>;

  if (value !== undefined) {
    Object.assign(clone, { [key]: value });
  }

  return clone as T & Partial<Record<K, V>>;
}

function groupBy<T extends object>(rows: readonly T[], key: string): Map<string, T[]> {
  const map = new Map<string, T[]>();

  for (const row of rows) {
    const record = row as Record<string, unknown>;
    const groupKey = toComparableText(record[key]);
    const current = map.get(groupKey);

    if (current) {
      current.push(row);
      continue;
    }

    map.set(groupKey, [row]);
  }

  return map;
}

export function buildSections(payload: BackupPayloadV1): readonly { readonly name: string; readonly itemCount: number; readonly included: boolean }[] {
  return BACKUP_SECTION_ORDER.map((name) => {
    switch (name) {
      case "profile":
        return {
          name,
          itemCount: payload.profile ? 1 : 0,
          included: payload.profile !== undefined,
        };
      case "preferences":
        return {
          name,
          itemCount: payload.preferences ? 6 : 0,
          included: payload.preferences !== undefined,
        };
      case "songs":
        return {
          name,
          itemCount: payload.songs?.length ?? 0,
          included: (payload.songs?.length ?? 0) > 0,
        };
      case "songVersions":
        return {
          name,
          itemCount: payload.songVersions?.length ?? 0,
          included: (payload.songVersions?.length ?? 0) > 0,
        };
      case "songNotes":
        return {
          name,
          itemCount: payload.songNotes?.length ?? 0,
          included: (payload.songNotes?.length ?? 0) > 0,
        };
      case "tunings":
        return {
          name,
          itemCount: payload.tunings?.length ?? 0,
          included: (payload.tunings?.length ?? 0) > 0,
        };
      case "tuningCourses":
        return {
          name,
          itemCount: payload.tuningCourses?.length ?? 0,
          included: (payload.tuningCourses?.length ?? 0) > 0,
        };
      case "tuningStrings":
        return {
          name,
          itemCount: payload.tuningStrings?.length ?? 0,
          included: (payload.tuningStrings?.length ?? 0) > 0,
        };
      case "chordShapes":
        return {
          name,
          itemCount: payload.chordShapes?.length ?? 0,
          included: (payload.chordShapes?.length ?? 0) > 0,
        };
      case "favorites":
        return {
          name,
          itemCount: payload.favorites?.length ?? 0,
          included: (payload.favorites?.length ?? 0) > 0,
        };
      case "recentItems":
        return {
          name,
          itemCount: payload.recentItems?.length ?? 0,
          included: (payload.recentItems?.length ?? 0) > 0,
        };
      case "practiceSessions":
        return {
          name,
          itemCount: payload.practiceSessions?.length ?? 0,
          included: (payload.practiceSessions?.length ?? 0) > 0,
        };
      case "tuningSessions":
        return {
          name,
          itemCount: payload.tuningSessions?.length ?? 0,
          included: (payload.tuningSessions?.length ?? 0) > 0,
        };
      case "songPreferences":
        return {
          name,
          itemCount: payload.songPreferences?.length ?? 0,
          included: (payload.songPreferences?.length ?? 0) > 0,
        };
    }
  });
}

async function exportPayload(database: SQLiteDatabaseLike): Promise<BackupPayloadV1> {
  const profileRow = await getSingleRow<UserProfileRow>(database, SELECT_PROFILE_SQL);

  const appRow = await getSingleRow<UserAppPreferencesRow>(database, SELECT_APP_PREFERENCES_SQL);
  const appearanceRow = await getSingleRow<UserAppearancePreferencesRow>(database, SELECT_APPEARANCE_PREFERENCES_SQL);
  const tunerRow = await getSingleRow<UserTunerPreferencesRow>(database, SELECT_TUNER_PREFERENCES_SQL);
  const audioRow = await getSingleRow<UserAudioPreferencesRow>(database, SELECT_AUDIO_PREFERENCES_SQL);
  const stageRow = await getSingleRow<UserStagePreferencesRow>(database, SELECT_STAGE_PREFERENCES_SQL);
  const metronomeRow = await getSingleRow<UserMetronomePreferencesRow>(database, SELECT_METRONOME_PREFERENCES_SQL);

  const songChordIndexRows = sortRowsByKeys(
    await getAllRows<BackupRow>(database, "SELECT * FROM user_song_chord_index ORDER BY song_id ASC, first_occurrence_order ASC, root_pitch_class ASC, quality_id ASC"),
    ["song_id", "first_occurrence_order", "root_pitch_class", "quality_id"],
  );
  const songChordIndexBySong = groupBy(songChordIndexRows, "song_id");
  const songs = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_SONGS_SQL), ["created_at", "id"]).map((song) => {
    const songRecord = song as Record<string, unknown>;
    const songId = toComparableText(songRecord["id"]);
    const chordIndex = songChordIndexBySong.get(songId);

    return attachNestedRows(song, "chordIndex", chordIndex && chordIndex.length > 0 ? chordIndex : undefined);
  });

  const songVersions = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_SONG_VERSIONS_SQL), [
    "song_id",
    "version_number",
    "id",
  ]);
  const songNotes = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_SONG_NOTES_SQL), [
    "song_id",
    "created_at",
    "id",
  ]);

  const tunings = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_TUNINGS_SQL), ["created_at", "id"]);
  const tuningCourses = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_TUNING_COURSES_SQL), [
    "tuning_id",
    "course_number",
    "id",
  ]);
  const tuningStrings = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_TUNING_STRINGS_SQL), [
    "tuning_id",
    "physical_string_number",
    "id",
  ]);

  const chordShapeRows = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_CHORD_SHAPES_SQL), [
    "created_at",
    "id",
  ]);
  const chordShapePositions = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_CHORD_SHAPE_POSITIONS_SQL), [
    "shape_id",
    "physical_string_number",
    "id",
  ]);
  const chordShapeBarres = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_CHORD_SHAPE_BARRES_SQL), [
    "shape_id",
    "sort_order",
    "id",
  ]);

  const chordShapes = chordShapeRows.map((shape) => {
    const shapeRecord = shape as Record<string, unknown>;
    const shapeId = toComparableText(shapeRecord["id"]);
    const positions = chordShapePositions.filter((row) => toComparableText((row as Record<string, unknown>)["shape_id"]) === shapeId);
    const barres = chordShapeBarres.filter((row) => toComparableText((row as Record<string, unknown>)["shape_id"]) === shapeId);

    return attachNestedRows(
      attachNestedRows(shape, "positions", positions.length > 0 ? positions : undefined),
      "barres",
      barres.length > 0 ? barres : undefined,
    );
  });

  const favorites = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_FAVORITES_SQL), [
    "created_at",
    "entity_type",
    "entity_origin",
    "entity_id",
    "id",
  ]);
  const recentItems = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_RECENT_ITEMS_SQL), [
    "opened_at",
    "open_count",
    "entity_type",
    "entity_origin",
    "entity_id",
    "id",
  ]);
  const practiceSessions = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_PRACTICE_SESSIONS_SQL), [
    "started_at",
    "id",
  ]);
  const tuningSessionRows = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_TUNING_SESSIONS_SQL), [
    "started_at",
    "id",
  ]);
  const tuningSessionCourses = sortRowsByKeys(await getAllRows<BackupRow>(database, SELECT_TUNING_SESSION_COURSES_SQL), [
    "session_id",
    "course_number",
    "id",
  ]);
  const tuningSessions = tuningSessionRows.map((session) => {
    const sessionRecord = session as Record<string, unknown>;
    const sessionId = toComparableText(sessionRecord["id"]);
    const courses = tuningSessionCourses.filter((row) => toComparableText((row as Record<string, unknown>)["session_id"]) === sessionId);
    return attachNestedRows(session, "courses", courses.length > 0 ? courses : undefined);
  });

  const songPreferencesRows = sortRowsByKeys(await getAllRows<UserSongPreferenceRow>(database, SELECT_SONG_PREFERENCES_SQL), [
    "last_opened_at",
    "song_origin",
    "song_id",
    "id",
  ]);

  const payload: BackupPayloadV1 = {
    profile: profileRow ? buildBackupProfile(profileRow) : undefined,
    preferences:
      appRow && appearanceRow && tunerRow && audioRow && stageRow && metronomeRow
        ? buildBackupPreferences({
            app: appRow,
            appearance: appearanceRow,
            tuner: tunerRow,
            audio: audioRow,
            stage: stageRow,
            metronome: metronomeRow,
          })
        : undefined,
    songs: songs.length > 0 ? toJsonObjectCollection(songs) : undefined,
    songVersions: songVersions.length > 0 ? toJsonObjectCollection(songVersions) : undefined,
    songNotes: songNotes.length > 0 ? toJsonObjectCollection(songNotes) : undefined,
    tunings: tunings.length > 0 ? toJsonObjectCollection(tunings) : undefined,
    tuningCourses: tuningCourses.length > 0 ? toJsonObjectCollection(tuningCourses) : undefined,
    tuningStrings: tuningStrings.length > 0 ? toJsonObjectCollection(tuningStrings) : undefined,
    chordShapes: chordShapes.length > 0 ? toJsonObjectCollection(chordShapes) : undefined,
    favorites: favorites.length > 0 ? toJsonObjectCollection(favorites) : undefined,
    recentItems: recentItems.length > 0 ? toJsonObjectCollection(recentItems) : undefined,
    practiceSessions: practiceSessions.length > 0 ? toJsonObjectCollection(practiceSessions) : undefined,
    tuningSessions: tuningSessions.length > 0 ? toJsonObjectCollection(tuningSessions) : undefined,
    songPreferences:
      songPreferencesRows.length > 0 ? songPreferencesRows.map((row) => buildSongPreference(row)) : undefined,
  };

  return payload;
}

async function importPayload(
  database: SQLiteDatabaseLike,
  payload: BackupPayloadV1,
  options: BackupImportOptions = {},
): Promise<number> {
  const mode: BackupImportMode = options.mode ?? "replace";
  const insertCount = { value: 0 };

  await withDatabaseTransaction(
    database,
    async (transactionalDatabase) => {
      if (mode === "replace") {
        await clearBackupTables(transactionalDatabase);
      }

      if (payload.profile) {
        await insertRow(transactionalDatabase, "user_profile", buildProfileRow(payload.profile));
        insertCount.value += 1;
      }

      if (payload.preferences) {
        const rows = buildPreferencesRows(payload.preferences);
        await insertRow(transactionalDatabase, "user_app_preferences", rows.app);
        await insertRow(transactionalDatabase, "user_appearance_preferences", rows.appearance);
        await insertRow(transactionalDatabase, "user_tuner_preferences", rows.tuner);
        await insertRow(transactionalDatabase, "user_audio_preferences", rows.audio);
        await insertRow(transactionalDatabase, "user_stage_preferences", rows.stage);
        await insertRow(transactionalDatabase, "user_metronome_preferences", rows.metronome);
        insertCount.value += 6;
      }

      if (payload.tunings) {
        for (const row of payload.tunings) {
          await insertRow(transactionalDatabase, "user_tunings", stripNestedKeys(row, ["courses", "strings"]));
          insertCount.value += 1;
        }
      }

      if (payload.tuningCourses) {
        for (const row of payload.tuningCourses) {
          await insertRow(transactionalDatabase, "user_tuning_courses", row);
          insertCount.value += 1;
        }
      }

      if (payload.tuningStrings) {
        for (const row of payload.tuningStrings) {
          await insertRow(transactionalDatabase, "user_tuning_strings", row);
          insertCount.value += 1;
        }
      }

      if (payload.songs) {
        for (const row of payload.songs) {
          const song = stripNestedKeys(row, ["chordIndex"]);
          await insertRow(transactionalDatabase, "user_songs", song);
          insertCount.value += 1;
        }
      }

      if (payload.songVersions) {
        for (const row of payload.songVersions) {
          await insertRow(transactionalDatabase, "user_song_versions", row);
          insertCount.value += 1;
        }
      }

      if (payload.songNotes) {
        for (const row of payload.songNotes) {
          await insertRow(transactionalDatabase, "user_song_notes", row);
          insertCount.value += 1;
        }
      }

      if (payload.chordShapes) {
        for (const row of payload.chordShapes) {
          await insertRow(transactionalDatabase, "user_chord_shapes", stripNestedKeys(row, ["positions", "barres"]));
          insertCount.value += 1;
        }
      }

      if (payload.favorites) {
        for (const row of payload.favorites) {
          await insertRow(transactionalDatabase, "user_favorites", row);
          insertCount.value += 1;
        }
      }

      if (payload.recentItems) {
        for (const row of payload.recentItems) {
          await insertRow(transactionalDatabase, "user_recent_items", row);
          insertCount.value += 1;
        }
      }

      if (payload.practiceSessions) {
        for (const row of payload.practiceSessions) {
          await insertRow(transactionalDatabase, "user_practice_sessions", row);
          insertCount.value += 1;
        }
      }

      if (payload.tuningSessions) {
        for (const row of payload.tuningSessions) {
          await insertRow(transactionalDatabase, "user_tuning_sessions", stripNestedKeys(row, ["courses"]));
          insertCount.value += 1;
        }
      }

      if (payload.songPreferences) {
        for (const row of payload.songPreferences) {
          await insertRow(transactionalDatabase, "user_song_preferences", buildSongPreferenceRow(row));
          insertCount.value += 1;
        }
      }

      const songChordRows: BackupRow[] = [];
      for (const song of payload.songs ?? []) {
        const songRecord = song as Record<string, unknown>;
        const nested = songRecord["chordIndex"];
        if (!Array.isArray(nested)) {
          continue;
        }

        for (const chordIndexRow of nested) {
          const normalized = structuredClone(chordIndexRow as BackupRow) as Record<string, unknown>;
          if (normalized["song_id"] === undefined || normalized["song_id"] === null) {
            normalized["song_id"] = songRecord["id"];
          }
          songChordRows.push(normalized);
        }
      }

      for (const row of songChordRows) {
        await insertRow(transactionalDatabase, "user_song_chord_index", row);
        insertCount.value += 1;
      }

      const shapePositions: BackupRow[] = [];
      const shapeBarres: BackupRow[] = [];
      for (const shape of payload.chordShapes ?? []) {
        const shapeRecord = shape as Record<string, unknown>;
        const positions = shapeRecord["positions"];
        const barres = shapeRecord["barres"];

        if (Array.isArray(positions)) {
          for (const position of positions) {
            const normalized = structuredClone(position as BackupRow) as Record<string, unknown>;
            if (normalized["shape_id"] === undefined || normalized["shape_id"] === null) {
              normalized["shape_id"] = shapeRecord["id"];
            }
            shapePositions.push(normalized);
          }
        }

        if (Array.isArray(barres)) {
          for (const barre of barres) {
            const normalized = structuredClone(barre as BackupRow) as Record<string, unknown>;
            if (normalized["shape_id"] === undefined || normalized["shape_id"] === null) {
              normalized["shape_id"] = shapeRecord["id"];
            }
            shapeBarres.push(normalized);
          }
        }
      }

      for (const row of shapePositions) {
        await insertRow(transactionalDatabase, "user_chord_shape_positions", row);
        insertCount.value += 1;
      }

      for (const row of shapeBarres) {
        await insertRow(transactionalDatabase, "user_chord_shape_barres", row);
        insertCount.value += 1;
      }

      const tuningSessionCourses: BackupRow[] = [];
      for (const session of payload.tuningSessions ?? []) {
        const sessionRecord = session as Record<string, unknown>;
        const courses = sessionRecord["courses"];

        if (!Array.isArray(courses)) {
          continue;
        }

        for (const course of courses) {
          const normalized = structuredClone(course as BackupRow) as Record<string, unknown>;
          if (normalized["session_id"] === undefined || normalized["session_id"] === null) {
            normalized["session_id"] = sessionRecord["id"];
          }
          tuningSessionCourses.push(normalized);
        }
      }

      for (const row of tuningSessionCourses) {
        await insertRow(transactionalDatabase, "user_tuning_session_courses", row);
        insertCount.value += 1;
      }
    },
    { exclusive: true },
  );

  return insertCount.value;
}

export function createBackupRepository(database: SQLiteDatabaseLike): BackupRepository {
  async function exportPayloadRepository(): Promise<BackupPayloadV1> {
    try {
      return await exportPayload(database);
    } catch (error) {
      throw new Error(`Unable to export backup payload: ${(error as Error).message}`);
    }
  }

  async function importPayloadRepository(payload: BackupPayloadV1, options: BackupImportOptions = {}): Promise<number> {
    try {
      return await importPayload(database, payload, options);
    } catch (error) {
      throw new Error(`Unable to import backup payload: ${(error as Error).message}`);
    }
  }

  return {
    exportPayload: exportPayloadRepository,
    importPayload: importPayloadRepository,
  };
}
