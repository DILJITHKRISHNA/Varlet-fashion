import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { getWishlistProductIds, addToWishlist, removeFromWishlist } from '../../services/api';
import type { Product } from '../../services/mockData';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { colors, borderRadius, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const product: Product = route?.params?.product;
  const [selectedSize, setSelectedSize] = useState(product?.sizes[1] ?? product?.sizes[0] ?? '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!user || !product) return;
    getWishlistProductIds(user.id)
      .then((ids) => setIsSaved(ids.includes(product.id)))
      .catch(() => {});
  }, [user, product]);

  const toggleSaved = async () => {
    if (!user || !product) return;
    try {
      if (isSaved) {
        await removeFromWishlist(user.id, product.id);
        setIsSaved(false);
      } else {
        await addToWishlist(user.id, product.id);
        setIsSaved(true);
      }
    } catch (e) {
      console.warn('Failed to toggle wishlist', e);
    }
  };

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.foregroundMuted }}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.images[0] }} style={styles.image} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8, borderRadius: borderRadius.full }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.heartBtn, { top: insets.top + 8, borderRadius: borderRadius.full, backgroundColor: 'rgba(255,255,255,0.75)' }]}
            onPress={toggleSaved}
          >
            <Heart size={16} color={isSaved ? colors.accent : colors.foreground} fill={isSaved ? colors.accent : 'transparent'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.shop, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
            {product.shopName}
          </Text>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: fonts.semiBold }]}>
            {product.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.foreground, fontFamily: fonts.semiBold }]}>
              ₹{product.price.toLocaleString()}
            </Text>
            {product.inStock && <Badge label="In stock" variant="success" />}
          </View>

          <View style={styles.sizeRow}>
            {product.sizes.map(size => {
              const selected = selectedSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizePill,
                    {
                      borderRadius: borderRadius.lg,
                      backgroundColor: selected ? colors.primary : colors.muted,
                    },
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      {
                        color: selected ? colors.primaryForeground : colors.foreground,
                        fontFamily: fonts.medium,
                      },
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button label="Get directions" fullWidth onPress={() => {}} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageWrap: { height: width * 0.72, position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#fff', fontSize: 18 },
  heartBtn: {
    position: 'absolute',
    right: 16,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 20 },
  shop: { fontSize: 12, marginBottom: 4 },
  name: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  price: { fontSize: 20, fontWeight: '600' },
  sizeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  sizePill: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  sizeText: { fontSize: 14, fontWeight: '500' },
});
