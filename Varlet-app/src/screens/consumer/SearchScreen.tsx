import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from '../../components/ui/SearchBar';
import Chip from '../../components/ui/Chip';
import SectionHeader from '../../components/ui/SectionHeader';
import { getProducts, getShops, getNearbyShops, getOutfits } from '../../services/api';
import type { Product, Shop, Outfit } from '../../services/mockData';
import { useLocation } from '../../hooks/useLocation';

const { width } = Dimensions.get('window');
const FILTERS = {
  Price: ['Under ₹500', '₹500–₹1500', '₹1500–₹3000', '₹3000+'],
  Style: ['Casual', 'Formal', 'Streetwear', 'Ethnic', 'Party'],
  Gender: ['Men', 'Women', 'Unisex'],
  Size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Color: ['Black', 'White', 'Blue', 'Red', 'Green', 'Beige'],
};

export default function SearchScreen({ navigation }: any) {
  const { colors, borderRadius, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [resultTab, setResultTab] = useState<'products' | 'shops' | 'outfits'>('products');
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const { coords } = useLocation();

  useEffect(() => {
    if (!query) return;
    const timeout = setTimeout(() => {
      getProducts({ query }).then(setFiltered).catch((e) => console.warn('Search products failed', e));
      const q = query.toLowerCase();
      const shopsPromise = coords ? getNearbyShops(coords.lat, coords.lng, 25) : getShops();
      shopsPromise
        .then((shops) => setFilteredShops(shops.filter((s) => s.name.toLowerCase().includes(q))))
        .catch((e) => console.warn('Search shops failed', e));
      getOutfits().then(setOutfits).catch((e) => console.warn('Search outfits failed', e));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, coords]);

  const toggleFilter = (key: string, val: string) => {
    setSelectedFilters(prev => {
      const cur = prev[key] ?? [];
      return { ...prev, [key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] };
    });
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    filterRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    filterContent: { gap: 8 },
    filterChip: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: borderRadius.full, borderWidth: 1.5,
    },
    filterText: { fontSize: 13, fontWeight: '600' },
    filterPanel: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 12 },
    filterPanelTitle: { fontSize: 13, fontWeight: '700', color: colors.foreground, marginBottom: 10 },
    filterValues: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    filterVal: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full, borderWidth: 1.5 },
    filterValText: { fontSize: 12, fontWeight: '600' },
    tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: borderRadius.xl, alignItems: 'center' },
    tabText: { fontSize: 13, fontWeight: '600' },
    content: { padding: 16, paddingBottom: 100 },
    productRow: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
      borderRadius: borderRadius.xl, marginBottom: 12, overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    productImg: { width: 88, height: 88, resizeMode: 'cover' },
    productInfo: { flex: 1, padding: 12 },
    productBrand: { fontSize: 10, fontWeight: '600', color: '#FF6B35', marginBottom: 2 },
    productName: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 4 },
    productPrice: { fontSize: 15, fontWeight: '700', color: colors.foreground },
    shopRow: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
      borderRadius: borderRadius.xl, marginBottom: 12, padding: 12,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    shopLogo: { width: 52, height: 52, borderRadius: 14, marginRight: 12 },
    shopName: { fontSize: 15, fontWeight: '700', color: colors.foreground },
    shopMeta: { fontSize: 12, color: colors.foregroundMuted, marginTop: 2 },
    shopVerified: { fontSize: 11, color: '#10B981', marginTop: 2, fontWeight: '600' },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyText: { fontSize: 16, fontWeight: '600', color: colors.foreground },
    emptySub: { fontSize: 14, color: colors.foregroundMuted, marginTop: 4 },
    recent: { paddingHorizontal: 16, paddingTop: 16 },
    recentTitle: { fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
    recentTag: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.secondary, borderRadius: borderRadius.full, marginBottom: 8, marginRight: 8 },
    recentTagText: { fontSize: 13, color: colors.foreground },
  });

  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <SectionHeader eyebrow="Search" title="Discover fashion near you" />
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search products, shops, styles…"
        />
      </View>

      {/* Filter row */}
      <View style={s.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterContent}>
          {Object.keys(FILTERS).map(key => {
            const hasSelected = (selectedFilters[key]?.length ?? 0) > 0;
            const isOpen = activeFilterKey === key;
            return (
              <TouchableOpacity
                key={key}
                style={[s.filterChip, { borderColor: hasSelected ? colors.accent : colors.border, backgroundColor: hasSelected ? colors.accentSoft : colors.surface }]}
                onPress={() => setActiveFilterKey(isOpen ? null : key)}
              >
                <Text style={[s.filterText, { color: hasSelected ? colors.accent : colors.foreground, fontFamily: fonts.medium }]}>
                  {key}{hasSelected ? ` (${selectedFilters[key].length})` : ''} {isOpen ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filter dropdown */}
      {activeFilterKey && (
        <View style={s.filterPanel}>
          <Text style={s.filterPanelTitle}>{activeFilterKey}</Text>
          <View style={s.filterValues}>
            {(FILTERS as any)[activeFilterKey].map((val: string) => {
              const selected = selectedFilters[activeFilterKey]?.includes(val);
              return (
                <TouchableOpacity
                  key={val}
                  style={[s.filterVal, { borderColor: selected ? '#FF6B35' : colors.border, backgroundColor: selected ? '#FFF0EA' : colors.surface }]}
                  onPress={() => toggleFilter(activeFilterKey, val)}
                >
                  <Text style={[s.filterValText, { color: selected ? '#FF6B35' : colors.foreground }]}>{val}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Result tabs */}
      {query.length > 0 && (
        <View style={s.tabRow}>
          {(['products', 'shops', 'outfits'] as const).map(t => (
            <TouchableOpacity
              key={t} style={[s.tabBtn, { backgroundColor: resultTab === t ? '#FF6B35' : colors.secondary }]}
              onPress={() => setResultTab(t)}
            >
              <Text style={[s.tabText, { color: resultTab === t ? '#fff' : colors.foregroundMuted }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {!query ? (
          <View style={s.recent}>
            <Text style={s.recentTitle}>Popular searches</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['oversized tee', 'cargo pants', 'sneakers', 'kurta', 'korean fashion', 'blazer'].map(tag => (
                <Chip key={tag} label={tag} onPress={() => setQuery(tag)} style={{ marginBottom: 8, marginRight: 8 }} />
              ))}
            </View>
          </View>
        ) : resultTab === 'products' ? (
          filtered.length ? filtered.map(p => (
            <TouchableOpacity key={p.id} style={s.productRow} onPress={() => navigation.navigate('ProductDetail', { product: p })}>
              <Image source={{ uri: p.images[0] }} style={s.productImg} />
              <View style={s.productInfo}>
                <Text style={s.productBrand}>{p.brand}</Text>
                <Text style={s.productName} numberOfLines={1}>{p.name}</Text>
                <Text style={s.productPrice}>₹{p.price.toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          )) : (
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>🔍</Text>
              <Text style={s.emptyText}>No results found</Text>
              <Text style={s.emptySub}>Try a different search term</Text>
            </View>
          )
        ) : resultTab === 'shops' ? (
          filteredShops.map(shop => (
            <TouchableOpacity key={shop.id} style={s.shopRow} onPress={() => navigation.navigate('ShopProfile', { shop })}>
              <Image source={{ uri: shop.logo }} style={s.shopLogo} />
              <View style={{ flex: 1 }}>
                <Text style={s.shopName}>{shop.name}</Text>
                <Text style={s.shopMeta}>{shop.distance} · {shop.productCount} products</Text>
                {shop.isVerified && <Text style={s.shopVerified}>✓ Verified</Text>}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          outfits.filter(o => !query || o.title.toLowerCase().includes(query.toLowerCase())).map(o => (
            <TouchableOpacity key={o.id} style={s.productRow} onPress={() => navigation.navigate('Inspiration')}>
              <Image source={{ uri: o.image }} style={s.productImg} />
              <View style={s.productInfo}>
                <Text style={s.productBrand}>{o.style}</Text>
                <Text style={s.productName}>{o.title}</Text>
                <Text style={[s.productPrice, { fontSize: 12, fontWeight: '500', color: colors.foregroundMuted }]}>♥ {o.savedCount.toLocaleString()} saved</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
