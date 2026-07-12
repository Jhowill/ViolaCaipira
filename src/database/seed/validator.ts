/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { SongDocumentSchema } from "@/validation";

import {
  SeedValidationError,
} from "@/types/seed";

import type {
  SeedBundleV1,
  SeedManifest,
  SeedRecord,
  SeedValidationIssue,
  SeedValidationResult,
} from "@/types/seed";

import { buildSeedManifest } from "@/database/seed/manifest";

const LICENSE_TYPES = new Set([
  "public_domain",
  "original",
  "authorized",
  "commercial",
  "educational",
  "unknown",
] as const);

const SOURCE_TYPES = new Set([
  "book",
  "article",
  "teacher",
  "musician",
  "field_research",
  "public_domain",
  "license",
  "internal",
] as const);

const DIFFICULTY_LEVELS = new Set(["beginner", "easy", "intermediate", "advanced"] as const);
const CHORD_QUALITY_FAMILIES = new Set([
  "major",
  "minor",
  "dominant",
  "diminished",
  "augmented",
  "suspended",
  "extended",
  "other",
] as const);
const VERIFICATION_STATUSES = new Set(["verified", "deprecated"] as const);
const CHORD_SHAPE_VERIFICATION_STATUSES = new Set(["verified", "calculated", "deprecated"] as const);
const CHORD_SHAPE_REGIONS = new Set(["open", "low", "middle", "high"] as const);
const PAIR_TYPES = new Set(["unison", "octave", "custom"] as const);
const ASSET_TYPES = new Set([
  "audio_note",
  "audio_chord",
  "audio_rhythm",
  "audio_count_in",
  "illustration",
  "icon",
  "document",
] as const);
const SONG_COPYRIGHT_STATUSES = new Set(["public_domain", "original", "authorized", "licensed"] as const);
const SONG_KEY_MODES = new Set(["major", "minor", "modal", "unknown"] as const);
const ARRANGEMENT_STATUSES = new Set(["verified", "calculated", "symbols_only", "unavailable"] as const);
const ARRANGEMENT_CHORD_STATUSES = new Set(["verified", "calculated", "symbol_only", "missing"] as const);
const SONG_RHYTHM_RELEVANCE = new Set(["primary", "alternative", "practice"] as const);
function createIssue(path: string, message: string): SeedValidationIssue {
  return { path, message };
}

function isRecord(value: unknown): value is SeedRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function arrayOrEmpty(bundle: SeedBundleV1, key: keyof SeedBundleV1): readonly SeedRecord[] {
  const value = bundle[key];

  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new TypeError(`Seed collection ${String(key)} must be an array.`);
  }

  return value;
}

function buildIdMap(
  collectionName: string,
  records: readonly SeedRecord[],
  issues: SeedValidationIssue[],
): Map<string, SeedRecord> {
  const map = new Map<string, SeedRecord>();

  records.forEach((record, index) => {
    const path = `${collectionName}[${index}]`;

    if (!isRecord(record)) {
      issues.push(createIssue(path, "Expected an object."));
      return;
    }

    if (!isNonEmptyString(record.id)) {
      issues.push(createIssue(`${path}.id`, "Expected a non-empty string."));
      return;
    }

    if (map.has(record.id)) {
      issues.push(createIssue(`${path}.id`, `Duplicate id '${record.id}'.`));
      return;
    }

    map.set(record.id, record);
  });

  return map;
}

function requireReference(
  path: string,
  id: unknown,
  map: Map<string, SeedRecord>,
  issues: SeedValidationIssue[],
): void {
  if (id === null || id === undefined) {
    return;
  }

  if (!isNonEmptyString(id)) {
    issues.push(createIssue(path, "Expected a non-empty string."));
    return;
  }

  if (!map.has(id)) {
    issues.push(createIssue(path, `Unknown reference '${id}'.`));
  }
}

function validateOptionalString(
  record: SeedRecord,
  key: string,
  path: string,
  issues: SeedValidationIssue[],
): string | null {
  const value = record[key];

  if (value === null || value === undefined) {
    return null;
  }

  if (!isNonEmptyString(value)) {
    issues.push(createIssue(path, "Expected a non-empty string."));
    return null;
  }

  return value;
}

function validateOptionalNumber(
  record: SeedRecord,
  key: string,
  path: string,
  issues: SeedValidationIssue[],
): number | null {
  const value = record[key];

  if (value === null || value === undefined) {
    return null;
  }

  if (!isFiniteNumber(value)) {
    issues.push(createIssue(path, "Expected a finite number."));
    return null;
  }

  return value;
}

function validateOptionalInteger(
  record: SeedRecord,
  key: string,
  path: string,
  issues: SeedValidationIssue[],
): number | null {
  const value = record[key];

  if (value === null || value === undefined) {
    return null;
  }

  if (!isInteger(value)) {
    issues.push(createIssue(path, "Expected an integer."));
    return null;
  }

  return value;
}

function validateOptionalBoolean(
  record: SeedRecord,
  key: string,
  path: string,
  issues: SeedValidationIssue[],
): boolean | null {
  const value = record[key];

  if (value === null || value === undefined) {
    return null;
  }

  if (!isBoolean(value)) {
    issues.push(createIssue(path, "Expected a boolean."));
    return null;
  }

  return value;
}

