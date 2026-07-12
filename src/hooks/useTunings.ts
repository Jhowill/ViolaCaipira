import { useCallback, useEffect, useRef, useState } from "react";

import { resolveTuningRepository } from "@/hooks/usePreferences";
import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import type { TuningRepository, TuningSummary } from "@/repositories/contracts";
import type { EntityRef } from "@/types/music";

export interface UseTuningsResult {
  readonly status: "loading" | "ready" | "error";
  readonly tunings: readonly TuningSummary[];
  readonly error: Error | null;
  readonly query: string;
  readonly setQuery: (query: string) => void;
  readonly refresh: () => Promise<readonly TuningSummary[]>;
  readonly activate: (ref: EntityRef<"tuning">) => Promise<void>;
}

export function useTunings(options: {
  readonly repository?: TuningRepository;
  readonly origin?: "catalog" | "user" | "all";
  readonly initialQuery?: string;
} = {}): UseTuningsResult {
  const repositoryRef = useRef<TuningRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const origin = options.origin ?? "all";
  const [query, setQuery] = useState(options.initialQuery ?? "");
  const [state, setState] = useState(createLoadingState<readonly TuningSummary[]>());

  const refresh = useCallback(async (): Promise<readonly TuningSummary[]> => {
    try {
      setState(createLoadingState<readonly TuningSummary[]>());
      const repository = await resolveTuningRepository(repositoryRef.current);
      const next =
        query.trim().length > 0 ? await repository.search(query) : await repository.list({ origin });
      const filtered =
        origin === "all"
          ? next
          : next.filter((entry) => entry.ref.origin === origin);

      setState(createReadyState(filtered));
      return filtered;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<readonly TuningSummary[]>(normalized));
      throw normalized;
    }
  }, [origin, query]);

  const activate = useCallback(async (ref: EntityRef<"tuning">): Promise<void> => {
    try {
      const repository = await resolveTuningRepository(repositoryRef.current);
      await repository.activate(ref);
      await refresh();
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<readonly TuningSummary[]>(normalized));
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
      setState(createErrorState<readonly TuningSummary[]>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    status: state.status,
    tunings: state.data ?? [],
    error: state.error,
    query,
    setQuery,
    refresh,
    activate,
  };
}
