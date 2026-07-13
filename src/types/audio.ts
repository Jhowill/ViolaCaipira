export type AudioSessionOwner = "tuner" | "metronome" | "reference" | "chord" | "rhythm_demo";

export type AudioSessionStatus = "idle" | "active" | "suspended";

export type AudioSessionStopReason = "manual" | "switch" | "background" | "call" | "alarm" | "exit";

export interface AudioSessionState {
  readonly status: AudioSessionStatus;
  readonly activeOwner: AudioSessionOwner | null;
  readonly lastOwner: AudioSessionOwner | null;
  readonly lastStopReason: AudioSessionStopReason | null;
  readonly pendingOwner: AudioSessionOwner | null;
  readonly confirmationRequired: boolean;
  readonly revision: number;
  readonly updatedAt: string;
}

export interface AudioSessionRequestOptions {
  readonly confirmSwitch?: boolean;
}

export interface AudioSessionRequestResult {
  readonly granted: boolean;
  readonly requiresConfirmation: boolean;
  readonly state: AudioSessionState;
  readonly requestedOwner: AudioSessionOwner;
  readonly activeOwner: AudioSessionOwner | null;
  readonly reason: "started" | "already_active" | "switched" | "confirmation_required" | "declined" | "stopped";
}

export interface AudioSessionController {
  readonly activate: (owner: AudioSessionOwner) => Promise<void>;
  readonly pause: (owner: AudioSessionOwner, reason: AudioSessionStopReason) => Promise<void>;
  readonly release: (owner: AudioSessionOwner, reason: AudioSessionStopReason) => Promise<void>;
}

export interface AudioSessionCoordinator {
  readonly getState: () => AudioSessionState;
  readonly subscribe: (listener: () => void) => () => void;
  readonly requestSession: (
    owner: AudioSessionOwner,
    options?: AudioSessionRequestOptions,
  ) => Promise<AudioSessionRequestResult>;
  readonly pauseSession: (reason?: AudioSessionStopReason) => Promise<AudioSessionState>;
  readonly releaseSession: (reason?: AudioSessionStopReason) => Promise<AudioSessionState>;
  readonly handleBackground: () => Promise<AudioSessionState>;
  readonly handleInterruption: (reason: "call" | "alarm") => Promise<AudioSessionState>;
  readonly handleExit: () => Promise<AudioSessionState>;
  readonly destroy: () => void;
}
