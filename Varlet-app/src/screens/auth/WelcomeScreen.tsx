import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';
import Glow from '../../components/ui/Glow';

const LOOKS = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600',
];

// Position and tilt of the three runway cards.
const CARDS = [
  { left: 0.02, top: 44, rotate: '-9deg', scale: 0.82 },
  { left: 0.56, top: 60, rotate: '9deg', scale: 0.82 },
  { left: 0.27, top: 8, rotate: '0deg', scale: 1 },
];

export default function WelcomeScreen({ navigation }: any) {
  const { colors, fonts, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const width = Math.min(window.width, 480);
  const cardWidth = width * 0.45;
  const cardHeight = Math.min(cardWidth * 1.45, window.height * 0.34);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Glow color="#FF2E63" size={width * 1.3} style={{ top: -width * 0.45, right: -width * 0.5 }} />
      <Glow color="#FF6B35" size={width * 1.1} duration={8000} style={{ top: window.height * 0.18, left: -width * 0.6 }} />
      <Glow color="#4B23C9" size={width * 1.2} duration={9500} opacity={0.45} style={{ bottom: -width * 0.5, right: -width * 0.4 }} />

      <View style={[styles.inner, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 18 }]}>
        <Logo />

        <View style={[styles.stage, { height: cardHeight + 80, width: width - 48 }]}>
          {CARDS.map((card, i) => (
            <Animated.View
              key={LOOKS[i]}
              entering={FadeInDown.delay(150 + i * 160).springify().damping(15)}
              style={{ position: 'absolute', left: (width - 48) * card.left, top: card.top }}
            >
              <View
                style={[
                  styles.card,
                  {
                    width: cardWidth, height: cardHeight, borderRadius: borderRadius.xl,
                    backgroundColor: colors.surfaceElevated,
                    transform: [{ rotate: card.rotate }, { scale: card.scale }],
                  },
                ]}
              >
                <Image source={{ uri: LOOKS[i] }} style={styles.image} />
                <LinearGradient colors={['transparent', 'rgba(8,7,10,0.65)']} style={StyleSheet.absoluteFill} />
              </View>
            </Animated.View>
          ))}
        </View>

        <View>
          <Animated.Text entering={FadeInUp.delay(450).duration(600)} style={[styles.eyebrow, { color: colors.accent, fontFamily: fonts.semiBold }]}>
            LOCAL FASHION DISCOVERY
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(550).duration(600)} style={[styles.headline, { color: colors.foreground, fontFamily: fonts.display }]}>
            Fashion near you.
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(680).duration(600)} style={[styles.serif, { color: colors.accent, fontFamily: fonts.serif }]}>
            Instantly.
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(780).duration(600)} style={[styles.sub, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
            Streetwear, ethnic, sneakers and more from real stores around you.
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(900).duration(600)}>
            <Button label="Get Started" variant="accent" onPress={() => navigation.navigate('Register')} fullWidth style={{ marginTop: 20 }} />
            <Button label="I already have an account" variant="outline" onPress={() => navigation.navigate('Login')} fullWidth style={{ marginTop: 10 }} />
            <TouchableOpacity onPress={() => navigation.navigate('AdminLogin')} style={styles.adminRow}>
              <Text style={[styles.adminText, { color: colors.foregroundMuted, fontFamily: fonts.medium }]}>
                Shop Owner / Admin Login
              </Text>
              <ArrowRight size={14} color={colors.foregroundMuted} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', width: '100%', maxWidth: 480, alignSelf: 'center' },
  stage: { marginTop: 12 },
  card: { overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  eyebrow: { fontSize: 11, letterSpacing: 3, marginBottom: 10 },
  headline: { fontSize: 36, lineHeight: 42, letterSpacing: -1.2 },
  serif: { fontSize: 52, lineHeight: 56, marginTop: -4 },
  sub: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  adminRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 16 },
  adminText: { fontSize: 13 },
});
