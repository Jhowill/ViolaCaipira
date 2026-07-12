import type { SQLiteDatabaseLike } from "@/types/database";
import type {
  ContentOrigin,
  DifficultyLevel,
  PitchClass,
  SongDocument,
  SongMode,
  TimeSignatureDenominator,
} from "@/types/music";
import { buildValidSongDocument, buildValidTuning } from "@/domain/music/__tests__/fixtures";
import { normalizeSearchText } from "@/database/queries";

const TIMESTAMP = "2026-07-12T12:00:00.000Z";

interface CatalogSongRow {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly normalized_title: string;
  readonly artist: string | null;
  readonly normalized_artist: string | null;
  readonly composer: string | null;
  readonly rights_holder: string | null;
  readonly license_id: string;
  readonly source_id: string | null;
  readonly copyright_status: "public_domain" | "original" | "authorized" | "licensed";
  readonly original_key_pitch_class: PitchClass | null;
  readonly original_key_mode: SongMode;
  readonly default_rhythm_id: string | null;
  readonly default_bpm: number | null;
  readonly time_signature_numerator: number | null;
  readonly time_signature_denominator: TimeSignatureDenominator | null;
  readonly difficulty: DifficultyLevel;
  readonly document_format_version: number;
  readonly document_json: string;
  readonly search_text: string;
  readonly is_featured: number;
  readonly sort_order: number;
  readonly verification_status: "verified" | "deprecated";
  readonly reviewer_id: string | null;
  readonly reviewed_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

interface CatalogSongArrangementRow {
  readonly id: string;
  readonly song_id: string;
  readonly tuning_id: string;
  readonly name: string;
  readonly arrangement_status: "verified" | "calculated" | "symbols_only" | "unavailable";
  readonly key_pitch_class: PitchClass;
  readonly key_mode: SongMode;
  readonly capo_fret: number;
  readonly recommended_bpm: number | null;
  readonly notes: string | null;
  readonly reviewer_id: string | null;
  readonly source_id: string | null;
  readonly calculation_version: string | null;
  readonly is_recommended: number;
  readonly sort_order: number;
  readonly created_at: string;
  readonly updated_at: string;
}

interface CatalogSongArrangementChordRow {
  readonly id: string;
  readonly arrangement_id: string;
  readonly chord_id: string;
  readonly preferred_shape_id: string | null;
  readonly fallback_shape_id: string | null;
  readonly status: "verified" | "calculated" | "symbol_only" | "missing";
  readonly notes: string | null;
}

interface CatalogSongChordIndexRow {
  readonly song_id: string;
  readonly chord_id: string;
  readonly first_occurrence_order: number;
  readonly occurrence_count: number;
}

interface CatalogChordRow {
  readonly id: string;
  readonly root_pitch_class: PitchClass;
  readonly quality_id: string;
  readonly bass_pitch_class: PitchClass | null;
  readonly canonical_symbol: string;
  readonly normalized_search_text: string;
  readonly created_at: string;
}

interface CatalogSongRhythmRow {
  readonly song_id: string;
  readonly rhythm_id: string;
  readonly pattern_id: string | null;
  readonly relevance: "primary" | "alternative" | "practice";
  readonly recommended_bpm: number | null;
  readonly notes: string | null;
}

interface CatalogRhythmRow {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly short_description: string;
  readonly description: string | null;
  readonly origin_region: string | null;
  readonly time_signature_numerator: number;
  readonly time_signature_denominator: TimeSignatureDenominator;
  readonly default_bpm: number;
  readonly min_practice_bpm: number;
  readonly max_recommended_bpm: number;
  readonly pulses_per_quarter: number;
  readonly difficulty: DifficultyLevel;
  readonly verification_status: "verified" | "deprecated";
  readonly reviewer_id: string | null;
  readonly source_id: string | null;
  readonly is_featured: number;
  readonly sort_order: number;
  readonly created_at: string;
  readonly updated_at: string;
}

interface CatalogRhythmPatternRow {
  readonly id: string;
  readonly rhythm_id: string;
  readonly name: string;
  readonly level: DifficultyLevel;
  readonly hand_mode: "neutral" | "right_hand_reference";
  readonly total_ticks: number;
  readonly bars: number;
  readonly is_primary: number;
  readonly sort_order: number;
  readonly notes: string | null;
}

interface CatalogRhythmStepRow {
  readonly id: string;
  readonly pattern_id: string;
  readonly step_order: number;
  readonly position_ticks: number;
  readonly duration_ticks: number;
  readonly beat_label: string | null;
  readonly direction: "down" | "up" | "none";
  readonly action: "strike" | "mute" | "percussion" | "rest" | "brush" | "pluck";
  readonly hand_part: "thumb" | "index" | "middle" | "ring" | "multiple" | "unspecified";
  readonly string_range_from: number | null;
  readonly string_range_to: number | null;
  readonly intensity: number;
  readonly is_accent: number;
  readonly label: string | null;
}

interface CatalogRhythmAudioRow {
  readonly id: string;
  readonly rhythm_id: string;
  readonly pattern_id: string | null;
  readonly asset_id: string;
  readonly role: "slow" | "normal" | "metronome" | "count_in" | "demonstration";
  readonly bpm: number | null;
  readonly sort_order: number;
}

interface CatalogExerciseRow {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly exercise_type:
    | "single_chord"
    | "chord_change"
    | "progression"
    | "rhythm"
    | "scale"
    | "coordination"
    | "barre";
  readonly tuning_id: string | null;
  readonly rhythm_id: string | null;
  readonly pattern_id: string | null;
  readonly difficulty: DifficultyLevel;
  readonly default_bpm: number | null;
  readonly min_bpm: number | null;
  readonly max_bpm: number | null;
  readonly duration_seconds: number | null;
  readonly verification_status: "verified" | "deprecated";
  readonly sort_order: number;
  readonly created_at: string;
  readonly updated_at: string;
}

interface UserSongRow {
  readonly id: string;
  readonly title: string;
  readonly normalized_title: string;
  readonly artist: string | null;
  readonly normalized_artist: string | null;
  readonly composer: string | null;
  readonly copyright_confirmation: "own_work" | "authorized" | "personal_use_confirmed" | "unknown";
  readonly original_key_pitch_class: PitchClass | null;
  readonly original_key_mode: SongMode;
  readonly tuning_origin: ContentOrigin;
  readonly tuning_id: string;
  readonly rhythm_id: string | null;
  readonly custom_rhythm_name: string | null;
  readonly bpm: number | null;
  readonly time_signature_numerator: number | null;
  readonly time_signature_denominator: TimeSignatureDenominator | null;
  readonly capo_fret: number;
  readonly difficulty: DifficultyLevel | null;
  readonly document_format_version: number;
  readonly document_json: string;
  readonly search_text: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
}

interface UserSongVersionRow {
  readonly id: string;
  readonly song_id: string;
  readonly version_number: number;
  readonly snapshot_json: string;
  readonly change_reason: "manual_save" | "autosave_recovery" | "import" | "restore" | "before_delete";
  readonly created_at: string;
}

interface UserSongChordIndexRow {
  readonly song_id: string;
  readonly root_pitch_class: PitchClass;
  readonly quality_id: string;
  readonly bass_pitch_class: PitchClass | null;
  readonly first_occurrence_order: number;
  readonly occurrence_count: number;
}

interface UserSongDraftRow {
  readonly id: string;
  readonly song_id: string | null;
  readonly draft_type: "new" | "edit" | "import";
  readonly title: string | null;
  readonly form_state_json: string;
  readonly document_format_version: number;
  readonly document_json: string;
  readonly last_saved_at: string;
  readonly created_at: string;
  readonly recovery_status: "active" | "recovered" | "discarded";
}

interface UserSongPreferenceRow {
  readonly id: string;
  readonly song_origin: ContentOrigin;
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

interface FavoriteRow {
  readonly id: string;
  readonly entity_type: "song" | "rhythm";
  readonly entity_origin: ContentOrigin;
  readonly entity_id: string;
  readonly created_at: string;
}

export interface ContentRepositoryFixtureState {
  readonly catalogSongs: CatalogSongRow[];
  readonly catalogSongArrangements: CatalogSongArrangementRow[];
  readonly catalogSongArrangementChords: CatalogSongArrangementChordRow[];
  readonly catalogSongChordIndex: CatalogSongChordIndexRow[];
  readonly catalogChords: CatalogChordRow[];
  readonly catalogSongRhythms: CatalogSongRhythmRow[];
  readonly catalogRhythms: CatalogRhythmRow[];
  readonly catalogRhythmPatterns: CatalogRhythmPatternRow[];
  readonly catalogRhythmSteps: CatalogRhythmStepRow[];
  readonly catalogRhythmAudio: CatalogRhythmAudioRow[];
  readonly catalogExercises: CatalogExerciseRow[];
  readonly userSongs: UserSongRow[];
  readonly userSongVersions: UserSongVersionRow[];
  readonly userSongChordIndex: UserSongChordIndexRow[];
  readonly userSongDrafts: UserSongDraftRow[];
  readonly userSongPreferences: UserSongPreferenceRow[];
  readonly userFavorites: FavoriteRow[];
}

export interface ContentRepositoryFixtureDatabase extends SQLiteDatabaseLike {
  readonly state: ContentRepositoryFixtureState;
}

type MutableContentRepositoryFixtureState = {
  -readonly [K in keyof ContentRepositoryFixtureState]: ContentRepositoryFixtureState[K];
};

const DEFAULT_DOCUMENT: SongDocument = buildValidSongDocument();

function normalizeSql(source: string): string {
  return source.replace(/\s+/g, " ").trim().toLowerCase();
}

function cloneState(state: ContentRepositoryFixtureState): ContentRepositoryFixtureState {
  return structuredClone(state);
}

function buildUserTuning() {
  const tuning = buildValidTuning();
  return {
    ...tuning,
    id: "user-tuning-personal",
    origin: "user" as const,
    name: "Afinação pessoal",
    shortName: "Pessoal",
    aliases: ["Pessoal"],
    verificationStatus: "user_created" as const,
    tensionWarning: null,
  };
}

function toDbSearchText(...parts: readonly (string | null | undefined)[]): string {
  return normalizeSearchText(
    parts
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
      .join(" "),
  );
}

function coerceText(value: unknown): string {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return `${value}`;
  }

