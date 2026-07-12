import { createTypography } from '@/constants/typography';
import { resolveTheme } from '@/theme/themes';
import { describe, expect, it } from 'vitest';

describe('resolveTheme', () => {
  it('usa os fundos oficiais nos temas claro e escuro', () => {
    const light = resolveTheme({
      mode: 'light',
      systemColorScheme: 'dark',
      fontsLoaded: true,
      reduceMotion: false,
    });
    const dark = resolveTheme({
      mode: 'dark',
      systemColorScheme: 'light',
      fontsLoaded: true,
      reduceMotion: false,
    });

    expect(light.colors.background).toBe('#F7F3EA');
    expect(dark.colors.background).toBe('#111511');
  });

  it('acompanha o sistema e ativa a paleta de alto contraste', () => {
    const system = resolveTheme({
      mode: 'system',
      systemColorScheme: 'dark',
      fontsLoaded: true,
      reduceMotion: false,
    });
    const highContrast = resolveTheme({
      mode: 'highContrast',
      systemColorScheme: 'light',
      fontsLoaded: true,
      reduceMotion: false,
    });

    expect(system.name).toBe('dark');
    expect(highContrast.name).toBe('highContrastLight');
    expect(highContrast.borderWidth).toBe(2);
    expect(highContrast.colors.textPrimary).toBe('#000000');
  });

  it('reduz movimento espacial sem remover feedback curto de opacidade', () => {
    const theme = resolveTheme({
      mode: 'light',
      systemColorScheme: 'light',
      fontsLoaded: true,
      reduceMotion: true,
    });

    expect(theme.motion.reduceSpatialMotion).toBe(true);
    expect(theme.motion.duration.fast).toBe(0);
    expect(theme.motion.duration.standard).toBe(120);
  });
});

describe('createTypography', () => {
  it('usa fontes embarcadas e números tabulares para informação musical', () => {
    const typography = createTypography(true);

    expect(typography.bodyMedium.fontFamily).toBe('Inter-Regular');
    expect(typography.headlineMedium.fontFamily).toBe('Bitter-SemiBold');
    expect(typography.music.bpm.fontVariant).toEqual(['tabular-nums']);
  });

  it('usa famílias seguras enquanto as fontes não carregam', () => {
    const typography = createTypography(false, 'android');

    expect(typography.bodyMedium.fontFamily).toBe('sans-serif');
    expect(typography.headlineMedium.fontFamily).toBe('serif');
  });
});
