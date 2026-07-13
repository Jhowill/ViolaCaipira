import type { SQLiteDatabaseLike } from "@/types/database";
import { buildValidSongDocument } from "@/domain/music/__tests__/fixtures";

export type BackupTestRow = Readonly<Record<string, unknown>>;

export interface BackupTestState {
  readonly tables: Record<string, BackupTestRow[]>;
  readonly failOnInsertTable?: string | null;
}

export interface BackupTestDatabase extends SQLiteDatabaseLike {
  readonly state: BackupTestState;
}

function normalizeSql(source: string): string {
  return source.replace(/\s+/g, " ").trim().toLowerCase();
}

function cloneState(state: BackupTestState): BackupTestState {
  return {
    tables: Object.fromEntries(
      Object.entries(state.tables).map(([name, rows]) => [name, (rows ?? []).map((row) => structuredClone(row))] as const),
    ),
    failOnInsertTable: state.failOnInsertTable ?? null,
  };
}

function createState(initialTables: Partial<Record<string, BackupTestRow[]>> = {}, failOnInsertTable?: string | null): BackupTestState {
  return {
    tables: Object.fromEntries(
      Object.entries(initialTables).map(([name, rows]) => [name, (rows ?? []).map((row) => structuredClone(row))] as const),
    ),
    failOnInsertTable: failOnInsertTable ?? null,
  };
}