  throw new TypeError("Expected a text value.");
}

function coerceNullableText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return `${value}`;
  }

  return null;
}

function buildInitialState(): ContentRepositoryFixtureState {
  const catalogTuning = buildValidTuning();
  const userTuning = buildUserTuning();

  return {
    catalogSongs: [
      {
        id: "catalog-song-1",
        slug: "meu-canto",
        title: "Meu Canto",
        normalized_title: "meu canto",
        artist: "Zé Viola",
        normalized_artist: "ze viola",
        composer: "Compositor Padrão",
        rights_holder: null,
        license_id: "license-1",
        source_id: null,
        copyright_status: "authorized",
        original_key_pitch_class: 0,
        original_key_mode: "major",
        default_rhythm_id: "rhythm-cururu",
        default_bpm: 96,
        time_signature_numerator: 4,
        time_signature_denominator: 4,
        difficulty: "intermediate",
        document_format_version: 1,
        document_json: JSON.stringify(DEFAULT_DOCUMENT),
        search_text: toDbSearchText("Meu Canto", "Zé Viola", "Compositor Padrão", "cururu", "baião"),
        is_featured: 1,
        sort_order: 1,
        verification_status: "verified",
        reviewer_id: null,
        reviewed_at: TIMESTAMP,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
      },
    ],
    catalogSongArrangements: [
      {
        id: "catalog-song-arr-1",
        song_id: "catalog-song-1",
        tuning_id: catalogTuning.id,
        name: "Padrão",
        arrangement_status: "verified",
        key_pitch_class: 0,
        key_mode: "major",
        capo_fret: 0,
        recommended_bpm: 96,
        notes: null,
        reviewer_id: null,
        source_id: null,
        calculation_version: "1",
        is_recommended: 1,
        sort_order: 1,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
      },
    ],
    catalogSongArrangementChords: [
      {
        id: "catalog-song-arr-chord-1",
        arrangement_id: "catalog-song-arr-1",
        chord_id: "catalog-chord-c",
        preferred_shape_id: "catalog-shape-c",
        fallback_shape_id: null,
        status: "verified",
        notes: null,
      },
    ],
    catalogSongChordIndex: [
      {
        song_id: "catalog-song-1",
        chord_id: "catalog-chord-c",
        first_occurrence_order: 0,
        occurrence_count: 3,
      },
    ],
    catalogChords: [
      {
        id: "catalog-chord-c",
        root_pitch_class: 0,
        quality_id: "major",
        bass_pitch_class: null,
        canonical_symbol: "C",
        normalized_search_text: "c",
        created_at: TIMESTAMP,
      },
    ],
    catalogSongRhythms: [
      {
        song_id: "catalog-song-1",
        rhythm_id: "rhythm-cururu",
        pattern_id: "rhythm-cururu-pattern-1",
        relevance: "primary",
        recommended_bpm: 96,
        notes: null,
      },
    ],
    catalogRhythms: [
      {
        id: "rhythm-cururu",
        slug: "cururu-basico",
        name: "Cururu básico",
        short_description: "Balanço tradicional",
        description: "Ritmo para acompanhar cantos.",
        origin_region: "SP",
        time_signature_numerator: 4,
        time_signature_denominator: 4,
        default_bpm: 96,
        min_practice_bpm: 72,
        max_recommended_bpm: 112,
        pulses_per_quarter: 120,
        difficulty: "beginner",
        verification_status: "verified",
        reviewer_id: null,
        source_id: null,
        is_featured: 1,
        sort_order: 1,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
      },
    ],
    catalogRhythmPatterns: [
      {
        id: "rhythm-cururu-pattern-1",
        rhythm_id: "rhythm-cururu",
        name: "Padrão principal",
        level: "beginner",
        hand_mode: "neutral",
        total_ticks: 480,
        bars: 1,
        is_primary: 1,
        sort_order: 1,
        notes: null,
      },
    ],
    catalogRhythmSteps: [
      {
        id: "rhythm-cururu-step-1",
        pattern_id: "rhythm-cururu-pattern-1",
        step_order: 1,
        position_ticks: 0,
        duration_ticks: 120,
        beat_label: "1",
        direction: "down",
        action: "strike",
        hand_part: "thumb",
        string_range_from: 1,
        string_range_to: 10,
        intensity: 90,
        is_accent: 1,
        label: "Batida forte",
      },
      {
        id: "rhythm-cururu-step-2",
        pattern_id: "rhythm-cururu-pattern-1",
        step_order: 2,
        position_ticks: 240,
        duration_ticks: 120,
        beat_label: "3",
        direction: "up",
        action: "brush",
        hand_part: "index",
        string_range_from: 1,
        string_range_to: 10,
        intensity: 70,
        is_accent: 0,
        label: "Resposta",
      },
    ],
    catalogRhythmAudio: [
      {
        id: "rhythm-cururu-audio-1",
        rhythm_id: "rhythm-cururu",
        pattern_id: "rhythm-cururu-pattern-1",
        asset_id: "asset-rhythm-cururu",
        role: "normal",
        bpm: 96,
        sort_order: 1,
      },
    ],
    catalogExercises: [
      {
        id: "exercise-cururu-1",
        title: "Cururu em 4 tempos",
        description: "Prática base do padrão.",
        exercise_type: "rhythm",
        tuning_id: catalogTuning.id,
        rhythm_id: "rhythm-cururu",
        pattern_id: "rhythm-cururu-pattern-1",
        difficulty: "beginner",
        default_bpm: 96,
        min_bpm: 72,
        max_bpm: 112,
        duration_seconds: 120,
        verification_status: "verified",
        sort_order: 1,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
      },
    ],
    userSongs: [
      {
        id: "user-song-1",
        title: "Meu Canto Caseiro",
        normalized_title: "meu canto caseiro",
        artist: "Eu",
        normalized_artist: "eu",
        composer: null,
        copyright_confirmation: "own_work",
        original_key_pitch_class: 0,
        original_key_mode: "major",
        tuning_origin: "user",
        tuning_id: userTuning.id,
        rhythm_id: null,
        custom_rhythm_name: "Toada pessoal",
        bpm: 80,
        time_signature_numerator: 4,
        time_signature_denominator: 4,
        capo_fret: 0,
        difficulty: "easy",
        document_format_version: 1,
        document_json: JSON.stringify(DEFAULT_DOCUMENT),
        search_text: toDbSearchText("Meu Canto Caseiro", "Eu", "Toada pessoal", "c"),
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
        deleted_at: null,
      },
    ],
    userSongVersions: [],
    userSongChordIndex: [
      {
        song_id: "user-song-1",
        root_pitch_class: 0,
        quality_id: "major",
        bass_pitch_class: null,
        first_occurrence_order: 0,
        occurrence_count: 3,
      },
    ],
    userSongDrafts: [
      {
        id: "draft-1",
        song_id: "user-song-1",
        draft_type: "edit",
        title: "Rascunho salvo",
        form_state_json: JSON.stringify({ step: 1 }),
        document_format_version: 1,
        document_json: JSON.stringify(DEFAULT_DOCUMENT),
        last_saved_at: TIMESTAMP,
        created_at: TIMESTAMP,
        recovery_status: "active",
      },
    ],
    userSongPreferences: [
      {
        id: "song-preference-user-song-1",
        song_origin: "user",
        song_id: "user-song-1",
        remembered_key_pitch_class: 2,
        remembered_key_mode: "major",
        remember_key: 1,
        last_scroll_position: 12,
        stage_font_scale: 1.1,
        stage_scroll_speed: 1.2,
        preferred_arrangement_id: null,
        preferred_shape_overrides_json: JSON.stringify({
          "2:major:-1": {
            origin: "catalog",
            shapeId: "catalog-shape-c",
          },
        }),
        last_opened_at: TIMESTAMP,
        updated_at: TIMESTAMP,
      },
      {
        id: "song-preference-catalog-song-1",
        song_origin: "catalog",
        song_id: "catalog-song-1",
        remembered_key_pitch_class: null,
        remembered_key_mode: null,
        remember_key: 0,
        last_scroll_position: 0,
        stage_font_scale: null,
        stage_scroll_speed: null,
        preferred_arrangement_id: "catalog-song-arr-1",
        preferred_shape_overrides_json: null,
        last_opened_at: TIMESTAMP,
        updated_at: TIMESTAMP,
      },
    ],
    userFavorites: [
      {
        id: "favorite-song-1",
        entity_type: "song",
        entity_origin: "catalog",
        entity_id: "catalog-song-1",
        created_at: TIMESTAMP,
      },
      {
        id: "favorite-rhythm-1",
        entity_type: "rhythm",
        entity_origin: "catalog",
        entity_id: "rhythm-cururu",
        created_at: TIMESTAMP,
      },
    ],
  };
}

