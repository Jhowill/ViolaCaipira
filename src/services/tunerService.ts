import { analyzeTunerWindow, createTunerTarget, type TunerAnalysisOptions } from "@/domain/tuner";
import type {
  TunerFrequencySample,
  TunerGuidedProgress,
  TunerInputSource,
  TunerPermissionResolver,
  TunerPermissionStatus,
  TunerService,
  TunerServiceOptions,
  TunerSignalState,
  TunerState,
  TunerTarget,
} from "@/types/tuner";
import type { TunerMode } from "@/types/music";

function createIdleSignal(): TunerSignalState {
  return {
    quality: "none",
    strength: 0,
    sampleCount: 0,
    stabilityScore: 0,
    weaknessReason: "none",
  };
}

function createUnknownPermissionResolver(): TunerPermissionResolver {
  return {
    requestPermission: () => Promise.resolve("blocked"),
  };
}

function createNoopTunerInputSource(): TunerInputSource {
  return {
    start: () => Promise.resolve(),
    stop: () => Promise.resolve(),
    subscribe: () => () => undefined,
  };
}

function toError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === "string" ? error : fallbackMessage);
}

function createTunerError(message: string): Error {
  const error = new Error(message);
  error.name = "TunerError";
  return error;
}

function buildGuidedProgress(
  mode: TunerMode,
  guidedTargets: readonly TunerTarget[],
  guidedIndex: number,
  guidedCanAdvance: boolean,
): TunerGuidedProgress | null {
  if (mode !== "guided" || guidedTargets.length === 0) {
    return null;
  }

  return {
    targets: guidedTargets,
    index: guidedIndex,
    completedCount: Math.min(guidedIndex, guidedTargets.length),
    totalCount: guidedTargets.length,
    canAdvance: guidedCanAdvance,
    isComplete: guidedIndex >= guidedTargets.length,
  };
}

function resolveCurrentTarget(
  mode: TunerMode,
  guidedTargets: readonly TunerTarget[],
  guidedIndex: number,
  fixedTarget: TunerTarget | null,
): TunerTarget | null {
  if (mode === "guided" && guidedTargets.length > 0) {
    const clampedIndex = Math.min(Math.max(guidedIndex, 0), guidedTargets.length - 1);
    return guidedTargets[clampedIndex] ?? null;
  }

  return fixedTarget;
}

function createInitialState(options: TunerServiceOptions, mode: TunerMode): TunerState {
  const target = options.target ?? null;
  const guidedTargets = options.guidedTargets ?? [];
  const guidedProgress = buildGuidedProgress(mode, guidedTargets, 0, false);

  return {
    status: "idle",
    permissionStatus: "unknown",
    mode,
    calibrationA4: options.calibrationA4 ?? 440,
    toleranceCents: options.toleranceCents ?? 5,
    autoAdvance: options.autoAdvance ?? false,
    target: resolveCurrentTarget(mode, guidedTargets, 0, target),
    guided: guidedProgress,
    signal: createIdleSignal(),
    analysis: null,
    error: null,
    revision: 0,
    updatedAt: (options.now ?? (() => new Date()))().toISOString(),
  };
}

