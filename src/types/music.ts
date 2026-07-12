export type PitchClass =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11;

export type DifficultyLevel = "beginner" | "easy" | "intermediate" | "advanced";

export type ContentOrigin = "catalog" | "user";

export type Origin = ContentOrigin;

export type VerificationStatus =
  | "verified"
  | "calculated"
  | "user_created"
  | "imported"
  | "deprecated"
  | "draft";

export type AccidentalPreference = "contextual" | "sharps" | "flats";

export type DiagramMode = "five_courses" | "ten_strings";

export type DiagramOrientation = "standard" | "mirrored";

export type Handedness = "right" | "left";

export type PreferenceThemeMode = "system" | "light" | "dark";

export type InternalTextScale = "system" | "large" | "extra_large";

export type NoiseFilterLevel = "low" | "medium" | "high";

export type TunerMode = "guided" | "chromatic" | "reference";

export type PreferredOrientation = "system" | "portrait" | "landscape";

export type SongMode = "major" | "minor" | "modal" | "unknown";

export type ArrangementStatus =
  | "verified"
  | "calculated"
  | "symbols_only"
  | "unavailable";

export type SongChordUsageStatus = "verified" | "calculated" | "symbol_only" | "missing";

export type SongSectionType =
  | "intro"
  | "verse"
  | "pre_chorus"
  | "chorus"
  | "bridge"
  | "solo"
  | "outro"
  | "note"
  | "custom";

export type SongLineType = "lyrics" | "chords" | "tablature" | "instruction" | "blank";

export type SongSegmentType = "text" | "chord" | "tab" | "break";

export type ChordFinger = "1" | "2" | "3" | "4" | "T";

export type PairType = "unison" | "octave" | "custom";

export type TuningCourseNumber = 1 | 2 | 3 | 4 | 5;

export type TuningStringInCourse = 1 | 2;

export type PhysicalStringNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10;

export type TimeSignatureDenominator = 2 | 4 | 8 | 16;

export interface EntityRef<TType extends string = string> {
  readonly type: TType;
  readonly origin: Origin;
  readonly id: string;
}

export interface ScientificPitch {
  readonly pitchClass: PitchClass;
  readonly octave: number;
}

export interface ChordDefinition {
  readonly id?: string;
  readonly rootPitchClass: PitchClass;
  readonly qualityId: string;
  readonly bassPitchClass?: PitchClass | null;
}

export interface ChordStringPosition {
  readonly physicalStringNumber: PhysicalStringNumber;
  readonly courseNumber: TuningCourseNumber;
  readonly stringInCourse: TuningStringInCourse;
  readonly fret: number;
  readonly finger: ChordFinger | null;
  readonly pitchClass: PitchClass | null;
  readonly octave: number | null;
  readonly intervalLabel: string | null;
}

export interface ChordBarre {
  readonly fret: number;
  readonly fromPhysicalString: PhysicalStringNumber;
  readonly toPhysicalString: PhysicalStringNumber;
  readonly finger: ChordFinger;
}

export interface TuningStringDetails {
  readonly id: string;
  readonly physicalStringNumber: PhysicalStringNumber;
  readonly stringInCourse: TuningStringInCourse;
  readonly pitchClass: PitchClass;
  readonly octave: number;
  readonly midiNote: number;
  readonly referenceFrequency440: number;
}

export interface TuningCourseDetails {
  readonly id: string;
  readonly courseNumber: TuningCourseNumber;
  readonly pairType: PairType;
  readonly strings: readonly [TuningStringDetails, TuningStringDetails];
}

export interface TuningDetails {
  readonly id: string;
  readonly origin: Origin;
  readonly name: string;
  readonly shortName: string;
  readonly aliases: readonly string[];
  readonly description?: string | null;
  readonly courses: readonly TuningCourseDetails[];
  readonly verificationStatus: VerificationStatus;
  readonly tensionWarning?: string | null;
}

