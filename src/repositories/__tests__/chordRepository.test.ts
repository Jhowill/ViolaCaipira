import { describe, expect, it } from "vitest";

import { pitchClassToMidi, midiToFrequency } from "@/domain/music/conversions";
import { analyzeVoicing, buildVoicingPositionInput, type ChordQualityIntervalLike } from "@/domain/music/voicing";
import { createChordRepository } from "@/repositories/chordRepository";
import type { SQLiteDatabaseLike } from "@/types/database";
import type {
  ChordBarre,
  ChordDefinition,
  ContentOrigin,
  DifficultyLevel,
  EntityRef,
  PitchClass,
  TuningDetails,
  TuningStringDetails,
  VerificationStatus,
} from "@/types/music";

type DbTimestamp = string;

interface CatalogChordQualityRow {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly short_name: string;
  readonly symbol_suffix: string;
  readonly family: string;
  readonly description: string | null;
  readonly sort_order: number;
  readonly is_core_v1: number;
}

interface CatalogChordQualityIntervalRow {
  readonly id: string;
  readonly quality_id: string;
  readonly semitones: number;
  readonly degree_label: string;
  readonly role: ChordQualityIntervalLike["role"];
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
  readonly created_at: DbTimestamp;
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
  readonly position_region: "open" | "low" | "middle" | "high";
  readonly verification_status: VerificationStatus;
  readonly reviewer_id: string | null;
  readonly source_id: string | null;
  readonly reviewed_at: DbTimestamp | null;
  readonly calculation_version: string | null;
  readonly ergonomic_score: number | null;
  readonly sound_completeness_score: number | null;
  readonly is_recommended: number;
  readonly sort_order: number;
  readonly notes: string | null;
  readonly created_at: DbTimestamp;
  readonly updated_at: DbTimestamp;
}

interface CatalogChordShapePositionRow {
  readonly id: string;
  readonly shape_id: string;
  readonly tuning_string_id: string;
  readonly physical_string_number: number;
  readonly course_number: number;
  readonly string_in_course: number;
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
  readonly from_physical_string: number;
  readonly to_physical_string: number;
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
  readonly created_at: DbTimestamp;
  readonly updated_at: DbTimestamp;
  readonly deleted_at: DbTimestamp | null;
}

type UserChordShapePositionRow = CatalogChordShapePositionRow;

type UserChordShapeBarreRow = CatalogChordShapeBarreRow;

interface FavoriteRow {
  readonly id: string;
  readonly entity_type: "chord_shape";
  readonly entity_origin: ContentOrigin;
  readonly entity_id: string;
  readonly created_at: DbTimestamp;
}

const TIMESTAMP: DbTimestamp = "2026-07-12T12:00:00.000Z";

const C_MAJOR_CHORD: ChordDefinition = {
  rootPitchClass: 0,
  qualityId: "major",
  bassPitchClass: null,
};

const TUNING_REF: EntityRef<"tuning"> = {
  type: "tuning",
  origin: "catalog",
  id: "catalog-tuning-c",
};

const MAJOR_INTERVALS: readonly CatalogChordQualityIntervalRow[] = [
  {
    id: "major-root",
    quality_id: "major",
    semitones: 0,
    degree_label: "P1",
    role: "root",
    sort_order: 0,
    is_required: 1,
  },
  {
    id: "major-third",
    quality_id: "major",
    semitones: 4,
    degree_label: "M3",
    role: "third",
    sort_order: 1,
    is_required: 1,
  },
  {
    id: "major-fifth",
    quality_id: "major",
    semitones: 7,
    degree_label: "P5",
    role: "fifth",
    sort_order: 2,
    is_required: 1,
  },
];

