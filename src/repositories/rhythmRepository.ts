import { createTuningRef } from "@/repositories/contracts";
import { toRepositoryError } from "@/repositories/contracts/errors";
import type { SQLiteDatabaseLike } from "@/types/database";
import type {
  ContentOrigin,
  DifficultyLevel,
  EntityRef,
  TimeSignatureDenominator,
} from "@/types/music";
import { buildContainsLikePattern, normalizeSearchText, splitSearchTerms } from "@/database/queries";
import { buildPaginationWindow } from "@/database/queries";

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

interface FavoriteRow {
  readonly id: string;
  readonly entity_type: "rhythm";
  readonly entity_origin: ContentOrigin;
  readonly entity_id: string;
  readonly created_at: string;
}

export interface RhythmStepView {
  readonly id: string;
  readonly patternId: string;
  readonly stepOrder: number;
  readonly positionTicks: number;
  readonly durationTicks: number;
  readonly beatLabel: string | null;
  readonly direction: "down" | "up" | "none";
  readonly action: "strike" | "mute" | "percussion" | "rest" | "brush" | "pluck";
  readonly handPart: "thumb" | "index" | "middle" | "ring" | "multiple" | "unspecified";
  readonly stringRangeFrom: number | null;
  readonly stringRangeTo: number | null;
  readonly intensity: number;
  readonly isAccent: boolean;
  readonly label: string | null;
}

export interface RhythmAudioView {
  readonly id: string;
  readonly rhythmId: string;
  readonly patternId: string | null;
  readonly assetId: string;
  readonly role: "slow" | "normal" | "metronome" | "count_in" | "demonstration";
  readonly bpm: number | null;
  readonly sortOrder: number;
}

export interface RhythmPatternView {
  readonly ref: EntityRef<"rhythm_pattern">;
  readonly rhythmRef: EntityRef<"rhythm">;
  readonly name: string;
  readonly level: DifficultyLevel;
  readonly handMode: "neutral" | "right_hand_reference";
  readonly totalTicks: number;
  readonly bars: number;
  readonly isPrimary: boolean;
  readonly sortOrder: number;
  readonly notes: string | null;
  readonly steps: readonly RhythmStepView[];
  readonly audio: readonly RhythmAudioView[];
}

export interface RhythmExerciseView {
  readonly ref: EntityRef<"exercise">;
  readonly title: string;
  readonly description: string;
  readonly exerciseType:
    | "single_chord"
    | "chord_change"
    | "progression"
    | "rhythm"
    | "scale"
    | "coordination"
    | "barre";
  readonly tuningRef: EntityRef<"tuning"> | null;
  readonly rhythmRef: EntityRef<"rhythm"> | null;
  readonly patternRef: EntityRef<"rhythm_pattern"> | null;
  readonly difficulty: DifficultyLevel;
  readonly defaultBpm: number | null;
  readonly minBpm: number | null;
  readonly maxBpm: number | null;
  readonly durationSeconds: number | null;
  readonly verificationStatus: "verified" | "deprecated";
  readonly sortOrder: number;
}

export interface RhythmSummary {
  readonly ref: EntityRef<"rhythm">;
  readonly name: string;
  readonly shortDescription: string;
  readonly timeSignatureNumerator: number;
  readonly timeSignatureDenominator: TimeSignatureDenominator;
  readonly timeSignatureLabel: string;
  readonly bpm: number;
  readonly difficulty: DifficultyLevel;
  readonly originRegion: string | null;
  readonly isFavorite: boolean;
  readonly previewPattern: RhythmPatternView | null;
}

export interface RhythmDetail extends RhythmSummary {
  readonly description: string | null;
  readonly minPracticeBpm: number;
  readonly maxRecommendedBpm: number;
  readonly pulsesPerQuarter: number;
  readonly patterns: readonly RhythmPatternView[];
  readonly exercises: readonly RhythmExerciseView[];
  readonly audio: readonly RhythmAudioView[];
}

