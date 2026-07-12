import type {
  ChordFinger,
  ContentOrigin,
  DifficultyLevel,
  PairType,
  PitchClass,
  PhysicalStringNumber,
  TuningCourseNumber,
  TuningStringInCourse,
  VerificationStatus,
} from "@/types/music";

import {
  MAX_BARRE_FRET,
  MAX_CALIBRATION_A4,
  MAX_CAPO_FRET,
  MAX_FRET,
  MAX_OCTAVE,
  MAX_PHYSICAL_STRING_NUMBER,
  MAX_TOLERANCE_CENTS,
  MAX_TUNING_COURSE_NUMBER,
  MAX_VOLUME,
  MIN_BARRE_FRET,
  MIN_CALIBRATION_A4,
  MIN_CAPO_FRET,
  MIN_MUTED_FRET,
  MIN_OCTAVE,
  MIN_PHYSICAL_STRING_NUMBER,
  MIN_TOLERANCE_CENTS,
  MIN_TUNING_COURSE_NUMBER,
  MIN_VOLUME,
  VALID_CHORD_FINGERS,
} from "@/domain/music/constants";

const VALID_DIFFICULTY_LEVELS: readonly DifficultyLevel[] = [
  "beginner",
  "easy",
  "intermediate",
  "advanced",
];

const VALID_CONTENT_ORIGINS: readonly ContentOrigin[] = ["catalog", "user"];

const VALID_VERIFICATION_STATUSES: readonly VerificationStatus[] = [
  "verified",
  "calculated",
  "user_created",
  "imported",
  "deprecated",
  "draft",
];

const VALID_PAIR_TYPES: readonly PairType[] = ["unison", "octave", "custom"];

const VALID_TUNER_MODES = ["guided", "chromatic", "reference"] as const;

export function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isPitchClass(value: unknown): value is PitchClass {
  return isInteger(value) && value >= 0 && value <= 11;
}

export function isDifficultyLevel(value: unknown): value is DifficultyLevel {
  return typeof value === "string" && VALID_DIFFICULTY_LEVELS.includes(value as DifficultyLevel);
}

export function isContentOrigin(value: unknown): value is ContentOrigin {
  return typeof value === "string" && VALID_CONTENT_ORIGINS.includes(value as ContentOrigin);
}

export function isVerificationStatus(value: unknown): value is VerificationStatus {
  return typeof value === "string" && VALID_VERIFICATION_STATUSES.includes(value as VerificationStatus);
}

export function isPairType(value: unknown): value is PairType {
  return typeof value === "string" && VALID_PAIR_TYPES.includes(value as PairType);
}

export function isChordFinger(value: unknown): value is ChordFinger {
  return typeof value === "string" && VALID_CHORD_FINGERS.includes(value as ChordFinger);
}

export function isValidFinger(value: unknown): value is ChordFinger | null {
  return value === null || isChordFinger(value);
}

export function isValidOctave(value: unknown): boolean {
  return isInteger(value) && value >= MIN_OCTAVE && value <= MAX_OCTAVE;
}

export function isValidPhysicalStringNumber(value: unknown): value is PhysicalStringNumber {
  return isInteger(value) && value >= MIN_PHYSICAL_STRING_NUMBER && value <= MAX_PHYSICAL_STRING_NUMBER;
}

export function isValidCourseNumber(value: unknown): value is TuningCourseNumber {
  return isInteger(value) && value >= MIN_TUNING_COURSE_NUMBER && value <= MAX_TUNING_COURSE_NUMBER;
}

export function isValidStringInCourse(value: unknown): value is TuningStringInCourse {
  return value === 1 || value === 2;
}

export function isValidFret(value: unknown): boolean {
  return isInteger(value) && value >= MIN_MUTED_FRET && value <= MAX_FRET;
}

export function isValidBarreFret(value: unknown): boolean {
  return isInteger(value) && value >= MIN_BARRE_FRET && value <= MAX_BARRE_FRET;
}

export function isValidCapoFret(value: unknown): boolean {
  return isInteger(value) && value >= MIN_CAPO_FRET && value <= MAX_CAPO_FRET;
}

export function isValidCalibrationA4(value: unknown): boolean {
  return isFiniteNumber(value) && value >= MIN_CALIBRATION_A4 && value <= MAX_CALIBRATION_A4;
}

export function isValidToleranceCents(value: unknown): boolean {
  return isInteger(value) && value >= MIN_TOLERANCE_CENTS && value <= MAX_TOLERANCE_CENTS;
}

export function isValidVolume(value: unknown): boolean {
  return isFiniteNumber(value) && value >= MIN_VOLUME && value <= MAX_VOLUME;
}

export function isValidPairSize(value: unknown): boolean {
  return isInteger(value) && value === 2;
}

export function isValidTunerMode(value: unknown): value is (typeof VALID_TUNER_MODES)[number] {
  return typeof value === "string" && VALID_TUNER_MODES.includes(value as (typeof VALID_TUNER_MODES)[number]);
}

export function isUniqueValues(values: readonly unknown[]): boolean {
  return new Set(values).size === values.length;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isInRange(value: unknown, min: number, max: number): value is number {
  return isInteger(value) && value >= min && value <= max;
}

