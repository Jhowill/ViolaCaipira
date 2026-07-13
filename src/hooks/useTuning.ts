import { resolveTuningRepository } from "@/hooks/usePreferences";
import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import type { TuningRepository } from "@/repositories/contracts";
import type { ContentOrigin, EntityRef, TuningDetails } from "@/types/music";
import { useCallback, useEffect, useRef, useState } from "react";

async function resolveByOrigin(
  repository: TuningRepository,
  tuningId: string,
  origin: ContentOrigin | "all",
): Promise<TuningDetails | null> {
  if (origin !== "all") {
    return repository.getByRef({ type: "tuning", origin, id: tuningId });
  }

  const catalog = await repository.getByRef({ type: "tuning", origin: "catalog", id: tuningId });
  return catalog ?? repository.getByRef({ type: "tuning", origin: "user", id: tuningId });
}

export function useTuning(options: {
  readonly tuningId: string;
  readonly origin?: ContentOrigin | "all";
  readonly repository?: TuningRepository;
}) {
  const repositoryRef = useRef<TuningRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const origin = options.origin ?? "all";
  const [state, setState] = useState(createLoadingState<TuningDetails | null>());

  const refresh = useCallback(async () => {
    try {
      setState(createLoadingState<TuningDetails | null>());
      const repository = await resolveTuningRepository(repositoryRef.current);
      const tuning = await resolveByOrigin(repository, options.tuningId, origin);
      setState(createReadyState<TuningDetails | null>(tuning));
      return tuning;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<TuningDetails | null>(normalized));
      throw normalized;
    }
  }, [options.tuningId, origin]);

  const activate = useCallback(async () => {
    try {
      const repository = await resolveTuningRepository(repositoryRef.current);
      const ref: EntityRef<"tuning"> = {
        type: "tuning",
        origin: state.data?.origin ?? (origin === "all" ? "catalog" : origin),
        id: options.tuningId,
      };
      const tuning = await repository.activate(ref);
      setState(createReadyState<TuningDetails | null>(tuning));
      return tuning;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<TuningDetails | null>(normalized));
      throw normalized;
    }
  }, [options.tuningId, origin, state.data?.origin]);

  useEffect(() => {
    let cancelled = false;
    void refresh().catch((error) => {
      if (!cancelled) {
        setState(createErrorState<TuningDetails | null>(normalizeError(error)));
      }
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
  } as const;
}