export interface RhythmFilters {
  readonly origin?: ContentOrigin | "all";
  readonly difficulty?: DifficultyLevel | "all";
  readonly timeSignatureNumerator?: number | "all";
  readonly timeSignatureDenominator?: TimeSignatureDenominator | "all";
  readonly favorite?: boolean;
  readonly limit?: number;
  readonly offset?: number;
}

export interface RhythmRepository {
  list(filters?: RhythmFilters): Promise<readonly RhythmSummary[]>;
  search(query: string, filters?: RhythmFilters): Promise<readonly RhythmSummary[]>;
  getByRef(ref: EntityRef<"rhythm">): Promise<RhythmDetail | null>;
}

interface RhythmRepositoryOptions {
  readonly now?: () => string;
}

const DEFAULT_LIST_LIMIT = 20;
const DEFAULT_SEARCH_FETCH_LIMIT = 60;

const SELECT_RHYTHMS_BASE_SQL = `
SELECT
  id,
  slug,
  name,
  short_description,
  description,
  origin_region,
  time_signature_numerator,
  time_signature_denominator,
  default_bpm,
  min_practice_bpm,
  max_recommended_bpm,
  pulses_per_quarter,
  difficulty,
  verification_status,
  reviewer_id,
  source_id,
  is_featured,
  sort_order,
  created_at,
  updated_at
FROM catalog_rhythms
WHERE 1 = 1
`.trim();

const SELECT_RHYTHM_BY_ID_SQL = `${SELECT_RHYTHMS_BASE_SQL} AND id = ? LIMIT 1`;

const SELECT_RHYTHM_PATTERNS_BY_RHYTHM_IDS_SQL = `
SELECT
  id,
  rhythm_id,
  name,
  level,
  hand_mode,
  total_ticks,
  bars,
  is_primary,
  sort_order,
  notes
FROM catalog_rhythm_patterns
WHERE rhythm_id IN (%IDS%)
ORDER BY rhythm_id, is_primary DESC, sort_order ASC, name ASC, id ASC
`.trim();

const SELECT_RHYTHM_PATTERNS_SQL = `
SELECT
  id,
  rhythm_id,
  name,
  level,
  hand_mode,
  total_ticks,
  bars,
  is_primary,
  sort_order,
  notes
FROM catalog_rhythm_patterns
WHERE rhythm_id = ?
ORDER BY is_primary DESC, sort_order ASC, name ASC, id ASC
`.trim();

const SELECT_RHYTHM_STEPS_BY_PATTERN_IDS_SQL = `
SELECT
  id,
  pattern_id,
  step_order,
  position_ticks,
  duration_ticks,
  beat_label,
  direction,
  action,
  hand_part,
  string_range_from,
  string_range_to,
  intensity,
  is_accent,
  label
FROM catalog_rhythm_steps
WHERE pattern_id IN (%IDS%)
ORDER BY pattern_id, step_order ASC, id ASC
`.trim();

const SELECT_RHYTHM_AUDIO_BY_RHYTHM_IDS_SQL = `
SELECT
  id,
  rhythm_id,
  pattern_id,
  asset_id,
  role,
  bpm,
  sort_order
FROM catalog_rhythm_audio
WHERE rhythm_id IN (%IDS%)
ORDER BY rhythm_id, sort_order ASC, id ASC
`.trim();

const SELECT_RHYTHM_AUDIO_SQL = `
SELECT
  id,
  rhythm_id,
  pattern_id,
  asset_id,
  role,
  bpm,
  sort_order
FROM catalog_rhythm_audio
WHERE rhythm_id = ?
ORDER BY sort_order ASC, id ASC
`.trim();

const SELECT_RHYTHM_EXERCISES_SQL = `
SELECT
  id,
  title,
  description,
  exercise_type,
  tuning_id,
  rhythm_id,
  pattern_id,
  difficulty,
  default_bpm,
  min_bpm,
  max_bpm,
  duration_seconds,
  verification_status,
  sort_order,
  created_at,
  updated_at
FROM catalog_exercises
WHERE rhythm_id = ? OR pattern_id IN (%IDS%)
ORDER BY sort_order ASC, title ASC, id ASC
`.trim();

