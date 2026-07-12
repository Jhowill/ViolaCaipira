import { normalizeChordQueryText, resolveChordDefinitionFromQuery, type ChordQualityLookup } from "@/domain/music/chords";
import type { SongDocument, SongLineDocument, SongSectionDocument, SongSegmentDocument } from "@/types/music";

import {
  assertValidSongDocument,
  type SongChordToken,
} from "@/domain/songs/songDocument";

export type SongParseWarningCode =
  | "empty_input"
  | "input_truncated"
  | "html_detected"
  | "script_detected"
  | "unrecognized_chord"
  | "unrecognized_section";

export interface SongParseWarning {
  readonly code: SongParseWarningCode;
  readonly message: string;
  readonly lineNumber?: number;
  readonly token?: string;
}

export interface SongSectionSummary {
  readonly id: string;
  readonly type: SongSectionDocument["type"];
  readonly label: string | null;
  readonly lineCount: number;
}

export interface SongParseResult {
  readonly document: SongDocument;
  readonly warnings: readonly SongParseWarning[];
  readonly recognizedChords: readonly SongChordToken[];
  readonly unrecognizedChords: readonly string[];
  readonly sections: readonly SongSectionSummary[];
}

export interface SongParseOptions {
  readonly qualities?: readonly ChordQualityLookup[];
  readonly maxLength?: number;
}

interface MutableSongLine {
  readonly id: string;
  readonly type: SongLineDocument["type"];
  segments: SongSegmentDocument[];
}

interface MutableSongSection {
  readonly id: string;
  type: SongSectionDocument["type"];
  label?: string;
  repeatCount?: number;
  readonly lines: MutableSongLine[];
}

export const DEFAULT_SONG_PARSE_MAX_LENGTH = 100_000;

export const DEFAULT_SONG_QUALITY_LOOKUP: readonly ChordQualityLookup[] = [
  {
    id: "major",
    code: "major",
    name: "Major",
    shortName: "",
    symbolSuffix: "",
    family: "major",
  },
  {
    id: "minor",
    code: "minor",
    name: "Minor",
    shortName: "m",
    symbolSuffix: "m",
    family: "minor",
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
    id: "major_7",
    code: "major_7",
    name: "Major seventh",
    shortName: "maj7",
    symbolSuffix: "maj7",
    family: "major",
  },
  {
    id: "minor_7",
    code: "minor_7",
    name: "Minor seventh",
    shortName: "m7",
    symbolSuffix: "m7",
    family: "minor",
  },
  {
    id: "sus2",
    code: "sus2",
    name: "Suspended second",
    shortName: "sus2",
    symbolSuffix: "sus2",
    family: "suspended",
  },
  {
    id: "sus4",
    code: "sus4",
    name: "Suspended fourth",
    shortName: "sus4",
    symbolSuffix: "sus4",
    family: "suspended",
  },
  {
    id: "add9",
    code: "add9",
    name: "Add nine",
    shortName: "add9",
    symbolSuffix: "add9",
    family: "extended",
  },
  {
    id: "6",
    code: "6",
    name: "Sixth",
    shortName: "6",
    symbolSuffix: "6",
    family: "major",
  },
  {
    id: "diminished",
    code: "diminished",
    name: "Diminished",
    shortName: "dim",
    symbolSuffix: "dim",
    family: "diminished",
  },
  {
    id: "augmented",
    code: "augmented",
    name: "Augmented",
    shortName: "aug",
    symbolSuffix: "aug",
    family: "augmented",
  },
];

const SECTION_TYPE_KEYWORDS: ReadonlyArray<{
  readonly keyword: string;
  readonly type: SongSectionDocument["type"];
}> = [
  { keyword: "intro", type: "intro" },
  { keyword: "verse", type: "verse" },
  { keyword: "verso", type: "verse" },
  { keyword: "prechorus", type: "pre_chorus" },
  { keyword: "prechoro", type: "pre_chorus" },
  { keyword: "prerefrao", type: "pre_chorus" },
  { keyword: "chorus", type: "chorus" },
  { keyword: "refrao", type: "chorus" },
  { keyword: "bridge", type: "bridge" },
  { keyword: "ponte", type: "bridge" },
  { keyword: "solo", type: "solo" },
  { keyword: "outro", type: "outro" },
  { keyword: "note", type: "note" },
  { keyword: "nota", type: "note" },
  { keyword: "custom", type: "custom" },
];

function normalizeSectionKey(value: string): string {
  return normalizeChordQueryText(value);
}

function createIdFactory(prefix: string): () => string {
  let counter = 0;

  return () => {
    counter += 1;
    return `${prefix}-${counter}`;
  };
}

function createWarning(code: SongParseWarningCode, message: string, lineNumber?: number, token?: string): SongParseWarning {
  return {
    code,
    message,
    lineNumber,
    token,
  };
}

function createTextSegment(id: string, text: string): Extract<SongSegmentDocument, { readonly type: "text" }> {
  return {
    id,
    type: "text",
    text,
  };
}

