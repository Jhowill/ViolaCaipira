export interface SemanticColors {
  readonly background: string;
  readonly backgroundSubtle: string;
  readonly surface: string;
  readonly surfaceRaised: string;
  readonly surfaceMuted: string;
  readonly surfaceStrong: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly textDisabled: string;
  readonly textInverse: string;
  readonly primary: string;
  readonly primaryPressed: string;
  readonly primarySoft: string;
  readonly onPrimary: string;
  readonly accent: string;
  readonly accentPressed: string;
  readonly accentSoft: string;
  readonly border: string;
  readonly borderStrong: string;
  readonly divider: string;
  readonly overlay: string;
  readonly focusRing: string;
  readonly success: string;
  readonly successSoft: string;
  readonly warning: string;
  readonly warningSoft: string;
  readonly danger: string;
  readonly dangerSoft: string;
  readonly info: string;
  readonly infoSoft: string;
  readonly verified: string;
  readonly verifiedSoft: string;
  readonly calculated: string;
  readonly calculatedSoft: string;
  readonly userContent: string;
  readonly userContentSoft: string;
  readonly premium: string;
  readonly premiumSoft: string;
}

export const brandColors = {
  green: {
    900: '#123B2D',
    800: '#174936',
    700: '#1F5A45',
    600: '#2B6D55',
    500: '#3C8067',
    300: '#79B99C',
    100: '#DCEDE4',
  },
  copper: {
    800: '#7A3812',
    700: '#8F4515',
    600: '#A9581E',
    500: '#B96A2B',
    300: '#D39B62',
    100: '#F3E1CE',
  },
  straw: {
    500: '#D8B56A',
    200: '#EEDFB7',
  },
  wood: {
    800: '#4A2D20',
    600: '#704633',
    300: '#B88B70',
  },
} as const;

export const lightColors = {
  background: '#F7F3EA',
  backgroundSubtle: '#F1EBDD',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFCF7',
  surfaceMuted: '#EFE7D8',
  surfaceStrong: '#E4DAC7',
  textPrimary: '#1F241F',
  textSecondary: '#4E5851',
  textMuted: '#68706A',
  textDisabled: '#929993',
  textInverse: '#FFFFFF',
  primary: '#1F5A45',
  primaryPressed: '#174936',
  primarySoft: '#DCEDE4',
  onPrimary: '#FFFFFF',
  accent: '#A9581E',
  accentPressed: '#8F4515',
  accentSoft: '#F3E1CE',
  border: '#D7CCB8',
  borderStrong: '#B9AB94',
  divider: '#E3DACB',
  overlay: 'rgba(18, 25, 20, 0.52)',
  focusRing: '#2B6D55',
  success: '#2F704E',
  successSoft: '#DDEDE4',
  warning: '#9A5A12',
  warningSoft: '#F7E8CE',
  danger: '#A43A3A',
  dangerSoft: '#F5DEDE',
  info: '#356C8C',
  infoSoft: '#DDEAF1',
  verified: '#2F704E',
  verifiedSoft: '#DDEDE4',
  calculated: '#8A6417',
  calculatedSoft: '#F5E9C9',
  userContent: '#6B568F',
  userContentSoft: '#EAE3F3',
  premium: '#865A13',
  premiumSoft: '#F2E5C8',
} as const satisfies SemanticColors;

export const darkColors = {
  background: '#111511',
  backgroundSubtle: '#151B16',
  surface: '#1B221C',
  surfaceRaised: '#222B23',
  surfaceMuted: '#283229',
  surfaceStrong: '#323D33',
  textPrimary: '#F2F5F1',
  textSecondary: '#CBD3CC',
  textMuted: '#AEB8B0',
  textDisabled: '#727D74',
  textInverse: '#111511',
  primary: '#79B99C',
  primaryPressed: '#5E9E81',
  primarySoft: '#233B30',
  onPrimary: '#111511',
  accent: '#D39B62',
  accentPressed: '#B97E47',
  accentSoft: '#422C1F',
  border: '#3B473D',
  borderStrong: '#566359',
  divider: '#303A31',
  overlay: 'rgba(0, 0, 0, 0.68)',
  focusRing: '#9BCFB7',
  success: '#7DC69D',
  successSoft: '#1E3829',
  warning: '#E0AE61',
  warningSoft: '#3A2D1D',
  danger: '#E58989',
  dangerSoft: '#3B2222',
  info: '#80B8D3',
  infoSoft: '#1C303B',
  verified: '#7DC69D',
  verifiedSoft: '#1E3829',
  calculated: '#E0C06A',
  calculatedSoft: '#38321E',
  userContent: '#BBA2DF',
  userContentSoft: '#30263E',
  premium: '#E3BC70',
  premiumSoft: '#3B301E',
} as const satisfies SemanticColors;

export const highContrastLightColors = {
  background: '#FFFFFF',
  backgroundSubtle: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceMuted: '#F2F2F2',
  surfaceStrong: '#E2E2E2',
  textPrimary: '#000000',
  textSecondary: '#111111',
  textMuted: '#242424',
  textDisabled: '#404040',
  textInverse: '#FFFFFF',
  primary: '#004B35',
  primaryPressed: '#002D20',
  primarySoft: '#D6F5E7',
  onPrimary: '#FFFFFF',
  accent: '#6B2C00',
  accentPressed: '#421B00',
  accentSoft: '#FFE4CC',
  border: '#000000',
  borderStrong: '#000000',
  divider: '#000000',
  overlay: 'rgba(0, 0, 0, 0.82)',
  focusRing: '#005FCC',
  success: '#005A2B',
  successSoft: '#D9F7E6',
  warning: '#6A3A00',
  warningSoft: '#FFF0C2',
  danger: '#870000',
  dangerSoft: '#FFE0E0',
  info: '#004D73',
  infoSoft: '#DDF3FF',
  verified: '#005A2B',
  verifiedSoft: '#D9F7E6',
  calculated: '#5C4300',
  calculatedSoft: '#FFF1B8',
  userContent: '#452070',
  userContentSoft: '#F0E2FF',
  premium: '#553600',
  premiumSoft: '#FFEAB8',
} as const satisfies SemanticColors;

export const highContrastDarkColors = {
  background: '#000000',
  backgroundSubtle: '#000000',
  surface: '#000000',
  surfaceRaised: '#080808',
  surfaceMuted: '#151515',
  surfaceStrong: '#242424',
  textPrimary: '#FFFFFF',
  textSecondary: '#FFFFFF',
  textMuted: '#F2F2F2',
  textDisabled: '#D0D0D0',
  textInverse: '#000000',
  primary: '#8FF0C4',
  primaryPressed: '#B8FFDD',
  primarySoft: '#123B2B',
  onPrimary: '#000000',
  accent: '#FFD09A',
  accentPressed: '#FFE2BF',
  accentSoft: '#4A270D',
  border: '#FFFFFF',
  borderStrong: '#FFFFFF',
  divider: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.92)',
  focusRing: '#7CC4FF',
  success: '#9BFFC2',
  successSoft: '#12331F',
  warning: '#FFD37A',
  warningSoft: '#3B2A08',
  danger: '#FF9B9B',
  dangerSoft: '#3D1111',
  info: '#9CDFFF',
  infoSoft: '#0D2D3D',
  verified: '#9BFFC2',
  verifiedSoft: '#12331F',
  calculated: '#FFE082',
  calculatedSoft: '#3D3308',
  userContent: '#D7B7FF',
  userContentSoft: '#2D1745',
  premium: '#FFD98F',
  premiumSoft: '#3A2B0B',
} as const satisfies SemanticColors;
