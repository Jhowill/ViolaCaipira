import { calculateBeatIntervalMs, calculateTapTempoBpm, clampCountInBars, clampMetronomeBpm, clampMetronomeNumerator, resetReasonForTapSequence, METRONOME_TAP_SAMPLE_LIMIT } from "@/domain/metronome";
import { createAudioSessionCoordinator } from "@/services/audioSessionCoordinator";
import { createNoopAudioSessionController } from "@/services/audioService";
import type { AudioSessionCoordinator, AudioSessionStopReason } from "@/types/audio";
import type { TimeSignatureDenominator } from "@/types/music";
import type {
  MetronomeBeatState,
  MetronomeCountInState,
  MetronomeCursor,
  MetronomeInterruptionReason,
  MetronomeScheduler,
  MetronomeService,
  MetronomeServiceOptions,
  MetronomeState,
  MetronomeTapTempoState,
  MetronomeStatus,
} from "@/types/metronome";

interface MetronomeTransportSettings {
  readonly bpm: number;
  readonly timeSignatureNumerator: number;
  readonly accentFirstBeat: boolean;
  readonly countInBars: number;
}

function createDefaultScheduler(): MetronomeScheduler {
  return {
    now: () => Date.now(),
    setTimeout: (callback: () => void, delayMs: number) => setTimeout(callback, delayMs),
    clearTimeout: (handle: unknown) => {
      clearTimeout(handle as ReturnType<typeof setTimeout>);
    },
  };
}

function createDefaultAudioCoordinator(): AudioSessionCoordinator {
  return createAudioSessionCoordinator({
    controller: createNoopAudioSessionController(),
  });
}

function createIdleBeat(): MetronomeBeatState {
  return {
    barNumber: null,
    beatInBar: null,
    isAccentBeat: false,
    nextBeatAtMs: null,
  };
}

function createIdleCountIn(): MetronomeCountInState {
  return {
    barsRemaining: 0,
    beatsRemaining: 0,
    beatInCountIn: null,
  };
}

function createIdleTapTempo(): MetronomeTapTempoState {
  return {
    sampleCount: 0,
    bpmCandidate: null,
    lastTapAtMs: null,
    resetReason: "none",
  };
}

function createMetronomeError(message: string): Error {
  const error = new Error(message);
  error.name = "MetronomeError";
  return error;
}

function buildInitialState(
  options: MetronomeServiceOptions,
  now: () => number,
  minimumBpm: number,
  maximumBpm: number,
): MetronomeState {
  return {
    status: "stopped",
    bpm: clampMetronomeBpm(options.bpm ?? 96, minimumBpm, maximumBpm),
    timeSignatureNumerator: clampMetronomeNumerator(options.timeSignatureNumerator ?? 4),
    timeSignatureDenominator: options.timeSignatureDenominator ?? 4,
    accentFirstBeat: options.accentFirstBeat ?? true,
    countInBars: clampCountInBars(options.countInBars ?? 2),
    visualPulseEnabled: options.visualPulseEnabled ?? true,
    beat: createIdleBeat(),
    countIn: createIdleCountIn(),
    tapTempo: createIdleTapTempo(),
    error: null,
    revision: 0,
    updatedAt: new Date(now()).toISOString(),
  };
}

function getTransportSettings(state: Pick<
  MetronomeState,
  "bpm" | "timeSignatureNumerator" | "accentFirstBeat" | "countInBars"
>): MetronomeTransportSettings {
  return {
    bpm: state.bpm,
    timeSignatureNumerator: state.timeSignatureNumerator,
    accentFirstBeat: state.accentFirstBeat,
    countInBars: state.countInBars,
  };
}

function buildBeatState(
  cursor: MetronomeCursor,
  settings: MetronomeTransportSettings,
  nextBeatAtMs: number | null,
): MetronomeBeatState {
  const numerator = clampMetronomeNumerator(settings.timeSignatureNumerator);
  const beatIndex = Math.max(1, Math.trunc(cursor.beatIndex));
  const barNumber = Math.floor((beatIndex - 1) / numerator) + 1;
  const beatInBar = ((beatIndex - 1) % numerator) + 1;

  return {
    barNumber,
    beatInBar,
    isAccentBeat: settings.accentFirstBeat && beatInBar === 1,
    nextBeatAtMs,
  };
}

