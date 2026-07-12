import type {
  BackupManifest,
  BackupPayloadV1,
  ChordBarre,
  ChordDefinition,
  ChordShapeDetails,
  ChordStringPosition,
  EntityRef,
  ImportedSong,
  SongDocument,
  SongLineDocument,
  SongSectionDocument,
  SongSegmentDocument,
  TuningCourseDetails,
  TuningDetails,
  TuningStringDetails,
  UserAppPreferences,
  UserAppearancePreferences,
  UserAudioPreferences,
  UserMetronomePreferences,
  UserProfile,
  UserPreferences,
  UserSongPreference,
  UserStagePreferences,
  UserTunerPreferences,
} from "@/types/music";

import {
  midiToFrequency,
  pitchClassToMidi,
} from "@/domain/music/conversions";
import {
  isChordFinger,
  isContentOrigin,
  isDifficultyLevel,
  isFiniteNumber,
  isInteger,
  isPairType,
  isPitchClass,
  isPlainObject,
  isUniqueValues,
  isVerificationStatus,
} from "@/domain/music/validation";

export interface ValidationIssue {
  readonly path: string;
  readonly message: string;
}

export class SchemaValidationError extends Error {
  public readonly issues: readonly ValidationIssue[];

  constructor(issues: readonly ValidationIssue[]) {
    super(
      issues.length === 1
        ? `${issues[0]?.path ? `${issues[0].path}: ` : ""}${issues[0]?.message ?? "Invalid value"}`
        : `Schema validation failed with ${issues.length} issue(s).`,
    );
    this.name = "SchemaValidationError";
    this.issues = issues;
  }
}

export interface SafeParseSuccess<T> {
  readonly success: true;
  readonly data: T;
}

export interface SafeParseFailure {
  readonly success: false;
  readonly error: SchemaValidationError;
}

export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseFailure;

export interface Schema<T> {
  readonly parse: (value: unknown) => T;
  readonly safeParse: (value: unknown) => SafeParseResult<T>;
}

function createIssue(path: string, message: string): SchemaValidationError {
  return new SchemaValidationError([{ path, message }]);
}

function createSchema<T>(parser: (value: unknown) => T): Schema<T> {
  return {
    parse(value: unknown): T {
      return parser(value);
    },
    safeParse(value: unknown): SafeParseResult<T> {
      try {
        return {
          success: true,
          data: parser(value),
        };
      } catch (error) {
        if (error instanceof SchemaValidationError) {
          return {
            success: false,
            error,
          };
        }

        return {
          success: false,
          error: new SchemaValidationError([
            {
              path: "",
              message: error instanceof Error ? error.message : "Invalid value",
            },
          ]),
        };
      }
    },
  };
}

function expectPlainObject(value: unknown, path: string): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw createIssue(path, "Expected an object.");
  }

  return value;
}

function expectArray(value: unknown, path: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    throw createIssue(path, "Expected an array.");
  }

  return value;
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw createIssue(path, "Expected a string.");
  }

  return value;
}

function expectNonEmptyString(value: unknown, path: string): string {
  const result = expectString(value, path);
  if (result.trim().length === 0) {
    throw createIssue(path, "Expected a non-empty string.");
  }

  return result;
}

function expectBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw createIssue(path, "Expected a boolean.");
  }

  return value;
}

function expectInteger(value: unknown, path: string): number {
  if (!isInteger(value)) {
    throw createIssue(path, "Expected an integer.");
  }

  return value;
}

function expectFiniteNumber(value: unknown, path: string): number {
  if (!isFiniteNumber(value)) {
    throw createIssue(path, "Expected a finite number.");
  }

  return value;
}

function expectLiteral<T extends string | number | boolean>(
  value: unknown,
  path: string,
  literal: T,
): T {
  if (value !== literal) {
    throw createIssue(path, `Expected ${JSON.stringify(literal)}.`);
  }

  return literal;
}

function expectOneOf<T extends string | number | boolean>(
  value: unknown,
  path: string,
  allowedValues: readonly T[],
): T {
  if (!allowedValues.some((allowedValue) => allowedValue === value)) {
    throw createIssue(path, `Expected one of: ${allowedValues.join(", ")}.`);
  }

  return value as T;
}

function expectOptionalString(
  record: Record<string, unknown>,
  key: string,
  path: string,
): string | undefined {
  if (!(key in record) || record[key] === undefined) {
    return undefined;
  }

  return expectString(record[key], `${path}.${key}`);
}

function expectOptionalNonEmptyString(
  record: Record<string, unknown>,
  key: string,
  path: string,
): string | undefined {
  if (!(key in record) || record[key] === undefined) {
    return undefined;
  }

  return expectNonEmptyString(record[key], `${path}.${key}`);
}

function expectOptionalNullableString(
  record: Record<string, unknown>,
  key: string,
  path: string,
): string | null | undefined {
  if (!(key in record) || record[key] === undefined) {
    return undefined;
  }

  if (record[key] === null) {
    return null;
  }

  return expectString(record[key], `${path}.${key}`);
}

