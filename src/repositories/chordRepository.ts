import type { SQLiteDatabaseLike } from "@/types/database";
import type {
  ChordBarre,
  ChordDefinition,
  ChordStringPosition,
  ContentOrigin,
  DifficultyLevel,
  EntityRef,
  PitchClass,
  TuningDetails,
  TuningStringDetails,
  VerificationStatus,
} from "@/types/music";

import { RepositoryError, toRepositoryError } from "@/repositories/contracts";
import type { TuningRepository } from "@/repositories/contracts";

import {
  analyzeVoicing,
  buildVoicingPositionInput,
  type ChordQualityIntervalLike,
} from "@/domain/music/voicing";
import {
  resolveChordDefinitionFromQuery,
  type ChordQualityLookup,
  type ResolvedChordQuery,
} from "@/domain/music/chords/queries";
import {
  formatChordSymbol,
  summarizeChordQuality,
  type ChordQualitySummary,
} from "@/domain/music/chords/symbols";

export type ChordShapeRegion = "open" | "low" | "middle" | "high";

export type ChordQualityIntervalsSummary = ChordQualityIntervalLike;

export interface CatalogChord {
  readonly id: string;
  readonly rootPitchClass: PitchClass;
  readonly qualityId: string;
  readonly bassPitchClass: PitchClass | null;
  readonly canonicalSymbol: string;
  readonly normalizedSearchText: string;
  readonly createdAt: string;
}

export interface ChordShapeFilters {
  readonly origin?: ContentOrigin | "all";
  readonly verificationStatus?: VerificationStatus | readonly VerificationStatus[];
  readonly difficulty?: DifficultyLevel | readonly DifficultyLevel[];
  readonly hasBarre?: boolean;
  readonly positionRegion?: ChordShapeRegion | readonly ChordShapeRegion[];
  readonly isFavorite?: boolean;
  readonly isRecommended?: boolean;
  readonly limit?: number;
}

export interface ChordShapeView {
  readonly ref: EntityRef<"chord_shape">;
  readonly origin: ContentOrigin;
  readonly chord: ChordDefinition;
  readonly tuning: EntityRef<"tuning">;
  readonly quality: ChordQualitySummary;
  readonly symbol: string;
  readonly name: string;
  readonly positions: readonly ChordStringPosition[];
  readonly miniDiagram: readonly ChordStringPosition[];
  readonly barres: readonly ChordBarre[];
  readonly difficulty: DifficultyLevel;
  readonly verificationStatus: VerificationStatus;
  readonly isRecommended: boolean;
  readonly isFavorite: boolean;
  readonly hasBarre: boolean;
  readonly positionRegion: ChordShapeRegion;
  readonly variationNumber: number;
  readonly sortOrder: number;
  readonly notes: string | null;
}

export interface ChordRepository {
  resolveChord(query: string): Promise<ResolvedChordQuery | null>;
  findChord(definition: ChordDefinition): Promise<CatalogChord | null>;
  listShapes(
    tuning: EntityRef<"tuning">,
    chord: ChordDefinition,
    filters?: ChordShapeFilters,
  ): Promise<readonly ChordShapeView[]>;
  getShape(ref: EntityRef<"chord_shape">): Promise<ChordShapeView | null>;
}

interface CatalogChordQualityRow {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly short_name: string;
  readonly symbol_suffix: string;
  readonly family: ChordQualitySummary["family"];
  readonly description: string | null;
  readonly sort_order: number;
  readonly is_core_v1: number;
}

