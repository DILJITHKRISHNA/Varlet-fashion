import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { getProducts, getOutfits, getCategories } from '../../services/api';
import type { Product, Outfit, Category } from '../../services/mockData';
import Logo from '../../components/ui/Logo';
import SearchBar from '../../components/ui/SearchBar';
import Chip from '../../components/ui/Chip';
import SectionHeader from '../../components/ui/SectionHeader';

const { width } = Dimensions.get('window');
const GRID_GAP = 8;
const TILE = (width - 40 - GRID_GAP) / 2;
const VIBES = ['Korean', 'Cargo', 'Streetwear', 'Y2K', 'Formal'];

export default function FeedScreen({ navigation }: any) {
  const { colors, borderRadius, shadow, fonts } = useTheme();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [gridProducts, setGridProducts] = useState<Product[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const load = useCallback(async () => {
    try {
      const [products, outfitData, categoryData] = await Promise.all([
        getProducts({ trendingOnly: true }),
        getOutfits(),
        getCategories(),
      ]);
      setGridProducts(products.slice(0, 4));
      setOutfits(outfitData);
      setCategories(categoryData);
    } catch (e) {
      console.warn('Failed to load feed', e);
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

  const openProduct = (product: Product) => navigation.navigate('ProductDetail', { product });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Logo size="sm" />
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.secondary, borderRadius: borderRadius.full }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Bell size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      >
        <Text style={[styles.greeting, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
          Hi, {firstName}
        </Text>
        <Text style={[styles.vibeTitle, { color: colors.foreground, fontFamily: fonts.semiBold }]}>
          What's your vibe today?
        </Text>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Search')}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="oversized tee"
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>

        <View style={styles.chipRow}>
          {VIBES.map(v => (
            <Chip
              key={v}
              label={v}
              selected={activeVibe === v}
              onPress={() => setActiveVibe(activeVibe === v ? null : v)}
            />
          ))}
        </View>

        <View style={styles.grid}>
          {gridProducts.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.tile, { borderRadius: borderRadius['2xl'], backgroundColor: colors.muted }]}
              onPress={() => openProduct(p)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: p.images[0] }} style={styles.tileImg} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 32 }}>
          <SectionHeader eyebrow="Discover" title="Categories" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {categories.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.catCard, { borderRadius: borderRadius['3xl'], backgroundColor: colors.surface, borderColor: colors.border }, shadow.soft]}
                onPress={() => navigation.navigate('Search')}
              >
                <View style={[styles.catIcon, { backgroundColor: c.color + '20', borderRadius: borderRadius['2xl'] }]}>
                  <Text style={{ fontSize: 22 }}>{c.icon}</Text>
                </View>
                <Text style={[styles.catName, { color: colors.foreground, fontFamily: fonts.medium }]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ marginTop: 32 }}>
          <View style={styles.sectionRow}>
            <SectionHeader eyebrow="Curated" title="Outfit inspiration" />
            <TouchableOpacity onPress={() => navigation.navigate('Inspiration')}>
              <Text style={{ color: colors.accent, fontFamily: fonts.medium, fontSize: 13 }}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {outfits.map(o => (
              <TouchableOpacity
                key={o.id}
                style={[styles.outfitCard, { borderRadius: borderRadius['3xl'], backgroundColor: colors.surface, borderColor: colors.border }, shadow.soft]}
                onPress={() => navigation.navigate('Inspiration')}
              >
                <Image source={{ uri: o.image }} style={[styles.outfitImg, { borderRadius: borderRadius['2xl'] }]} />
                <Text style={[styles.outfitTitle, { color: colors.foreground, fontFamily: fonts.semiBold }]} numberOfLines={1}>
                  {o.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  notifBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 12, marginBottom: 4 },
  vibeTitle: { fontSize: 24, fontWeight: '600', lineHeight: 30, marginBottom: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  tile: { width: TILE, height: TILE, overflow: 'hidden' },
  tileImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  catCard: {
    width: 120,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  catIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  catName: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  outfitCard: { width: 160, padding: 10, borderWidth: 1 },
  outfitImg: { width: '100%', height: 200, resizeMode: 'cover', marginBottom: 8 },
  outfitTitle: { fontSize: 13, fontWeight: '600' },
});
