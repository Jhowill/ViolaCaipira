import type { TextStyle } from 'react-native';

export type FontPlatform = 'android' | 'ios' | 'web' | 'default';

type AppTextStyle = Readonly<
  Pick<
    TextStyle,
    'fontFamily' | 'fontSize' | 'fontVariant' | 'fontWeight' | 'letterSpacing' | 'lineHeight'
  >
>;

export interface TypographyScale {
  readonly displayLarge: AppTextStyle;
  readonly displayMedium: AppTextStyle;
  readonly headlineLarge: AppTextStyle;
  readonly headlineMedium: AppTextStyle;
  readonly headlineSmall: AppTextStyle;
  readonly titleLarge: AppTextStyle;
  readonly titleMedium: AppTextStyle;
  readonly titleSmall: AppTextStyle;
  readonly bodyLarge: AppTextStyle;
  readonly bodyMedium: AppTextStyle;
  readonly bodySmall: AppTextStyle;
  readonly labelLarge: AppTextStyle;
  readonly labelMedium: AppTextStyle;
  readonly labelSmall: AppTextStyle;
  readonly caption: AppTextStyle;
  readonly micro: AppTextStyle;
  readonly music: {
    readonly chordSymbol: AppTextStyle;
    readonly chordDetail: AppTextStyle;
    readonly tunerNote: AppTextStyle;
    readonly tunerMeasurement: AppTextStyle;
    readonly bpm: AppTextStyle;
    readonly songSmall: AppTextStyle;
    readonly songDefault: AppTextStyle;
    readonly songLarge: AppTextStyle;
    readonly songStage: AppTextStyle;
  };
}

const loadedFamilies = {
  inter: {
    regular: 'Inter-Regular',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  bitter: {
    regular: 'Bitter-Regular',
    semiBold: 'Bitter-SemiBold',
    bold: 'Bitter-Bold',
  },
} as const;

const fallbackFamilies = {
  android: { sans: 'sans-serif', serif: 'serif' },
  ios: { sans: 'System', serif: 'Georgia' },
  web: { sans: 'system-ui', serif: 'Georgia' },
  default: { sans: 'sans-serif', serif: 'serif' },
} as const;

const tabularNumbers: TextStyle['fontVariant'] = ['tabular-nums'];

export function createTypography(
  fontsLoaded: boolean,
  platform: FontPlatform = 'default',
): TypographyScale {
  const fallback = fallbackFamilies[platform];
  const inter = fontsLoaded
    ? loadedFamilies.inter
    : { regular: fallback.sans, semiBold: fallback.sans, bold: fallback.sans };
  const bitter = fontsLoaded
    ? loadedFamilies.bitter
    : { regular: fallback.serif, semiBold: fallback.serif, bold: fallback.serif };

  const style = (
    fontFamily: string,
    fontWeight: TextStyle['fontWeight'],
    fontSize: number,
    lineHeight: number,
    extra?: Pick<TextStyle, 'fontVariant' | 'letterSpacing'>,
  ): AppTextStyle => ({
    fontFamily,
    fontWeight,
    fontSize,
    lineHeight,
    ...extra,
  });

  return {
    displayLarge: style(bitter.bold, '700', 40, 48),
    displayMedium: style(bitter.bold, '700', 34, 42),
    headlineLarge: style(bitter.bold, '700', 30, 38),
    headlineMedium: style(bitter.semiBold, '600', 26, 34),
    headlineSmall: style(inter.bold, '700', 22, 29),
    titleLarge: style(inter.bold, '700', 20, 27),
    titleMedium: style(inter.semiBold, '600', 18, 25),
    titleSmall: style(inter.semiBold, '600', 16, 22),
    bodyLarge: style(inter.regular, '400', 17, 26),
    bodyMedium: style(inter.regular, '400', 15, 23),
    bodySmall: style(inter.regular, '400', 14, 20),
    labelLarge: style(inter.semiBold, '600', 15, 20),
    labelMedium: style(inter.semiBold, '600', 13, 18),
    labelSmall: style(inter.semiBold, '600', 12, 16),
    caption: style(inter.regular, '400', 12, 17),
    micro: style(inter.semiBold, '600', 10, 14, { letterSpacing: 0.3 }),
    music: {
      chordSymbol: style(inter.bold, '700', 24, 30, { fontVariant: tabularNumbers }),
      chordDetail: style(inter.bold, '700', 32, 38, { fontVariant: tabularNumbers }),
      tunerNote: style(inter.bold, '700', 64, 72, { fontVariant: tabularNumbers }),
      tunerMeasurement: style(inter.semiBold, '600', 15, 22, {
        fontVariant: tabularNumbers,
      }),
      bpm: style(inter.bold, '700', 44, 52, { fontVariant: tabularNumbers }),
      songSmall: style(inter.regular, '400', 15, 25),
      songDefault: style(inter.regular, '400', 17, 28),
      songLarge: style(inter.regular, '400', 20, 32),
      songStage: style(inter.regular, '400', 24, 38),
    },
  };
}
