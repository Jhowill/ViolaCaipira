import { describe, expect, it } from "vitest";

import {
  normalizeAccidentalToken,
  normalizePitchSpelling,
  parseScientificPitch,
  pitchSpellingToPitchClass,
} from "@/domain/music/normalization";

describe("music normalization", () => {
  it("normalizes accidentals without depending on language-specific input", () => {
    expect(normalizeAccidentalToken("♯")).toBe("#");
    expect(normalizeAccidentalToken("bemol")).toBe("b");
    expect(normalizeAccidentalToken("sustenido")).toBe("#");
  });

  it("normalizes pitch spellings and preserves enharmonic equivalence", () => {
    expect(normalizePitchSpelling(" d♭4 ")).toBe("Db4");
    expect(parseScientificPitch("F sustenido3")).toEqual({
      pitchClass: 6,
      octave: 3,
    });

    const sharp = pitchSpellingToPitchClass("C#4");
    const flat = pitchSpellingToPitchClass("Db4");

    expect(sharp).toBe(1);
    expect(flat).toBe(1);
    expect(sharp).toBe(flat);
  });
});
