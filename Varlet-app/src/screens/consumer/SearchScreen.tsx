import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, BadgeCheck, Heart, Camera, Tag, Store } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from '../../components/ui/SearchBar';
import Chip from '../../components/ui/Chip';
import SectionHeader from '../../components/ui/SectionHeader';
import StateView from '../../components/ui/StateView';
import Thumb from '../../components/ui/Thumb';
import PressableScale from '../../components/ui/PressableScale';
import { getProducts, getShops, getNearbyShops, getOutfits, getBrands, getCategories } from '../../services/api';
import type { Product, Shop, Outfit } from '../../services/mockData';
import { useLocation } from '../../hooks/useLocation';
import { PRICE_BANDS } from '../../constants/priceBands';
import { rupees } from '../../utils/format';

const GENDERS = ['Men', 'Women'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Blue', 'Red', 'Green', 'Pink', 'Beige'];

/** Price, brand, category and gender take one value; size and colour take several. */
const SEVERAL = ['Size', 'Color'];
type Filters = Record<string, string[]>;

function matches(product: Product, filters: Filters): boolean {
  const gender = filters.Gender?.[0]?.toLowerCase();
  if (gender && product.gender !== gender && product.gender !== 'unisex') return false;
  if (filters.Size?.length && !filters.Size.some((s) => product.sizes.includes(s))) return false;
  if (filters.Color?.length) {
    const names = product.colors.map((c) => c.name.toLowerCase()).join(' ');
    if (!filters.Color.some((c) => names.includes(c.toLowerCase()))) return false;
  }
  return true;
}

export default function SearchScreen({ navigation, route }: any) {
  const { colors, borderRadius, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [tab, setTab] = useState<'products' | 'shops' | 'outfits'>('products');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const latest = useRef(0);
  const { coords } = useLocation();

  const filterCount = Object.values(filters).reduce((sum, v) => sum + v.length, 0);
  const active = query.trim().length > 0 || filterCount > 0;

  useEffect(() => {
    getBrands().then(setBrands).catch(() => {});
    getCategories().then((c) => setCategories(c.map((x) => x.name))).catch(() => {});
    getOutfits().then(setOutfits).catch(() => {});
  }, [attempt]);

  // Another screen can open this one with a filter already chosen.
  useEffect(() => {
    const { brand, price, category } = route?.params ?? {};
    if (!brand && !price && !category) return;
    setQuery('');
    setTab('products');
    setOpenKey(null);
    setFilters({
      ...(brand ? { Brand: [brand] } : {}),
      ...(price ? { Price: [price] } : {}),
      ...(category ? { Category: [category] } : {}),
    });
  }, [route?.params?.at]);

  const band = PRICE_BANDS.find((b) => b.label === filters.Price?.[0]);
  const brand = filters.Brand?.[0];
  const category = filters.Category?.[0];

  useEffect(() => {
    const call = ++latest.current;
    setError(null);
    setProducts(null);
    if (!active) return;
    const timer = setTimeout(() => {
      getProducts({ query: query.trim(), brand, category, minPrice: band?.min, maxPrice: band?.max })
        .then((found) => call === latest.current && setProducts(found))
        .catch((e) => call === latest.current && setError(e.message));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, brand, category, band?.label, active, attempt]);

  useEffect(() => {
    if (!active) return;
    (coords ? getNearbyShops(coords.lat, coords.lng, 25) : getShops()).then(setShops).catch(() => {});
  }, [active, coords?.lat, coords?.lng, attempt]);

  const choose = (key: string, value: string) => {
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : SEVERAL.includes(key) ? [...current, value] : [value];
      return { ...prev, [key]: next };
    });
  };

  const options: Record<string, string[]> = {
    Price: PRICE_BANDS.map((b) => b.label),
    Brand: brands,
    Category: categories,
    Gender: GENDERS,
    Size: SIZES,
    Color: COLORS,
  };

  const q = query.trim().toLowerCase();
  const shownProducts = products?.filter((p) => matches(p, filters));
  const shownShops = shops.filter((s) => !q || s.name.toLowerCase().includes(q));
  const shownOutfits = outfits.filter((o) => !q || o.title.toLowerCase().includes(q));

  const muted = { color: colors.foregroundMuted, fontFamily: fonts.regular };
  const row = [styles.row, { backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderColor: colors.border }];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <SectionHeader eyebrow="Search" title="Discover fashion near you" />
        <View style={styles.searchRow}>
          <View style={styles.flex}>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Search products, brands, shops…" />
          </View>
          <TouchableOpacity
            accessibilityLabel="Search by photo"
            style={[styles.camera, { backgroundColor: colors.accent }]}
            onPress={() => navigation.navigate('PhotoSearch')}
          >
            <Camera size={19} color={colors.accentForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {filterCount > 0 && <Chip label="Clear all" onPress={() => { setFilters({}); setOpenKey(null); }} />}
          {Object.keys(options).map((key) => {
            const chosen = filters[key] ?? [];
            const label = chosen.length === 1 ? chosen[0] : chosen.length ? `${key} (${chosen.length})` : key;
            return (
              <Chip
                key={key}
                label={`${label} ${openKey === key ? '▲' : '▼'}`}
                selected={chosen.length > 0}
                onPress={() => setOpenKey(openKey === key ? null : key)}
              />
            );
          })}
        </ScrollView>
        {openKey && (
          <ScrollView style={styles.panel} contentContainerStyle={styles.values}>
            {options[openKey].length === 0 && <Text style={[styles.small, muted]}>Nothing to choose yet.</Text>}
            {options[openKey].map((value) => (
              <Chip
                key={value}
                label={value}
                selected={filters[openKey]?.includes(value)}
                onPress={() => {
                  choose(openKey, value);
                  if (!SEVERAL.includes(openKey)) setOpenKey(null);
                }}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {active && (
        <View style={styles.tabs}>
          {(['products', 'shops', 'outfits'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, { backgroundColor: tab === t ? colors.accent : colors.secondary, borderRadius: borderRadius.xl }]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, { color: tab === t ? colors.accentForeground : colors.foregroundMuted, fontFamily: fonts.semiBold }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!active ? (
          <>
            <View style={styles.shortcuts}>
              {[
                { icon: Camera, title: 'Search by photo', screen: 'PhotoSearch' },
                { icon: Tag, title: 'Shop by price', screen: 'Collections' },
              ].map(({ icon: Icon, title, screen }) => (
                <PressableScale
                  key={screen}
                  accessibilityRole="button"
                  onPress={() => navigation.navigate(screen)}
                  style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius['2xl'] }]}
                >
                  <Icon size={22} color={colors.accent} />
                  <Text style={[styles.shortcutText, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{title}</Text>
                </PressableScale>
              ))}
            </View>
            <Text style={[styles.heading, { color: colors.foreground, fontFamily: fonts.semiBold }]}>Popular searches</Text>
            <View style={styles.values}>
              {['tee', 'cargo', 'sneakers', 'kurta', 'korean', 'blazer'].map((word) => (
                <Chip key={word} label={word} onPress={() => setQuery(word)} />
              ))}
            </View>
          </>
        ) : tab === 'products' ? (
          error ? (
            <StateView error={error} action={{ label: 'Try again', onPress: () => setAttempt(attempt + 1) }} />
          ) : !shownProducts ? (
            <StateView loading />
          ) : shownProducts.length === 0 ? (
            <StateView icon={Search} title="No results found" message="Try different words or fewer filters." />
          ) : (
            <>
              <Text style={[styles.count, muted]}>
                {shownProducts.length} {shownProducts.length === 1 ? 'product' : 'products'}
              </Text>
              {shownProducts.map((p) => (
                <TouchableOpacity key={p.id} style={row} onPress={() => navigation.navigate('ProductDetail', { product: p })}>
                  <Thumb uri={p.images[0]} style={styles.image} />
                  <View style={styles.info}>
                    {p.brand ? <Text style={[styles.eyebrow, { color: colors.accent, fontFamily: fonts.semiBold }]}>{p.brand}</Text> : null}
                    <Text numberOfLines={1} style={[styles.name, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{p.name}</Text>
                    <Text numberOfLines={1} style={[styles.small, muted]}>{p.shopName}</Text>
                    <Text style={[styles.price, { color: colors.foreground, fontFamily: fonts.displaySemi }]}>{rupees(p.price)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )
        ) : tab === 'shops' ? (
          shownShops.length === 0 ? (
            <StateView icon={Store} title="No shops found" message="No nearby shop matches that name." />
          ) : (
            shownShops.map((shop) => (
              <TouchableOpacity key={shop.id} style={row} onPress={() => navigation.navigate('ShopProfile', { shop })}>
                <Thumb uri={shop.logo} style={styles.image} />
                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{shop.name}</Text>
                  <Text style={[styles.small, muted]}>
                    {shop.distance !== '—' ? `${shop.distance} · ` : ''}{shop.productCount} products
                  </Text>
                  {shop.isVerified && (
                    <View style={styles.verified}>
                      <BadgeCheck size={13} color={colors.success} />
                      <Text style={[styles.small, { color: colors.success, fontFamily: fonts.medium }]}>Verified</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )
        ) : shownOutfits.length === 0 ? (
          <StateView icon={Search} title="No looks found" message="Try different words." />
        ) : (
          shownOutfits.map((o) => (
            <TouchableOpacity key={o.id} style={row} onPress={() => navigation.navigate('Inspiration')}>
              <Thumb uri={o.image} style={styles.image} />
              <View style={styles.info}>
                <Text style={[styles.eyebrow, { color: colors.accent, fontFamily: fonts.semiBold }]}>{o.style}</Text>
                <Text style={[styles.name, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{o.title}</Text>
                <View style={styles.verified}>
                  <Heart size={11} color={colors.foregroundMuted} fill={colors.foregroundMuted} />
                  <Text style={[styles.small, muted]}>{o.savedCount.toLocaleString('en-IN')} saved</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  camera: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  filterBar: { paddingVertical: 10, borderBottomWidth: 1 },
  chips: { paddingHorizontal: 16, gap: 8 },
  panel: { maxHeight: 150, marginTop: 10 },
  values: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabText: { fontSize: 13 },
  content: { paddingVertical: 16, paddingBottom: 110 },
  shortcuts: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 24 },
  shortcut: { padding: 16, borderWidth: 1, gap: 10, width: 150 },
  shortcutText: { fontSize: 13 },
  heading: { fontSize: 14, marginBottom: 12, paddingHorizontal: 16 },
  count: { fontSize: 12, marginBottom: 10, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, borderWidth: 1, overflow: 'hidden' },
  image: { width: 92, height: 100 },
  info: { flex: 1, padding: 12, gap: 3 },
  eyebrow: { fontSize: 10, letterSpacing: 1 },
  name: { fontSize: 14 },
  small: { fontSize: 12 },
  price: { fontSize: 16 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