const SELECT_RHYTHM_FAVORITES_BY_IDS_SQL = `
SELECT
  id,
  entity_type,
  entity_origin,
  entity_id,
  created_at
FROM user_favorites
WHERE entity_type = 'rhythm' AND entity_origin = 'catalog' AND entity_id IN (%IDS%)
`.trim();

function createSongRef(origin: ContentOrigin, id: string): EntityRef<"rhythm"> {
  return {
    type: "rhythm",
    origin,
    id,
  };
}

function normalizeTimeSignatureLabel(numerator: number, denominator: TimeSignatureDenominator): string {
  return `${numerator}/${denominator}`;
}

function buildRhythmSearchText(value: string): string {
  return normalizeSearchText(value);
}

function createNowProvider(now?: () => string): () => string {
  return now ?? (() => new Date().toISOString());
}

function addQueryIds(sql: string, ids: readonly string[]): string {
  const placeholders = ids.length === 0 ? "NULL" : ids.map(() => "?").join(", ");
  return sql.split("%IDS%").join(placeholders);
}

function buildRhythmOrderClause(alias: string): string {
  return `${alias}.is_featured DESC, ${alias}.sort_order ASC, ${alias}.name ASC, ${alias}.id ASC`;
}

function buildRhythmListFilters(
  alias: string,
  filters: RhythmFilters,
): { readonly sql: string; readonly params: readonly unknown[] } {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.difficulty && filters.difficulty !== "all") {
    clauses.push(`${alias}.difficulty = ?`);
    params.push(filters.difficulty);
  }

  if (filters.timeSignatureNumerator !== undefined && filters.timeSignatureNumerator !== "all") {
    clauses.push(`${alias}.time_signature_numerator = ?`);
    params.push(filters.timeSignatureNumerator);
  }

  if (filters.timeSignatureDenominator !== undefined && filters.timeSignatureDenominator !== "all") {
    clauses.push(`${alias}.time_signature_denominator = ?`);
    params.push(filters.timeSignatureDenominator);
  }

  if (filters.favorite !== undefined) {
    const favoriteSql = `EXISTS (
      SELECT 1
      FROM user_favorites favorites
      WHERE favorites.entity_type = 'rhythm'
        AND favorites.entity_origin = 'catalog'
        AND favorites.entity_id = ${alias}.id
    )`;
    clauses.push(filters.favorite ? favoriteSql : `NOT ${favoriteSql}`);
  }

  return {
    sql: clauses.length > 0 ? ` AND ${clauses.map((clause) => `(${clause})`).join(" AND ")}` : "",
    params,
  };
}

function buildRhythmSearchClause(
  alias: string,
  query: string,
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
    clauses.push(`(
      LOWER(${alias}.name) LIKE ? ESCAPE '\\'
      OR LOWER(COALESCE(${alias}.short_description, '')) LIKE ? ESCAPE '\\'
      OR LOWER(COALESCE(${alias}.description, '')) LIKE ? ESCAPE '\\'
      OR LOWER(COALESCE(${alias}.origin_region, '')) LIKE ? ESCAPE '\\'
      OR EXISTS (
        SELECT 1
        FROM catalog_rhythm_tags rhythm_tags
        JOIN catalog_tags tags ON tags.id = rhythm_tags.tag_id
        WHERE rhythm_tags.entity_id = ${alias}.id
          AND (LOWER(tags.label) LIKE ? ESCAPE '\\' OR LOWER(tags.slug) LIKE ? ESCAPE '\\')
      )
    )`);
    params.push(pattern, pattern, pattern, pattern, pattern, pattern);
  }

  return {
    sql: ` AND (${clauses.join(" AND ")})`,
    params,
  };
}

function mapFavoriteRows(rows: readonly FavoriteRow[]): ReadonlySet<string> {
  return new Set(rows.map((row) => row.entity_id));
}

