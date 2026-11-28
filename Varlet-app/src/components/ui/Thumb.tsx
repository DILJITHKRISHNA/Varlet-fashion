import React, { useState } from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Shirt } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

/** A product or shop picture, with a quiet placeholder when there is none. */
export default function Thumb({ uri, style }: { uri?: string; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const [broken, setBroken] = useState<string | null>(null);
  const show = uri && broken !== uri;

  return (
    <View style={[styles.box, { backgroundColor: colors.surfaceElevated }, style]}>
      {show ? (
        <Image source={{ uri }} style={styles.image} onError={() => setBroken(uri)} />
      ) : (
        <Shirt size={22} color={colors.foregroundSubtle} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
});
