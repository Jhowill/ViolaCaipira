import { createNoopAudioSessionController, isAudioSessionOwnerCompatible } from "@/services/audioService";
import type {
  AudioSessionController,
  AudioSessionCoordinator,
  AudioSessionOwner,
  AudioSessionRequestOptions,
  AudioSessionRequestResult,
  AudioSessionState,
  AudioSessionStopReason,
} from "@/types/audio";

export interface AudioSessionCoordinatorOptions {
  readonly controller?: AudioSessionController;
  readonly now?: () => Date;
}

function createState(now: () => Date): AudioSessionState {
  return {
    status: "idle",
    activeOwner: null,
    lastOwner: null,
    lastStopReason: null,
    pendingOwner: null,
    confirmationRequired: false,
    revision: 0,
    updatedAt: now().toISOString(),
  };
}

function advanceState(
  current: AudioSessionState,
  now: () => Date,
  changes: Partial<Omit<AudioSessionState, "revision" | "updatedAt">>,
): AudioSessionState {
  return {
    ...current,
    ...changes,
    revision: current.revision + 1,
    updatedAt: now().toISOString(),
  };
}

function buildRequestResult(
  state: AudioSessionState,
  requestedOwner: AudioSessionOwner,
  granted: boolean,
  requiresConfirmation: boolean,
  reason: AudioSessionRequestResult["reason"],
): AudioSessionRequestResult {
  return {
    granted,
    requiresConfirmation,
    state,
    requestedOwner,
    activeOwner: state.activeOwner,
    reason,
  };
}

