import { useCallback, useEffect, useRef, useState } from "react";

import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import type { RhythmRepository, RhythmDetail } from "@/repositories/rhythmRepository";
import type { EntityRef } from "@/types/music";
import { resolveRhythmRepository } from "@/hooks/useSongs";

export interface UseRhythmResult {
  readonly status: "loading" | "ready" | "error";
  readonly rhythm: RhythmDetail | null;
  readonly error: Error | null;
  readonly refresh: () => Promise<RhythmDetail | null>;
}

export function useRhythm(options: {
  readonly repository?: RhythmRepository;
  readonly ref: EntityRef<"rhythm">;
}): UseRhythmResult {
  const repositoryRef = useRef<RhythmRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const [state, setState] = useState(createLoadingState<RhythmDetail | null>());

  const refresh = useCallback(async (): Promise<RhythmDetail | null> => {
    try {
      setState(createLoadingState<RhythmDetail | null>());
      const repository = await resolveRhythmRepository(repositoryRef.current);
      const rhythm = await repository.getByRef(options.ref);
      setState(createReadyState<RhythmDetail | null>(rhythm));
      return rhythm;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<RhythmDetail | null>(normalized));
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
      setState(createErrorState<RhythmDetail | null>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    status: state.status,
    rhythm: state.data,
    error: state.error,
    refresh,
  };
}
