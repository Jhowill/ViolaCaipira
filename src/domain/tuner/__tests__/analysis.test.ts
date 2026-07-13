import { describe, expect, it } from "vitest";

import { analyzeTunerWindow, createTunerTarget } from "@/domain/tuner";
import type { TunerFrequencySample } from "@/types/tuner";

const OPTIONS = {
  calibrationA4: 440,
  toleranceCents: 5,
  sampleWindowSize: 3,
  weakSignalFloor: 0.2,
  stabilitySpreadCents: 12,
  maxSafeGuidanceCents: 120,
} as const;

function buildSamples(frequency: number, amplitude: number): readonly TunerFrequencySample[] {
  return [
    { frequency, amplitude, timestampMs: 1 },
    { frequency, amplitude, timestampMs: 2 },
    { frequency, amplitude, timestampMs: 3 },
  ];
}

describe("tuner analysis", () => {
  it("identifica A4 e confirma estabilidade dentro da tolerância", () => {
    const target = createTunerTarget({
      label: "A4",
      pitchClass: 9,
      octave: 4,
      calibrationA4: 440,
    });

    const result = analyzeTunerWindow(buildSamples(440, 0.85), OPTIONS, target);

    expect(result.signal.quality).toBe("stable");
    expect(result.analysis).not.toBeNull();
    expect(result.analysis).toMatchObject({
      noteLabel: "A4",
      isStable: true,
      isWithinTolerance: true,
      instruction: "in_tune",
    });
  });

  it("evita orientação perigosa quando a nota está distante do alvo", () => {
    const target = createTunerTarget({
      label: "D4",
      pitchClass: 2,
      octave: 4,
      calibrationA4: 440,
    });

    const result = analyzeTunerWindow(buildSamples(196, 0.9), OPTIONS, target);

    expect(result.signal.quality).toBe("stable");
    expect(result.analysis).not.toBeNull();
    expect(result.analysis).toMatchObject({
      isFarFromTarget: true,
      instruction: "check_note",
      isWithinTolerance: false,
    });
  });

  it("trata sinal fraco sem gerar análise falsa", () => {
    const target = createTunerTarget({
      label: "A4",
      pitchClass: 9,
      octave: 4,
      calibrationA4: 440,
    });

    const result = analyzeTunerWindow(buildSamples(440, 0.05), OPTIONS, target);

    expect(result.signal.quality).toBe("weak");
    expect(result.signal.weaknessReason).toBe("low_amplitude");
    expect(result.analysis).toBeNull();
  });
});