interface CatalogChordQualityIntervalRow {
  readonly id: string;
  readonly quality_id: string;
  readonly semitones: number;
  readonly degree_label: string;
  readonly role: ChordQualityIntervalsSummary["role"];
  readonly sort_order: number;
  readonly is_required: number;
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

interface CatalogChordShapeRow {
  readonly id: string;
  readonly chord_id: string;
  readonly tuning_id: string;
  readonly name: string | null;
  readonly variation_number: number;
  readonly starting_fret: number;
  readonly ending_fret: number;
  readonly fret_span: number;
  readonly difficulty: DifficultyLevel;
  readonly has_barre: number;
  readonly position_region: ChordShapeRegion;
  readonly verification_status: VerificationStatus;
  readonly reviewer_id: string | null;
  readonly source_id: string | null;
  readonly reviewed_at: string | null;
  readonly calculation_version: string | null;
  readonly ergonomic_score: number | null;
  readonly sound_completeness_score: number | null;
  readonly is_recommended: number;
  readonly sort_order: number;
  readonly notes: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

interface CatalogChordShapePositionRow {
  readonly id: string;
  readonly shape_id: string;
  readonly tuning_string_id: string;
  readonly physical_string_number: ChordStringPosition["physicalStringNumber"];
  readonly course_number: ChordStringPosition["courseNumber"];
  readonly string_in_course: ChordStringPosition["stringInCourse"];
  readonly fret: number;
  readonly finger: ChordBarre["finger"] | null;
  readonly is_root: number;
  readonly resulting_pitch_class: PitchClass | null;
  readonly resulting_octave: number | null;
  readonly interval_semitones: number | null;
  readonly interval_label: string | null;
}

interface CatalogChordShapeBarreRow {
  readonly id: string;
  readonly shape_id: string;
  readonly fret: number;
  readonly from_physical_string: ChordBarre["fromPhysicalString"];
  readonly to_physical_string: ChordBarre["toPhysicalString"];
  readonly finger: ChordBarre["finger"];
  readonly sort_order: number;
}

interface UserChordShapeRow {
  readonly id: string;
  readonly chord_root_pitch_class: PitchClass;
  readonly chord_quality_id: string;
  readonly bass_pitch_class: PitchClass | null;
  readonly tuning_origin: ContentOrigin;
  readonly tuning_id: string;
  readonly name: string | null;
  readonly difficulty: DifficultyLevel | null;
  readonly notes: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
}

interface UserChordShapePositionRow {
  readonly id: string;
  readonly shape_id: string;
  readonly tuning_string_id: string;
  readonly physical_string_number: ChordStringPosition["physicalStringNumber"];
  readonly course_number: ChordStringPosition["courseNumber"];
  readonly string_in_course: ChordStringPosition["stringInCourse"];
  readonly fret: number;
  readonly finger: ChordBarre["finger"] | null;
  readonly is_root: number;
  readonly resulting_pitch_class: PitchClass | null;
  readonly resulting_octave: number | null;
  readonly interval_semitones: number | null;
  readonly interval_label: string | null;
}

interface UserChordShapeBarreRow {
  readonly id: string;
  readonly shape_id: string;
  readonly fret: number;
  readonly from_physical_string: ChordBarre["fromPhysicalString"];
  readonly to_physical_string: ChordBarre["toPhysicalString"];
  readonly finger: ChordBarre["finger"];
  readonly sort_order: number;
}

interface FavoriteRow {
  readonly id: string;
}

const SELECT_ALL_CHORD_QUALITIES_SQL = "SELECT * FROM catalog_chord_qualities ORDER BY sort_order ASC, name ASC";
const SELECT_CHORD_QUALITY_BY_ID_SQL = "SELECT * FROM catalog_chord_qualities WHERE id = ? LIMIT 1";
const SELECT_CHORD_QUALITY_INTERVALS_SQL =
  "SELECT * FROM catalog_chord_quality_intervals WHERE quality_id = ? ORDER BY sort_order ASC, semitones ASC";
const SELECT_CATALOG_CHORD_BY_ID_SQL = "SELECT * FROM catalog_chords WHERE id = ? LIMIT 1";
const SELECT_CATALOG_CHORD_SQL =
  "SELECT * FROM catalog_chords WHERE root_pitch_class = ? AND quality_id = ? AND COALESCE(bass_pitch_class, -1) = COALESCE(?, -1) LIMIT 1";
const SELECT_CATALOG_CHORD_SHAPES_SQL =
  "SELECT * FROM catalog_chord_shapes WHERE chord_id = ? AND tuning_id = ? ORDER BY is_recommended DESC, difficulty ASC, sort_order ASC, variation_number ASC";
const SELECT_CATALOG_SHAPE_SQL = "SELECT * FROM catalog_chord_shapes WHERE id = ? LIMIT 1";
const SELECT_CATALOG_SHAPE_POSITIONS_SQL =
  "SELECT * FROM catalog_chord_shape_positions WHERE shape_id = ? ORDER BY physical_string_number ASC";
const SELECT_CATALOG_SHAPE_BARRES_SQL =
  "SELECT * FROM catalog_chord_shape_barres WHERE shape_id = ? ORDER BY sort_order ASC";
const SELECT_USER_SHAPES_SQL =
  "SELECT * FROM user_chord_shapes WHERE tuning_origin = ? AND tuning_id = ? AND deleted_at IS NULL AND chord_root_pitch_class = ? AND chord_quality_id = ? AND COALESCE(bass_pitch_class, -1) = COALESCE(?, -1) ORDER BY updated_at DESC, created_at DESC";
const SELECT_USER_SHAPE_SQL = "SELECT * FROM user_chord_shapes WHERE id = ? AND deleted_at IS NULL LIMIT 1";
const SELECT_USER_SHAPE_POSITIONS_SQL =
  "SELECT * FROM user_chord_shape_positions WHERE shape_id = ? ORDER BY physical_string_number ASC";
const SELECT_USER_SHAPE_BARRES_SQL =
  "SELECT * FROM user_chord_shape_barres WHERE shape_id = ? ORDER BY sort_order ASC";
const SELECT_FAVORITE_SQL =
  "SELECT id FROM user_favorites WHERE entity_type = ? AND entity_origin = ? AND entity_id = ? LIMIT 1";

const STATUS_RANK: Readonly<Record<VerificationStatus, number>> = {
  verified: 0,
  calculated: 1,
  user_created: 2,
  imported: 3,
  deprecated: 4,
  draft: 5,
};

const DIFFICULTY_RANK: Readonly<Record<DifficultyLevel, number>> = {
  beginner: 0,
  easy: 1,
  intermediate: 2,
  advanced: 3,
};

const REGION_RANK: Readonly<Record<ChordShapeRegion, number>> = {
  open: 0,
  low: 1,
  middle: 2,
  high: 3,
};

function fromDbBoolean(value: number): boolean {
  return value === 1;
}

function createChordShapeRef(origin: ContentOrigin, id: string): EntityRef<"chord_shape"> {
  return {
    type: "chord_shape",
    origin,
    id,
  };
}

function createTuningRef(origin: ContentOrigin, id: string): EntityRef<"tuning"> {
  return {
    type: "tuning",
    origin,
    id,
  };
}

function asChordQualitySummary(row: ChordQualityLookup): ChordQualitySummary {
  return summarizeChordQuality(row);
}

function cleanOptionalText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeArrayFilter<T>(value: T | readonly T[] | undefined): readonly T[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? (value as readonly T[]) : ([value] as readonly T[]);
}

function rowMatchesFilter<T>(value: T, filter: T | readonly T[] | undefined): boolean {
  const values = normalizeArrayFilter(filter);

  if (!values) {
    return true;
  }

  return values.includes(value);
}

function deriveRegionFromPositions(positions: readonly ChordStringPosition[]): ChordShapeRegion {
  const positiveFrets = positions
    .map((position) => position.fret)
    .filter((fret) => fret > 0);

  if (positiveFrets.length === 0) {
    return "open";
  }

  const minFret = Math.min(...positiveFrets);

  if (minFret <= 4) {
    return "low";
  }

  if (minFret <= 7) {
    return "middle";
  }

  return "high";
}

function deriveDifficultyFromRegion(region: ChordShapeRegion): DifficultyLevel {
  switch (region) {
    case "open":
      return "beginner";
    case "low":
      return "easy";
    case "middle":
      return "intermediate";
    case "high":
      return "advanced";
    default:
      return "easy";
  }
}

function mapPitchClassToNumber(value: PitchClass): number {
  return value;
}

function buildTuningStringIndex(tuning: TuningDetails): {
  readonly byId: ReadonlyMap<string, TuningStringDetails>;
  readonly byPhysicalNumber: ReadonlyMap<number, TuningStringDetails>;
} {
  const byId = new Map<string, TuningStringDetails>();
  const byPhysicalNumber = new Map<number, TuningStringDetails>();

  for (const course of tuning.courses) {
    for (const stringDetails of course.strings) {
      byId.set(stringDetails.id, stringDetails);
      byPhysicalNumber.set(stringDetails.physicalStringNumber, stringDetails);
    }
  }

  return {
    byId,
    byPhysicalNumber,
  };
}

function mapResultPositions(
  analysisPositions: ReturnType<typeof analyzeVoicing>["positions"],
): readonly ChordStringPosition[] {
  return analysisPositions.map((position) => ({
    physicalStringNumber: position.physicalStringNumber,
    courseNumber: position.courseNumber,
    stringInCourse: position.stringInCourse,
    fret: position.fret,
    finger: position.finger,
    pitchClass: position.pitchClass,
    octave: position.octave,
    intervalLabel: position.intervalLabel,
  }));
}

function mapBarreRow(row: CatalogChordShapeBarreRow | UserChordShapeBarreRow): ChordBarre {
  return {
    fret: row.fret,
    fromPhysicalString: row.from_physical_string,
    toPhysicalString: row.to_physical_string,
    finger: row.finger,
  };
}

function sortShapes(left: ChordShapeView, right: ChordShapeView): number {
  if (left.isRecommended !== right.isRecommended) {
    return left.isRecommended ? -1 : 1;
  }

  if (left.isFavorite !== right.isFavorite) {
    return left.isFavorite ? -1 : 1;
  }

  if (left.verificationStatus !== right.verificationStatus) {
    return STATUS_RANK[left.verificationStatus] - STATUS_RANK[right.verificationStatus];
  }

  if (left.difficulty !== right.difficulty) {
    return DIFFICULTY_RANK[left.difficulty] - DIFFICULTY_RANK[right.difficulty];
  }

  if (left.positionRegion !== right.positionRegion) {
    return REGION_RANK[left.positionRegion] - REGION_RANK[right.positionRegion];
  }

  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }

