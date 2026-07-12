import type { EntityRef, TuningDetails, TuningCourseDetails, TuningStringDetails } from "@/types/music";
import type { SQLiteDatabaseLike } from "@/types/database";
import { TuningSchema } from "@/validation/music";

import {
  RepositoryError,
  toRepositoryError,
  type PreferencesRepository,
  createTuningRef,
  normalizeSearchText,
  type TuningListOptions,
  type TuningRepository,
  type TuningSummary,
} from "@/repositories/contracts";

interface CatalogTuningRow {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly short_name: string;
  readonly description: string | null;
  readonly origin_region: string | null;
  readonly open_chord_id: string | null;
  readonly verification_status: TuningDetails["verificationStatus"];
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
  readonly pair_type: TuningCourseDetails["pairType"];
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
  readonly pitch_class: TuningStringDetails["pitchClass"];
  readonly octave: TuningStringDetails["octave"];
  readonly midi_note: TuningStringDetails["midiNote"];
  readonly reference_frequency_440: TuningStringDetails["referenceFrequency440"];
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
  readonly pair_type: TuningCourseDetails["pairType"];
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
  readonly pitch_class: TuningStringDetails["pitchClass"];
  readonly octave: TuningStringDetails["octave"];
  readonly midi_note: TuningStringDetails["midiNote"];
  readonly reference_frequency_440: TuningStringDetails["referenceFrequency440"];
  readonly gauge_hint: string | null;
  readonly material_hint: string | null;
  readonly display_order: number;
}

interface FavoriteRow {
  readonly id: string;
}

interface TuningIdRow {
  readonly id: string;
}

interface TuningGraphBase {
  readonly ref: EntityRef<"tuning">;
  readonly name: string;
  readonly shortName: string;
  readonly openChordLabel: string | null;
  readonly courseLabels: readonly string[];
  readonly verificationStatus: TuningDetails["verificationStatus"];
  readonly aliases: readonly string[];
  readonly searchText: string;
  readonly sortRank: number;
  readonly sortOrder: number;
  readonly updatedAt: string;
  readonly isFavorite: boolean;
  readonly isActive: boolean;
}

interface CatalogTuningGraph {
  readonly row: CatalogTuningRow;
  readonly aliases: readonly CatalogTuningAliasRow[];
  readonly courses: readonly CatalogTuningCourseRow[];
  readonly strings: readonly CatalogTuningStringRow[];
  readonly openChordLabel: string | null;
}

interface UserTuningGraph {
  readonly row: UserTuningRow;
  readonly courses: readonly UserTuningCourseRow[];
  readonly strings: readonly UserTuningStringRow[];
}

const SELECT_CATALOG_TUNING_BY_ID_SQL = "SELECT * FROM catalog_tunings WHERE id = ? LIMIT 1";
const SELECT_CATALOG_TUNING_ALIASES_SQL = "SELECT * FROM catalog_tuning_aliases WHERE tuning_id = ? ORDER BY normalized_alias ASC";
const SELECT_CATALOG_TUNING_COURSES_SQL = "SELECT * FROM catalog_tuning_courses WHERE tuning_id = ? ORDER BY course_number ASC";
const SELECT_CATALOG_TUNING_STRINGS_SQL =
  "SELECT * FROM catalog_tuning_strings WHERE tuning_id = ? ORDER BY physical_string_number ASC";
const SELECT_CATALOG_CHORD_LABEL_SQL = "SELECT id, canonical_symbol FROM catalog_chords WHERE id = ? LIMIT 1";
const SELECT_CATALOG_TUNINGS_SQL =
  "SELECT * FROM catalog_tunings WHERE 1 = 1 ORDER BY is_featured DESC, sort_order ASC, name ASC";

const SELECT_USER_TUNING_BY_ID_SQL = "SELECT * FROM user_tunings WHERE id = ? AND deleted_at IS NULL LIMIT 1";
const SELECT_USER_TUNING_COURSES_SQL = "SELECT * FROM user_tuning_courses WHERE tuning_id = ? ORDER BY course_number ASC";
const SELECT_USER_TUNING_STRINGS_SQL =
  "SELECT * FROM user_tuning_strings WHERE tuning_id = ? ORDER BY physical_string_number ASC";
const SELECT_USER_TUNINGS_SQL =
  "SELECT * FROM user_tunings WHERE deleted_at IS NULL ORDER BY updated_at DESC, name ASC";

const SELECT_FAVORITE_SQL =
  "SELECT id FROM user_favorites WHERE entity_type = ? AND entity_origin = ? AND entity_id = ? LIMIT 1";

function cleanOptionalText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanRequiredText(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new RepositoryError("DATABASE_ERROR", "Stored tuning contains an empty text field.");
  }

  return trimmed;
}

