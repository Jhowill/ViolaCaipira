import { createTuningRef, type TuningRepository } from "@/repositories/contracts";
import { RepositoryError, toRepositoryError } from "@/repositories/contracts/errors";
import type { SQLiteDatabaseLike } from "@/types/database";
import {
  type ContentOrigin,
  type DifficultyLevel,
  type EntityRef,
  type PitchClass,
  type SongChordUsage,
  type SongDocument,
  type SongMode,
  type SongViewModel,
  type TimeSignatureDenominator,
} from "@/types/music";
import { SongDocumentSchema } from "@/validation";
import { transposeChordToken, transposeSongDocument } from "@/domain/songs";
import { pitchClassToSpelling } from "@/domain/music/conversions";
import { buildContainsLikePattern, normalizeSearchText, splitSearchTerms } from "@/database/queries";
import { buildPaginationWindow } from "@/database/queries";
import { withDatabaseTransaction } from "@/database/transaction";

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
  readonly time_signature_denominator: number;
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
  readonly entity_type: "song";
  readonly entity_origin: ContentOrigin;
  readonly entity_id: string;
  readonly created_at: string;
}

export interface SongSummary {
  readonly ref: EntityRef<"song">;
  readonly title: string;
  readonly artist?: string | null;
  readonly keyLabel?: string | null;
  readonly tuningLabel: string;
  readonly rhythmLabel?: string | null;
  readonly difficulty?: DifficultyLevel | null;
  readonly origin: ContentOrigin;
  readonly isFavorite: boolean;
}

export interface SongFilters {
  readonly origin?: ContentOrigin | "all";
  readonly difficulty?: DifficultyLevel | "all";
  readonly tuning?: EntityRef<"tuning"> | "all";
  readonly keyPitchClass?: PitchClass | "all";
  readonly keyMode?: SongMode | "all";
  readonly favorite?: boolean;
  readonly includeDeleted?: boolean;
  readonly limit?: number;
  readonly offset?: number;
}

export interface SaveUserSongInput {
  readonly id?: string;
  readonly title: string;
  readonly artist?: string | null;
  readonly composer?: string | null;
  readonly copyrightConfirmation: UserSongRow["copyright_confirmation"];
  readonly originalKeyPitchClass?: PitchClass | null;
  readonly originalKeyMode?: SongMode;
  readonly tuning: EntityRef<"tuning">;
  readonly rhythmId?: string | null;
  readonly customRhythmName?: string | null;
  readonly bpm?: number | null;
  readonly timeSignatureNumerator?: number | null;
  readonly timeSignatureDenominator?: TimeSignatureDenominator | null;
  readonly capoFret?: number;
  readonly difficulty?: DifficultyLevel | null;
  readonly document: SongDocument;
  readonly searchText?: string | null;
  readonly now?: string;
}

export interface SongDraftInput {
  readonly id?: string;
  readonly songId?: string | null;
  readonly draftType: UserSongDraftRow["draft_type"];
  readonly title?: string | null;
  readonly formStateJson: string;
  readonly documentFormatVersion: number;
  readonly documentJson: string;
  readonly recoveryStatus?: UserSongDraftRow["recovery_status"];
  readonly now?: string;
}

export interface SongDraftRecord {
  readonly id: string;
  readonly songId: string | null;
  readonly draftType: UserSongDraftRow["draft_type"];
  readonly title: string | null;
  readonly formStateJson: string;
  readonly documentFormatVersion: number;
  readonly documentJson: string;
  readonly lastSavedAt: string;
  readonly createdAt: string;
  readonly recoveryStatus: UserSongDraftRow["recovery_status"];
}

export interface UserSongRecord {
  readonly id: string;
  readonly title: string;
  readonly normalizedTitle: string;
  readonly artist: string | null;
  readonly normalizedArtist: string | null;
  readonly composer: string | null;
  readonly copyrightConfirmation: UserSongRow["copyright_confirmation"];
  readonly originalKeyPitchClass: PitchClass | null;
  readonly originalKeyMode: SongMode;
  readonly tuningOrigin: ContentOrigin;
  readonly tuningId: string;
  readonly rhythmId: string | null;
  readonly customRhythmName: string | null;
  readonly bpm: number | null;
  readonly timeSignatureNumerator: number | null;
  readonly timeSignatureDenominator: TimeSignatureDenominator | null;
  readonly capoFret: number;
  readonly difficulty: DifficultyLevel | null;
  readonly documentFormatVersion: number;
  readonly documentJson: string;
  readonly searchText: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}

export interface SongRepository {
  list(filters?: SongFilters): Promise<readonly SongSummary[]>;
  search(query: string, filters?: SongFilters): Promise<readonly SongSummary[]>;
  getByRef(ref: EntityRef<"song">): Promise<SongViewModel | null>;
  saveUserSong(input: SaveUserSongInput): Promise<UserSongRecord>;
  softDeleteUserSong(id: string): Promise<void>;
  saveUserSongDraft(input: SongDraftInput): Promise<SongDraftRecord>;
  listUserSongDrafts(songId?: string | null): Promise<readonly SongDraftRecord[]>;
  discardUserSongDraft(id: string): Promise<void>;
}

interface SongPreferenceBundle {
  readonly preference: UserSongPreferenceRow | null;
  readonly preferredShapeOverrides: ReadonlyMap<string, EntityRef<"chord_shape">>;
}

interface SongRepositoryOptions {
  readonly tuningRepository: Pick<TuningRepository, "getByRef">;
  readonly now?: () => string;
  readonly idFactory?: () => string;
}

const DEFAULT_LIST_LIMIT = 20;
const DEFAULT_SEARCH_FETCH_LIMIT = 60;

const SELECT_CATALOG_SONGS_BASE_SQL = `
SELECT
  id,
  slug,
  title,
  normalized_title,
  artist,
  normalized_artist,
  composer,
  rights_holder,
  license_id,
  source_id,
  copyright_status,
  original_key_pitch_class,
  original_key_mode,
  default_rhythm_id,
  default_bpm,
  time_signature_numerator,
  time_signature_denominator,
  difficulty,
  document_format_version,
  document_json,
  search_text,
  is_featured,
  sort_order,
  verification_status,
  reviewer_id,
  reviewed_at,
  created_at,
  updated_at
FROM catalog_songs
WHERE 1 = 1
`.trim();

const SELECT_USER_SONGS_BASE_SQL = `
SELECT
  id,
  title,
  normalized_title,
  artist,
  normalized_artist,
  composer,
  copyright_confirmation,
  original_key_pitch_class,
  original_key_mode,
  tuning_origin,
  tuning_id,
  rhythm_id,
  custom_rhythm_name,
  bpm,
  time_signature_numerator,
  time_signature_denominator,
  capo_fret,
  difficulty,
  document_format_version,
  document_json,
  search_text,
  created_at,
  updated_at,
  deleted_at
FROM user_songs
WHERE 1 = 1
`.trim();

const SELECT_CATALOG_SONG_BY_ID_SQL = `${SELECT_CATALOG_SONGS_BASE_SQL} AND id = ? LIMIT 1`;
const SELECT_USER_SONG_BY_ID_SQL = `${SELECT_USER_SONGS_BASE_SQL} AND id = ? LIMIT 1`;
const SELECT_USER_SONG_VERSION_MAX_SQL = "SELECT COALESCE(MAX(version_number), 0) AS version_number FROM user_song_versions WHERE song_id = ?";
const SELECT_USER_SONG_DRAFT_BY_ID_SQL = `
SELECT
  id,
  song_id,
  draft_type,
  title,
  form_state_json,
  document_format_version,
  document_json,
  last_saved_at,
  created_at,
  recovery_status
FROM user_song_drafts
WHERE id = ?
LIMIT 1
`.trim();

const SELECT_USER_SONG_DRAFTS_SQL = `
SELECT
  id,
  song_id,
  draft_type,
  title,
  form_state_json,
  document_format_version,
  document_json,
  last_saved_at,
  created_at,
  recovery_status
FROM user_song_drafts
WHERE 1 = 1
`.trim();

const SELECT_SONG_PREFERENCE_SQL = `
SELECT
  id,
  song_origin,
  song_id,
  remembered_key_pitch_class,
  remembered_key_mode,
  remember_key,
  last_scroll_position,
  stage_font_scale,
  stage_scroll_speed,
  preferred_arrangement_id,
  preferred_shape_overrides_json,
  last_opened_at,
  updated_at
FROM user_song_preferences
WHERE song_origin = ? AND song_id = ?
LIMIT 1
`.trim();

