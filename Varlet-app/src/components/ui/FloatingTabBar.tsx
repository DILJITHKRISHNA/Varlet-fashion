import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

/** Floating pill tab bar: the active tab expands into a gradient capsule. */
export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.bar, { backgroundColor: 'rgba(22,19,26,0.97)', borderColor: colors.border }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : route.name;
          const color = focused ? colors.accentForeground : colors.foregroundMuted;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <Animated.View key={route.key} layout={LinearTransition.springify().damping(18)}>
              <Pressable
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected: focused }}
                style={styles.tab}
              >
                {focused && (
                  <Animated.View entering={FadeIn.duration(250)} style={StyleSheet.absoluteFill}>
                    <LinearGradient
                      colors={colors.gradientAccent}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.capsule}
                    />
                  </Animated.View>
                )}
                <View>{options.tabBarIcon?.({ focused, color, size: 20 })}</View>
                {focused && <Text style={[styles.label, { color, fontFamily: fonts.semiBold }]}>{label}</Text>}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6,
    padding: 7, borderRadius: 999, borderWidth: 1, minWidth: 300,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 14,
  },
  tab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 46, minWidth: 54, paddingHorizontal: 16 },
  capsule: { flex: 1, borderRadius: 999 },
  label: { fontSize: 13 },
});
