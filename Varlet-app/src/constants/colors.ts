/**
 * Varlet Design Tokens
 * Mirrors the Varlet-fashion web app's CSS custom properties exactly.
 * Extend this file to add new tokens — never hard-code colors in components.
 */

export const palette = {
  // Brand
  accent: '#FF6B35',
  accentDark: '#E85A28',
  accentSoft: '#FFF0EA',

  // Neutral
  black: '#0F0F0F',
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic
  success: '#10B981',
  successSoft: '#D1FAE5',
  destructive: '#EF4444',
  destructiveSoft: '#FEE2E2',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
} as const;

export const lightColors = {
  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: '#F9FAFB',
  card: palette.white,

  foreground: palette.gray900,
  foregroundMuted: palette.gray500,
  foregroundSubtle: palette.gray400,

  primary: palette.black,
  primaryForeground: palette.white,

  secondary: '#F3F4F6',
  secondaryForeground: palette.gray900,

  muted: '#F3F4F6',
  mutedForeground: palette.gray500,

  accent: palette.accent,
  accentForeground: palette.white,
  accentSoft: palette.accentSoft,

  success: palette.success,
  successForeground: palette.white,
  successSoft: palette.successSoft,

  destructive: palette.destructive,
  destructiveForeground: palette.white,
  destructiveSoft: palette.destructiveSoft,

  border: palette.gray200,
  input: palette.gray200,
  ring: `${palette.accent}66`,

  // Gradients (used as arrays in LinearGradient)
  gradientAccent: ['#FF6B35', '#E85A28'] as [string, string],
  gradientDark: ['#1F2937', '#111827'] as [string, string],
  gradientSurface: ['#FFFFFF', '#F9FAFB'] as [string, string],
} as const;

export const darkColors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#262626',
  card: '#1E1E1E',

  foreground: '#F9FAFB',
  foregroundMuted: '#9CA3AF',
  foregroundSubtle: '#6B7280',

  primary: '#F9FAFB',
  primaryForeground: '#111827',

  secondary: '#2A2A2A',
  secondaryForeground: '#F9FAFB',

  muted: '#2A2A2A',
  mutedForeground: '#9CA3AF',

  accent: '#FF7043',
  accentForeground: '#111827',
  accentSoft: '#3D2419',

  success: palette.success,
  successForeground: palette.white,
  successSoft: '#064E3B',

  destructive: '#F87171',
  destructiveForeground: palette.white,
  destructiveSoft: '#7F1D1D',

  border: 'rgba(255,255,255,0.1)',
  input: 'rgba(255,255,255,0.12)',
  ring: `${palette.accent}80`,

  gradientAccent: ['#FF7043', '#E85A28'] as [string, string],
  gradientDark: ['#1E1E1E', '#121212'] as [string, string],
  gradientSurface: ['#1E1E1E', '#121212'] as [string, string],
} as const;

export type ColorScheme = typeof lightColors;
export type ColorKey = keyof ColorScheme;

/**
 * Returns color tokens for the current color scheme.
 * Usage: const colors = getColors(colorScheme);
 */
export function getColors(scheme: 'light' | 'dark'): ColorScheme {
  return scheme === 'dark' ? (darkColors as unknown as ColorScheme) : lightColors;
}