const SELECT_CATALOG_SONG_ARRANGEMENTS_SQL = `
SELECT
  id,
  song_id,
  tuning_id,
  name,
  arrangement_status,
  key_pitch_class,
  key_mode,
  capo_fret,
  recommended_bpm,
  notes,
  reviewer_id,
  source_id,
  calculation_version,
  is_recommended,
  sort_order,
  created_at,
  updated_at
FROM catalog_song_arrangements
WHERE song_id = ?
ORDER BY is_recommended DESC, sort_order ASC, updated_at DESC, id ASC
`.trim();

const SELECT_CATALOG_SONG_ARRANGEMENTS_BY_IDS_SQL = `
SELECT
  id,
  song_id,
  tuning_id,
  name,
  arrangement_status,
  key_pitch_class,
  key_mode,
  capo_fret,
  recommended_bpm,
  notes,
  reviewer_id,
  source_id,
  calculation_version,
  is_recommended,
  sort_order,
  created_at,
  updated_at
FROM catalog_song_arrangements
WHERE song_id IN (%IDS%)
ORDER BY song_id, is_recommended DESC, sort_order ASC, updated_at DESC, id ASC
`.trim();

const SELECT_CATALOG_SONG_ARRANGEMENT_CHORDS_SQL = `
SELECT
  id,
  arrangement_id,
  chord_id,
  preferred_shape_id,
  fallback_shape_id,
  status,
  notes
FROM catalog_song_arrangement_chords
WHERE arrangement_id = ?
ORDER BY id ASC
`.trim();

const SELECT_CATALOG_SONG_CHORD_INDEX_SQL = `
SELECT
  song_id,
  chord_id,
  first_occurrence_order,
  occurrence_count
FROM catalog_song_chord_index
WHERE song_id = ?
ORDER BY first_occurrence_order ASC, chord_id ASC
`.trim();

const SELECT_CATALOG_CHORDS_BY_IDS_SQL = `
SELECT
  id,
  root_pitch_class,
  quality_id,
  bass_pitch_class,
  canonical_symbol,
  normalized_search_text,
  created_at
FROM catalog_chords
WHERE id IN (%IDS%)
`.trim();

const SELECT_CATALOG_SONG_RHYTHMS_SQL = `
SELECT
  song_id,
  rhythm_id,
  pattern_id,
  relevance,
  recommended_bpm,
  notes
FROM catalog_song_rhythms
WHERE song_id = ?
ORDER BY CASE relevance WHEN 'primary' THEN 0 WHEN 'alternative' THEN 1 ELSE 2 END, rhythm_id ASC
`.trim();

const SELECT_USER_SONG_CHORD_INDEX_SQL = `
SELECT
  song_id,
  root_pitch_class,
  quality_id,
  bass_pitch_class,
  first_occurrence_order,
  occurrence_count
FROM user_song_chord_index
WHERE song_id = ?
ORDER BY first_occurrence_order ASC, root_pitch_class ASC, quality_id ASC, COALESCE(bass_pitch_class, -1) ASC
`.trim();

const SELECT_USER_FAVORITES_BY_IDS_SQL = `
SELECT
  id,
  entity_type,
  entity_origin,
  entity_id,
  created_at
FROM user_favorites
WHERE entity_type = 'song' AND entity_origin = ? AND entity_id IN (%IDS%)
`.trim();

const UPSERT_USER_SONG_SQL = `
INSERT INTO user_songs (
  id,
  title,
  normalized_title,
  artist,
  normalized_artist,
  composer,
  copyright_confirmation,
  original_key_pitch_class,
  original_key_mode,
  tuning_origin,
  tuning_id,
  rhythm_id,
  custom_rhythm_name,
  bpm,
  time_signature_numerator,
  time_signature_denominator,
  capo_fret,
  difficulty,
  document_format_version,
  document_json,
  search_text,
  created_at,
  updated_at,
  deleted_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  normalized_title = excluded.normalized_title,
  artist = excluded.artist,
  normalized_artist = excluded.normalized_artist,
  composer = excluded.composer,
  copyright_confirmation = excluded.copyright_confirmation,
  original_key_pitch_class = excluded.original_key_pitch_class,
  original_key_mode = excluded.original_key_mode,
  tuning_origin = excluded.tuning_origin,
  tuning_id = excluded.tuning_id,
  rhythm_id = excluded.rhythm_id,
  custom_rhythm_name = excluded.custom_rhythm_name,
  bpm = excluded.bpm,
  time_signature_numerator = excluded.time_signature_numerator,
  time_signature_denominator = excluded.time_signature_denominator,
  capo_fret = excluded.capo_fret,
  difficulty = excluded.difficulty,
  document_format_version = excluded.document_format_version,
  document_json = excluded.document_json,
  search_text = excluded.search_text,
  updated_at = excluded.updated_at,
  deleted_at = excluded.deleted_at
`.trim();

const INSERT_USER_SONG_VERSION_SQL = `
INSERT INTO user_song_versions (
  id,
  song_id,
  version_number,
  snapshot_json,
  change_reason,
  created_at
) VALUES (?, ?, ?, ?, ?, ?)
`.trim();

const UPSERT_USER_SONG_DRAFT_SQL = `
INSERT INTO user_song_drafts (
  id,
  song_id,
  draft_type,
  title,
  form_state_json,
  document_format_version,
  document_json,
  last_saved_at,
  created_at,
  recovery_status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  song_id = excluded.song_id,
  draft_type = excluded.draft_type,
  title = excluded.title,
  form_state_json = excluded.form_state_json,
  document_format_version = excluded.document_format_version,
  document_json = excluded.document_json,
  last_saved_at = excluded.last_saved_at,
  recovery_status = excluded.recovery_status
`.trim();

const INSERT_USER_SONG_CHORD_INDEX_SQL = `
INSERT INTO user_song_chord_index (
  song_id,
  root_pitch_class,
  quality_id,
  bass_pitch_class,
  first_occurrence_order,
  occurrence_count
) VALUES (?, ?, ?, ?, ?, ?)
`.trim();

const SOFT_DELETE_USER_SONG_SQL = `
UPDATE user_songs
SET deleted_at = ?, updated_at = ?
WHERE id = ? AND deleted_at IS NULL
`.trim();

const SELECT_USER_SONG_PREFERENCES_BY_IDS_SQL = `
SELECT
  id,
  song_origin,
  song_id,
  remembered_key_pitch_class,
  remembered_key_mode,
  remember_key,
  last_scroll_position,
  stage_font_scale,
  stage_scroll_speed,
  preferred_arrangement_id,
  preferred_shape_overrides_json,
  last_opened_at,
  updated_at
FROM user_song_preferences
WHERE song_origin = ? AND song_id IN (%IDS%)
`.trim();

function createNowProvider(now?: () => string): () => string {
  return now ?? (() => new Date().toISOString());
}

