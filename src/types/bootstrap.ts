export type AppBootstrapPhase =
  | "booting"
  | "checking_database"
  | "migrating_database"
  | "restoring_preferences"
  | "ready"
  | "recoverable_error"
  | "fatal_error";

export interface AppBootstrapState {
  readonly phase: AppBootstrapPhase;
  readonly attempt: number;
  readonly error: Error | null;
}

export interface AppBootstrapContextValue extends AppBootstrapState {
  readonly retry: () => Promise<void>;
}
