import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, RefreshControl, Alert, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Camera, Search } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { getProducts, getOutfits, getCategories } from '../../services/api';
import { getCategoryIcon } from '../../constants/categoryIcons';
import type { Product, Outfit, Category } from '../../services/mockData';
import Logo from '../../components/ui/Logo';
import Chip from '../../components/ui/Chip';
import Glow from '../../components/ui/Glow';
import PressableScale from '../../components/ui/PressableScale';
import SectionHeader from '../../components/ui/SectionHeader';

const GAP = 12;
const BUDGETS = [
  { label: 'All', max: Infinity },
  { label: 'Under ₹999', max: 999 },
  { label: 'Under ₹1,999', max: 1999 },
  { label: 'Under ₹2,999', max: 2999 },
];

export default function FeedScreen({ navigation }: any) {
  const { colors, borderRadius, fonts } = useTheme();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const tileWidth = (window.width - 40 - GAP) / 2;
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState(false);

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const visible = products.filter((p) => p.price <= budget.max);

  const load = useCallback(async () => {
    try {
      const [productData, outfitData, categoryData] = await Promise.all([
        getProducts(),
        getOutfits(),
        getCategories(),
      ]);
      setProducts(productData);
      setOutfits(outfitData);
      setCategories(categoryData);
      setError(false);
    } catch (e) {
      console.warn('Failed to load feed', e);
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Glow color="#FF2E63" size={360} opacity={0.35} style={{ top: -170, right: -150 }} />
      <Glow color="#FF6B35" size={300} opacity={0.28} duration={8000} style={{ top: -120, left: -160 }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 120 }}
      >
        <View style={styles.header}>
          <Logo size="sm" />
          <TouchableOpacity
            accessibilityLabel="Notifications"
            style={[styles.round, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.duration(500)} style={styles.pad}>
          <Text style={[styles.greeting, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>Hi, {firstName}</Text>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: fonts.display }]}>What's your</Text>
          <Text style={[styles.titleSerif, { color: colors.accent, fontFamily: fonts.serif }]}>vibe today?</Text>

          <View style={[styles.search, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.searchTap} onPress={() => navigation.navigate('Search')}>
              <Search size={18} color={colors.accent} />
              <Text style={{ color: colors.foregroundMuted, fontFamily: fonts.regular }}>Search styles and shops</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Search by photo"
              onPress={() => Alert.alert('Photo search', 'Searching by screenshot, reel or post is coming soon.')}
            >
              <LinearGradient colors={colors.gradientAccent} style={styles.camera}>
                <Camera size={18} color={colors.accentForeground} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {categories.map((c, i) => {
              const Icon = getCategoryIcon(c.icon);
              return (
                <Animated.View key={c.id} entering={FadeInRight.delay(i * 60).springify().damping(16)}>
                  <PressableScale style={styles.category} onPress={() => navigation.navigate('Search')}>
                    <View style={[styles.categoryRing, { borderColor: c.color + '80', backgroundColor: c.color + '1F' }]}>
                      <Icon size={22} color={c.color} />
                    </View>
                    <Text numberOfLines={1} style={[styles.categoryName, { color: colors.foregroundMuted, fontFamily: fonts.medium }]}>
                      {c.name}
                    </Text>
                  </PressableScale>
                </Animated.View>
              );
            })}
          </ScrollView>
        )}

        {outfits.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionRow, styles.pad]}>
              <SectionHeader eyebrow="Curated" title="Looks of the week" />
              <TouchableOpacity onPress={() => navigation.navigate('Inspiration')}>
                <Text style={{ color: colors.accent, fontFamily: fonts.medium, fontSize: 13, marginBottom: 20 }}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              snapToInterval={window.width * 0.64 + GAP} decelerationRate="fast"
              contentContainerStyle={styles.rail}
            >
              {outfits.map((o) => (
                <PressableScale
                  key={o.id}
                  onPress={() => navigation.navigate('Inspiration')}
                  style={[styles.look, { width: window.width * 0.64, borderRadius: borderRadius['2xl'], backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Image source={{ uri: o.image }} style={styles.fill} />
                  <LinearGradient colors={['transparent', 'rgba(8,7,10,0.92)']} style={styles.lookShade}>
                    <Text style={[styles.lookStyle, { color: colors.accent, fontFamily: fonts.semiBold }]}>{o.style.toUpperCase()}</Text>
                    <Text numberOfLines={2} style={[styles.lookTitle, { color: colors.foreground, fontFamily: fonts.displaySemi }]}>{o.title}</Text>
                  </LinearGradient>
                </PressableScale>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.section, styles.pad]}>
          <SectionHeader eyebrow="Shop the budget" title="Picks for you" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {BUDGETS.map((b) => (
            <Chip key={b.label} label={b.label} selected={budget.label === b.label} onPress={() => setBudget(b)} />
          ))}
        </ScrollView>

        {visible.length === 0 && (
          <Text style={[styles.empty, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
            {error ? "Couldn't load products. Pull down to retry." : 'Nothing in this price range yet.'}
          </Text>
        )}

        <View style={[styles.grid, styles.pad]}>
          {visible.map((p, i) => (
            <Animated.View
              key={p.id}
              entering={FadeInDown.delay(Math.min(i, 6) * 70).springify().damping(16)}
              layout={LinearTransition.springify().damping(18)}
              style={{ width: tileWidth }}
            >
              <PressableScale onPress={() => navigation.navigate('ProductDetail', { product: p })}>
                <View style={[styles.photo, { height: tileWidth * 1.3, borderRadius: borderRadius.xl, backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Image source={{ uri: p.images[0] }} style={styles.fill} />
                  {p.originalPrice && p.originalPrice > p.price ? (
                    <View style={[styles.off, { backgroundColor: colors.accent }]}>
                      <Text style={{ color: colors.accentForeground, fontFamily: fonts.bold, fontSize: 10 }}>
                        {Math.round((1 - p.price / p.originalPrice) * 100)}% OFF
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text numberOfLines={1} style={[styles.shop, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>{p.shopName}</Text>
                <Text numberOfLines={1} style={[styles.name, { color: colors.foreground, fontFamily: fonts.medium }]}>{p.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: colors.foreground, fontFamily: fonts.displaySemi }]}>₹{p.price.toLocaleString('en-IN')}</Text>
                  {p.originalPrice && p.originalPrice > p.price ? (
                    <Text style={[styles.was, { color: colors.foregroundSubtle }]}>₹{p.originalPrice.toLocaleString('en-IN')}</Text>
                  ) : null}
                </View>
              </PressableScale>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  pad: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18 },
  round: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 13, marginBottom: 6 },
  title: { fontSize: 32, lineHeight: 36, letterSpacing: -1 },
  titleSerif: { fontSize: 42, lineHeight: 46, marginTop: -2 },
  search: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 999, padding: 6, paddingLeft: 18, marginTop: 18 },
  searchTap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  camera: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  rail: { paddingHorizontal: 20, gap: GAP, marginTop: 4 },
  category: { alignItems: 'center', width: 72, marginTop: 18 },
  categoryRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  categoryName: { fontSize: 11, marginTop: 8, textAlign: 'center' },
  section: { marginTop: 30 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  look: { height: 320, overflow: 'hidden', borderWidth: 1 },
  lookShade: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingTop: 60 },
  lookStyle: { fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  lookTitle: { fontSize: 20, lineHeight: 24 },
  fill: { width: '100%', height: '100%', resizeMode: 'cover' },
  chips: { paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  empty: { paddingHorizontal: 20, paddingVertical: 20, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  photo: { overflow: 'hidden', borderWidth: 1 },
  off: { position: 'absolute', left: 10, top: 10, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  shop: { fontSize: 11, marginTop: 8 },
  name: { fontSize: 13, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 3, marginBottom: 6 },
  price: { fontSize: 16 },
  was: { fontSize: 12, textDecorationLine: 'line-through' },
});
