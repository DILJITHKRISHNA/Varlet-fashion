import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type BadgeVariant = 'success' | 'accent' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export default function Badge({ label, variant = 'success' }: BadgeProps) {
  const { colors, borderRadius, fonts } = useTheme();

  const bg =
    variant === 'success' ? colors.successSoft
    : variant === 'accent' ? colors.accentSoft
    : colors.secondary;

  const fg =
    variant === 'success' ? colors.success
    : variant === 'accent' ? colors.accent
    : colors.foregroundMuted;

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderRadius: borderRadius.full }]}>
      <Text style={[styles.text, { color: fg, fontFamily: fonts.medium }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '600' },
});
