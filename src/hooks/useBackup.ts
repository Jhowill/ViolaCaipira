import { getAppDatabaseClient } from "@/database/client";
import { createBackupService } from "@/services/backupService";
import type { BackupArtifact, BackupImportMode, BackupImportResult } from "@/types/backup";
import { Platform, Share } from "react-native";
import { useCallback, useRef, useState } from "react";

interface BackupState {
  readonly artifact: BackupArtifact | null;
  readonly result: BackupImportResult | null;
  readonly busy: boolean;
  readonly error: Error | null;
}

let servicePromise: Promise<ReturnType<typeof createBackupService>> | null = null;

async function getService() {
  if (!servicePromise) {
    servicePromise = getAppDatabaseClient().then((client) => createBackupService(client.database, {
      appVersion: "0.1.0",
      devicePlatform: Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "unknown",
    }));
  }
  return servicePromise;
}

export function useBackup() {
  const stateRef = useRef<BackupState>({ artifact: null, result: null, busy: false, error: null });
  const [state, setState] = useState(stateRef.current);
  const commit = useCallback((next: BackupState) => { stateRef.current = next; setState(next); }, []);

  const exportBackup = useCallback(async () => {
    commit({ ...stateRef.current, busy: true, error: null });
    try {
      const artifact = await (await getService()).exportBackup();
      commit({ artifact, result: null, busy: false, error: null });
      try {
        await Share.share({ title: "Backup Cifras de Viola", message: JSON.stringify({ manifest: artifact.manifest, payload: artifact.payload }) });
      } catch {
        // A prévia continua disponível mesmo quando o sistema não possui compartilhamento.
      }
      return artifact;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error("Não foi possível exportar o backup.");
      commit({ ...stateRef.current, busy: false, error: normalized });
      throw normalized;
    }
  }, [commit]);

  const importBackup = useCallback(async (serialized: string, mode: BackupImportMode = "replace") => {
    commit({ ...stateRef.current, busy: true, error: null });
    try {
      const parsed = JSON.parse(serialized) as { manifest: BackupArtifact["manifest"]; payload: BackupArtifact["payload"] };
      const artifact: BackupArtifact = {
        manifest: parsed.manifest,
        payload: parsed.payload,
        manifestJson: JSON.stringify(parsed.manifest),
        payloadJson: JSON.stringify(parsed.payload),
        byteLength: new TextEncoder().encode(JSON.stringify(parsed.manifest)).byteLength + new TextEncoder().encode(JSON.stringify(parsed.payload)).byteLength,
      };
      const result = await (await getService()).importBackup(artifact, { mode });
      commit({ artifact, result, busy: false, error: null });
      return result;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error("Não foi possível importar o backup.");
      commit({ ...stateRef.current, busy: false, error: normalized });
      throw normalized;
    }
  }, [commit]);

  return { ...state, exportBackup, importBackup, clearError: () => commit({ ...stateRef.current, error: null }) };
}
