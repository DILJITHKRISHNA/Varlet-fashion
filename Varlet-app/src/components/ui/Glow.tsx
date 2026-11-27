import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface GlowProps {
  color: string;
  size: number;
  opacity?: number;
  /** How far the light drifts, in points. */
  drift?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

/** A soft, slowly drifting pool of light used behind headers and heroes. */
export default function Glow({
  color, size, opacity = 0.55, drift = 30, duration = 6000, style,
}: GlowProps) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    t.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [duration, reduced, t]);

  const animated = useAnimatedStyle(() => ({
    transform: [
      { translateX: t.value * drift },
      { translateY: t.value * drift * 0.6 },
      { scale: 1 + t.value * 0.18 },
    ],
  }));

  const id = `glow-${color.replace('#', '')}`;

  return (
    <Animated.View pointerEvents="none" style={[styles.base, { width: size, height: size }, style, animated]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { position: 'absolute' },
});
