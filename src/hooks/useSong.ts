import { useCallback, useEffect, useRef, useState } from "react";

import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import type { SongRepository } from "@/repositories/songRepository";
import type { EntityRef, SongViewModel } from "@/types/music";
import { resolveSongRepository } from "@/hooks/useSongs";

export interface UseSongResult {
  readonly status: "loading" | "ready" | "error";
  readonly song: SongViewModel | null;
  readonly error: Error | null;
  readonly refresh: () => Promise<SongViewModel | null>;
}

export function useSong(options: {
  readonly repository?: SongRepository;
  readonly ref: EntityRef<"song">;
}): UseSongResult {
  const repositoryRef = useRef<SongRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const [state, setState] = useState(createLoadingState<SongViewModel | null>());

  const refresh = useCallback(async (): Promise<SongViewModel | null> => {
    try {
      setState(createLoadingState<SongViewModel | null>());
      const repository = await resolveSongRepository(repositoryRef.current);
      const song = await repository.getByRef(options.ref);
      setState(createReadyState<SongViewModel | null>(song));
      return song;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<SongViewModel | null>(normalized));
      throw normalized;
    }
  }, [options.ref]);

  useEffect(() => {
    let cancelled = false;

    void refresh().catch((error) => {
      if (cancelled) {
        return;
      }

      const normalized = normalizeError(error);
      setState(createErrorState<SongViewModel | null>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    status: state.status,
    song: state.data,
    error: state.error,
    refresh,
  };
}
