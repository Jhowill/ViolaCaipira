import type { ChordDefinition, PitchClass } from "@/types/music";

export interface ChordQualityLookup {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly shortName: string;
  readonly symbolSuffix: string;
  readonly family: string;
}

export interface ParsedChordQuery {
  readonly rootPitchClass: PitchClass;
  readonly bassPitchClass: PitchClass | null;
  readonly qualityKey: string;
}

export interface ResolvedChordQuery {
  readonly chord: ChordDefinition;
  readonly quality: ChordQualityLookup;
  readonly symbol: string;
}

const NOTE_TOKEN_TO_PITCH_CLASS: Readonly<Record<string, PitchClass>> = {
  c: 0,
  do: 0,
  d: 2,
  re: 2,
  e: 4,
  mi: 4,
  f: 5,
  fa: 5,
  g: 7,
  sol: 7,
  a: 9,
  la: 9,
  b: 11,
  si: 11,
  ti: 11,
} as const;

const QUALITY_KEY_ALIASES: Readonly<Record<string, string>> = {
  maj: "major",
  major: "major",
  maior: "major",
  m: "minor",
  min: "minor",
  minor: "minor",
  menor: "minor",
  "7": "dominant_7",
  dom7: "dominant_7",
  dominant: "dominant_7",
  dominante: "dominant_7",
  "maj7": "major_7",
  "major7": "major_7",
  "maior7": "major_7",
  "7maj": "major_7",
  "m7": "minor_7",
  "min7": "minor_7",
  "minor7": "minor_7",
  "menor7": "minor_7",
  "sus2": "sus2",
  "sus4": "sus4",
  "add9": "add9",
  "6": "6",
  sexta: "6",
  "dim": "diminished",
  diminished: "diminished",
  diminuto: "diminished",
  "aug": "augmented",
  augmented: "augmented",
  aumentado: "augmented",
};

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeAccidentalWords(value: string): string {
  return value
    .replace(/𝄪|♯|sharp|sustenido/giu, "#")
    .replace(/𝄫|♭|flat|bemol/giu, "b")
    .replace(/♮|natural/giu, "");
}

export function normalizeChordQueryText(input: string): string {
  return normalizeAccidentalWords(stripDiacritics(input).toLowerCase())
    .replace(/[()\[\]{}.,;:!?]/g, " ")
    .replace(/\s+/g, "")
    .trim();
}

function accidentalOffset(value: string): number {
  switch (value) {
    case "##":
      return 2;
    case "#":
      return 1;
    case "bb":
      return -2;
    case "b":
      return -1;
    default:
      return 0;
  }
}

