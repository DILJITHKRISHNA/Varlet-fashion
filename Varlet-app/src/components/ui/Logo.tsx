import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md';
  showWordmark?: boolean;
}

export default function Logo({ size = 'md', showWordmark = true }: LogoProps) {
  const { colors, borderRadius, fonts } = useTheme();
  const boxSize = size === 'sm' ? 32 : 36;
  const fontSize = size === 'sm' ? 16 : 18;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.mark,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: borderRadius.lg,
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Text style={[styles.letter, { fontSize, fontFamily: fonts.semiBold, color: colors.primaryForeground }]}>
          V
        </Text>
      </View>
      {showWordmark && (
        <Text style={[styles.wordmark, { color: colors.foreground, fontFamily: fonts.semiBold }]}>
          Varlet
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  mark: { alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  letter: { fontWeight: '600' },
  wordmark: { fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
});
