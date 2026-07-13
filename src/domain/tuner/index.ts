import {
  frequencyToCents,
  midiToFrequency,
  midiToScientificPitch,
  pitchClassToFrequency,
  pitchClassToMidi,
  pitchClassToSpelling,
} from "@/domain/music/conversions";
import type {
  PitchClass,
  ScientificPitch,
} from "@/types/music";
import type {
  TunerAnalysis,
  TunerFrequencySample,
  TunerGuidanceInstruction,
  TunerSignalQuality,
  TunerSignalState,
  TunerTarget,
} from "@/types/tuner";

export interface TunerAnalysisOptions {
  readonly calibrationA4: number;
  readonly toleranceCents: number;
  readonly sampleWindowSize: number;
  readonly weakSignalFloor: number;
  readonly stabilitySpreadCents: number;
  readonly maxSafeGuidanceCents: number;
}

export interface TunerAnalysisWindowResult {
  readonly signal: TunerSignalState;
  readonly analysis: TunerAnalysis | null;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    const lower = sorted[middle - 1]!;
    const upper = sorted[middle]!;
    return (lower + upper) / 2;
  }

  return sorted[middle]!;
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isFinitePositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function createTunerTarget(input: {
  readonly label: string;
  readonly pitchClass: PitchClass;
  readonly octave: number;
  readonly calibrationA4: number;
  readonly courseNumber?: number;
  readonly stringInCourse?: 1 | 2;
}): TunerTarget {
  const midiNote = pitchClassToMidi(input.pitchClass, input.octave);

  return {
    label: input.label,
    pitchClass: input.pitchClass,
    octave: input.octave,
    midiNote,
    frequency: midiToFrequency(midiNote, input.calibrationA4),
    courseNumber: input.courseNumber,
    stringInCourse: input.stringInCourse,
  };
}

export function detectScientificPitch(
  frequency: number,
  calibrationA4: number,
): ScientificPitch {
  const midiNote = Math.round(69 + 12 * Math.log2(frequency / calibrationA4));
  return midiToScientificPitch(midiNote);
}

export function buildGuidanceInstruction(params: {
  readonly targetCents: number;
  readonly toleranceCents: number;
  readonly isStable: boolean;
  readonly isFarFromTarget: boolean;
}): TunerGuidanceInstruction {
  if (params.isFarFromTarget) {
    return "check_note";
  }

  if (!params.isStable) {
    return "wait";
  }

  if (params.targetCents < -params.toleranceCents) {
    return "tighten";
  }

  if (params.targetCents > params.toleranceCents) {
    return "loosen";
  }

  return "in_tune";
}

export function analyzeTunerWindow(
  samples: readonly TunerFrequencySample[],
  options: TunerAnalysisOptions,
  target: TunerTarget | null,
): TunerAnalysisWindowResult {
  if (samples.length === 0) {
    return {
      signal: {
        quality: "none",
        strength: 0,
        sampleCount: 0,
        stabilityScore: 0,
        weaknessReason: "none",
      },
      analysis: null,
    };
  }

  const validSamples = samples.filter((sample) => isFinitePositiveNumber(sample.frequency));
  if (validSamples.length === 0) {
    return {
      signal: {
        quality: "weak",
        strength: 0,
        sampleCount: samples.length,
        stabilityScore: 0,
        weaknessReason: "invalid_frequency",
      },
      analysis: null,
    };
  }

  const averageAmplitude = average(validSamples.map((sample) => clamp(sample.amplitude, 0, 1)));
  if (averageAmplitude < options.weakSignalFloor) {
    return {
      signal: {
        quality: "weak",
        strength: averageAmplitude,
        sampleCount: validSamples.length,
        stabilityScore: 0,
        weaknessReason: "low_amplitude",
      },
      analysis: null,
    };
  }

  const frequencies = validSamples.map((sample) => sample.frequency);
  const centerFrequency = median(frequencies);
  const scientificPitch = detectScientificPitch(centerFrequency, options.calibrationA4);
  const nearestFrequency = pitchClassToFrequency(
    scientificPitch.pitchClass,
    scientificPitch.octave,
    options.calibrationA4,
  );
  const centsFromNearestNote = frequencyToCents(centerFrequency, nearestFrequency);
  const noteLabel = `${pitchClassToSpelling(scientificPitch.pitchClass, "sharps")}${scientificPitch.octave}`;

  const deviations = validSamples.map((sample) => Math.abs(frequencyToCents(sample.frequency, centerFrequency)));
  const stabilitySpread = deviations.length === 0 ? 0 : Math.max(...deviations);
  const stabilityScore = clamp(1 - stabilitySpread / options.stabilitySpreadCents, 0, 1);
  const isStable = validSamples.length >= options.sampleWindowSize && stabilityScore >= 0.75;
  const signalQuality: Exclude<TunerSignalQuality, "none"> = isStable ? "stable" : "unstable";

  const targetCents = target ? frequencyToCents(centerFrequency, target.frequency) : null;
  const isFarFromTarget = target !== null && Math.abs(targetCents ?? 0) > options.maxSafeGuidanceCents;
  const isWithinTolerance = target !== null && isStable && Math.abs(targetCents ?? 0) <= options.toleranceCents;
  const instruction = target
    ? buildGuidanceInstruction({
        targetCents: targetCents ?? 0,
        toleranceCents: options.toleranceCents,
        isStable,
        isFarFromTarget,
      })
    : null;

  const analysis: TunerAnalysis = {
    frequency: centerFrequency,
    scientificPitch,
    noteLabel,
    centsFromNearestNote,
    centsFromTarget: targetCents,
    target,
    signalQuality,
    signalStrength: averageAmplitude,
    stabilityScore,
    sampleCount: validSamples.length,
    isWeakSignal: false,
    isStable,
    isWithinTolerance,
    isFarFromTarget,
    instruction,
    canAdvance: Boolean(target && isWithinTolerance),
  };

  return {
    signal: {
      quality: signalQuality,
      strength: averageAmplitude,
      sampleCount: validSamples.length,
      stabilityScore,
      weaknessReason: isStable ? "none" : "unstable_window",
    },
    analysis,
  };
}
