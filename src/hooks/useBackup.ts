import { useCallback, useEffect, useRef, useState } from "react";

import { getAppDatabaseClient } from "@/database/client";
import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import { createBackupService } from "@/services/backupService";
import type { BackupArtifact, BackupImportOptions, BackupImportResult, BackupService } from "@/types/backup";

export interface UseBackupResult {
  readonly status: "loading" | "ready" | "error";
  readonly backup: BackupArtifact | null;
  readonly error: Error | null;
  readonly refresh: () => Promise<BackupArtifact>;
  readonly exportBackup: () => Promise<BackupArtifact>;
  readonly importBackup: (artifact: BackupArtifact, options?: BackupImportOptions) => Promise<BackupImportResult>;
}

interface BackupStateData {
  readonly backup: BackupArtifact | null;
}

let defaultBackupServicePromise: Promise<BackupService> | null = null;

async function getDefaultBackupService(): Promise<BackupService> {
  if (!defaultBackupServicePromise) {
    defaultBackupServicePromise = (async () => {
      const client = await getAppDatabaseClient();
      return createBackupService(client.database, {
        appVersion: "0.1.0",
      });
    })();
  }

  return defaultBackupServicePromise;
}

export async function resolveBackupService(service?: BackupService): Promise<BackupService> {
  if (service) {
    return service;
  }

  return getDefaultBackupService();
}

export function useBackup(options: {
  readonly service?: BackupService;
} = {}): UseBackupResult {
  const serviceRef = useRef<BackupService | undefined>(options.service);
  serviceRef.current = options.service;
  const [state, setState] = useState(createLoadingState<BackupStateData>());
  const backupRef = useRef<BackupArtifact | null>(null);

  const replaceBackup = useCallback((backup: BackupArtifact | null): void => {
    backupRef.current = backup;
    setState(
      createReadyState<BackupStateData>({
        backup,
      }),
    );
  }, []);

  const refresh = useCallback(async (): Promise<BackupArtifact> => {
    try {
      setState(createLoadingState<BackupStateData>());
      const service = await resolveBackupService(serviceRef.current);
      const next = await service.exportBackup();
      replaceBackup(next);
      return next;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<BackupStateData>(normalized));
      throw normalized;
    }
  }, [replaceBackup]);

  const exportBackup = useCallback(async (): Promise<BackupArtifact> => {
    return refresh();
  }, [refresh]);

  const importBackup = useCallback(async (
    artifact: BackupArtifact,
    options?: BackupImportOptions,
  ): Promise<BackupImportResult> => {
    try {
      const service = await resolveBackupService(serviceRef.current);
      const result = await service.importBackup(artifact, options);
      await refresh();
      return result;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<BackupStateData>(normalized));
      throw normalized;
    }
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;

    void refresh().catch((error) => {
      if (cancelled) {
        return;
      }

      const normalized = normalizeError(error);
      setState(createErrorState<BackupStateData>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    status: state.status,
    backup: backupRef.current,
    error: state.error,
    refresh,
    exportBackup,
    importBackup,
  };
}