  if (left.variationNumber !== right.variationNumber) {
    return left.variationNumber - right.variationNumber;
  }

  return left.name.localeCompare(right.name);
}

function applyFilters(shape: ChordShapeView, filters: ChordShapeFilters): boolean {
  if (filters.origin && filters.origin !== "all" && shape.origin !== filters.origin) {
    return false;
  }

  if (!rowMatchesFilter(shape.verificationStatus, filters.verificationStatus)) {
    return false;
  }

  if (!rowMatchesFilter(shape.difficulty, filters.difficulty)) {
    return false;
  }

  if (filters.hasBarre !== undefined && shape.hasBarre !== filters.hasBarre) {
    return false;
  }

  if (!rowMatchesFilter(shape.positionRegion, filters.positionRegion)) {
    return false;
  }

  if (filters.isFavorite !== undefined && shape.isFavorite !== filters.isFavorite) {
    return false;
  }

  if (filters.isRecommended !== undefined && shape.isRecommended !== filters.isRecommended) {
    return false;
  }

  return true;
}

async function loadAllQualities(database: SQLiteDatabaseLike): Promise<readonly CatalogChordQualityRow[]> {
  return database.getAllAsync<CatalogChordQualityRow>(SELECT_ALL_CHORD_QUALITIES_SQL);
}

async function loadQualityById(database: SQLiteDatabaseLike, qualityId: string): Promise<CatalogChordQualityRow | null> {
  return database.getFirstAsync<CatalogChordQualityRow>(SELECT_CHORD_QUALITY_BY_ID_SQL, qualityId);
}

async function loadQualityIntervals(
  database: SQLiteDatabaseLike,
  qualityId: string,
): Promise<readonly ChordQualityIntervalsSummary[]> {
  const rows = await database.getAllAsync<CatalogChordQualityIntervalRow>(SELECT_CHORD_QUALITY_INTERVALS_SQL, qualityId);

  return rows.map((row) => ({
    semitones: row.semitones,
    degreeLabel: row.degree_label,
    role: row.role,
    sortOrder: row.sort_order,
    isRequired: fromDbBoolean(row.is_required),
  }));
}

async function loadFavorite(
  database: SQLiteDatabaseLike,
  origin: ContentOrigin,
  id: string,
) {
  return database.getFirstAsync<FavoriteRow>(SELECT_FAVORITE_SQL, "chord_shape", origin, id);
}

function buildQualityIndex(rows: readonly CatalogChordQualityRow[]): readonly ChordQualityLookup[] {
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    shortName: row.short_name,
    symbolSuffix: row.symbol_suffix,
    family: row.family,
  }));
}

