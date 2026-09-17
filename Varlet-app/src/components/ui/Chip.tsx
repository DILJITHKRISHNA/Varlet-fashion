import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function Chip({ label, selected = false, onPress, style }: ChipProps) {
  const { colors, borderRadius, fonts } = useTheme();

  const textEl = (
    <Text
      style={[
        styles.text,
        {
          color: selected ? colors.primaryForeground : colors.foreground,
          fontFamily: fonts.medium,
        },
      ]}
    >
      {label}
    </Text>
  );

  const chipStyle = [
    styles.chip,
    {
      backgroundColor: selected ? colors.primary : colors.surface,
      borderColor: selected ? colors.primary : colors.border,
      borderRadius: borderRadius.full,
    },
    style,
  ];

  if (!onPress) {
    return <View style={chipStyle}>{textEl}</View>;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={chipStyle}>
      {textEl}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  text: { fontSize: 12, fontWeight: '500' },
});
