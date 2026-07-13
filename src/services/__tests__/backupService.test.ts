import { describe, expect, it } from "vitest";

import { BACKUP_SECTION_ORDER } from "@/domain/backup";
import { createBackupService } from "@/services/backupService";
import { BackupManifestSchema, BackupPayloadSchema } from "@/validation";

import { buildBackupFixtureTables, createBackupDatabase } from "./backupFixtures";

const OPTIONS = {
  appVersion: "0.1.0",
  devicePlatform: "unknown" as const,
  schemaVersion: 1,
  catalogVersion: 7,
};

function createService(database = createBackupDatabase()) {
  return createBackupService(database, OPTIONS);
}

describe("backup service", () => {
  it("exports a valid backup without catalog tables or extra sections", async () => {
    const service = createService(createBackupDatabase(buildBackupFixtureTables()));

    const artifact = await service.exportBackup();

    expect(BackupManifestSchema.safeParse(artifact.manifest).success).toBe(true);
    expect(BackupPayloadSchema.safeParse(artifact.payload).success).toBe(true);
    expect(artifact.manifest.payloadChecksum).toHaveLength(64);
    expect(artifact.manifest.sections.map((section) => section.name)).toEqual(BACKUP_SECTION_ORDER);
    expect(artifact.manifest.sections.every((section) => section.included)).toBe(true);
    expect(Object.keys(artifact.payload).sort()).toEqual([
      "chordShapes",
      "favorites",
      "practiceSessions",
      "preferences",
      "profile",
      "recentItems",
      "songNotes",
      "songPreferences",
      "songVersions",
      "songs",
      "tuningCourses",
      "tuningSessions",
      "tuningStrings",
      "tunings",
    ]);
  });

  it("round-trips the selected user data through import", async () => {
    const sourceDatabase = createBackupDatabase(buildBackupFixtureTables());
    const sourceService = createService(sourceDatabase);
    const artifact = await sourceService.exportBackup();

    const targetDatabase = createBackupDatabase();
    const targetService = createService(targetDatabase);

    const result = await targetService.importBackup(artifact);
    const roundTripped = await targetService.exportBackup();

    expect(result.restoredRows).toBeGreaterThan(0);
    expect(roundTripped.payload).toEqual(artifact.payload);
    expect(roundTripped.manifest.sections).toEqual(artifact.manifest.sections);
  });

  it("rejects a corrupted backup before writing anything", async () => {
    const sourceService = createService(createBackupDatabase(buildBackupFixtureTables()));
    const artifact = await sourceService.exportBackup();
    const targetDatabase = createBackupDatabase();
    const targetService = createService(targetDatabase);
    const snapshot = structuredClone(targetDatabase.state);

    await expect(
      targetService.importBackup({
        ...artifact,
        payloadJson: `${artifact.payloadJson} `,
      }),
    ).rejects.toThrow(/checksum/i);

    expect(targetDatabase.state).toEqual(snapshot);
  });

  it("rolls back partial writes when the import fails midway", async () => {
    const sourceService = createService(createBackupDatabase(buildBackupFixtureTables()));
    const artifact = await sourceService.exportBackup();
    const targetDatabase = createBackupDatabase(
      {
        user_profile: [
          {
            id: "local_user",
            experience_level: "beginner",
            onboarding_status: "in_progress",
            onboarding_step: "welcome",
            created_at: "2026-07-11T10:00:00.000Z",
            updated_at: "2026-07-11T10:00:00.000Z",
          },
        ],
      },
      { failOnInsertTable: "user_song_versions" },
    );
    const targetService = createService(targetDatabase);
    const snapshot = structuredClone(targetDatabase.state);

    await expect(targetService.importBackup(artifact)).rejects.toThrow(/simulated failure/i);

    expect(targetDatabase.state).toEqual(snapshot);
  });
});
