import { pitchClassToSpelling } from "@/domain/music/conversions";
import type { ChordBarre, ChordShapeDetails, ChordStringPosition, DiagramMode } from "@/types/music";

export interface ChordDiagramLayoutOptions {
  readonly mode?: DiagramMode;
  readonly leftHanded?: boolean;
}

export interface ChordDiagramStringEntry {
  readonly key: string;
  readonly label: string;
  readonly position: ChordStringPosition;
  readonly xIndex: number;
}

export interface ChordDiagramMarkerEntry {
  readonly key: string;
  readonly label: string;
  readonly position: ChordStringPosition;
  readonly xIndex: number;
  readonly kind: "open" | "muted" | "fretted";
  readonly fret: number;
  readonly finger: ChordStringPosition["finger"];
  readonly noteLabel: string | null;
}

export interface ChordDiagramBarreEntry {
  readonly key: string;
  readonly fret: number;
  readonly fromIndex: number;
  readonly toIndex: number;
  readonly finger: ChordBarre["finger"];
}

export interface ChordDiagramLayout {
  readonly strings: readonly ChordDiagramStringEntry[];
  readonly markers: readonly ChordDiagramMarkerEntry[];
  readonly barres: readonly ChordDiagramBarreEntry[];
  readonly startFret: number;
  readonly fretCount: number;
  readonly usesNut: boolean;
  readonly accessibilityLabel: string;
}

function formatNoteLabel(position: ChordStringPosition): string | null {
  if (position.pitchClass === null || position.octave === null) {
    return null;
  }

  return `${pitchClassToSpelling(position.pitchClass, "contextual")}${position.octave}`;
}

function formatCourseLabel(courseNumber: number): string {
  return `${courseNumber}\u00AA`;
}

function positionLabel(position: ChordStringPosition, mode: DiagramMode): string {
  if (mode === "ten_strings") {
    return `Corda ${position.physicalStringNumber}`;
  }

  return `Ordem ${formatCourseLabel(position.courseNumber)}`;
}

function buildRepresentativePositions(
  shape: ChordShapeDetails,
  mode: DiagramMode,
): readonly ChordStringPosition[] {
  const orderedPositions = [...shape.positions].sort((left, right) => left.physicalStringNumber - right.physicalStringNumber);

  if (mode === "ten_strings") {
    return orderedPositions;
  }

  const grouped = new Map<number, ChordStringPosition[]>();

  for (const position of orderedPositions) {
    const group = grouped.get(position.courseNumber) ?? [];
    group.push(position);
    grouped.set(position.courseNumber, group);
  }

  return [...grouped.entries()]
    .sort(([leftCourse], [rightCourse]) => leftCourse - rightCourse)
    .map(([, positions]) => positions.find((position) => position.stringInCourse === 1) ?? positions[0]!)
    .filter((position): position is ChordStringPosition => Boolean(position));
}

function buildStringEntries(
  positions: readonly ChordStringPosition[],
  mode: DiagramMode,
  leftHanded: boolean,
): readonly ChordDiagramStringEntry[] {
  const ordered = leftHanded ? [...positions].reverse() : [...positions];

  return ordered.map((position, index) => ({
    key: `${mode}:${position.physicalStringNumber}`,
    label: positionLabel(position, mode),
    position,
    xIndex: index,
  }));
}

function toDisplayIndex(
  position: ChordStringPosition,
  mode: DiagramMode,
  stringEntries: readonly ChordDiagramStringEntry[],
): number {
  if (mode === "ten_strings") {
    const stringEntry = stringEntries.find((entry) => entry.position.physicalStringNumber === position.physicalStringNumber);
    return stringEntry?.xIndex ?? 0;
  }

  const stringEntry = stringEntries.find((entry) => entry.position.courseNumber === position.courseNumber);
  return stringEntry?.xIndex ?? 0;
}

function resolveFretWindow(shape: ChordShapeDetails): { readonly startFret: number; readonly fretCount: number; readonly usesNut: boolean } {
  const positiveFrets = [
    ...shape.positions.map((position) => position.fret).filter((fret) => fret > 0),
    ...shape.barres.map((barre) => barre.fret).filter((fret) => fret > 0),
  ];

  if (positiveFrets.length === 0) {
    return {
      startFret: 1,
      fretCount: 5,
      usesNut: true,
    };
  }

  const lowestFret = Math.min(...positiveFrets);
  const highestFret = Math.max(...positiveFrets);
  const shiftWindow = lowestFret > 4 || highestFret - lowestFret >= 4;
  const startFret = shiftWindow ? lowestFret : 1;
  const fretCount = Math.max(5, highestFret - startFret + 1);

  return {
    startFret,
    fretCount,
    usesNut: startFret === 1,
  };
}

