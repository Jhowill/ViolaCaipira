import { describe, expect, it } from "vitest";

import { midiToFrequency, pitchClassToMidi } from "@/domain/music/conversions";
import { analyzeVoicing, buildVoicingPositionInput, type ChordQualityIntervalLike } from "@/domain/music/voicing";
import type { ChordDefinition, TuningStringDetails } from "@/types/music";

const MAJOR_TRIAD_INTERVALS: readonly ChordQualityIntervalLike[] = [
  {
    semitones: 0,
    degreeLabel: "P1",
    role: "root",
    sortOrder: 0,
    isRequired: true,
  },
  {
    semitones: 4,
    degreeLabel: "M3",
    role: "third",
    sortOrder: 1,
    isRequired: true,
  },
  {
    semitones: 7,
    degreeLabel: "P5",
    role: "fifth",
    sortOrder: 2,
    isRequired: true,
  },
];

const C_MAJOR: ChordDefinition = {
  rootPitchClass: 0,
  qualityId: "major",
  bassPitchClass: null,
};

function createTuningString(
  physicalStringNumber: 1 | 2 | 3 | 4,
  pitchClass: 0 | 2 | 4 | 5 | 7 | 9 | 11,
  octave: number,
  stringInCourse: 1 | 2,
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

describe("voicing analysis", () => {
  it("calcula notas, intervalos e raízes para uma tríade aberta", () => {
    const positions = [
      buildVoicingPositionInput({
        tuningString: createTuningString(1, 0, 3, 1),
        fret: 0,
        finger: null,
        physicalStringNumber: 1,
        courseNumber: 1,
        stringInCourse: 1,
      }),
      buildVoicingPositionInput({
        tuningString: createTuningString(2, 4, 3, 2),
        fret: 0,
        finger: null,
        physicalStringNumber: 2,
        courseNumber: 1,
        stringInCourse: 2,
      }),
      buildVoicingPositionInput({
        tuningString: createTuningString(3, 7, 3, 1),
        fret: 0,
        finger: null,
        physicalStringNumber: 3,
        courseNumber: 2,
        stringInCourse: 1,
      }),
      buildVoicingPositionInput({
        tuningString: createTuningString(4, 5, 3, 2),
        fret: -1,
        finger: null,
        physicalStringNumber: 4,
        courseNumber: 2,
        stringInCourse: 2,
      }),
    ] as const;

    const analysis = analyzeVoicing({
      chord: C_MAJOR,
      positions,
      qualityIntervals: MAJOR_TRIAD_INTERVALS,
    });

    expect(analysis.rootMidiNote).toBe(48);
    expect(analysis.missingRequiredDegreeLabels).toEqual([]);
    expect(analysis.hasAnyInvalidInterval).toBe(false);
    expect(analysis.positions).toHaveLength(4);
    expect(analysis.positions[0]).toMatchObject({
      physicalStringNumber: 1,
      pitchClass: 0,
      octave: 3,
      intervalLabel: "P1",
      isRoot: true,
    });
    expect(analysis.positions[1]).toMatchObject({
      physicalStringNumber: 2,
      pitchClass: 4,
      octave: 3,
      intervalLabel: "M3",
      isRoot: false,
    });
    expect(analysis.positions[2]).toMatchObject({
      physicalStringNumber: 3,
      pitchClass: 7,
      octave: 3,
      intervalLabel: "P5",
      isRoot: false,
    });
    expect(analysis.positions[3]).toMatchObject({
      physicalStringNumber: 4,
      pitchClass: null,
      octave: null,
      intervalLabel: null,
      isRoot: false,
      midiNote: null,
    });
  });

  it("marca intervalos inválidos e registra graus obrigatórios ausentes", () => {
    const positions = [
      buildVoicingPositionInput({
        tuningString: createTuningString(1, 0, 3, 1),
        fret: 0,
        finger: null,
        physicalStringNumber: 1,
        courseNumber: 1,
        stringInCourse: 1,
      }),
      buildVoicingPositionInput({
        tuningString: createTuningString(2, 5, 3, 2),
        fret: 0,
        finger: null,
        physicalStringNumber: 2,
        courseNumber: 1,
        stringInCourse: 2,
      }),
    ] as const;

    const analysis = analyzeVoicing({
      chord: C_MAJOR,
      positions,
      qualityIntervals: MAJOR_TRIAD_INTERVALS,
    });

    expect(analysis.hasAnyInvalidInterval).toBe(true);
    expect(analysis.missingRequiredDegreeLabels).toEqual(["M3", "P5"]);
  });
});
