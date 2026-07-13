import { useCallback, useEffect, useRef, useState } from "react";

import { getAppDatabaseClient } from "@/database/client";
import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import { createResumeRepository, type ResumeRepository, type ResumeStateRecord, type ResumeTarget } from "@/repositories/resumeRepository";
import type { JsonObject } from "@/types/music";

export interface UseResumeStateResult {
  readonly status: "loading" | "ready" | "error";
  readonly resumeState: ResumeStateRecord | null;
  readonly canResume: boolean;
  readonly error: Error | null;
  readonly refresh: () => Promise<ResumeStateRecord | null>;
  readonly save: (state: JsonObject, options?: { readonly isSafeToResume?: boolean; readonly expiresAt?: string | null }) => Promise<ResumeStateRecord | null>;
  readonly clear: () => Promise<void>;
}

interface ResumeStateData {
  readonly resumeState: ResumeStateRecord | null;
}

let defaultResumeRepositoryPromise: Promise<ResumeRepository> | null = null;

async function getDefaultResumeRepository(): Promise<ResumeRepository> {
  if (!defaultResumeRepositoryPromise) {
    defaultResumeRepositoryPromise = (async () => {
      const client = await getAppDatabaseClient();
      return createResumeRepository(client.database);
    })().catch((error: unknown) => {
      defaultResumeRepositoryPromise = null;
      throw error;
    });
  }

  return defaultResumeRepositoryPromise;
}

export async function resolveResumeRepository(repository?: ResumeRepository): Promise<ResumeRepository> {
  if (repository) {
    return repository;
  }

  return getDefaultResumeRepository();
}

export function useResumeState(options: {
  readonly repository?: ResumeRepository;
  readonly target: ResumeTarget;
}): UseResumeStateResult {
  const repositoryRef = useRef<ResumeRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const targetRef = useRef<ResumeTarget>(options.target);
  targetRef.current = options.target;
  const [state, setState] = useState(createLoadingState<ResumeStateData>());
  const resumeRef = useRef<ResumeStateRecord | null>(null);

  const replaceResumeState = useCallback((resumeState: ResumeStateRecord | null): void => {
    resumeRef.current = resumeState;
    setState(
      createReadyState<ResumeStateData>({
        resumeState,
      }),
    );
  }, []);

  const refresh = useCallback(async (): Promise<ResumeStateRecord | null> => {
    try {
      setState(createLoadingState<ResumeStateData>());
      const repository = await resolveResumeRepository(repositoryRef.current);
      const next = await repository.getByTarget(targetRef.current);
      replaceResumeState(next);
      return next;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<ResumeStateData>(normalized));
      throw normalized;
    }
  }, [replaceResumeState]);

  const save = useCallback(async (
    value: JsonObject,
    options?: { readonly isSafeToResume?: boolean; readonly expiresAt?: string | null },
  ): Promise<ResumeStateRecord | null> => {
    try {
      const repository = await resolveResumeRepository(repositoryRef.current);
      const next = await repository.save({
        ...targetRef.current,
        state: value,
        isSafeToResume: options?.isSafeToResume,
        expiresAt: options?.expiresAt ?? null,
      });
      replaceResumeState(next);
      return next;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<ResumeStateData>(normalized));
      throw normalized;
    }
  }, [replaceResumeState]);

  const clear = useCallback(async (): Promise<void> => {
    const repository = await resolveResumeRepository(repositoryRef.current);
    await repository.clear(targetRef.current);
    replaceResumeState(null);
  }, [replaceResumeState]);

  useEffect(() => {
    let cancelled = false;

    void refresh().catch((error) => {
      if (cancelled) {
        return;
      }

      const normalized = normalizeError(error);
      setState(createErrorState<ResumeStateData>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    status: state.status,
    resumeState: resumeRef.current,
    canResume: resumeRef.current?.isSafeToResume ?? false,
    error: state.error,
    refresh,
    save,
    clear,
  };
}
