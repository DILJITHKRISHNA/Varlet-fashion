import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import {
  User, Palette, MapPin, Bell, Star, Lock, HelpCircle, ChevronRight,
  Pencil, Heart, Calendar, type LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import Glow from '../../components/ui/Glow';
import { getWishlistProducts, getFollowedShops } from '../../services/api';
import type { Product } from '../../services/mockData';

const { width } = Dimensions.get('window');

// Cycled across the "Style DNA" chips so preferences read as a colorful
// signature strip instead of one flat tint — same palette used for category
// cards on the Feed, so it stays inside the existing brand system.
const DNA_COLORS = ['#FF6B35', '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B'];

export default function ProfileScreen({ navigation }: any) {
  const { colors, borderRadius, shadow, fonts } = useTheme();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'saved' | 'settings'>('saved');
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    getWishlistProducts(user.id).then(setSavedProducts).catch(() => {});
    getFollowedShops(user.id).then((shops) => setFollowingCount(shops.length)).catch(() => {});
  }, [user]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingBottom: 40, alignItems: 'center', overflow: 'hidden' },
    avatarRing: {
      width: 96, height: 96, borderRadius: 48,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarInner: {
      width: 86, height: 86, borderRadius: 43,
      backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 30, fontWeight: '700', color: colors.primaryForeground },
    avatarImg: { width: 80, height: 80, borderRadius: 40 },
    editBadge: {
      position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15,
      backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
      borderWidth: 3, borderColor: colors.background,
    },
    userName: { fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 14 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
    metaText: { fontSize: 12, color: colors.foregroundMuted },
    metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.foregroundSubtle },
    dnaLabel: { fontSize: 11, fontWeight: '700', color: colors.foregroundMuted, letterSpacing: 1.4, marginTop: 20, marginBottom: 10 },
    dnaRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 24 },
    dnaChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full, gap: 6 },
    dnaDot: { width: 6, height: 6, borderRadius: 3 },
    dnaText: { fontSize: 12, fontWeight: '600' },
    statsCard: {
      flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius['3xl'],
      marginHorizontal: 20, marginTop: -24, paddingVertical: 18,
    },
    stat: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 19, fontWeight: '700', color: colors.foreground },
    statLabel: { fontSize: 11, color: colors.foregroundMuted, marginTop: 2 },
    statDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
    tabWrap: { paddingHorizontal: 20, marginTop: 20 },
    tabRow: { flexDirection: 'row', backgroundColor: colors.secondary, borderRadius: borderRadius.xl, padding: 4 },
    tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: borderRadius.lg },
    tabText: { fontSize: 13, fontWeight: '600' },
    content: { padding: 20, paddingBottom: 100 },
    productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    productCard: { width: (width - 52) / 2, borderRadius: borderRadius.xl, overflow: 'hidden', backgroundColor: colors.surface },
    productImgWrap: { position: 'relative' },
    productImg: { width: '100%', height: 150, resizeMode: 'cover' },
    savedBadge: {
      position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 13,
      backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
    },
    productName: { padding: 10, fontSize: 12, fontWeight: '600', color: colors.foreground },
    emptyState: { alignItems: 'center', paddingVertical: 48 },
    emptyIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    emptyText: { fontSize: 14, color: colors.foregroundMuted },
    settingItem: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.surface, borderRadius: borderRadius.xl,
      paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10,
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center' },
    settingIconWrap: {
      width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.accentSoft,
      alignItems: 'center', justifyContent: 'center',
    },
    settingText: { fontSize: 14, color: colors.foreground, fontWeight: '600', marginLeft: 12 },
    logoutBtn: {
      marginTop: 12, borderRadius: borderRadius.xl, padding: 14,
      backgroundColor: colors.destructiveSoft, alignItems: 'center',
    },
    logoutText: { fontSize: 15, fontWeight: '700', color: colors.destructive },
  });

  const SETTINGS: { icon: LucideIcon; label: string; route: string | null }[] = [
    { icon: User, label: 'Edit Profile', route: null },
    { icon: Palette, label: 'Fashion Preferences', route: null },
    { icon: MapPin, label: 'Location', route: null },
    { icon: Bell, label: 'Notifications', route: 'Notifications' },
    { icon: Star, label: 'My Reviews', route: null },
    { icon: Lock, label: 'Privacy & Security', route: null },
    { icon: HelpCircle, label: 'Help & Support', route: null },
  ];

  const joinedLabel = user?.joinedAt ? `Member since ${format(new Date(user.joinedAt), 'MMM yyyy')}` : null;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Glow color="#FF2E63" size={width * 1.1} opacity={0.4} style={{ top: -width * 0.55, alignSelf: 'center' }} />

          <View>
            <LinearGradient colors={colors.gradientAccent} style={s.avatarRing}>
              <View style={s.avatarInner}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={s.avatarImg} />
                ) : (
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
            <TouchableOpacity style={s.editBadge}>
              <Pencil size={13} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>

          <Text style={s.userName}>{user?.name ?? 'Fashion Explorer'}</Text>
          <View style={s.metaRow}>
            <Text style={s.metaText}>{user?.email ?? ''}</Text>
            {joinedLabel && (
              <>
                <View style={s.metaDot} />
                <Calendar size={11} color={colors.foregroundMuted} />
                <Text style={s.metaText}>{joinedLabel}</Text>
              </>
            )}
          </View>

          {(user?.fashionPreferences ?? []).length > 0 && (
            <>
              <Text style={s.dnaLabel}>STYLE DNA</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dnaRow}>
                {(user?.fashionPreferences ?? []).map((p, i) => {
                  const tint = DNA_COLORS[i % DNA_COLORS.length];
                  return (
                    <View key={p} style={[s.dnaChip, { backgroundColor: tint + '18' }]}>
                      <View style={[s.dnaDot, { backgroundColor: tint }]} />
                      <Text style={[s.dnaText, { color: tint }]}>{p}</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </>
          )}
        </View>

        <View style={[s.statsCard, shadow.glow]}>
          {[[String(followingCount), 'Following'], [String(savedProducts.length), 'Saved'], ['0', 'Reviews']].map(([num, label], i) => (
            <React.Fragment key={label}>
              {i > 0 && <View style={s.statDivider} />}
              <View style={s.stat}>
                <Text style={s.statNum}>{num}</Text>
                <Text style={s.statLabel}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={s.tabWrap}>
          <View style={s.tabRow}>
            {([
              { key: 'saved' as const, label: 'Saved', icon: Heart },
              { key: 'settings' as const, label: 'Settings', icon: User },
            ]).map(t => {
              const active = activeTab === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[s.tabBtn, active && { backgroundColor: colors.surface, ...shadow.soft }]}
                  onPress={() => setActiveTab(t.key)}
                >
                  <t.icon size={14} color={active ? colors.accent : colors.foregroundMuted} />
                  <Text style={[s.tabText, { color: active ? colors.accent : colors.foregroundMuted }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.content}>
          {activeTab === 'saved' ? (
            savedProducts.length ? (
              <View style={s.productGrid}>
                {savedProducts.map(p => (
                  <TouchableOpacity
                    key={p.id} style={s.productCard}
                    onPress={() => navigation.navigate('ProductDetail', { product: p })}
                  >
                    <View style={s.productImgWrap}>
                      <Image source={{ uri: p.images[0] }} style={s.productImg} />
                      <View style={s.savedBadge}>
                        <Heart size={13} color="#fff" fill="#fff" />
                      </View>
                    </View>
                    <Text style={s.productName} numberOfLines={1}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={s.emptyState}>
                <View style={s.emptyIconWrap}>
                  <Heart size={28} color={colors.foregroundMuted} />
                </View>
                <Text style={s.emptyText}>Nothing saved yet</Text>
              </View>
            )
          ) : (
            <>
              {SETTINGS.map(item => (
                <TouchableOpacity
                  key={item.label} style={s.settingItem}
                  onPress={() => item.route && navigation.navigate(item.route)}
                >
                  <View style={s.settingLeft}>
                    <View style={s.settingIconWrap}>
                      <item.icon size={18} color={colors.accent} />
                    </View>
                    <Text style={s.settingText}>{item.label}</Text>
                  </View>
                  <ChevronRight size={18} color={colors.foregroundMuted} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={s.logoutBtn} onPress={logout}>
                <Text style={s.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