function getTableName(sql: string): string | null {
  const normalized = normalizeSql(sql);
  const match = normalized.match(/\bfrom\s+([a-z0-9_]+)/i) ?? normalized.match(/\binto\s+([a-z0-9_]+)/i) ?? normalized.match(/\bdelete from\s+([a-z0-9_]+)/i);
  return match?.[1] ?? null;
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

function parseInsert(sql: string): { readonly table: string; readonly columns: readonly string[] } | null {
  const normalized = normalizeSql(sql);
  const match = normalized.match(/^insert or replace into ([a-z0-9_]+) \((.+)\) values \((.+)\)$/i);
  if (!match) {
    return null;
  }

  return {
    table: match[1] ?? "",
    columns: (match[2] ?? "").split(",").map((part) => part.trim()).filter(Boolean),
  };
}

export function buildBackupFixtureTables(): Record<string, BackupTestRow[]> {
  const documentJson = JSON.stringify(buildValidSongDocument());

  return {
    user_profile: [
      {
        id: "local_user",
        experience_level: "intermediate",
        onboarding_status: "completed",
        onboarding_step: null,
        created_at: "2026-07-12T10:00:00.000Z",
        updated_at: "2026-07-12T10:15:00.000Z",
      },
    ],
    user_app_preferences: [
      {
        id: "app_preferences",
        active_tuning_origin: "user",
        active_tuning_id: "user-tuning-1",
        accidental_preference: "contextual",
        handedness: "right",
        diagram_orientation: "standard",
        diagram_mode: "five_courses",
        show_calculated_shapes: 1,
        expand_theory_details: 0,
        locale: "pt-BR",
        updated_at: "2026-07-12T10:15:00.000Z",
      },
    ],
    user_appearance_preferences: [
      {
        id: "appearance_preferences",
        theme_mode: "light",
        high_contrast: 0,
        internal_text_scale: "system",
        reduce_decorative_textures: 0,
        updated_at: "2026-07-12T10:15:00.000Z",
      },
    ],
    user_tuner_preferences: [
      {
        id: "tuner_preferences",
        calibration_a4: 440,
        tolerance_cents: 5,
        auto_advance: 1,
        vibrate_when_in_tune: 1,
        keep_screen_awake: 1,
        show_frequency: 0,
        noise_filter_level: "medium",
        last_mode: "guided",
        updated_at: "2026-07-12T10:15:00.000Z",
      },
    ],
    user_audio_preferences: [
      {
        id: "audio_preferences",
        reference_volume: 0.7,
        metronome_volume: 0.5,
        first_beat_accent: 1,
        spoken_count_in: 0,
        haptics_enabled: 1,
        confirmation_sounds_enabled: 1,
        updated_at: "2026-07-12T10:15:00.000Z",
      },
    ],
    user_stage_preferences: [
      {
        id: "stage_preferences",
        keep_screen_awake: 1,
        auto_hide_controls: 0,
        tap_to_pause: 1,
        default_scroll_speed: 1.25,
        default_font_scale: 1.1,
        preferred_orientation: "portrait",
        force_high_contrast: 0,
        lock_controls_on_start: 0,
        updated_at: "2026-07-12T10:15:00.000Z",
      },
    ],
    user_metronome_preferences: [
      {
        id: "metronome_preferences",
        last_bpm: 72,
        time_signature_numerator: 4,
        time_signature_denominator: 4,
        accent_first_beat: 1,
        count_in_bars: 2,
        visual_pulse_enabled: 1,
        updated_at: "2026-07-12T10:15:00.000Z",
      },
    ],
    user_tunings: [
      {
        id: "user-tuning-1",
        name: "Cebolão em Ré",
        short_name: "Cebolão",
        description: "Afinação pessoal",
        origin_label: "Domínio do usuário",
        open_chord_text: "Ré",
        created_at: "2026-07-12T09:00:00.000Z",
        updated_at: "2026-07-12T10:00:00.000Z",
        deleted_at: null,
      },
    ],
    user_tuning_courses: [
      {
        id: "user-tuning-course-1",
        tuning_id: "user-tuning-1",
        course_number: 1,
        pair_type: "unison",
        label: "Primeira ordem",
        sort_order: 1,
      },
    ],
    user_tuning_strings: [
      {
        id: "user-tuning-string-1",
        course_id: "user-tuning-course-1",
        tuning_id: "user-tuning-1",
        course_number: 1,
        string_in_course: 1,
        physical_string_number: 1,
        pitch_class: 2,
        octave: 4,
        midi_note: 62,
        reference_frequency_440: 440,
        gauge_hint: null,
        material_hint: null,
        display_order: 1,
      },
    ],
    user_songs: [
      {
        id: "user-song-1",
        title: "Meu Canto",
        normalized_title: "meu canto",
        artist: "Eu",
        normalized_artist: "eu",
        composer: "Eu",
        copyright_confirmation: "own_work",
        original_key_pitch_class: 2,
        original_key_mode: "major",
        tuning_origin: "user",
        tuning_id: "user-tuning-1",
        rhythm_id: null,
        custom_rhythm_name: null,
        bpm: 88,
        time_signature_numerator: 4,
        time_signature_denominator: 4,
        capo_fret: 0,
        difficulty: "easy",
        document_format_version: 1,
        document_json: documentJson,
        search_text: "meu canto eu",
        created_at: "2026-07-12T10:01:00.000Z",
        updated_at: "2026-07-12T10:02:00.000Z",
        deleted_at: null,
      },
    ],
    user_song_versions: [
      {
        id: "user-song-version-1",
        song_id: "user-song-1",
        version_number: 1,
        snapshot_json: documentJson,
        change_reason: "manual_save",
        created_at: "2026-07-12T10:02:00.000Z",
      },
    ],
    user_song_notes: [
      {
        id: "user-song-note-1",
        song_origin: "user",
        song_id: "user-song-1",
        note: "Toque suave",
        created_at: "2026-07-12T10:03:00.000Z",
        updated_at: "2026-07-12T10:03:00.000Z",
      },
    ],
    user_song_chord_index: [
      {
        song_id: "user-song-1",
        root_pitch_class: 2,
        quality_id: "major",
        bass_pitch_class: null,
        first_occurrence_order: 0,
        occurrence_count: 3,
      },
    ],
    user_chord_shapes: [
      {
        id: "user-shape-1",
        chord_root_pitch_class: 2,
        chord_quality_id: "major",
        bass_pitch_class: null,
        tuning_origin: "user",
        tuning_id: "user-tuning-1",
        name: "D",
        difficulty: "easy",
        notes: "Forma simples",
        created_at: "2026-07-12T10:04:00.000Z",
        updated_at: "2026-07-12T10:04:00.000Z",
        deleted_at: null,
      },
    ],
    user_chord_shape_positions: [
      {
        id: "user-shape-position-1",
        shape_id: "user-shape-1",
        tuning_string_id: "user-tuning-string-1",
        physical_string_number: 1,
        course_number: 1,
        string_in_course: 1,
        fret: 2,
        finger: "1",
        is_root: 1,
        resulting_pitch_class: 4,
        resulting_octave: 4,
        interval_semitones: 2,
        interval_label: "M2",
      },
    ],
    user_chord_shape_barres: [
      {
        id: "user-shape-barre-1",
        shape_id: "user-shape-1",
        fret: 2,
        from_physical_string: 1,
        to_physical_string: 2,
        finger: "1",
        sort_order: 1,
      },
    ],
    user_favorites: [
      {
        id: "user-favorite-1",
        entity_type: "song",
        entity_origin: "user",
        entity_id: "user-song-1",
        created_at: "2026-07-12T10:05:00.000Z",
      },
    ],
    user_recent_items: [
      {
        id: "user-recent-1",
        entity_type: "song",
        entity_origin: "user",
        entity_id: "user-song-1",
        opened_at: "2026-07-12T10:06:00.000Z",
        open_count: 2,
        context_json: JSON.stringify({ position: 16 }),
      },
    ],
    user_practice_sessions: [
      {
        id: "user-practice-1",
        practice_type: "song",
        entity_origin: "user",
        entity_id: "user-song-1",
        tuning_origin: "user",
        tuning_id: "user-tuning-1",
        rhythm_id: null,
        bpm_start: 60,
        bpm_end: 72,
        duration_seconds: 180,
        started_at: "2026-07-12T10:07:00.000Z",
        completed_at: "2026-07-12T10:10:00.000Z",
        status: "completed",
      },
    ],
    user_tuning_sessions: [
      {
        id: "user-session-1",
        tuning_origin: "user",
        tuning_id: "user-tuning-1",
        mode: "guided",
        calibration_a4: 440,
        tolerance_cents: 5,
        started_at: "2026-07-12T10:08:00.000Z",
        completed_at: "2026-07-12T10:09:00.000Z",
        status: "completed",
        completed_course_count: 1,
        total_course_count: 1,
      },
    ],
    user_tuning_session_courses: [
      {
        id: "user-session-course-1",
        session_id: "user-session-1",
        course_number: 1,
        target_midi_note_primary: 62,
        target_midi_note_secondary: null,
        final_cents_primary: 0,
        final_cents_secondary: null,
        result: "in_tune",
        confirmed_at: "2026-07-12T10:09:00.000Z",
      },
    ],
    user_song_preferences: [
      {
        id: "user-song-preference-1",
        song_origin: "user",
        song_id: "user-song-1",
        remembered_key_pitch_class: 2,
        remembered_key_mode: "major",
        remember_key: 1,
        last_scroll_position: 120,
        stage_font_scale: 1.1,
        stage_scroll_speed: 1.25,
        preferred_arrangement_id: "arrangement-1",
        preferred_shape_overrides_json: JSON.stringify({
          shape: "user-shape-1",
        }),
        last_opened_at: "2026-07-12T10:06:00.000Z",
        updated_at: "2026-07-12T10:06:00.000Z",
      },
    ],
  };
}

export function createBackupDatabase(
  initialTables: Partial<Record<string, BackupTestRow[]>> = {},
  options: { readonly failOnInsertTable?: string | null } = {},
): BackupTestDatabase {
  let state = createState(initialTables, options.failOnInsertTable);

  const database: BackupTestDatabase = {
    get state() {
      return state;
    },
    execAsync(): Promise<void> {
      return Promise.resolve();
    },
    runAsync(source: string, ...params: readonly unknown[]): Promise<{ readonly lastInsertRowId: number; readonly changes: number }> {
      const normalized = normalizeSql(source);
      const deleteMatch = normalized.match(/^delete from ([a-z0-9_]+)$/i);
      if (deleteMatch) {
        const table = deleteMatch[1] ?? "";
        state.tables[table] = [];
        return Promise.resolve({ lastInsertRowId: 0, changes: 1 });
      }

      const insert = parseInsert(source);
      if (insert) {
        const row: Record<string, unknown> = {};
        insert.columns.forEach((column, index) => {
          row[column] = params[index];
        });

        const current = state.tables[insert.table] ?? [];
        const uniqueKey = row["id"] !== undefined ? toComparableText(row["id"]) : null;

        if (uniqueKey !== null) {
          state.tables[insert.table] = [
            ...current.filter((entry) => toComparableText((entry as Record<string, unknown>)["id"]) !== uniqueKey),
            row,
          ];
        } else {
          state.tables[insert.table] = [...current, row];
        }

        if (state.failOnInsertTable === insert.table) {
          throw new Error(`Simulated failure while writing ${insert.table}.`);
        }

        return Promise.resolve({ lastInsertRowId: current.length + 1, changes: 1 });
      }

      return Promise.resolve({ lastInsertRowId: 0, changes: 1 });
    },
    getFirstAsync<T = Readonly<Record<string, unknown>>>(source: string, ..._params: readonly unknown[]): Promise<T | null> {
      const normalized = normalizeSql(source);
      const table = getTableName(source);

      if (table && normalized.includes("limit 1")) {
        const rows = state.tables[table] ?? [];
        return Promise.resolve((rows[0] ? structuredClone(rows[0]) : null) as T | null);
      }

      return Promise.resolve(null);
    },
    getAllAsync<T = Readonly<Record<string, unknown>>>(source: string, ..._params: readonly unknown[]): Promise<readonly T[]> {
      const table = getTableName(source);
      if (table) {
        const rows = state.tables[table] ?? [];
        return Promise.resolve(rows.map((row) => structuredClone(row)) as unknown as readonly T[]);
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