async function resolveChordQualityById(
  database: SQLiteDatabaseLike,
  qualityId: string,
): Promise<ChordQualitySummary> {
  const row = await loadQualityById(database, qualityId);

  if (!row) {
    throw new RepositoryError("DATABASE_ERROR", `Unknown chord quality '${qualityId}'.`);
  }

  return asChordQualitySummary({
    id: row.id,
    code: row.code,
    name: row.name,
    shortName: row.short_name,
    symbolSuffix: row.symbol_suffix,
    family: row.family,
  });
}

function assertCondition(condition: boolean, message: string): void {
  if (!condition) {
    throw new RepositoryError("DATABASE_ERROR", message);
  }
}

function validateAndMapPositions(params: {
  readonly chord: ChordDefinition;
  readonly qualityIntervals: readonly ChordQualityIntervalsSummary[];
  readonly tuning: TuningDetails;
  readonly rows: readonly (CatalogChordShapePositionRow | UserChordShapePositionRow)[];
}): {
  readonly positions: readonly ChordStringPosition[];
  readonly analysis: ReturnType<typeof analyzeVoicing>;
} {
  const tuningIndex = buildTuningStringIndex(params.tuning);
  const analysisInput = params.rows.map((row) => {
    const tuningString =
      tuningIndex.byId.get(row.tuning_string_id) ??
      tuningIndex.byPhysicalNumber.get(row.physical_string_number);

    if (!tuningString) {
      throw new RepositoryError(
        "DATABASE_ERROR",
        `Shape references unknown tuning string '${row.tuning_string_id}'.`,
      );
    }

    return buildVoicingPositionInput({
      physicalStringNumber: row.physical_string_number,
      courseNumber: row.course_number,
      stringInCourse: row.string_in_course,
      fret: row.fret,
      finger: row.finger,
      tuningString,
    });
  });

  const analysis = analyzeVoicing({
    chord: params.chord,
    positions: analysisInput,
    qualityIntervals: params.qualityIntervals,
  });

  assertCondition(!analysis.hasAnyInvalidInterval, "Stored chord shape contains notes outside the chord quality.");
  assertCondition(analysis.rootMidiNote !== null, "Stored chord shape must contain at least one root note.");

  const positions = mapResultPositions(analysis.positions);

  const storedPositionsByString = new Map<number, CatalogChordShapePositionRow | UserChordShapePositionRow>();
  for (const row of params.rows) {
    storedPositionsByString.set(row.physical_string_number, row);
  }

  for (const position of analysis.positions) {
    const stored = storedPositionsByString.get(position.physicalStringNumber);
    if (!stored) {
      continue;
    }

    if (stored.fret === -1) {
      assertCondition(
        position.pitchClass === null && position.octave === null && position.intervalLabel === null,
        "Muted string should not contain pitch information.",
      );
      continue;
    }

    assertCondition(position.pitchClass === stored.resulting_pitch_class, "Stored pitch class does not match calculated pitch.");
    assertCondition(position.octave === stored.resulting_octave, "Stored octave does not match calculated octave.");

    if (stored.interval_semitones !== null) {
      const rootMidi = analysis.rootMidiNote;
      if (rootMidi === null) {
        throw new RepositoryError("DATABASE_ERROR", "Root midi note must exist.");
      }

      const calculatedInterval = position.midiNote === null ? null : position.midiNote - rootMidi;
      assertCondition(
        calculatedInterval === stored.interval_semitones,
        "Stored interval semitones do not match calculated interval.",
      );
    }

    if (stored.interval_label !== null) {
      assertCondition(position.intervalLabel === stored.interval_label, "Stored interval label does not match calculated interval.");
    }
  }

  return {
    positions,
    analysis,
  };
}

