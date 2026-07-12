import { useCallback, useEffect, useRef, useState } from "react";

import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import type { RhythmFilters, RhythmRepository, RhythmSummary } from "@/repositories/rhythmRepository";
import { resolveRhythmRepository } from "@/hooks/useSongs";

export interface UseRhythmsResult {
  readonly status: "loading" | "ready" | "error";
  readonly rhythms: readonly RhythmSummary[];
  readonly query: string;
  readonly setQuery: (query: string) => void;
  readonly filters: RhythmFilters;
  readonly setFilters: (filters: RhythmFilters) => void;
  readonly error: Error | null;
  readonly refresh: () => Promise<readonly RhythmSummary[]>;
}

interface RhythmsStateData {
  readonly rhythms: readonly RhythmSummary[];
}

export function useRhythms(options: {
  readonly repository?: RhythmRepository;
  readonly initialQuery?: string;
  readonly initialFilters?: RhythmFilters;
} = {}): UseRhythmsResult {
  const repositoryRef = useRef<RhythmRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const [query, setQuery] = useState(options.initialQuery ?? "");
  const [filters, setFilters] = useState<RhythmFilters>(options.initialFilters ?? {});
  const [state, setState] = useState(createLoadingState<RhythmsStateData>());

  const refresh = useCallback(async (): Promise<readonly RhythmSummary[]> => {
    try {
      setState(createLoadingState<RhythmsStateData>());
      const repository = await resolveRhythmRepository(repositoryRef.current);
      const next = query.trim().length > 0 ? await repository.search(query, filters) : await repository.list(filters);
      setState(
        createReadyState<RhythmsStateData>({
          rhythms: next,
        }),
      );
      return next;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<RhythmsStateData>(normalized));
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
      setState(createErrorState<RhythmsStateData>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    status: state.status,
    rhythms: state.data?.rhythms ?? [],
    query,
    setQuery,
    filters,
    setFilters,
    error: state.error,
    refresh,
  };
}

