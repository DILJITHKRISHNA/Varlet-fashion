import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Shirt, ShoppingBag, Tag, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import {
  getSavedOutfits, unsaveOutfit,
  getWishlistProducts, removeFromWishlist,
  getFollowedShops, unfollowShop,
} from '../../services/api';
import type { Outfit, Product, Shop } from '../../services/mockData';

export default function WishlistScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'outfits' | 'products' | 'brands'>('outfits');
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [followedShops, setFollowedShops] = useState<Shop[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [outfits, products, shops] = await Promise.all([
        getSavedOutfits(user.id),
        getWishlistProducts(user.id),
        getFollowedShops(user.id),
      ]);
      setSavedOutfits(outfits);
      setSavedProducts(products);
      setFollowedShops(shops);
    } catch (e) {
      console.warn('Failed to load wishlist', e);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const removeOutfit = async (id: string) => {
    if (!user) return;
    await unsaveOutfit(user.id, id);
    setSavedOutfits(prev => prev.filter(o => o.id !== id));
  };

  const removeProduct = async (id: string) => {
    if (!user) return;
    await removeFromWishlist(user.id, id);
    setSavedProducts(prev => prev.filter(p => p.id !== id));
  };

  const unfollowBrand = async (shopId: string) => {
    if (!user) return;
    await unfollowShop(user.id, shopId);
    setFollowedShops(prev => prev.filter(s => s.id !== shopId));
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface },
    title: { fontSize: 24, fontWeight: '700', color: colors.foreground },
    tabRow: { flexDirection: 'row', backgroundColor: colors.secondary, borderRadius: borderRadius.xl, padding: 4, margin: 16 },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: borderRadius.lg, alignItems: 'center' },
    tabText: { fontSize: 13, fontWeight: '600' },
    content: { paddingHorizontal: 16, paddingBottom: 100 },
    outfitCard: { marginBottom: 14, borderRadius: borderRadius.xl, overflow: 'hidden', backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    outfitImg: { width: '100%', height: 200, resizeMode: 'cover' },
    outfitInfo: { padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    outfitTitle: { fontSize: 15, fontWeight: '600', color: colors.foreground },
    outfitStyle: { fontSize: 12, color: '#FF6B35', fontWeight: '600', marginTop: 2 },
    removeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.destructiveSoft, alignItems: 'center', justifyContent: 'center' },
    productRow: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
      borderRadius: borderRadius.xl, marginBottom: 12, overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    productImg: { width: 88, height: 88, resizeMode: 'cover' },
    productInfo: { flex: 1, padding: 12 },
    productBrand: { fontSize: 10, fontWeight: '600', color: '#FF6B35' },
    productName: { fontSize: 14, fontWeight: '600', color: colors.foreground },
    productPrice: { fontSize: 14, fontWeight: '700', color: colors.foreground, marginTop: 4 },
    brandCard: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
      borderRadius: borderRadius.xl, padding: 14, marginBottom: 12,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    brandIcon: { width: 44, height: 44, borderRadius: 12, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
    brandName: { fontSize: 15, fontWeight: '600', color: colors.foreground },
    brandSub: { fontSize: 12, color: colors.foregroundMuted, marginTop: 2 },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.foreground },
    emptySub: { fontSize: 14, color: colors.foregroundMuted, marginTop: 4 },
    emptyBtn: { marginTop: 20, borderRadius: borderRadius.full, overflow: 'hidden' },
    emptyBtnGrad: { paddingHorizontal: 24, paddingVertical: 12 },
    emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  });

  const TABS = [{ key: 'outfits', label: 'Outfits' }, { key: 'products', label: 'Products' }, { key: 'brands', label: 'Brands' }] as const;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Wishlist</Text>
      </View>

      <View style={s.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[s.tabBtn, { backgroundColor: tab === t.key ? colors.surface : 'transparent', shadowColor: tab === t.key ? '#000' : 'transparent', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: tab === t.key ? 2 : 0 }]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[s.tabText, { color: tab === t.key ? '#FF6B35' : colors.foregroundMuted }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {tab === 'outfits' && (
          savedOutfits.length ? (
            savedOutfits.map(o => (
              <View key={o.id} style={s.outfitCard}>
                <Image source={{ uri: o.image }} style={s.outfitImg} />
                <View style={s.outfitInfo}>
                  <View>
                    <Text style={s.outfitTitle}>{o.title}</Text>
                    <Text style={s.outfitStyle}>{o.style}</Text>
                  </View>
                  <TouchableOpacity style={s.removeBtn} onPress={() => removeOutfit(o.id)}>
                    <Heart size={16} color="#EF4444" fill="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={s.empty}>
              <View style={s.emptyIconWrap}>
                <Shirt size={32} color={colors.foregroundMuted} />
              </View>
              <Text style={s.emptyTitle}>No saved outfits</Text>
              <Text style={s.emptySub}>Browse the feed and save looks you love</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('Feed')}>
                <LinearGradient colors={['#FF6B35', '#E85A28']} style={s.emptyBtnGrad}>
                  <Text style={s.emptyBtnText}>Explore Feed</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )
        )}

        {tab === 'products' && (
          savedProducts.length ? (
            savedProducts.map(p => (
              <TouchableOpacity key={p.id} style={s.productRow} onPress={() => navigation.navigate('ProductDetail', { product: p })}>
                <Image source={{ uri: p.images[0] }} style={s.productImg} />
                <View style={s.productInfo}>
                  <Text style={s.productBrand}>{p.brand}</Text>
                  <Text style={s.productName} numberOfLines={1}>{p.name}</Text>
                  <Text style={s.productPrice}>₹{p.price.toLocaleString()}</Text>
                </View>
                <TouchableOpacity style={[s.removeBtn, { margin: 12 }]} onPress={() => removeProduct(p.id)}>
                  <Heart size={16} color="#EF4444" fill="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={s.empty}>
              <View style={s.emptyIconWrap}>
                <ShoppingBag size={32} color={colors.foregroundMuted} />
              </View>
              <Text style={s.emptyTitle}>No saved products</Text>
              <Text style={s.emptySub}>Tap the heart on any product to save it here</Text>
            </View>
          )
        )}

        {tab === 'brands' && (
          followedShops.length ? (
            followedShops.map(shop => (
              <TouchableOpacity key={shop.id} style={s.brandCard} onPress={() => navigation.navigate('ShopProfile', { shop })}>
                <LinearGradient colors={['#FF6B35', '#E85A28']} style={s.brandIcon}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{shop.name[0]}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={s.brandName}>{shop.name}</Text>
                  <Text style={s.brandSub}>Following</Text>
                </View>
                <TouchableOpacity style={s.removeBtn} onPress={() => unfollowBrand(shop.id)}>
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={s.empty}>
              <View style={s.emptyIconWrap}>
                <Tag size={32} color={colors.foregroundMuted} />
              </View>
              <Text style={s.emptyTitle}>No followed brands</Text>
              <Text style={s.emptySub}>Follow brands to get notified of new drops</Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}