function buildShapeView(params: {
  readonly origin: ContentOrigin;
  readonly row:
    | CatalogChordShapeRow
    | UserChordShapeRow;
  readonly chord: ChordDefinition;
  readonly quality: ChordQualitySummary;
  readonly tuning: TuningDetails;
  readonly positionRows: readonly (CatalogChordShapePositionRow | UserChordShapePositionRow)[];
  readonly barreRows: readonly (CatalogChordShapeBarreRow | UserChordShapeBarreRow)[];
  readonly qualityIntervals: readonly ChordQualityIntervalsSummary[];
  readonly favorite: boolean;
  readonly symbol: string;
}): ChordShapeView {
  const { positions } = validateAndMapPositions({
    chord: params.chord,
    qualityIntervals: params.qualityIntervals,
    tuning: params.tuning,
    rows: params.positionRows,
  });

  const barres = params.barreRows.map(mapBarreRow);
  const hasBarre = barres.length > 0;
  const derivedRegion = deriveRegionFromPositions(positions);
  const derivedDifficulty = deriveDifficultyFromRegion(derivedRegion);

  if ("has_barre" in params.row) {
    assertCondition(
      fromDbBoolean(params.row.has_barre) === hasBarre,
      "Stored barre flag does not match the barre rows.",
    );
  }

  if ("position_region" in params.row) {
    assertCondition(
      params.row.position_region === derivedRegion,
      "Stored region does not match the calculated region.",
    );
  }

  const difficulty = "difficulty" in params.row && params.row.difficulty !== null
    ? params.row.difficulty
    : derivedDifficulty;

  const variationNumber = "variation_number" in params.row ? params.row.variation_number : 1;
  const sortOrder = "sort_order" in params.row ? params.row.sort_order : 0;
  const notes = cleanOptionalText("notes" in params.row ? params.row.notes : null);
  const name = cleanOptionalText("name" in params.row ? params.row.name : null) ?? params.symbol;
  const symbol = params.symbol;

  return {
    ref: createChordShapeRef(params.origin, params.row.id),
    origin: params.origin,
    chord: params.chord,
    tuning: createTuningRef(params.tuning.origin, params.tuning.id),
    quality: params.quality,
    symbol,
    name,
    positions,
    miniDiagram: positions,
    barres,
    difficulty,
    verificationStatus: "verification_status" in params.row
      ? params.row.verification_status
      : "user_created",
    isRecommended: "is_recommended" in params.row ? fromDbBoolean(params.row.is_recommended) : false,
    isFavorite: params.favorite,
    hasBarre,
    positionRegion: derivedRegion,
    variationNumber,
    sortOrder,
    notes,
  };
}

