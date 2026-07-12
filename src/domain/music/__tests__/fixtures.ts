import type {
  BackupManifest,
  BackupPayloadV1,
  ChordShapeDetails,
  ImportedSong,
  SongDocument,
  TuningDetails,
  UserPreferences,
} from "@/types/music";

import {
  midiToFrequency,
  pitchClassToMidi,
} from "@/domain/music/conversions";

export function buildValidTuning(): TuningDetails {
  const makeString = (
    physicalStringNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    stringInCourse: 1 | 2,
    pitchClass: 0 | 2 | 4 | 5 | 7 | 9 | 11,
    octave: number,
  ) => {
    const midiNote = pitchClassToMidi(pitchClass, octave);
    return {
      id: `tuning-string-${physicalStringNumber}`,
      physicalStringNumber,
      stringInCourse,
      pitchClass,
      octave,
      midiNote,
      referenceFrequency440: midiToFrequency(midiNote),
    } as const;
  };

  const makeCourse = (
    courseNumber: 1 | 2 | 3 | 4 | 5,
    physicalStringA: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    physicalStringB: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    pitchClass: 0 | 2 | 4 | 5 | 7 | 9 | 11,
    octave: number,
  ) => ({
    id: `tuning-course-${courseNumber}`,
    courseNumber,
    pairType: "unison" as const,
    strings: [
      makeString(physicalStringA, 1, pitchClass, octave),
      makeString(physicalStringB, 2, pitchClass, octave),
    ] as const,
  });

  return {
    id: "catalog-tuning-c",
    origin: "catalog",
    name: "Viola em C",
    shortName: "C",
    aliases: ["Cebolão", "Cebolão em C"],
    description: "Afinação base para validação de domínio.",
    courses: [
      makeCourse(1, 1, 2, 7, 4),
      makeCourse(2, 3, 4, 2, 3),
      makeCourse(3, 5, 6, 4, 3),
      makeCourse(4, 7, 8, 5, 3),
      makeCourse(5, 9, 10, 7, 2),
    ],
    verificationStatus: "verified",
    tensionWarning: null,
  };
}

export function buildValidChordShape(): ChordShapeDetails {
  const positions = Array.from({ length: 10 }, (_, index) => {
    const physicalStringNumber = (index + 1) as
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

    const courseNumber = Math.ceil((index + 1) / 2) as 1 | 2 | 3 | 4 | 5;
    const stringInCourse = ((index % 2) + 1) as 1 | 2;

    return {
      physicalStringNumber,
      courseNumber,
      stringInCourse,
      fret: 0,
      finger: null,
      pitchClass: null,
      octave: null,
      intervalLabel: null,
    } as const;
  });

  return {
    id: "shape-c-major",
    origin: "catalog",
    chord: {
      rootPitchClass: 0,
      qualityId: "major",
      bassPitchClass: null,
    },
    tuning: {
      type: "tuning",
      origin: "catalog",
      id: "catalog-tuning-c",
    },
    positions,
    barres: [
      {
        fret: 1,
        fromPhysicalString: 1,
        toPhysicalString: 5,
        finger: "1",
      },
    ],
    difficulty: "easy",
    verificationStatus: "verified",
    isRecommended: true,
  };
}

export function buildValidSongDocument(): SongDocument {
  return {
    version: 1,
    sections: [
      {
        id: "section-intro",
        type: "intro",
        label: "Intro",
        repeatCount: 1,
        lines: [
          {
            id: "line-lyrics",
            type: "lyrics",
            segments: [
              {
                id: "segment-text-1",
                type: "text",
                text: "Meu canto",
              },
              {
                id: "segment-chord-1",
                type: "chord",
                chord: {
                  rootPitchClass: 0,
                  qualityId: "major",
                  bassPitchClass: null,
                  originalSpelling: "C",
                  harmonicDegree: "I",
                },
                anchorOffset: 0,
              },
            ],
          },
        ],
      },
    ],
  };
}

