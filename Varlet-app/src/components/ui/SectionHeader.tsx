import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeader({ eyebrow, title, subtitle, centered = false }: SectionHeaderProps) {
  const { colors, fonts } = useTheme();

  return (
    <View style={[styles.wrap, centered && styles.centered]}>
      {eyebrow && (
        <Text style={[styles.eyebrow, { color: colors.accent, fontFamily: fonts.medium }]}>
          {eyebrow.toUpperCase()}
        </Text>
      )}
      <Text style={[styles.title, { color: colors.foreground, fontFamily: fonts.semiBold }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  centered: { alignItems: 'center' },
  eyebrow: { fontSize: 12, fontWeight: '500', letterSpacing: 2.8, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '600', letterSpacing: -0.5, lineHeight: 34 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 8 },
});
