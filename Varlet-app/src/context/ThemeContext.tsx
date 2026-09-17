
/**
 * Theme Context
 * Provides colors/typography/spacing to entire app.
 *
 * Pinned to 'light' to match Varlet-fashion (the web app): it defines dark
 * CSS variables but never applies the `.dark` class anywhere, so it always
 * renders light regardless of the visitor's OS preference. Following the
 * device's system scheme here would make the mobile app look inconsistent
 * with — and darker than — the web app. Flip this to follow
 * `useColorScheme()` again once the web app ships a real dark mode toggle.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { getColors, ColorScheme } from '../constants/colors';
import { fontFamily, fontSize, textStyles } from '../constants/typography';
import { spacing, borderRadius, shadow, layout } from '../constants/spacing';

interface ThemeContextValue {
  colors: ColorScheme;
  fonts: typeof fontFamily;
  fontSize: typeof fontSize;
  textStyles: typeof textStyles;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadow: typeof shadow;
  layout: typeof layout;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colors = getColors('light');

  const value: ThemeContextValue = {
    colors,
    fonts: fontFamily,
    fontSize,
    textStyles,
    spacing,
    borderRadius,
    shadow,
    layout,
    isDark: false,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
