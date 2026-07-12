import type {
  EntityRef,
  UserAppPreferences,
  UserAppearancePreferences,
  UserAudioPreferences,
  UserMetronomePreferences,
  UserPreferences,
  UserStagePreferences,
  UserTunerPreferences,
} from "@/types/music";
import type { SQLiteDatabaseLike } from "@/types/database";
import { UserPreferencesSchema } from "@/validation";

import { withDatabaseTransaction } from "@/database/transaction";
import {
  RepositoryError,
  toRepositoryError,
  buildDefaultPreferences,
  type PreferencesRepository,
  type PreferencesSection,
} from "@/repositories/contracts";
import { createTuningRef, type TuningRef } from "@/repositories/contracts";

interface UserAppPreferencesRow {
  readonly id: "app_preferences";
  readonly active_tuning_origin: TuningRef["origin"];
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
  readonly theme_mode: UserAppearancePreferences["themeMode"];
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
  readonly last_mode: UserTunerPreferences["lastMode"];
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
  readonly time_signature_denominator: UserMetronomePreferences["timeSignatureDenominator"];
  readonly accent_first_beat: number;
  readonly count_in_bars: number;
  readonly visual_pulse_enabled: number;
  readonly updated_at: string;
}

interface TuningIdRow {
  readonly id: string;
}

const SELECT_APP_PREFERENCES_SQL = "SELECT * FROM user_app_preferences WHERE id = ? LIMIT 1";
const SELECT_APPEARANCE_PREFERENCES_SQL = "SELECT * FROM user_appearance_preferences WHERE id = ? LIMIT 1";
const SELECT_TUNER_PREFERENCES_SQL = "SELECT * FROM user_tuner_preferences WHERE id = ? LIMIT 1";
const SELECT_AUDIO_PREFERENCES_SQL = "SELECT * FROM user_audio_preferences WHERE id = ? LIMIT 1";
const SELECT_STAGE_PREFERENCES_SQL = "SELECT * FROM user_stage_preferences WHERE id = ? LIMIT 1";
const SELECT_METRONOME_PREFERENCES_SQL = "SELECT * FROM user_metronome_preferences WHERE id = ? LIMIT 1";
const SELECT_FIRST_CATALOG_TUNING_SQL =
  "SELECT id FROM catalog_tunings ORDER BY is_featured DESC, sort_order ASC, name ASC LIMIT 1";
const SELECT_FIRST_USER_TUNING_SQL =
  "SELECT id FROM user_tunings WHERE deleted_at IS NULL ORDER BY updated_at DESC, name ASC LIMIT 1";
const SELECT_CATALOG_TUNING_SQL = "SELECT id FROM catalog_tunings WHERE id = ? LIMIT 1";
const SELECT_USER_TUNING_SQL = "SELECT id FROM user_tunings WHERE id = ? AND deleted_at IS NULL LIMIT 1";

const UPSERT_APP_PREFERENCES_SQL = `
INSERT INTO user_app_preferences (
  id,
  active_tuning_origin,
  active_tuning_id,
  accidental_preference,
  handedness,
  diagram_orientation,
  diagram_mode,
  show_calculated_shapes,
  expand_theory_details,
  locale,
  updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  active_tuning_origin = excluded.active_tuning_origin,
  active_tuning_id = excluded.active_tuning_id,
  accidental_preference = excluded.accidental_preference,
  handedness = excluded.handedness,
  diagram_orientation = excluded.diagram_orientation,
  diagram_mode = excluded.diagram_mode,
  show_calculated_shapes = excluded.show_calculated_shapes,
  expand_theory_details = excluded.expand_theory_details,
  locale = excluded.locale,
  updated_at = excluded.updated_at
`.trim();

const UPSERT_APPEARANCE_PREFERENCES_SQL = `
INSERT INTO user_appearance_preferences (
  id,
  theme_mode,
  high_contrast,
  internal_text_scale,
  reduce_decorative_textures,
  updated_at
) VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  theme_mode = excluded.theme_mode,
  high_contrast = excluded.high_contrast,
  internal_text_scale = excluded.internal_text_scale,
  reduce_decorative_textures = excluded.reduce_decorative_textures,
  updated_at = excluded.updated_at
`.trim();

const UPSERT_TUNER_PREFERENCES_SQL = `
INSERT INTO user_tuner_preferences (
  id,
  calibration_a4,
  tolerance_cents,
  auto_advance,
  vibrate_when_in_tune,
  keep_screen_awake,
  show_frequency,
  noise_filter_level,
  last_mode,
  updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  calibration_a4 = excluded.calibration_a4,
  tolerance_cents = excluded.tolerance_cents,
  auto_advance = excluded.auto_advance,
  vibrate_when_in_tune = excluded.vibrate_when_in_tune,
  keep_screen_awake = excluded.keep_screen_awake,
  show_frequency = excluded.show_frequency,
  noise_filter_level = excluded.noise_filter_level,
  last_mode = excluded.last_mode,
  updated_at = excluded.updated_at
`.trim();