function normalizeSongSearchTerms(params: readonly unknown[]): readonly string[] {
  const terms = params
    .filter((value): value is string => typeof value === "string" && value.includes("%"))
    .map((value) => normalizeSearchText(value.replace(/[\\%]/g, "")))
    .filter((value) => value.length > 0);

  return [...new Set(terms)];
}

function rowMatchesTerms(valueParts: readonly (string | null | undefined)[], terms: readonly string[]): boolean {
  if (terms.length === 0) {
    return true;
  }

  const haystack = normalizeSearchText(
    valueParts
      .filter((part): part is string => typeof part === "string" && part.length > 0)
      .join(" "),
  );

  return terms.every((term) => haystack.includes(term));
}

function songOrder(left: CatalogSongRow | UserSongRow, right: CatalogSongRow | UserSongRow): number {
  if ("is_featured" in left && "is_featured" in right) {
    if (left.is_featured !== right.is_featured) {
      return right.is_featured - left.is_featured;
    }

    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }
  } else if ("updated_at" in left && "updated_at" in right) {
    if (left.updated_at !== right.updated_at) {
      return right.updated_at.localeCompare(left.updated_at);
    }
  }

  return normalizeSearchText(left.title).localeCompare(normalizeSearchText(right.title)) || left.id.localeCompare(right.id);
}