function asStringInCourse(value: number): 1 | 2 {
  if (value !== 1 && value !== 2) {
    throw new RepositoryError("DATABASE_ERROR", `Invalid string-in-course value: ${value}`);
  }

  return value;
}

function asPhysicalStringNumber(value: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 {
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new RepositoryError("DATABASE_ERROR", `Invalid physical string number: ${value}`);
  }

  return value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

function mapTuningStringRow(row: CatalogTuningStringRow | UserTuningStringRow): TuningStringDetails {
  return {
    id: row.id,
    physicalStringNumber: asPhysicalStringNumber(row.physical_string_number),
    stringInCourse: asStringInCourse(row.string_in_course),
    pitchClass: row.pitch_class,
    octave: row.octave,
    midiNote: row.midi_note,
    referenceFrequency440: row.reference_frequency_440,
  };
}

function asTuningStringPair(
  strings: readonly TuningStringDetails[],
  courseId: string,
): readonly [TuningStringDetails, TuningStringDetails] {
  const [first, second] = strings;

  if (strings.length !== 2 || first === undefined || second === undefined) {
    throw new RepositoryError("DATABASE_ERROR", `Course ${courseId} must contain exactly 2 strings.`);
  }

  return [first, second];
}

function mapCatalogGraphToDetail(graph: CatalogTuningGraph): TuningDetails {
  const courses = graph.courses.map((course) => {
    const courseStrings = graph.strings
      .filter((stringRow) => stringRow.course_id === course.id)
      .sort((left, right) => left.string_in_course - right.string_in_course)
      .map(mapTuningStringRow);

    return {
      id: course.id,
      courseNumber: course.course_number,
      pairType: course.pair_type,
      strings: asTuningStringPair(courseStrings, course.id),
    };
  });

  const detail = {
    id: graph.row.id,
    origin: "catalog" as const,
    name: cleanRequiredText(graph.row.name),
    shortName: cleanRequiredText(graph.row.short_name),
    aliases: graph.aliases.map((alias) => cleanRequiredText(alias.alias)),
    description: cleanOptionalText(graph.row.description),
    courses,
    verificationStatus: graph.row.verification_status,
    tensionWarning: cleanOptionalText(graph.row.tension_warning),
  };

  const parsed = TuningSchema.safeParse(detail);

  if (!parsed.success) {
    throw new RepositoryError("DATABASE_ERROR", "Stored tuning is invalid.", parsed.error);
  }

  return parsed.data;
}

function mapUserGraphToDetail(graph: UserTuningGraph): TuningDetails {
  const courses = graph.courses.map((course) => {
    const courseStrings = graph.strings
      .filter((stringRow) => stringRow.course_id === course.id)
      .sort((left, right) => left.string_in_course - right.string_in_course)
      .map(mapTuningStringRow);

    return {
      id: course.id,
      courseNumber: course.course_number,
      pairType: course.pair_type,
      strings: asTuningStringPair(courseStrings, course.id),
    };
  });

  const detail = {
    id: graph.row.id,
    origin: "user" as const,
    name: cleanRequiredText(graph.row.name),
    shortName: cleanRequiredText(graph.row.short_name ?? graph.row.name),
    aliases: [] as readonly string[],
    description: cleanOptionalText(graph.row.description),
    courses,
    verificationStatus: "user_created" as const,
    tensionWarning: null,
  };

  const parsed = TuningSchema.safeParse(detail);

  if (!parsed.success) {
    throw new RepositoryError("DATABASE_ERROR", "Stored user tuning is invalid.", parsed.error);
  }

  return parsed.data;
}

async function loadCatalogGraph(database: SQLiteDatabaseLike, tuningId: string): Promise<CatalogTuningGraph | null> {
  const row = await database.getFirstAsync<CatalogTuningRow>(SELECT_CATALOG_TUNING_BY_ID_SQL, tuningId);

  if (!row) {
    return null;
  }

  const [aliases, courses, strings, chordLabel] = await Promise.all([
    database.getAllAsync<CatalogTuningAliasRow>(SELECT_CATALOG_TUNING_ALIASES_SQL, tuningId),
    database.getAllAsync<CatalogTuningCourseRow>(SELECT_CATALOG_TUNING_COURSES_SQL, tuningId),
    database.getAllAsync<CatalogTuningStringRow>(SELECT_CATALOG_TUNING_STRINGS_SQL, tuningId),
    row.open_chord_id ? database.getFirstAsync<CatalogChordRow>(SELECT_CATALOG_CHORD_LABEL_SQL, row.open_chord_id) : Promise.resolve(null),
  ]);

  return {
    row,
    aliases,
    courses,
    strings,
    openChordLabel: chordLabel?.canonical_symbol ?? null,
  };
}

async function loadUserGraph(database: SQLiteDatabaseLike, tuningId: string): Promise<UserTuningGraph | null> {
  const row = await database.getFirstAsync<UserTuningRow>(SELECT_USER_TUNING_BY_ID_SQL, tuningId);

  if (!row) {
    return null;
  }

  const [courses, strings] = await Promise.all([
    database.getAllAsync<UserTuningCourseRow>(SELECT_USER_TUNING_COURSES_SQL, tuningId),
    database.getAllAsync<UserTuningStringRow>(SELECT_USER_TUNING_STRINGS_SQL, tuningId),
  ]);

  return {
    row,
    courses,
    strings,
  };
}

async function isFavorite(
  database: SQLiteDatabaseLike,
  origin: "catalog" | "user",
  id: string,
): Promise<boolean> {
  const row = await database.getFirstAsync<FavoriteRow>(SELECT_FAVORITE_SQL, "tuning", origin, id);
  return row !== null;
}

function buildSearchText(parts: readonly string[]): string {
  return normalizeSearchText(parts.filter((part) => part.trim().length > 0).join(" "));
}

async function buildCatalogSummary(
  database: SQLiteDatabaseLike,
  graph: CatalogTuningGraph,
  activeRef: EntityRef<"tuning"> | null,
): Promise<TuningSummary & TuningGraphBase> {
  const favorite = await isFavorite(database, "catalog", graph.row.id);
  const courseLabels = graph.courses.map((course) => cleanRequiredText(course.label ?? `Curso ${course.course_number}`));
  const aliases = graph.aliases.map((alias) => cleanRequiredText(alias.alias));
  return {
    ref: createTuningRef("catalog", graph.row.id),
    name: cleanRequiredText(graph.row.name),
    shortName: cleanRequiredText(graph.row.short_name),
    openChordLabel: graph.openChordLabel ?? null,
    courseLabels,
    isActive: activeRef?.origin === "catalog" && activeRef.id === graph.row.id,
    isFavorite: favorite,
    verificationStatus: graph.row.verification_status,
    aliases,
    searchText: buildSearchText([
      cleanRequiredText(graph.row.name),
      cleanRequiredText(graph.row.short_name),
      graph.openChordLabel ?? "",
      ...aliases,
      ...courseLabels,
    ]),
    sortRank: 0,
    sortOrder: graph.row.sort_order,
    updatedAt: graph.row.updated_at,
  };
}

async function buildUserSummary(
  database: SQLiteDatabaseLike,
  graph: UserTuningGraph,
  activeRef: EntityRef<"tuning"> | null,
): Promise<TuningSummary & TuningGraphBase> {
  const favorite = await isFavorite(database, "user", graph.row.id);
  const courseLabels = graph.courses.map((course) => cleanRequiredText(course.label ?? `Curso ${course.course_number}`));
  const shortName = cleanRequiredText(graph.row.short_name ?? graph.row.name);
  const name = cleanRequiredText(graph.row.name);
  return {
    ref: createTuningRef("user", graph.row.id),
    name,
    shortName,
    openChordLabel: cleanOptionalText(graph.row.open_chord_text),
    courseLabels,
    isActive: activeRef?.origin === "user" && activeRef.id === graph.row.id,
    isFavorite: favorite,
    verificationStatus: "user_created",
    aliases: [],
    searchText: buildSearchText([name, shortName, graph.row.origin_label ?? "", cleanOptionalText(graph.row.open_chord_text) ?? "", ...courseLabels]),
    sortRank: 1,
    sortOrder: 0,
    updatedAt: graph.row.updated_at,
  };
}

async function loadTuningIndex(
  database: SQLiteDatabaseLike,
  preferencesRepository: PreferencesRepository,
  options: TuningListOptions = {},
): Promise<readonly (TuningSummary & TuningGraphBase)[]> {
  const preferences = await preferencesRepository.get();
  const activeRef = createTuningRef(preferences.app.activeTuningOrigin, preferences.app.activeTuningId);

  const catalogRows = options.origin !== "user"
    ? await database.getAllAsync<CatalogTuningRow>(SELECT_CATALOG_TUNINGS_SQL)
    : [];
  const userRows = options.origin !== "catalog"
    ? await database.getAllAsync<UserTuningRow>(SELECT_USER_TUNINGS_SQL)
    : [];

  const catalogGraphs = await Promise.all(catalogRows.map((row) => loadCatalogGraph(database, row.id)));
  const userGraphs = await Promise.all(userRows.map((row) => loadUserGraph(database, row.id)));

  const entries = [
    ...(await Promise.all(
      catalogGraphs.filter((graph): graph is CatalogTuningGraph => graph !== null).map((graph) =>
        buildCatalogSummary(database, graph, activeRef),
      ),
    )),
    ...(await Promise.all(
      userGraphs.filter((graph): graph is UserTuningGraph => graph !== null).map((graph) =>
        buildUserSummary(database, graph, activeRef),
      ),
    )),
  ];

  const sorted = entries.sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }

    if (left.isFavorite !== right.isFavorite) {
      return left.isFavorite ? -1 : 1;
    }

    if (left.sortRank !== right.sortRank) {
      return left.sortRank - right.sortRank;
    }

    if (left.sortRank === 0 && left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    if (left.sortRank === 1 && left.updatedAt !== right.updatedAt) {
      return right.updatedAt.localeCompare(left.updatedAt);
    }

    return left.name.localeCompare(right.name);
  });

  if (options.limit !== undefined) {
    return sorted.slice(0, Math.max(0, options.limit));
  }

  return sorted;
}

