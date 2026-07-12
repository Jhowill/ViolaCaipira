import type { PitchClass, ScientificPitch } from "@/types/music";

import { NOTE_LETTER_TO_BASE_PITCH_CLASS, type NoteLetter } from "@/domain/music/constants";
import { pitchClassToSpelling as convertPitchClassToSpelling } from "@/domain/music/conversions";

const SCIENTIFIC_PITCH_PATTERN = /^([A-Ga-g])([#b]{0,2})(-?\d+)?$/;

function normalizeWordAccidentals(value: string): string {
  return value
    .replace(/𝄪/g, "##")
    .replace(/𝄫/g, "bb")
    .replace(/♯/g, "#")
    .replace(/♭/g, "b")
    .replace(/♮/g, "")
    .replace(/sustenido|sharp/giu, "#")
    .replace(/bemol|flat/giu, "b")
    .replace(/natural/giu, "");
}

function normalizeAccidentalSequence(value: string): string {
  if (value === "##" || value === "bb") {
    return value;
  }

  if (value === "#" || value === "b" || value === "") {
    return value;
  }

  return value
    .replace(/[^#b]/g, "")
    .slice(0, 2);
}

function accidentalOffset(value: string): number {
  switch (value) {
    case "##":
      return 2;
    case "#":
      return 1;
    case "bb":
      return -2;
    case "b":
      return -1;
    default:
      return 0;
  }
}

function normalizePitchClassIndex(value: number): PitchClass {
  const normalized = ((Math.trunc(value) % 12) + 12) % 12;
  return normalized as PitchClass;
}

export function normalizeAccidentalToken(input: string): "#" | "b" | "##" | "bb" | "" | null {
  if (input.trim() === "") {
    return "";
  }

  const normalized = normalizeWordAccidentals(input.trim().toLowerCase()).replace(/\s+/g, "");

  if (normalized === "#" || normalized === "b" || normalized === "##" || normalized === "bb") {
    return normalized;
  }

  return null;
}

export function normalizePitchSpelling(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "") {
    return null;
  }

  const normalized = normalizeWordAccidentals(trimmed.normalize("NFKC").replace(/\s+/g, "")).toLowerCase();
  const match = normalized.match(SCIENTIFIC_PITCH_PATTERN);

  if (!match) {
    return null;
  }

  const letter = match[1]?.toUpperCase();
  const accidental = normalizeAccidentalSequence(match[2] ?? "");
  const octave = match[3];

  if (!letter || !(letter in NOTE_LETTER_TO_BASE_PITCH_CLASS)) {
    return null;
  }

  return `${letter}${accidental}${octave ?? ""}`;
}

export function pitchSpellingToPitchClass(input: string): PitchClass | null {
  const normalized = normalizePitchSpelling(input);

  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^([A-G])([#b]{0,2})/);
  if (!match) {
    return null;
  }

  const letter = match[1];
  if (!letter) {
    return null;
  }
  const accidental = match[2] ?? "";
  const basePitchClass = NOTE_LETTER_TO_BASE_PITCH_CLASS[letter as NoteLetter];
  return normalizePitchClassIndex(basePitchClass + accidentalOffset(accidental));
}

export function parseScientificPitch(input: string): ScientificPitch | null {
  const normalized = normalizePitchSpelling(input);

  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^([A-G])([#b]{0,2})(-?\d+)$/);
  if (!match) {
    return null;
  }

  const pitchClass = pitchSpellingToPitchClass(normalized);
  const octaveText = match[3];
  if (!octaveText) {
    return null;
  }

  const octave = Number(octaveText);

  if (pitchClass === null || !Number.isInteger(octave)) {
    return null;
  }

  return {
    pitchClass,
    octave,
  };
}

export function pitchClassToNormalizedSpelling(
  pitchClass: PitchClass,
  preference: "contextual" | "sharps" | "flats" = "contextual",
): string {
  return convertPitchClassToSpelling(pitchClass, preference);
}
