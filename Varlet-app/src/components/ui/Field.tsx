import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props extends TextInputProps {
  label: string;
  hint?: string;
}

export default function Field({ label, hint, style, multiline, ...rest }: Props) {
  const { colors, borderRadius, fonts } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.foregroundMuted, fontFamily: fonts.semiBold }]}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.foregroundSubtle}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          {
            color: colors.foreground,
            backgroundColor: colors.surface,
            borderColor: focused ? colors.accent : colors.border,
            borderRadius: borderRadius.xl,
            fontFamily: fonts.regular,
          },
          multiline && styles.multiline,
          style,
        ]}
        {...rest}
      />
      {hint && (
        <Text style={[styles.hint, { color: colors.foregroundSubtle, fontFamily: fonts.regular }]}>
          {hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, marginBottom: 8 },
  input: { borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15 },
  multiline: { minHeight: 84, textAlignVertical: 'top' },
  hint: { fontSize: 12, marginTop: 6 },
});
