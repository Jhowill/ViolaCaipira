import type { TimeSignatureDenominator } from "@/types/music";
import type { AudioSessionCoordinator } from "@/types/audio";

export type MetronomeStatus = "stopped" | "counting_in" | "playing" | "paused";

export type MetronomeTapResetReason = "none" | "insufficient_samples" | "pause_long";

export type MetronomeInterruptionReason = "call" | "alarm";

export type MetronomeCursorPhase = "counting_in" | "playing";

export interface MetronomeCursor {
  readonly phase: MetronomeCursorPhase;
  readonly beatIndex: number;
  readonly nextBeatAtMs: number;
}

export interface MetronomeBeatState {
  readonly barNumber: number | null;
  readonly beatInBar: number | null;
  readonly isAccentBeat: boolean;
  readonly nextBeatAtMs: number | null;
}

export interface MetronomeCountInState {
  readonly barsRemaining: number;
  readonly beatsRemaining: number;
  readonly beatInCountIn: number | null;
}

export interface MetronomeTapTempoState {
  readonly sampleCount: number;
  readonly bpmCandidate: number | null;
  readonly lastTapAtMs: number | null;
  readonly resetReason: MetronomeTapResetReason;
}

export interface MetronomeState {
  readonly status: MetronomeStatus;
  readonly bpm: number;
  readonly timeSignatureNumerator: number;
  readonly timeSignatureDenominator: TimeSignatureDenominator;
  readonly accentFirstBeat: boolean;
  readonly countInBars: number;
  readonly visualPulseEnabled: boolean;
  readonly beat: MetronomeBeatState;
  readonly countIn: MetronomeCountInState;
  readonly tapTempo: MetronomeTapTempoState;
  readonly error: Error | null;
  readonly revision: number;
  readonly updatedAt: string;
}

export interface MetronomeScheduler {
  readonly now: () => number;
  readonly setTimeout: (callback: () => void, delayMs: number) => unknown;
  readonly clearTimeout: (handle: unknown) => void;
}

export interface MetronomeServiceOptions {
  readonly bpm?: number;
  readonly timeSignatureNumerator?: number;
  readonly timeSignatureDenominator?: TimeSignatureDenominator;
  readonly accentFirstBeat?: boolean;
  readonly countInBars?: number;
  readonly visualPulseEnabled?: boolean;
  readonly minBpm?: number;
  readonly maxBpm?: number;
  readonly tapResetAfterMs?: number;
  readonly audioCoordinator?: AudioSessionCoordinator;
  readonly scheduler?: MetronomeScheduler;
  readonly now?: () => number;
}

export interface MetronomeService {
  readonly getState: () => MetronomeState;
  readonly subscribe: (listener: () => void) => () => void;
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
  readonly destroy: () => void;
}
