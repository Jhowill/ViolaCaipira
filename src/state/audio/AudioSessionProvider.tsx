import type { PropsWithChildren } from "react";
import { useMemo } from "react";

import { createAudioSessionCoordinator } from "@/services/audioSessionCoordinator";
import { createNoopAudioSessionController } from "@/services/audioService";
import { AudioSessionContext } from "@/state/audio/context";
import type { AudioSessionCoordinator } from "@/types/audio";

let defaultCoordinator: AudioSessionCoordinator | null = null;

function getDefaultCoordinator(): AudioSessionCoordinator {
  if (defaultCoordinator === null) {
    defaultCoordinator = createAudioSessionCoordinator({
      controller: createNoopAudioSessionController(),
    });
  }

  return defaultCoordinator;
}

export interface AudioSessionProviderProps extends PropsWithChildren {
  readonly coordinator?: AudioSessionCoordinator;
}

export function AudioSessionProvider({ children, coordinator }: AudioSessionProviderProps) {
  const value = useMemo(() => coordinator ?? getDefaultCoordinator(), [coordinator]);

  return <AudioSessionContext.Provider value={value}>{children}</AudioSessionContext.Provider>;
}
