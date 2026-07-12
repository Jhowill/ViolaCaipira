import { describe, expect, it } from "vitest";

import {
  BackupManifestSchema,
  BackupPayloadSchema,
  ChordShapeSchema,
  ImportedSongSchema,
  SongDocumentSchema,
  TuningSchema,
  UserPreferencesSchema,
} from "@/validation/music";

import {
  buildValidBackupManifest,
  buildValidBackupPayload,
  buildValidChordShape,
  buildValidImportedSong,
  buildValidPreferences,
  buildValidSongDocument,
  buildValidTuning,
} from "@/domain/music/__tests__/fixtures";

type Loose<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? Loose<U>[]
        : T extends object
          ? { -readonly [K in keyof T]: Loose<T[K]> }
          : T;

describe("music schemas", () => {
  it("accepts the main domain objects used by the app", () => {
    expect(TuningSchema.safeParse(buildValidTuning()).success).toBe(true);
    expect(ChordShapeSchema.safeParse(buildValidChordShape()).success).toBe(true);
    expect(SongDocumentSchema.safeParse(buildValidSongDocument()).success).toBe(true);
    expect(UserPreferencesSchema.safeParse(buildValidPreferences()).success).toBe(true);
    expect(BackupManifestSchema.safeParse(buildValidBackupManifest()).success).toBe(true);
    expect(BackupPayloadSchema.safeParse(buildValidBackupPayload()).success).toBe(true);
    expect(ImportedSongSchema.safeParse(buildValidImportedSong()).success).toBe(true);
  });

  it("rejects invalid pitch classes and duplicate song IDs", () => {
    const invalidTuning = structuredClone(buildValidTuning()) as unknown as Loose<
      ReturnType<typeof buildValidTuning>
    >;
    const firstTuningCourse = invalidTuning.courses[0]!;
    const firstTuningString = firstTuningCourse.strings[0]!;
    firstTuningString.pitchClass = 12;
    firstTuningString.midiNote = 999;
    firstTuningString.referenceFrequency440 = 1;

    const invalidTuningResult = TuningSchema.safeParse(invalidTuning);
    expect(invalidTuningResult.success).toBe(false);

    const invalidSongDocument = structuredClone(buildValidSongDocument()) as unknown as Loose<
      ReturnType<typeof buildValidSongDocument>
    >;
    invalidSongDocument.sections.push({
      id: "section-intro",
      type: "verse",
      lines: [],
    });

    const invalidSongResult = SongDocumentSchema.safeParse(invalidSongDocument);
    expect(invalidSongResult.success).toBe(false);
  });

  it("rejects shapes with invalid frets", () => {
    const invalidShape = structuredClone(buildValidChordShape()) as unknown as Loose<
      ReturnType<typeof buildValidChordShape>
    >;
    const firstBarre = invalidShape.barres[0]!;
    firstBarre.fret = 0;

    const result = ChordShapeSchema.safeParse(invalidShape);
    expect(result.success).toBe(false);
  });
});
