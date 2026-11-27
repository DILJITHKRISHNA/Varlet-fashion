
/**
 * Theme Context
 * Provides colors/typography/spacing to the entire app.
 * Dark only ("Midnight Runway"), the same as the web app.
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
  const colors = getColors('dark');

  const value: ThemeContextValue = {
    colors,
    fonts: fontFamily,
    fontSize,
    textStyles,
    spacing,
    borderRadius,
    shadow,
    layout,
    isDark: true,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
