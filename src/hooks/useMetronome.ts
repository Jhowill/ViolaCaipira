import { useMemo, useSyncExternalStore } from "react";

import { createMetronomeService } from "@/services/metronomeService";
import type { MetronomeInterruptionReason, MetronomeService, MetronomeState } from "@/types/metronome";
import type { TimeSignatureDenominator } from "@/types/music";

let defaultMetronomeService: MetronomeService | null = null;

function getDefaultMetronomeService(): MetronomeService {
  if (defaultMetronomeService === null) {
    defaultMetronomeService = createMetronomeService();
  }

  return defaultMetronomeService;
}

export interface UseMetronomeResult {
  readonly state: MetronomeState;
  readonly start: () => Promise<MetronomeState>;
  readonly pause: () => Promise<MetronomeState>;
  readonly stop: () => Promise<MetronomeState>;
  readonly setBpm: (bpm: number) => Promise<MetronomeState>;
  readonly setTimeSignature: (numerator: number, denominator: TimeSignatureDenominator) => Promise<MetronomeState>;
  readonly setAccentFirstBeat: (accentFirstBeat: boolean) => Promise<MetronomeState>;
  readonly setCountInBars: (countInBars: number) => Promise<MetronomeState>;
  readonly setVisualPulseEnabled: (visualPulseEnabled: boolean) => Promise<MetronomeState>;
  readonly tap: (timestampMs?: number) => Promise<MetronomeState>;
  readonly clearTapTempo: () => Promise<MetronomeState>;
  readonly handleBackground: () => Promise<MetronomeState>;
  readonly handleInterruption: (reason: MetronomeInterruptionReason) => Promise<MetronomeState>;
  readonly handleExit: () => Promise<MetronomeState>;
}

export function useMetronome(options: {
  readonly service?: MetronomeService;
} = {}): UseMetronomeResult {
  const service = options.service ?? getDefaultMetronomeService();
  const state = useSyncExternalStore(service.subscribe, service.getState, service.getState);

  return useMemo(
    () => ({
      state,
      start: service.start,
      pause: service.pause,
      stop: service.stop,
      setBpm: service.setBpm,
      setTimeSignature: service.setTimeSignature,
      setAccentFirstBeat: service.setAccentFirstBeat,
      setCountInBars: service.setCountInBars,
      setVisualPulseEnabled: service.setVisualPulseEnabled,
      tap: service.tap,
      clearTapTempo: service.clearTapTempo,
      handleBackground: service.handleBackground,
      handleInterruption: service.handleInterruption,
      handleExit: service.handleExit,
    }),
    [service, state],
  );
}

