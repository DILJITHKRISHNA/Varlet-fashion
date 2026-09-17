import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Star } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { getShopProducts, isFollowingShop, followShop, unfollowShop } from '../../services/api';
import type { Product, Shop } from '../../services/mockData';
import Button from '../../components/ui/Button';

export default function ShopProfileScreen({ navigation, route }: any) {
  const { colors, borderRadius, shadow, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const shop: Shop = route?.params?.shop;
  const [products, setProducts] = useState<Product[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!shop?.id) return;
    getShopProducts(shop.id).then((p) => setProducts(p.slice(0, 4))).catch((e) => console.warn('Failed to load shop products', e));
    if (user) {
      isFollowingShop(user.id, shop.id).then(setIsFollowing).catch(() => {});
    }
  }, [shop?.id, user]);

  const toggleFollow = async () => {
    if (!user || !shop) return;
    try {
      if (isFollowing) {
        await unfollowShop(user.id, shop.id);
        setIsFollowing(false);
      } else {
        await followShop(user.id, shop.id);
        setIsFollowing(true);
      }
    } catch (e) {
      console.warn('Failed to toggle follow', e);
    }
  };

  if (!shop) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24, color: colors.foreground }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.foregroundMuted, marginTop: 20, fontFamily: fonts.regular }}>Shop not found</Text>
      </View>
    );
  }

  const initial = shop.name[0]?.toUpperCase() ?? 'S';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.coverWrap}>
          <LinearGradient colors={colors.gradientAccent} style={styles.coverGrad} />
          <TouchableOpacity style={[styles.backBtn, { top: insets.top + 8 }]} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.body, { marginTop: -40 }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary, borderRadius: borderRadius['2xl'], borderColor: colors.surface }, shadow.soft]}>
            <Text style={[styles.avatarText, { color: colors.primaryForeground, fontFamily: fonts.semiBold }]}>{initial}</Text>
          </View>

          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.foreground, fontFamily: fonts.semiBold }]} numberOfLines={1}>
              {shop.name}
            </Text>
            <Button
              label={isFollowing ? 'Following' : 'Follow'}
              variant={isFollowing ? 'outline' : 'primary'}
              onPress={toggleFollow}
              style={{ paddingVertical: 8, paddingHorizontal: 16 }}
            />
          </View>

          <View style={styles.metaRow}>
            <MapPin size={12} color={colors.foregroundMuted} />
            <Text style={[styles.meta, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
              {shop.location} · {shop.distance}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <Star size={12} color={colors.accent} fill={colors.accent} />
            <Text style={[styles.rating, { color: colors.foreground, fontFamily: fonts.medium }]}>{shop.rating}</Text>
            <Text style={[styles.reviews, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
              · {shop.reviewCount} reviews
            </Text>
          </View>

          <View style={styles.grid}>
            {products.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.productTile, { borderRadius: borderRadius.xl, backgroundColor: colors.muted }]}
                onPress={() => navigation.navigate('ProductDetail', { product: p })}
              >
                <Image source={{ uri: p.images[0] }} style={styles.productImg} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coverWrap: { height: 128, position: 'relative' },
  coverGrad: { flex: 1 },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#fff', fontSize: 18 },
  body: { paddingHorizontal: 20 },
  avatar: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  avatarText: { fontSize: 24, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12 },
  name: { fontSize: 18, fontWeight: '600', flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  meta: { fontSize: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, marginBottom: 16 },
  rating: { fontSize: 12, fontWeight: '500' },
  reviews: { fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  productTile: { width: '48.5%', aspectRatio: 1, overflow: 'hidden' },
  productImg: { width: '100%', height: '100%', resizeMode: 'cover' },
});
