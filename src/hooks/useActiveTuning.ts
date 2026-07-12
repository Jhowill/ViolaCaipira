import { useCallback, useEffect, useRef, useState } from "react";

import { resolveTuningRepository } from "@/hooks/usePreferences";
import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import type { TuningRepository } from "@/repositories/contracts";
import type { EntityRef, TuningDetails } from "@/types/music";

export interface UseActiveTuningResult {
  readonly status: "loading" | "ready" | "error";
  readonly tuning: TuningDetails | null;
  readonly error: Error | null;
  readonly refresh: () => Promise<TuningDetails>;
  readonly activate: (ref: EntityRef<"tuning">) => Promise<TuningDetails>;
}

export function useActiveTuning(options: {
  readonly repository?: TuningRepository;
} = {}): UseActiveTuningResult {
  const repositoryRef = useRef<TuningRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const [state, setState] = useState(createLoadingState<TuningDetails>());

  const refresh = useCallback(async (): Promise<TuningDetails> => {
    try {
      setState(createLoadingState<TuningDetails>());
      const repository = await resolveTuningRepository(repositoryRef.current);
      const tuning = await repository.getActive();
      setState(createReadyState(tuning));
      return tuning;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<TuningDetails>(normalized));
      throw normalized;
    }
  }, []);

  const activate = useCallback(async (ref: EntityRef<"tuning">): Promise<TuningDetails> => {
    try {
      const repository = await resolveTuningRepository(repositoryRef.current);
      const tuning = await repository.activate(ref);
      setState(createReadyState(tuning));
      return tuning;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<TuningDetails>(normalized));
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
      setState(createErrorState<TuningDetails>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    status: state.status,
    tuning: state.data,
    error: state.error,
    refresh,
    activate,
  };
}
