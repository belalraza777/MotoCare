export const Colors = {
  light: {
    background: '#F7F6F2',
    surface: '#FFFFFF',
    card: '#FFFFFF',

    text: '#181817',
    textSecondary: '#6F6D67',
    textMuted: '#8C8880',

    border: '#E5E2DB',

    primary: '#A9652B',
    primarySoft: '#E8D2B5',

    success: '#22A06B',
    warning: '#D99A00',
    error: '#D64545',
    info: '#3B82F6',

    overlay: 'rgba(24, 24, 23, 0.06)',
  },

  dark: {
    background: '#0F1112',
    surface: '#171A1C',
    card: '#1D2123',

     text: '#F1EFEA',
    textSecondary: '#AAA79F',
    textMuted: '#77756F',

    border: '#2B3032',

    primary: '#C27A3A',
    primarySoft: '#3A2B20',

    success: '#35B77A',
    warning: '#E0A52A',
    error: '#E05A5A',
    info: '#5B9CFF',

    overlay: 'rgba(255, 255, 255, 0.06)',
  },
} as const;

export type ThemeColors = typeof Colors.light | typeof Colors.dark;
export type ThemeName = keyof typeof Colors;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const Typography = {
  fontFamily: 'System',
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 30,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;