import type { PitchClass, ScientificPitch, TunerMode } from "@/types/music";

export { TunerMode };

export type TunerCaptureStatus = "idle" | "permission" | "initializing" | "listening" | "paused" | "error";

export type TunerPermissionStatus = "unknown" | "granted" | "denied" | "blocked";

export type TunerSignalQuality = "none" | "weak" | "unstable" | "stable";

export type TunerSignalWeaknessReason =
  | "none"
  | "insufficient_samples"
  | "low_amplitude"
  | "invalid_frequency"
  | "unstable_window";

export type TunerGuidanceInstruction = "wait" | "check_note" | "tighten" | "loosen" | "in_tune";

export interface TunerTarget {
  readonly label: string;
  readonly pitchClass: PitchClass;
  readonly octave: number;
  readonly midiNote: number;
  readonly frequency: number;
  readonly courseNumber?: number;
  readonly stringInCourse?: 1 | 2;
}

export interface TunerFrequencySample {
  readonly frequency: number;
  readonly amplitude: number;
  readonly timestampMs: number;
}

export interface TunerSignalState {
  readonly quality: TunerSignalQuality;
  readonly strength: number;
  readonly sampleCount: number;
  readonly stabilityScore: number;
  readonly weaknessReason: TunerSignalWeaknessReason;
}

export interface TunerAnalysis {
  readonly frequency: number;
  readonly scientificPitch: ScientificPitch;
  readonly noteLabel: string;
  readonly centsFromNearestNote: number;
  readonly centsFromTarget: number | null;
  readonly target: TunerTarget | null;
  readonly signalQuality: Exclude<TunerSignalQuality, "none">;
  readonly signalStrength: number;
  readonly stabilityScore: number;
  readonly sampleCount: number;
  readonly isWeakSignal: boolean;
  readonly isStable: boolean;
  readonly isWithinTolerance: boolean;
  readonly isFarFromTarget: boolean;
  readonly instruction: TunerGuidanceInstruction | null;
  readonly canAdvance: boolean;
}

export interface TunerGuidedProgress {
  readonly targets: readonly TunerTarget[];
  readonly index: number;
  readonly completedCount: number;
  readonly totalCount: number;
  readonly canAdvance: boolean;
  readonly isComplete: boolean;
}

export interface TunerState {
  readonly status: TunerCaptureStatus;
  readonly permissionStatus: TunerPermissionStatus;
  readonly mode: TunerMode;
  readonly calibrationA4: number;
  readonly toleranceCents: number;
  readonly autoAdvance: boolean;
  readonly target: TunerTarget | null;
  readonly guided: TunerGuidedProgress | null;
  readonly signal: TunerSignalState;
  readonly analysis: TunerAnalysis | null;
  readonly error: Error | null;
  readonly revision: number;
  readonly updatedAt: string;
}

export interface TunerPermissionResolver {
  readonly requestPermission: () => Promise<TunerPermissionStatus>;
}

export interface TunerInputSource {
  readonly start: () => Promise<void> | void;
  readonly stop: () => Promise<void> | void;
  readonly subscribe: (listener: (sample: TunerFrequencySample) => void) => () => void;
}

export interface TunerServiceOptions {
  readonly source?: TunerInputSource;
  readonly permissionResolver?: TunerPermissionResolver;
  readonly mode?: TunerMode;
  readonly calibrationA4?: number;
  readonly toleranceCents?: number;
  readonly autoAdvance?: boolean;
  readonly guidedTargets?: readonly TunerTarget[];
  readonly target?: TunerTarget | null;
  readonly sampleWindowSize?: number;
  readonly weakSignalFloor?: number;
  readonly stabilitySpreadCents?: number;
  readonly maxSafeGuidanceCents?: number;
  readonly now?: () => Date;
}

export interface TunerService {
  readonly getState: () => TunerState;
  readonly subscribe: (listener: () => void) => () => void;
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
  readonly destroy: () => void;
}
