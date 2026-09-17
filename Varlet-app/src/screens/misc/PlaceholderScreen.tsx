import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function PlaceholderScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const title: string = route?.params?.title ?? 'Coming Soon';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={[styles.backText, { color: colors.foreground }]}>←</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.sub, { color: colors.foregroundMuted }]}>This screen is coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  back: { marginBottom: 32 },
  backText: { fontSize: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  sub: { fontSize: 15 },
});
