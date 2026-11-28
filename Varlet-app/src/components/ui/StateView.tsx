import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

interface Props {
  loading?: boolean;
  error?: string | null;
  icon?: LucideIcon;
  title?: string;
  message?: string;
  action?: { label: string; onPress: () => void };
}

/** Loading, error and empty states, so no screen is ever just blank. */
export default function StateView({ loading, error, icon: Icon, title, message, action }: Props) {
  const { colors, fonts } = useTheme();

  if (loading) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={colors.accent} />
        <Text style={[styles.message, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
          {message ?? 'Loading…'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.box} accessibilityRole={error ? 'alert' : undefined}>
      {Icon && <Icon size={36} color={colors.foregroundSubtle} />}
      <Text style={[styles.title, { color: colors.foreground, fontFamily: fonts.semiBold }]}>
        {error ? (title ?? "Couldn't load this") : title}
      </Text>
      <Text style={[styles.message, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
        {error ?? message}
      </Text>
      {action && (
        <Button label={action.label} variant="outline" onPress={action.onPress} style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 10 },
  title: { fontSize: 16, textAlign: 'center' },
  message: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  action: { marginTop: 6 },
});
