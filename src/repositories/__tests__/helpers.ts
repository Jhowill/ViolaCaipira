import type { SQLiteDatabaseLike } from "@/types/database";
import type {
  UserAppPreferences,
  UserAppearancePreferences,
  UserMetronomePreferences,
  UserStagePreferences,
  UserTunerPreferences,
  TuningDetails,
} from "@/types/music";

import { buildValidPreferences, buildValidTuning } from "@/domain/music/__tests__/fixtures";

interface UserAppPreferencesRow {
  readonly id: "app_preferences";
  readonly active_tuning_origin: "catalog" | "user";
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

interface CatalogTuningRow {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly short_name: string;
  readonly description: string | null;
  readonly origin_region: string | null;
  readonly open_chord_id: string | null;
  readonly difficulty: string;
  readonly verification_status: "verified" | "deprecated";
  readonly reviewer_id: string | null;
  readonly source_id: string | null;
  readonly reviewed_at: string | null;
  readonly tension_warning: string | null;
  readonly is_featured: number;
  readonly sort_order: number;
  readonly created_at: string;
  readonly updated_at: string;
}

interface CatalogTuningAliasRow {
  readonly id: string;
  readonly tuning_id: string;
  readonly alias: string;
  readonly region: string | null;
  readonly notes: string | null;
  readonly normalized_alias: string;
}

interface CatalogTuningCourseRow {
  readonly id: string;
  readonly tuning_id: string;
  readonly course_number: 1 | 2 | 3 | 4 | 5;
  readonly pair_type: "unison" | "octave" | "custom";
  readonly label: string | null;
  readonly sort_order: number;
}

interface CatalogTuningStringRow {
  readonly id: string;
  readonly course_id: string;
  readonly tuning_id: string;
  readonly course_number: 1 | 2 | 3 | 4 | 5;
  readonly string_in_course: 1 | 2;
  readonly physical_string_number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  readonly pitch_class: TuningDetails["courses"][number]["strings"][number]["pitchClass"];
  readonly octave: TuningDetails["courses"][number]["strings"][number]["octave"];
  readonly midi_note: TuningDetails["courses"][number]["strings"][number]["midiNote"];
  readonly reference_frequency_440: TuningDetails["courses"][number]["strings"][number]["referenceFrequency440"];
  readonly gauge_hint: string | null;
  readonly material_hint: string | null;
  readonly display_order: number;
}

interface CatalogChordRow {
  readonly id: string;
  readonly canonical_symbol: string;
}

interface UserTuningRow {
  readonly id: string;
  readonly name: string;
  readonly short_name: string | null;
  readonly description: string | null;
  readonly origin_label: string | null;
  readonly open_chord_text: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
}

interface UserTuningCourseRow {
  readonly id: string;
  readonly tuning_id: string;
  readonly course_number: 1 | 2 | 3 | 4 | 5;
  readonly pair_type: "unison" | "octave" | "custom";
  readonly label: string | null;
  readonly sort_order: number;
}

interface UserTuningStringRow {
  readonly id: string;
  readonly course_id: string;
  readonly tuning_id: string;
  readonly course_number: 1 | 2 | 3 | 4 | 5;
  readonly string_in_course: 1 | 2;
  readonly physical_string_number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  readonly pitch_class: TuningDetails["courses"][number]["strings"][number]["pitchClass"];
  readonly octave: TuningDetails["courses"][number]["strings"][number]["octave"];
  readonly midi_note: TuningDetails["courses"][number]["strings"][number]["midiNote"];
  readonly reference_frequency_440: TuningDetails["courses"][number]["strings"][number]["referenceFrequency440"];
  readonly gauge_hint: string | null;
  readonly material_hint: string | null;
  readonly display_order: number;
}

interface FavoriteRow {
  readonly id: string;
  readonly entity_type: "tuning";
  readonly entity_origin: "catalog" | "user";
  readonly entity_id: string;
  readonly created_at: string;
}

export interface RepositoryFixtureState {
  readonly userAppPreferences: UserAppPreferencesRow | null;
  readonly userAppearancePreferences: UserAppearancePreferencesRow | null;
  readonly userTunerPreferences: UserTunerPreferencesRow | null;
  readonly userAudioPreferences: UserAudioPreferencesRow | null;
  readonly userStagePreferences: UserStagePreferencesRow | null;
  readonly userMetronomePreferences: UserMetronomePreferencesRow | null;
  readonly catalogTunings: CatalogTuningRow[];
  readonly catalogTuningAliases: CatalogTuningAliasRow[];
  readonly catalogTuningCourses: CatalogTuningCourseRow[];
  readonly catalogTuningStrings: CatalogTuningStringRow[];
  readonly catalogChords: CatalogChordRow[];
  readonly userTunings: UserTuningRow[];
  readonly userTuningCourses: UserTuningCourseRow[];
  readonly userTuningStrings: UserTuningStringRow[];
  readonly userFavorites: FavoriteRow[];
}

const TIMESTAMP = "2026-07-12T12:00:00.000Z";

function normalizeSql(source: string): string {
  return source.replace(/\s+/g, " ").trim().toLowerCase();
}

function cloneState(state: RepositoryFixtureState): RepositoryFixtureState {
  return structuredClone(state);
}

function toDbBoolean(value: boolean): number {
  return value ? 1 : 0;
}

function buildTuningCourseRows(tuning: TuningDetails, tuningId: string): {
  readonly courses: CatalogTuningCourseRow[] | UserTuningCourseRow[];
  readonly strings: CatalogTuningStringRow[] | UserTuningStringRow[];
} {
  const courses = tuning.courses.map((course) => ({
    id: `${tuningId}-course-${course.courseNumber}`,
    tuning_id: tuningId,
    course_number: course.courseNumber,
    pair_type: course.pairType,
    label: `Curso ${course.courseNumber}`,
    sort_order: course.courseNumber,
  }));

  const strings = tuning.courses.flatMap((course) =>
    course.strings.map((string) => ({
      id: `${tuningId}-string-${string.physicalStringNumber}`,
      course_id: `${tuningId}-course-${course.courseNumber}`,
      tuning_id: tuningId,
      course_number: course.courseNumber,
      string_in_course: string.stringInCourse,
      physical_string_number: string.physicalStringNumber,
      pitch_class: string.pitchClass,
      octave: string.octave,
      midi_note: string.midiNote,
      reference_frequency_440: string.referenceFrequency440,
      gauge_hint: null,
      material_hint: null,
      display_order: string.physicalStringNumber,
    })),
  );

  return {
    courses,
    strings,
  };
}

export function buildRepositoryFixtureState(): RepositoryFixtureState {
  const catalogTuning = buildValidTuning();
  const userTuning: TuningDetails = {
    ...catalogTuning,
    id: "user-tuning-personal",
    origin: "user",
    name: "Afinação pessoal",
    shortName: "Pessoal",
    aliases: ["Pessoal"],
    verificationStatus: "user_created",
    tensionWarning: null,
  };
  const preferences = buildValidPreferences();
  const catalogCourseRows = buildTuningCourseRows(catalogTuning, catalogTuning.id);
  const userCourseRows = buildTuningCourseRows(userTuning, userTuning.id);

  return {
    userAppPreferences: {
      id: "app_preferences",
      active_tuning_origin: preferences.app.activeTuningOrigin,
      active_tuning_id: preferences.app.activeTuningId,
      accidental_preference: preferences.app.accidentalPreference,
      handedness: preferences.app.handedness,
      diagram_orientation: preferences.app.diagramOrientation,
      diagram_mode: preferences.app.diagramMode,
      show_calculated_shapes: toDbBoolean(preferences.app.showCalculatedShapes),
      expand_theory_details: toDbBoolean(preferences.app.expandTheoryDetails),
      locale: preferences.app.locale,
      updated_at: preferences.app.updatedAt,
    },
    userAppearancePreferences: {
      id: "appearance_preferences",
      theme_mode: preferences.appearance.themeMode,
      high_contrast: toDbBoolean(preferences.appearance.highContrast),
      internal_text_scale: preferences.appearance.internalTextScale,
      reduce_decorative_textures: toDbBoolean(preferences.appearance.reduceDecorativeTextures),
      updated_at: preferences.appearance.updatedAt,
    },
    userTunerPreferences: {
      id: "tuner_preferences",
      calibration_a4: preferences.tuner.calibrationA4,
      tolerance_cents: preferences.tuner.toleranceCents,
      auto_advance: toDbBoolean(preferences.tuner.autoAdvance),
      vibrate_when_in_tune: toDbBoolean(preferences.tuner.vibrateWhenInTune),
      keep_screen_awake: toDbBoolean(preferences.tuner.keepScreenAwake),
      show_frequency: toDbBoolean(preferences.tuner.showFrequency),
      noise_filter_level: preferences.tuner.noiseFilterLevel,
      last_mode: preferences.tuner.lastMode,
      updated_at: preferences.tuner.updatedAt,
    },
    userAudioPreferences: {
      id: "audio_preferences",
      reference_volume: preferences.audio.referenceVolume,
      metronome_volume: preferences.audio.metronomeVolume,
      first_beat_accent: toDbBoolean(preferences.audio.firstBeatAccent),
      spoken_count_in: toDbBoolean(preferences.audio.spokenCountIn),
      haptics_enabled: toDbBoolean(preferences.audio.hapticsEnabled),
      confirmation_sounds_enabled: toDbBoolean(preferences.audio.confirmationSoundsEnabled),
      updated_at: preferences.audio.updatedAt,
    },
    userStagePreferences: {
      id: "stage_preferences",
      keep_screen_awake: toDbBoolean(preferences.stage.keepScreenAwake),
      auto_hide_controls: toDbBoolean(preferences.stage.autoHideControls),
      tap_to_pause: toDbBoolean(preferences.stage.tapToPause),
      default_scroll_speed: preferences.stage.defaultScrollSpeed,
      default_font_scale: preferences.stage.defaultFontScale,
      preferred_orientation: preferences.stage.preferredOrientation,
      force_high_contrast: toDbBoolean(preferences.stage.forceHighContrast),
      lock_controls_on_start: toDbBoolean(preferences.stage.lockControlsOnStart),
      updated_at: preferences.stage.updatedAt,
    },
    userMetronomePreferences: {
      id: "metronome_preferences",
      last_bpm: preferences.metronome.lastBpm,
      time_signature_numerator: preferences.metronome.timeSignatureNumerator,
      time_signature_denominator: preferences.metronome.timeSignatureDenominator,
      accent_first_beat: toDbBoolean(preferences.metronome.accentFirstBeat),
      count_in_bars: preferences.metronome.countInBars,
      visual_pulse_enabled: toDbBoolean(preferences.metronome.visualPulseEnabled),
      updated_at: preferences.metronome.updatedAt,
    },
    catalogTunings: [
      {
        id: catalogTuning.id,
        slug: "cebolao-em-c",
        name: catalogTuning.name,
        short_name: catalogTuning.shortName,
        description: catalogTuning.description ?? null,
        origin_region: null,
        open_chord_id: "catalog-chord-c",
        difficulty: "beginner",
        verification_status: "verified",
        reviewer_id: "reviewer-maria",
        source_id: "source-fixture",
        reviewed_at: TIMESTAMP,
        tension_warning: catalogTuning.tensionWarning ?? null,
        is_featured: 1,
        sort_order: 1,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
      },
    ],
    catalogTuningAliases: catalogTuning.aliases.map((alias, index) => ({
      id: `catalog-alias-${index + 1}`,
      tuning_id: catalogTuning.id,
      alias,
      region: null,
      notes: null,
      normalized_alias: alias.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
    })),
    catalogTuningCourses: [...catalogCourseRows.courses],
    catalogTuningStrings: [...catalogCourseRows.strings],
    catalogChords: [
      {
        id: "catalog-chord-c",
        canonical_symbol: "C",
      },
    ],
    userTunings: [
      {
        id: userTuning.id,
        name: userTuning.name,
        short_name: null,
        description: userTuning.description ?? null,
        origin_label: "Pessoal",
        open_chord_text: "C",
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
        deleted_at: null,
      },
    ],
    userTuningCourses: [...userCourseRows.courses],
    userTuningStrings: [...userCourseRows.strings],
    userFavorites: [
      {
        id: "favorite-user-tuning",
        entity_type: "tuning",
        entity_origin: "user",
        entity_id: userTuning.id,
        created_at: TIMESTAMP,
      },
    ],
  };
}

function readTuningRows<T extends { readonly id: string }>(
  rows: readonly T[],
  id: string,
): T | null {
  return rows.find((row) => row.id === id) ?? null;
}

function filterRows<T>(rows: readonly T[], predicate: (row: T) => boolean): T[] {
  return rows.filter(predicate);
}

function sortCatalogTunings(rows: readonly CatalogTuningRow[]): CatalogTuningRow[] {
  return [...rows].sort((left, right) => {
    if (left.is_featured !== right.is_featured) {
      return right.is_featured - left.is_featured;
    }

    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }

    return left.name.localeCompare(right.name);
  });
}