function chordToSymbol(
  chord: ChordDefinition,
  quality: ChordQualitySummary,
): string {
  return formatChordSymbol(chord, quality, "contextual");
}

async function loadCatalogShapeView(
  database: SQLiteDatabaseLike,
  tuning: TuningDetails,
  chord: ChordDefinition,
  quality: ChordQualitySummary,
  shapeRow: CatalogChordShapeRow,
  options: {
    readonly accidentalPreference?: "contextual" | "sharps" | "flats";
  } = {},
): Promise<ChordShapeView> {
  const [positionRows, barreRows, favorite, qualityIntervals] = await Promise.all([
    database.getAllAsync<CatalogChordShapePositionRow>(SELECT_CATALOG_SHAPE_POSITIONS_SQL, shapeRow.id),
    database.getAllAsync<CatalogChordShapeBarreRow>(SELECT_CATALOG_SHAPE_BARRES_SQL, shapeRow.id),
    loadFavorite(database, "catalog", shapeRow.id),
    loadQualityIntervals(database, chord.qualityId),
  ]);

  const chordSymbol = chordToSymbol(chord, quality);
  const view = buildShapeView({
    origin: "catalog",
    row: shapeRow,
    chord,
    quality,
    tuning,
    positionRows,
    barreRows,
    qualityIntervals,
    favorite: favorite !== null,
    symbol: chordSymbol,
  });

  if (options.accidentalPreference && options.accidentalPreference !== "contextual") {
    return {
      ...view,
      symbol: formatChordSymbol(chord, quality, options.accidentalPreference),
    };
  }

  return {
    ...view,
    symbol: chordSymbol,
  };
}