export function createTunerService(options: TunerServiceOptions = {}): TunerService {
  const now = options.now ?? (() => new Date());
  const analysisOptions = () =>
    ({
      calibrationA4: state.calibrationA4,
      toleranceCents: state.toleranceCents,
      sampleWindowSize: Math.max(1, options.sampleWindowSize ?? 3),
      weakSignalFloor: options.weakSignalFloor ?? 0.2,
      stabilitySpreadCents: options.stabilitySpreadCents ?? 12,
      maxSafeGuidanceCents: options.maxSafeGuidanceCents ?? 120,
    }) satisfies TunerAnalysisOptions;

  const source = options.source ?? createNoopTunerInputSource();
  const permissionResolver = options.permissionResolver ?? createUnknownPermissionResolver();

  let state = createInitialState(options, options.mode ?? "chromatic");
  const listeners = new Set<() => void>();
  let samples: readonly TunerFrequencySample[] = [];
  let captureUnsubscribe: (() => void) | null = null;
  let captureActive = false;
  let guidedTargets: readonly TunerTarget[] = options.guidedTargets ?? [];
  let guidedIndex = 0;
  let fixedTarget: TunerTarget | null = options.target ?? null;
  let disposed = false;

  function emit(): void {
    listeners.forEach((listener) => {
      listener();
    });
  }

  function assertActive(): void {
    if (disposed) {
      throw new Error("Tuner service has been destroyed.");
    }
  }

  function commit(changes: Partial<Omit<TunerState, "revision" | "updatedAt">>): TunerState {
    state = {
      ...state,
      ...changes,
      revision: state.revision + 1,
      updatedAt: now().toISOString(),
    };
    emit();
    return state;
  }

  function resetSamples(): void {
    samples = [];
  }

  async function shutdownCapture(nextStatus: "idle" | "paused"): Promise<TunerState> {
    const unsubscribe = captureUnsubscribe;
    captureUnsubscribe = null;

    if (unsubscribe !== null) {
      unsubscribe();
    }

    if (captureActive) {
      captureActive = false;

      try {
        await source.stop();
      } catch (error) {
        return commit({
          status: "error",
          error: toError(error, "Falha ao parar a captura do afinador."),
        });
      }
    }

    resetSamples();
    return commit({
      status: nextStatus,
      guided: buildGuidedProgress(state.mode, guidedTargets, guidedIndex, false),
    });
  }

  function recalculateCurrentAnalysis(): TunerState {
    const currentTarget = resolveCurrentTarget(state.mode, guidedTargets, guidedIndex, fixedTarget);
    const result = analyzeTunerWindow(samples, analysisOptions(), currentTarget);

    const guidedCanAdvance = Boolean(result.analysis?.canAdvance);
    const guided = buildGuidedProgress(state.mode, guidedTargets, guidedIndex, guidedCanAdvance);

    return commit({
      target: currentTarget,
      guided,
      signal: result.signal,
      analysis: result.analysis,
      error: null,
    });
  }

  function handleSample(sample: TunerFrequencySample): void {
    if (disposed || !captureActive || state.status !== "listening") {
      return;
    }

    const nextSamples = [...samples, sample].slice(-Math.max(1, options.sampleWindowSize ?? 3));
    samples = nextSamples;
    recalculateCurrentAnalysis();

    if (state.mode === "guided" && state.guided?.canAdvance && state.autoAdvance && !state.guided.isComplete) {
      void advanceTarget();
    }
  }

  async function start(): Promise<TunerState> {
    assertActive();

    if (state.status === "listening" || state.status === "initializing") {
      return state;
    }

    if (state.permissionStatus !== "granted") {
      commit({
        status: "permission",
        error: null,
      });

      let permissionStatus: TunerPermissionStatus;
      try {
        permissionStatus = await permissionResolver.requestPermission();
      } catch (error) {
        return commit({
          status: "error",
          permissionStatus: "denied",
          error: toError(error, "Falha ao solicitar permissão do microfone."),
        });
      }

      commit({
        permissionStatus,
      });

      if (permissionStatus === "denied") {
        return commit({
          status: "error",
          error: createTunerError("Permissão do microfone negada."),
        });
      }

      if (permissionStatus === "blocked") {
        return commit({
          status: "error",
          error: createTunerError("Permissão do microfone bloqueada."),
        });
      }
    }

    commit({
      status: "initializing",
      error: null,
    });

    resetSamples();

    captureUnsubscribe = source.subscribe(handleSample);

    try {
      await source.start();
      captureActive = true;
    } catch (error) {
      const unsubscribe = captureUnsubscribe;
      captureUnsubscribe = null;
      if (unsubscribe !== null) {
        unsubscribe();
      }

      captureActive = false;
      return commit({
        status: "error",
        error: toError(error, "Falha ao iniciar a captura do afinador."),
      });
    }

    return commit({
      status: "listening",
      target: resolveCurrentTarget(state.mode, guidedTargets, guidedIndex, fixedTarget),
      guided: buildGuidedProgress(state.mode, guidedTargets, guidedIndex, false),
      error: null,
    });
  }

  async function pause(): Promise<TunerState> {
    assertActive();

    if (!captureActive && captureUnsubscribe === null) {
      return state.status === "error"
        ? commit({
            status: "paused",
            error: null,
            guided: buildGuidedProgress(state.mode, guidedTargets, guidedIndex, false),
          })
        : commit({
            status: "paused",
            guided: buildGuidedProgress(state.mode, guidedTargets, guidedIndex, false),
          });
    }

    return shutdownCapture("paused");
  }

  async function stop(): Promise<TunerState> {
    assertActive();

    if (!captureActive && captureUnsubscribe === null) {
      return commit({
        status: "idle",
        error: null,
        guided: buildGuidedProgress(state.mode, guidedTargets, guidedIndex, false),
      });
    }

    return shutdownCapture("idle");
  }

  function setMode(mode: TunerMode): Promise<TunerState> {
    assertActive();

    if (state.mode === mode) {
      return Promise.resolve(state);
    }

    samples = [];
    guidedIndex = 0;

    return Promise.resolve(commit({
      mode,
      target: resolveCurrentTarget(mode, guidedTargets, guidedIndex, fixedTarget),
      guided: buildGuidedProgress(mode, guidedTargets, guidedIndex, false),
      analysis: null,
      signal: createIdleSignal(),
      error: null,
    }));
  }

  function setCalibrationA4(calibrationA4: number): Promise<TunerState> {
    assertActive();

    commit({ calibrationA4, error: null });

    if (samples.length === 0) {
      return Promise.resolve(state);
    }

    return Promise.resolve(recalculateCurrentAnalysis());
  }

  function setToleranceCents(toleranceCents: number): Promise<TunerState> {
    assertActive();

    commit({ toleranceCents, error: null });

    if (samples.length === 0) {
      return Promise.resolve(state);
    }

    return Promise.resolve(recalculateCurrentAnalysis());
  }

  function setAutoAdvance(autoAdvance: boolean): Promise<TunerState> {
    assertActive();

    commit({
      autoAdvance,
      error: null,
    });

    if (
      autoAdvance &&
      state.mode === "guided" &&
      state.analysis?.canAdvance &&
      state.guided !== null &&
      !state.guided.isComplete
    ) {
      void advanceTarget();
    }

    return Promise.resolve(state);
  }

  function setTarget(target: TunerTarget | null): Promise<TunerState> {
    assertActive();

    fixedTarget = target;
    guidedIndex = Math.min(guidedIndex, Math.max(guidedTargets.length - 1, 0));
    samples = [];

    return Promise.resolve(commit({
      target: resolveCurrentTarget(state.mode, guidedTargets, guidedIndex, fixedTarget),
      guided: buildGuidedProgress(state.mode, guidedTargets, guidedIndex, false),
      analysis: null,
      signal: createIdleSignal(),
      error: null,
    }));
  }

  function setGuidedTargets(targets: readonly TunerTarget[]): Promise<TunerState> {
    assertActive();

    guidedTargets = [...targets];
    guidedIndex = 0;
    samples = [];

    return Promise.resolve(commit({
      target: resolveCurrentTarget(state.mode, guidedTargets, guidedIndex, fixedTarget),
      guided: buildGuidedProgress(state.mode, guidedTargets, guidedIndex, false),
      analysis: null,
      signal: createIdleSignal(),
      error: null,
    }));
  }

  async function advanceTarget(): Promise<TunerState> {
    assertActive();

    if (state.mode !== "guided" || guidedTargets.length === 0) {
      return state;
    }

    const atLastTarget = guidedIndex >= guidedTargets.length - 1;

    if (atLastTarget) {
      guidedIndex = guidedTargets.length;
      samples = [];

      const nextTarget = resolveCurrentTarget(state.mode, guidedTargets, guidedIndex, fixedTarget);
      commit({
        target: nextTarget,
        guided: buildGuidedProgress(state.mode, guidedTargets, guidedIndex, false),
      });

      if (captureActive || captureUnsubscribe !== null) {
        return shutdownCapture("paused");
      }

      return commit({
        target: nextTarget,
        guided: buildGuidedProgress(state.mode, guidedTargets, guidedIndex, false),
        status: "paused",
      });
    }

    guidedIndex += 1;
    samples = [];

    return commit({
      target: resolveCurrentTarget(state.mode, guidedTargets, guidedIndex, fixedTarget),
      guided: buildGuidedProgress(state.mode, guidedTargets, guidedIndex, false),
      analysis: null,
      signal: createIdleSignal(),
      error: null,
    });
  }

  function clearError(): Promise<TunerState> {
    assertActive();

    return Promise.resolve(commit({
      error: null,
      status: state.status === "error" ? "idle" : state.status,
    }));
  }

  function destroy(): void {
    disposed = true;
    listeners.clear();

    if (captureUnsubscribe !== null) {
      captureUnsubscribe();
      captureUnsubscribe = null;
    }

    if (captureActive) {
      captureActive = false;
      void Promise.resolve(source.stop()).catch(() => undefined);
    }
  }

  return {
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start,
    pause,
    stop,
    setMode,
    setCalibrationA4,
    setToleranceCents,
    setAutoAdvance,
    setTarget,
    setGuidedTargets,
    advanceTarget,
    clearError,
    destroy,
  };
}

export {
  createNoopTunerInputSource,
  createUnknownPermissionResolver,
  createIdleSignal,
  createTunerTarget,
};