function createIdFactory(factory?: () => string): () => string {
  if (factory) {
    return factory;
  }

  return () => globalThis.crypto?.randomUUID?.() ?? `song-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cleanText(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function createSongRef(origin: ContentOrigin, id: string): EntityRef<"song"> {
  return {
    type: "song",
    origin,
    id,
  };
}

function createSongDraftRecord(row: UserSongDraftRow): SongDraftRecord {
  return {
    id: row.id,
    songId: row.song_id,
    draftType: row.draft_type,
    title: row.title,
    formStateJson: row.form_state_json,
    documentFormatVersion: row.document_format_version,
    documentJson: row.document_json,
    lastSavedAt: row.last_saved_at,
    createdAt: row.created_at,
    recoveryStatus: row.recovery_status,
  };
}

function toSongRecord(row: UserSongRow): UserSongRecord {
  return {
    id: row.id,
    title: row.title,
    normalizedTitle: row.normalized_title,
    artist: row.artist,
    normalizedArtist: row.normalized_artist,
    composer: row.composer,
    copyrightConfirmation: row.copyright_confirmation,
    originalKeyPitchClass: row.original_key_pitch_class,
    originalKeyMode: row.original_key_mode,
    tuningOrigin: row.tuning_origin,
    tuningId: row.tuning_id,
    rhythmId: row.rhythm_id,
    customRhythmName: row.custom_rhythm_name,
    bpm: row.bpm,
    timeSignatureNumerator: row.time_signature_numerator,
    timeSignatureDenominator: row.time_signature_denominator,
    capoFret: row.capo_fret,
    difficulty: row.difficulty,
    documentFormatVersion: row.document_format_version,
    documentJson: row.document_json,
    searchText: row.search_text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function normalizeKeyMode(mode: SongMode | null | undefined): SongMode {
  return mode ?? "unknown";
}

function formatSongKeyLabel(pitchClass: PitchClass | null, mode: SongMode | null | undefined): string | null {
  if (pitchClass === null) {
    return null;
  }

  const note = pitchClassToSpelling(pitchClass, "contextual");
  const normalizedMode = normalizeKeyMode(mode);

  if (normalizedMode === "major") {
    return `${note} maior`;
  }

  if (normalizedMode === "minor") {
    return `${note} menor`;
  }

  if (normalizedMode === "modal") {
    return `${note} modal`;
  }

  return note;
}

function buildSongSearchText(parts: readonly (string | null | undefined)[]): string {
  return normalizeSearchText(
    parts
      .map((part) => cleanText(part))
      .filter((part): part is string => part !== null)
      .join(" "),
  );
}

function buildDocumentSearchText(document: SongDocument): string {
  const parts: string[] = [];

  for (const section of document.sections) {
    if (section.label) {
      parts.push(section.label);
    }

    for (const line of section.lines) {
      for (const segment of line.segments) {
        if (segment.type === "text") {
          parts.push(segment.text);
          continue;
        }

        if (segment.type === "chord") {
          parts.push(segment.chord.originalSpelling ?? "");
        }
      }
    }
  }

  return normalizeSearchText(parts.join(" "));
}

function buildChordSignature(chord: { readonly rootPitchClass: PitchClass; readonly qualityId: string; readonly bassPitchClass?: PitchClass | null }): string {
  return `${chord.rootPitchClass}:${chord.qualityId}:${chord.bassPitchClass ?? -1}`;
}

function parseShapeOverrides(json: string | null | undefined): ReadonlyMap<string, EntityRef<"chord_shape">> {
  if (!json) {
    return new Map();
  }

  try {
    const parsed = JSON.parse(json) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return new Map();
    }

    const entries = Object.entries(parsed as Record<string, unknown>);
    const overrides = new Map<string, EntityRef<"chord_shape">>();

    for (const [key, value] of entries) {
      if (value === null || typeof value !== "object" || Array.isArray(value)) {
        continue;
      }

      const record = value as Record<string, unknown>;
      const origin = record["origin"];
      const shapeId = record["shapeId"];

      if ((origin === "catalog" || origin === "user") && typeof shapeId === "string" && shapeId.trim().length > 0) {
        overrides.set(key, {
          type: "chord_shape",
          origin,
          id: shapeId,
        });
      }
    }

    return overrides;
  } catch {
    return new Map();
  }
}

function transposeIfNeeded(document: SongDocument, semitones: number): SongDocument {
  if (semitones % 12 === 0) {
    return document;
  }

  return transposeSongDocument(document, semitones);
}

function transposeUsageChord(
  chord: { readonly rootPitchClass: PitchClass; readonly qualityId: string; readonly bassPitchClass?: PitchClass | null },
  semitones: number,
): { readonly rootPitchClass: PitchClass; readonly qualityId: string; readonly bassPitchClass?: PitchClass | null } {
  if (semitones % 12 === 0) {
    return chord;
  }

  return transposeChordToken(
    {
      rootPitchClass: chord.rootPitchClass,
      qualityId: chord.qualityId,
      bassPitchClass: chord.bassPitchClass ?? null,
    },
    semitones,
  );
}

function toSongUsage(
  usage: {
    readonly chord: { readonly rootPitchClass: PitchClass; readonly qualityId: string; readonly bassPitchClass?: PitchClass | null };
    readonly occurrenceCount: number;
    readonly preferredShape?: EntityRef<"chord_shape"> | null;
    readonly status: SongChordUsage["status"];
  },
  semitones: number,
  override?: EntityRef<"chord_shape"> | null,
): SongChordUsage {
  const chord = transposeUsageChord(usage.chord, semitones);

  return {
    chord,
    occurrenceCount: usage.occurrenceCount,
    preferredShape: override ?? usage.preferredShape ?? null,
    status: usage.status,
  };
}

function buildSongSearchClause(
  alias: string,
  query: string,
  options: {
    readonly includeTags: boolean;
    readonly includeRhythms: boolean;
    readonly includeCustomRhythmName: boolean;
  },
): { readonly sql: string; readonly params: readonly unknown[] } {
  const terms = splitSearchTerms(query);

  if (terms.length === 0) {
    return {
      sql: "",
      params: [],
    };
  }

  const clauses: string[] = [];
  const params: unknown[] = [];

  for (const term of terms) {
    const pattern = buildContainsLikePattern(term);
    const textChecks = [
      `${alias}.normalized_title LIKE ? ESCAPE '\\'`,
      `${alias}.normalized_artist LIKE ? ESCAPE '\\'`,
      `LOWER(COALESCE(${alias}.composer, '')) LIKE ? ESCAPE '\\'`,
      `${alias}.search_text LIKE ? ESCAPE '\\'`,
    ];

    params.push(pattern, pattern, pattern, pattern);

    if (options.includeCustomRhythmName) {
      textChecks.push(`LOWER(COALESCE(${alias}.custom_rhythm_name, '')) LIKE ? ESCAPE '\\'`);
      params.push(pattern);
    }

    if (options.includeTags) {
      textChecks.push(`EXISTS (
        SELECT 1
        FROM catalog_song_tags song_tags
        JOIN catalog_tags tags ON tags.id = song_tags.tag_id
        WHERE song_tags.entity_id = ${alias}.id
          AND (LOWER(tags.label) LIKE ? ESCAPE '\\' OR LOWER(tags.slug) LIKE ? ESCAPE '\\')
      )`);
      params.push(pattern, pattern);
    }

    if (options.includeRhythms) {
      if (alias === "catalog_songs") {
        textChecks.push(`EXISTS (
          SELECT 1
          FROM catalog_song_rhythms song_rhythms
          JOIN catalog_rhythms rhythms ON rhythms.id = song_rhythms.rhythm_id
          WHERE song_rhythms.song_id = ${alias}.id
            AND (
              LOWER(rhythms.name) LIKE ? ESCAPE '\\'
              OR LOWER(COALESCE(rhythms.short_description, '')) LIKE ? ESCAPE '\\'
              OR LOWER(COALESCE(rhythms.description, '')) LIKE ? ESCAPE '\\'
              OR LOWER(COALESCE(rhythms.origin_region, '')) LIKE ? ESCAPE '\\'
            )
        )`);
        params.push(pattern, pattern, pattern, pattern);
      } else {
        textChecks.push(`EXISTS (
          SELECT 1
          FROM catalog_rhythms rhythms
          WHERE rhythms.id = ${alias}.rhythm_id
            AND (
              LOWER(rhythms.name) LIKE ? ESCAPE '\\'
              OR LOWER(COALESCE(rhythms.short_description, '')) LIKE ? ESCAPE '\\'
              OR LOWER(COALESCE(rhythms.description, '')) LIKE ? ESCAPE '\\'
              OR LOWER(COALESCE(rhythms.origin_region, '')) LIKE ? ESCAPE '\\'
            )
        )`);
        params.push(pattern, pattern, pattern, pattern);
      }
    }

    clauses.push(`(${textChecks.join(" OR ")})`);
  }

  return {
    sql: ` AND (${clauses.join(" AND ")})`,
    params,
  };
}

function buildSongListFilters(
  alias: string,
  filters: SongFilters,
): { readonly sql: string; readonly params: readonly unknown[] } {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.difficulty && filters.difficulty !== "all") {
    clauses.push(`${alias}.difficulty = ?`);
    params.push(filters.difficulty);
  }

  if (filters.tuning && filters.tuning !== "all") {
    if (alias === "catalog_songs") {
      clauses.push(`EXISTS (
        SELECT 1
        FROM catalog_song_arrangements arrangements
        WHERE arrangements.song_id = ${alias}.id
          AND arrangements.tuning_id = ?
      )`);
      params.push(filters.tuning.id);
    } else {
      clauses.push(`${alias}.tuning_origin = ? AND ${alias}.tuning_id = ?`);
      params.push(filters.tuning.origin, filters.tuning.id);
    }
  }

  if (filters.keyPitchClass !== undefined && filters.keyPitchClass !== "all") {
    if (alias === "catalog_songs") {
      clauses.push(`EXISTS (
        SELECT 1
        FROM catalog_song_arrangements arrangements
        WHERE arrangements.song_id = ${alias}.id
          AND arrangements.key_pitch_class = ?
      )`);
      params.push(filters.keyPitchClass);
    } else {
      clauses.push(`${alias}.original_key_pitch_class = ?`);
      params.push(filters.keyPitchClass);
    }
  }

  if (filters.keyMode !== undefined && filters.keyMode !== "all") {
    if (alias === "catalog_songs") {
      clauses.push(`EXISTS (
        SELECT 1
        FROM catalog_song_arrangements arrangements
        WHERE arrangements.song_id = ${alias}.id
          AND arrangements.key_mode = ?
      )`);
      params.push(filters.keyMode);
    } else {
      clauses.push(`${alias}.original_key_mode = ?`);
      params.push(filters.keyMode);
    }
  }

  if (alias === "user_songs" && filters.includeDeleted !== true) {
    clauses.push(`${alias}.deleted_at IS NULL`);
  }

  if (filters.favorite !== undefined) {
    const favoriteSql =
      alias === "catalog_songs"
        ? `EXISTS (
            SELECT 1
            FROM user_favorites favorites
            WHERE favorites.entity_type = 'song'
              AND favorites.entity_origin = 'catalog'
              AND favorites.entity_id = ${alias}.id
          )`
        : `EXISTS (
            SELECT 1
            FROM user_favorites favorites
            WHERE favorites.entity_type = 'song'
              AND favorites.entity_origin = 'user'
              AND favorites.entity_id = ${alias}.id
          )`;

    clauses.push(filters.favorite ? favoriteSql : `NOT ${favoriteSql}`);
  }

  return {
    sql: clauses.length > 0 ? ` AND ${clauses.map((clause) => `(${clause})`).join(" AND ")}` : "",
    params,
  };
}

function buildSongOrderClause(alias: string, origin: ContentOrigin): string {
  if (origin === "catalog") {
    return `${alias}.is_featured DESC, ${alias}.sort_order ASC, ${alias}.normalized_title ASC, ${alias}.id ASC`;
  }

  return `${alias}.updated_at DESC, ${alias}.normalized_title ASC, ${alias}.id ASC`;
}

function mapPreferencesRow(row: UserSongPreferenceRow): SongPreferenceBundle {
  return {
    preference: row,
    preferredShapeOverrides: parseShapeOverrides(row.preferred_shape_overrides_json),
  };
}

function scoreSongSummary(summary: SongSummary, query: string): number {
  const normalizedQuery = normalizeSearchText(query);

  if (normalizedQuery.length === 0) {
    return 0;
  }

  const haystack = normalizeSearchText(
    [
      summary.title,
      summary.artist,
      summary.keyLabel,
      summary.tuningLabel,
      summary.rhythmLabel,
      summary.origin,
    ]
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .join(" "),
  );

  if (haystack === normalizedQuery) {
    return 1_000;
  }

  let score = 0;
  if (haystack.startsWith(normalizedQuery)) {
    score += 500;
  }

  if (haystack.includes(normalizedQuery)) {
    score += 200;
  }

  for (const term of splitSearchTerms(query)) {
    if (haystack.includes(term)) {
      score += 20;
    }
  }

  return score;
}

function sortSongSummaries(left: SongSummary, right: SongSummary): number {
  const originRank: Readonly<Record<ContentOrigin, number>> = {
    catalog: 0,
    user: 1,
  };

  if (left.origin !== right.origin) {
    return originRank[left.origin] - originRank[right.origin];
  }

  if (left.origin === "catalog") {
    const leftTitle = normalizeSearchText(left.title);
    const rightTitle = normalizeSearchText(right.title);
    return leftTitle.localeCompare(rightTitle) || left.ref.id.localeCompare(right.ref.id);
  }

  return left.title.localeCompare(right.title) || left.ref.id.localeCompare(right.ref.id);
}

function buildSongSummaryFromCatalog(params: {
  readonly row: CatalogSongRow;
  readonly tuningLabel: string;
  readonly rhythmLabel: string | null;
  readonly favorite: boolean;
  readonly currentKeyPitchClass: PitchClass | null;
  readonly currentKeyMode: SongMode | null;
}): SongSummary {
  const keyLabel = formatSongKeyLabel(params.currentKeyPitchClass, params.currentKeyMode);

  return {
    ref: createSongRef("catalog", params.row.id),
    title: params.row.title,
    artist: params.row.artist,
    keyLabel,
    tuningLabel: params.tuningLabel,
    rhythmLabel: params.rhythmLabel,
    difficulty: params.row.difficulty,
    origin: "catalog",
    isFavorite: params.favorite,
  };
}

function buildSongSummaryFromUser(params: {
  readonly row: UserSongRow;
  readonly tuningLabel: string;
  readonly rhythmLabel: string | null;
  readonly favorite: boolean;
  readonly currentKeyPitchClass: PitchClass | null;
  readonly currentKeyMode: SongMode | null;
}): SongSummary {
  const keyLabel = formatSongKeyLabel(params.currentKeyPitchClass, params.currentKeyMode);

  return {
    ref: createSongRef("user", params.row.id),
    title: params.row.title,
    artist: params.row.artist,
    keyLabel,
    tuningLabel: params.tuningLabel,
    rhythmLabel: params.rhythmLabel,
    difficulty: params.row.difficulty,
    origin: "user",
    isFavorite: params.favorite,
  };
}

function clampPitchClass(value: PitchClass | null | undefined): PitchClass | null {
  return value ?? null;
}

function resolveCurrentKey(params: {
  readonly originalPitchClass: PitchClass | null;
  readonly originalMode: SongMode;
  readonly preference: UserSongPreferenceRow | null;
  readonly arrangement?: CatalogSongArrangementRow | null;
}): { readonly currentKeyPitchClass: PitchClass | null; readonly currentKeyMode: SongMode; readonly semitones: number } {
  const arrangementPitchClass = params.arrangement?.key_pitch_class ?? params.originalPitchClass;
  const arrangementMode = params.arrangement?.key_mode ?? params.originalMode;

  if (params.preference?.remember_key === 1 && params.preference.remembered_key_pitch_class !== null) {
    const currentKeyPitchClass = params.preference.remembered_key_pitch_class;
    const currentKeyMode = params.preference.remembered_key_mode ?? arrangementMode;
    const semitones =
      params.originalPitchClass === null ? 0 : ((currentKeyPitchClass - params.originalPitchClass + 12) % 12);

    return {
      currentKeyPitchClass,
      currentKeyMode,
      semitones,
    };
  }

  if (arrangementPitchClass === null) {
    return {
      currentKeyPitchClass: null,
      currentKeyMode: arrangementMode,
      semitones: 0,
    };
  }

  const semitones =
    params.originalPitchClass === null ? 0 : ((arrangementPitchClass - params.originalPitchClass + 12) % 12);

  return {
    currentKeyPitchClass: arrangementPitchClass,
    currentKeyMode: arrangementMode,
    semitones,
  };
}

function buildCatalogSongSearchClause(query: string): { readonly sql: string; readonly params: readonly unknown[] } {
  return buildSongSearchClause("catalog_songs", query, {
    includeTags: true,
    includeRhythms: true,
    includeCustomRhythmName: false,
  });
}

function buildUserSongSearchClause(query: string): { readonly sql: string; readonly params: readonly unknown[] } {
  return buildSongSearchClause("user_songs", query, {
    includeTags: false,
    includeRhythms: true,
    includeCustomRhythmName: true,
  });
}

function addQueryIds(sql: string, ids: readonly string[]): string {
  const placeholders = ids.length === 0 ? "NULL" : ids.map(() => "?").join(", ");
  return sql.split("%IDS%").join(placeholders);
}

async function loadCatalogSongRows(
  database: SQLiteDatabaseLike,
  filters: SongFilters,
  query: string,
  window: { readonly limit: number; readonly offset: number },
): Promise<readonly CatalogSongRow[]> {
  let sql = SELECT_CATALOG_SONGS_BASE_SQL;
  const params: unknown[] = [];

  const filterClause = buildSongListFilters("catalog_songs", filters);
  sql += filterClause.sql;
  params.push(...filterClause.params);

  if (query.trim().length > 0) {
    const searchClause = buildCatalogSongSearchClause(query);
    sql += searchClause.sql;
    params.push(...searchClause.params);
  }

  sql += ` ORDER BY ${buildSongOrderClause("catalog_songs", "catalog")} LIMIT ? OFFSET ?`;
  params.push(window.limit, window.offset);

  return database.getAllAsync<CatalogSongRow>(sql, ...params);
}

async function loadUserSongRows(
  database: SQLiteDatabaseLike,
  filters: SongFilters,
  query: string,
  window: { readonly limit: number; readonly offset: number },
): Promise<readonly UserSongRow[]> {
  let sql = SELECT_USER_SONGS_BASE_SQL;
  const params: unknown[] = [];

  const filterClause = buildSongListFilters("user_songs", filters);
  sql += filterClause.sql;
  params.push(...filterClause.params);

  if (query.trim().length > 0) {
    const searchClause = buildUserSongSearchClause(query);
    sql += searchClause.sql;
    params.push(...searchClause.params);
  }

  sql += ` ORDER BY ${buildSongOrderClause("user_songs", "user")} LIMIT ? OFFSET ?`;
  params.push(window.limit, window.offset);

  return database.getAllAsync<UserSongRow>(sql, ...params);
}

async function loadCatalogSongArrangements(
  database: SQLiteDatabaseLike,
  songIds: readonly string[],
): Promise<ReadonlyMap<string, readonly CatalogSongArrangementRow[]>> {
  if (songIds.length === 0) {
    return new Map();
  }

  const sql = addQueryIds(SELECT_CATALOG_SONG_ARRANGEMENTS_BY_IDS_SQL, songIds);
  const rows = await database.getAllAsync<CatalogSongArrangementRow>(sql, ...songIds);
  const groups = new Map<string, CatalogSongArrangementRow[]>();

  for (const row of rows) {
    const existing = groups.get(row.song_id);
    if (existing) {
      existing.push(row);
      continue;
    }

    groups.set(row.song_id, [row]);
  }

  return groups;
}

async function loadCatalogSongArrangementsBySong(
  database: SQLiteDatabaseLike,
  songId: string,
): Promise<readonly CatalogSongArrangementRow[]> {
  return database.getAllAsync<CatalogSongArrangementRow>(SELECT_CATALOG_SONG_ARRANGEMENTS_SQL, songId);
}

async function loadCatalogSongArrangementChords(
  database: SQLiteDatabaseLike,
  arrangementId: string,
): Promise<ReadonlyMap<string, CatalogSongArrangementChordRow>> {
  const rows = await database.getAllAsync<CatalogSongArrangementChordRow>(SELECT_CATALOG_SONG_ARRANGEMENT_CHORDS_SQL, arrangementId);
  const result = new Map<string, CatalogSongArrangementChordRow>();

  for (const row of rows) {
    result.set(row.chord_id, row);
  }

  return result;
}

async function loadCatalogSongChordIndex(
  database: SQLiteDatabaseLike,
  songId: string,
): Promise<readonly CatalogSongChordIndexRow[]> {
  return database.getAllAsync<CatalogSongChordIndexRow>(SELECT_CATALOG_SONG_CHORD_INDEX_SQL, songId);
}

async function loadCatalogChordsById(
  database: SQLiteDatabaseLike,
  chordIds: readonly string[],
): Promise<ReadonlyMap<string, CatalogChordRow>> {
  if (chordIds.length === 0) {
    return new Map();
  }

  const sql = addQueryIds(SELECT_CATALOG_CHORDS_BY_IDS_SQL, chordIds);
  const rows = await database.getAllAsync<CatalogChordRow>(sql, ...chordIds);
  const result = new Map<string, CatalogChordRow>();

  for (const row of rows) {
    result.set(row.id, row);
  }

  return result;
}

async function loadCatalogSongRhythmsBySong(
  database: SQLiteDatabaseLike,
  songId: string,
): Promise<readonly CatalogSongRhythmRow[]> {
  return database.getAllAsync<CatalogSongRhythmRow>(SELECT_CATALOG_SONG_RHYTHMS_SQL, songId);
}

async function loadUserSongChordIndex(
  database: SQLiteDatabaseLike,
  songId: string,
): Promise<readonly UserSongChordIndexRow[]> {
  return database.getAllAsync<UserSongChordIndexRow>(SELECT_USER_SONG_CHORD_INDEX_SQL, songId);
}

async function loadUserFavoritesByIds(
  database: SQLiteDatabaseLike,
  origin: ContentOrigin,
  songIds: readonly string[],
): Promise<ReadonlyMap<string, FavoriteRow>> {
  if (songIds.length === 0) {
    return new Map();
  }

  const sql = addQueryIds(SELECT_USER_FAVORITES_BY_IDS_SQL, songIds);
  const rows = await database.getAllAsync<FavoriteRow>(sql, origin, ...songIds);
  const result = new Map<string, FavoriteRow>();

  for (const row of rows) {
    result.set(row.entity_id, row);
  }

  return result;
}

async function loadSongPreference(
  database: SQLiteDatabaseLike,
  origin: ContentOrigin,
  songId: string,
): Promise<SongPreferenceBundle> {
  const row = await database.getFirstAsync<UserSongPreferenceRow>(SELECT_SONG_PREFERENCE_SQL, origin, songId);
  return row ? mapPreferencesRow(row) : { preference: null, preferredShapeOverrides: new Map() };
}

async function loadSongPreferencesByIds(
  database: SQLiteDatabaseLike,
  origin: ContentOrigin,
  songIds: readonly string[],
): Promise<ReadonlyMap<string, SongPreferenceBundle>> {
  if (songIds.length === 0) {
    return new Map();
  }

  const sql = addQueryIds(SELECT_USER_SONG_PREFERENCES_BY_IDS_SQL, songIds);
  const rows = await database.getAllAsync<UserSongPreferenceRow>(sql, origin, ...songIds);
  const result = new Map<string, SongPreferenceBundle>();

  for (const row of rows) {
    result.set(row.song_id, mapPreferencesRow(row));
  }

  return result;
}

async function loadSongRhythmLabel(
  database: SQLiteDatabaseLike,
  row: CatalogSongRow,
): Promise<string | null> {
  if (row.default_rhythm_id) {
    const rhythm = await database.getFirstAsync<CatalogRhythmRow>(
      `
SELECT id, slug, name, short_description, description, origin_region, time_signature_numerator, time_signature_denominator, default_bpm, min_practice_bpm, max_recommended_bpm, pulses_per_quarter, difficulty, verification_status, reviewer_id, source_id, is_featured, sort_order, created_at, updated_at
FROM catalog_rhythms
WHERE id = ?
LIMIT 1
`.trim(),
      row.default_rhythm_id,
    );

    if (rhythm) {
      return rhythm.name;
    }
  }

  const rhythms = await loadCatalogSongRhythmsBySong(database, row.id);
  const primary = rhythms[0];

  if (!primary) {
    return null;
  }

  const rhythm = await database.getFirstAsync<CatalogRhythmRow>(
    `
SELECT id, slug, name, short_description, description, origin_region, time_signature_numerator, time_signature_denominator, default_bpm, min_practice_bpm, max_recommended_bpm, pulses_per_quarter, difficulty, verification_status, reviewer_id, source_id, is_featured, sort_order, created_at, updated_at
FROM catalog_rhythms
WHERE id = ?
LIMIT 1
`.trim(),
    primary.rhythm_id,
  );

  return rhythm ? rhythm.name : null;
}

async function loadUserSongRhythmLabel(
  database: SQLiteDatabaseLike,
  row: UserSongRow,
): Promise<string | null> {
  if (row.rhythm_id) {
    const rhythm = await database.getFirstAsync<CatalogRhythmRow>(
      `
SELECT id, slug, name, short_description, description, origin_region, time_signature_numerator, time_signature_denominator, default_bpm, min_practice_bpm, max_recommended_bpm, pulses_per_quarter, difficulty, verification_status, reviewer_id, source_id, is_featured, sort_order, created_at, updated_at
FROM catalog_rhythms
WHERE id = ?
LIMIT 1
`.trim(),
      row.rhythm_id,
    );

    if (rhythm) {
      return rhythm.name;
    }
  }

  return cleanText(row.custom_rhythm_name);
}

async function loadTuningLabel(
  repository: Pick<TuningRepository, "getByRef">,
  ref: EntityRef<"tuning">,
): Promise<string> {
  const tuning = await repository.getByRef(ref);
  if (!tuning) {
    return ref.id;
  }

  return tuning.shortName || tuning.name;
}

async function loadCatalogSongSummaries(
  database: SQLiteDatabaseLike,
  repository: Pick<TuningRepository, "getByRef">,
  filters: SongFilters,
  query: string,
  window: { readonly limit: number; readonly offset: number },
): Promise<readonly SongSummary[]> {
  const rows = await loadCatalogSongRows(database, filters, query, window);
  if (rows.length === 0) {
    return [];
  }

  const songIds = rows.map((row) => row.id);
  const arrangementsBySong = await loadCatalogSongArrangements(database, songIds);
  const favoritesBySong = await loadUserFavoritesByIds(database, "catalog", songIds);
  const preferencesBySong = await loadSongPreferencesByIds(database, "catalog", songIds);

  const songRhythmLabels = new Map<string, string | null>();
  for (const row of rows) {
    songRhythmLabels.set(row.id, await loadSongRhythmLabel(database, row));
  }

  const summaries: SongSummary[] = [];

  for (const row of rows) {
    const arrangements = arrangementsBySong.get(row.id) ?? [];
    const preference = preferencesBySong.get(row.id);
    const selectedArrangement =
      preference?.preference?.preferred_arrangement_id
        ? arrangements.find((arrangement) => arrangement.id === preference.preference?.preferred_arrangement_id) ?? arrangements[0] ?? null
        : arrangements[0] ?? null;

    const resolved = resolveCurrentKey({
      originalPitchClass: row.original_key_pitch_class,
      originalMode: row.original_key_mode,
      preference: preference?.preference ?? null,
      arrangement: selectedArrangement,
    });

    const tuningRef =
      selectedArrangement !== null
        ? createTuningRef("catalog", selectedArrangement.tuning_id)
        : createTuningRef("catalog", row.id);
    const tuningLabel = await loadTuningLabel(repository, tuningRef);

    summaries.push(
      buildSongSummaryFromCatalog({
        row,
        tuningLabel,
        rhythmLabel: songRhythmLabels.get(row.id) ?? null,
        favorite: favoritesBySong.has(row.id),
        currentKeyPitchClass: resolved.currentKeyPitchClass,
        currentKeyMode: resolved.currentKeyMode,
      }),
    );
  }

  return summaries;
}

async function loadUserSongSummaries(
  database: SQLiteDatabaseLike,
  repository: Pick<TuningRepository, "getByRef">,
  filters: SongFilters,
  query: string,
  window: { readonly limit: number; readonly offset: number },
): Promise<readonly SongSummary[]> {
  const rows = await loadUserSongRows(database, filters, query, window);
  if (rows.length === 0) {
    return [];
  }

  const songIds = rows.map((row) => row.id);
  const favoritesBySong = await loadUserFavoritesByIds(database, "user", songIds);
  const preferencesBySong = await loadSongPreferencesByIds(database, "user", songIds);

  const summaries: SongSummary[] = [];

  for (const row of rows) {
    const preference = preferencesBySong.get(row.id)?.preference ?? null;
    const resolved = resolveCurrentKey({
      originalPitchClass: row.original_key_pitch_class,
      originalMode: row.original_key_mode,
      preference,
    });
    const tuningLabel = await loadTuningLabel(repository, createTuningRef(row.tuning_origin, row.tuning_id));
    const rhythmLabel = await loadUserSongRhythmLabel(database, row);

    summaries.push(
      buildSongSummaryFromUser({
        row,
        tuningLabel,
        rhythmLabel,
        favorite: favoritesBySong.has(row.id),
        currentKeyPitchClass: resolved.currentKeyPitchClass,
        currentKeyMode: resolved.currentKeyMode,
      }),
    );
  }

  return summaries;
}

function filterAndSortSongSummaries(
  summaries: readonly SongSummary[],
  query: string,
  window: { readonly limit: number; readonly offset: number },
): readonly SongSummary[] {
  const scored = [...summaries].map((summary) => ({
    summary,
    score: scoreSongSummary(summary, query),
  }));

  if (normalizeSearchText(query).length > 0) {
    scored.sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return sortSongSummaries(left.summary, right.summary);
    });
  } else {
    scored.sort((left, right) => sortSongSummaries(left.summary, right.summary));
  }

  return scored.slice(window.offset, window.offset + window.limit).map(({ summary }) => summary);
}

async function buildSongViewModelFromCatalog(
  database: SQLiteDatabaseLike,
  repository: Pick<TuningRepository, "getByRef">,
  row: CatalogSongRow,
  preferenceBundle: SongPreferenceBundle,
): Promise<SongViewModel> {
  const arrangements = await loadCatalogSongArrangementsBySong(database, row.id);
  const selectedArrangement =
    preferenceBundle.preference?.preferred_arrangement_id
      ? arrangements.find((arrangement) => arrangement.id === preferenceBundle.preference?.preferred_arrangement_id) ?? arrangements[0] ?? null
      : arrangements[0] ?? null;

  const resolved = resolveCurrentKey({
    originalPitchClass: row.original_key_pitch_class,
    originalMode: row.original_key_mode,
    preference: preferenceBundle.preference,
    arrangement: selectedArrangement,
  });

  const rhythmLabel = await loadSongRhythmLabel(database, row);
  const document = SongDocumentSchema.parse(JSON.parse(row.document_json) as unknown);
  const transposedDocument = transposeIfNeeded(document, resolved.semitones);

  const tuning =
    selectedArrangement !== null
      ? createTuningRef("catalog", selectedArrangement.tuning_id)
      : createTuningRef("catalog", row.id);
  const tuningDetails = await repository.getByRef(tuning);
  if (!tuningDetails) {
    throw new RepositoryError("TUNING_NOT_FOUND", `Tuning not found for song '${row.id}'.`);
  }

  const chordIndexes = await loadCatalogSongChordIndex(database, row.id);
  const chordIds = chordIndexes.map((entry) => entry.chord_id);
  const chordsById = await loadCatalogChordsById(database, chordIds);
  const arrangementChordMap = selectedArrangement
    ? await loadCatalogSongArrangementChords(database, selectedArrangement.id)
    : new Map<string, CatalogSongArrangementChordRow>();
  const preferredShapeOverrides = preferenceBundle.preferredShapeOverrides;

  const chordUsages: SongChordUsage[] = [];
  for (const entry of chordIndexes) {
    const chord = chordsById.get(entry.chord_id);
    if (!chord) {
      continue;
    }

    const originalChord = {
      rootPitchClass: chord.root_pitch_class,
      qualityId: chord.quality_id,
      bassPitchClass: chord.bass_pitch_class,
    } satisfies SongChordUsage["chord"];
    const usageChord = transposeUsageChord(originalChord, resolved.semitones);
    const signature = buildChordSignature(usageChord);
    const override = preferredShapeOverrides.get(signature) ?? null;
    chordUsages.push(
      toSongUsage(
        {
          chord: usageChord,
          occurrenceCount: entry.occurrence_count,
          preferredShape: null,
          status: arrangementChordMap.get(entry.chord_id)?.status ?? "missing",
        },
        0,
        override,
      ),
    );
  }

  return {
    ref: createSongRef("catalog", row.id),
    title: row.title,
    artist: row.artist,
    composer: row.composer,
    currentKeyPitchClass: resolved.currentKeyPitchClass,
    originalKeyPitchClass: row.original_key_pitch_class,
    mode: resolved.currentKeyMode,
    tuning: createTuningRef(tuningDetails.origin, tuningDetails.id),
    arrangementStatus: selectedArrangement?.arrangement_status ?? "unavailable",
    rhythm: rhythmLabel
      ? {
          id: row.default_rhythm_id ?? selectedArrangement?.id ?? row.id,
          name: rhythmLabel,
          bpm: selectedArrangement?.recommended_bpm ?? row.default_bpm ?? null,
        }
      : null,
    document: transposedDocument,
    chordUsages,
  };
}

async function buildSongViewModelFromUser(
  database: SQLiteDatabaseLike,
  repository: Pick<TuningRepository, "getByRef">,
  row: UserSongRow,
  preferenceBundle: SongPreferenceBundle,
): Promise<SongViewModel> {
  const resolved = resolveCurrentKey({
    originalPitchClass: row.original_key_pitch_class,
    originalMode: row.original_key_mode,
    preference: preferenceBundle.preference,
  });

  const document = SongDocumentSchema.parse(JSON.parse(row.document_json) as unknown);
  const transposedDocument = transposeIfNeeded(document, resolved.semitones);
  const tuningDetails = await repository.getByRef(createTuningRef(row.tuning_origin, row.tuning_id));
  if (!tuningDetails) {
    throw new RepositoryError("TUNING_NOT_FOUND", `Tuning not found for song '${row.id}'.`);
  }

  const chordIndexes = await loadUserSongChordIndex(database, row.id);
  const chordUsages: SongChordUsage[] = chordIndexes.map((entry) => {
    const originalChord = {
      rootPitchClass: entry.root_pitch_class,
      qualityId: entry.quality_id,
      bassPitchClass: entry.bass_pitch_class,
    } satisfies SongChordUsage["chord"];
    const usageChord = transposeUsageChord(originalChord, resolved.semitones);
    const override = preferenceBundle.preferredShapeOverrides.get(buildChordSignature(usageChord)) ?? null;

    return toSongUsage(
      {
        chord: usageChord,
        occurrenceCount: entry.occurrence_count,
        preferredShape: null,
        status: "symbol_only",
      },
      0,
      override,
    );
  });

  const rhythmLabel = await loadUserSongRhythmLabel(database, row);

  return {
    ref: createSongRef("user", row.id),
    title: row.title,
    artist: row.artist,
    composer: row.composer,
    currentKeyPitchClass: resolved.currentKeyPitchClass,
    originalKeyPitchClass: row.original_key_pitch_class,
    mode: resolved.currentKeyMode,
    tuning: createTuningRef(tuningDetails.origin, tuningDetails.id),
    arrangementStatus: "symbols_only",
    rhythm: rhythmLabel
      ? {
          id: row.rhythm_id ?? row.id,
          name: rhythmLabel,
          bpm: row.bpm,
        }
      : null,
    document: transposedDocument,
    chordUsages,
  };
}

function buildSongVersionSnapshot(
  row: UserSongRow,
  document: SongDocument,
  reason: UserSongVersionRow["change_reason"],
): string {
  return JSON.stringify({
    song: toSongRecord(row),
    document,
    reason,
  });
}

function buildUserSongSearchText(input: SaveUserSongInput, document: SongDocument): string {
  const documentText = buildDocumentSearchText(document);
  return buildSongSearchText([
    input.title,
    input.artist,
    input.composer,
    input.customRhythmName,
    input.searchText ?? null,
    documentText,
  ]);
}

function countSongVersions(database: SQLiteDatabaseLike, songId: string): Promise<{ readonly version_number: number } | null> {
  return database.getFirstAsync<{ readonly version_number: number }>(SELECT_USER_SONG_VERSION_MAX_SQL, songId);
}

function normalizeSongDraftInput(input: SongDraftInput, now: string, idFactory: () => string): UserSongDraftRow {
  return {
    id: input.id ?? idFactory(),
    song_id: input.songId ?? null,
    draft_type: input.draftType,
    title: cleanText(input.title) ?? null,
    form_state_json: input.formStateJson,
    document_format_version: input.documentFormatVersion,
    document_json: input.documentJson,
    last_saved_at: now,
    created_at: now,
    recovery_status: input.recoveryStatus ?? "active",
  };
}

function toDraftRecord(row: UserSongDraftRow): SongDraftRecord {
  return createSongDraftRecord(row);
}

export function createSongRepository(
  database: SQLiteDatabaseLike,
  options: SongRepositoryOptions,
): SongRepository {
  const tuningRepository = options.tuningRepository;
  const now = createNowProvider(options.now);
  const idFactory = createIdFactory(options.idFactory);

  async function list(filters: SongFilters = {}): Promise<readonly SongSummary[]> {
    try {
      const window = buildPaginationWindow({
        limit: filters.limit,
        offset: filters.offset,
        fallbackLimit: DEFAULT_LIST_LIMIT,
      });

      const query = "";
      const origin = filters.origin ?? "all";

      const catalogWindow =
        origin === "all"
          ? {
              limit: window.limit + window.offset,
              offset: 0,
            }
          : window;

      const userWindow =
        origin === "all"
          ? {
              limit: window.limit + window.offset,
              offset: 0,
            }
          : window;

      const [catalog, user] = await Promise.all([
        origin === "user" ? Promise.resolve<readonly SongSummary[]>([]) : loadCatalogSongSummaries(database, tuningRepository, filters, query, catalogWindow),
        origin === "catalog" ? Promise.resolve<readonly SongSummary[]>([]) : loadUserSongSummaries(database, tuningRepository, filters, query, userWindow),
      ]);

      const combined = [...catalog, ...user];
      const sorted = combined.sort(sortSongSummaries);
      const sliceEnd = origin === "all" ? window.offset + window.limit : window.limit;
      const sliceStart = origin === "all" ? window.offset : 0;
      return sorted.slice(sliceStart, sliceEnd);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to list songs.");
    }
  }

  async function search(query: string, filters: SongFilters = {}): Promise<readonly SongSummary[]> {
    try {
      const window = buildPaginationWindow({
        limit: filters.limit,
        offset: filters.offset,
        fallbackLimit: DEFAULT_SEARCH_FETCH_LIMIT,
      });

      if (normalizeSearchText(query).length === 0) {
        return list(filters);
      }

      const origin = filters.origin ?? "all";
      const fetchWindow =
        origin === "all"
          ? {
              limit: window.limit + window.offset,
              offset: 0,
            }
          : window;

      const [catalog, user] = await Promise.all([
        origin === "user" ? Promise.resolve<readonly SongSummary[]>([]) : loadCatalogSongSummaries(database, tuningRepository, filters, query, fetchWindow),
        origin === "catalog" ? Promise.resolve<readonly SongSummary[]>([]) : loadUserSongSummaries(database, tuningRepository, filters, query, fetchWindow),
      ]);

      const combined = filterAndSortSongSummaries([...catalog, ...user], query, window);
      return combined;
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to search songs.");
    }
  }

  async function getByRef(ref: EntityRef<"song">): Promise<SongViewModel | null> {
    try {
      if (ref.origin === "catalog") {
        const row = await database.getFirstAsync<CatalogSongRow>(SELECT_CATALOG_SONG_BY_ID_SQL, ref.id);
        if (!row) {
          return null;
        }

        const preferenceBundle = await loadSongPreference(database, "catalog", row.id);
        return buildSongViewModelFromCatalog(database, tuningRepository, row, preferenceBundle);
      }

      const row = await database.getFirstAsync<UserSongRow>(SELECT_USER_SONG_BY_ID_SQL, ref.id);
      if (!row || row.deleted_at !== null) {
        return null;
      }

      const preferenceBundle = await loadSongPreference(database, "user", row.id);
      return buildSongViewModelFromUser(database, tuningRepository, row, preferenceBundle);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to load song ${ref.origin}:${ref.id}.`);
    }
  }

  async function saveUserSong(input: SaveUserSongInput): Promise<UserSongRecord> {
    try {
      return withDatabaseTransaction(database, async (transactionalDatabase) => {
        const parsed = SongDocumentSchema.safeParse(input.document);
        if (!parsed.success) {
          throw new RepositoryError("DATABASE_ERROR", "Song document is invalid.", parsed.error);
        }

        const title = cleanText(input.title);
        if (!title) {
          throw new RepositoryError("DATABASE_ERROR", "Song title is required.");
        }

        const tuning = await tuningRepository.getByRef(input.tuning);
        if (!tuning) {
          throw new RepositoryError("TUNING_NOT_FOUND", `Tuning not found: ${input.tuning.origin}:${input.tuning.id}`);
        }

        if (input.rhythmId) {
          const rhythm = await transactionalDatabase.getFirstAsync<CatalogRhythmRow>(
            `
SELECT id, slug, name, short_description, description, origin_region, time_signature_numerator, time_signature_denominator, default_bpm, min_practice_bpm, max_recommended_bpm, pulses_per_quarter, difficulty, verification_status, reviewer_id, source_id, is_featured, sort_order, created_at, updated_at
FROM catalog_rhythms
WHERE id = ?
LIMIT 1
`.trim(),
            input.rhythmId,
          );

          if (!rhythm) {
            throw new RepositoryError("DATABASE_ERROR", `Rhythm not found: ${input.rhythmId}`);
          }
        }

        const nowStamp = input.now ?? now();
        const songId = input.id ?? idFactory();
        const document = parsed.data;
        const searchText = buildUserSongSearchText(input, document);
        const normalizedTitle = normalizeSearchText(title);
        const normalizedArtist = normalizeSearchText(input.artist ?? "");
        const existingRow = await transactionalDatabase.getFirstAsync<UserSongRow>(SELECT_USER_SONG_BY_ID_SQL, songId);
        const createdAt = existingRow?.created_at ?? nowStamp;
        const deletedAt = null;

        const row: UserSongRow = {
          id: songId,
          title,
          normalized_title: normalizedTitle,
          artist: cleanText(input.artist),
          normalized_artist: normalizedArtist.length > 0 ? normalizedArtist : null,
          composer: cleanText(input.composer),
          copyright_confirmation: input.copyrightConfirmation,
          original_key_pitch_class: clampPitchClass(input.originalKeyPitchClass ?? null),
          original_key_mode: normalizeKeyMode(input.originalKeyMode),
          tuning_origin: input.tuning.origin,
          tuning_id: input.tuning.id,
          rhythm_id: input.rhythmId ?? null,
          custom_rhythm_name: cleanText(input.customRhythmName),
          bpm: input.bpm ?? null,
          time_signature_numerator: input.timeSignatureNumerator ?? null,
          time_signature_denominator: input.timeSignatureDenominator ?? null,
          capo_fret: Math.min(15, Math.max(0, Math.floor(input.capoFret ?? 0))),
          difficulty: input.difficulty ?? null,
          document_format_version: document.version,
          document_json: JSON.stringify(document),
          search_text: searchText,
          created_at: createdAt,
          updated_at: nowStamp,
          deleted_at: deletedAt,
        };

        await transactionalDatabase.runAsync(
          UPSERT_USER_SONG_SQL,
          row.id,
          row.title,
          row.normalized_title,
          row.artist,
          row.normalized_artist,
          row.composer,
          row.copyright_confirmation,
          row.original_key_pitch_class,
          row.original_key_mode,
          row.tuning_origin,
          row.tuning_id,
          row.rhythm_id,
          row.custom_rhythm_name,
          row.bpm,
          row.time_signature_numerator,
          row.time_signature_denominator,
          row.capo_fret,
          row.difficulty,
          row.document_format_version,
          row.document_json,
          row.search_text,
          row.created_at,
          row.updated_at,
          row.deleted_at,
        );

        await transactionalDatabase.runAsync(`DELETE FROM user_song_chord_index WHERE song_id = ?`, row.id);

        const chordUsageMap = new Map<string, { readonly chord: { readonly rootPitchClass: PitchClass; readonly qualityId: string; readonly bassPitchClass: PitchClass | null }; readonly firstOccurrenceOrder: number; readonly occurrenceCount: number }>();
        let occurrenceOrder = 0;

        for (const section of document.sections) {
          for (const line of section.lines) {
            for (const segment of line.segments) {
              if (segment.type !== "chord") {
                continue;
              }

              const key = buildChordSignature(segment.chord);
              const current = chordUsageMap.get(key);
              if (current) {
                chordUsageMap.set(key, {
                  ...current,
                  occurrenceCount: current.occurrenceCount + 1,
                });
                continue;
              }

              chordUsageMap.set(key, {
                chord: {
                  rootPitchClass: segment.chord.rootPitchClass,
                  qualityId: segment.chord.qualityId,
                  bassPitchClass: segment.chord.bassPitchClass ?? null,
                },
                firstOccurrenceOrder: occurrenceOrder,
                occurrenceCount: 1,
              });
              occurrenceOrder += 1;
            }
          }
        }

        for (const entry of chordUsageMap.values()) {
          await transactionalDatabase.runAsync(
            INSERT_USER_SONG_CHORD_INDEX_SQL,
            row.id,
            entry.chord.rootPitchClass,
            entry.chord.qualityId,
            entry.chord.bassPitchClass,
            entry.firstOccurrenceOrder,
            entry.occurrenceCount,
          );
        }

        const nextVersionRow = await countSongVersions(transactionalDatabase, row.id);
        const nextVersion = (nextVersionRow?.version_number ?? 0) + 1;
        await transactionalDatabase.runAsync(
          INSERT_USER_SONG_VERSION_SQL,
          idFactory(),
          row.id,
          nextVersion,
          buildSongVersionSnapshot(row, document, existingRow ? "manual_save" : "import"),
          existingRow ? "manual_save" : "import",
          nowStamp,
        );

        const persisted = await transactionalDatabase.getFirstAsync<UserSongRow>(SELECT_USER_SONG_BY_ID_SQL, row.id);
        if (!persisted) {
          throw new RepositoryError("DATABASE_ERROR", "Saved song could not be reloaded.");
        }

        return toSongRecord(persisted);
      });
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to save user song.");
    }
  }

  async function softDeleteUserSong(id: string): Promise<void> {
    try {
      await withDatabaseTransaction(database, async (transactionalDatabase) => {
        const existing = await transactionalDatabase.getFirstAsync<UserSongRow>(SELECT_USER_SONG_BY_ID_SQL, id);
        if (!existing || existing.deleted_at !== null) {
          return;
        }

        const nowStamp = now();
        const document = SongDocumentSchema.parse(JSON.parse(existing.document_json) as unknown);
        const nextVersionRow = await countSongVersions(transactionalDatabase, id);
        const nextVersion = (nextVersionRow?.version_number ?? 0) + 1;

        await transactionalDatabase.runAsync(SOFT_DELETE_USER_SONG_SQL, nowStamp, nowStamp, id);
        await transactionalDatabase.runAsync(
          INSERT_USER_SONG_VERSION_SQL,
          idFactory(),
          id,
          nextVersion,
          buildSongVersionSnapshot(existing, document, "before_delete"),
          "before_delete",
          nowStamp,
        );
      });
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to delete user song ${id}.`);
    }
  }

  async function saveUserSongDraft(input: SongDraftInput): Promise<SongDraftRecord> {
    try {
      const nowStamp = input.now ?? now();
      const row = normalizeSongDraftInput(input, nowStamp, idFactory);
      await database.runAsync(
        UPSERT_USER_SONG_DRAFT_SQL,
        row.id,
        row.song_id,
        row.draft_type,
        row.title,
        row.form_state_json,
        row.document_format_version,
        row.document_json,
        row.last_saved_at,
        row.created_at,
        row.recovery_status,
      );

      return toDraftRecord(row);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to save song draft.");
    }
  }

  async function listUserSongDrafts(songId?: string | null): Promise<readonly SongDraftRecord[]> {
    try {
      let sql = SELECT_USER_SONG_DRAFTS_SQL;
      const params: unknown[] = [];

      if (songId !== undefined) {
        sql += " AND song_id = ?";
        params.push(songId);
      }

      sql += " ORDER BY last_saved_at DESC, created_at DESC, id ASC";

      const rows = await database.getAllAsync<UserSongDraftRow>(sql, ...params);
      return rows.map(toDraftRecord);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to list song drafts.");
    }
  }

  async function discardUserSongDraft(id: string): Promise<void> {
    try {
      const existing = await database.getFirstAsync<UserSongDraftRow>(SELECT_USER_SONG_DRAFT_BY_ID_SQL, id);
      if (!existing) {
        return;
      }

      await database.runAsync(
        UPSERT_USER_SONG_DRAFT_SQL,
        existing.id,
        existing.song_id,
        existing.draft_type,
        existing.title,
        existing.form_state_json,
        existing.document_format_version,
        existing.document_json,
        existing.last_saved_at,
        existing.created_at,
        "discarded",
      );
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to discard song draft ${id}.`);
    }
  }

  return {
    list,
    search,
    getByRef,
    saveUserSong,
    softDeleteUserSong,
    saveUserSongDraft,
    listUserSongDrafts,
    discardUserSongDraft,
  };
}
