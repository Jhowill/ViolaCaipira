import { BackupManifestSchema, BackupPayloadSchema } from "@/validation";
import { buildSections, createBackupRepository } from "@/repositories/backupRepository";
import type { BackupArtifact, BackupImportOptions, BackupImportResult, BackupService, BackupServiceOptions } from "@/types/backup";
import type { BackupManifest, BackupPayloadV1 } from "@/types/music";
import type { SQLiteDatabaseLike } from "@/types/database";

import { DEFAULT_BACKUP_MAX_BYTES, sha256Hex, toByteLength } from "@/domain/backup";

function buildManifest(
  payload: BackupPayloadV1,
  options: BackupServiceOptions,
  payloadChecksum: string,
): BackupManifest {
  return {
    format: "cifras-de-viola-backup",
    formatVersion: 1,
    appVersion: options.appVersion,
    schemaVersion: options.schemaVersion ?? 1,
    catalogVersion: options.catalogVersion ?? 0,
    createdAt: new Date().toISOString(),
    devicePlatform: options.devicePlatform ?? "unknown",
    sections: buildSections(payload),
    checksumAlgorithm: "sha256",
    payloadChecksum,
  };
}

function validateArtifactShape(artifact: BackupArtifact): void {
  const manifestResult = BackupManifestSchema.safeParse(artifact.manifest);
  if (!manifestResult.success) {
    throw new Error("Invalid backup manifest.");
  }

  const payloadResult = BackupPayloadSchema.safeParse(artifact.payload);
  if (!payloadResult.success) {
    throw new Error("Invalid backup payload.");
  }
}

export function createBackupService(
  database: SQLiteDatabaseLike,
  options: BackupServiceOptions,
): BackupService {
  const repository = createBackupRepository(database);
  const maxBytes = options.maxBytes ?? DEFAULT_BACKUP_MAX_BYTES;

  async function exportBackup(): Promise<BackupArtifact> {
    const payload = await repository.exportPayload();
    const payloadJson = JSON.stringify(payload);
    const payloadChecksum = await sha256Hex(payloadJson);
    const manifest = buildManifest(payload, options, payloadChecksum);
    const manifestJson = JSON.stringify(manifest);
    const byteLength = toByteLength(manifestJson) + toByteLength(payloadJson);

    return {
      manifest,
      payload,
      manifestJson,
      payloadJson,
      byteLength,
    };
  }

  async function importBackup(
    artifact: BackupArtifact,
    optionsOverride: BackupImportOptions = {},
  ): Promise<BackupImportResult> {
    validateArtifactShape(artifact);

    const maxAllowedBytes = optionsOverride.maxBytes ?? maxBytes;
    if (artifact.byteLength > maxAllowedBytes) {
      throw new Error("Backup file is too large.");
    }

    const checksum = await sha256Hex(artifact.payloadJson);
    if (checksum !== artifact.manifest.payloadChecksum) {
      throw new Error("Backup checksum mismatch.");
    }

    const restoredRows = await repository.importPayload(artifact.payload, {
      mode: optionsOverride.mode ?? "replace",
      maxBytes: maxAllowedBytes,
    });

    return {
      mode: optionsOverride.mode ?? "replace",
      checksum,
      byteLength: artifact.byteLength,
      sections: artifact.manifest.sections,
      restoredRows,
    };
  }

  return {
    exportBackup,
    importBackup,
  };
}
