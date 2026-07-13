import { useCallback, useEffect, useRef, useState } from "react";

import { getAppDatabaseClient } from "@/database/client";
import { createPreferencesRepository } from "@/repositories/preferencesRepository";
import { createTuningRepository } from "@/repositories/tuningRepository";
import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import type {
  PreferencesRepository,
  PreferencesSection,
  TuningRepository,
} from "@/repositories/contracts";
import type { EntityRef, UserPreferences } from "@/types/music";

export interface UsePreferencesResult {
  readonly status: "loading" | "ready" | "error";
  readonly preferences: UserPreferences | null;
  readonly error: Error | null;
  readonly refresh: () => Promise<UserPreferences>;
  readonly save: (preferences: UserPreferences) => Promise<UserPreferences>;
  readonly restore: (section?: PreferencesSection) => Promise<UserPreferences>;
  readonly setActiveTuning: (ref: EntityRef<"tuning">) => Promise<UserPreferences>;
}

let defaultRepositoryBundlePromise:
  | Promise<{ readonly preferences: PreferencesRepository; readonly tunings: TuningRepository }>
  | null = null;

async function getDefaultRepositoryBundle(): Promise<{
  readonly preferences: PreferencesRepository;
  readonly tunings: TuningRepository;
}> {
  if (!defaultRepositoryBundlePromise) {
    defaultRepositoryBundlePromise = (async () => {
      const client = await getAppDatabaseClient();
      const preferences = createPreferencesRepository(client.database);
      const tunings = createTuningRepository(client.database, { preferencesRepository: preferences });
      return {
        preferences,
        tunings,
      };
    })().catch((error: unknown) => {
      defaultRepositoryBundlePromise = null;
      throw error;
    });
  }

  return defaultRepositoryBundlePromise;
}

export async function resolvePreferencesRepository(
  repository?: PreferencesRepository,
): Promise<PreferencesRepository> {
  if (repository) {
    return repository;
  }

  return (await getDefaultRepositoryBundle()).preferences;
}

export async function resolveTuningRepository(repository?: TuningRepository): Promise<TuningRepository> {
  if (repository) {
    return repository;
  }

  return (await getDefaultRepositoryBundle()).tunings;
}

export function usePreferences(options: {
  readonly repository?: PreferencesRepository;
} = {}): UsePreferencesResult {
  const repositoryRef = useRef<PreferencesRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;

  const [state, setState] = useState(createLoadingState<UserPreferences>());

  const refresh = useCallback(async (): Promise<UserPreferences> => {
    try {
      setState(createLoadingState<UserPreferences>());
      const repository = await resolvePreferencesRepository(repositoryRef.current);
      const preferences = await repository.get();
      setState(createReadyState(preferences));
      return preferences;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<UserPreferences>(normalized));
      throw normalized;
    }
  }, []);

  const save = useCallback(async (preferences: UserPreferences): Promise<UserPreferences> => {
    try {
      const repository = await resolvePreferencesRepository(repositoryRef.current);
      const saved = await repository.save(preferences);
      setState(createReadyState(saved));
      return saved;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<UserPreferences>(normalized));
      throw normalized;
    }
  }, []);

  const restore = useCallback(async (section?: PreferencesSection): Promise<UserPreferences> => {
    try {
      const repository = await resolvePreferencesRepository(repositoryRef.current);
      const restored = await repository.restore(section);
      setState(createReadyState(restored));
      return restored;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<UserPreferences>(normalized));
      throw normalized;
    }
  }, []);

  const setActiveTuning = useCallback(async (ref: EntityRef<"tuning">): Promise<UserPreferences> => {
    try {
      const repository = await resolvePreferencesRepository(repositoryRef.current);
      const saved = await repository.setActiveTuning(ref);
      setState(createReadyState(saved));
      return saved;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<UserPreferences>(normalized));
      throw normalized;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void refresh().catch((error) => {
      if (cancelled) {
        return;
      }

      const normalized = normalizeError(error);
      setState(createErrorState<UserPreferences>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    status: state.status,
    preferences: state.data,
    error: state.error,
    refresh,
    save,
    restore,
    setActiveTuning,
  };
}
