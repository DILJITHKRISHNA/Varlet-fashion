import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Heart, MapPin } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import {
  getWishlistProductIds, addToWishlist, removeFromWishlist,
  getShop, getOffers, getCombinations, type Offer,
} from '../../services/api';
import type { Product, Shop } from '../../services/mockData';
import { discountOff, rupees } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import Thumb from '../../components/ui/Thumb';
import StateView from '../../components/ui/StateView';
import SectionHeader from '../../components/ui/SectionHeader';
import ContactActions from '../../components/ContactActions';
import OfferCard from '../../components/OfferCard';
import ProductGrid from '../../components/ProductGrid';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { colors, borderRadius, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuthStore();
  const product: Product | undefined = route?.params?.product;
  const [size, setSize] = useState(product?.sizes[0] ?? '');
  const [photo, setPhoto] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [pairs, setPairs] = useState<Product[]>([]);

  useEffect(() => {
    if (!product) return;
    // Each part is extra: the page still works if one of them fails.
    getShop(product.shopId).then(setShop).catch(() => {});
    getOffers({ shopId: product.shopId }).then(setOffers).catch(() => {});
    getCombinations(product.id).then(setPairs).catch(() => {});
    getWishlistProductIds(user?.id ?? '')
      .then((ids) => setIsSaved(ids.includes(product.id)))
      .catch(() => {});
  }, [product?.id]);

  const toggleSaved = async () => {
    if (!user || !product) return;
    setSaveError(null);
    try {
      if (isSaved) await removeFromWishlist(user.id, product.id);
      else await addToWishlist(user.id, product.id);
      setIsSaved(!isSaved);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not update your wishlist.');
    }
  };

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 40 }]}>
        <StateView title="Product not found" action={{ label: 'Go back', onPress: () => navigation.goBack() }} />
      </View>
    );
  }

  const off = discountOff(product.price, product.originalPrice);
  const imageHeight = Math.min(width * 1.1, 520);
  const text = { color: colors.foregroundMuted, fontFamily: fonts.regular };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setPhoto(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={64}
          >
            {(product.images.length ? product.images : ['']).map((uri, i) => (
              <Thumb key={`${uri}-${i}`} uri={uri} style={{ width, height: imageHeight }} />
            ))}
          </ScrollView>
          {product.images.length > 1 && (
            <View style={styles.dots}>
              {product.images.map((uri, i) => (
                <View key={uri + i} style={[styles.dot, { backgroundColor: i === photo ? colors.accent : 'rgba(255,255,255,0.5)', width: i === photo ? 18 : 6 }]} />
              ))}
            </View>
          )}
          <TouchableOpacity
            accessibilityLabel="Back"
            style={[styles.round, { left: 16, top: insets.top + 8 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            style={[styles.round, { right: 16, top: insets.top + 8 }]}
            onPress={toggleSaved}
          >
            <Heart size={17} color={isSaved ? colors.accent : '#fff'} fill={isSaved ? colors.accent : 'transparent'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {product.brand ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'Search', params: { brand: product.brand, at: Date.now() } })}
            >
              <Text style={[styles.brand, { color: colors.accent, fontFamily: fonts.semiBold }]}>
                {product.brand.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ) : null}
          <Text style={[styles.name, { color: colors.foreground, fontFamily: fonts.displaySemi }]}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.foreground, fontFamily: fonts.display }]}>{rupees(product.price)}</Text>
            {off ? (
              <>
                <Text style={[styles.was, { color: colors.foregroundSubtle }]}>{rupees(product.originalPrice!)}</Text>
                <Badge label={`${off}% off`} variant="accent" />
              </>
            ) : null}
            <View style={styles.spacer} />
            <Badge label={product.inStock ? 'In stock' : 'Out of stock'} variant={product.inStock ? 'success' : 'muted'} />
          </View>
          {saveError && <Text style={[styles.error, { color: colors.destructive }]}>{saveError}</Text>}

          {product.sizes.length > 0 && (
            <View style={styles.chips}>
              {product.sizes.map((s) => (
                <Chip key={s} label={s} selected={size === s} onPress={() => setSize(s)} />
              ))}
            </View>
          )}

          {product.colors.length > 0 && (
            <View style={styles.colors}>
              {product.colors.map((c) => (
                <View key={c.name} style={styles.color}>
                  {c.hex ? <View style={[styles.swatch, { backgroundColor: c.hex, borderColor: colors.border }]} /> : null}
                  <Text style={[styles.colorName, text]}>{c.name}</Text>
                </View>
              ))}
            </View>
          )}

          {product.description ? <Text style={[styles.description, text]}>{product.description}</Text> : null}

          <TouchableOpacity
            style={[styles.shop, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius['2xl'] }]}
            onPress={() => navigation.navigate('ShopProfile', { shopId: product.shopId, shop: shop ?? undefined })}
          >
            <View style={styles.spacer}>
              <Text style={[styles.shopName, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{product.shopName}</Text>
              {shop && (
                <View style={styles.location}>
                  <MapPin size={12} color={colors.foregroundMuted} />
                  <Text style={[styles.small, text]}>{shop.location} · {shop.isOpen ? 'Open now' : 'Closed'}</Text>
                </View>
              )}
            </View>
            <ChevronRight size={18} color={colors.foregroundMuted} />
          </TouchableOpacity>

          {shop && <ContactActions shop={shop} product={product} />}

          {offers.length > 0 && (
            <View style={styles.section}>
              {offers.map((o) => <OfferCard key={o.id} offer={o} style={styles.offer} />)}
            </View>
          )}

          {pairs.length > 0 && (
            <View style={styles.section}>
              <SectionHeader eyebrow="Complete the look" title="Goes well with" />
              <ProductGrid products={pairs} navigation={navigation} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dots: { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
  round: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(8,7,10,0.6)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 18 },
  content: { padding: 20 },
  brand: { fontSize: 11, letterSpacing: 2, marginBottom: 6 },
  name: { fontSize: 24, lineHeight: 29, marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  price: { fontSize: 26 },
  was: { fontSize: 14, textDecorationLine: 'line-through' },
  spacer: { flex: 1 },
  error: { fontSize: 12, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 14 },
  color: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1 },
  colorName: { fontSize: 12 },
  description: { fontSize: 14, lineHeight: 21, marginBottom: 18 },
  shop: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, marginBottom: 12 },
  shopName: { fontSize: 15 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  small: { fontSize: 12 },
  section: { marginTop: 26 },
  offer: { marginBottom: 10 },
});