function createTuningString(
  physicalStringNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
  stringInCourse: 1 | 2,
  pitchClass: 0 | 2 | 4 | 5 | 7 | 9 | 11,
  octave: number,
): TuningStringDetails {
  const midiNote = pitchClassToMidi(pitchClass, octave);

  return {
    id: `tuning-string-${physicalStringNumber}`,
    physicalStringNumber,
    stringInCourse,
    pitchClass,
    octave,
    midiNote,
    referenceFrequency440: midiToFrequency(midiNote),
  };
}

function createTuning(): TuningDetails {
  const courses = [
    {
      id: "course-1",
      courseNumber: 1 as const,
      pairType: "unison" as const,
      strings: [
        createTuningString(1, 1, 0, 3),
        createTuningString(2, 2, 4, 3),
      ] as const,
    },
    {
      id: "course-2",
      courseNumber: 2 as const,
      pairType: "unison" as const,
      strings: [
        createTuningString(3, 1, 7, 3),
        createTuningString(4, 2, 0, 4),
      ] as const,
    },
    {
      id: "course-3",
      courseNumber: 3 as const,
      pairType: "unison" as const,
      strings: [
        createTuningString(5, 1, 4, 4),
        createTuningString(6, 2, 7, 4),
      ] as const,
    },
    {
      id: "course-4",
      courseNumber: 4 as const,
      pairType: "unison" as const,
      strings: [
        createTuningString(7, 1, 0, 5),
        createTuningString(8, 2, 4, 5),
      ] as const,
    },
    {
      id: "course-5",
      courseNumber: 5 as const,
      pairType: "unison" as const,
      strings: [
        createTuningString(9, 1, 7, 5),
        createTuningString(10, 2, 0, 6),
      ] as const,
    },
  ] as const;

  return {
    id: TUNING_REF.id,
    origin: TUNING_REF.origin,
    name: "Cebolão em C",
    shortName: "C",
    aliases: ["Cebolão", "C"],
    description: "Tuning de teste para repositório de acordes.",
    courses,
    verificationStatus: "verified",
    tensionWarning: null,
  };
}

function buildPositionRows(params: {
  readonly shapeId: string;
  readonly tuning: TuningDetails;
  readonly chord: ChordDefinition;
  readonly frets: readonly number[];
}): readonly CatalogChordShapePositionRow[] {
  const tuningStrings = params.tuning.courses.flatMap((course) => course.strings);
  const qualityIntervals = MAJOR_INTERVALS.map((interval) => ({
    semitones: interval.semitones,
    degreeLabel: interval.degree_label,
    role: interval.role,
    sortOrder: interval.sort_order,
    isRequired: interval.is_required === 1,
  }));

  const analysis = analyzeVoicing({
    chord: params.chord,
    positions: tuningStrings.map((tuningString, index) => buildVoicingPositionInput({
      tuningString,
      fret: params.frets[index] ?? 0,
      finger: null,
      physicalStringNumber: tuningString.physicalStringNumber,
      courseNumber: params.tuning.courses[Math.floor(index / 2)]!.courseNumber,
      stringInCourse: tuningString.stringInCourse,
    })),
    qualityIntervals,
  });

  return analysis.positions.map((position) => {
    const tuningString = tuningStrings.find((string) => string.physicalStringNumber === position.physicalStringNumber);

    if (!tuningString) {
      throw new Error(`Missing tuning string ${position.physicalStringNumber}.`);
    }

    return {
      id: `${params.shapeId}-position-${position.physicalStringNumber}`,
      shape_id: params.shapeId,
      tuning_string_id: tuningString.id,
      physical_string_number: position.physicalStringNumber,
      course_number: position.courseNumber,
      string_in_course: position.stringInCourse,
      fret: position.fret,
      finger: position.finger,
      is_root: position.isRoot ? 1 : 0,
      resulting_pitch_class: position.pitchClass,
      resulting_octave: position.octave,
      interval_semitones:
        position.midiNote === null || analysis.rootMidiNote === null ? null : position.midiNote - analysis.rootMidiNote,
      interval_label: position.intervalLabel,
    };
  });
}

