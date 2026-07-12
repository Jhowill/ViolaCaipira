/* eslint-disable @typescript-eslint/no-explicit-any */
export type SeedEnvironment = "fixtures" | "production";

export type SeedRecord = any;

export interface SeedCollections {
  readonly sources?: readonly SeedRecord[];
  readonly licenses?: readonly SeedRecord[];
  readonly reviewers?: readonly SeedRecord[];
  readonly chordQualities?: readonly SeedRecord[];
  readonly chordQualityIntervals?: readonly SeedRecord[];
  readonly chords?: readonly SeedRecord[];
  readonly tunings?: readonly SeedRecord[];
  readonly tuningCourses?: readonly SeedRecord[];
  readonly tuningStrings?: readonly SeedRecord[];
  readonly chordShapes?: readonly SeedRecord[];
  readonly chordShapePositions?: readonly SeedRecord[];
  readonly chordShapeBarres?: readonly SeedRecord[];
  readonly rhythms?: readonly SeedRecord[];
  readonly rhythmPatterns?: readonly SeedRecord[];
  readonly rhythmSteps?: readonly SeedRecord[];
  readonly exercises?: readonly SeedRecord[];
  readonly exerciseEvents?: readonly SeedRecord[];
  readonly assets?: readonly SeedRecord[];
  readonly tags?: readonly SeedRecord[];
  readonly songs?: readonly SeedRecord[];
  readonly songRhythms?: readonly SeedRecord[];
  readonly songSources?: readonly SeedRecord[];
  readonly songChordIndex?: readonly SeedRecord[];
  readonly songArrangements?: readonly SeedRecord[];
  readonly songArrangementChords?: readonly SeedRecord[];
}

export interface SeedBundleV1 extends SeedCollections {
  readonly kind: SeedEnvironment;
}

export interface SeedManifest {
  readonly format: "cifras-de-viola-seed";
  readonly formatVersion: 1;
  readonly kind: SeedEnvironment;
  readonly createdAt: string;
  readonly checksumAlgorithm: "sha256";
  readonly payloadChecksum: string;
  readonly itemCount: number;
}

export interface SeedValidationIssue {
  readonly path: string;
  readonly message: string;
}

export interface SeedValidationResult {
  readonly manifest: SeedManifest;
  readonly issues: readonly SeedValidationIssue[];
}

export class SeedValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: readonly SeedValidationIssue[],
  ) {
    super(message);
    this.name = "SeedValidationError";
  }
}