function expectOptionalPitchClass(
  record: Record<string, unknown>,
  key: string,
  path: string,
): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | null | undefined {
  if (!(key in record) || record[key] === undefined) {
    return undefined;
  }

  if (record[key] === null) {
    return null;
  }

  if (!isPitchClass(record[key])) {
    throw createIssue(path, "Expected a pitch class between 0 and 11.");
  }

  return record[key];
}

function expectPositiveInteger(value: unknown, path: string): number {
  const result = expectInteger(value, path);
  if (result <= 0) {
    throw createIssue(path, "Expected a positive integer.");
  }

  return result;
}

function expectIntegerInRange(value: unknown, path: string, min: number, max: number): number {
  const result = expectInteger(value, path);
  if (result < min || result > max) {
    throw createIssue(path, `Expected an integer between ${min} and ${max}.`);
  }

  return result;
}

function expectFiniteNumberInRange(value: unknown, path: string, min: number, max: number): number {
  const result = expectFiniteNumber(value, path);
  if (result < min || result > max) {
    throw createIssue(path, `Expected a number between ${min} and ${max}.`);
  }

  return result;
}

function parseChordDefinition(value: unknown, path: string): ChordDefinition {
  const record = expectPlainObject(value, path);
  const data = record;

  return {
    id: expectOptionalNonEmptyString(record, "id", path),
    rootPitchClass: expectPitchClassField(record, "rootPitchClass", path),
    qualityId: expectNonEmptyString(data["qualityId"], `${path}.qualityId`),
    bassPitchClass: expectOptionalPitchClass(record, "bassPitchClass", path),
  };
}

function parseChordToken(
  value: unknown,
  path: string,
): ChordDefinition & {
  readonly originalSpelling?: string;
  readonly harmonicDegree?: string | null;
} {
  const record = expectPlainObject(value, path);
  const data = record;
  const chord = parseChordDefinition(record, path);
  const originalSpelling =
    data["originalSpelling"] === undefined
      ? undefined
      : (() => {
          const parsed = expectString(data["originalSpelling"], `${path}.originalSpelling`);
          if (parsed.length > 32) {
            throw createIssue(`${path}.originalSpelling`, "Expected a string with at most 32 characters.");
          }

          return parsed;
        })();
  const harmonicDegree =
    data["harmonicDegree"] === undefined
      ? undefined
      : data["harmonicDegree"] === null
        ? null
        : (() => {
            const parsed = expectString(data["harmonicDegree"], `${path}.harmonicDegree`);
            if (parsed.length > 16) {
              throw createIssue(`${path}.harmonicDegree`, "Expected a string with at most 16 characters.");
            }

            return parsed;
          })();

  return {
    ...chord,
    originalSpelling,
    harmonicDegree,
  };
}

function expectPitchClassField(record: Record<string, unknown>, key: string, path: string) {
  const value = record[key];
  if (!isPitchClass(value)) {
    throw createIssue(`${path}.${key}`, "Expected a pitch class between 0 and 11.");
  }

  return value;
}

function parseTuningStringDetails(
  value: unknown,
  path: string,
): TuningStringDetails {
  const record = expectPlainObject(value, path);
  const data = record;
  const pitchClass = expectPitchClassField(record, "pitchClass", path);
  const octave = expectIntegerInRange(data["octave"], `${path}.octave`, 0, 8);
  const midiNote = expectIntegerInRange(data["midiNote"], `${path}.midiNote`, 0, 127);
  const referenceFrequency440 = expectFiniteNumber(data["referenceFrequency440"], `${path}.referenceFrequency440`);

  const expectedMidi = pitchClassToMidi(pitchClass, octave);
  if (midiNote !== expectedMidi) {
    throw createIssue(`${path}.midiNote`, `Expected MIDI ${expectedMidi} for pitch class ${pitchClass} and octave ${octave}.`);
  }

  const expectedFrequency = midiToFrequency(midiNote, 440);
  if (Math.abs(referenceFrequency440 - expectedFrequency) > 0.01) {
    throw createIssue(
      `${path}.referenceFrequency440`,
      `Expected frequency close to ${expectedFrequency.toFixed(6)} Hz.`,
    );
  }

  return {
    id: expectNonEmptyString(data["id"], `${path}.id`),
    physicalStringNumber: expectIntegerInRange(data["physicalStringNumber"], `${path}.physicalStringNumber`, 1, 10) as
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6
      | 7
      | 8
      | 9
      | 10,
    stringInCourse: expectStringInCourse(data["stringInCourse"], `${path}.stringInCourse`),
    pitchClass,
    octave,
    midiNote,
    referenceFrequency440,
  };
}

function expectStringInCourse(value: unknown, path: string): 1 | 2 {
  return expectOneOf(value, path, [1, 2] as const);
}

