import { useContext, useMemo, useSyncExternalStore } from "react";

import { AudioSessionContext } from "@/state/audio/context";
import { createAudioSessionCoordinator } from "@/services/audioSessionCoordinator";
import { createNoopAudioSessionController } from "@/services/audioService";
import type {
  AudioSessionCoordinator,
  AudioSessionOwner,
  AudioSessionRequestOptions,
  AudioSessionRequestResult,
  AudioSessionState,
  AudioSessionStopReason,
} from "@/types/audio";

let defaultCoordinator: AudioSessionCoordinator | null = null;

function getDefaultCoordinator(): AudioSessionCoordinator {
  if (defaultCoordinator === null) {
    defaultCoordinator = createAudioSessionCoordinator({
      controller: createNoopAudioSessionController(),
    });
  }

  return defaultCoordinator;
}

export interface UseAudioSessionResult {
  readonly state: AudioSessionState;
  readonly requestSession: (
    owner: AudioSessionOwner,
    options?: AudioSessionRequestOptions,
  ) => Promise<AudioSessionRequestResult>;
  readonly pauseSession: (reason?: AudioSessionStopReason) => Promise<AudioSessionState>;
  readonly releaseSession: (reason?: AudioSessionStopReason) => Promise<AudioSessionState>;
  readonly handleBackground: () => Promise<AudioSessionState>;
  readonly handleInterruption: (reason: "call" | "alarm") => Promise<AudioSessionState>;
  readonly handleExit: () => Promise<AudioSessionState>;
}

export function useAudioSession(options: {
  readonly coordinator?: AudioSessionCoordinator;
} = {}): UseAudioSessionResult {
  const contextCoordinator = useContext(AudioSessionContext);
  const coordinator = options.coordinator ?? contextCoordinator ?? getDefaultCoordinator();
  const state = useSyncExternalStore(coordinator.subscribe, coordinator.getState, coordinator.getState);

  return useMemo(
    () => ({
      state,
      requestSession: coordinator.requestSession,
      pauseSession: coordinator.pauseSession,
      releaseSession: coordinator.releaseSession,
      handleBackground: coordinator.handleBackground,
      handleInterruption: coordinator.handleInterruption,
      handleExit: coordinator.handleExit,
    }),
    [coordinator, state],
  );
}