function buildCountInState(
  cursor: MetronomeCursor,
  settings: MetronomeTransportSettings,
): MetronomeCountInState {
  if (cursor.phase !== "counting_in") {
    return createIdleCountIn();
  }

  const numerator = clampMetronomeNumerator(settings.timeSignatureNumerator);
  const countInBars = clampCountInBars(settings.countInBars);
  const totalCountInBeats = countInBars * numerator;

  if (totalCountInBeats <= 0) {
    return createIdleCountIn();
  }

  const currentBeat = Math.min(Math.max(1, Math.trunc(cursor.beatIndex)), totalCountInBeats);
  const beatsRemaining = Math.max(totalCountInBeats - currentBeat + 1, 0);

  if (beatsRemaining === 0) {
    return createIdleCountIn();
  }

  return {
    barsRemaining: Math.ceil(beatsRemaining / numerator),
    beatsRemaining,
    beatInCountIn: ((currentBeat - 1) % numerator) + 1,
  };
}

function buildTransportState(
  sourceState: MetronomeState,
  cursor: MetronomeCursor,
  status: MetronomeStatus,
  nextBeatAtMs: number | null,
): Pick<MetronomeState, "status" | "beat" | "countIn" | "error"> {
  const settings = getTransportSettings(sourceState);
  return {
    status,
    beat: buildBeatState(cursor, settings, nextBeatAtMs),
    countIn: buildCountInState(cursor, settings),
    error: null,
  };
}

function buildStoppedTransportState(): Pick<MetronomeState, "status" | "beat" | "countIn" | "error"> {
  return {
    status: "stopped",
    beat: createIdleBeat(),
    countIn: createIdleCountIn(),
    error: null,
  };
}

function createMetronomeCursor(phase: MetronomeCursor["phase"], nowMs: number, bpm: number): MetronomeCursor {
  return {
    phase,
    beatIndex: 1,
    nextBeatAtMs: nowMs + calculateBeatIntervalMs(bpm),
  };
}

