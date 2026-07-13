import type {
  AudioSessionController,
  AudioSessionOwner,
  AudioSessionStopReason,
} from "@/types/audio";

export interface AudioSessionOwnerProfile {
  readonly owner: AudioSessionOwner;
  readonly label: string;
  readonly requiresMicrophone: boolean;
  readonly requiresOutputAudio: boolean;
}

export const AUDIO_SESSION_OWNER_ORDER = ["tuner", "metronome", "reference", "chord", "rhythm_demo"] as const;

export const AUDIO_SESSION_OWNER_PROFILES: Readonly<Record<AudioSessionOwner, AudioSessionOwnerProfile>> = {
  tuner: {
    owner: "tuner",
    label: "Afinador",
    requiresMicrophone: true,
    requiresOutputAudio: false,
  },
  metronome: {
    owner: "metronome",
    label: "Metrônomo",
    requiresMicrophone: false,
    requiresOutputAudio: true,
  },
  reference: {
    owner: "reference",
    label: "Som de referência",
    requiresMicrophone: false,
    requiresOutputAudio: true,
  },
  chord: {
    owner: "chord",
    label: "Áudio de acordes",
    requiresMicrophone: false,
    requiresOutputAudio: true,
  },
  rhythm_demo: {
    owner: "rhythm_demo",
    label: "Demonstração de ritmo",
    requiresMicrophone: false,
    requiresOutputAudio: true,
  },
};

export function isAudioSessionOwner(value: string): value is AudioSessionOwner {
  return (AUDIO_SESSION_OWNER_ORDER as readonly string[]).includes(value);
}

export function describeAudioSessionOwner(owner: AudioSessionOwner): string {
  return AUDIO_SESSION_OWNER_PROFILES[owner].label;
}

export function isAudioSessionOwnerCompatible(currentOwner: AudioSessionOwner | null, nextOwner: AudioSessionOwner): boolean {
  return currentOwner === null || currentOwner === nextOwner;
}

export function createNoopAudioSessionController(): AudioSessionController {
  const resolve = (): Promise<void> => Promise.resolve();

  return {
    activate: () => resolve(),
    pause: (_owner: AudioSessionOwner, _reason: AudioSessionStopReason) => resolve(),
    release: (_owner: AudioSessionOwner, _reason: AudioSessionStopReason) => resolve(),
  };
}