function sortUserTunings(rows: readonly UserTuningRow[]): UserTuningRow[] {
  return [...rows]
    .filter((row) => row.deleted_at === null)
    .sort((left, right) => {
      if (left.updated_at !== right.updated_at) {
        return right.updated_at.localeCompare(left.updated_at);
      }

      return left.name.localeCompare(right.name);
    });
}

function createState(initialState: Partial<RepositoryFixtureState> = {}): RepositoryFixtureState {
  const base = buildRepositoryFixtureState();

  return {
    userAppPreferences: initialState.userAppPreferences ?? base.userAppPreferences,
    userAppearancePreferences: initialState.userAppearancePreferences ?? base.userAppearancePreferences,
    userTunerPreferences: initialState.userTunerPreferences ?? base.userTunerPreferences,
    userAudioPreferences: initialState.userAudioPreferences ?? base.userAudioPreferences,
    userStagePreferences: initialState.userStagePreferences ?? base.userStagePreferences,
    userMetronomePreferences: initialState.userMetronomePreferences ?? base.userMetronomePreferences,
    catalogTunings: initialState.catalogTunings ?? [...base.catalogTunings],
    catalogTuningAliases: initialState.catalogTuningAliases ?? [...base.catalogTuningAliases],
    catalogTuningCourses: initialState.catalogTuningCourses ?? [...base.catalogTuningCourses],
    catalogTuningStrings: initialState.catalogTuningStrings ?? [...base.catalogTuningStrings],
    catalogChords: initialState.catalogChords ?? [...base.catalogChords],
    userTunings: initialState.userTunings ?? [...base.userTunings],
    userTuningCourses: initialState.userTuningCourses ?? [...base.userTuningCourses],
    userTuningStrings: initialState.userTuningStrings ?? [...base.userTuningStrings],
    userFavorites: initialState.userFavorites ?? [...base.userFavorites],
  };
}