function parseTuningCourseDetails(value: unknown, path: string): TuningCourseDetails {
  const record = expectPlainObject(value, path);
  const data = record;
  const strings = expectArray(data["strings"], `${path}.strings`);

  if (strings.length !== 2) {
    throw createIssue(`${path}.strings`, "Expected exactly 2 strings per course.");
  }

  const parsedStrings = strings.map((stringValue, index) =>
    parseTuningStringDetails(stringValue, `${path}.strings[${index}]`),
  ) as unknown as readonly [TuningStringDetails, TuningStringDetails];

  const courseNumber = expectOneOf(data["courseNumber"], `${path}.courseNumber`, [1, 2, 3, 4, 5] as const);

  if (!isPairType(data["pairType"])) {
    throw createIssue(`${path}.pairType`, "Expected a valid pair type.");
  }

  const [firstString, secondString] = parsedStrings;
  const samePitchClass = firstString.pitchClass === secondString.pitchClass;
  const sameOctave = firstString.octave === secondString.octave;
  const octaveDifference = Math.abs(firstString.octave - secondString.octave);

  if (data["pairType"] === "unison" && (!samePitchClass || !sameOctave)) {
    throw createIssue(path, "Expected unison strings to share pitch class and octave.");
  }

  if (data["pairType"] === "octave" && (!samePitchClass || octaveDifference !== 1)) {
    throw createIssue(path, "Expected octave pairs to share pitch class and differ by one octave.");
  }

  return {
    id: expectNonEmptyString(data["id"], `${path}.id`),
    courseNumber,
    pairType: data["pairType"],
    strings: parsedStrings,
  };
}

function parseTuningDetails(value: unknown): TuningDetails {
  const path = "tuning";
  const record = expectPlainObject(value, path);
  const data = record;
  const aliases = expectArray(data["aliases"], `${path}.aliases`);
  const courses = expectArray(data["courses"], `${path}.courses`);

  if (courses.length !== 5) {
    throw createIssue(`${path}.courses`, "Expected exactly 5 courses.");
  }

  const parsedAliases = aliases.map((alias, index) => expectNonEmptyString(alias, `${path}.aliases[${index}]`));
  const normalizedAliases = parsedAliases.map((alias) => alias.trim().toLowerCase());
  if (!isUniqueValues(normalizedAliases)) {
    throw createIssue(`${path}.aliases`, "Expected unique aliases.");
  }

  const parsedCourses = courses.map((course, index) =>
    parseTuningCourseDetails(course, `${path}.courses[${index}]`),
  ) as readonly TuningCourseDetails[];

  const seenCourseNumbers = new Set<number>();
  const seenPhysicalStringNumbers = new Set<number>();
  for (const course of parsedCourses) {
    if (seenCourseNumbers.has(course.courseNumber)) {
      throw createIssue(`${path}.courses`, "Expected unique course numbers.");
    }

    seenCourseNumbers.add(course.courseNumber);

    const [firstString, secondString] = course.strings;
    for (const stringDetails of [firstString, secondString]) {
      if (seenPhysicalStringNumbers.has(stringDetails.physicalStringNumber)) {
        throw createIssue(`${path}.courses`, "Expected unique physical string numbers.");
      }

      seenPhysicalStringNumbers.add(stringDetails.physicalStringNumber);
    }
  }

  if (seenPhysicalStringNumbers.size !== 10) {
    throw createIssue(`${path}.courses`, "Expected exactly 10 physical strings.");
  }

  return {
    id: expectNonEmptyString(data["id"], `${path}.id`),
    origin: expectContentOrigin(data["origin"], `${path}.origin`),
    name: expectNonEmptyString(data["name"], `${path}.name`),
    shortName: expectNonEmptyString(data["shortName"], `${path}.shortName`),
    aliases: parsedAliases,
    description: expectOptionalNullableString(record, "description", path),
    courses: parsedCourses,
    verificationStatus: expectVerificationStatus(data["verificationStatus"], `${path}.verificationStatus`),
    tensionWarning: expectOptionalNullableString(record, "tensionWarning", path),
  };
}

function expectContentOrigin(value: unknown, path: string) {
  if (!isContentOrigin(value)) {
    throw createIssue(path, "Expected a valid content origin.");
  }

  return value;
}

function expectVerificationStatus(value: unknown, path: string) {
  if (!isVerificationStatus(value)) {
    throw createIssue(path, "Expected a valid verification status.");
  }

  return value;
}

function parseChordBarre(value: unknown, path: string): ChordBarre {
  const record = expectPlainObject(value, path);
  const data = record;
  const finger = data["finger"];

  if (!isChordFinger(finger)) {
    throw createIssue(`${path}.finger`, "Expected a valid barre finger.");
  }

  const fret = expectIntegerInRange(data["fret"], `${path}.fret`, 1, 30);
  const fromPhysicalString = expectIntegerInRange(data["fromPhysicalString"], `${path}.fromPhysicalString`, 1, 10) as
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10;
  const toPhysicalString = expectIntegerInRange(data["toPhysicalString"], `${path}.toPhysicalString`, 1, 10) as
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10;

  if (toPhysicalString < fromPhysicalString) {
    throw createIssue(path, "Expected toPhysicalString to be greater than or equal to fromPhysicalString.");
  }

  return {
    fret,
    fromPhysicalString,
    toPhysicalString,
    finger,
  };
}