function parseAccidentalToken(value: string): string {
  if (value === "#" || value === "b" || value === "##" || value === "bb") {
    return value;
  }

  return value.replace(/[^#b]/g, "").slice(0, 2);
}

function normalizePitchClassIndex(value: number): PitchClass {
  const normalized = ((Math.trunc(value) % 12) + 12) % 12;
  return normalized as PitchClass;
}

function parseScientificPitchClassToken(token: string): PitchClass | null {
  const match = token.match(/^([a-g])([#b]{0,2})$/i);

  if (!match) {
    return null;
  }

  const letter = match[1]?.toLowerCase();
  const accidental = parseAccidentalToken(match[2] ?? "");

  if (!letter) {
    return null;
  }

  const basePitchClass: Record<string, PitchClass> = {
    c: 0,
    d: 2,
    e: 4,
    f: 5,
    g: 7,
    a: 9,
    b: 11,
  };

  const base = basePitchClass[letter];

  if (base === undefined) {
    return null;
  }

  return normalizePitchClassIndex(base + accidentalOffset(accidental));
}

function parseSolfegePitchClassToken(token: string): PitchClass | null {
  const match = token.match(/^(do|re|mi|fa|sol|la|si|ti)([#b]{0,2})$/i);

  if (!match) {
    return null;
  }

  const syllable = match[1]?.toLowerCase();
  const accidental = parseAccidentalToken(match[2] ?? "");

  if (!syllable) {
    return null;
  }

  const base = NOTE_TOKEN_TO_PITCH_CLASS[syllable];
  if (base === undefined) {
    return null;
  }

  return normalizePitchClassIndex(base + accidentalOffset(accidental));
}

function parsePitchClassToken(token: string): PitchClass | null {
  const normalized = normalizeChordQueryText(token);
  if (normalized.length === 0) {
    return null;
  }

  return parseScientificPitchClassToken(normalized) ?? parseSolfegePitchClassToken(normalized);
}

function parseQualityKey(tail: string): string {
  const normalized = normalizeChordQueryText(tail);

  if (normalized.length === 0) {
    return "major";
  }

  if (normalized.includes("maj7") || normalized.includes("major7") || normalized.includes("maior7")) {
    return "major_7";
  }

  if (normalized.includes("setimamaior") || normalized.includes("maiorcomsetima") || normalized.includes("majormaj7")) {
    return "major_7";
  }

  if (normalized.includes("m7") || normalized.includes("minor7") || normalized.includes("menor7")) {
    return "minor_7";
  }

  if (normalized.includes("menorcomsetima") || normalized.includes("minorcomsetima")) {
    return "minor_7";
  }

  if (normalized === "7" || normalized.includes("comsetima") || normalized.includes("dominante7") || normalized.includes("dominant7")) {
    return "dominant_7";
  }

  if (normalized.includes("sus2")) {
    return "sus2";
  }

  if (normalized.includes("sus4")) {
    return "sus4";
  }

  if (normalized.includes("add9")) {
    return "add9";
  }

  if (normalized.includes("sexta") || normalized === "6") {
    return "6";
  }

  if (normalized.includes("dimin")) {
    return "diminished";
  }

  if (normalized.includes("aug") || normalized.includes("aumentado")) {
    return "augmented";
  }

  if (normalized.includes("maior") || normalized.includes("major") || normalized === "maj") {
    return "major";
  }

  if (normalized.includes("menor") || normalized.includes("minor") || normalized === "m" || normalized === "min") {
    return "minor";
  }

  const exactAlias = QUALITY_KEY_ALIASES[normalized];
  if (exactAlias) {
    return exactAlias;
  }

  return normalized;
}

function splitChordQuery(query: string): { readonly main: string; readonly bass: string | null } {
  const normalized = normalizeAccidentalWords(stripDiacritics(query).toLowerCase().trim());
  const slashIndex = normalized.indexOf("/");

  if (slashIndex < 0) {
    return {
      main: normalized,
      bass: null,
    };
  }

  return {
    main: normalized.slice(0, slashIndex),
    bass: normalized.slice(slashIndex + 1) || null,
  };
}

function parseChordCore(main: string): ParsedChordQuery | null {
  const compact = normalizeChordQueryText(main);
  if (compact.length === 0) {
    return null;
  }

  const match = compact.match(/^(do|re|mi|fa|sol|la|si|ti|[a-g])([#b]{0,2})(.*)$/i);

  if (!match) {
    return null;
  }

  const rootToken = `${match[1] ?? ""}${match[2] ?? ""}`;
  const rootPitchClass = parsePitchClassToken(rootToken);

  if (rootPitchClass === null) {
    return null;
  }

  const qualityKey = parseQualityKey(match[3] ?? "");

  return {
    rootPitchClass,
    bassPitchClass: null,
    qualityKey,
  };
}

export function parseChordQuery(query: string): ParsedChordQuery | null {
  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const { main, bass } = splitChordQuery(trimmed);
  const parsed = parseChordCore(main);

  if (!parsed) {
    return null;
  }

  const bassPitchClass = bass === null ? null : parsePitchClassToken(bass);

  return {
    ...parsed,
    bassPitchClass,
  };
}

function normalizeQualityAlias(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function buildQualityAliases(quality: ChordQualityLookup): readonly string[] {
  const aliases = new Set<string>();
  const normalizedCode = normalizeQualityAlias(quality.code);
  const normalizedId = normalizeQualityAlias(quality.id);
  const normalizedName = normalizeQualityAlias(quality.name);
  const normalizedShortName = normalizeQualityAlias(quality.shortName);
  const normalizedSuffix = normalizeQualityAlias(quality.symbolSuffix);

  for (const alias of [normalizedCode, normalizedId, normalizedName, normalizedShortName, normalizedSuffix]) {
    if (alias.length > 0) {
      aliases.add(alias);
    }
  }

  if (normalizedCode.startsWith("quality")) {
    aliases.add(normalizedCode.replace(/^quality/, ""));
  }

  if (quality.family === "major") {
    aliases.add("major");
    aliases.add("maior");
    aliases.add("maj");
  }

  if (quality.family === "minor") {
    aliases.add("minor");
    aliases.add("menor");
    aliases.add("min");
    aliases.add("m");
  }

  if (quality.family === "dominant") {
    aliases.add("dominant");
    aliases.add("dominante");
    aliases.add("7");
    aliases.add("dom7");
  }

  if (quality.family === "diminished") {
    aliases.add("diminished");
    aliases.add("diminuto");
    aliases.add("dim");
  }

  if (quality.family === "augmented") {
    aliases.add("augmented");
    aliases.add("aumentado");
    aliases.add("aug");
  }

  return [...aliases];
}

function resolveQuality(qualities: readonly ChordQualityLookup[], qualityKey: string): ChordQualityLookup | null {
  const normalizedKey = normalizeQualityAlias(qualityKey);

  if (normalizedKey.length === 0) {
    const major = qualities.find((quality) => normalizeQualityAlias(quality.family) === "major" || normalizeQualityAlias(quality.code) === "major");
    return major ?? qualities[0] ?? null;
  }

  const exactMatch = qualities.find((quality) => buildQualityAliases(quality).some((alias) => alias === normalizedKey));
  if (exactMatch) {
    return exactMatch;
  }

  if (normalizedKey === "7") {
    return qualities.find((quality) => normalizeQualityAlias(quality.symbolSuffix) === "7") ?? null;
  }

  return null;
}

export function resolveChordDefinitionFromQuery(
  query: string,
  qualities: readonly ChordQualityLookup[],
): ResolvedChordQuery | null {
  const parsed = parseChordQuery(query);

  if (!parsed) {
    return null;
  }

  const quality = resolveQuality(qualities, parsed.qualityKey);

  if (!quality) {
    return null;
  }

  const chord: ChordDefinition = {
    rootPitchClass: parsed.rootPitchClass,
    qualityId: quality.id,
    bassPitchClass: parsed.bassPitchClass,
  };

  return {
    chord,
    quality,
    symbol: formatChordSymbolFromPieces(chord, quality.symbolSuffix),
  };
}

export function buildChordQualityAliasList(quality: ChordQualityLookup): readonly string[] {
  return buildQualityAliases(quality);
}

export function formatChordSymbolFromPieces(
  chord: ChordDefinition,
  qualitySuffix: string,
  accidentalPreference: "contextual" | "sharps" | "flats" = "contextual",
): string {
  const root = formatPitchClass(chord.rootPitchClass, accidentalPreference);
  const bass =
    chord.bassPitchClass === null || chord.bassPitchClass === undefined || chord.bassPitchClass === chord.rootPitchClass
      ? ""
      : `/${formatPitchClass(chord.bassPitchClass, accidentalPreference)}`;

  return `${root}${qualitySuffix}${bass}`;
}

function formatPitchClass(pitchClass: PitchClass, preference: "contextual" | "sharps" | "flats"): string {
  const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
  const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;

  if (preference === "flats") {
    return FLAT_NAMES[pitchClass];
  }

  if (preference === "sharps") {
    return SHARP_NAMES[pitchClass];
  }

  return SHARP_NAMES[pitchClass];
}
