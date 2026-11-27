import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md';
  showWordmark?: boolean;
}

export default function Logo({ size = 'md', showWordmark = true }: LogoProps) {
  const { colors, fonts } = useTheme();
  const boxSize = size === 'sm' ? 32 : 36;
  const fontSize = size === 'sm' ? 16 : 18;

  return (
    <View style={styles.row}>
      <LinearGradient
        colors={colors.gradientAccent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.mark, { width: boxSize, height: boxSize, borderRadius: 12 }]}
      >
        <Text style={{ fontSize, fontFamily: fonts.bold, color: colors.accentForeground }}>V</Text>
      </LinearGradient>
      {showWordmark && (
        <Text style={[styles.wordmark, { color: colors.foreground, fontFamily: fonts.displaySemi }]}>
          Varlet
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  mark: { alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  wordmark: { fontSize: 20, letterSpacing: -0.5 },
});