function parseChordStringPosition(value: unknown, path: string): ChordStringPosition {
  const record = expectPlainObject(value, path);
  const data = record;

  const physicalStringNumber = expectIntegerInRange(
    data["physicalStringNumber"],
    `${path}.physicalStringNumber`,
    1,
    10,
  ) as ChordStringPosition["physicalStringNumber"];

  const courseNumber = expectIntegerInRange(data["courseNumber"], `${path}.courseNumber`, 1, 5) as ChordStringPosition["courseNumber"];
  const stringInCourse = expectStringInCourse(data["stringInCourse"], `${path}.stringInCourse`);
  const fret = expectIntegerInRange(data["fret"], `${path}.fret`, -1, 30);
  const fingerValue = data["finger"];
  const finger = fingerValue === null ? null : isChordFinger(fingerValue) ? fingerValue : null;

  if (fingerValue !== null && finger === null) {
    throw createIssue(`${path}.finger`, "Expected a valid finger or null.");
  }

  const pitchClass = data["pitchClass"] === null ? null : expectPitchClassField(record, "pitchClass", path);
  const octave = data["octave"] === null ? null : expectIntegerInRange(data["octave"], `${path}.octave`, 0, 8);
  const intervalLabel = expectOptionalNullableString(record, "intervalLabel", path) ?? null;

  return {
    physicalStringNumber,
    courseNumber,
    stringInCourse,
    fret,
    finger,
    pitchClass,
    octave,
    intervalLabel,
  };
}

function parseChordShapeDetails(value: unknown): ChordShapeDetails {
  const path = "chordShape";
  const record = expectPlainObject(value, path);
  const data = record;
  const positions = expectArray(data["positions"], `${path}.positions`);
  const barres = expectArray(data["barres"], `${path}.barres`);

  if (positions.length !== 10) {
    throw createIssue(`${path}.positions`, "Expected exactly 10 positions.");
  }

  const parsedPositions = positions.map((position, index) =>
    parseChordStringPosition(position, `${path}.positions[${index}]`),
  ) as readonly ChordStringPosition[];
  const parsedBarres = barres.map((barre, index) => parseChordBarre(barre, `${path}.barres[${index}]`));

  const physicalStringNumbers = parsedPositions.map((position) => position.physicalStringNumber);
  if (!isUniqueValues(physicalStringNumbers)) {
    throw createIssue(`${path}.positions`, "Expected unique physical string numbers.");
  }

  return {
    id: expectNonEmptyString(data["id"], `${path}.id`),
    origin: expectContentOrigin(data["origin"], `${path}.origin`),
    chord: parseChordDefinition(data["chord"], `${path}.chord`),
    tuning: parseEntityRef(data["tuning"], `${path}.tuning`, "tuning"),
    positions: parsedPositions,
    barres: parsedBarres,
    difficulty: expectDifficultyLevel(data["difficulty"], `${path}.difficulty`),
    verificationStatus: expectVerificationStatus(data["verificationStatus"], `${path}.verificationStatus`),
    isRecommended: expectBoolean(data["isRecommended"], `${path}.isRecommended`),
  };
}

function expectDifficultyLevel(value: unknown, path: string) {
  if (!isDifficultyLevel(value)) {
    throw createIssue(path, "Expected a valid difficulty level.");
  }

  return value;
}

function parseSongSegment(value: unknown, path: string): SongSegmentDocument {
  const record = expectPlainObject(value, path);
  const data = record;
  const type = expectOneOf(data["type"], `${path}.type`, ["text", "chord", "tab", "break"] as const);

  switch (type) {
    case "text":
      return {
        id: expectNonEmptyString(data["id"], `${path}.id`),
        type,
        text: expectString(data["text"], `${path}.text`),
      };
    case "chord":
      return {
        id: expectNonEmptyString(data["id"], `${path}.id`),
        type,
        chord: parseChordToken(data["chord"], `${path}.chord`),
        anchorOffset:
          data["anchorOffset"] === undefined
            ? undefined
            : expectIntegerInRange(data["anchorOffset"], `${path}.anchorOffset`, 0, Number.MAX_SAFE_INTEGER),
      };
    case "tab":
      return {
        id: expectNonEmptyString(data["id"], `${path}.id`),
        type,
        value: expectString(data["value"], `${path}.value`),
      };
    case "break":
      return {
        id: expectNonEmptyString(data["id"], `${path}.id`),
        type,
      };
    default:
      throw createIssue(`${path}.type`, "Unsupported segment type.");
  }
}

function parseSongLine(value: unknown, path: string): SongLineDocument {
  const record = expectPlainObject(value, path);
  const data = record;
  const type = expectOneOf(data["type"], `${path}.type`, [
    "lyrics",
    "chords",
    "tablature",
    "instruction",
    "blank",
  ] as const);
  const segments = expectArray(data["segments"], `${path}.segments`);

  return {
    id: expectNonEmptyString(data["id"], `${path}.id`),
    type,
    segments: segments.map((segment, index) => parseSongSegment(segment, `${path}.segments[${index}]`)),
  };
}