function rhythmOrder(left: CatalogRhythmRow, right: CatalogRhythmRow): number {
  if (left.is_featured !== right.is_featured) {
    return right.is_featured - left.is_featured;
  }

  if (left.sort_order !== right.sort_order) {
    return left.sort_order - right.sort_order;
  }

  return left.name.localeCompare(right.name) || left.id.localeCompare(right.id);
}

function filterCatalogSongs(state: ContentRepositoryFixtureState, sql: string, params: readonly unknown[]): readonly CatalogSongRow[] {
  const rows = [...state.catalogSongs];
  let cursor = 0;

  if (sql.includes(".difficulty = ?")) {
    const difficulty = params[cursor++] as DifficultyLevel;
    rows.splice(0, rows.length, ...rows.filter((row) => row.difficulty === difficulty));
  }

  if (sql.includes("arrangements.tuning_id = ?")) {
    const tuningId = params[cursor++] as string;
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) => state.catalogSongArrangements.some((arrangement) => arrangement.song_id === row.id && arrangement.tuning_id === tuningId)),
    );
  }

  if (sql.includes("arrangements.key_pitch_class = ?")) {
    const pitchClass = params[cursor++] as PitchClass;
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) => state.catalogSongArrangements.some((arrangement) => arrangement.song_id === row.id && arrangement.key_pitch_class === pitchClass)),
    );
  }

  if (sql.includes("arrangements.key_mode = ?")) {
    const mode = params[cursor++] as SongMode;
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) => state.catalogSongArrangements.some((arrangement) => arrangement.song_id === row.id && arrangement.key_mode === mode)),
    );
  }

  if (sql.includes("favorites.entity_origin = 'catalog'")) {
    const shouldMatchFavorite = !sql.includes("NOT EXISTS");
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) => {
        const match = state.userFavorites.some(
          (favorite) =>
            favorite.entity_type === "song" &&
            favorite.entity_origin === "catalog" &&
            favorite.entity_id === row.id,
        );

        return shouldMatchFavorite ? match : !match;
      }),
    );
  }

  const terms = normalizeSongSearchTerms(params);
  if (terms.length > 0) {
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) =>
        rowMatchesTerms([row.title, row.artist, row.composer, row.search_text, row.slug], terms),
      ),
    );
  }

  rows.sort(songOrder);

  const limit = Number(params[params.length - 2] ?? rows.length);
  const offset = Number(params[params.length - 1] ?? 0);
  return rows.slice(offset, offset + limit);
}

function filterUserSongs(state: ContentRepositoryFixtureState, sql: string, params: readonly unknown[]): readonly UserSongRow[] {
  const rows = [...state.userSongs];
  let cursor = 0;

  if (sql.includes(".difficulty = ?")) {
    const difficulty = params[cursor++] as DifficultyLevel;
    rows.splice(0, rows.length, ...rows.filter((row) => row.difficulty === difficulty));
  }

  if (sql.includes("tuning_origin = ? and user_songs.tuning_id = ?")) {
    const tuningOrigin = params[cursor++] as ContentOrigin;
    const tuningId = params[cursor++] as string;
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) => row.tuning_origin === tuningOrigin && row.tuning_id === tuningId),
    );
  }

  if (sql.includes("original_key_pitch_class = ?")) {
    const pitchClass = params[cursor++] as PitchClass;
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) => row.original_key_pitch_class === pitchClass),
    );
  }

  if (sql.includes("original_key_mode = ?")) {
    const mode = params[cursor++] as SongMode;
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) => row.original_key_mode === mode),
    );
  }

  if (sql.includes("deleted_at is null")) {
    rows.splice(0, rows.length, ...rows.filter((row) => row.deleted_at === null));
  }

  if (sql.includes("favorites.entity_origin = 'user'")) {
    const shouldMatchFavorite = !sql.includes("NOT EXISTS");
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) => {
        const match = state.userFavorites.some(
          (favorite) =>
            favorite.entity_type === "song" &&
            favorite.entity_origin === "user" &&
            favorite.entity_id === row.id,
        );

        return shouldMatchFavorite ? match : !match;
      }),
    );
  }

  const terms = normalizeSongSearchTerms(params);
  if (terms.length > 0) {
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) =>
        rowMatchesTerms(
          [row.title, row.artist, row.composer, row.search_text, row.custom_rhythm_name],
          terms,
        ),
      ),
    );
  }

  rows.sort(songOrder);

  const limit = Number(params[params.length - 2] ?? rows.length);
  const offset = Number(params[params.length - 1] ?? 0);
  return rows.slice(offset, offset + limit);
}

