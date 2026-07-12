import type { AppBootstrapPhase } from "@/types/bootstrap";

export interface AppBootstrapSteps {
  readonly checkDatabase: () => Promise<void>;
  readonly migrateDatabase: () => Promise<void>;
  readonly restorePreferences: () => Promise<void>;
}

export async function runAppBootstrap(
  steps: AppBootstrapSteps,
  onPhaseChange: (phase: AppBootstrapPhase) => void,
): Promise<void> {
  onPhaseChange("checking_database");
  await steps.checkDatabase();

  onPhaseChange("migrating_database");
  await steps.migrateDatabase();

  onPhaseChange("restoring_preferences");
  await steps.restorePreferences();

  onPhaseChange("ready");
}