function parseSongSection(value: unknown, path: string): SongSectionDocument {
  const record = expectPlainObject(value, path);
  const data = record;
  const lines = expectArray(data["lines"], `${path}.lines`);
  const type = expectOneOf(data["type"], `${path}.type`, [
    "intro",
    "verse",
    "pre_chorus",
    "chorus",
    "bridge",
    "solo",
    "outro",
    "note",
    "custom",
  ] as const);

  return {
    id: expectNonEmptyString(data["id"], `${path}.id`),
    type,
    label: expectOptionalString(record, "label", path),
    repeatCount:
      data["repeatCount"] === undefined ? undefined : expectPositiveInteger(data["repeatCount"], `${path}.repeatCount`),
    lines: lines.map((line, index) => parseSongLine(line, `${path}.lines[${index}]`)),
  };
}

function collectDocumentIds(document: SongDocument): void {
  const ids = new Set<string>();

  for (const section of document.sections) {
    if (ids.has(section.id)) {
      throw createIssue("songDocument.sections", "Expected unique section IDs.");
    }

    ids.add(section.id);

    for (const line of section.lines) {
      if (ids.has(line.id)) {
        throw createIssue("songDocument.sections", "Expected unique line IDs.");
      }

      ids.add(line.id);

      for (const segment of line.segments) {
        if (ids.has(segment.id)) {
          throw createIssue("songDocument.sections", "Expected unique segment IDs.");
        }

        ids.add(segment.id);
      }
    }
  }
}

function parseSongDocument(value: unknown): SongDocument {
  const path = "songDocument";
  const record = expectPlainObject(value, path);
  const data = record;
  const sections = expectArray(data["sections"], `${path}.sections`);

  const parsedDocument: SongDocument = {
    version: expectLiteral(data["version"], `${path}.version`, 1),
    sections: sections.map((section, index) => parseSongSection(section, `${path}.sections[${index}]`)),
  };

  collectDocumentIds(parsedDocument);
  return parsedDocument;
}

function parseProfile(value: unknown): UserProfile {
  const path = "profile";
  const record = expectPlainObject(value, path);
  const data = record;

  return {
    id: expectLiteral(data["id"], `${path}.id`, "local_user"),
    experienceLevel: expectOneOf(data["experienceLevel"], `${path}.experienceLevel`, [
      "beginner",
      "intermediate",
      "advanced",
    ] as const),
    onboardingStatus: expectOneOf(data["onboardingStatus"], `${path}.onboardingStatus`, [
      "not_started",
      "in_progress",
      "completed",
    ] as const),
    onboardingStep: expectOptionalNullableString(record, "onboardingStep", path) ?? null,
    createdAt: expectNonEmptyString(data["createdAt"], `${path}.createdAt`),
    updatedAt: expectNonEmptyString(data["updatedAt"], `${path}.updatedAt`),
  };
}

function parseAppPreferences(value: unknown): UserAppPreferences {
  const path = "preferences.app";
  const record = expectPlainObject(value, path);
  const data = record;

  return {
    id: expectLiteral(data["id"], `${path}.id`, "app_preferences"),
    activeTuningOrigin: expectContentOrigin(data["activeTuningOrigin"], `${path}.activeTuningOrigin`),
    activeTuningId: expectNonEmptyString(data["activeTuningId"], `${path}.activeTuningId`),
    accidentalPreference: expectOneOf(data["accidentalPreference"], `${path}.accidentalPreference`, [
      "contextual",
      "sharps",
      "flats",
    ] as const),
    handedness: expectOneOf(data["handedness"], `${path}.handedness`, ["right", "left"] as const),
    diagramOrientation: expectOneOf(data["diagramOrientation"], `${path}.diagramOrientation`, [
      "standard",
      "mirrored",
    ] as const),
    diagramMode: expectOneOf(data["diagramMode"], `${path}.diagramMode`, ["five_courses", "ten_strings"] as const),
    showCalculatedShapes: expectBoolean(data["showCalculatedShapes"], `${path}.showCalculatedShapes`),
    expandTheoryDetails: expectBoolean(data["expandTheoryDetails"], `${path}.expandTheoryDetails`),
    locale: expectNonEmptyString(data["locale"], `${path}.locale`),
    updatedAt: expectNonEmptyString(data["updatedAt"], `${path}.updatedAt`),
  };
}

function parseAppearancePreferences(value: unknown): UserAppearancePreferences {
  const path = "preferences.appearance";
  const record = expectPlainObject(value, path);
  const data = record;

  return {
    id: expectLiteral(data["id"], `${path}.id`, "appearance_preferences"),
    themeMode: expectOneOf(data["themeMode"], `${path}.themeMode`, ["system", "light", "dark"] as const),
    highContrast: expectBoolean(data["highContrast"], `${path}.highContrast`),
    internalTextScale: expectOneOf(data["internalTextScale"], `${path}.internalTextScale`, [
      "system",
      "large",
      "extra_large",
    ] as const),
    reduceDecorativeTextures: expectBoolean(
      data["reduceDecorativeTextures"],
      `${path}.reduceDecorativeTextures`,
    ),
    updatedAt: expectNonEmptyString(data["updatedAt"], `${path}.updatedAt`),
  };
}

