/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { SeedBundleV1, SeedCollections, SeedRecord } from "@/types/seed";

export const SEED_COLLECTION_ORDER = [
  "sources",
  "licenses",
  "reviewers",
  "chordQualities",
  "chordQualityIntervals",
  "chords",
  "tunings",
  "tuningCourses",
  "tuningStrings",
  "chordShapes",
  "chordShapePositions",
  "chordShapeBarres",
  "rhythms",
  "rhythmPatterns",
  "rhythmSteps",
  "exercises",
  "exerciseEvents",
  "assets",
  "tags",
  "songs",
  "songRhythms",
  "songSources",
  "songChordIndex",
  "songArrangements",
  "songArrangementChords",
] as const satisfies readonly (keyof SeedCollections)[];

export function getSeedCollections(bundle: SeedBundleV1): readonly (readonly SeedRecord[])[] {
  return SEED_COLLECTION_ORDER.map((collectionName) => bundle[collectionName] ?? []);
}

export function countSeedItems(bundle: SeedBundleV1): number {
  return getSeedCollections(bundle).reduce((total, collection) => total + collection.length, 0);
}

export function listSeedItems(bundle: SeedBundleV1): readonly SeedRecord[] {
  return getSeedCollections(bundle).flat();
}