export function createMetronomeService(options: MetronomeServiceOptions = {}): MetronomeService {
  const scheduler = options.scheduler ?? createDefaultScheduler();
  const now = options.now ?? scheduler.now;
  const audioCoordinator = options.audioCoordinator ?? createDefaultAudioCoordinator();
  const minimumBpm = Math.max(1, Math.min(options.minBpm ?? 20, options.maxBpm ?? 400));
  const maximumBpm = Math.max(minimumBpm, options.maxBpm ?? 400);
  const tapResetAfterMs = options.tapResetAfterMs ?? 2000;
  let state = buildInitialState(options, now, minimumBpm, maximumBpm);
  let transportCursor: MetronomeCursor | null = null;
  let timerHandle: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;
  let tapSamples: number[] = [];

  function assertActive(): void {
    if (disposed) {
      throw new Error("Metronome service has been destroyed.");
    }
  }

  function emit(): void {
    listeners.forEach((listener) => {
      listener();
    });
  }

  function commit(nextState: Omit<MetronomeState, "revision" | "updatedAt">): MetronomeState {
    state = {
      ...nextState,
      revision: state.revision + 1,
      updatedAt: new Date(now()).toISOString(),
    };
    emit();
    return state;
  }

  function clearTimer(): void {
    if (timerHandle === null) {
      return;
    }

    scheduler.clearTimeout(timerHandle);
    timerHandle = null;
  }

  function scheduleNextBeat(cursor: MetronomeCursor): void {
    clearTimer();
    const delay = Math.max(0, cursor.nextBeatAtMs - now());
    timerHandle = scheduler.setTimeout(() => {
      void advanceTransport();
    }, delay) as ReturnType<typeof setTimeout>;
  }

  function buildRuntimeState(cursor: MetronomeCursor, status: MetronomeStatus): Omit<MetronomeState, "revision" | "updatedAt"> {
    const nextBeatAtMs = status === "paused" ? null : cursor.nextBeatAtMs;
    const transportState = buildTransportState(state, cursor, status, nextBeatAtMs);

    return {
      ...state,
      ...transportState,
    };
  }

  function normalizeTapSamples(samples: readonly number[]): number[] {
    return [...samples].slice(-METRONOME_TAP_SAMPLE_LIMIT);
  }

  function updateBpmState(nextBpm: number): MetronomeState {
    const bpm = clampMetronomeBpm(nextBpm, minimumBpm, maximumBpm);
    const nextState = {
      ...state,
      bpm,
      error: null,
    };

    if (transportCursor === null || (state.status !== "counting_in" && state.status !== "playing")) {
      return commit(nextState);
    }

    const nextCursor = {
      ...transportCursor,
      nextBeatAtMs: now() + calculateBeatIntervalMs(bpm),
    };

    transportCursor = nextCursor;
    clearTimer();

    const committedState = commit({
      ...nextState,
      ...buildTransportState(nextState, nextCursor, state.status, nextCursor.nextBeatAtMs),
    });
    scheduleNextBeat(nextCursor);
    return committedState;
  }

  function advanceTransport(): void {
    if (disposed || transportCursor === null) {
      return;
    }

    if (state.status !== "counting_in" && state.status !== "playing") {
      return;
    }

    const currentCursor = transportCursor;
    const intervalMs = calculateBeatIntervalMs(state.bpm);
    const nextBeatAtMs = currentCursor.nextBeatAtMs + intervalMs;
    const numerator = clampMetronomeNumerator(state.timeSignatureNumerator);
    const countInBeats = clampCountInBars(state.countInBars) * numerator;

    let nextCursor: MetronomeCursor;

    if (currentCursor.phase === "counting_in" && countInBeats > 0 && currentCursor.beatIndex >= countInBeats) {
      nextCursor = {
        phase: "playing",
        beatIndex: 1,
        nextBeatAtMs,
      };
    } else if (currentCursor.phase === "counting_in" && countInBeats <= 0) {
      nextCursor = {
        phase: "playing",
        beatIndex: 1,
        nextBeatAtMs,
      };
    } else if (currentCursor.phase === "counting_in") {
      nextCursor = {
        phase: "counting_in",
        beatIndex: currentCursor.beatIndex + 1,
        nextBeatAtMs,
      };
    } else {
      nextCursor = {
        phase: "playing",
        beatIndex: currentCursor.beatIndex + 1,
        nextBeatAtMs,
      };
    }

    transportCursor = nextCursor;
    commit({
      ...state,
      ...buildTransportState(state, nextCursor, nextCursor.phase, nextCursor.nextBeatAtMs),
    });
    scheduleNextBeat(nextCursor);
  }

  async function start(): Promise<MetronomeState> {
    assertActive();

    if (state.status === "counting_in" || state.status === "playing") {
      return state;
    }

    const session = await audioCoordinator.requestSession("metronome");
    if (!session.granted) {
      return commit({
        ...state,
        error: createMetronomeError("Outra sessão de áudio já está ativa. Confirme a troca para iniciar o metrônomo."),
      });
    }

    const nextCursor = state.status === "paused" && transportCursor !== null
      ? {
          ...transportCursor,
          nextBeatAtMs: now() + calculateBeatIntervalMs(state.bpm),
        }
      : transportCursor ?? createMetronomeCursor(
          state.countInBars > 0 ? "counting_in" : "playing",
          now(),
          state.bpm,
        );

    transportCursor = nextCursor;
    clearTimer();

    const nextState = {
      ...state,
      ...buildRuntimeState(nextCursor, nextCursor.phase),
      error: null,
    };

    commit(nextState);
    scheduleNextBeat(nextCursor);
    return state;
  }

  async function pause(reason: AudioSessionStopReason = "manual"): Promise<MetronomeState> {
    assertActive();

    if (state.status !== "counting_in" && state.status !== "playing") {
      return state;
    }

    clearTimer();

    const currentCursor = transportCursor;
    if (currentCursor === null) {
      return commit({
        ...state,
        status: "paused",
        beat: createIdleBeat(),
        countIn: createIdleCountIn(),
        error: null,
      });
    }

    const pausedState = {
      ...state,
      ...buildRuntimeState(currentCursor, "paused"),
      error: null,
    };

    commit(pausedState);

    const session = audioCoordinator.getState();
    if (session.activeOwner === "metronome") {
      await audioCoordinator.pauseSession(reason);
    }

    return state;
  }

  async function stop(reason: AudioSessionStopReason = "manual"): Promise<MetronomeState> {
    assertActive();

    if (state.status === "stopped") {
      return state;
    }

    clearTimer();
    transportCursor = null;

    commit({
      ...state,
      ...buildStoppedTransportState(),
    });

    const session = audioCoordinator.getState();
    if (
      session.activeOwner === "metronome" ||
      (session.status === "suspended" && session.lastOwner === "metronome")
    ) {
      await audioCoordinator.releaseSession(reason);
    }

    return state;
  }

  function setBpm(nextBpm: number): Promise<MetronomeState> {
    assertActive();
    return Promise.resolve(updateBpmState(nextBpm));
  }

  function setTimeSignature(
    numerator: number,
    denominator: TimeSignatureDenominator,
  ): Promise<MetronomeState> {
    assertActive();

    const nextState = {
      ...state,
      timeSignatureNumerator: clampMetronomeNumerator(numerator),
      timeSignatureDenominator: denominator,
      error: null,
    };

    if (transportCursor !== null && (state.status === "counting_in" || state.status === "playing" || state.status === "paused")) {
      return commit({
        ...nextState,
        ...buildTransportState(nextState, transportCursor, state.status, state.status === "paused" ? null : transportCursor.nextBeatAtMs),
      });
    }

    return Promise.resolve(commit(nextState));
  }

  function setAccentFirstBeat(accentFirstBeat: boolean): Promise<MetronomeState> {
    assertActive();

    const nextState = {
      ...state,
      accentFirstBeat,
      error: null,
    };

    if (transportCursor !== null && (state.status === "counting_in" || state.status === "playing" || state.status === "paused")) {
      return commit({
        ...nextState,
        ...buildTransportState(nextState, transportCursor, state.status, state.status === "paused" ? null : transportCursor.nextBeatAtMs),
      });
    }

    return Promise.resolve(commit(nextState));
  }

  function setCountInBars(countInBars: number): Promise<MetronomeState> {
    assertActive();

    const nextState = {
      ...state,
      countInBars: clampCountInBars(countInBars),
      error: null,
    };

    if (transportCursor !== null && (state.status === "counting_in" || state.status === "playing" || state.status === "paused")) {
      return commit({
        ...nextState,
        ...buildTransportState(nextState, transportCursor, state.status, state.status === "paused" ? null : transportCursor.nextBeatAtMs),
      });
    }

    return Promise.resolve(commit(nextState));
  }

  function setVisualPulseEnabled(visualPulseEnabled: boolean): Promise<MetronomeState> {
    assertActive();

    return Promise.resolve(commit({
      ...state,
      visualPulseEnabled,
      error: null,
    }));
  }

  function tap(timestampMs?: number): Promise<MetronomeState> {
    assertActive();

    const effectiveTimestamp = timestampMs ?? now();
    const resetReason = resetReasonForTapSequence(tapSamples, tapResetAfterMs, effectiveTimestamp);

    if (resetReason === "pause_long" || tapSamples.length === 0 || effectiveTimestamp <= (tapSamples[tapSamples.length - 1] ?? Number.NEGATIVE_INFINITY)) {
      tapSamples = [effectiveTimestamp];
      return Promise.resolve(commit({
        ...state,
        tapTempo: {
          sampleCount: 1,
          bpmCandidate: null,
          lastTapAtMs: effectiveTimestamp,
          resetReason: resetReason === "pause_long" ? "pause_long" : "insufficient_samples",
        },
        error: null,
      }));
    }

    tapSamples = normalizeTapSamples([...tapSamples, effectiveTimestamp]);
    const bpmCandidate = calculateTapTempoBpm(tapSamples, minimumBpm, maximumBpm);
    const tapTempo: MetronomeTapTempoState = {
      sampleCount: tapSamples.length,
      bpmCandidate,
      lastTapAtMs: effectiveTimestamp,
      resetReason: bpmCandidate === null ? "insufficient_samples" : "none",
    };

    if (bpmCandidate !== null) {
      return Promise.resolve(updateTapTempoAndBpm(tapTempo, bpmCandidate));
    }

    return Promise.resolve(commit({
      ...state,
      tapTempo,
      error: null,
    }));
  }

  function updateTapTempoAndBpm(
    tapTempo: MetronomeTapTempoState,
    bpmCandidate: number,
  ): MetronomeState {
    const safeBpm = clampMetronomeBpm(bpmCandidate, minimumBpm, maximumBpm);
    const nextState = {
      ...state,
      bpm: safeBpm,
      tapTempo,
      error: null,
    };

    if (transportCursor === null || (state.status !== "counting_in" && state.status !== "playing")) {
      return commit(nextState);
    }

    const nextCursor = {
      ...transportCursor,
      nextBeatAtMs: now() + calculateBeatIntervalMs(safeBpm),
    };
    transportCursor = nextCursor;
    clearTimer();

    const committedState = commit({
      ...nextState,
      ...buildTransportState(nextState, nextCursor, state.status, nextCursor.nextBeatAtMs),
    });
    scheduleNextBeat(nextCursor);
    return committedState;
  }

  function clearTapTempo(): Promise<MetronomeState> {
    assertActive();

    tapSamples = [];
    return Promise.resolve(commit({
      ...state,
      tapTempo: createIdleTapTempo(),
      error: null,
    }));
  }

  async function handleBackground(): Promise<MetronomeState> {
    assertActive();
    return pause("background");
  }

  async function handleInterruption(reason: MetronomeInterruptionReason): Promise<MetronomeState> {
    assertActive();
    return pause(reason);
  }

  async function handleExit(): Promise<MetronomeState> {
    assertActive();
    return stop("exit");
  }

  function syncWithAudioCoordinator(): void {
    const session = audioCoordinator.getState();

    if (disposed) {
      return;
    }

    if (session.activeOwner === "metronome") {
      return;
    }

    if (state.status !== "counting_in" && state.status !== "playing") {
      return;
    }

    if (
      session.status === "suspended" ||
      session.lastStopReason === "background" ||
      session.lastStopReason === "call" ||
      session.lastStopReason === "alarm" ||
      session.lastStopReason === "switch"
    ) {
      clearTimer();
      if (transportCursor !== null) {
        commit({
          ...state,
          ...buildRuntimeState(transportCursor, "paused"),
          error: null,
        });
      }
      return;
    }

    if (session.status === "idle") {
      clearTimer();
      transportCursor = null;
      commit({
        ...state,
        ...buildStoppedTransportState(),
        error: null,
      });
    }
  }

  const listeners = new Set<() => void>();
  const unsubscribe = audioCoordinator.subscribe(syncWithAudioCoordinator);

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function destroy(): void {
    disposed = true;
    clearTimer();
    listeners.clear();
    unsubscribe();

    const session = audioCoordinator.getState();
    if (session.activeOwner === "metronome" || (session.status === "suspended" && session.lastOwner === "metronome")) {
      void audioCoordinator.releaseSession("exit").catch(() => undefined);
    }
  }

  return {
    getState: () => state,
    subscribe,
    start,
    pause,
    stop,
    setBpm,
    setTimeSignature,
    setAccentFirstBeat,
    setCountInBars,
    setVisualPulseEnabled,
    tap,
    clearTapTempo,
    handleBackground,
    handleInterruption,
    handleExit,
    destroy,
  };
}