function parseTunerPreferences(value: unknown): UserTunerPreferences {
  const path = "preferences.tuner";
  const record = expectPlainObject(value, path);
  const data = record;

  return {
    id: expectLiteral(data["id"], `${path}.id`, "tuner_preferences"),
    calibrationA4: expectFiniteNumberInRange(data["calibrationA4"], `${path}.calibrationA4`, 415, 466),
    toleranceCents: expectIntegerInRange(data["toleranceCents"], `${path}.toleranceCents`, 1, 20),
    autoAdvance: expectBoolean(data["autoAdvance"], `${path}.autoAdvance`),
    vibrateWhenInTune: expectBoolean(data["vibrateWhenInTune"], `${path}.vibrateWhenInTune`),
    keepScreenAwake: expectBoolean(data["keepScreenAwake"], `${path}.keepScreenAwake`),
    showFrequency: expectBoolean(data["showFrequency"], `${path}.showFrequency`),
    noiseFilterLevel: expectOneOf(data["noiseFilterLevel"], `${path}.noiseFilterLevel`, [
      "low",
      "medium",
      "high",
    ] as const),
    lastMode: expectOneOf(data["lastMode"], `${path}.lastMode`, ["guided", "chromatic", "reference"] as const),
    updatedAt: expectNonEmptyString(data["updatedAt"], `${path}.updatedAt`),
  };
}

function parseAudioPreferences(value: unknown): UserAudioPreferences {
  const path = "preferences.audio";
  const record = expectPlainObject(value, path);
  const data = record;

  return {
    id: expectLiteral(data["id"], `${path}.id`, "audio_preferences"),
    referenceVolume: expectFiniteNumberInRange(data["referenceVolume"], `${path}.referenceVolume`, 0, 1),
    metronomeVolume: expectFiniteNumberInRange(data["metronomeVolume"], `${path}.metronomeVolume`, 0, 1),
    firstBeatAccent: expectBoolean(data["firstBeatAccent"], `${path}.firstBeatAccent`),
    spokenCountIn: expectBoolean(data["spokenCountIn"], `${path}.spokenCountIn`),
    hapticsEnabled: expectBoolean(data["hapticsEnabled"], `${path}.hapticsEnabled`),
    confirmationSoundsEnabled: expectBoolean(
      data["confirmationSoundsEnabled"],
      `${path}.confirmationSoundsEnabled`,
    ),
    updatedAt: expectNonEmptyString(data["updatedAt"], `${path}.updatedAt`),
  };
}

function parseStagePreferences(value: unknown): UserStagePreferences {
  const path = "preferences.stage";
  const record = expectPlainObject(value, path);
  const data = record;
  const defaultScrollSpeed = expectFiniteNumber(data["defaultScrollSpeed"], `${path}.defaultScrollSpeed`);
  if (defaultScrollSpeed <= 0) {
    throw createIssue(`${path}.defaultScrollSpeed`, "Expected a positive number.");
  }

  const defaultFontScale = expectFiniteNumber(data["defaultFontScale"], `${path}.defaultFontScale`);
  if (defaultFontScale <= 0) {
    throw createIssue(`${path}.defaultFontScale`, "Expected a positive number.");
  }

  return {
    id: expectLiteral(data["id"], `${path}.id`, "stage_preferences"),
    keepScreenAwake: expectBoolean(data["keepScreenAwake"], `${path}.keepScreenAwake`),
    autoHideControls: expectBoolean(data["autoHideControls"], `${path}.autoHideControls`),
    tapToPause: expectBoolean(data["tapToPause"], `${path}.tapToPause`),
    defaultScrollSpeed,
    defaultFontScale,
    preferredOrientation: expectOneOf(data["preferredOrientation"], `${path}.preferredOrientation`, [
      "system",
      "portrait",
      "landscape",
    ] as const),
    forceHighContrast: expectBoolean(data["forceHighContrast"], `${path}.forceHighContrast`),
    lockControlsOnStart: expectBoolean(data["lockControlsOnStart"], `${path}.lockControlsOnStart`),
    updatedAt: expectNonEmptyString(data["updatedAt"], `${path}.updatedAt`),
  };
}

function parseMetronomePreferences(value: unknown): UserMetronomePreferences {
  const path = "preferences.metronome";
  const record = expectPlainObject(value, path);
  const data = record;

  return {
    id: expectLiteral(data["id"], `${path}.id`, "metronome_preferences"),
    lastBpm: expectFiniteNumberInRange(data["lastBpm"], `${path}.lastBpm`, 20, 400),
    timeSignatureNumerator: expectIntegerInRange(data["timeSignatureNumerator"], `${path}.timeSignatureNumerator`, 1, 32),
    timeSignatureDenominator: expectOneOf(data["timeSignatureDenominator"], `${path}.timeSignatureDenominator`, [
      2,
      4,
      8,
      16,
    ] as const),
    accentFirstBeat: expectBoolean(data["accentFirstBeat"], `${path}.accentFirstBeat`),
    countInBars: expectIntegerInRange(data["countInBars"], `${path}.countInBars`, 0, 32),
    visualPulseEnabled: expectBoolean(data["visualPulseEnabled"], `${path}.visualPulseEnabled`),
    updatedAt: expectNonEmptyString(data["updatedAt"], `${path}.updatedAt`),
  };
}