function createChordSegment(id: string, chord: SongChordToken, anchorOffset?: number): Extract<SongSegmentDocument, { readonly type: "chord" }> {
  return anchorOffset === undefined
    ? {
        id,
        type: "chord",
        chord,
      }
    : {
        id,
        type: "chord",
        chord,
        anchorOffset,
      };
}

function createBreakSegment(id: string): Extract<SongSegmentDocument, { readonly type: "break" }> {
  return {
    id,
    type: "break",
  };
}

function createBlankLine(id: string): MutableSongLine {
  return {
    id,
    type: "blank",
    segments: [createBreakSegment(`${id}-break`)],
  };
}

function createLyricsLine(id: string, segments: readonly SongSegmentDocument[]): MutableSongLine {
  return {
    id,
    type: "lyrics",
    segments: [...segments],
  };
}

function createChordsLine(id: string, segments: readonly SongSegmentDocument[]): MutableSongLine {
  return {
    id,
    type: "chords",
    segments: [...segments],
  };
}

function isSectionHeaderLine(line: string): { readonly type: SongSectionDocument["type"]; readonly label: string } | null {
  const trimmed = line.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const bracketMatch = trimmed.match(/^\[(.+)\]$/);
  const rawLabel = (bracketMatch?.[1] ?? trimmed).trim();
  const normalized = normalizeSectionKey(rawLabel);
  if (normalized.length === 0) {
    return null;
  }

  for (const candidate of SECTION_TYPE_KEYWORDS) {
    if (normalized === candidate.keyword || normalized.startsWith(candidate.keyword)) {
      return {
        type: candidate.type,
        label: rawLabel,
      };
    }
  }

  return null;
}

function splitInlineChordLine(line: string): readonly { readonly text: string; readonly isChord: boolean; readonly chord?: SongChordToken }[] {
  const fragments: { readonly text: string; readonly isChord: boolean; readonly chord?: SongChordToken }[] = [];
  const chordPattern = /\[([^\]]+)\]/g;
  let cursor = 0;

  while (true) {
    const match = chordPattern.exec(line);
    if (!match) {
      break;
    }

    const matchIndex = match.index ?? 0;
    if (matchIndex > cursor) {
      fragments.push({
        text: line.slice(cursor, matchIndex),
        isChord: false,
      });
    }

    const tokenText = (match[1] ?? "").trim();
    fragments.push({
      text: tokenText,
      isChord: true,
    });
    cursor = matchIndex + (match[0]?.length ?? 0);
  }

  if (cursor < line.length) {
    fragments.push({
      text: line.slice(cursor),
      isChord: false,
    });
  }

  return fragments;
}

function parseChordToken(
  token: string,
  qualities: readonly ChordQualityLookup[],
): { readonly chord: SongChordToken; readonly symbol: string } | null {
  const resolved = resolveChordDefinitionFromQuery(token, qualities);

  if (!resolved) {
    return null;
  }

  return {
    chord: {
      ...resolved.chord,
      originalSpelling: token,
    },
    symbol: resolved.symbol,
  };
}

function isLikelyChordToken(token: string): boolean {
  const normalized = normalizeSectionKey(token.replace(/^\[|\]$/g, ""));
  return /^(do|re|mi|fa|sol|la|si|ti|[a-g])/.test(normalized);
}

function buildLyricsSegments(
  line: string,
  lineNumber: number,
  qualities: readonly ChordQualityLookup[],
  warnings: SongParseWarning[],
  recognizedChords: SongChordToken[],
  unrecognizedChords: string[],
  segmentIdFactory: () => string,
): readonly SongSegmentDocument[] {
  const fragments = splitInlineChordLine(line);

  if (fragments.every((fragment) => !fragment.isChord)) {
    return [createTextSegment(segmentIdFactory(), line)];
  }

  const segments: SongSegmentDocument[] = [];
  let currentText = "";

  for (const fragment of fragments) {
    if (!fragment.isChord) {
      currentText += fragment.text;
      continue;
    }

    if (currentText.length > 0) {
      segments.push(createTextSegment(segmentIdFactory(), currentText));
      currentText = "";
    }

    const parsed = parseChordToken(fragment.text, qualities);
    if (!parsed) {
      warnings.push(createWarning("unrecognized_chord", `Unrecognized chord token '${fragment.text}'.`, lineNumber, fragment.text));
      unrecognizedChords.push(fragment.text);
      segments.push(createTextSegment(segmentIdFactory(), `[${fragment.text}]`));
      continue;
    }

    recognizedChords.push(parsed.chord);
    segments.push(createChordSegment(segmentIdFactory(), parsed.chord));
  }

  if (currentText.length > 0) {
    segments.push(createTextSegment(segmentIdFactory(), currentText));
  }

  return segments.length > 0 ? segments : [createTextSegment(segmentIdFactory(), line)];
}

