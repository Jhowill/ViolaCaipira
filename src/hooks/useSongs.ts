import { useCallback, useEffect, useRef, useState } from "react";

import { getAppDatabaseClient } from "@/database/client";
import { createPreferencesRepository } from "@/repositories/preferencesRepository";
import { createTuningRepository } from "@/repositories/tuningRepository";
import { createSongRepository, type SongFilters, type SongRepository, type SongSummary } from "@/repositories/songRepository";
import { createRhythmRepository, type RhythmRepository } from "@/repositories/rhythmRepository";
import { createSearchRepository, type SearchRepository } from "@/repositories/searchRepository";
import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";

export interface UseSongsResult {
  readonly status: "loading" | "ready" | "error";
  readonly songs: readonly SongSummary[];
  readonly query: string;
  readonly setQuery: (query: string) => void;
  readonly filters: SongFilters;
  readonly setFilters: (filters: SongFilters) => void;
  readonly error: Error | null;
  readonly refresh: () => Promise<readonly SongSummary[]>;
}

interface SongsStateData {
  readonly songs: readonly SongSummary[];
}

interface RepositoryBundle {
  readonly songs: SongRepository;
  readonly rhythms: RhythmRepository;
  readonly search: SearchRepository;
}

let defaultRepositoryBundlePromise: Promise<RepositoryBundle> | null = null;

async function getDefaultRepositoryBundle(): Promise<RepositoryBundle> {
  if (!defaultRepositoryBundlePromise) {
    defaultRepositoryBundlePromise = (async () => {
      const client = await getAppDatabaseClient();
      const preferences = createPreferencesRepository(client.database);
      const tunings = createTuningRepository(client.database, { preferencesRepository: preferences });
      const songs = createSongRepository(client.database, { tuningRepository: tunings });
      const rhythms = createRhythmRepository(client.database);
      const search = createSearchRepository({ songs, rhythms });

      return {
        songs,
        rhythms,
        search,
      };
    })().catch((error: unknown) => {
      defaultRepositoryBundlePromise = null;
      throw error;
    });
  }

  return defaultRepositoryBundlePromise;
}

export async function resolveSongRepository(repository?: SongRepository): Promise<SongRepository> {
  if (repository) {
    return repository;
  }

  return (await getDefaultRepositoryBundle()).songs;
}

export async function resolveRhythmRepository(repository?: RhythmRepository): Promise<RhythmRepository> {
  if (repository) {
    return repository;
  }

  return (await getDefaultRepositoryBundle()).rhythms;
}

export async function resolveSearchRepository(repository?: SearchRepository): Promise<SearchRepository> {
  if (repository) {
    return repository;
  }

  return (await getDefaultRepositoryBundle()).search;
}

export function useSongs(options: {
  readonly repository?: SongRepository;
  readonly initialQuery?: string;
  readonly initialFilters?: SongFilters;
} = {}): UseSongsResult {
  const repositoryRef = useRef<SongRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const [query, setQuery] = useState(options.initialQuery ?? "");
  const [filters, setFilters] = useState<SongFilters>(options.initialFilters ?? {});
  const [state, setState] = useState(createLoadingState<SongsStateData>());

  const refresh = useCallback(async (): Promise<readonly SongSummary[]> => {
    try {
      setState(createLoadingState<SongsStateData>());
      const repository = await resolveSongRepository(repositoryRef.current);
      const next = query.trim().length > 0 ? await repository.search(query, filters) : await repository.list(filters);
      setState(
        createReadyState<SongsStateData>({
          songs: next,
        }),
      );
      return next;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<SongsStateData>(normalized));
      throw normalized;
    }
  }, [filters, query]);

  useEffect(() => {
    let cancelled = false;

    void refresh().catch((error) => {
      if (cancelled) {
        return;
      }

      const normalized = normalizeError(error);
      setState(createErrorState<SongsStateData>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    status: state.status,
    songs: state.data?.songs ?? [],
    query,
    setQuery,
    filters,
    setFilters,
    error: state.error,
    refresh,
  };
}
