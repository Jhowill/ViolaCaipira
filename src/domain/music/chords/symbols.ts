import type { AccidentalPreference, ChordDefinition } from "@/types/music";

import { formatChordSymbolFromPieces, type ChordQualityLookup } from "@/domain/music/chords/queries";

export interface ChordQualitySummary {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly shortName: string;
  readonly symbolSuffix: string;
  readonly family: string;
}

export function summarizeChordQuality(quality: ChordQualityLookup): ChordQualitySummary {
  return {
    id: quality.id,
    code: quality.code,
    name: quality.name,
    shortName: quality.shortName,
    symbolSuffix: quality.symbolSuffix,
    family: quality.family,
  };
}

export function formatChordSymbol(
  chord: ChordDefinition,
  quality: ChordQualitySummary,
  accidentalPreference: AccidentalPreference = "contextual",
): string {
  return formatChordSymbolFromPieces(chord, quality.symbolSuffix, accidentalPreference);
}
