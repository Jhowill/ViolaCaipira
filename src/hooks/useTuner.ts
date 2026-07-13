import { useMemo, useSyncExternalStore } from "react";

import { createTunerService } from "@/services/tunerService";
import type {
  TunerService,
  TunerState,
  TunerTarget,
} from "@/types/tuner";
import type { TunerMode } from "@/types/music";

let defaultTunerService: TunerService | null = null;

function getDefaultTunerService(): TunerService {
  if (defaultTunerService === null) {
    defaultTunerService = createTunerService();
  }

  return defaultTunerService;
}

export interface UseTunerResult {
  readonly state: TunerState;
  readonly start: () => Promise<TunerState>;
  readonly pause: () => Promise<TunerState>;
  readonly stop: () => Promise<TunerState>;
  readonly setMode: (mode: TunerMode) => Promise<TunerState>;
  readonly setCalibrationA4: (calibrationA4: number) => Promise<TunerState>;
  readonly setToleranceCents: (toleranceCents: number) => Promise<TunerState>;
  readonly setAutoAdvance: (autoAdvance: boolean) => Promise<TunerState>;
  readonly setTarget: (target: TunerTarget | null) => Promise<TunerState>;
  readonly setGuidedTargets: (targets: readonly TunerTarget[]) => Promise<TunerState>;
  readonly advanceTarget: () => Promise<TunerState>;
  readonly clearError: () => Promise<TunerState>;
}

export function useTuner(options: {
  readonly service?: TunerService;
} = {}): UseTunerResult {
  const service = options.service ?? getDefaultTunerService();
  const state = useSyncExternalStore(service.subscribe, service.getState, service.getState);

  return useMemo(
    () => ({
      state,
      start: service.start,
      pause: service.pause,
      stop: service.stop,
      setMode: service.setMode,
      setCalibrationA4: service.setCalibrationA4,
      setToleranceCents: service.setToleranceCents,
      setAutoAdvance: service.setAutoAdvance,
      setTarget: service.setTarget,
      setGuidedTargets: service.setGuidedTargets,
      advanceTarget: service.advanceTarget,
      clearError: service.clearError,
    }),
    [service, state],
  );
}