export function createRepositoryFakeDatabase(initialState: Partial<RepositoryFixtureState> = {}): SQLiteDatabaseLike & {
  readonly state: RepositoryFixtureState;
} {
  let state = createState(initialState);

  const applyRunStatement = (sql: string, params: readonly unknown[]): void => {
    const normalized = normalizeSql(sql);

    if (normalized.includes("insert into user_app_preferences")) {
      const [id, activeOrigin, activeId, accidentalPreference, handedness, diagramOrientation, diagramMode, showCalculatedShapes, expandTheoryDetails, locale, updatedAt] = params;
      state = {
        ...state,
        userAppPreferences: {
          id: String(id) as "app_preferences",
          active_tuning_origin: String(activeOrigin) as "catalog" | "user",
          active_tuning_id: String(activeId),
          accidental_preference: accidentalPreference as UserAppPreferences["accidentalPreference"],
          handedness: handedness as UserAppPreferences["handedness"],
          diagram_orientation: diagramOrientation as UserAppPreferences["diagramOrientation"],
          diagram_mode: diagramMode as UserAppPreferences["diagramMode"],
          show_calculated_shapes: Number(showCalculatedShapes),
          expand_theory_details: Number(expandTheoryDetails),
          locale: String(locale),
          updated_at: String(updatedAt),
        },
      };
      return;
    }

    if (normalized.includes("insert into user_appearance_preferences")) {
      const [id, themeMode, highContrast, internalTextScale, reduceDecorativeTextures, updatedAt] = params;
      state = {
        ...state,
        userAppearancePreferences: {
          id: String(id) as "appearance_preferences",
          theme_mode: themeMode as UserAppearancePreferences["themeMode"],
          high_contrast: Number(highContrast),
          internal_text_scale: internalTextScale as UserAppearancePreferences["internalTextScale"],
          reduce_decorative_textures: Number(reduceDecorativeTextures),
          updated_at: String(updatedAt),
        },
      };
      return;
    }

    if (normalized.includes("insert into user_tuner_preferences")) {
      const [id, calibrationA4, toleranceCents, autoAdvance, vibrateWhenInTune, keepScreenAwake, showFrequency, noiseFilterLevel, lastMode, updatedAt] = params;
      state = {
        ...state,
        userTunerPreferences: {
          id: String(id) as "tuner_preferences",
          calibration_a4: Number(calibrationA4),
          tolerance_cents: Number(toleranceCents),
          auto_advance: Number(autoAdvance),
          vibrate_when_in_tune: Number(vibrateWhenInTune),
          keep_screen_awake: Number(keepScreenAwake),
          show_frequency: Number(showFrequency),
          noise_filter_level: noiseFilterLevel as UserTunerPreferences["noiseFilterLevel"],
          last_mode: lastMode as UserTunerPreferences["lastMode"],
          updated_at: String(updatedAt),
        },
      };
      return;
    }

    if (normalized.includes("insert into user_audio_preferences")) {
      const [id, referenceVolume, metronomeVolume, firstBeatAccent, spokenCountIn, hapticsEnabled, confirmationSoundsEnabled, updatedAt] = params;
      state = {
        ...state,
        userAudioPreferences: {
          id: String(id) as "audio_preferences",
          reference_volume: Number(referenceVolume),
          metronome_volume: Number(metronomeVolume),
          first_beat_accent: Number(firstBeatAccent),
          spoken_count_in: Number(spokenCountIn),
          haptics_enabled: Number(hapticsEnabled),
          confirmation_sounds_enabled: Number(confirmationSoundsEnabled),
          updated_at: String(updatedAt),
        },
      };
      return;
    }

    if (normalized.includes("insert into user_stage_preferences")) {
      const [id, keepScreenAwake, autoHideControls, tapToPause, defaultScrollSpeed, defaultFontScale, preferredOrientation, forceHighContrast, lockControlsOnStart, updatedAt] = params;
      state = {
        ...state,
        userStagePreferences: {
          id: String(id) as "stage_preferences",
          keep_screen_awake: Number(keepScreenAwake),
          auto_hide_controls: Number(autoHideControls),
          tap_to_pause: Number(tapToPause),
          default_scroll_speed: Number(defaultScrollSpeed),
          default_font_scale: Number(defaultFontScale),
          preferred_orientation: preferredOrientation as UserStagePreferences["preferredOrientation"],
          force_high_contrast: Number(forceHighContrast),
          lock_controls_on_start: Number(lockControlsOnStart),
          updated_at: String(updatedAt),
        },
      };
      return;
    }

    if (normalized.includes("insert into user_metronome_preferences")) {
      const [id, lastBpm, timeSignatureNumerator, timeSignatureDenominator, accentFirstBeat, countInBars, visualPulseEnabled, updatedAt] = params;
      state = {
        ...state,
        userMetronomePreferences: {
          id: String(id) as "metronome_preferences",
          last_bpm: Number(lastBpm),
          time_signature_numerator: Number(timeSignatureNumerator),
          time_signature_denominator: timeSignatureDenominator as UserMetronomePreferences["timeSignatureDenominator"],
          accent_first_beat: Number(accentFirstBeat),
          count_in_bars: Number(countInBars),
          visual_pulse_enabled: Number(visualPulseEnabled),
          updated_at: String(updatedAt),
        },
      };
      return;
    }
  };

  const database: SQLiteDatabaseLike & {
    readonly state: RepositoryFixtureState;
  } = {
    get state() {
      return state;
    },
    execAsync(): Promise<void> {
      return Promise.resolve();
    },
    runAsync(source: string, ...params: readonly unknown[]): Promise<{ readonly lastInsertRowId: number; readonly changes: number }> {
      applyRunStatement(source, params);
      return Promise.resolve({
        lastInsertRowId: 1,
        changes: 1,
      });
    },
    getFirstAsync<T = Readonly<Record<string, unknown>>>(
      source: string,
      ...params: readonly unknown[]
    ): Promise<T | null> {
      const normalized = normalizeSql(source);

      if (normalized.includes("from user_app_preferences")) {
        const row = state.userAppPreferences;
        if (!row || String(params[0]) !== row.id) {
          return Promise.resolve(null);
        }
        return Promise.resolve(row as unknown as T);
      }

      if (normalized.includes("from user_appearance_preferences")) {
        const row = state.userAppearancePreferences;
        if (!row || String(params[0]) !== row.id) {
          return Promise.resolve(null);
        }
        return Promise.resolve(row as unknown as T);
      }

      if (normalized.includes("from user_tuner_preferences")) {
        const row = state.userTunerPreferences;
        if (!row || String(params[0]) !== row.id) {
          return Promise.resolve(null);
        }
        return Promise.resolve(row as unknown as T);
      }

      if (normalized.includes("from user_audio_preferences")) {
        const row = state.userAudioPreferences;
        if (!row || String(params[0]) !== row.id) {
          return Promise.resolve(null);
        }
        return Promise.resolve(row as unknown as T);
      }

      if (normalized.includes("from user_stage_preferences")) {
        const row = state.userStagePreferences;
        if (!row || String(params[0]) !== row.id) {
          return Promise.resolve(null);
        }
        return Promise.resolve(row as unknown as T);
      }

      if (normalized.includes("from user_metronome_preferences")) {
        const row = state.userMetronomePreferences;
        if (!row || String(params[0]) !== row.id) {
          return Promise.resolve(null);
        }
        return Promise.resolve(row as unknown as T);
      }

      if (normalized.includes("from catalog_tunings") && normalized.includes("where id = ?")) {
        const row = readTuningRows(state.catalogTunings, String(params[0]));
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from user_tunings") && normalized.includes("where id = ?")) {
        const row = readTuningRows(state.userTunings.filter((entry) => entry.deleted_at === null), String(params[0]));
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from catalog_chords") && normalized.includes("where id = ?")) {
        const row = readTuningRows(state.catalogChords, String(params[0]));
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from user_favorites")) {
        const [entityType, entityOrigin, entityId] = params;
        const row = state.userFavorites.find(
          (entry) =>
            entry.entity_type === String(entityType) &&
            entry.entity_origin === String(entityOrigin) &&
            entry.entity_id === String(entityId),
        );
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from catalog_tunings") && normalized.includes("order by is_featured desc")) {
        const row = sortCatalogTunings(state.catalogTunings)[0] ?? null;
        return Promise.resolve(row as unknown as T | null);
      }

      if (normalized.includes("from user_tunings") && normalized.includes("order by updated_at desc")) {
        const row = sortUserTunings(state.userTunings)[0] ?? null;
        return Promise.resolve(row as unknown as T | null);
      }

      return Promise.resolve(null);
    },
    getAllAsync<T = Readonly<Record<string, unknown>>>(
      source: string,
      ...params: readonly unknown[]
    ): Promise<readonly T[]> {
      const normalized = normalizeSql(source);

      if (normalized.includes("from catalog_tunings")) {
        const rows = normalized.includes("where 1 = 1") || normalized.includes("order by is_featured desc")
          ? sortCatalogTunings(state.catalogTunings)
          : filterRows(state.catalogTunings, (row) => String(params[0]) === row.id);
        return Promise.resolve(rows as unknown as readonly T[]);
      }

      if (normalized.includes("from user_tunings")) {
        const rows = normalized.includes("order by updated_at desc")
          ? sortUserTunings(state.userTunings)
          : filterRows(state.userTunings, (row) => row.deleted_at === null && String(params[0]) === row.id);
        return Promise.resolve(rows as unknown as readonly T[]);
      }

      if (normalized.includes("from catalog_tuning_aliases")) {
        const rows = state.catalogTuningAliases
          .filter((row) => row.tuning_id === String(params[0]))
          .sort((left, right) => left.normalized_alias.localeCompare(right.normalized_alias));
        return Promise.resolve(rows as unknown as readonly T[]);
      }

      if (normalized.includes("from catalog_tuning_courses")) {
        const rows = state.catalogTuningCourses
          .filter((row) => row.tuning_id === String(params[0]))
          .sort((left, right) => left.course_number - right.course_number);
        return Promise.resolve(rows as unknown as readonly T[]);
      }

      if (normalized.includes("from catalog_tuning_strings")) {
        const rows = state.catalogTuningStrings
          .filter((row) => row.tuning_id === String(params[0]))
          .sort((left, right) => left.physical_string_number - right.physical_string_number);
        return Promise.resolve(rows as unknown as readonly T[]);
      }

      if (normalized.includes("from user_tuning_courses")) {
        const rows = state.userTuningCourses
          .filter((row) => row.tuning_id === String(params[0]))
          .sort((left, right) => left.course_number - right.course_number);
        return Promise.resolve(rows as unknown as readonly T[]);
      }

      if (normalized.includes("from user_tuning_strings")) {
        const rows = state.userTuningStrings
          .filter((row) => row.tuning_id === String(params[0]))
          .sort((left, right) => left.physical_string_number - right.physical_string_number);
        return Promise.resolve(rows as unknown as readonly T[]);
      }

      if (normalized.includes("from user_favorites")) {
        const rows = state.userFavorites.filter(
          (entry) =>
            entry.entity_type === String(params[0]) &&
            entry.entity_origin === String(params[1]) &&
            entry.entity_id === String(params[2]),
        );
        return Promise.resolve(rows as unknown as readonly T[]);
      }

      return Promise.resolve([] as readonly T[]);
    },
    async withTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
      const snapshot = cloneState(state);

      try {
        return await task();
      } catch (error) {
        state = snapshot;
        throw error;
      }
    },
    withExclusiveTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
      return database.withTransactionAsync(task);
    },
    closeAsync(): Promise<void> {
      return Promise.resolve();
    },
  };

  return database;
}