async function loadUserShapeView(
  database: SQLiteDatabaseLike,
  tuning: TuningDetails,
  chord: ChordDefinition,
  quality: ChordQualitySummary,
  shapeRow: UserChordShapeRow,
  options: {
    readonly accidentalPreference?: "contextual" | "sharps" | "flats";
  } = {},
): Promise<ChordShapeView> {
  const [positionRows, barreRows, favorite, qualityIntervals] = await Promise.all([
    database.getAllAsync<UserChordShapePositionRow>(SELECT_USER_SHAPE_POSITIONS_SQL, shapeRow.id),
    database.getAllAsync<UserChordShapeBarreRow>(SELECT_USER_SHAPE_BARRES_SQL, shapeRow.id),
    loadFavorite(database, "user", shapeRow.id),
    loadQualityIntervals(database, chord.qualityId),
  ]);

  const chordSymbol = chordToSymbol(chord, quality);
  const view = buildShapeView({
    origin: "user",
    row: shapeRow,
    chord,
    quality,
    tuning,
    positionRows,
    barreRows,
    qualityIntervals,
    favorite: favorite !== null,
    symbol: chordSymbol,
  });

  if (options.accidentalPreference && options.accidentalPreference !== "contextual") {
    return {
      ...view,
      symbol: formatChordSymbol(chord, quality, options.accidentalPreference),
    };
  }

  return {
    ...view,
    symbol: chordSymbol,
  };
}

async function loadShapeByRef(
  database: SQLiteDatabaseLike,
  tuningRepository: Pick<TuningRepository, "getByRef">,
  ref: EntityRef<"chord_shape">,
  options: {
    readonly accidentalPreference?: "contextual" | "sharps" | "flats";
  } = {},
): Promise<ChordShapeView | null> {
  if (ref.origin === "catalog") {
    const shapeRow = await database.getFirstAsync<CatalogChordShapeRow>(SELECT_CATALOG_SHAPE_SQL, ref.id);

    if (!shapeRow) {
      return null;
    }

    const tuning = await tuningRepository.getByRef(createTuningRef("catalog", shapeRow.tuning_id));
    if (!tuning) {
      throw new RepositoryError("TUNING_NOT_FOUND", `Tuning not found for shape ${ref.id}.`);
    }

    const chordRow = await database.getFirstAsync<CatalogChordRow>(SELECT_CATALOG_CHORD_BY_ID_SQL, shapeRow.chord_id);
    if (!chordRow) {
      throw new RepositoryError("DATABASE_ERROR", `Catalog chord '${shapeRow.chord_id}' was not found.`);
    }

    const quality = await resolveChordQualityById(database, chordRow.quality_id);
    const chord = {
      rootPitchClass: chordRow.root_pitch_class,
      qualityId: chordRow.quality_id,
      bassPitchClass: chordRow.bass_pitch_class,
    } satisfies ChordDefinition;

    return loadCatalogShapeView(database, tuning, chord, quality, shapeRow, options);
  }

  const shapeRow = await database.getFirstAsync<UserChordShapeRow>(SELECT_USER_SHAPE_SQL, ref.id);

  if (!shapeRow) {
    return null;
  }

  const tuning = await tuningRepository.getByRef(createTuningRef(shapeRow.tuning_origin, shapeRow.tuning_id));
  if (!tuning) {
    throw new RepositoryError("TUNING_NOT_FOUND", `Tuning not found for user shape ${ref.id}.`);
  }

  const quality = await resolveChordQualityById(database, shapeRow.chord_quality_id);
  const chord = {
    rootPitchClass: shapeRow.chord_root_pitch_class,
    qualityId: shapeRow.chord_quality_id,
    bassPitchClass: shapeRow.bass_pitch_class,
  } satisfies ChordDefinition;

  return loadUserShapeView(database, tuning, chord, quality, shapeRow, options);
}

