import type {
  PitchClass,
  SongDocument,
  SongLineDocument,
  SongSectionDocument,
  SongSegmentDocument,
} from "@/types/music";

type SongChordSegment = Extract<SongSegmentDocument, { readonly type: "chord" }>;
type SongChordToken = SongChordSegment["chord"];

function normalizePitchClassIndex(value: number): PitchClass {
  const normalized = ((Math.trunc(value) % 12) + 12) % 12;
  return normalized as PitchClass;
}

function transposePitchClass(value: PitchClass, semitones: number): PitchClass {
  return normalizePitchClassIndex(value + semitones);
}

function collectIds(document: SongDocument): readonly string[] {
  const ids: string[] = [];

  for (const section of document.sections) {
    ids.push(section.id);

    for (const line of section.lines) {
      ids.push(line.id);

      for (const segment of line.segments) {
        ids.push(segment.id);
      }
    }
  }

  return ids;
}

export function assertValidSongDocument(document: SongDocument): SongDocument {
  if (document.version !== 1) {
    throw new Error("SongDocument version must be 1.");
  }

  const ids = new Set<string>();

  for (const id of collectIds(document)) {
    if (ids.has(id)) {
      throw new Error(`Duplicate SongDocument ID: ${id}`);
    }

    ids.add(id);
  }

  return document;
}

export function transposeChordToken<TChord extends SongChordToken>(token: TChord, semitones: number): TChord {
  return {
    ...token,
    rootPitchClass: transposePitchClass(token.rootPitchClass, semitones),
    bassPitchClass:
      token.bassPitchClass === undefined || token.bassPitchClass === null
        ? token.bassPitchClass
        : transposePitchClass(token.bassPitchClass, semitones),
  };
}

function transposeSegment(segment: SongSegmentDocument, semitones: number): SongSegmentDocument {
  if (segment.type !== "chord") {
    return segment;
  }

  return {
    ...segment,
    chord: transposeChordToken(segment.chord, semitones),
  };
}

function transposeLine(line: SongLineDocument, semitones: number): SongLineDocument {
  return {
    ...line,
    segments: line.segments.map((segment) => transposeSegment(segment, semitones)),
  };
}

function transposeSection(section: SongSectionDocument, semitones: number): SongSectionDocument {
  return {
    ...section,
    lines: section.lines.map((line) => transposeLine(line, semitones)),
  };
}

export function transposeSongDocument(document: SongDocument, semitones: number): SongDocument {
  assertValidSongDocument(document);

  return {
    version: 1,
    sections: document.sections.map((section) => transposeSection(section, semitones)),
  };
}

export type { SongChordToken };
