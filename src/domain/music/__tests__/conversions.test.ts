import { describe, expect, it } from "vitest";

import {
  centsBetweenFrequencies,
  midiToFrequency,
  pitchClassToMidi,
  pitchClassToSpelling,
} from "@/domain/music/conversions";
import { isPitchClass } from "@/domain/music/validation";

describe("music conversions", () => {
  it("keeps the core pitch math aligned with the docs", () => {
    expect(isPitchClass(0)).toBe(true);
    expect(isPitchClass(11)).toBe(true);
    expect(isPitchClass(-1)).toBe(false);
    expect(isPitchClass(12)).toBe(false);

    expect(pitchClassToMidi(9, 4)).toBe(69);
    expect(midiToFrequency(69)).toBeCloseTo(440, 10);
    expect(centsBetweenFrequencies(880, 440)).toBeCloseTo(1200, 10);
  });

  it("spells pitch classes with sharp or flat preference", () => {
    expect(pitchClassToSpelling(1, "sharps")).toBe("C#");
    expect(pitchClassToSpelling(1, "flats")).toBe("Db");
    expect(pitchClassToSpelling(10, "contextual")).toBe("A#");
  });
});