async function resolveTuningDetail(
  database: SQLiteDatabaseLike,
  ref: EntityRef<"tuning">,
): Promise<TuningDetails | null> {
  if (ref.origin === "catalog") {
    const graph = await loadCatalogGraph(database, ref.id);
    return graph ? mapCatalogGraphToDetail(graph) : null;
  }

  const graph = await loadUserGraph(database, ref.id);
  return graph ? mapUserGraphToDetail(graph) : null;
}

async function resolveFallbackTuningRef(database: SQLiteDatabaseLike): Promise<EntityRef<"tuning">> {
  const firstCatalog = await database.getFirstAsync<TuningIdRow>(SELECT_CATALOG_TUNINGS_SQL);

  if (firstCatalog) {
    return createTuningRef("catalog", firstCatalog.id);
  }

  const firstUser = await database.getFirstAsync<TuningIdRow>(SELECT_USER_TUNINGS_SQL);

  if (firstUser) {
    return createTuningRef("user", firstUser.id);
  }

  throw new RepositoryError("TUNING_NOT_FOUND", "No tuning is available.");
}

export function createTuningRepository(
  database: SQLiteDatabaseLike,
  options: {
    readonly preferencesRepository: PreferencesRepository;
  },
): TuningRepository {
  const preferencesRepository = options.preferencesRepository;

  async function getActive(): Promise<TuningDetails> {
    try {
      const preferences = await preferencesRepository.get();
      const activeRef = createTuningRef(preferences.app.activeTuningOrigin, preferences.app.activeTuningId);
      const detail = await resolveTuningDetail(database, activeRef);

      if (detail) {
        return detail;
      }

      const fallbackRef = await resolveFallbackTuningRef(database);
      const fallback = await resolveTuningDetail(database, fallbackRef);

      if (!fallback) {
        throw new RepositoryError("TUNING_NOT_FOUND", "No tuning is available.");
      }

      return fallback;
    } catch (error) {
      throw toRepositoryError(error, "TUNING_NOT_FOUND", "Unable to resolve the active tuning.");
    }
  }

  async function getByRef(ref: EntityRef<"tuning">): Promise<TuningDetails | null> {
    try {
      return await resolveTuningDetail(database, ref);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to load tuning ${ref.origin}:${ref.id}.`);
    }
  }

  async function listTunings(options: TuningListOptions = {}): Promise<readonly TuningSummary[]> {
    try {
      const entries = await loadTuningIndex(database, preferencesRepository, options);
        return entries.map(({ aliases: _aliases, searchText: _searchText, sortRank: _sortRank, sortOrder: _sortOrder, updatedAt: _updatedAt, ...summary }) => summary);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to list tunings.");
    }
  }

  async function searchTunings(query: string): Promise<readonly TuningSummary[]> {
    try {
      const needle = normalizeSearchText(query);

      if (needle.length === 0) {
        return listTunings();
      }

      const entries = await loadTuningIndex(database, preferencesRepository);
        return entries
          .filter((entry) => entry.searchText.includes(needle))
          .map(({ aliases: _aliases, searchText: _searchText, sortRank: _sortRank, sortOrder: _sortOrder, updatedAt: _updatedAt, ...summary }) => summary);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to search tunings.");
    }
  }

  async function activate(ref: EntityRef<"tuning">): Promise<TuningDetails> {
    try {
      await preferencesRepository.setActiveTuning(ref);
      const detail = await resolveTuningDetail(database, ref);

      if (!detail) {
        throw new RepositoryError("TUNING_NOT_FOUND", `Tuning not found: ${ref.origin}:${ref.id}`);
      }

      return detail;
    } catch (error) {
      throw toRepositoryError(error, "INVALID_TUNING_REFERENCE", "Unable to activate tuning.");
    }
  }

  return {
    getActive,
    getByRef,
    list: listTunings,
    search: searchTunings,
    activate,
  };
}
