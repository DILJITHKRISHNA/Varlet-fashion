/**
 * Varlet Typography Scale
 * Mirrors the web app's Inter font usage and text sizes.
 */

import { Platform } from 'react-native';

export const fontFamily = {
  regular: Platform.select({ ios: 'Inter-Regular', android: 'Inter-Regular', default: 'Inter' }),
  medium: Platform.select({ ios: 'Inter-Medium', android: 'Inter-Medium', default: 'Inter' }),
  semiBold: Platform.select({ ios: 'Inter-SemiBold', android: 'Inter-SemiBold', default: 'Inter' }),
  bold: Platform.select({ ios: 'Inter-Bold', android: 'Inter-Bold', default: 'Inter' }),
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
  '5xl': 40,
  '6xl': 48,
} as const;

export const lineHeight = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.625,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const textStyles = {
  displayLarge: { fontSize: fontSize['5xl'], fontFamily: fontFamily.bold, lineHeight: fontSize['5xl'] * lineHeight.tight },
  displayMedium: { fontSize: fontSize['4xl'], fontFamily: fontFamily.semiBold, lineHeight: fontSize['4xl'] * lineHeight.tight },
  displaySmall: { fontSize: fontSize['3xl'], fontFamily: fontFamily.semiBold, lineHeight: fontSize['3xl'] * lineHeight.snug },
  headingLarge: { fontSize: fontSize['2xl'], fontFamily: fontFamily.semiBold, lineHeight: fontSize['2xl'] * lineHeight.snug },
  headingMedium: { fontSize: fontSize.xl, fontFamily: fontFamily.semiBold, lineHeight: fontSize.xl * lineHeight.snug },
  headingSmall: { fontSize: fontSize.lg, fontFamily: fontFamily.semiBold, lineHeight: fontSize.lg * lineHeight.snug },
  bodyLarge: { fontSize: fontSize.md, fontFamily: fontFamily.regular, lineHeight: fontSize.md * lineHeight.normal },
  bodyMedium: { fontSize: fontSize.base, fontFamily: fontFamily.regular, lineHeight: fontSize.base * lineHeight.normal },
  bodySmall: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, lineHeight: fontSize.sm * lineHeight.normal },
  labelLarge: { fontSize: fontSize.base, fontFamily: fontFamily.medium, lineHeight: fontSize.base * lineHeight.normal },
  labelMedium: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, lineHeight: fontSize.sm * lineHeight.normal },
  labelSmall: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, lineHeight: fontSize.xs * lineHeight.normal },
  caption: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, lineHeight: fontSize.xs * lineHeight.normal },
} as const;