function buildChordRepositoryFakeDatabase(): SQLiteDatabaseLike {
  const tuning = createTuning();

  const catalogChordQualityRows: readonly CatalogChordQualityRow[] = [
    {
      id: "major",
      code: "major",
      name: "Major",
      short_name: "",
      symbol_suffix: "",
      family: "major",
      description: null,
      sort_order: 1,
      is_core_v1: 1,
    },
    {
      id: "dominant_7",
      code: "dominant_7",
      name: "Dominant seventh",
      short_name: "7",
      symbol_suffix: "7",
      family: "dominant",
      description: null,
      sort_order: 2,
      is_core_v1: 1,
    },
  ];

  const catalogChordRows: readonly CatalogChordRow[] = [
    {
      id: "catalog-chord-c",
      root_pitch_class: 0,
      quality_id: "major",
      bass_pitch_class: null,
      canonical_symbol: "C",
      normalized_search_text: "c",
      created_at: TIMESTAMP,
    },
    {
      id: "catalog-chord-d7",
      root_pitch_class: 2,
      quality_id: "dominant_7",
      bass_pitch_class: null,
      canonical_symbol: "D7",
      normalized_search_text: "d7",
      created_at: TIMESTAMP,
    },
  ];

  const catalogShapeRows: readonly CatalogChordShapeRow[] = [
    {
      id: "catalog-shape-c-open",
      chord_id: "catalog-chord-c",
      tuning_id: TUNING_REF.id,
      name: null,
      variation_number: 1,
      starting_fret: 0,
      ending_fret: 0,
      fret_span: 0,
      difficulty: "beginner",
      has_barre: 0,
      position_region: "open",
      verification_status: "verified",
      reviewer_id: "reviewer-1",
      source_id: "source-1",
      reviewed_at: TIMESTAMP,
      calculation_version: "1",
      ergonomic_score: 0.98,
      sound_completeness_score: 1,
      is_recommended: 1,
      sort_order: 1,
      notes: null,
      created_at: TIMESTAMP,
      updated_at: TIMESTAMP,
    },
    {
      id: "catalog-shape-c-barre",
      chord_id: "catalog-chord-c",
      tuning_id: TUNING_REF.id,
      name: "Barre C",
      variation_number: 2,
      starting_fret: 12,
      ending_fret: 12,
      fret_span: 0,
      difficulty: "advanced",
      has_barre: 1,
      position_region: "high",
      verification_status: "calculated",
      reviewer_id: null,
      source_id: null,
      reviewed_at: null,
      calculation_version: "1",
      ergonomic_score: 0.73,
      sound_completeness_score: 0.96,
      is_recommended: 0,
      sort_order: 2,
      notes: "Barre no 12",
      created_at: TIMESTAMP,
      updated_at: "2026-07-12T12:30:00.000Z",
    },
  ];

  const userShapeRows: readonly UserChordShapeRow[] = [
    {
      id: "user-shape-c-personal",
      chord_root_pitch_class: 0,
      chord_quality_id: "major",
      bass_pitch_class: null,
      tuning_origin: "catalog",
      tuning_id: TUNING_REF.id,
      name: "Meu C",
      difficulty: "intermediate",
      notes: "Versão pessoal",
      created_at: TIMESTAMP,
      updated_at: "2026-07-12T12:45:00.000Z",
      deleted_at: null,
    },
  ];

  const catalogPositionRows: readonly CatalogChordShapePositionRow[] = [
    ...buildPositionRows({
      shapeId: "catalog-shape-c-open",
      tuning,
      chord: C_MAJOR_CHORD,
      frets: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    }),
    ...buildPositionRows({
      shapeId: "catalog-shape-c-barre",
      tuning,
      chord: C_MAJOR_CHORD,
      frets: [12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    }),
  ];

  const userPositionRows: readonly UserChordShapePositionRow[] = [
    ...buildPositionRows({
      shapeId: "user-shape-c-personal",
      tuning,
      chord: C_MAJOR_CHORD,
      frets: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    }),
  ];

  const catalogBarreRows: readonly CatalogChordShapeBarreRow[] = [
    {
      id: "catalog-shape-c-barre-barre-1",
      shape_id: "catalog-shape-c-barre",
      fret: 12,
      from_physical_string: 1,
      to_physical_string: 10,
      finger: "1",
      sort_order: 1,
    },
  ];

  const userBarreRows: readonly UserChordShapeBarreRow[] = [];

  const favoriteRows: readonly FavoriteRow[] = [
    {
      id: "favorite-shape-b",
      entity_type: "chord_shape",
      entity_origin: "catalog",
      entity_id: "catalog-shape-c-barre",
      created_at: TIMESTAMP,
    },
  ];

  const normalizeSql = (source: string): string => source.replace(/\s+/g, " ").trim().toLowerCase();

  const findQualityById = (qualityId: string): CatalogChordQualityRow | null =>
    catalogChordQualityRows.find((row) => row.id === qualityId) ?? null;

  const findChordByDefinition = (
    rootPitchClass: PitchClass,
    qualityId: string,
    bassPitchClass: PitchClass | null,
  ): CatalogChordRow | null =>
    catalogChordRows.find(
      (row) =>
        row.root_pitch_class === rootPitchClass &&
        row.quality_id === qualityId &&
        row.bass_pitch_class === bassPitchClass,
    ) ?? null;

  const findChordById = (chordId: string): CatalogChordRow | null =>
    catalogChordRows.find((row) => row.id === chordId) ?? null;

  const findCatalogShapeById = (shapeId: string): CatalogChordShapeRow | null =>
    catalogShapeRows.find((row) => row.id === shapeId) ?? null;

  const findUserShapeById = (shapeId: string): UserChordShapeRow | null =>
    userShapeRows.find((row) => row.id === shapeId && row.deleted_at === null) ?? null;

  const filterCatalogShapesByChord = (chordId: string, tuningId: string): CatalogChordShapeRow[] =>
    catalogShapeRows
      .filter((row) => row.chord_id === chordId && row.tuning_id === tuningId)
      .sort((left, right) => {
        if (left.is_recommended !== right.is_recommended) {
          return right.is_recommended - left.is_recommended;
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

        if (left.sort_order !== right.sort_order) {
          return left.sort_order - right.sort_order;
        }

        return left.variation_number - right.variation_number;
      });

  const filterUserShapes = (
    tuningOrigin: ContentOrigin,
    tuningId: string,
    rootPitchClass: PitchClass,
    qualityId: string,
    bassPitchClass: PitchClass | null,
  ): UserChordShapeRow[] =>
    userShapeRows
      .filter(
        (row) =>
          row.tuning_origin === tuningOrigin &&
          row.tuning_id === tuningId &&
          row.deleted_at === null &&
          row.chord_root_pitch_class === rootPitchClass &&
          row.chord_quality_id === qualityId &&
          row.bass_pitch_class === bassPitchClass,
      )
      .sort((left, right) => right.updated_at.localeCompare(left.updated_at) || right.created_at.localeCompare(left.created_at));

  return {
    execAsync: () => Promise.resolve(),
    runAsync: () =>
      Promise.resolve({
        lastInsertRowId: 1,
        changes: 1,
      }),
    getFirstAsync: <T = Readonly<Record<string, unknown>>>(source: string, ...params: readonly unknown[]): Promise<T | null> => {
      const normalized = normalizeSql(source);

      if (normalized.includes("from catalog_chord_qualities") && normalized.includes("where id = ?")) {
        return Promise.resolve((findQualityById(String(params[0])) as unknown as T | null) ?? null);
      }

      if (normalized.includes("from catalog_chords") && normalized.includes("where id = ?")) {
        return Promise.resolve((findChordById(String(params[0])) as unknown as T | null) ?? null);
      }

      if (normalized.includes("from catalog_chords") && normalized.includes("root_pitch_class = ?")) {
        return Promise.resolve(
          (findChordByDefinition(
            Number(params[0]) as PitchClass,
            String(params[1]),
            params[2] === null ? null : (Number(params[2]) as PitchClass),
          ) as unknown as T | null) ?? null,
        );
      }

      if (normalized.includes("from catalog_chord_shapes") && normalized.includes("where id = ?")) {
        return Promise.resolve((findCatalogShapeById(String(params[0])) as unknown as T | null) ?? null);
      }

      if (normalized.includes("from user_chord_shapes") && normalized.includes("where id = ?")) {
        return Promise.resolve((findUserShapeById(String(params[0])) as unknown as T | null) ?? null);
      }

      if (normalized.includes("from user_favorites")) {
        const row = favoriteRows.find(
          (entry) =>
            entry.entity_type === String(params[0]) &&
            entry.entity_origin === String(params[1]) &&
            entry.entity_id === String(params[2]),
        );

        return Promise.resolve((row as unknown as T | null) ?? null);
      }

      if (normalized.includes("from catalog_tunings") && normalized.includes("order by is_featured desc")) {
        return Promise.resolve(null);
      }

      if (normalized.includes("from user_tunings") && normalized.includes("order by updated_at desc")) {
        return Promise.resolve(null);
      }

      throw new Error(`Unexpected getFirstAsync query: ${source}`);
    },
    getAllAsync: <T = Readonly<Record<string, unknown>>>(source: string, ...params: readonly unknown[]): Promise<readonly T[]> => {
      const normalized = normalizeSql(source);

      if (normalized.includes("from catalog_chord_qualities")) {
        return Promise.resolve(
          [...catalogChordQualityRows].sort((left, right) => left.sort_order - right.sort_order || left.name.localeCompare(right.name)) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_chord_quality_intervals")) {
        return Promise.resolve(MAJOR_INTERVALS.filter((row) => row.quality_id === String(params[0])) as unknown as readonly T[]);
      }

      if (normalized.includes("from catalog_chord_shapes") && normalized.includes("chord_id = ?") && normalized.includes("tuning_id = ?")) {
        return Promise.resolve(filterCatalogShapesByChord(String(params[0]), String(params[1])) as unknown as readonly T[]);
      }

      if (normalized.includes("from catalog_chord_shape_positions")) {
        return Promise.resolve(
          catalogPositionRows
            .filter((row) => row.shape_id === String(params[0]))
            .sort((left, right) => left.physical_string_number - right.physical_string_number) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from catalog_chord_shape_barres")) {
        return Promise.resolve(
          catalogBarreRows
            .filter((row) => row.shape_id === String(params[0]))
            .sort((left, right) => left.sort_order - right.sort_order) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from user_chord_shapes") && normalized.includes("tuning_origin = ?")) {
        return Promise.resolve(
          filterUserShapes(
            String(params[0]) as ContentOrigin,
            String(params[1]),
            Number(params[2]) as PitchClass,
            String(params[3]),
            params[4] === null ? null : (Number(params[4]) as PitchClass),
          ) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from user_chord_shape_positions")) {
        return Promise.resolve(
          userPositionRows
            .filter((row) => row.shape_id === String(params[0]))
            .sort((left, right) => left.physical_string_number - right.physical_string_number) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from user_chord_shape_barres")) {
        return Promise.resolve(
          userBarreRows
            .filter((row) => row.shape_id === String(params[0]))
            .sort((left, right) => left.sort_order - right.sort_order) as unknown as readonly T[],
        );
      }

      if (normalized.includes("from user_favorites")) {
        return Promise.resolve(
          favoriteRows.filter(
            (entry) =>
              entry.entity_type === String(params[0]) &&
              entry.entity_origin === String(params[1]) &&
              entry.entity_id === String(params[2]),
          ) as unknown as readonly T[],
        );
      }

      return Promise.resolve([] as readonly T[]);
    },
    withTransactionAsync: <T>(task: () => Promise<T>): Promise<T> => task(),
    withExclusiveTransactionAsync: <T>(task: () => Promise<T>): Promise<T> => task(),
    closeAsync: () => Promise.resolve(),
  };
}

function createTuningRepositoryStub(tuning: TuningDetails) {
  return {
    getByRef: (ref: EntityRef<"tuning">): Promise<TuningDetails | null> =>
      Promise.resolve(ref.id === tuning.id && ref.origin === tuning.origin ? tuning : null),
  };
}

describe("chord repository", () => {
  it("resolves queries and mantém a leitura dos shapes com filtros combináveis", async () => {
    const database = buildChordRepositoryFakeDatabase();
    const tuning = createTuning();
    const repository = createChordRepository(database, {
      tuningRepository: createTuningRepositoryStub(tuning),
    });

    const resolved = await repository.resolveChord("Ré com sétima");

    expect(resolved).toMatchObject({
      chord: {
        rootPitchClass: 2,
        qualityId: "dominant_7",
        bassPitchClass: null,
      },
      symbol: "D7",
    });

    const found = await repository.findChord(C_MAJOR_CHORD);

    expect(found).toEqual({
      id: "catalog-chord-c",
      rootPitchClass: 0,
      qualityId: "major",
      bassPitchClass: null,
      canonicalSymbol: "C",
      normalizedSearchText: "c",
      createdAt: TIMESTAMP,
    });

    const shapes = await repository.listShapes(TUNING_REF, C_MAJOR_CHORD);

    expect(shapes).toHaveLength(3);
    expect(shapes[0]).toMatchObject({
      ref: {
        type: "chord_shape",
        origin: "catalog",
        id: "catalog-shape-c-open",
      },
      verificationStatus: "verified",
      isRecommended: true,
      symbol: "C",
    });
    expect(shapes[0]?.positions).toHaveLength(10);
    expect(shapes[1]).toMatchObject({
      ref: {
        type: "chord_shape",
        origin: "catalog",
        id: "catalog-shape-c-barre",
      },
      verificationStatus: "calculated",
      isFavorite: true,
      hasBarre: true,
      positionRegion: "high",
    });
    expect(shapes[1]?.positions).toHaveLength(10);
    expect(shapes[2]).toMatchObject({
      ref: {
        type: "chord_shape",
        origin: "user",
        id: "user-shape-c-personal",
      },
      verificationStatus: "user_created",
      positionRegion: "open",
    });

    const barreShapes = await repository.listShapes(TUNING_REF, C_MAJOR_CHORD, {
      origin: "catalog",
      hasBarre: true,
      verificationStatus: "calculated",
    });

    expect(barreShapes).toHaveLength(1);
    expect(barreShapes[0]).toMatchObject({
      ref: {
        type: "chord_shape",
        origin: "catalog",
        id: "catalog-shape-c-barre",
      },
      isFavorite: true,
      verificationStatus: "calculated",
      positionRegion: "high",
    });
  });

  it("carrega uma forma específica pelo ref e preserva o status do view model", async () => {
    const database = buildChordRepositoryFakeDatabase();
    const tuning = createTuning();
    const repository = createChordRepository(database, {
      tuningRepository: createTuningRepositoryStub(tuning),
    });

    const shape = await repository.getShape({
      type: "chord_shape",
      origin: "catalog",
      id: "catalog-shape-c-barre",
    });

    expect(shape).not.toBeNull();
    expect(shape).toMatchObject({
      ref: {
        type: "chord_shape",
        origin: "catalog",
        id: "catalog-shape-c-barre",
      },
      name: "Barre C",
      symbol: "C",
      verificationStatus: "calculated",
      isRecommended: false,
      isFavorite: true,
      hasBarre: true,
      positionRegion: "high",
    });
    expect(shape?.positions).toHaveLength(10);
  });
});