export interface ChordShapeDetails {
  readonly id: string;
  readonly origin: Origin;
  readonly chord: ChordDefinition;
  readonly tuning: EntityRef<"tuning">;
  readonly positions: readonly ChordStringPosition[];
  readonly barres: readonly ChordBarre[];
  readonly difficulty: DifficultyLevel;
  readonly verificationStatus: VerificationStatus;
  readonly isRecommended: boolean;
}

export interface SongSegmentDocumentText {
  readonly id: string;
  readonly type: "text";
  readonly text: string;
}

export interface SongSegmentDocumentChord {
  readonly id: string;
  readonly type: "chord";
  readonly chord: ChordDefinition & {
    readonly originalSpelling?: string;
    readonly harmonicDegree?: string | null;
  };
  readonly anchorOffset?: number;
}

export interface SongSegmentDocumentTab {
  readonly id: string;
  readonly type: "tab";
  readonly value: string;
}

export interface SongSegmentDocumentBreak {
  readonly id: string;
  readonly type: "break";
}

export type SongSegmentDocument =
  | SongSegmentDocumentText
  | SongSegmentDocumentChord
  | SongSegmentDocumentTab
  | SongSegmentDocumentBreak;

export interface SongLineDocument {
  readonly id: string;
  readonly type: SongLineType;
  readonly segments: readonly SongSegmentDocument[];
}

export interface SongSectionDocument {
  readonly id: string;
  readonly type: SongSectionType;
  readonly label?: string;
  readonly repeatCount?: number;
  readonly lines: readonly SongLineDocument[];
}

export interface SongDocument {
  readonly version: 1;
  readonly sections: readonly SongSectionDocument[];
}

export interface SongChordUsage {
  readonly chord: ChordDefinition;
  readonly occurrenceCount: number;
  readonly preferredShape?: EntityRef<"chord_shape"> | null;
  readonly status: SongChordUsageStatus;
}

export interface SongViewModel {
  readonly ref: EntityRef<"song">;
  readonly title: string;
  readonly artist?: string | null;
  readonly composer?: string | null;
  readonly currentKeyPitchClass: PitchClass | null;
  readonly originalKeyPitchClass: PitchClass | null;
  readonly mode: SongMode;
  readonly tuning: EntityRef<"tuning">;
  readonly arrangementStatus: ArrangementStatus;
  readonly rhythm?:
    | {
        readonly id: string;
        readonly name: string;
        readonly bpm?: number | null;
      }
    | null;
  readonly document: SongDocument;
  readonly chordUsages: readonly SongChordUsage[];
}