export function createAudioSessionCoordinator(
  options: AudioSessionCoordinatorOptions = {},
): AudioSessionCoordinator {
  const controller = options.controller ?? createNoopAudioSessionController();
  const now = options.now ?? (() => new Date());
  const listeners = new Set<() => void>();
  let state = createState(now);
  let disposed = false;

  function assertActive(): void {
    if (disposed) {
      throw new Error("Audio session coordinator has been destroyed.");
    }
  }

  function emit(): void {
    listeners.forEach((listener) => {
      listener();
    });
  }

  async function activateOwner(owner: AudioSessionOwner): Promise<AudioSessionState> {
    await controller.activate(owner);
    state = advanceState(state, now, {
      status: "active",
      activeOwner: owner,
      lastStopReason: null,
      pendingOwner: null,
      confirmationRequired: false,
    });
    emit();
    return state;
  }

  async function stopActiveOwner(
    reason: AudioSessionStopReason,
    nextStatus: "idle" | "suspended",
  ): Promise<AudioSessionState> {
    const currentOwner = state.activeOwner;
    if (currentOwner === null) {
      state = advanceState(state, now, {
        status: nextStatus,
        pendingOwner: null,
        confirmationRequired: false,
        lastStopReason: reason,
      });
      emit();
      return state;
    }

    await controller.pause(currentOwner, reason);
    await controller.release(currentOwner, reason);
    state = advanceState(state, now, {
      status: nextStatus,
      activeOwner: null,
      lastOwner: currentOwner,
      lastStopReason: reason,
      pendingOwner: null,
      confirmationRequired: false,
    });
    emit();
    return state;
  }

  async function requestSession(
    owner: AudioSessionOwner,
    requestOptions: AudioSessionRequestOptions = {},
  ): Promise<AudioSessionRequestResult> {
    assertActive();

    if (state.activeOwner === owner && state.status === "active") {
      return buildRequestResult(state, owner, true, false, "already_active");
    }

    if (state.activeOwner === null) {
      const nextState = await activateOwner(owner);
      return buildRequestResult(nextState, owner, true, false, "started");
    }

    if (!isAudioSessionOwnerCompatible(state.activeOwner, owner)) {
      if (!requestOptions.confirmSwitch) {
        state = advanceState(state, now, {
          pendingOwner: owner,
          confirmationRequired: true,
        });
        emit();
        return buildRequestResult(state, owner, false, true, "confirmation_required");
      }

      const previousOwner = state.activeOwner;
      await stopActiveOwner("switch", "idle");

      try {
        const nextState = await activateOwner(owner);
        return buildRequestResult(nextState, owner, true, false, "switched");
      } catch (error) {
        state = advanceState(state, now, {
          status: "idle",
          activeOwner: null,
          lastOwner: previousOwner,
          lastStopReason: "switch",
          pendingOwner: null,
          confirmationRequired: false,
        });
        emit();
        throw error;
      }
    }

    return buildRequestResult(state, owner, true, false, "already_active");
  }

  async function pauseSession(reason: AudioSessionStopReason = "manual"): Promise<AudioSessionState> {
    assertActive();

    if (state.activeOwner === null) {
      return state;
    }

    const currentOwner = state.activeOwner;
    await controller.pause(currentOwner, reason);
    await controller.release(currentOwner, reason);
    state = advanceState(state, now, {
      status: "suspended",
      activeOwner: null,
      lastOwner: currentOwner,
      lastStopReason: reason,
      pendingOwner: null,
      confirmationRequired: false,
    });
    emit();
    return state;
  }

  async function releaseSession(reason: AudioSessionStopReason = "manual"): Promise<AudioSessionState> {
    assertActive();

    if (state.activeOwner === null) {
      state = advanceState(state, now, {
        status: "idle",
        pendingOwner: null,
        confirmationRequired: false,
        lastStopReason: reason,
      });
      emit();
      return state;
    }

    const currentOwner = state.activeOwner;
    await controller.release(currentOwner, reason);
    state = advanceState(state, now, {
      status: "idle",
      activeOwner: null,
      lastOwner: currentOwner,
      lastStopReason: reason,
      pendingOwner: null,
      confirmationRequired: false,
    });
    emit();
    return state;
  }

  async function handleBackground(): Promise<AudioSessionState> {
    assertActive();

    if (state.activeOwner === null) {
      state = advanceState(state, now, {
        status: "idle",
        pendingOwner: null,
        confirmationRequired: false,
        lastStopReason: "background",
      });
      emit();
      return state;
    }

    const currentOwner = state.activeOwner;
    await controller.pause(currentOwner, "background");
    await controller.release(currentOwner, "background");
    state = advanceState(state, now, {
      status: "suspended",
      activeOwner: null,
      lastOwner: currentOwner,
      lastStopReason: "background",
      pendingOwner: null,
      confirmationRequired: false,
    });
    emit();
    return state;
  }

  async function handleInterruption(reason: "call" | "alarm"): Promise<AudioSessionState> {
    assertActive();

    if (state.activeOwner === null) {
      state = advanceState(state, now, {
        status: "idle",
        pendingOwner: null,
        confirmationRequired: false,
        lastStopReason: reason,
      });
      emit();
      return state;
    }

    const currentOwner = state.activeOwner;
    await controller.pause(currentOwner, reason);
    await controller.release(currentOwner, reason);
    state = advanceState(state, now, {
      status: "suspended",
      activeOwner: null,
      lastOwner: currentOwner,
      lastStopReason: reason,
      pendingOwner: null,
      confirmationRequired: false,
    });
    emit();
    return state;
  }

  async function handleExit(): Promise<AudioSessionState> {
    assertActive();

    if (state.activeOwner === null) {
      state = advanceState(state, now, {
        status: "idle",
        pendingOwner: null,
        confirmationRequired: false,
        lastStopReason: "exit",
      });
      emit();
      return state;
    }

    const currentOwner = state.activeOwner;
    await controller.pause(currentOwner, "exit");
    await controller.release(currentOwner, "exit");
    state = advanceState(state, now, {
      status: "idle",
      activeOwner: null,
      lastOwner: currentOwner,
      lastStopReason: "exit",
      pendingOwner: null,
      confirmationRequired: false,
    });
    emit();
    return state;
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function destroy(): void {
    const currentOwner = state.activeOwner;
    disposed = true;
    listeners.clear();

    if (currentOwner !== null) {
      void controller.pause(currentOwner, "exit")
        .then(() => controller.release(currentOwner, "exit"))
        .catch(() => undefined);
    }
  }

  return {
    getState: () => state,
    subscribe,
    requestSession,
    pauseSession,
    releaseSession,
    handleBackground,
    handleInterruption,
    handleExit,
    destroy,
  };
}