export function buildValidPreferences(): UserPreferences {
  return {
    app: {
      id: "app_preferences",
      activeTuningOrigin: "catalog",
      activeTuningId: "catalog-tuning-c",
      accidentalPreference: "contextual",
      handedness: "right",
      diagramOrientation: "standard",
      diagramMode: "five_courses",
      showCalculatedShapes: true,
      expandTheoryDetails: false,
      locale: "pt-BR",
      updatedAt: "2026-07-12T12:00:00.000Z",
    },
    appearance: {
      id: "appearance_preferences",
      themeMode: "system",
      highContrast: false,
      internalTextScale: "system",
      reduceDecorativeTextures: true,
      updatedAt: "2026-07-12T12:00:00.000Z",
    },
    tuner: {
      id: "tuner_preferences",
      calibrationA4: 440,
      toleranceCents: 5,
      autoAdvance: true,
      vibrateWhenInTune: false,
      keepScreenAwake: true,
      showFrequency: true,
      noiseFilterLevel: "medium",
      lastMode: "guided",
      updatedAt: "2026-07-12T12:00:00.000Z",
    },
    audio: {
      id: "audio_preferences",
      referenceVolume: 0.7,
      metronomeVolume: 0.5,
      firstBeatAccent: true,
      spokenCountIn: false,
      hapticsEnabled: true,
      confirmationSoundsEnabled: false,
      updatedAt: "2026-07-12T12:00:00.000Z",
    },
    stage: {
      id: "stage_preferences",
      keepScreenAwake: true,
      autoHideControls: false,
      tapToPause: true,
      defaultScrollSpeed: 1.2,
      defaultFontScale: 1.1,
      preferredOrientation: "portrait",
      forceHighContrast: false,
      lockControlsOnStart: true,
      updatedAt: "2026-07-12T12:00:00.000Z",
    },
    metronome: {
      id: "metronome_preferences",
      lastBpm: 96,
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
      accentFirstBeat: true,
      countInBars: 2,
      visualPulseEnabled: true,
      updatedAt: "2026-07-12T12:00:00.000Z",
    },
  };
}

export function buildValidBackupManifest(): BackupManifest {
  return {
    format: "cifras-de-viola-backup",
    formatVersion: 1,
    appVersion: "0.1.0",
    schemaVersion: 1,
    catalogVersion: 1,
    createdAt: "2026-07-12T12:00:00.000Z",
    devicePlatform: "unknown",
    sections: [
      {
        name: "profile",
        itemCount: 1,
        included: true,
      },
      {
        name: "preferences",
        itemCount: 1,
        included: true,
      },
    ],
    checksumAlgorithm: "sha256",
    payloadChecksum: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  };
}

export function buildValidBackupPayload(): BackupPayloadV1 {
  return {
    profile: {
      id: "local_user",
      experienceLevel: "intermediate",
      onboardingStatus: "completed",
      onboardingStep: null,
      createdAt: "2026-07-12T12:00:00.000Z",
      updatedAt: "2026-07-12T12:00:00.000Z",
    },
    preferences: buildValidPreferences(),
    songs: [
      {
        id: "song-1",
        title: "Meu canto",
      },
    ],
    tunings: [
      {
        id: "catalog-tuning-c",
        name: "Viola em C",
      },
    ],
    songPreferences: [
      {
        id: "song-preference-1",
        songOrigin: "catalog",
        songId: "song-1",
        rememberedKeyPitchClass: 0,
        rememberedKeyMode: "major",
        rememberKey: true,
        lastScrollPosition: 0,
        stageFontScale: 1,
        stageScrollSpeed: 1,
        preferredArrangementId: null,
        preferredShapeOverridesJson: null,
        lastOpenedAt: "2026-07-12T12:00:00.000Z",
        updatedAt: "2026-07-12T12:00:00.000Z",
      },
    ],
  };
}

export function buildValidImportedSong(): ImportedSong {
  return {
    title: "Meu canto",
    artist: "Artista de teste",
    composer: "Compositor de teste",
    sourceName: "Importação manual",
    notes: "Cifra criada para validar o parser.",
    document: buildValidSongDocument(),
  };
}
