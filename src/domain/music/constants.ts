import type { ChordFinger, PitchClass } from "@/types/music";

export type NoteLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";

export const PITCH_CLASS_TO_SHARP_NAME = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const satisfies readonly string[];

export const PITCH_CLASS_TO_FLAT_NAME = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const satisfies readonly string[];

export const NOTE_LETTER_TO_BASE_PITCH_CLASS: Readonly<Record<NoteLetter, PitchClass>> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
} as const;

export const VALID_CHORD_FINGERS = ["1", "2", "3", "4", "T"] as const satisfies readonly ChordFinger[];

export const MIN_OCTAVE = 0;
export const MAX_OCTAVE = 8;

export const MIN_MIDI_NOTE = 0;
export const MAX_MIDI_NOTE = 127;

export const MIN_MUTED_FRET = -1;
export const MAX_FRET = 30;
export const MIN_BARRE_FRET = 1;
export const MAX_BARRE_FRET = 30;
export const MIN_CAPO_FRET = 0;
export const MAX_CAPO_FRET = 15;

export const MIN_PHYSICAL_STRING_NUMBER = 1;
export const MAX_PHYSICAL_STRING_NUMBER = 10;
export const MIN_TUNING_COURSE_NUMBER = 1;
export const MAX_TUNING_COURSE_NUMBER = 5;

export const MIN_TOLERANCE_CENTS = 1;
export const MAX_TOLERANCE_CENTS = 20;
export const MIN_CALIBRATION_A4 = 415;
export const MAX_CALIBRATION_A4 = 466;

export const MIN_VOLUME = 0;
export const MAX_VOLUME = 1;
