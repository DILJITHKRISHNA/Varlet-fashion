import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface SearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Search styles, shops...', ...rest }: SearchBarProps) {
  const { colors, borderRadius, fonts } = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.muted, borderRadius: borderRadius['2xl'] }]}>
      <Search size={16} color={colors.foregroundMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.foregroundMuted}
        style={[styles.input, { color: colors.foreground, fontFamily: fonts.regular }]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
});