const UPSERT_AUDIO_PREFERENCES_SQL = `
INSERT INTO user_audio_preferences (
  id,
  reference_volume,
  metronome_volume,
  first_beat_accent,
  spoken_count_in,
  haptics_enabled,
  confirmation_sounds_enabled,
  updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  reference_volume = excluded.reference_volume,
  metronome_volume = excluded.metronome_volume,
  first_beat_accent = excluded.first_beat_accent,
  spoken_count_in = excluded.spoken_count_in,
  haptics_enabled = excluded.haptics_enabled,
  confirmation_sounds_enabled = excluded.confirmation_sounds_enabled,
  updated_at = excluded.updated_at
`.trim();

const UPSERT_STAGE_PREFERENCES_SQL = `
INSERT INTO user_stage_preferences (
  id,
  keep_screen_awake,
  auto_hide_controls,
  tap_to_pause,
  default_scroll_speed,
  default_font_scale,
  preferred_orientation,
  force_high_contrast,
  lock_controls_on_start,
  updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  keep_screen_awake = excluded.keep_screen_awake,
  auto_hide_controls = excluded.auto_hide_controls,
  tap_to_pause = excluded.tap_to_pause,
  default_scroll_speed = excluded.default_scroll_speed,
  default_font_scale = excluded.default_font_scale,
  preferred_orientation = excluded.preferred_orientation,
  force_high_contrast = excluded.force_high_contrast,
  lock_controls_on_start = excluded.lock_controls_on_start,
  updated_at = excluded.updated_at
`.trim();

const UPSERT_METRONOME_PREFERENCES_SQL = `
INSERT INTO user_metronome_preferences (
  id,
  last_bpm,
  time_signature_numerator,
  time_signature_denominator,
  accent_first_beat,
  count_in_bars,
  visual_pulse_enabled,
  updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  last_bpm = excluded.last_bpm,
  time_signature_numerator = excluded.time_signature_numerator,
  time_signature_denominator = excluded.time_signature_denominator,
  accent_first_beat = excluded.accent_first_beat,
  count_in_bars = excluded.count_in_bars,
  visual_pulse_enabled = excluded.visual_pulse_enabled,
  updated_at = excluded.updated_at
`.trim();

function createNowProvider(now?: () => string): () => string {
  return now ?? (() => new Date().toISOString());
}

function dbBoolean(value: boolean): 0 | 1 {
  return value ? 1 : 0;
}

function fromDbBoolean(value: number): boolean {
  return value === 1;
}

function asTuningRef(origin: TuningRef["origin"], id: string): TuningRef {
  return createTuningRef(origin, id);
}

function isPreferencesSection(value: PreferencesSection | undefined): value is PreferencesSection {
  return value !== undefined;
}