function mapStepRow(row: CatalogRhythmStepRow): RhythmStepView {
  return {
    id: row.id,
    patternId: row.pattern_id,
    stepOrder: row.step_order,
    positionTicks: row.position_ticks,
    durationTicks: row.duration_ticks,
    beatLabel: row.beat_label,
    direction: row.direction,
    action: row.action,
    handPart: row.hand_part,
    stringRangeFrom: row.string_range_from,
    stringRangeTo: row.string_range_to,
    intensity: row.intensity,
    isAccent: row.is_accent === 1,
    label: row.label,
  };
}

function mapAudioRow(row: CatalogRhythmAudioRow): RhythmAudioView {
  return {
    id: row.id,
    rhythmId: row.rhythm_id,
    patternId: row.pattern_id,
    assetId: row.asset_id,
    role: row.role,
    bpm: row.bpm,
    sortOrder: row.sort_order,
  };
}

function mapExerciseRow(row: CatalogExerciseRow): RhythmExerciseView {
  return {
    ref: {
      type: "exercise",
      origin: "catalog",
      id: row.id,
    },
    title: row.title,
    description: row.description,
    exerciseType: row.exercise_type,
    tuningRef: row.tuning_id ? createTuningRef("catalog", row.tuning_id) : null,
    rhythmRef: row.rhythm_id ? createSongRef("catalog", row.rhythm_id) : null,
    patternRef: row.pattern_id ? { type: "rhythm_pattern", origin: "catalog", id: row.pattern_id } : null,
    difficulty: row.difficulty,
    defaultBpm: row.default_bpm,
    minBpm: row.min_bpm,
    maxBpm: row.max_bpm,
    durationSeconds: row.duration_seconds,
    verificationStatus: row.verification_status,
    sortOrder: row.sort_order,
  };
}

function sortRhythmSummaries(left: RhythmSummary, right: RhythmSummary): number {
  if (left.isFavorite !== right.isFavorite) {
    return left.isFavorite ? -1 : 1;
  }

  if (left.difficulty !== right.difficulty) {
    const rank: Readonly<Record<DifficultyLevel, number>> = {
      beginner: 0,
      easy: 1,
      intermediate: 2,
      advanced: 3,
    };

    return rank[left.difficulty] - rank[right.difficulty];
  }

  if (left.bpm !== right.bpm) {
    return left.bpm - right.bpm;
  }

  return left.name.localeCompare(right.name) || left.ref.id.localeCompare(right.ref.id);
}

