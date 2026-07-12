import type { PitchClass, ScientificPitch } from "@/types/music";

import {
  MAX_MIDI_NOTE,
  MAX_OCTAVE,
  MIN_MIDI_NOTE,
  MIN_OCTAVE,
  PITCH_CLASS_TO_FLAT_NAME,
  PITCH_CLASS_TO_SHARP_NAME,
} from "@/domain/music/constants";

const PITCH_CLASS_MODULO = 12;
const A4_MIDI_NOTE = 69;
const A4_FREQUENCY = 440;

function normalizePitchClassIndex(value: number): PitchClass {
  const normalized = ((Math.trunc(value) % PITCH_CLASS_MODULO) + PITCH_CLASS_MODULO) % PITCH_CLASS_MODULO;
  return normalized as PitchClass;
}

export function isValidMidiNote(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_MIDI_NOTE && value <= MAX_MIDI_NOTE;
}

export function isValidOctaveNumber(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_OCTAVE && value <= MAX_OCTAVE;
}

export function pitchClassToMidi(pitchClass: PitchClass, octave: number): number {
  return 12 * (octave + 1) + pitchClass;
}

export function midiToPitchClass(midi: number): PitchClass {
  return normalizePitchClassIndex(midi);
}

export function midiToOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

export function midiToScientificPitch(midi: number): ScientificPitch {
  return {
    pitchClass: midiToPitchClass(midi),
    octave: midiToOctave(midi),
  };
}

export function pitchClassToFrequency(pitchClass: PitchClass, octave: number, calibrationA4 = A4_FREQUENCY): number {
  return midiToFrequency(pitchClassToMidi(pitchClass, octave), calibrationA4);
}

export function midiToFrequency(midi: number, calibrationA4 = A4_FREQUENCY): number {
  return calibrationA4 * 2 ** ((midi - A4_MIDI_NOTE) / 12);
}

export function frequencyToCents(detectedFrequency: number, targetFrequency: number): number {
  return 1200 * Math.log2(detectedFrequency / targetFrequency);
}

export function centsBetweenFrequencies(detectedFrequency: number, targetFrequency: number): number {
  return frequencyToCents(detectedFrequency, targetFrequency);
}

export function pitchClassToSpelling(pitchClass: PitchClass, preference: "contextual" | "sharps" | "flats" = "contextual"): string {
  if (preference === "flats") {
    return PITCH_CLASS_TO_FLAT_NAME[pitchClass];
  }

  if (preference === "sharps") {
    return PITCH_CLASS_TO_SHARP_NAME[pitchClass];
  }

  return PITCH_CLASS_TO_SHARP_NAME[pitchClass];
}

export function pitchClassFromMidi(midi: number): PitchClass {
  return midiToPitchClass(midi);
}

export function clampMidiNote(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_MIDI_NOTE;
  }

  return Math.min(MAX_MIDI_NOTE, Math.max(MIN_MIDI_NOTE, Math.round(value)));
}

export function clampOctave(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_OCTAVE;
  }

  return Math.min(MAX_OCTAVE, Math.max(MIN_OCTAVE, Math.round(value)));
}
