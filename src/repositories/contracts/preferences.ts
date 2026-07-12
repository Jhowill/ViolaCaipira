import type {
  EntityRef,
  UserAppPreferences,
  UserAppearancePreferences,
  UserAudioPreferences,
  UserMetronomePreferences,
  UserPreferences,
  UserStagePreferences,
  UserTunerPreferences,
} from "@/types/music";

export type PreferencesSection = "app" | "appearance" | "audio" | "metronome" | "stage" | "tuner";

export interface PreferencesRepository {
  get(): Promise<UserPreferences>;
  save(preferences: UserPreferences): Promise<UserPreferences>;
  restore(section?: PreferencesSection): Promise<UserPreferences>;
  setActiveTuning(ref: EntityRef<"tuning">): Promise<UserPreferences>;
}

export interface PreferencesDefaultsOptions {
  readonly activeTuning: EntityRef<"tuning">;
  readonly now: string;
}

export function buildDefaultAppPreferences({ activeTuning, now }: PreferencesDefaultsOptions): UserAppPreferences {
  return {
    id: "app_preferences",
    activeTuningOrigin: activeTuning.origin,
    activeTuningId: activeTuning.id,
    accidentalPreference: "contextual",
    handedness: "right",
    diagramOrientation: "standard",
    diagramMode: "five_courses",
    showCalculatedShapes: true,
    expandTheoryDetails: false,
    locale: "pt-BR",
    updatedAt: now,
  };
}

export function buildDefaultAppearancePreferences(now: string): UserAppearancePreferences {
  return {
    id: "appearance_preferences",
    themeMode: "system",
    highContrast: false,
    internalTextScale: "system",
    reduceDecorativeTextures: true,
    updatedAt: now,
  };
}

export function buildDefaultTunerPreferences(now: string): UserTunerPreferences {
  return {
    id: "tuner_preferences",
    calibrationA4: 440,
    toleranceCents: 5,
    autoAdvance: true,
    vibrateWhenInTune: false,
    keepScreenAwake: true,
    showFrequency: true,
    noiseFilterLevel: "medium",
    lastMode: "guided",
    updatedAt: now,
  };
}

export function buildDefaultAudioPreferences(now: string): UserAudioPreferences {
  return {
    id: "audio_preferences",
    referenceVolume: 0.7,
    metronomeVolume: 0.5,
    firstBeatAccent: true,
    spokenCountIn: false,
    hapticsEnabled: true,
    confirmationSoundsEnabled: false,
    updatedAt: now,
  };
}

export function buildDefaultStagePreferences(now: string): UserStagePreferences {
  return {
    id: "stage_preferences",
    keepScreenAwake: true,
    autoHideControls: false,
    tapToPause: true,
    defaultScrollSpeed: 1.2,
    defaultFontScale: 1.1,
    preferredOrientation: "portrait",
    forceHighContrast: false,
    lockControlsOnStart: true,
    updatedAt: now,
  };
}

export function buildDefaultMetronomePreferences(now: string): UserMetronomePreferences {
  return {
    id: "metronome_preferences",
    lastBpm: 96,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    accentFirstBeat: true,
    countInBars: 2,
    visualPulseEnabled: true,
    updatedAt: now,
  };
}

export function buildDefaultPreferences(options: PreferencesDefaultsOptions): UserPreferences {
  return {
    app: buildDefaultAppPreferences(options),
    appearance: buildDefaultAppearancePreferences(options.now),
    tuner: buildDefaultTunerPreferences(options.now),
    audio: buildDefaultAudioPreferences(options.now),
    stage: buildDefaultStagePreferences(options.now),
    metronome: buildDefaultMetronomePreferences(options.now),
  };
}
