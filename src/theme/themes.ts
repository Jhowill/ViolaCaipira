import {
  darkColors,
  highContrastDarkColors,
  highContrastLightColors,
  lightColors,
} from '@/constants/colors';
import { resolveMotionTokens } from '@/constants/motion';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { createTypography } from '@/constants/typography';
import type {
  AppTheme,
  ResolveThemeOptions,
  ResolvedColorScheme,
  ThemeName,
} from '@/types/theme';

export function resolveTheme({
  mode,
  systemColorScheme,
  fontsLoaded,
  reduceMotion,
  platform = 'default',
}: ResolveThemeOptions): AppTheme {
  const isHighContrast = mode === 'highContrast';
  const colorScheme: ResolvedColorScheme =
    mode === 'light' || mode === 'dark' ? mode : (systemColorScheme ?? 'light');
  const isDark = colorScheme === 'dark';

  const name: ThemeName = isHighContrast
    ? isDark
      ? 'highContrastDark'
      : 'highContrastLight'
    : colorScheme;

  const colors = isHighContrast
    ? isDark
      ? highContrastDarkColors
      : highContrastLightColors
    : isDark
      ? darkColors
      : lightColors;

  return {
    name,
    colorScheme,
    isDark,
    isHighContrast,
    colors,
    spacing,
    radii,
    borderWidth: isHighContrast ? 2 : 1,
    typography: createTypography(fontsLoaded, platform),
    motion: resolveMotionTokens(reduceMotion),
  };
}
