import type { ChordDefinition, ChordFinger, ChordStringPosition, PitchClass, ScientificPitch, TuningStringDetails } from "@/types/music";

export interface ChordQualityIntervalLike {
  readonly semitones: number;
  readonly degreeLabel: string;
  readonly role: "root" | "third" | "fifth" | "seventh" | "extension" | "alteration";
  readonly sortOrder: number;
  readonly isRequired: boolean;
}

export interface VoicingPositionInput {
  readonly physicalStringNumber: ChordStringPosition["physicalStringNumber"];
  readonly courseNumber: ChordStringPosition["courseNumber"];
  readonly stringInCourse: ChordStringPosition["stringInCourse"];
  readonly fret: number;
  readonly finger: ChordFinger | null;
  readonly tuningString: TuningStringDetails;
}

export interface VoicingPositionResult extends ChordStringPosition {
  readonly isRoot: boolean;
  readonly midiNote: number | null;
}

export interface VoicingAnalysisResult {
  readonly positions: readonly VoicingPositionResult[];
  readonly rootMidiNote: number | null;
  readonly missingRequiredDegreeLabels: readonly string[];
  readonly hasAnyInvalidInterval: boolean;
}

const PITCH_CLASS_MODULO = 12;
const INTERVAL_LABELS: Readonly<Record<number, string>> = {
  0: "P1",
  1: "m2",
  2: "M2",
  3: "m3",
  4: "M3",
  5: "P4",
  6: "A4",
  7: "P5",
  8: "m6",
  9: "M6",
  10: "m7",
  11: "M7",
  12: "P8",
  13: "m9",
  14: "M9",
  15: "m10",
  16: "M10",
  17: "P11",
  18: "A11",
  19: "P12",
  20: "m13",
  21: "M13",
  22: "m14",
  23: "M14",
};

function normalizePitchClassIndex(value: number): PitchClass {
  const normalized = ((Math.trunc(value) % PITCH_CLASS_MODULO) + PITCH_CLASS_MODULO) % PITCH_CLASS_MODULO;
  return normalized as PitchClass;
}

function midiToPitchClass(midi: number): PitchClass {
  return normalizePitchClassIndex(midi);
}

function midiToOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

function midiToScientificPitch(midi: number): ScientificPitch {
  return {
    pitchClass: midiToPitchClass(midi),
    octave: midiToOctave(midi),
  };
}

function formatIntervalLabel(semitones: number): string {
  const normalized = ((Math.trunc(semitones) % 24) + 24) % 24;
  return INTERVAL_LABELS[normalized] ?? `+${normalized}`;
}

function buildIntervalClassSet(qualityIntervals: readonly ChordQualityIntervalLike[]): Set<number> {
  return new Set(qualityIntervals.map((interval) => normalizePitchClassIndex(interval.semitones)));
}

function buildRequiredLabels(qualityIntervals: readonly ChordQualityIntervalLike[]): readonly string[] {
  return qualityIntervals
    .filter((interval) => interval.isRequired)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((interval) => interval.degreeLabel);
}

export function analyzeVoicing(input: {
  readonly chord: ChordDefinition;
  readonly positions: readonly VoicingPositionInput[];
  readonly qualityIntervals: readonly ChordQualityIntervalLike[];
}): VoicingAnalysisResult {
  const intervalClassSet = buildIntervalClassSet(input.qualityIntervals);
  const requiredDegreeLabels = new Set(buildRequiredLabels(input.qualityIntervals));
  const positions = input.positions
    .slice()
    .sort((left, right) => left.physicalStringNumber - right.physicalStringNumber)
    .map((position) => {
      if (position.fret === -1) {
        return {
          physicalStringNumber: position.physicalStringNumber,
          courseNumber: position.courseNumber,
          stringInCourse: position.stringInCourse,
          fret: position.fret,
          finger: position.finger,
          pitchClass: null,
          octave: null,
          intervalLabel: null,
          isRoot: false,
          midiNote: null,
        } satisfies VoicingPositionResult;
      }

      const midiNote = position.tuningString.midiNote + position.fret;
      const scientificPitch = midiToScientificPitch(midiNote);
      const isRoot = scientificPitch.pitchClass === input.chord.rootPitchClass;

      return {
        physicalStringNumber: position.physicalStringNumber,
        courseNumber: position.courseNumber,
        stringInCourse: position.stringInCourse,
        fret: position.fret,
        finger: position.finger,
        pitchClass: scientificPitch.pitchClass,
        octave: scientificPitch.octave,
        intervalLabel: null,
        isRoot,
        midiNote,
      } satisfies VoicingPositionResult;
    });

  const rootMidiNote = positions
    .filter((position) => position.isRoot && position.midiNote !== null)
    .map((position) => position.midiNote as number)
    .sort((left, right) => left - right)[0] ?? null;

  const resolvedPositions = positions.map((position) => {
    if (position.midiNote === null || rootMidiNote === null) {
      return position;
    }

    const intervalSemitones = position.midiNote - rootMidiNote;
    return {
      ...position,
      intervalLabel: formatIntervalLabel(intervalSemitones),
    };
  });

  let hasAnyInvalidInterval = false;
  const presentRequiredLabels = new Set<string>();

  for (const position of resolvedPositions) {
    if (position.midiNote === null || position.pitchClass === null || position.octave === null) {
      continue;
    }

    const intervalClass = rootMidiNote === null ? null : normalizePitchClassIndex(position.midiNote - rootMidiNote);
    if (intervalClass === null || !intervalClassSet.has(intervalClass)) {
      hasAnyInvalidInterval = true;
      continue;
    }

    const matchingRequired = input.qualityIntervals.find((interval) => normalizePitchClassIndex(interval.semitones) === intervalClass);
    if (matchingRequired?.isRequired) {
      presentRequiredLabels.add(matchingRequired.degreeLabel);
    }
  }

  const missingRequiredDegreeLabels = [...requiredDegreeLabels].filter((label) => !presentRequiredLabels.has(label));

  return {
    positions: resolvedPositions,
    rootMidiNote,
    missingRequiredDegreeLabels,
    hasAnyInvalidInterval,
  };
}

export function buildVoicingPositionInput(params: {
  readonly tuningString: TuningStringDetails;
  readonly fret: number;
  readonly finger: ChordFinger | null;
  readonly physicalStringNumber: VoicingPositionInput["physicalStringNumber"];
  readonly courseNumber: VoicingPositionInput["courseNumber"];
  readonly stringInCourse: VoicingPositionInput["stringInCourse"];
}): VoicingPositionInput {
  return {
    physicalStringNumber: params.physicalStringNumber,
    courseNumber: params.courseNumber,
    stringInCourse: params.stringInCourse,
    fret: params.fret,
    finger: params.finger,
    tuningString: params.tuningString,
  };
}