export interface UserProfile {
  readonly id: "local_user";
  readonly experienceLevel: "beginner" | "intermediate" | "advanced";
  readonly onboardingStatus: "not_started" | "in_progress" | "completed";
  readonly onboardingStep: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserAppPreferences {
  readonly id: "app_preferences";
  readonly activeTuningOrigin: Origin;
  readonly activeTuningId: string;
  readonly accidentalPreference: AccidentalPreference;
  readonly handedness: Handedness;
  readonly diagramOrientation: DiagramOrientation;
  readonly diagramMode: DiagramMode;
  readonly showCalculatedShapes: boolean;
  readonly expandTheoryDetails: boolean;
  readonly locale: string;
  readonly updatedAt: string;
}

export interface UserAppearancePreferences {
  readonly id: "appearance_preferences";
  readonly themeMode: PreferenceThemeMode;
  readonly highContrast: boolean;
  readonly internalTextScale: InternalTextScale;
  readonly reduceDecorativeTextures: boolean;
  readonly updatedAt: string;
}

export interface UserTunerPreferences {
  readonly id: "tuner_preferences";
  readonly calibrationA4: number;
  readonly toleranceCents: number;
  readonly autoAdvance: boolean;
  readonly vibrateWhenInTune: boolean;
  readonly keepScreenAwake: boolean;
  readonly showFrequency: boolean;
  readonly noiseFilterLevel: NoiseFilterLevel;
  readonly lastMode: TunerMode;
  readonly updatedAt: string;
}

export interface UserAudioPreferences {
  readonly id: "audio_preferences";
  readonly referenceVolume: number;
  readonly metronomeVolume: number;
  readonly firstBeatAccent: boolean;
  readonly spokenCountIn: boolean;
  readonly hapticsEnabled: boolean;
  readonly confirmationSoundsEnabled: boolean;
  readonly updatedAt: string;
}

export interface UserStagePreferences {
  readonly id: "stage_preferences";
  readonly keepScreenAwake: boolean;
  readonly autoHideControls: boolean;
  readonly tapToPause: boolean;
  readonly defaultScrollSpeed: number;
  readonly defaultFontScale: number;
  readonly preferredOrientation: PreferredOrientation;
  readonly forceHighContrast: boolean;
  readonly lockControlsOnStart: boolean;
  readonly updatedAt: string;
}

export interface UserMetronomePreferences {
  readonly id: "metronome_preferences";
  readonly lastBpm: number;
  readonly timeSignatureNumerator: number;
  readonly timeSignatureDenominator: TimeSignatureDenominator;
  readonly accentFirstBeat: boolean;
  readonly countInBars: number;
  readonly visualPulseEnabled: boolean;
  readonly updatedAt: string;
}

export interface UserSongPreference {
  readonly id: string;
  readonly songOrigin: Origin;
  readonly songId: string;
  readonly rememberedKeyPitchClass: PitchClass | null;
  readonly rememberedKeyMode: SongMode | null;
  readonly rememberKey: boolean;
  readonly lastScrollPosition: number;
  readonly stageFontScale: number | null;
  readonly stageScrollSpeed: number | null;
  readonly preferredArrangementId: string | null;
  readonly preferredShapeOverridesJson: string | null;
  readonly lastOpenedAt: string;
  readonly updatedAt: string;
}

export interface UserPreferences {
  readonly app: UserAppPreferences;
  readonly appearance: UserAppearancePreferences;
  readonly tuner: UserTunerPreferences;
  readonly audio: UserAudioPreferences;
  readonly stage: UserStagePreferences;
  readonly metronome: UserMetronomePreferences;
}

export interface BackupSectionManifest {
  readonly name: string;
  readonly itemCount: number;
  readonly included: boolean;
}

export interface BackupManifest {
  readonly format: "cifras-de-viola-backup";
  readonly formatVersion: 1;
  readonly appVersion: string;
  readonly schemaVersion: number;
  readonly catalogVersion: number;
  readonly createdAt: string;
  readonly devicePlatform: "android" | "ios" | "unknown";
  readonly sections: readonly BackupSectionManifest[];
  readonly checksumAlgorithm: "sha256";
  readonly payloadChecksum: string;
}

export type BackupEntityCollection = readonly JsonObject[];

export interface BackupPayloadV1 {
  readonly profile?: UserProfile;
  readonly preferences?: UserPreferences;
  readonly songs?: BackupEntityCollection;
  readonly songVersions?: BackupEntityCollection;
  readonly songNotes?: BackupEntityCollection;
  readonly tunings?: BackupEntityCollection;
  readonly tuningCourses?: BackupEntityCollection;
  readonly tuningStrings?: BackupEntityCollection;
  readonly chordShapes?: BackupEntityCollection;
  readonly favorites?: BackupEntityCollection;
  readonly recentItems?: BackupEntityCollection;
  readonly practiceSessions?: BackupEntityCollection;
  readonly tuningSessions?: BackupEntityCollection;
  readonly tags?: BackupEntityCollection;
  readonly setlists?: BackupEntityCollection;
  readonly songPreferences?: readonly UserSongPreference[];
}

export type BackupPayload = BackupPayloadV1;

export interface ImportedSong {
  readonly title: string;
  readonly artist?: string | null;
  readonly composer?: string | null;
  readonly sourceName?: string | null;
  readonly notes?: string | null;
  readonly document: SongDocument;
}

export type JsonObject = Readonly<Record<string, unknown>>;