async function loadCatalogShapes(
  database: SQLiteDatabaseLike,
  tuning: TuningDetails,
  chord: ChordDefinition,
  quality: ChordQualitySummary,
  filters: ChordShapeFilters,
): Promise<readonly ChordShapeView[]> {
  const chordRow = await database.getFirstAsync<CatalogChordRow>(SELECT_CATALOG_CHORD_SQL, mapPitchClassToNumber(chord.rootPitchClass), chord.qualityId, chord.bassPitchClass);

  if (!chordRow) {
    return [];
  }

  const rows = await database.getAllAsync<CatalogChordShapeRow>(SELECT_CATALOG_CHORD_SHAPES_SQL, chordRow.id, tuning.id);
  const views = await Promise.all(
    rows.map((shapeRow) => loadCatalogShapeView(database, tuning, chord, quality, shapeRow)),
  );

  return views.filter((view) => applyFilters(view, filters));
}

async function loadUserShapes(
  database: SQLiteDatabaseLike,
  tuning: TuningDetails,
  chord: ChordDefinition,
  quality: ChordQualitySummary,
  filters: ChordShapeFilters,
): Promise<readonly ChordShapeView[]> {
  const rows = await database.getAllAsync<UserChordShapeRow>(
    SELECT_USER_SHAPES_SQL,
    tuning.origin,
    tuning.id,
    chord.rootPitchClass,
    chord.qualityId,
    chord.bassPitchClass,
  );

  const views = await Promise.all(rows.map((shapeRow) => loadUserShapeView(database, tuning, chord, quality, shapeRow)));

  return views.filter((view) => applyFilters(view, filters));
}

export function createChordRepository(
  database: SQLiteDatabaseLike,
  options: {
    readonly tuningRepository: Pick<TuningRepository, "getByRef">;
  },
): ChordRepository {
  const tuningRepository = options.tuningRepository;
  let qualitiesCache: readonly ChordQualityLookup[] | null = null;

  async function getQualityIndex(): Promise<readonly ChordQualityLookup[]> {
    if (!qualitiesCache) {
      const rows = await loadAllQualities(database);
      qualitiesCache = buildQualityIndex(rows);
    }

    return qualitiesCache;
  }

  async function resolveChord(query: string): Promise<ResolvedChordQuery | null> {
    try {
      const qualities = await getQualityIndex();
      const resolved = resolveChordDefinitionFromQuery(query, qualities);
      return resolved;
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to resolve chord query.");
    }
  }

  async function findChord(definition: ChordDefinition): Promise<CatalogChord | null> {
    try {
      const row = await database.getFirstAsync<CatalogChordRow>(
        SELECT_CATALOG_CHORD_SQL,
        definition.rootPitchClass,
        definition.qualityId,
        definition.bassPitchClass,
      );

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        rootPitchClass: row.root_pitch_class,
        qualityId: row.quality_id,
        bassPitchClass: row.bass_pitch_class,
        canonicalSymbol: row.canonical_symbol,
        normalizedSearchText: row.normalized_search_text,
        createdAt: row.created_at,
      };
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to find chord.");
    }
  }

  async function listShapes(
    tuning: EntityRef<"tuning">,
    chord: ChordDefinition,
    filters: ChordShapeFilters = {},
  ): Promise<readonly ChordShapeView[]> {
    try {
      const tuningDetail = await tuningRepository.getByRef(tuning);

      if (!tuningDetail) {
        throw new RepositoryError("TUNING_NOT_FOUND", `Tuning not found: ${tuning.origin}:${tuning.id}`);
      }

      const quality = await resolveChordQualityById(database, chord.qualityId);
      const [catalogShapes, userShapes] = await Promise.all([
        filters.origin === "user"
          ? Promise.resolve([] as readonly ChordShapeView[])
          : loadCatalogShapes(database, tuningDetail, chord, quality, filters),
        filters.origin === "catalog"
          ? Promise.resolve([] as readonly ChordShapeView[])
          : loadUserShapes(database, tuningDetail, chord, quality, filters),
      ]);

      const shapes = [...catalogShapes, ...userShapes].filter((shape) => applyFilters(shape, filters)).sort(sortShapes);
      const limited = filters.limit !== undefined ? shapes.slice(0, Math.max(0, filters.limit)) : shapes;
      return limited;
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to list chord shapes.");
    }
  }

  async function getShape(ref: EntityRef<"chord_shape">): Promise<ChordShapeView | null> {
    try {
      return await loadShapeByRef(database, tuningRepository, ref);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to load chord shape.");
    }
  }

  return {
    resolveChord,
    findChord,
    listShapes,
    getShape,
  };
}