function parseUserPreferences(value: unknown): UserPreferences {
  const path = "preferences";
  const record = expectPlainObject(value, path);
  const data = record;

  return {
    app: parseAppPreferences(data["app"]),
    appearance: parseAppearancePreferences(data["appearance"]),
    tuner: parseTunerPreferences(data["tuner"]),
    audio: parseAudioPreferences(data["audio"]),
    stage: parseStagePreferences(data["stage"]),
    metronome: parseMetronomePreferences(data["metronome"]),
  };
}

function parseSongPreference(value: unknown, path: string): UserSongPreference {
  const record = expectPlainObject(value, path);
  const data = record;
  const stageFontScale =
    data["stageFontScale"] === undefined || data["stageFontScale"] === null
      ? null
      : (() => {
          const parsed = expectFiniteNumber(data["stageFontScale"], `${path}.stageFontScale`);
          if (parsed <= 0) {
            throw createIssue(`${path}.stageFontScale`, "Expected a positive number.");
          }

          return parsed;
        })();
  const stageScrollSpeed =
    data["stageScrollSpeed"] === undefined || data["stageScrollSpeed"] === null
      ? null
      : (() => {
          const parsed = expectFiniteNumber(data["stageScrollSpeed"], `${path}.stageScrollSpeed`);
          if (parsed <= 0) {
            throw createIssue(`${path}.stageScrollSpeed`, "Expected a positive number.");
          }

          return parsed;
        })();

  return {
    id: expectNonEmptyString(data["id"], `${path}.id`),
    songOrigin: expectContentOrigin(data["songOrigin"], `${path}.songOrigin`),
    songId: expectNonEmptyString(data["songId"], `${path}.songId`),
    rememberedKeyPitchClass:
      data["rememberedKeyPitchClass"] === undefined
        ? null
        : data["rememberedKeyPitchClass"] === null
          ? null
          : expectPitchClassField(record, "rememberedKeyPitchClass", path),
    rememberedKeyMode:
      data["rememberedKeyMode"] === undefined
        ? null
        : data["rememberedKeyMode"] === null
          ? null
        : expectOneOf(data["rememberedKeyMode"], `${path}.rememberedKeyMode`, [
              "major",
              "minor",
              "modal",
              "unknown",
            ] as const),
    rememberKey: expectBoolean(data["rememberKey"], `${path}.rememberKey`),
    lastScrollPosition: expectFiniteNumberInRange(data["lastScrollPosition"], `${path}.lastScrollPosition`, 0, Number.MAX_SAFE_INTEGER),
    stageFontScale,
    stageScrollSpeed,
    preferredArrangementId:
      data["preferredArrangementId"] === undefined || data["preferredArrangementId"] === null
        ? null
        : expectNonEmptyString(data["preferredArrangementId"], `${path}.preferredArrangementId`),
    preferredShapeOverridesJson:
      data["preferredShapeOverridesJson"] === undefined || data["preferredShapeOverridesJson"] === null
        ? null
        : expectString(data["preferredShapeOverridesJson"], `${path}.preferredShapeOverridesJson`),
    lastOpenedAt: expectNonEmptyString(data["lastOpenedAt"], `${path}.lastOpenedAt`),
    updatedAt: expectNonEmptyString(data["updatedAt"], `${path}.updatedAt`),
  };
}

function parseBackupManifest(value: unknown): BackupManifest {
  const path = "backupManifest";
  const record = expectPlainObject(value, path);
  const data = record;
  const sections = expectArray(data["sections"], `${path}.sections`);
  const payloadChecksum = expectNonEmptyString(data["payloadChecksum"], `${path}.payloadChecksum`);

  if (!/^([a-f0-9]{64})$/i.test(payloadChecksum)) {
    throw createIssue(`${path}.payloadChecksum`, "Expected a SHA-256 checksum in hexadecimal form.");
  }

  return {
    format: expectLiteral(data["format"], `${path}.format`, "cifras-de-viola-backup"),
    formatVersion: expectLiteral(data["formatVersion"], `${path}.formatVersion`, 1),
    appVersion: expectNonEmptyString(data["appVersion"], `${path}.appVersion`),
    schemaVersion: expectIntegerInRange(data["schemaVersion"], `${path}.schemaVersion`, 1, Number.MAX_SAFE_INTEGER),
    catalogVersion: expectIntegerInRange(data["catalogVersion"], `${path}.catalogVersion`, 0, Number.MAX_SAFE_INTEGER),
    createdAt: expectNonEmptyString(data["createdAt"], `${path}.createdAt`),
    devicePlatform: expectOneOf(data["devicePlatform"], `${path}.devicePlatform`, [
      "android",
      "ios",
      "unknown",
    ] as const),
    sections: sections.map((section, index) => {
      const sectionRecord = expectPlainObject(section, `${path}.sections[${index}]`);
      const sectionData = sectionRecord;
      return {
        name: expectNonEmptyString(sectionData["name"], `${path}.sections[${index}].name`),
        itemCount: expectIntegerInRange(sectionData["itemCount"], `${path}.sections[${index}].itemCount`, 0, Number.MAX_SAFE_INTEGER),
        included: expectBoolean(sectionData["included"], `${path}.sections[${index}].included`),
      };
    }),
    checksumAlgorithm: expectLiteral(data["checksumAlgorithm"], `${path}.checksumAlgorithm`, "sha256"),
    payloadChecksum,
  };
}

