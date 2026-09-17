import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Dimensions, StatusBar,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';

const { width, height } = Dimensions.get('window');
const HERO_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800';

export default function WelcomeScreen({ navigation }: any) {
  const { colors, borderRadius, shadow, fonts } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />

      <View style={[styles.nav, { paddingTop: insets.top + 8 }]}>
        <Logo />
      </View>

      <View style={styles.orb} />

      <View style={styles.heroContent}>
        <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.full }]}>
          <Sparkles size={14} color={colors.accent} />
          <Text style={[styles.badgeText, { color: colors.foregroundMuted, fontFamily: fonts.medium }]}>
            Local fashion discovery
          </Text>
        </View>

        <Text style={[styles.headline, { color: colors.foreground, fontFamily: fonts.semiBold }]}>
          Fashion Near You.{'\n'}
          <Text style={{ color: colors.accent }}>Instantly.</Text>
        </Text>

        <Text style={[styles.subtext, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
          Discover oversized tees, cargos, streetwear, Korean fashion, sneakers and more — from real stores around you.
        </Text>

        <Button label="Get Started" onPress={() => navigation.navigate('Register')} fullWidth style={{ marginTop: 24 }} />
        <Button
          label="I already have an account"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
          fullWidth
          style={{ marginTop: 12 }}
        />

        <TouchableOpacity onPress={() => navigation.navigate('AdminLogin')}>
          <Text style={[styles.adminLink, { color: colors.foregroundMuted, fontFamily: fonts.medium }]}>
            Shop Owner / Admin Login →
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.imageCard, { borderRadius: borderRadius['3xl'], backgroundColor: colors.secondary }, shadow.soft]}>
        <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: { paddingHorizontal: 24, paddingBottom: 8 },
  orb: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: width * 0.9,
    height: 280,
    borderRadius: 999,
    backgroundColor: '#FFF0EA',
    opacity: 0.7,
  },
  heroContent: { paddingHorizontal: 24, paddingTop: 16 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    marginBottom: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '500' },
  headline: { fontSize: 40, fontWeight: '600', lineHeight: 44, letterSpacing: -1 },
  subtext: { fontSize: 16, lineHeight: 24, marginTop: 16, maxWidth: 340 },
  adminLink: { fontSize: 13, textAlign: 'center', marginTop: 20 },
  imageCard: {
    marginHorizontal: 24,
    marginTop: 32,
    overflow: 'hidden',
    height: height * 0.42,
  },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
});