function filterRhythms(state: ContentRepositoryFixtureState, sql: string, params: readonly unknown[]): readonly CatalogRhythmRow[] {
  const rows = [...state.catalogRhythms];
  let cursor = 0;

  if (sql.includes(".difficulty = ?")) {
    const difficulty = params[cursor++] as DifficultyLevel;
    rows.splice(0, rows.length, ...rows.filter((row) => row.difficulty === difficulty));
  }

  if (sql.includes(".time_signature_numerator = ?")) {
    const numerator = Number(params[cursor++] ?? 0);
    rows.splice(0, rows.length, ...rows.filter((row) => row.time_signature_numerator === numerator));
  }

  if (sql.includes(".time_signature_denominator = ?")) {
    const denominator = Number(params[cursor++] ?? 0) as TimeSignatureDenominator;
    rows.splice(0, rows.length, ...rows.filter((row) => row.time_signature_denominator === denominator));
  }

  if (sql.includes("favorites.entity_origin = 'catalog'")) {
    const shouldMatchFavorite = !sql.includes("NOT EXISTS");
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) => {
        const match = state.userFavorites.some(
          (favorite) =>
            favorite.entity_type === "rhythm" &&
            favorite.entity_origin === "catalog" &&
            favorite.entity_id === row.id,
        );

        return shouldMatchFavorite ? match : !match;
      }),
    );
  }

  const terms = normalizeSongSearchTerms(params);
  if (terms.length > 0) {
    rows.splice(
      0,
      rows.length,
      ...rows.filter((row) =>
        rowMatchesTerms(
          [row.name, row.short_description, row.description, row.origin_region, row.slug],
          terms,
        ),
      ),
    );
  }

  rows.sort(rhythmOrder);

  const limit = Number(params[params.length - 2] ?? rows.length);
  const offset = Number(params[params.length - 1] ?? 0);
  return rows.slice(offset, offset + limit);
}

function selectByIds<T extends { readonly id: string }>(rows: readonly T[], ids: readonly string[]): T[] {
  const byId = new Map(rows.map((row) => [row.id, row] as const));
  return ids.map((id) => byId.get(id)).filter((row): row is T => row !== undefined);
}

function sortCatalogSongArrangements(rows: readonly CatalogSongArrangementRow[]): CatalogSongArrangementRow[] {
  return [...rows].sort((left, right) => {
    if (left.song_id !== right.song_id) {
      return left.song_id.localeCompare(right.song_id);
    }

    if (left.is_recommended !== right.is_recommended) {
      return right.is_recommended - left.is_recommended;
    }

    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }

    if (left.updated_at !== right.updated_at) {
      return right.updated_at.localeCompare(left.updated_at);
    }

    return left.id.localeCompare(right.id);
  });
}

function sortCatalogSongArrangementChords(
  rows: readonly CatalogSongArrangementChordRow[],
): CatalogSongArrangementChordRow[] {
  return [...rows].sort((left, right) => {
    if (left.arrangement_id !== right.arrangement_id) {
      return left.arrangement_id.localeCompare(right.arrangement_id);
    }

    return left.id.localeCompare(right.id);
  });
}

function sortCatalogRhythmPatterns(rows: readonly CatalogRhythmPatternRow[]): CatalogRhythmPatternRow[] {
  return [...rows].sort((left, right) => {
    if (left.rhythm_id !== right.rhythm_id) {
      return left.rhythm_id.localeCompare(right.rhythm_id);
    }

    if (left.is_primary !== right.is_primary) {
      return right.is_primary - left.is_primary;
    }

    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }

    if (left.name !== right.name) {
      return left.name.localeCompare(right.name);
    }

    return left.id.localeCompare(right.id);
  });
}

function sortCatalogRhythmSteps(rows: readonly CatalogRhythmStepRow[]): CatalogRhythmStepRow[] {
  return [...rows].sort((left, right) => {
    if (left.pattern_id !== right.pattern_id) {
      return left.pattern_id.localeCompare(right.pattern_id);
    }

    if (left.step_order !== right.step_order) {
      return left.step_order - right.step_order;
    }

    return left.id.localeCompare(right.id);
  });
}

function sortCatalogRhythmAudio(rows: readonly CatalogRhythmAudioRow[]): CatalogRhythmAudioRow[] {
  return [...rows].sort((left, right) => {
    if (left.rhythm_id !== right.rhythm_id) {
      return left.rhythm_id.localeCompare(right.rhythm_id);
    }

    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }

    return left.id.localeCompare(right.id);
  });
}

function sortCatalogExercises(rows: readonly CatalogExerciseRow[]): CatalogExerciseRow[] {
  return [...rows].sort((left, right) => {
    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }

    if (left.title !== right.title) {
      return left.title.localeCompare(right.title);
    }

    return left.id.localeCompare(right.id);
  });
}

function sortUserSongDrafts(rows: readonly UserSongDraftRow[]): UserSongDraftRow[] {
  return [...rows].sort((left, right) => {
    if (left.last_saved_at !== right.last_saved_at) {
      return right.last_saved_at.localeCompare(left.last_saved_at);
    }

    if (left.created_at !== right.created_at) {
      return right.created_at.localeCompare(left.created_at);
    }

    return left.id.localeCompare(right.id);
  });
}

