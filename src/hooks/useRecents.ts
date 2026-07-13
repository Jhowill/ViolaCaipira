import { useCallback, useEffect, useRef, useState } from "react";

import { getAppDatabaseClient } from "@/database/client";
import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import { createRecentRepository, type RecentFilters, type RecentRecord, type RecentRef, type RecentRepository } from "@/repositories/recentRepository";
import type { JsonObject } from "@/types/music";

export interface UseRecentsResult {
  readonly status: "loading" | "ready" | "error";
  readonly recents: readonly RecentRecord[];
  readonly filters: RecentFilters;
  readonly setFilters: (filters: RecentFilters) => void;
  readonly error: Error | null;
  readonly refresh: () => Promise<readonly RecentRecord[]>;
  readonly recordOpen: (ref: RecentRef, context?: JsonObject | null) => Promise<RecentRecord | null>;
  readonly cleanup: () => Promise<number>;
}

interface RecentsStateData {
  readonly recents: readonly RecentRecord[];
}

let defaultRecentRepositoryPromise: Promise<RecentRepository> | null = null;

async function getDefaultRecentRepository(): Promise<RecentRepository> {
  if (!defaultRecentRepositoryPromise) {
    defaultRecentRepositoryPromise = (async () => {
      const client = await getAppDatabaseClient();
      return createRecentRepository(client.database);
    })().catch((error: unknown) => {
      defaultRecentRepositoryPromise = null;
      throw error;
    });
  }

  return defaultRecentRepositoryPromise;
}

export async function resolveRecentRepository(repository?: RecentRepository): Promise<RecentRepository> {
  if (repository) {
    return repository;
  }

  return getDefaultRecentRepository();
}

export function useRecents(options: {
  readonly repository?: RecentRepository;
  readonly initialFilters?: RecentFilters;
} = {}): UseRecentsResult {
  const repositoryRef = useRef<RecentRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const [filters, setFilters] = useState<RecentFilters>(options.initialFilters ?? {});
  const [state, setState] = useState(createLoadingState<RecentsStateData>());
  const recentsRef = useRef<readonly RecentRecord[]>([]);

  const replaceRecents = useCallback((recents: readonly RecentRecord[]): void => {
    recentsRef.current = recents;
    setState(
      createReadyState<RecentsStateData>({
        recents,
      }),
    );
  }, []);

  const refresh = useCallback(async (): Promise<readonly RecentRecord[]> => {
    try {
      setState(createLoadingState<RecentsStateData>());
      const repository = await resolveRecentRepository(repositoryRef.current);
      const next = await repository.list(filters);
      replaceRecents(next);
      return next;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<RecentsStateData>(normalized));
      throw normalized;
    }
  }, [filters, replaceRecents]);

  const recordOpen = useCallback(async (ref: RecentRef, context?: JsonObject | null): Promise<RecentRecord | null> => {
    try {
      const repository = await resolveRecentRepository(repositoryRef.current);
      const next = await repository.recordOpen(ref, context ?? null);
      await refresh();
      return next;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<RecentsStateData>(normalized));
      throw normalized;
    }
  }, [refresh]);

  const cleanup = useCallback(async (): Promise<number> => {
    const repository = await resolveRecentRepository(repositoryRef.current);
    const removed = await repository.cleanup();
    await refresh();
    return removed;
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;

    void refresh().catch((error) => {
      if (cancelled) {
        return;
      }

      const normalized = normalizeError(error);
      setState(createErrorState<RecentsStateData>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    status: state.status,
    recents: recentsRef.current,
    filters,
    setFilters,
    error: state.error,
    refresh,
    recordOpen,
    cleanup,
  };
}
