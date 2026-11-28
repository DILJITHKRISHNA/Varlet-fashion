import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Star, BadgeCheck } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import {
  getShop, getShopProducts, getOffers, isFollowingShop, followShop, unfollowShop,
} from '../../services/api';
import type { Shop } from '../../services/mockData';
import { useAsync } from '../../hooks/useAsync';
import Button from '../../components/ui/Button';
import StateView from '../../components/ui/StateView';
import SectionHeader from '../../components/ui/SectionHeader';
import ContactActions from '../../components/ContactActions';
import OfferCard from '../../components/OfferCard';
import ProductGrid from '../../components/ProductGrid';

export default function ShopProfileScreen({ navigation, route }: any) {
  const { colors, borderRadius, shadow, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const passed: Shop | undefined = route?.params?.shop;
  const shopId: string = route?.params?.shopId ?? passed?.id ?? '';
  const [following, setFollowing] = useState<boolean | null>(null);
  const [followError, setFollowError] = useState<string | null>(null);

  const { data, error, reload } = useAsync(async () => {
    const [shop, products, offers] = await Promise.all([
      getShop(shopId),
      getShopProducts(shopId),
      getOffers({ shopId }),
    ]);
    isFollowingShop(user?.id ?? '', shopId).then(setFollowing).catch(() => {});
    return { shop, products, offers };
  }, [shopId]);

  // Show what the previous screen knew while the rest loads.
  const shop = data?.shop ?? passed;
  const distance = passed && passed.distance !== '—' ? passed.distance : null;

  const toggleFollow = async () => {
    if (!user || following === null) return;
    setFollowError(null);
    try {
      if (following) await unfollowShop(user.id, shopId);
      else await followShop(user.id, shopId);
      setFollowing(!following);
    } catch (e) {
      setFollowError(e instanceof Error ? e.message : 'Could not update.');
    }
  };

  const back = (
    <TouchableOpacity accessibilityLabel="Back" style={[styles.back, { top: insets.top + 8 }]} onPress={() => navigation.goBack()}>
      <Text style={styles.backText}>←</Text>
    </TouchableOpacity>
  );

  if (!shop) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 60 }]}>
        {back}
        <StateView
          loading={!error && data === null}
          error={error}
          title={error ? "Couldn't load this store" : 'Shop not found'}
          action={error ? { label: 'Try again', onPress: reload } : undefined}
        />
      </View>
    );
  }

  const muted = { color: colors.foregroundMuted, fontFamily: fonts.regular };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.cover}>
          <LinearGradient colors={colors.gradientAccent} style={styles.fill} />
          {back}
        </View>

        <View style={styles.body}>
          <View style={[styles.avatar, { backgroundColor: colors.primary, borderRadius: borderRadius['2xl'], borderColor: colors.background }, shadow.soft]}>
            <Text style={[styles.avatarText, { color: colors.primaryForeground, fontFamily: fonts.display }]}>
              {shop.name[0]?.toUpperCase() ?? 'S'}
            </Text>
          </View>

          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.foreground, fontFamily: fonts.displaySemi }]} numberOfLines={2}>
              {shop.name}
            </Text>
            {following !== null && (
              <Button
                label={following ? 'Following' : 'Follow'}
                variant={following ? 'outline' : 'primary'}
                onPress={toggleFollow}
                style={styles.follow}
              />
            )}
          </View>
          {followError && <Text style={[styles.meta, { color: colors.destructive }]}>{followError}</Text>}

          <View style={styles.row}>
            <MapPin size={12} color={colors.foregroundMuted} />
            <Text style={[styles.meta, muted]}>
              {shop.location}{distance ? ` · ${distance}` : ''} · {shop.isOpen ? 'Open now' : 'Closed'}
            </Text>
          </View>
          <View style={styles.row}>
            {shop.reviewCount > 0 && (
              <>
                <Star size={12} color={colors.accent} fill={colors.accent} />
                <Text style={[styles.meta, muted]}>{shop.rating} · {shop.reviewCount} reviews</Text>
              </>
            )}
            {shop.isVerified && (
              <>
                <BadgeCheck size={13} color={colors.success} />
                <Text style={[styles.meta, { color: colors.success, fontFamily: fonts.medium }]}>Verified</Text>
              </>
            )}
          </View>
          {shop.description ? <Text style={[styles.description, muted]}>{shop.description}</Text> : null}

          <ContactActions shop={shop} />

          {data?.offers.length ? (
            <View style={styles.section}>
              <SectionHeader eyebrow="Right now" title="Offers" />
              {data.offers.map((o) => <OfferCard key={o.id} offer={o} style={styles.offer} />)}
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionHeader eyebrow="In this store" title="Products" />
            {data ? (
              data.products.length ? (
                <ProductGrid products={data.products} navigation={navigation} />
              ) : (
                <StateView title="No products yet" message="This store is still adding its collection." />
              )
            ) : (
              <StateView loading={!error} error={error} action={error ? { label: 'Try again', onPress: reload } : undefined} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cover: { height: 130 },
  fill: { flex: 1 },
  back: { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(8,7,10,0.45)', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  backText: { color: '#fff', fontSize: 18 },
  body: { paddingHorizontal: 20, marginTop: -36 },
  avatar: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  avatarText: { fontSize: 28 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12 },
  name: { fontSize: 24, flex: 1 },
  follow: { paddingVertical: 9, paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  meta: { fontSize: 12 },
  description: { fontSize: 14, lineHeight: 21, marginTop: 14, marginBottom: 16 },
  section: { marginTop: 28 },
  offer: { marginBottom: 10 },
});
