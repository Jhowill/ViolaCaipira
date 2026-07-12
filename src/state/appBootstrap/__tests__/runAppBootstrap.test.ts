import { describe, expect, it, vi } from "vitest";

import { runAppBootstrap } from "@/state/appBootstrap/runAppBootstrap";
import type { AppBootstrapPhase } from "@/types/bootstrap";

describe("runAppBootstrap", () => {
  it("executa as etapas em ordem e termina pronto", async () => {
    const order: string[] = [];
    const phases: AppBootstrapPhase[] = [];

    await runAppBootstrap(
      {
        checkDatabase: () => {
          order.push("check");
          return Promise.resolve();
        },
        migrateDatabase: () => {
          order.push("migrate");
          return Promise.resolve();
        },
        restorePreferences: () => {
          order.push("preferences");
          return Promise.resolve();
        },
      },
      (phase) => phases.push(phase),
    );

    expect(order).toEqual(["check", "migrate", "preferences"]);
    expect(phases).toEqual([
      "checking_database",
      "migrating_database",
      "restoring_preferences",
      "ready",
    ]);
  });

  it("interrompe a sequência quando uma etapa falha", async () => {
    const restorePreferences = vi.fn(() => Promise.resolve());

    await expect(
      runAppBootstrap(
        {
          checkDatabase: () => Promise.resolve(),
          migrateDatabase: () => Promise.reject(new Error("migration failed")),
          restorePreferences,
        },
        () => undefined,
      ),
    ).rejects.toThrow("migration failed");

    expect(restorePreferences).not.toHaveBeenCalled();
  });
});
