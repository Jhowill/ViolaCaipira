import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getAppDatabaseClient } from "@/database/client";
import { createPreferencesRepository } from "@/repositories/preferencesRepository";
import { AppBootstrapContext } from "@/state/appBootstrap/context";
import { runAppBootstrap, type AppBootstrapSteps } from "@/state/appBootstrap/runAppBootstrap";
import type { AppBootstrapPhase, AppBootstrapState } from "@/types/bootstrap";
import { logBootstrapError } from "@/utils/logger";

const initialState: AppBootstrapState = {
  phase: "booting",
  attempt: 0,
  error: null,
};

function isFatalBootstrapError(error: Error): boolean {
  return error.name === "MigrationError" && error.message.includes("different checksum");
}

export interface AppBootstrapProviderProps extends PropsWithChildren {
  readonly steps?: AppBootstrapSteps;
}

export function AppBootstrapProvider({ children, steps }: AppBootstrapProviderProps) {
  const [state, setState] = useState<AppBootstrapState>(initialState);
  const runningRef = useRef(false);

  const defaultSteps = useMemo<AppBootstrapSteps>(() => {
    let clientPromise: ReturnType<typeof getAppDatabaseClient> | null = null;
    const getClient = () => {
      clientPromise ??= getAppDatabaseClient();
      return clientPromise;
    };

    return {
      checkDatabase: async () => {
        await getClient();
      },
      migrateDatabase: async () => {
        await getClient();
      },
      restorePreferences: async () => {
        const client = await getClient();
        const [catalogTuning, userTuning] = await Promise.all([
          client.database.getFirstAsync<{ readonly id: string }>("SELECT id FROM catalog_tunings LIMIT 1"),
          client.database.getFirstAsync<{ readonly id: string }>(
            "SELECT id FROM user_tunings WHERE deleted_at IS NULL LIMIT 1",
          ),
        ]);

        // A instalação ainda pode estar sem catálogo durante o desenvolvimento.
        // As preferências musicais só são válidas quando existe uma afinação de referência.
        if (catalogTuning || userTuning) {
          await createPreferencesRepository(client.database).get();
        }
      },
    };
  }, []);

  const start = useCallback(async () => {
    if (runningRef.current) {
      return;
    }

    runningRef.current = true;
    setState((current) => ({
      phase: "booting",
      attempt: current.attempt + 1,
      error: null,
    }));

    try {
      await runAppBootstrap(steps ?? defaultSteps, (phase: AppBootstrapPhase) => {
        setState((current) => ({ ...current, phase, error: null }));
      });
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error("Falha desconhecida na inicialização.");
      logBootstrapError(error);
      setState((current) => ({
        ...current,
        phase: isFatalBootstrapError(error) ? "fatal_error" : "recoverable_error",
        error,
      }));
    } finally {
      runningRef.current = false;
    }
  }, [defaultSteps, steps]);

  useEffect(() => {
    void start();
  }, [start]);

  const value = useMemo(
    () => ({
      ...state,
      retry: start,
    }),
    [start, state],
  );

  return <AppBootstrapContext.Provider value={value}>{children}</AppBootstrapContext.Provider>;
}
