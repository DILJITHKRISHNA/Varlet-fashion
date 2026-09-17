import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  style,
}: ButtonProps) {
  const { colors, borderRadius, shadow, fonts } = useTheme();

  const textStyle: TextStyle = {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.medium,
  };

  if (variant === 'accent') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
        style={[fullWidth && styles.full, style]}
      >
        <LinearGradient
          colors={colors.gradientAccent}
          style={[styles.base, { borderRadius: borderRadius.full }, shadow.glow]}
        >
          <Text style={[textStyle, { color: colors.accentForeground }]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const containerStyle: ViewStyle = {
    ...styles.base,
    borderRadius: borderRadius.full,
    ...(fullWidth && styles.full),
    ...(variant === 'primary' && {
      backgroundColor: colors.primary,
      ...shadow.soft,
    }),
    ...(variant === 'outline' && {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    }),
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    }),
    opacity: disabled ? 0.6 : 1,
  };

  const labelColor =
    variant === 'primary' ? colors.primaryForeground
    : variant === 'ghost' ? colors.primaryForeground
    : colors.foreground;

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85} style={[containerStyle, style]}>
      <Text style={[textStyle, { color: labelColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { width: '100%' },
});
