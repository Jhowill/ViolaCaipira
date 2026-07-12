import type { Href } from "expo-router";
import type { TabNavigationItem } from "@/types/navigation";

export const APP_ROUTE_GROUPS = {
  tabs: "/(tabs)",
} as const;

export const APP_ROUTES = {
  home: "/" as const,
  songs: "/songs" as const,
  chords: "/chords" as const,
  tuner: "/tuner" as const,
  studies: "/studies" as const,
  tunings: "/tunings" as const,
  tuningDetail: (tuningId: string) => `/tunings/${tuningId}` as Href,
  songDetail: (songId: string) => `/songs/${songId}` as Href,
  songStage: (songId: string) => `/songs/${songId}/stage` as Href,
  songChords: (songId: string) => `/songs/${songId}/chords` as Href,
  createSong: "/songs/create" as const,
  importSong: "/songs/import" as const,
  chordDetail: (shapeId: string) => `/chords/${shapeId}` as Href,
  tunerGuided: "/tuner/guided" as const,
  tunerChromatic: "/tuner/chromatic" as const,
  tunerReference: "/tuner/reference" as const,
  rhythms: "/rhythms" as const,
  rhythmDetail: (rhythmId: string) => `/rhythms/${rhythmId}` as Href,
  rhythmPractice: (rhythmId: string) => `/rhythms/${rhythmId}/practice` as Href,
  metronome: "/metronome" as const,
  libraryMySongs: "/library/my-songs" as const,
  libraryFavorites: "/library/favorites" as const,
  settings: "/settings" as const,
  settingsBackup: "/settings/backup" as const,
} as const;

export const MAIN_TABS: readonly TabNavigationItem[] = [
  {
    name: "index",
    label: "Início",
    href: APP_ROUTES.home,
    accessibilityLabel: "Abrir tela inicial",
    icon: "⌂",
  },
  {
    name: "songs",
    label: "Cifras",
    href: APP_ROUTES.songs,
    accessibilityLabel: "Abrir lista de cifras",
    icon: "♪",
  },
  {
    name: "chords",
    label: "Acordes",
    href: APP_ROUTES.chords,
    accessibilityLabel: "Abrir lista de acordes",
    icon: "◫",
  },
  {
    name: "tuner",
    label: "Afinador",
    href: APP_ROUTES.tuner,
    accessibilityLabel: "Abrir afinador",
    icon: "◉",
  },
  {
    name: "studies",
    label: "Estudos",
    href: APP_ROUTES.studies,
    accessibilityLabel: "Abrir estudos",
    icon: "✦",
  },
] as const;
