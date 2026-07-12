import type { SemanticColors } from '@/constants/colors';
import type { MotionTokens } from '@/constants/motion';
import type { Radii } from '@/constants/radii';
import type { Spacing } from '@/constants/spacing';
import type { FontPlatform, TypographyScale } from '@/constants/typography';
import type { Dispatch, SetStateAction } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark' | 'highContrast';
export type ResolvedColorScheme = 'light' | 'dark';
export type ThemeName =
  | 'light'
  | 'dark'
  | 'highContrastLight'
  | 'highContrastDark';

export interface AppTheme {
  readonly name: ThemeName;
  readonly colorScheme: ResolvedColorScheme;
  readonly isDark: boolean;
  readonly isHighContrast: boolean;
  readonly colors: SemanticColors;
  readonly spacing: Spacing;
  readonly radii: Radii;
  readonly borderWidth: 1 | 2;
  readonly typography: TypographyScale;
  readonly motion: MotionTokens;
}

export interface ResolveThemeOptions {
  readonly mode: ThemeMode;
  readonly systemColorScheme: ResolvedColorScheme | null | undefined;
  readonly fontsLoaded: boolean;
  readonly reduceMotion: boolean;
  readonly platform?: FontPlatform;
}

export interface AppThemeContextValue {
  readonly theme: AppTheme;
  readonly mode: ThemeMode;
  readonly setMode: Dispatch<SetStateAction<ThemeMode>>;
  readonly fontsLoaded: boolean;
  readonly fontLoadError: Error | null;
}
