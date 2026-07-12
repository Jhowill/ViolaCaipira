import { describe, expect, it } from "vitest";

import {
  buildChordQualityAliasList,
  formatChordSymbolFromPieces,
  parseChordQuery,
  resolveChordDefinitionFromQuery,
  type ChordQualityLookup,
} from "@/domain/music/chords";

const QUALITY_LOOKUP_FIXTURES: readonly ChordQualityLookup[] = [
  {
    id: "major",
    code: "major",
    name: "Major",
    shortName: "",
    symbolSuffix: "",
    family: "major",
  },
  {
    id: "dominant_7",
    code: "dominant_7",
    name: "Dominant seventh",
    shortName: "7",
    symbolSuffix: "7",
    family: "dominant",
  },
  {
    id: "minor_7",
    code: "minor_7",
    name: "Minor seventh",
    shortName: "m7",
    symbolSuffix: "m7",
    family: "minor",
  },
];

describe("chord query parsing", () => {
  it("normaliza notas, aceita bass e reconhece qualidade localizadas", () => {
    expect(parseChordQuery("Ré com sétima")).toEqual({
      rootPitchClass: 2,
      bassPitchClass: null,
      qualityKey: "dominant_7",
    });

    expect(parseChordQuery("D/F#")).toEqual({
      rootPitchClass: 2,
      bassPitchClass: 6,
      qualityKey: "major",
    });
  });

  it("resolve acordes a partir de sinônimos de qualidade", () => {
    const resolved = resolveChordDefinitionFromQuery("Ré com sétima", QUALITY_LOOKUP_FIXTURES);

    expect(resolved).not.toBeNull();
    expect(resolved).toMatchObject({
      chord: {
        rootPitchClass: 2,
        qualityId: "dominant_7",
        bassPitchClass: null,
      },
      quality: {
        id: "dominant_7",
        symbolSuffix: "7",
      },
      symbol: "D7",
    });
  });

  it("formata símbolos com a preferência de acidentes pedida", () => {
    expect(
      formatChordSymbolFromPieces(
        {
          rootPitchClass: 1,
          qualityId: "major",
          bassPitchClass: 6,
        },
        "7",
        "flats",
      ),
    ).toBe("Db7/Gb");
  });

  it("expõe aliases úteis para qualidades", () => {
    expect(buildChordQualityAliasList(QUALITY_LOOKUP_FIXTURES[0] as ChordQualityLookup)).toEqual(
      expect.arrayContaining(["major", "maior", "maj"]),
    );
  });
});
