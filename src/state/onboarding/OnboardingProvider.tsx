import { getAppDatabaseClient } from "@/database/client";
import {
  createOnboardingRepository,
  type OnboardingDraft,
  type OnboardingSnapshot,
  type OnboardingStep,
} from "@/repositories/onboardingRepository";
import { OnboardingContext } from "@/state/onboarding/context";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [snapshot, setSnapshot] = useState<OnboardingSnapshot | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const client = await getAppDatabaseClient();
      const repository = createOnboardingRepository(client.database);
      setSnapshot(await repository.load());
      setPhase("ready");
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Falha ao carregar o onboarding."));
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveStep = useCallback(
    async (updates: Partial<OnboardingDraft>, nextStep: OnboardingStep) => {
      if (!snapshot) {
        return;
      }

      try {
        const client = await getAppDatabaseClient();
        const repository = createOnboardingRepository(client.database);
        const nextDraft = { ...snapshot.draft, ...updates };
        setSnapshot(await repository.save(snapshot, nextDraft, nextStep));
      } catch (cause) {
        const saveError = cause instanceof Error ? cause : new Error("Falha ao salvar o onboarding.");
        setError(saveError);
        setPhase("error");
        throw saveError;
      }
    },
    [snapshot],
  );

  const complete = useCallback(async () => {
    if (!snapshot) {
      return;
    }

    try {
      const client = await getAppDatabaseClient();
      const repository = createOnboardingRepository(client.database);
      setSnapshot(await repository.complete(snapshot));
    } catch (cause) {
      const saveError = cause instanceof Error ? cause : new Error("Falha ao concluir o onboarding.");
      setError(saveError);
      setPhase("error");
      throw saveError;
    }
  }, [snapshot]);

  const value = useMemo(
    () => ({ phase, snapshot, error, saveStep, complete, retry: load }),
    [complete, error, load, phase, saveStep, snapshot],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}