function buildContentState(initialState: Partial<ContentRepositoryFixtureState> = {}): ContentRepositoryFixtureState {
  const base = buildInitialState();

  return {
    catalogSongs: initialState.catalogSongs ? [...initialState.catalogSongs] : [...base.catalogSongs],
    catalogSongArrangements: initialState.catalogSongArrangements ? [...initialState.catalogSongArrangements] : [...base.catalogSongArrangements],
    catalogSongArrangementChords: initialState.catalogSongArrangementChords ? [...initialState.catalogSongArrangementChords] : [...base.catalogSongArrangementChords],
    catalogSongChordIndex: initialState.catalogSongChordIndex ? [...initialState.catalogSongChordIndex] : [...base.catalogSongChordIndex],
    catalogChords: initialState.catalogChords ? [...initialState.catalogChords] : [...base.catalogChords],
    catalogSongRhythms: initialState.catalogSongRhythms ? [...initialState.catalogSongRhythms] : [...base.catalogSongRhythms],
    catalogRhythms: initialState.catalogRhythms ? [...initialState.catalogRhythms] : [...base.catalogRhythms],
    catalogRhythmPatterns: initialState.catalogRhythmPatterns ? [...initialState.catalogRhythmPatterns] : [...base.catalogRhythmPatterns],
    catalogRhythmSteps: initialState.catalogRhythmSteps ? [...initialState.catalogRhythmSteps] : [...base.catalogRhythmSteps],
    catalogRhythmAudio: initialState.catalogRhythmAudio ? [...initialState.catalogRhythmAudio] : [...base.catalogRhythmAudio],
    catalogExercises: initialState.catalogExercises ? [...initialState.catalogExercises] : [...base.catalogExercises],
    userSongs: initialState.userSongs ? [...initialState.userSongs] : [...base.userSongs],
    userSongVersions: initialState.userSongVersions ? [...initialState.userSongVersions] : [...base.userSongVersions],
    userSongChordIndex: initialState.userSongChordIndex ? [...initialState.userSongChordIndex] : [...base.userSongChordIndex],
    userSongDrafts: initialState.userSongDrafts ? [...initialState.userSongDrafts] : [...base.userSongDrafts],
    userSongPreferences: initialState.userSongPreferences ? [...initialState.userSongPreferences] : [...base.userSongPreferences],
    userFavorites: initialState.userFavorites ? [...initialState.userFavorites] : [...base.userFavorites],
  };
}