function validateUniquePair(
  seen: Set<string>,
  key: string,
  path: string,
  issueMessage: string,
  issues: SeedValidationIssue[],
): void {
  if (seen.has(key)) {
    issues.push(createIssue(path, issueMessage));
    return;
  }

  seen.add(key);
}

function validateSeedBundleInternal(bundle: SeedBundleV1): SeedValidationIssue[] {
  const issues: SeedValidationIssue[] = [];

  const sources = arrayOrEmpty(bundle, "sources");
  const licenses = arrayOrEmpty(bundle, "licenses");
  const reviewers = arrayOrEmpty(bundle, "reviewers");
  const chordQualities = arrayOrEmpty(bundle, "chordQualities");
  const chords = arrayOrEmpty(bundle, "chords");
  const tunings = arrayOrEmpty(bundle, "tunings");
  const tuningCourses = arrayOrEmpty(bundle, "tuningCourses");
  const tuningStrings = arrayOrEmpty(bundle, "tuningStrings");
  const chordShapes = arrayOrEmpty(bundle, "chordShapes");
  const chordShapePositions = arrayOrEmpty(bundle, "chordShapePositions");
  const chordShapeBarres = arrayOrEmpty(bundle, "chordShapeBarres");
  const rhythms = arrayOrEmpty(bundle, "rhythms");
  const rhythmPatterns = arrayOrEmpty(bundle, "rhythmPatterns");
  const rhythmSteps = arrayOrEmpty(bundle, "rhythmSteps");
  const assets = arrayOrEmpty(bundle, "assets");
  const songs = arrayOrEmpty(bundle, "songs");
  const songRhythms = arrayOrEmpty(bundle, "songRhythms");
  const songSources = arrayOrEmpty(bundle, "songSources");
  const songChordIndex = arrayOrEmpty(bundle, "songChordIndex");
  const songArrangements = arrayOrEmpty(bundle, "songArrangements");
  const songArrangementChords = arrayOrEmpty(bundle, "songArrangementChords");
  const exercises = arrayOrEmpty(bundle, "exercises");
  const exerciseEvents = arrayOrEmpty(bundle, "exerciseEvents");
  const tags = arrayOrEmpty(bundle, "tags");

  const sourceMap = buildIdMap("sources", sources, issues);
  const licenseMap = buildIdMap("licenses", licenses, issues);
  const reviewerMap = buildIdMap("reviewers", reviewers, issues);
  const qualityMap = buildIdMap("chordQualities", chordQualities, issues);
  const chordMap = buildIdMap("chords", chords, issues);
  const tuningMap = buildIdMap("tunings", tunings, issues);
  const tuningCourseMap = buildIdMap("tuningCourses", tuningCourses, issues);
  const tuningStringMap = buildIdMap("tuningStrings", tuningStrings, issues);
  const shapeMap = buildIdMap("chordShapes", chordShapes, issues);
  const rhythmMap = buildIdMap("rhythms", rhythms, issues);
  const rhythmPatternMap = buildIdMap("rhythmPatterns", rhythmPatterns, issues);
  const songMap = buildIdMap("songs", songs, issues);
  const arrangementMap = buildIdMap("songArrangements", songArrangements, issues);
  const exerciseMap = buildIdMap("exercises", exercises, issues);

  sources.forEach((source, index) => {
    if (!isRecord(source)) {
      return;
    }

    const path = `sources[${index}]`;
    const sourceType = validateOptionalString(source, "sourceType", `${path}.sourceType`, issues);
    if (sourceType && !SOURCE_TYPES.has(sourceType as never)) {
      issues.push(createIssue(`${path}.sourceType`, "Invalid source type."));
    }
    validateOptionalString(source, "title", `${path}.title`, issues);
    validateOptionalString(source, "createdAt", `${path}.createdAt`, issues);
    validateOptionalString(source, "updatedAt", `${path}.updatedAt`, issues);
    requireReference(`${path}.reviewerId`, source.reviewerId, reviewerMap, issues);
  });

  licenses.forEach((license, index) => {
    if (!isRecord(license)) {
      return;
    }

    const path = `licenses[${index}]`;
    const licenseType = validateOptionalString(license, "licenseType", `${path}.licenseType`, issues);
    if (licenseType && !LICENSE_TYPES.has(licenseType as never)) {
      issues.push(createIssue(`${path}.licenseType`, "Invalid license type."));
    }

    if (bundle.kind === "production" && licenseType === "unknown") {
      issues.push(createIssue(`${path}.licenseType`, "Unknown licenses cannot be published."));
    }
  });

  chordQualities.forEach((quality, index) => {
    if (!isRecord(quality)) {
      return;
    }

    const path = `chordQualities[${index}]`;
    const family = validateOptionalString(quality, "family", `${path}.family`, issues);
    if (family && !CHORD_QUALITY_FAMILIES.has(family as never)) {
      issues.push(createIssue(`${path}.family`, "Invalid chord quality family."));
    }
  });

  const chordSignatures = new Set<string>();
  chords.forEach((chord, index) => {
    if (!isRecord(chord)) {
      return;
    }

    const path = `chords[${index}]`;
    const rootPitchClass = validateOptionalInteger(chord, "rootPitchClass", `${path}.rootPitchClass`, issues);
    const qualityId = validateOptionalString(chord, "qualityId", `${path}.qualityId`, issues);
    const bassPitchClass = validateOptionalInteger(chord, "bassPitchClass", `${path}.bassPitchClass`, issues);

    if (rootPitchClass !== null && (rootPitchClass < 0 || rootPitchClass > 11)) {
      issues.push(createIssue(`${path}.rootPitchClass`, "Expected a pitch class between 0 and 11."));
    }
    if (qualityId && !qualityMap.has(qualityId)) {
      issues.push(createIssue(`${path}.qualityId`, `Unknown chord quality '${qualityId}'.`));
    }
    if (bassPitchClass !== null && (bassPitchClass < 0 || bassPitchClass > 11)) {
      issues.push(createIssue(`${path}.bassPitchClass`, "Expected a pitch class between 0 and 11."));
    }

    const signature = `${rootPitchClass ?? ""}:${qualityId ?? ""}:${bassPitchClass ?? -1}`;
    validateUniquePair(chordSignatures, signature, `${path}.id`, "Duplicate chord signature.", issues);
  });

  tunings.forEach((tuning, index) => {
    if (!isRecord(tuning)) {
      return;
    }

    const path = `tunings[${index}]`;
    validateOptionalString(tuning, "name", `${path}.name`, issues);
    validateOptionalString(tuning, "shortName", `${path}.shortName`, issues);
    validateOptionalString(tuning, "description", `${path}.description`, issues);
    requireReference(`${path}.openChordId`, tuning.openChordId, chordMap, issues);
    requireReference(`${path}.reviewerId`, tuning.reviewerId, reviewerMap, issues);
    requireReference(`${path}.sourceId`, tuning.sourceId, sourceMap, issues);
  });

  const tuningCourseKeys = new Set<string>();
  tuningCourses.forEach((course, index) => {
    if (!isRecord(course)) {
      return;
    }

    const path = `tuningCourses[${index}]`;
    const tuningId = validateOptionalString(course, "tuningId", `${path}.tuningId`, issues);
    const courseNumber = validateOptionalInteger(course, "courseNumber", `${path}.courseNumber`, issues);
    const pairType = validateOptionalString(course, "pairType", `${path}.pairType`, issues);

    if (tuningId && !tuningMap.has(tuningId)) {
      issues.push(createIssue(`${path}.tuningId`, `Unknown tuning '${tuningId}'.`));
    }
    if (courseNumber !== null && (courseNumber < 1 || courseNumber > 5)) {
      issues.push(createIssue(`${path}.courseNumber`, "Expected a course number between 1 and 5."));
    }
    if (pairType && !PAIR_TYPES.has(pairType as never)) {
      issues.push(createIssue(`${path}.pairType`, "Invalid pair type."));
    }

    if (tuningId && courseNumber !== null) {
      validateUniquePair(
        tuningCourseKeys,
        `${tuningId}:${courseNumber}`,
        `${path}.courseNumber`,
        "Duplicate course number for tuning.",
        issues,
      );
    }
  });

  const tuningStringByTuning = new Set<string>();
  const tuningStringByCourse = new Set<string>();
  tuningStrings.forEach((stringRow, index) => {
    if (!isRecord(stringRow)) {
      return;
    }

    const path = `tuningStrings[${index}]`;
    const tuningId = validateOptionalString(stringRow, "tuningId", `${path}.tuningId`, issues);
    const courseId = validateOptionalString(stringRow, "courseId", `${path}.courseId`, issues);
    const courseNumber = validateOptionalInteger(stringRow, "courseNumber", `${path}.courseNumber`, issues);
    const stringInCourse = validateOptionalInteger(stringRow, "stringInCourse", `${path}.stringInCourse`, issues);
    const physicalStringNumber = validateOptionalInteger(stringRow, "physicalStringNumber", `${path}.physicalStringNumber`, issues);
    const pitchClass = validateOptionalInteger(stringRow, "pitchClass", `${path}.pitchClass`, issues);
    const octave = validateOptionalInteger(stringRow, "octave", `${path}.octave`, issues);
    const midiNote = validateOptionalInteger(stringRow, "midiNote", `${path}.midiNote`, issues);
    const referenceFrequency = validateOptionalNumber(stringRow, "referenceFrequency440", `${path}.referenceFrequency440`, issues);

    if (tuningId && !tuningMap.has(tuningId)) {
      issues.push(createIssue(`${path}.tuningId`, `Unknown tuning '${tuningId}'.`));
    }
    if (courseId && !tuningCourseMap.has(courseId)) {
      issues.push(createIssue(`${path}.courseId`, `Unknown tuning course '${courseId}'.`));
    }
    if (courseId && tuningId) {
      const course = tuningCourseMap.get(courseId);
      if (course && course.tuningId !== tuningId) {
        issues.push(createIssue(`${path}.courseId`, "Tuning string course does not belong to the declared tuning."));
      }
    }
    if (courseNumber !== null && (courseNumber < 1 || courseNumber > 5)) {
      issues.push(createIssue(`${path}.courseNumber`, "Expected a course number between 1 and 5."));
    }
    if (stringInCourse !== null && stringInCourse !== 1 && stringInCourse !== 2) {
      issues.push(createIssue(`${path}.stringInCourse`, "Expected 1 or 2."));
    }
    if (physicalStringNumber !== null && (physicalStringNumber < 1 || physicalStringNumber > 10)) {
      issues.push(createIssue(`${path}.physicalStringNumber`, "Expected a physical string number between 1 and 10."));
    }
    if (pitchClass !== null && (pitchClass < 0 || pitchClass > 11)) {
      issues.push(createIssue(`${path}.pitchClass`, "Expected a pitch class between 0 and 11."));
    }
    if (octave !== null && (octave < 0 || octave > 8)) {
      issues.push(createIssue(`${path}.octave`, "Expected an octave between 0 and 8."));
    }
    if (midiNote !== null && (midiNote < 0 || midiNote > 127)) {
      issues.push(createIssue(`${path}.midiNote`, "Expected a MIDI note between 0 and 127."));
    }
    if (referenceFrequency !== null && referenceFrequency <= 0) {
      issues.push(createIssue(`${path}.referenceFrequency440`, "Expected a positive frequency."));
    }

    if (tuningId && physicalStringNumber !== null) {
      validateUniquePair(
        tuningStringByTuning,
        `${tuningId}:${physicalStringNumber}`,
        `${path}.physicalStringNumber`,
        "Duplicate physical string number for tuning.",
        issues,
      );
    }

    if (courseId && stringInCourse !== null) {
      validateUniquePair(
        tuningStringByCourse,
        `${courseId}:${stringInCourse}`,
        `${path}.stringInCourse`,
        "Duplicate string-in-course for tuning course.",
        issues,
      );
    }
  });

  const shapePositionCounts = new Map<string, Set<number>>();
  chordShapes.forEach((shape, index) => {
    if (!isRecord(shape)) {
      return;
    }

    const path = `chordShapes[${index}]`;
    const chordId = validateOptionalString(shape, "chordId", `${path}.chordId`, issues);
    const tuningId = validateOptionalString(shape, "tuningId", `${path}.tuningId`, issues);
    const variationNumber = validateOptionalInteger(shape, "variationNumber", `${path}.variationNumber`, issues);
    const startingFret = validateOptionalInteger(shape, "startingFret", `${path}.startingFret`, issues);
    const endingFret = validateOptionalInteger(shape, "endingFret", `${path}.endingFret`, issues);
    const fretSpan = validateOptionalInteger(shape, "fretSpan", `${path}.fretSpan`, issues);
    const difficulty = validateOptionalString(shape, "difficulty", `${path}.difficulty`, issues);
    const positionRegion = validateOptionalString(shape, "positionRegion", `${path}.positionRegion`, issues);
    const verificationStatus = validateOptionalString(shape, "verificationStatus", `${path}.verificationStatus`, issues);

    if (chordId && !chordMap.has(chordId)) {
      issues.push(createIssue(`${path}.chordId`, `Unknown chord '${chordId}'.`));
    }
    if (tuningId && !tuningMap.has(tuningId)) {
      issues.push(createIssue(`${path}.tuningId`, `Unknown tuning '${tuningId}'.`));
    }
    if (variationNumber !== null && variationNumber < 1) {
      issues.push(createIssue(`${path}.variationNumber`, "Expected a variation number >= 1."));
    }
    if (startingFret !== null && (startingFret < 0 || startingFret > 30)) {
      issues.push(createIssue(`${path}.startingFret`, "Expected a fret between 0 and 30."));
    }
    if (endingFret !== null && (endingFret < 0 || endingFret > 30)) {
      issues.push(createIssue(`${path}.endingFret`, "Expected a fret between 0 and 30."));
    }
    if (startingFret !== null && endingFret !== null && endingFret < startingFret) {
      issues.push(createIssue(`${path}.endingFret`, "Ending fret must be greater than or equal to the starting fret."));
    }
    if (fretSpan !== null && (fretSpan < 0 || fretSpan > 12)) {
      issues.push(createIssue(`${path}.fretSpan`, "Expected a fret span between 0 and 12."));
    }
    if (difficulty && !DIFFICULTY_LEVELS.has(difficulty as never)) {
      issues.push(createIssue(`${path}.difficulty`, "Invalid difficulty level."));
    }
    if (positionRegion && !CHORD_SHAPE_REGIONS.has(positionRegion as never)) {
      issues.push(createIssue(`${path}.positionRegion`, "Invalid position region."));
    }
    if (verificationStatus && !CHORD_SHAPE_VERIFICATION_STATUSES.has(verificationStatus as never)) {
      issues.push(createIssue(`${path}.verificationStatus`, "Invalid verification status."));
    }
    requireReference(`${path}.reviewerId`, shape.reviewerId, reviewerMap, issues);
    requireReference(`${path}.sourceId`, shape.sourceId, sourceMap, issues);

    if (shape.id) {
      shapePositionCounts.set(shape.id, new Set<number>());
    }
  });

  chordShapePositions.forEach((position, index) => {
    if (!isRecord(position)) {
      return;
    }

    const path = `chordShapePositions[${index}]`;
    const shapeId = validateOptionalString(position, "shapeId", `${path}.shapeId`, issues);
    const tuningStringId = validateOptionalString(position, "tuningStringId", `${path}.tuningStringId`, issues);
    const physicalStringNumber = validateOptionalInteger(position, "physicalStringNumber", `${path}.physicalStringNumber`, issues);
    const courseNumber = validateOptionalInteger(position, "courseNumber", `${path}.courseNumber`, issues);
    const stringInCourse = validateOptionalInteger(position, "stringInCourse", `${path}.stringInCourse`, issues);
    const fret = validateOptionalInteger(position, "fret", `${path}.fret`, issues);
    const finger = validateOptionalString(position, "finger", `${path}.finger`, issues);
    const resultingPitchClass = validateOptionalInteger(position, "resultingPitchClass", `${path}.resultingPitchClass`, issues);
    const resultingOctave = validateOptionalInteger(position, "resultingOctave", `${path}.resultingOctave`, issues);

    if (shapeId && !shapeMap.has(shapeId)) {
      issues.push(createIssue(`${path}.shapeId`, `Unknown chord shape '${shapeId}'.`));
    }
    if (tuningStringId && !tuningStringMap.has(tuningStringId)) {
      issues.push(createIssue(`${path}.tuningStringId`, `Unknown tuning string '${tuningStringId}'.`));
    }
    if (physicalStringNumber !== null && (physicalStringNumber < 1 || physicalStringNumber > 10)) {
      issues.push(createIssue(`${path}.physicalStringNumber`, "Expected a physical string number between 1 and 10."));
    }
    if (courseNumber !== null && (courseNumber < 1 || courseNumber > 5)) {
      issues.push(createIssue(`${path}.courseNumber`, "Expected a course number between 1 and 5."));
    }
    if (stringInCourse !== null && stringInCourse !== 1 && stringInCourse !== 2) {
      issues.push(createIssue(`${path}.stringInCourse`, "Expected 1 or 2."));
    }
    if (fret !== null && (fret < -1 || fret > 30)) {
      issues.push(createIssue(`${path}.fret`, "Expected a fret between -1 and 30."));
    }
    if (finger !== null && !["1", "2", "3", "4", "T"].includes(finger)) {
      issues.push(createIssue(`${path}.finger`, "Invalid finger value."));
    }
    if (resultingPitchClass !== null && (resultingPitchClass < 0 || resultingPitchClass > 11)) {
      issues.push(createIssue(`${path}.resultingPitchClass`, "Expected a pitch class between 0 and 11."));
    }
    if (resultingOctave !== null && (resultingOctave < 0 || resultingOctave > 8)) {
      issues.push(createIssue(`${path}.resultingOctave`, "Expected an octave between 0 and 8."));
    }

    if (shapeId && physicalStringNumber !== null) {
      const seen = shapePositionCounts.get(shapeId) ?? new Set<number>();
      if (seen.has(physicalStringNumber)) {
        issues.push(createIssue(`${path}.physicalStringNumber`, "Duplicate physical string number for shape."));
      }
      seen.add(physicalStringNumber);
      shapePositionCounts.set(shapeId, seen);
    }
  });

  chordShapes.forEach((shape, index) => {
    if (!isRecord(shape) || !isNonEmptyString(shape.id)) {
      return;
    }

    const count = shapePositionCounts.get(shape.id)?.size ?? 0;
    if (count !== 10) {
      issues.push(createIssue(`chordShapes[${index}].positions`, "Expected exactly 10 positions."));
    }
  });

  chordShapeBarres.forEach((barre, index) => {
    if (!isRecord(barre)) {
      return;
    }

    const path = `chordShapeBarres[${index}]`;
    const shapeId = validateOptionalString(barre, "shapeId", `${path}.shapeId`, issues);
    const fret = validateOptionalInteger(barre, "fret", `${path}.fret`, issues);
    const fromPhysicalString = validateOptionalInteger(barre, "fromPhysicalString", `${path}.fromPhysicalString`, issues);
    const toPhysicalString = validateOptionalInteger(barre, "toPhysicalString", `${path}.toPhysicalString`, issues);
    const finger = validateOptionalString(barre, "finger", `${path}.finger`, issues);

    if (shapeId && !shapeMap.has(shapeId)) {
      issues.push(createIssue(`${path}.shapeId`, `Unknown chord shape '${shapeId}'.`));
    }
    if (fret !== null && (fret < 1 || fret > 30)) {
      issues.push(createIssue(`${path}.fret`, "Expected a fret between 1 and 30."));
    }
    if (fromPhysicalString !== null && (fromPhysicalString < 1 || fromPhysicalString > 10)) {
      issues.push(createIssue(`${path}.fromPhysicalString`, "Expected a physical string between 1 and 10."));
    }
    if (toPhysicalString !== null && (toPhysicalString < 1 || toPhysicalString > 10)) {
      issues.push(createIssue(`${path}.toPhysicalString`, "Expected a physical string between 1 and 10."));
    }
    if (fromPhysicalString !== null && toPhysicalString !== null && fromPhysicalString > toPhysicalString) {
      issues.push(createIssue(`${path}.toPhysicalString`, "Barre end must be greater than or equal to the start."));
    }
    if (finger && !["1", "2", "3", "4", "T"].includes(finger)) {
      issues.push(createIssue(`${path}.finger`, "Invalid finger value."));
    }
  });

  rhythms.forEach((rhythm, index) => {
    if (!isRecord(rhythm)) {
      return;
    }

    const path = `rhythms[${index}]`;
    const verificationStatus = validateOptionalString(rhythm, "verificationStatus", `${path}.verificationStatus`, issues);
    if (verificationStatus && !VERIFICATION_STATUSES.has(verificationStatus as never)) {
      issues.push(createIssue(`${path}.verificationStatus`, "Invalid verification status."));
    }
    validateOptionalString(rhythm, "slug", `${path}.slug`, issues);
    validateOptionalString(rhythm, "name", `${path}.name`, issues);
    validateOptionalString(rhythm, "shortDescription", `${path}.shortDescription`, issues);
    validateOptionalString(rhythm, "description", `${path}.description`, issues);
    validateOptionalString(rhythm, "originRegion", `${path}.originRegion`, issues);
    requireReference(`${path}.reviewerId`, rhythm.reviewerId, reviewerMap, issues);
    requireReference(`${path}.sourceId`, rhythm.sourceId, sourceMap, issues);
  });

  rhythmPatterns.forEach((pattern, index) => {
    if (!isRecord(pattern)) {
      return;
    }

    const path = `rhythmPatterns[${index}]`;
    const rhythmId = validateOptionalString(pattern, "rhythmId", `${path}.rhythmId`, issues);
    if (rhythmId && !rhythmMap.has(rhythmId)) {
      issues.push(createIssue(`${path}.rhythmId`, `Unknown rhythm '${rhythmId}'.`));
    }
    const handMode = validateOptionalString(pattern, "handMode", `${path}.handMode`, issues);
    if (handMode && !new Set(["neutral", "right_hand_reference"] as const).has(handMode as never)) {
      issues.push(createIssue(`${path}.handMode`, "Invalid hand mode."));
    }
  });

  rhythmSteps.forEach((step, index) => {
    if (!isRecord(step)) {
      return;
    }

    const path = `rhythmSteps[${index}]`;
    const patternId = validateOptionalString(step, "patternId", `${path}.patternId`, issues);
    if (patternId && !rhythmPatternMap.has(patternId)) {
      issues.push(createIssue(`${path}.patternId`, `Unknown rhythm pattern '${patternId}'.`));
    }
    const direction = validateOptionalString(step, "direction", `${path}.direction`, issues);
    if (direction && !new Set(["down", "up", "none"] as const).has(direction as never)) {
      issues.push(createIssue(`${path}.direction`, "Invalid direction."));
    }
    const action = validateOptionalString(step, "action", `${path}.action`, issues);
    if (action && !new Set(["strike", "mute", "percussion", "rest", "brush", "pluck"] as const).has(action as never)) {
      issues.push(createIssue(`${path}.action`, "Invalid action."));
    }
    const handPart = validateOptionalString(step, "handPart", `${path}.handPart`, issues);
    if (handPart && !new Set(["thumb", "index", "middle", "ring", "multiple", "unspecified"] as const).has(handPart as never)) {
      issues.push(createIssue(`${path}.handPart`, "Invalid hand part."));
    }
  });

  assets.forEach((asset, index) => {
    if (!isRecord(asset)) {
      return;
    }

    const path = `assets[${index}]`;
    const assetType = validateOptionalString(asset, "assetType", `${path}.assetType`, issues);
    if (assetType && !ASSET_TYPES.has(assetType as never)) {
      issues.push(createIssue(`${path}.assetType`, "Invalid asset type."));
    }
    validateOptionalString(asset, "localPath", `${path}.localPath`, issues);
    validateOptionalString(asset, "mimeType", `${path}.mimeType`, issues);
    const checksum = validateOptionalString(asset, "checksum", `${path}.checksum`, issues);
    if (checksum && !/^([a-f0-9]{64})$/i.test(checksum)) {
      issues.push(createIssue(`${path}.checksum`, "Expected a SHA-256 checksum in hexadecimal form."));
    }
    validateOptionalBoolean(asset, "isRequired", `${path}.isRequired`, issues);
  });

  songs.forEach((song, index) => {
    if (!isRecord(song)) {
      return;
    }

    const path = `songs[${index}]`;
    const licenseId = validateOptionalString(song, "licenseId", `${path}.licenseId`, issues);
    if (licenseId && !licenseMap.has(licenseId)) {
      issues.push(createIssue(`${path}.licenseId`, `Unknown license '${licenseId}'.`));
    }
    requireReference(`${path}.sourceId`, song.sourceId, sourceMap, issues);
    requireReference(`${path}.reviewerId`, song.reviewerId, reviewerMap, issues);
    const copyrightStatus = validateOptionalString(song, "copyrightStatus", `${path}.copyrightStatus`, issues);
    if (copyrightStatus && !SONG_COPYRIGHT_STATUSES.has(copyrightStatus as never)) {
      issues.push(createIssue(`${path}.copyrightStatus`, "Invalid copyright status."));
    }
    const originalKeyMode = validateOptionalString(song, "originalKeyMode", `${path}.originalKeyMode`, issues);
    if (originalKeyMode && !SONG_KEY_MODES.has(originalKeyMode as never)) {
      issues.push(createIssue(`${path}.originalKeyMode`, "Invalid key mode."));
    }
    const difficulty = validateOptionalString(song, "difficulty", `${path}.difficulty`, issues);
    if (difficulty && !DIFFICULTY_LEVELS.has(difficulty as never)) {
      issues.push(createIssue(`${path}.difficulty`, "Invalid difficulty level."));
    }
    const documentJson = validateOptionalString(song, "documentJson", `${path}.documentJson`, issues);
    if (documentJson) {
      try {
        const parsed = SongDocumentSchema.safeParse(JSON.parse(documentJson));
        if (!parsed.success) {
          issues.push(createIssue(`${path}.documentJson`, "Song document is invalid."));
        }
      } catch {
        issues.push(createIssue(`${path}.documentJson`, "Song document must be valid JSON."));
      }
    }
  });

  songRhythms.forEach((entry, index) => {
    if (!isRecord(entry)) {
      return;
    }

    const path = `songRhythms[${index}]`;
    const songId = validateOptionalString(entry, "songId", `${path}.songId`, issues);
    const rhythmId = validateOptionalString(entry, "rhythmId", `${path}.rhythmId`, issues);
    if (songId && !songMap.has(songId)) {
      issues.push(createIssue(`${path}.songId`, `Unknown song '${songId}'.`));
    }
    if (rhythmId && !rhythmMap.has(rhythmId)) {
      issues.push(createIssue(`${path}.rhythmId`, `Unknown rhythm '${rhythmId}'.`));
    }
    const relevance = validateOptionalString(entry, "relevance", `${path}.relevance`, issues);
    if (relevance && !SONG_RHYTHM_RELEVANCE.has(relevance as never)) {
      issues.push(createIssue(`${path}.relevance`, "Invalid relevance."));
    }
  });

  songSources.forEach((entry, index) => {
    if (!isRecord(entry)) {
      return;
    }

    const path = `songSources[${index}]`;
    const songId = validateOptionalString(entry, "songId", `${path}.songId`, issues);
    const sourceId = validateOptionalString(entry, "sourceId", `${path}.sourceId`, issues);
    const licenseId = validateOptionalString(entry, "licenseId", `${path}.licenseId`, issues);
    if (songId && !songMap.has(songId)) {
      issues.push(createIssue(`${path}.songId`, `Unknown song '${songId}'.`));
    }
    if (sourceId && !sourceMap.has(sourceId)) {
      issues.push(createIssue(`${path}.sourceId`, `Unknown source '${sourceId}'.`));
    }
    if (licenseId && !licenseMap.has(licenseId)) {
      issues.push(createIssue(`${path}.licenseId`, `Unknown license '${licenseId}'.`));
    }
  });

  const songChordIndexKeys = new Set<string>();
  songChordIndex.forEach((entry, index) => {
    if (!isRecord(entry)) {
      return;
    }

    const path = `songChordIndex[${index}]`;
    const songId = validateOptionalString(entry, "songId", `${path}.songId`, issues);
    const chordId = validateOptionalString(entry, "chordId", `${path}.chordId`, issues);
    if (songId && !songMap.has(songId)) {
      issues.push(createIssue(`${path}.songId`, `Unknown song '${songId}'.`));
    }
    if (chordId && !chordMap.has(chordId)) {
      issues.push(createIssue(`${path}.chordId`, `Unknown chord '${chordId}'.`));
    }
    if (songId && chordId) {
      validateUniquePair(
        songChordIndexKeys,
        `${songId}:${chordId}`,
        `${path}.chordId`,
        "Duplicate chord index entry.",
        issues,
      );
    }
  });

  const arrangementKeys = new Set<string>();
  songArrangements.forEach((entry, index) => {
    if (!isRecord(entry)) {
      return;
    }

    const path = `songArrangements[${index}]`;
    const songId = validateOptionalString(entry, "songId", `${path}.songId`, issues);
    const tuningId = validateOptionalString(entry, "tuningId", `${path}.tuningId`, issues);
    if (songId && !songMap.has(songId)) {
      issues.push(createIssue(`${path}.songId`, `Unknown song '${songId}'.`));
    }
    if (tuningId && !tuningMap.has(tuningId)) {
      issues.push(createIssue(`${path}.tuningId`, `Unknown tuning '${tuningId}'.`));
    }
    const arrangementStatus = validateOptionalString(entry, "arrangementStatus", `${path}.arrangementStatus`, issues);
    if (arrangementStatus && !ARRANGEMENT_STATUSES.has(arrangementStatus as never)) {
      issues.push(createIssue(`${path}.arrangementStatus`, "Invalid arrangement status."));
    }
    const keyMode = validateOptionalString(entry, "keyMode", `${path}.keyMode`, issues);
    if (keyMode && !SONG_KEY_MODES.has(keyMode as never)) {
      issues.push(createIssue(`${path}.keyMode`, "Invalid key mode."));
    }
    const keyPitchClass = validateOptionalInteger(entry, "keyPitchClass", `${path}.keyPitchClass`, issues);
    if (keyPitchClass !== null && (keyPitchClass < 0 || keyPitchClass > 11)) {
      issues.push(createIssue(`${path}.keyPitchClass`, "Expected a pitch class between 0 and 11."));
    }
    const capoFret = validateOptionalInteger(entry, "capoFret", `${path}.capoFret`, issues);
    if (capoFret !== null && (capoFret < 0 || capoFret > 15)) {
      issues.push(createIssue(`${path}.capoFret`, "Expected a capo fret between 0 and 15."));
    }
    requireReference(`${path}.reviewerId`, entry.reviewerId, reviewerMap, issues);
    requireReference(`${path}.sourceId`, entry.sourceId, sourceMap, issues);

    if (songId && tuningId && keyPitchClass !== null && keyMode && capoFret !== null) {
      validateUniquePair(
        arrangementKeys,
        `${songId}:${tuningId}:${keyPitchClass}:${keyMode}:${capoFret}:${entry.name ?? ""}`,
        `${path}.name`,
        "Duplicate arrangement signature.",
        issues,
      );
    }
  });

  songArrangementChords.forEach((entry, index) => {
    if (!isRecord(entry)) {
      return;
    }

    const path = `songArrangementChords[${index}]`;
    const arrangementId = validateOptionalString(entry, "arrangementId", `${path}.arrangementId`, issues);
    const chordId = validateOptionalString(entry, "chordId", `${path}.chordId`, issues);
    if (arrangementId && !arrangementMap.has(arrangementId)) {
      issues.push(createIssue(`${path}.arrangementId`, `Unknown arrangement '${arrangementId}'.`));
    }
    if (chordId && !chordMap.has(chordId)) {
      issues.push(createIssue(`${path}.chordId`, `Unknown chord '${chordId}'.`));
    }
    const status = validateOptionalString(entry, "status", `${path}.status`, issues);
    if (status && !ARRANGEMENT_CHORD_STATUSES.has(status as never)) {
      issues.push(createIssue(`${path}.status`, "Invalid arrangement chord status."));
    }
    requireReference(`${path}.preferredShapeId`, entry.preferredShapeId, shapeMap, issues);
    requireReference(`${path}.fallbackShapeId`, entry.fallbackShapeId, shapeMap, issues);
  });

  exercises.forEach((exercise, index) => {
    if (!isRecord(exercise)) {
      return;
    }

    const path = `exercises[${index}]`;
    const tuningId = validateOptionalString(exercise, "tuningId", `${path}.tuningId`, issues);
    const rhythmId = validateOptionalString(exercise, "rhythmId", `${path}.rhythmId`, issues);
    const patternId = validateOptionalString(exercise, "patternId", `${path}.patternId`, issues);
    if (tuningId && !tuningMap.has(tuningId)) {
      issues.push(createIssue(`${path}.tuningId`, `Unknown tuning '${tuningId}'.`));
    }
    if (rhythmId && !rhythmMap.has(rhythmId)) {
      issues.push(createIssue(`${path}.rhythmId`, `Unknown rhythm '${rhythmId}'.`));
    }
    if (patternId && !rhythmPatternMap.has(patternId)) {
      issues.push(createIssue(`${path}.patternId`, `Unknown rhythm pattern '${patternId}'.`));
    }
  });

  exerciseEvents.forEach((event, index) => {
    if (!isRecord(event)) {
      return;
    }

    const path = `exerciseEvents[${index}]`;
    const exerciseId = validateOptionalString(event, "exerciseId", `${path}.exerciseId`, issues);
    if (exerciseId && !exerciseMap.has(exerciseId)) {
      issues.push(createIssue(`${path}.exerciseId`, `Unknown exercise '${exerciseId}'.`));
    }
  });

  tags.forEach((tag, index) => {
    if (!isRecord(tag)) {
      return;
    }

    const path = `tags[${index}]`;
    const category = validateOptionalString(tag, "category", `${path}.category`, issues);
    if (category && !new Set(["song_style", "difficulty", "region", "occasion", "technique", "custom"] as const).has(category as never)) {
      issues.push(createIssue(`${path}.category`, "Invalid tag category."));
    }
  });

  return issues;
}

export async function validateSeedBundle(
  bundle: SeedBundleV1,
  options: {
    readonly now?: () => string;
  } = {},
): Promise<SeedValidationResult> {
  const issues = validateSeedBundleInternal(bundle);

  if (issues.length > 0) {
    throw new SeedValidationError("Seed bundle is invalid.", issues);
  }

  return {
    manifest: await buildSeedManifest(bundle, options),
    issues,
  };
}

export async function buildValidatedSeedManifest(
  bundle: SeedBundleV1,
  options: {
    readonly now?: () => string;
  } = {},
): Promise<SeedManifest> {
  return (await validateSeedBundle(bundle, options)).manifest;
}