function mapAppPreferences(row: UserAppPreferencesRow): UserAppPreferences {
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

function mapAppearancePreferences(row: UserAppearancePreferencesRow): UserAppearancePreferences {
  return {
    id: row.id,
    themeMode: row.theme_mode,
    highContrast: fromDbBoolean(row.high_contrast),
    internalTextScale: row.internal_text_scale,
    reduceDecorativeTextures: fromDbBoolean(row.reduce_decorative_textures),
    updatedAt: row.updated_at,
  };
}

function mapTunerPreferences(row: UserTunerPreferencesRow): UserTunerPreferences {
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

function mapAudioPreferences(row: UserAudioPreferencesRow): UserAudioPreferences {
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

function mapStagePreferences(row: UserStagePreferencesRow): UserStagePreferences {
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

function mapMetronomePreferences(row: UserMetronomePreferencesRow): UserMetronomePreferences {
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

function mapPreferencesSnapshot(rows: {
  readonly app: UserAppPreferences;
  readonly appearance: UserAppearancePreferences;
  readonly tuner: UserTunerPreferences;
  readonly audio: UserAudioPreferences;
  readonly stage: UserStagePreferences;
  readonly metronome: UserMetronomePreferences;
}): UserPreferences {
  return {
    app: rows.app,
    appearance: rows.appearance,
    tuner: rows.tuner,
    audio: rows.audio,
    stage: rows.stage,
    metronome: rows.metronome,
  };
}

async function readFirstTuningReference(database: SQLiteDatabaseLike): Promise<TuningRef | null> {
  const catalog = await database.getFirstAsync<TuningIdRow>(SELECT_FIRST_CATALOG_TUNING_SQL);

  if (catalog) {
    return asTuningRef("catalog", catalog.id);
  }

  const user = await database.getFirstAsync<TuningIdRow>(SELECT_FIRST_USER_TUNING_SQL);

  if (user) {
    return asTuningRef("user", user.id);
  }

  return null;
}

async function resolveValidTuningReference(
  database: SQLiteDatabaseLike,
  ref: TuningRef | null | undefined,
): Promise<TuningRef> {
  if (ref) {
    const lookupSql = ref.origin === "catalog" ? SELECT_CATALOG_TUNING_SQL : SELECT_USER_TUNING_SQL;
    const found = await database.getFirstAsync<TuningIdRow>(lookupSql, ref.id);

    if (found) {
      return ref;
    }
  }

  const fallback = await readFirstTuningReference(database);

  if (fallback) {
    return fallback;
  }

  throw new RepositoryError("TUNING_NOT_FOUND", "No tuning is available to resolve the active reference.");
}

async function ensureTuningExists(database: SQLiteDatabaseLike, ref: TuningRef): Promise<void> {
  const resolved = await resolveValidTuningReference(database, ref);

  if (resolved.origin !== ref.origin || resolved.id !== ref.id) {
    throw new RepositoryError("INVALID_TUNING_REFERENCE", `Tuning not found: ${ref.origin}:${ref.id}`);
  }
}

async function readPreferencesSnapshot(database: SQLiteDatabaseLike, timestamp: string): Promise<UserPreferences> {
  const [appRow, appearanceRow, tunerRow, audioRow, stageRow, metronomeRow] = await Promise.all([
    database.getFirstAsync<UserAppPreferencesRow>(SELECT_APP_PREFERENCES_SQL, "app_preferences"),
    database.getFirstAsync<UserAppearancePreferencesRow>(
      SELECT_APPEARANCE_PREFERENCES_SQL,
      "appearance_preferences",
    ),
    database.getFirstAsync<UserTunerPreferencesRow>(SELECT_TUNER_PREFERENCES_SQL, "tuner_preferences"),
    database.getFirstAsync<UserAudioPreferencesRow>(SELECT_AUDIO_PREFERENCES_SQL, "audio_preferences"),
    database.getFirstAsync<UserStagePreferencesRow>(SELECT_STAGE_PREFERENCES_SQL, "stage_preferences"),
    database.getFirstAsync<UserMetronomePreferencesRow>(
      SELECT_METRONOME_PREFERENCES_SQL,
      "metronome_preferences",
    ),
  ]);

  const activeTuning = await resolveValidTuningReference(
    database,
    appRow ? asTuningRef(appRow.active_tuning_origin, appRow.active_tuning_id) : null,
  );
  const defaults = buildDefaultPreferences({ activeTuning, now: timestamp });

  const snapshot = mapPreferencesSnapshot({
    app: appRow
      ? {
          ...mapAppPreferences(appRow),
          activeTuningOrigin: activeTuning.origin,
          activeTuningId: activeTuning.id,
        }
      : defaults.app,
    appearance: appearanceRow ? mapAppearancePreferences(appearanceRow) : defaults.appearance,
    tuner: tunerRow ? mapTunerPreferences(tunerRow) : defaults.tuner,
    audio: audioRow ? mapAudioPreferences(audioRow) : defaults.audio,
    stage: stageRow ? mapStagePreferences(stageRow) : defaults.stage,
    metronome: metronomeRow ? mapMetronomePreferences(metronomeRow) : defaults.metronome,
  });

  const parsed = UserPreferencesSchema.safeParse(snapshot);

  if (!parsed.success) {
    throw new RepositoryError("DATABASE_ERROR", "Stored preferences are invalid.", parsed.error);
  }

  return parsed.data;
}

async function writePreferencesSnapshot(
  database: SQLiteDatabaseLike,
  preferences: UserPreferences,
): Promise<void> {
  await ensureTuningExists(
    database,
    asTuningRef(preferences.app.activeTuningOrigin, preferences.app.activeTuningId),
  );

  const parsed = UserPreferencesSchema.safeParse(preferences);

  if (!parsed.success) {
    throw new RepositoryError("DATABASE_ERROR", "Preferences payload is invalid.", parsed.error);
  }

  await database.runAsync(
    UPSERT_APP_PREFERENCES_SQL,
    parsed.data.app.id,
    parsed.data.app.activeTuningOrigin,
    parsed.data.app.activeTuningId,
    parsed.data.app.accidentalPreference,
    parsed.data.app.handedness,
    parsed.data.app.diagramOrientation,
    parsed.data.app.diagramMode,
    dbBoolean(parsed.data.app.showCalculatedShapes),
    dbBoolean(parsed.data.app.expandTheoryDetails),
    parsed.data.app.locale,
    parsed.data.app.updatedAt,
  );

  await database.runAsync(
    UPSERT_APPEARANCE_PREFERENCES_SQL,
    parsed.data.appearance.id,
    parsed.data.appearance.themeMode,
    dbBoolean(parsed.data.appearance.highContrast),
    parsed.data.appearance.internalTextScale,
    dbBoolean(parsed.data.appearance.reduceDecorativeTextures),
    parsed.data.appearance.updatedAt,
  );

  await database.runAsync(
    UPSERT_TUNER_PREFERENCES_SQL,
    parsed.data.tuner.id,
    parsed.data.tuner.calibrationA4,
    parsed.data.tuner.toleranceCents,
    dbBoolean(parsed.data.tuner.autoAdvance),
    dbBoolean(parsed.data.tuner.vibrateWhenInTune),
    dbBoolean(parsed.data.tuner.keepScreenAwake),
    dbBoolean(parsed.data.tuner.showFrequency),
    parsed.data.tuner.noiseFilterLevel,
    parsed.data.tuner.lastMode,
    parsed.data.tuner.updatedAt,
  );

  await database.runAsync(
    UPSERT_AUDIO_PREFERENCES_SQL,
    parsed.data.audio.id,
    parsed.data.audio.referenceVolume,
    parsed.data.audio.metronomeVolume,
    dbBoolean(parsed.data.audio.firstBeatAccent),
    dbBoolean(parsed.data.audio.spokenCountIn),
    dbBoolean(parsed.data.audio.hapticsEnabled),
    dbBoolean(parsed.data.audio.confirmationSoundsEnabled),
    parsed.data.audio.updatedAt,
  );

  await database.runAsync(
    UPSERT_STAGE_PREFERENCES_SQL,
    parsed.data.stage.id,
    dbBoolean(parsed.data.stage.keepScreenAwake),
    dbBoolean(parsed.data.stage.autoHideControls),
    dbBoolean(parsed.data.stage.tapToPause),
    parsed.data.stage.defaultScrollSpeed,
    parsed.data.stage.defaultFontScale,
    parsed.data.stage.preferredOrientation,
    dbBoolean(parsed.data.stage.forceHighContrast),
    dbBoolean(parsed.data.stage.lockControlsOnStart),
    parsed.data.stage.updatedAt,
  );

  await database.runAsync(
    UPSERT_METRONOME_PREFERENCES_SQL,
    parsed.data.metronome.id,
    parsed.data.metronome.lastBpm,
    parsed.data.metronome.timeSignatureNumerator,
    parsed.data.metronome.timeSignatureDenominator,
    dbBoolean(parsed.data.metronome.accentFirstBeat),
    parsed.data.metronome.countInBars,
    dbBoolean(parsed.data.metronome.visualPulseEnabled),
    parsed.data.metronome.updatedAt,
  );
}

export function createPreferencesRepository(
  database: SQLiteDatabaseLike,
  options: {
    readonly now?: () => string;
  } = {},
): PreferencesRepository {
  const now = createNowProvider(options.now);

  async function getPreferences(): Promise<UserPreferences> {
    return withDatabaseTransaction(database, async (transactionalDatabase) => {
      return readPreferencesSnapshot(transactionalDatabase, now());
    });
  }

  async function savePreferences(preferences: UserPreferences): Promise<UserPreferences> {
    try {
      await withDatabaseTransaction(
        database,
        async (transactionalDatabase) => {
          await writePreferencesSnapshot(transactionalDatabase, preferences);
        },
        { exclusive: true },
      );

      return getPreferences();
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to save preferences.");
    }
  }

  async function restorePreferences(section?: PreferencesSection): Promise<UserPreferences> {
    try {
      const current = await getPreferences();
      const fallback = await resolveValidTuningReference(
        database,
        asTuningRef(current.app.activeTuningOrigin, current.app.activeTuningId),
      );
      const defaults = buildDefaultPreferences({ activeTuning: fallback, now: now() });

      const next: UserPreferences = isPreferencesSection(section)
        ? {
            ...current,
            [section]: defaults[section],
            app: section === "app" ? defaults.app : current.app,
          }
        : defaults;

      return savePreferences(next);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to restore preferences.");
    }
  }

  async function setActiveTuning(ref: EntityRef<"tuning">): Promise<UserPreferences> {
    try {
      await ensureTuningExists(database, ref);
      const current = await getPreferences();
      const next: UserPreferences = {
        ...current,
        app: {
          ...current.app,
          activeTuningOrigin: ref.origin,
          activeTuningId: ref.id,
          updatedAt: now(),
        },
      };

      return savePreferences(next);
    } catch (error) {
      throw toRepositoryError(error, "INVALID_TUNING_REFERENCE", "Unable to set the active tuning.");
    }
  }

  return {
    get: getPreferences,
    save: savePreferences,
    restore: restorePreferences,
    setActiveTuning,
  };
}