export function createContentRepositoryFakeDatabase(
  initialState: Partial<ContentRepositoryFixtureState> = {},
): ContentRepositoryFixtureDatabase {
  let state = buildContentState(initialState) as MutableContentRepositoryFixtureState;

  const applyRunStatement = (sql: string, params: readonly unknown[]): void => {
    const normalized = normalizeSql(sql);

    if (normalized.includes("insert into user_songs")) {
      const [id, title, normalizedTitle, artist, normalizedArtist, composer, copyrightConfirmation, originalKeyPitchClass, originalKeyMode, tuningOrigin, tuningId, rhythmId, customRhythmName, bpm, timeSignatureNumerator, timeSignatureDenominator, capoFret, difficulty, documentFormatVersion, documentJson, searchText, createdAt, updatedAt, deletedAt] = params;
      const songId = coerceText(id);
      const existing = state.userSongs.find((row) => row.id === songId);
      const nextRow: UserSongRow = {
        id: songId,
        title: coerceText(title),
        normalized_title: coerceText(normalizedTitle),
        artist: coerceNullableText(artist),
        normalized_artist: coerceNullableText(normalizedArtist),
        composer: coerceNullableText(composer),
        copyright_confirmation: copyrightConfirmation as UserSongRow["copyright_confirmation"],
        original_key_pitch_class: originalKeyPitchClass === null ? null : (Number(originalKeyPitchClass) as PitchClass),
        original_key_mode: originalKeyMode as SongMode,
        tuning_origin: tuningOrigin as ContentOrigin,
        tuning_id: coerceText(tuningId),
        rhythm_id: coerceNullableText(rhythmId),
        custom_rhythm_name: coerceNullableText(customRhythmName),
        bpm: bpm === null ? null : Number(bpm),
        time_signature_numerator: timeSignatureNumerator === null ? null : Number(timeSignatureNumerator),
        time_signature_denominator: timeSignatureDenominator === null ? null : (Number(timeSignatureDenominator) as TimeSignatureDenominator),
        capo_fret: Number(capoFret),
        difficulty: difficulty === null ? null : (difficulty as DifficultyLevel),
        document_format_version: Number(documentFormatVersion),
        document_json: coerceText(documentJson),
        search_text: coerceText(searchText),
        created_at: existing?.created_at ?? coerceText(createdAt),
        updated_at: coerceText(updatedAt),
        deleted_at: coerceNullableText(deletedAt),
      };

      if (existing) {
        state.userSongs = state.userSongs.map((row) => (row.id === nextRow.id ? nextRow : row));
      } else {
        state.userSongs = [...state.userSongs, nextRow];
      }
      return;
    }

    if (normalized.includes("delete from user_song_chord_index where song_id = ?")) {
      const songId = coerceText(params[0]);
      state.userSongChordIndex = state.userSongChordIndex.filter((row) => row.song_id !== songId);
      return;
    }

    if (normalized.includes("insert into user_song_chord_index")) {
      const [songId, rootPitchClass, qualityId, bassPitchClass, firstOccurrenceOrder, occurrenceCount] = params;
      state.userSongChordIndex = [
        ...state.userSongChordIndex,
        {
          song_id: coerceText(songId),
          root_pitch_class: Number(rootPitchClass) as PitchClass,
          quality_id: coerceText(qualityId),
          bass_pitch_class: bassPitchClass === null ? null : (Number(bassPitchClass) as PitchClass),
          first_occurrence_order: Number(firstOccurrenceOrder),
          occurrence_count: Number(occurrenceCount),
        },
      ];
      return;
    }

    if (normalized.includes("insert into user_song_versions")) {
      const [id, songId, versionNumber, snapshotJson, changeReason, createdAt] = params;
      state.userSongVersions = [
        ...state.userSongVersions,
        {
          id: coerceText(id),
          song_id: coerceText(songId),
          version_number: Number(versionNumber),
          snapshot_json: coerceText(snapshotJson),
          change_reason: changeReason as UserSongVersionRow["change_reason"],
          created_at: coerceText(createdAt),
        },
      ];
      return;
    }

    if (normalized.includes("insert into user_song_drafts")) {
      const [id, songId, draftType, title, formStateJson, documentFormatVersion, documentJson, lastSavedAt, createdAt, recoveryStatus] = params;
      const nextRow: UserSongDraftRow = {
        id: coerceText(id),
        song_id: coerceNullableText(songId),
        draft_type: draftType as UserSongDraftRow["draft_type"],
        title: coerceNullableText(title),
        form_state_json: coerceText(formStateJson),
        document_format_version: Number(documentFormatVersion),
        document_json: coerceText(documentJson),
        last_saved_at: coerceText(lastSavedAt),
        created_at: coerceText(createdAt),
        recovery_status: recoveryStatus as UserSongDraftRow["recovery_status"],
      };

      const existing = state.userSongDrafts.find((row) => row.id === nextRow.id);
      if (existing) {
        state.userSongDrafts = state.userSongDrafts.map((row) => (row.id === nextRow.id ? nextRow : row));
      } else {
        state.userSongDrafts = [...state.userSongDrafts, nextRow];
      }
      return;
    }

    if (normalized.includes("update user_songs set deleted_at = ?")) {
      const [deletedAt, updatedAt, songId] = params;
      state.userSongs = state.userSongs.map((row) =>
        row.id === coerceText(songId) && row.deleted_at === null
          ? {
              ...row,
              deleted_at: coerceNullableText(deletedAt),
              updated_at: coerceText(updatedAt),
            }
          : row,
      );
      return;
    }
  };

  const readById = <T extends { readonly id: string }>(rows: readonly T[], id: string): T | null =>
    rows.find((row) => row.id === id) ?? null;

  const database: ContentRepositoryFixtureDatabase = {
    get state() {
      return state;
    },
    execAsync: () => Promise.resolve(),
    runAsync: (source: string, ...params: readonly unknown[]) => {
      applyRunStatement(source, params);
      return Promise.resolve({
        lastInsertRowId: 1,
        changes: 1,
      });
    },
    getFirstAsync: <T = Readonly<Record<string, unknown>>>(source: string, ...params: readonly unknown[]): Promise<T | null> => {
      const normalized = normalizeSql(source);

      if (normalized.includes("from catalog_songs") && normalized.includes("where 1 = 1") && normalized.includes("and id = ?")) {
        return Promise.resolve(readById(state.catalogSongs, String(params[0])) as unknown as T | null);
      }

      if (normalized.includes("from user_songs") && normalized.includes("where 1 = 1") && normalized.includes("and id = ?")) {
        return Promise.resolve(readById(state.userSongs, String(params[0])) as unknown as T | null);
      }

      if (normalized.includes("from catalog_song_arrangements") && normalized.includes("where song_id = ?")) {
        const rows = sortCatalogSongArrangements(
          state.catalogSongArrangements.filter((row) => row.song_id === String(params[0])),
        );
        return Promise.resolve((rows[0] ?? null) as unknown as T | null);
      }

      if (normalized.includes("from catalog_song_arrangement_chords") && normalized.includes("where arrangement_id = ?")) {
        const rows = sortCatalogSongArrangementChords(
          state.catalogSongArrangementChords.filter((row) => row.arrangement_id === String(params[0])),
        );
        return Promise.resolve((rows[0] ?? null) as unknown as T | null);
      }

      if (
        normalized.includes("from catalog_rhythms") &&
        (normalized.includes("where id = ?") || normalized.includes("and id = ?"))
      ) {
        return Promise.resolve(readById(state.catalogRhythms, String(params[0])) as unknown as T | null);
      }

      if (normalized.includes("from user_song_preferences") && normalized.includes("song_origin = ?") && normalized.includes("song_id = ?")) {
        const [songOrigin, songId] = params;
        const row = state.userSongPreferences.find(
          (entry) => entry.song_origin === songOrigin && entry.song_id === String(songId),
        );
        return Promise.resolve((row ?? null) as unknown as T | null);
      }

      if (normalized.includes("from user_song_versions") && normalized.includes("max(version_number)")) {
        const songId = String(params[0]);
        const versions = state.userSongVersions.filter((row) => row.song_id === songId);
        const max = versions.reduce((acc, row) => Math.max(acc, row.version_number), 0);
        return Promise.resolve({ version_number: max } as unknown as T | null);
      }

      if (normalized.includes("from user_song_drafts") && normalized.includes("where id = ?")) {
        return Promise.resolve(readById(state.userSongDrafts, String(params[0])) as unknown as T | null);
      }

      if (normalized.includes("from catalog_rhythm_patterns") && normalized.includes("where rhythm_id = ?")) {
        const rows = sortCatalogRhythmPatterns(
          state.catalogRhythmPatterns.filter((row) => row.rhythm_id === String(params[0])),
        );
        return Promise.resolve((rows[0] ?? null) as unknown as T | null);
      }

      if (normalized.includes("from catalog_rhythm_steps") && normalized.includes("where pattern_id = ?")) {
        const rows = sortCatalogRhythmSteps(
          state.catalogRhythmSteps.filter((row) => row.pattern_id === String(params[0])),
        );
        return Promise.resolve((rows[0] ?? null) as unknown as T | null);
      }

      if (normalized.includes("from catalog_rhythm_audio") && normalized.includes("where rhythm_id = ?")) {
        const rows = sortCatalogRhythmAudio(
          state.catalogRhythmAudio.filter((row) => row.rhythm_id === String(params[0])),
        );
        return Promise.resolve((rows[0] ?? null) as unknown as T | null);
      }

      return Promise.resolve(null);
    },
    getAllAsync: <T = Readonly<Record<string, unknown>>>(source: string, ...params: readonly unknown[]): Promise<readonly T[]> => {
      const normalized = normalizeSql(source);

      if (normalized.includes("from catalog_songs")) {
        return Promise.resolve(filterCatalogSongs(state, normalized, params) as unknown as readonly T[]);
      }

      if (normalized.includes("from user_songs")) {
        return Promise.resolve(filterUserSongs(state, normalized, params) as unknown as readonly T[]);
      }

      if (normalized.includes("from catalog_song_arrangements") && normalized.includes("where song_id in")) {
        const ids = params.map(String);
        const rows = sortCatalogSongArrangements(
          state.catalogSongArrangements.filter((row) => ids.includes(row.song_id)),
        );
        return Promise.resolve(rows as unknown as readonly T[]);
      }

      if (normalized.includes("from catalog_song_arrangements") && normalized.includes("where song_id = ?")) {
        return Promise.resolve(
          sortCatalogSongArrangements(state.catalogSongArrangements.filter((row) => row.song_id === String(params[0]))) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_song_arrangement_chords")) {
        return Promise.resolve(
          sortCatalogSongArrangementChords(
            state.catalogSongArrangementChords.filter((row) => row.arrangement_id === String(params[0])),
          ) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_song_chord_index") && normalized.includes("where song_id = ?")) {
        return Promise.resolve(
          state.catalogSongChordIndex
            .filter((row) => row.song_id === String(params[0]))
            .sort((left, right) => left.first_occurrence_order - right.first_occurrence_order) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_chords") && normalized.includes("where id in")) {
        const ids = params.map(String);
        return Promise.resolve(selectByIds(state.catalogChords, ids) as unknown as readonly T[]);
      }

      if (normalized.includes("from catalog_song_rhythms") && normalized.includes("where song_id = ?")) {
        return Promise.resolve(
          state.catalogSongRhythms.filter((row) => row.song_id === String(params[0])) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_rhythms") && normalized.includes("where id in")) {
        const ids = params.map(String);
        return Promise.resolve(selectByIds(state.catalogRhythms, ids) as unknown as readonly T[]);
      }

      if (normalized.includes("from user_song_chord_index") && normalized.includes("where song_id = ?")) {
        return Promise.resolve(
          state.userSongChordIndex
            .filter((row) => row.song_id === String(params[0]))
            .sort((left, right) => left.first_occurrence_order - right.first_occurrence_order) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from user_favorites") && normalized.includes("entity_type = 'song'")) {
        const origin = String(params[0]) as ContentOrigin;
        const ids = params.slice(1).map(String);
        return Promise.resolve(
          state.userFavorites.filter(
            (row) =>
              row.entity_type === "song" &&
              row.entity_origin === origin &&
              ids.includes(row.entity_id),
          ) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from user_song_preferences") && normalized.includes("song_origin = ?") && normalized.includes("song_id in")) {
        const songOrigin = params[0] as ContentOrigin;
        const ids = params.slice(1).map(String);
        return Promise.resolve(
          state.userSongPreferences.filter(
            (row) => row.song_origin === songOrigin && ids.includes(row.song_id),
          ) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from user_song_drafts")) {
        const songIdIndex = normalized.includes("song_id = ?") ? 0 : -1;
        if (songIdIndex >= 0 && params.length > 0) {
          const songId = String(params[0]);
          return Promise.resolve(
            sortUserSongDrafts(state.userSongDrafts.filter((row) => row.song_id === songId)) as unknown as readonly T[],
          );
        }

        return Promise.resolve(sortUserSongDrafts(state.userSongDrafts) as unknown as readonly T[]);
      }

      if (normalized.includes("from catalog_rhythm_patterns") && normalized.includes("where rhythm_id in")) {
        const ids = params.map(String);
        return Promise.resolve(
          sortCatalogRhythmPatterns(state.catalogRhythmPatterns.filter((row) => ids.includes(row.rhythm_id))) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_rhythm_patterns") && normalized.includes("where rhythm_id = ?")) {
        return Promise.resolve(
          sortCatalogRhythmPatterns(state.catalogRhythmPatterns.filter((row) => row.rhythm_id === String(params[0]))) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_rhythm_steps") && normalized.includes("where pattern_id in")) {
        const ids = params.map(String);
        return Promise.resolve(
          sortCatalogRhythmSteps(state.catalogRhythmSteps.filter((row) => ids.includes(row.pattern_id))) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_rhythm_steps") && normalized.includes("where pattern_id = ?")) {
        return Promise.resolve(
          sortCatalogRhythmSteps(state.catalogRhythmSteps.filter((row) => row.pattern_id === String(params[0]))) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_rhythm_audio") && normalized.includes("where rhythm_id in")) {
        const ids = params.map(String);
        return Promise.resolve(
          sortCatalogRhythmAudio(state.catalogRhythmAudio.filter((row) => ids.includes(row.rhythm_id))) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_rhythm_audio") && normalized.includes("where rhythm_id = ?")) {
        return Promise.resolve(
          sortCatalogRhythmAudio(state.catalogRhythmAudio.filter((row) => row.rhythm_id === String(params[0]))) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_exercises") && normalized.includes("where rhythm_id = ? or pattern_id in")) {
        const rhythmId = String(params[0]);
        const patternIds = params.slice(1).map(String);
        return Promise.resolve(
          sortCatalogExercises(
            state.catalogExercises.filter(
              (row) => row.rhythm_id === rhythmId || (row.pattern_id !== null && patternIds.includes(row.pattern_id)),
            ),
          ) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_exercises") && normalized.includes("where rhythm_id in")) {
        const rhythmIds = params.map(String);
        return Promise.resolve(
          sortCatalogExercises(
            state.catalogExercises.filter(
              (row) =>
                (row.rhythm_id !== null && rhythmIds.includes(row.rhythm_id)) ||
                (row.pattern_id !== null && rhythmIds.includes(row.pattern_id)),
            ),
          ) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_favorites")) {
        return Promise.resolve([] as unknown as readonly T[]);
      }

      if (normalized.includes("from user_favorites") && normalized.includes("entity_type = 'rhythm'")) {
        const ids = params.map(String);
        return Promise.resolve(
          state.userFavorites.filter(
            (row) =>
              row.entity_type === "rhythm" &&
              row.entity_origin === "catalog" &&
              ids.includes(row.entity_id),
          ) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_rhythms") && normalized.includes("where id in")) {
        const ids = params.map(String);
        return Promise.resolve(
          selectByIds(state.catalogRhythms, ids) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_rhythms") && normalized.includes("where 1 = 1")) {
        return Promise.resolve(filterRhythms(state, normalized, params) as unknown as readonly T[]);
      }

      if (normalized.includes("from catalog_rhythms") && normalized.includes("where id = ?")) {
        return Promise.resolve(
          state.catalogRhythms.filter((row) => row.id === String(params[0])) as unknown as readonly T[],
        );
      }

      return Promise.resolve([] as readonly T[]);
    },
    withTransactionAsync: async <T>(task: () => Promise<T>): Promise<T> => {
      const snapshot = cloneState(state);

      try {
        return await task();
      } catch (error) {
        state = snapshot;
        throw error;
      }
    },
    withExclusiveTransactionAsync: async <T>(task: () => Promise<T>): Promise<T> => {
      return database.withTransactionAsync(task);
    },
    closeAsync: () => Promise.resolve(),
  };

  return database;
}

export function createTuningRepositoryStub() {
  const catalogTuning = buildValidTuning();
  const userTuning = buildUserTuning();

  return {
    getByRef: (ref: { readonly origin: ContentOrigin; readonly id: string }) => {
      if (ref.origin === catalogTuning.origin && ref.id === catalogTuning.id) {
        return Promise.resolve(catalogTuning);
      }

      if (ref.origin === userTuning.origin && ref.id === userTuning.id) {
        return Promise.resolve(userTuning);
      }

      return Promise.resolve(null);
    },
  };
}