function buildChordsLineSegments(
  line: string,
  qualities: readonly ChordQualityLookup[],
  recognizedChords: SongChordToken[],
  warnings: SongParseWarning[],
  unrecognizedChords: string[],
  segmentIdFactory: () => string,
): readonly SongSegmentDocument[] | null {
  const tokens = line.trim().split(/\s+/).filter((token) => token.length > 0);

  if (tokens.length === 0 || !tokens.every((token) => isLikelyChordToken(token))) {
    return null;
  }

  const parsedTokens = tokens.map((token) => {
    const normalizedToken = token.replace(/^\[|\]$/g, "");
    return {
      token,
      parsed: parseChordToken(normalizedToken, qualities),
    };
  });

  if (parsedTokens.some((entry) => entry.parsed === null)) {
    for (const entry of parsedTokens) {
      if (entry.parsed !== null) {
        continue;
      }

      warnings.push(createWarning("unrecognized_chord", `Unrecognized chord token '${entry.token}'.`, undefined, entry.token));
      unrecognizedChords.push(entry.token);
    }

    return null;
  }

  return parsedTokens.map((entry) => {
    const chord = entry.parsed!.chord;
    recognizedChords.push(chord);
    return createChordSegment(segmentIdFactory(), chord);
  });
}

export function parseSongText(input: string, options: SongParseOptions = {}): SongParseResult {
  const qualities = options.qualities ?? DEFAULT_SONG_QUALITY_LOOKUP;
  const maxLength = options.maxLength ?? DEFAULT_SONG_PARSE_MAX_LENGTH;
  const warnings: SongParseWarning[] = [];
  const recognizedChords: SongChordToken[] = [];
  const unrecognizedChords: string[] = [];

  let source = input;
  if (source.length > maxLength) {
    source = source.slice(0, maxLength);
    warnings.push(createWarning("input_truncated", `Input exceeded the maximum length of ${maxLength} characters and was truncated.`));
  }

  if (/<(script|style)\b/i.test(source)) {
    warnings.push(createWarning("script_detected", "Script-like markup was found and kept as plain text."));
  } else if (/<[a-z][\s\S]*>/i.test(source)) {
    warnings.push(createWarning("html_detected", "HTML-like markup was found and kept as plain text."));
  }

  if (source.trim().length === 0) {
    const emptyDocument: SongDocument = {
      version: 1,
      sections: [],
    };

    return {
      document: emptyDocument,
      warnings: [createWarning("empty_input", "No song text was provided."), ...warnings],
      recognizedChords,
      unrecognizedChords,
      sections: [],
    };
  }

  const sectionIdFactory = createIdFactory("song-section");
  const lineIdFactory = createIdFactory("song-line");
  const segmentIdFactory = createIdFactory("song-segment");
  const sections: MutableSongSection[] = [];

  let currentSection: MutableSongSection | null = null;
  const startSection = (type: SongSectionDocument["type"], label: string | null): MutableSongSection => {
    const section: MutableSongSection = {
      id: sectionIdFactory(),
      type,
      ...(label ? { label } : {}),
      lines: [],
    };
    sections.push(section);
    currentSection = section;
    return section;
  };

  const ensureSection = (): MutableSongSection => {
    if (currentSection) {
      return currentSection;
    }

    return startSection("custom", null);
  };

  const lines = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index] ?? "";
    const lineNumber = index + 1;
    const trimmed = rawLine.trim();

    const header = isSectionHeaderLine(rawLine);
    if (header) {
      startSection(header.type, header.label);

      continue;
    }

    const section = ensureSection();

    if (trimmed.length === 0) {
      section.lines.push(createBlankLine(lineIdFactory()));
      continue;
    }

    if (rawLine.includes("[") && rawLine.includes("]")) {
      const lyricsSegments = buildLyricsSegments(
        rawLine,
        lineNumber,
        qualities,
        warnings,
        recognizedChords,
        unrecognizedChords,
        segmentIdFactory,
      );

      section.lines.push(createLyricsLine(lineIdFactory(), lyricsSegments));
      continue;
    }

    const chordLine = buildChordsLineSegments(rawLine, qualities, recognizedChords, warnings, unrecognizedChords, segmentIdFactory);

    if (chordLine) {
      section.lines.push(createChordsLine(lineIdFactory(), chordLine));
      continue;
    }

    const lyricsSegments = buildLyricsSegments(
      rawLine,
      lineNumber,
      qualities,
      warnings,
      recognizedChords,
      unrecognizedChords,
      segmentIdFactory,
    );
    section.lines.push(createLyricsLine(lineIdFactory(), lyricsSegments));
  }

  const meaningfulSections = sections.filter((section) => section.lines.length > 0 || section.label !== undefined);

  const document: SongDocument = {
    version: 1,
    sections: meaningfulSections.map((section) => ({
      id: section.id,
      type: section.type,
      ...(section.label ? { label: section.label } : {}),
      ...(section.repeatCount === undefined ? {} : { repeatCount: section.repeatCount }),
      lines: section.lines.map((line) => ({
        id: line.id,
        type: line.type,
        segments: line.segments.map((segment) => ({ ...segment })),
      })),
    })),
  };

  assertValidSongDocument(document);

  return {
    document,
    warnings,
    recognizedChords,
    unrecognizedChords,
    sections: meaningfulSections.map((section) => ({
      id: section.id,
      type: section.type,
      label: section.label ?? null,
      lineCount: section.lines.length,
    })),
  };
}