function buildMarkerEntries(
  positions: readonly ChordStringPosition[],
  mode: DiagramMode,
  stringEntries: readonly ChordDiagramStringEntry[],
): readonly ChordDiagramMarkerEntry[] {
  return positions.map((position) => {
    const xIndex = toDisplayIndex(position, mode, stringEntries);
    const kind = position.fret < 0 ? "muted" : position.fret === 0 ? "open" : "fretted";

    return {
      key: `${mode}:marker:${position.physicalStringNumber}`,
      label: positionLabel(position, mode),
      position,
      xIndex,
      kind,
      fret: position.fret,
      finger: position.finger,
      noteLabel: formatNoteLabel(position),
    };
  });
}

function buildBarreEntries(
  shape: ChordShapeDetails,
  mode: DiagramMode,
  stringEntries: readonly ChordDiagramStringEntry[],
): readonly ChordDiagramBarreEntry[] {
  return shape.barres.map((barre) => {
    const fromPosition = mode === "ten_strings"
      ? shape.positions.find((position) => position.physicalStringNumber === barre.fromPhysicalString)
      : shape.positions.find((position) => position.courseNumber === Math.ceil(barre.fromPhysicalString / 2));
    const toPosition = mode === "ten_strings"
      ? shape.positions.find((position) => position.physicalStringNumber === barre.toPhysicalString)
      : shape.positions.find((position) => position.courseNumber === Math.ceil(barre.toPhysicalString / 2));

    const fromIndex = fromPosition ? toDisplayIndex(fromPosition, mode, stringEntries) : 0;
    const toIndex = toPosition ? toDisplayIndex(toPosition, mode, stringEntries) : fromIndex;

    return {
      key: `${mode}:barre:${barre.fret}:${barre.fromPhysicalString}:${barre.toPhysicalString}:${barre.finger}`,
      fret: barre.fret,
      fromIndex: Math.min(fromIndex, toIndex),
      toIndex: Math.max(fromIndex, toIndex),
      finger: barre.finger,
    };
  });
}

function buildAccessibilityLabel(
  shape: ChordShapeDetails,
  stringEntries: readonly ChordDiagramStringEntry[],
  mode: DiagramMode,
  startFret: number,
): string {
  const stringSummaries = stringEntries.map((entry) => {
    const position = entry.position;

    if (position.fret < 0) {
      return `${entry.label} abafada`;
    }

    if (position.fret === 0) {
      return `${entry.label} solta`;
    }

    const noteLabel = formatNoteLabel(position);
    const fingerLabel = position.finger ? ` dedo ${position.finger}` : "";
    return `${entry.label} casa ${position.fret}${fingerLabel}${noteLabel ? ` ${noteLabel}` : ""}`;
  });

  const barreSummaries = shape.barres.map((barre) => {
    const fromLabel = mode === "ten_strings" ? `corda ${barre.fromPhysicalString}` : `ordem ${formatCourseLabel(Math.ceil(barre.fromPhysicalString / 2))}`;
    const toLabel = mode === "ten_strings" ? `corda ${barre.toPhysicalString}` : `ordem ${formatCourseLabel(Math.ceil(barre.toPhysicalString / 2))}`;
    return `pestana na casa ${barre.fret} de ${fromLabel} até ${toLabel}`;
  });

  const fretSummary = startFret > 1 ? `Inicia na casa ${startFret}` : "Posição aberta";

  return [
    "Diagrama de acorde",
    fretSummary,
    ...stringSummaries,
    ...barreSummaries,
  ].join(". ");
}

export function resolveChordDiagramLayout(
  shape: ChordShapeDetails,
  options: ChordDiagramLayoutOptions = {},
): ChordDiagramLayout {
  const mode = options.mode ?? "five_courses";
  const leftHanded = options.leftHanded ?? false;
  const representativePositions = buildRepresentativePositions(shape, mode);
  const stringEntries = buildStringEntries(representativePositions, mode, leftHanded);
  const markerEntries = buildMarkerEntries(representativePositions, mode, stringEntries);
  const fretWindow = resolveFretWindow(shape);
  const barreEntries = buildBarreEntries(shape, mode, stringEntries);

  return {
    strings: stringEntries,
    markers: markerEntries,
    barres: barreEntries,
    startFret: fretWindow.startFret,
    fretCount: fretWindow.fretCount,
    usesNut: fretWindow.usesNut,
    accessibilityLabel: buildAccessibilityLabel(shape, stringEntries, mode, fretWindow.startFret),
  };
}