function scoreRhythmSummary(summary: RhythmSummary, query: string): number {
  const normalizedQuery = buildRhythmSearchText(query);

  if (normalizedQuery.length === 0) {
    return 0;
  }

  const haystack = normalizeSearchText(
    [
      summary.name,
      summary.shortDescription,
      summary.originRegion,
      summary.timeSignatureLabel,
      String(summary.bpm),
      summary.previewPattern?.name,
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

function buildPreviewPattern(params: {
  readonly rhythm: CatalogRhythmRow;
  readonly pattern: CatalogRhythmPatternRow | null;
  readonly steps: readonly CatalogRhythmStepRow[];
  readonly audio: readonly CatalogRhythmAudioRow[];
}): RhythmPatternView | null {
  if (!params.pattern) {
    return null;
  }

  const patternAudio = params.audio
    .filter((row) => row.pattern_id === params.pattern?.id)
    .map(mapAudioRow);

  return {
    ref: {
      type: "rhythm_pattern",
      origin: "catalog",
      id: params.pattern.id,
    },
    rhythmRef: createSongRef("catalog", params.rhythm.id),
    name: params.pattern.name,
    level: params.pattern.level,
    handMode: params.pattern.hand_mode,
    totalTicks: params.pattern.total_ticks,
    bars: params.pattern.bars,
    isPrimary: params.pattern.is_primary === 1,
    sortOrder: params.pattern.sort_order,
    notes: params.pattern.notes,
    steps: params.steps.map(mapStepRow),
    audio: patternAudio,
  };
}

function buildRhythmDetailPattern(
  rhythm: CatalogRhythmRow,
  pattern: CatalogRhythmPatternRow,
  steps: readonly CatalogRhythmStepRow[],
  audio: readonly CatalogRhythmAudioRow[],
): RhythmPatternView {
  return {
    ref: {
      type: "rhythm_pattern",
      origin: "catalog",
      id: pattern.id,
    },
    rhythmRef: createSongRef("catalog", rhythm.id),
    name: pattern.name,
    level: pattern.level,
    handMode: pattern.hand_mode,
    totalTicks: pattern.total_ticks,
    bars: pattern.bars,
    isPrimary: pattern.is_primary === 1,
    sortOrder: pattern.sort_order,
    notes: pattern.notes,
    steps: steps.map(mapStepRow),
    audio: audio.filter((row) => row.pattern_id === pattern.id).map(mapAudioRow),
  };
}

function buildRhythmSummary(params: {
  readonly rhythm: CatalogRhythmRow;
  readonly isFavorite: boolean;
  readonly previewPattern: RhythmPatternView | null;
}): RhythmSummary {
  return {
    ref: {
      type: "rhythm",
      origin: "catalog",
      id: params.rhythm.id,
    },
    name: params.rhythm.name,
    shortDescription: params.rhythm.short_description,
    timeSignatureNumerator: params.rhythm.time_signature_numerator,
    timeSignatureDenominator: params.rhythm.time_signature_denominator,
    timeSignatureLabel: normalizeTimeSignatureLabel(
      params.rhythm.time_signature_numerator,
      params.rhythm.time_signature_denominator,
    ),
    bpm: params.rhythm.default_bpm,
    difficulty: params.rhythm.difficulty,
    originRegion: params.rhythm.origin_region,
    isFavorite: params.isFavorite,
    previewPattern: params.previewPattern,
  };
}

async function loadRhythmFavorites(
  database: SQLiteDatabaseLike,
  rhythmIds: readonly string[],
): Promise<ReadonlySet<string>> {
  if (rhythmIds.length === 0) {
    return new Set();
  }

  const sql = addQueryIds(SELECT_RHYTHM_FAVORITES_BY_IDS_SQL, rhythmIds);
  const rows = await database.getAllAsync<FavoriteRow>(sql, ...rhythmIds);
  return mapFavoriteRows(rows);
}

async function loadRhythmRows(
  database: SQLiteDatabaseLike,
  filters: RhythmFilters,
  query: string,
  window: { readonly limit: number; readonly offset: number },
): Promise<readonly CatalogRhythmRow[]> {
  let sql = SELECT_RHYTHMS_BASE_SQL;
  const params: unknown[] = [];

  const filterClause = buildRhythmListFilters("catalog_rhythms", filters);
  sql += filterClause.sql;
  params.push(...filterClause.params);

  if (normalizeSearchText(query).length > 0) {
    const searchClause = buildRhythmSearchClause("catalog_rhythms", query);
    sql += searchClause.sql;
    params.push(...searchClause.params);
  }

  sql += ` ORDER BY ${buildRhythmOrderClause("catalog_rhythms")} LIMIT ? OFFSET ?`;
  params.push(window.limit, window.offset);

  return database.getAllAsync<CatalogRhythmRow>(sql, ...params);
}

async function loadRhythmPatternsByRhythmIds(
  database: SQLiteDatabaseLike,
  rhythmIds: readonly string[],
): Promise<ReadonlyMap<string, readonly CatalogRhythmPatternRow[]>> {
  if (rhythmIds.length === 0) {
    return new Map();
  }

  const sql = addQueryIds(SELECT_RHYTHM_PATTERNS_BY_RHYTHM_IDS_SQL, rhythmIds);
  const rows = await database.getAllAsync<CatalogRhythmPatternRow>(sql, ...rhythmIds);
  const groups = new Map<string, CatalogRhythmPatternRow[]>();

  for (const row of rows) {
    const existing = groups.get(row.rhythm_id);
    if (existing) {
      existing.push(row);
      continue;
    }

    groups.set(row.rhythm_id, [row]);
  }

  return groups;
}

async function loadRhythmStepsByPatternIds(
  database: SQLiteDatabaseLike,
  patternIds: readonly string[],
): Promise<ReadonlyMap<string, readonly CatalogRhythmStepRow[]>> {
  if (patternIds.length === 0) {
    return new Map();
  }

  const sql = addQueryIds(SELECT_RHYTHM_STEPS_BY_PATTERN_IDS_SQL, patternIds);
  const rows = await database.getAllAsync<CatalogRhythmStepRow>(sql, ...patternIds);
  const groups = new Map<string, CatalogRhythmStepRow[]>();

  for (const row of rows) {
    const existing = groups.get(row.pattern_id);
    if (existing) {
      existing.push(row);
      continue;
    }

    groups.set(row.pattern_id, [row]);
  }

  return groups;
}

async function loadRhythmAudioByRhythmIds(
  database: SQLiteDatabaseLike,
  rhythmIds: readonly string[],
): Promise<ReadonlyMap<string, readonly CatalogRhythmAudioRow[]>> {
  if (rhythmIds.length === 0) {
    return new Map();
  }

  const sql = addQueryIds(SELECT_RHYTHM_AUDIO_BY_RHYTHM_IDS_SQL, rhythmIds);
  const rows = await database.getAllAsync<CatalogRhythmAudioRow>(sql, ...rhythmIds);
  const groups = new Map<string, CatalogRhythmAudioRow[]>();

  for (const row of rows) {
    const existing = groups.get(row.rhythm_id);
    if (existing) {
      existing.push(row);
      continue;
    }

    groups.set(row.rhythm_id, [row]);
  }

  return groups;
}

function selectPrimaryPattern(patterns: readonly CatalogRhythmPatternRow[]): CatalogRhythmPatternRow | null {
  return patterns[0] ?? null;
}

async function loadRhythmSummaryRows(
  database: SQLiteDatabaseLike,
  filters: RhythmFilters,
  query: string,
  window: { readonly limit: number; readonly offset: number },
): Promise<readonly RhythmSummary[]> {
  const rows = await loadRhythmRows(database, filters, query, window);
  if (rows.length === 0) {
    return [];
  }

  const rhythmIds = rows.map((row) => row.id);
  const favorites = await loadRhythmFavorites(database, rhythmIds);
  const patternsByRhythm = await loadRhythmPatternsByRhythmIds(database, rhythmIds);
  const primaryPatternIds = rows
    .map((row) => selectPrimaryPattern(patternsByRhythm.get(row.id) ?? [])?.id ?? null)
    .filter((id): id is string => id !== null);
  const stepsByPattern = await loadRhythmStepsByPatternIds(database, primaryPatternIds);
  const audioByRhythm = await loadRhythmAudioByRhythmIds(database, rhythmIds);

  return rows.map((row) => {
    const patterns = patternsByRhythm.get(row.id) ?? [];
    const primaryPattern = selectPrimaryPattern(patterns);
    const previewPattern =
      primaryPattern && stepsByPattern.has(primaryPattern.id)
        ? buildPreviewPattern({
            rhythm: row,
            pattern: primaryPattern,
            steps: stepsByPattern.get(primaryPattern.id) ?? [],
            audio: audioByRhythm.get(row.id) ?? [],
          })
        : null;

    return buildRhythmSummary({
      rhythm: row,
      isFavorite: favorites.has(row.id),
      previewPattern,
    });
  });
}

function filterAndSortRhythmSummaries(
  summaries: readonly RhythmSummary[],
  query: string,
  window: { readonly limit: number; readonly offset: number },
): readonly RhythmSummary[] {
  const scored = [...summaries].map((summary) => ({
    summary,
    score: scoreRhythmSummary(summary, query),
  }));

  if (normalizeSearchText(query).length > 0) {
    scored.sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return sortRhythmSummaries(left.summary, right.summary);
    });
  } else {
    scored.sort((left, right) => sortRhythmSummaries(left.summary, right.summary));
  }

  return scored.slice(window.offset, window.offset + window.limit).map(({ summary }) => summary);
}

async function buildRhythmDetail(
  database: SQLiteDatabaseLike,
  row: CatalogRhythmRow,
): Promise<RhythmDetail> {
  const exercisesSql = addQueryIds(SELECT_RHYTHM_EXERCISES_SQL, [row.id]);
  const [patterns, audio, exercises, favorites] = await Promise.all([
    database.getAllAsync<CatalogRhythmPatternRow>(SELECT_RHYTHM_PATTERNS_SQL, row.id),
    database.getAllAsync<CatalogRhythmAudioRow>(SELECT_RHYTHM_AUDIO_SQL, row.id),
    database.getAllAsync<CatalogExerciseRow>(exercisesSql, row.id, row.id),
    loadRhythmFavorites(database, [row.id]),
  ]);

  const patternIds = patterns.map((pattern) => pattern.id);
  const stepsByPattern = await loadRhythmStepsByPatternIds(database, patternIds);

  const mappedPatterns = patterns.map((pattern) =>
    buildRhythmDetailPattern(row, pattern, stepsByPattern.get(pattern.id) ?? [], audio),
  );
  const primaryPattern = selectPrimaryPattern(patterns);

  return {
    ...buildRhythmSummary({
      rhythm: row,
      isFavorite: favorites.has(row.id),
      previewPattern:
        primaryPattern !== null
          ? buildPreviewPattern({
              rhythm: row,
              pattern: primaryPattern,
              steps: stepsByPattern.get(primaryPattern.id) ?? [],
              audio,
            })
          : null,
    }),
    description: row.description,
    minPracticeBpm: row.min_practice_bpm,
    maxRecommendedBpm: row.max_recommended_bpm,
    pulsesPerQuarter: row.pulses_per_quarter,
    patterns: mappedPatterns,
    exercises: exercises.map(mapExerciseRow),
    audio: audio.map(mapAudioRow),
  };
}

export function createRhythmRepository(
  database: SQLiteDatabaseLike,
  options: RhythmRepositoryOptions = {},
): RhythmRepository {
  const now = createNowProvider(options.now);
  void now;

  async function list(filters: RhythmFilters = {}): Promise<readonly RhythmSummary[]> {
    try {
      if (filters.origin !== undefined && filters.origin !== "all" && filters.origin !== "catalog") {
        return [];
      }

      const window = buildPaginationWindow({
        limit: filters.limit,
        offset: filters.offset,
        fallbackLimit: DEFAULT_LIST_LIMIT,
      });
      return loadRhythmSummaryRows(database, filters, "", window);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to list rhythms.");
    }
  }

  async function search(query: string, filters: RhythmFilters = {}): Promise<readonly RhythmSummary[]> {
    try {
      if (filters.origin !== undefined && filters.origin !== "all" && filters.origin !== "catalog") {
        return [];
      }

      const window = buildPaginationWindow({
        limit: filters.limit,
        offset: filters.offset,
        fallbackLimit: DEFAULT_SEARCH_FETCH_LIMIT,
      });

      if (normalizeSearchText(query).length === 0) {
        return list(filters);
      }

      const candidateRows = await loadRhythmSummaryRows(database, filters, query, window);
      return filterAndSortRhythmSummaries(candidateRows, query, window);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to search rhythms.");
    }
  }

  async function getByRef(ref: EntityRef<"rhythm">): Promise<RhythmDetail | null> {
    try {
      if (ref.origin !== "catalog") {
        return null;
      }

      const row = await database.getFirstAsync<CatalogRhythmRow>(SELECT_RHYTHM_BY_ID_SQL, ref.id);
      if (!row) {
        return null;
      }

      return buildRhythmDetail(database, row);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to load rhythm ${ref.origin}:${ref.id}.`);
    }
  }

  return {
    list,
    search,
    getByRef,
  };
}