function parseBackupPayload(value: unknown): BackupPayloadV1 {
  const path = "backupPayload";
  const record = expectPlainObject(value, path);
  const data = record;

  return {
    profile: data["profile"] === undefined ? undefined : parseProfile(data["profile"]),
    preferences: data["preferences"] === undefined ? undefined : parseUserPreferences(data["preferences"]),
    songs: parseOptionalJsonObjectCollection(record, "songs", path),
    songVersions: parseOptionalJsonObjectCollection(record, "songVersions", path),
    songNotes: parseOptionalJsonObjectCollection(record, "songNotes", path),
    tunings: parseOptionalJsonObjectCollection(record, "tunings", path),
    tuningCourses: parseOptionalJsonObjectCollection(record, "tuningCourses", path),
    tuningStrings: parseOptionalJsonObjectCollection(record, "tuningStrings", path),
    chordShapes: parseOptionalJsonObjectCollection(record, "chordShapes", path),
    favorites: parseOptionalJsonObjectCollection(record, "favorites", path),
    recentItems: parseOptionalJsonObjectCollection(record, "recentItems", path),
    practiceSessions: parseOptionalJsonObjectCollection(record, "practiceSessions", path),
    tuningSessions: parseOptionalJsonObjectCollection(record, "tuningSessions", path),
    tags: parseOptionalJsonObjectCollection(record, "tags", path),
    setlists: parseOptionalJsonObjectCollection(record, "setlists", path),
    songPreferences:
      data["songPreferences"] === undefined
        ? undefined
        : expectArray(data["songPreferences"], `${path}.songPreferences`).map((entry, index) =>
            parseSongPreference(entry, `${path}.songPreferences[${index}]`),
          ),
  };
}

function parseOptionalJsonObjectCollection(
  record: Record<string, unknown>,
  key: string,
  path: string,
): readonly Record<string, unknown>[] | undefined {
  if (!(key in record) || record[key] === undefined) {
    return undefined;
  }

  const collection = expectArray(record[key], `${path}.${key}`);
  return collection.map((entry, index) => expectPlainObject(entry, `${path}.${key}[${index}]`));
}

function parseImportedSong(value: unknown): ImportedSong {
  const path = "importedSong";
  const record = expectPlainObject(value, path);
  const data = record;

  return {
    title: expectNonEmptyString(data["title"], `${path}.title`),
    artist: expectOptionalNullableString(record, "artist", path),
    composer: expectOptionalNullableString(record, "composer", path),
    sourceName: expectOptionalNullableString(record, "sourceName", path),
    notes: expectOptionalNullableString(record, "notes", path),
    document: parseSongDocument(data["document"]),
  };
}

function parseEntityRef<TType extends string>(value: unknown, path: string, expectedType: TType): EntityRef<TType> {
  const record = expectPlainObject(value, path);
  const data = record;

  return {
    type: expectLiteral(data["type"], `${path}.type`, expectedType),
    origin: expectContentOrigin(data["origin"], `${path}.origin`),
    id: expectNonEmptyString(data["id"], `${path}.id`),
  };
}

export const SongDocumentSchema = createSchema<SongDocument>(parseSongDocument);
export const BackupManifestSchema = createSchema<BackupManifest>(parseBackupManifest);
export const BackupPayloadSchema = createSchema<BackupPayloadV1>(parseBackupPayload);
export const ImportedSongSchema = createSchema<ImportedSong>(parseImportedSong);
export const TuningSchema = createSchema<TuningDetails>(parseTuningDetails);
export const ChordShapeSchema = createSchema<ChordShapeDetails>(parseChordShapeDetails);
export const UserPreferencesSchema = createSchema<UserPreferences>(parseUserPreferences);

export const UserProfileSchema = createSchema<UserProfile>(parseProfile);
export const UserAppPreferencesSchema = createSchema<UserAppPreferences>(parseAppPreferences);
export const UserAppearancePreferencesSchema = createSchema<UserAppearancePreferences>(parseAppearancePreferences);
export const UserTunerPreferencesSchema = createSchema<UserTunerPreferences>(parseTunerPreferences);
export const UserAudioPreferencesSchema = createSchema<UserAudioPreferences>(parseAudioPreferences);
export const UserStagePreferencesSchema = createSchema<UserStagePreferences>(parseStagePreferences);
export const UserMetronomePreferencesSchema = createSchema<UserMetronomePreferences>(parseMetronomePreferences);

export const UserSongPreferenceSchema = createSchema<UserSongPreference>((value) =>
  parseSongPreference(value, "songPreference"),
);



