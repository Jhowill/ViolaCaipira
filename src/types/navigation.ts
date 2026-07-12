import type { Href } from "expo-router";

export type MainTabRouteName = "index" | "songs" | "chords" | "tuner" | "studies";

export interface TabNavigationItem {
  readonly name: MainTabRouteName;
  readonly label: string;
  readonly href: Href;
  readonly accessibilityLabel: string;
  readonly icon: string;
}

export interface SafeNavigationState {
  readonly pathname: string;
  readonly segments: readonly string[];
  readonly isInTabsGroup: boolean;
  readonly canGoBack: boolean;
  readonly canDismiss: boolean;
}

export interface SafeNavigationActions {
  readonly back: () => void;
  readonly safeBack: (fallbackHref?: Href) => void;
  readonly goHome: () => void;
}

export interface SafeNavigation extends SafeNavigationState, SafeNavigationActions {
  readonly push: (href: Href) => void;
  readonly replace: (href: Href) => void;
  readonly navigate: (href: Href) => void;
  readonly dismiss: (count?: number) => void;
  readonly dismissTo: (href: Href) => void;
  readonly dismissAll: () => void;
  readonly reload: () => void;
  readonly prefetch: (href: Href) => void;
  readonly setParams: (params?: Record<string, undefined | string | number | (string | number)[]>) => void;
}
