import { AppThemeContext } from '@/theme/context';
import { fontAssets } from '@/theme/fonts';
import { resolveTheme } from '@/theme/themes';
import type { FontPlatform } from '@/constants/typography';
import type { ThemeMode } from '@/types/theme';
import { useFonts } from 'expo-font';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform, useColorScheme } from 'react-native';

export interface AppThemeProviderProps extends PropsWithChildren {
  readonly initialMode?: ThemeMode;
}

export function AppThemeProvider({
  children,
  initialMode = 'system',
}: AppThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fontsLoaded, fontLoadError] = useFonts(fontAssets);

  useEffect(() => {
    let active = true;

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => {
        // Mantém o valor padrão quando a API de acessibilidade não está disponível.
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const platform: FontPlatform =
    Platform.OS === 'android' || Platform.OS === 'ios' || Platform.OS === 'web'
      ? Platform.OS
      : 'default';
  const resolvedSystemColorScheme =
    systemColorScheme === 'dark' || systemColorScheme === 'light' ? systemColorScheme : null;

  const theme = useMemo(
    () =>
      resolveTheme({
        mode,
        systemColorScheme: resolvedSystemColorScheme,
        fontsLoaded: fontsLoaded && fontLoadError === null,
        reduceMotion,
        platform,
      }),
    [fontLoadError, fontsLoaded, mode, platform, reduceMotion, resolvedSystemColorScheme],
  );

  const value = useMemo(
    () => ({
      theme,
      mode,
      setMode,
      fontsLoaded: fontsLoaded && fontLoadError === null,
      fontLoadError,
    }),
    [fontLoadError, fontsLoaded, mode, theme],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}
