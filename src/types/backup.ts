import type { BackupManifest, BackupPayloadV1, BackupSectionManifest } from "@/types/music";

export type BackupImportMode = "merge" | "replace";

export interface BackupArtifact {
  readonly manifest: BackupManifest;
  readonly payload: BackupPayloadV1;
  readonly manifestJson: string;
  readonly payloadJson: string;
  readonly byteLength: number;
}

export interface BackupImportOptions {
  readonly mode?: BackupImportMode;
  readonly maxBytes?: number;
}

export interface BackupImportResult {
  readonly mode: BackupImportMode;
  readonly checksum: string;
  readonly byteLength: number;
  readonly sections: readonly BackupSectionManifest[];
  readonly restoredRows: number;
}

export interface BackupServiceOptions {
  readonly appVersion: string;
  readonly schemaVersion?: number;
  readonly catalogVersion?: number;
  readonly devicePlatform?: BackupManifest["devicePlatform"];
  readonly maxBytes?: number;
}

export interface BackupRepository {
  exportPayload(): Promise<BackupPayloadV1>;
  importPayload(payload: BackupPayloadV1, options?: BackupImportOptions): Promise<number>;
}

export interface BackupService {
  exportBackup(): Promise<BackupArtifact>;
  importBackup(artifact: BackupArtifact, options?: BackupImportOptions): Promise<BackupImportResult>;
}
