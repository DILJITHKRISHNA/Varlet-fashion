import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, borderRadius } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius['2xl'] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ card: { padding: 16, borderWidth: 1 } });
