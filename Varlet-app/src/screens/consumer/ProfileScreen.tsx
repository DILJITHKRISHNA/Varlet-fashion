import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { getWishlistProducts, getFollowedShops } from '../../services/api';
import type { Product } from '../../services/mockData';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'saved' | 'activity'>('saved');
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    getWishlistProducts(user.id).then(setSavedProducts).catch(() => {});
    getFollowedShops(user.id).then((shops) => setFollowingCount(shops.length)).catch(() => {});
  }, [user]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingBottom: 0, backgroundColor: colors.surface },
    coverGrad: { height: 100 },
    avatarWrap: { alignItems: 'center', marginTop: -40 },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.surface, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
    avatarImg: { width: 80, height: 80, borderRadius: 40 },
    userName: { fontSize: 20, fontWeight: '700', color: colors.foreground, textAlign: 'center', marginTop: 10 },
    userEmail: { fontSize: 13, color: colors.foregroundMuted, textAlign: 'center', marginTop: 2 },
    prefRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 12, paddingHorizontal: 20 },
    prefChip: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.accentSoft, borderRadius: borderRadius.full },
    prefText: { fontSize: 11, fontWeight: '600', color: '#FF6B35' },
    editBtn: {
      alignSelf: 'center', marginTop: 14, marginBottom: 16,
      borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.full,
      paddingHorizontal: 24, paddingVertical: 8,
    },
    editText: { fontSize: 13, fontWeight: '600', color: colors.foreground },
    statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
    stat: { flex: 1, alignItems: 'center', paddingVertical: 14 },
    statNum: { fontSize: 18, fontWeight: '700', color: colors.foreground },
    statLabel: { fontSize: 11, color: colors.foregroundMuted, marginTop: 2 },
    statDivider: { width: 1, backgroundColor: colors.border },
    tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
    tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
    tabText: { fontSize: 14, fontWeight: '600' },
    content: { padding: 16, paddingBottom: 100 },
    settingItem: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center' },
    settingIcon: { fontSize: 20, marginRight: 12, width: 36, textAlign: 'center' },
    settingText: { fontSize: 15, color: colors.foreground, fontWeight: '500' },
    settingArrow: { fontSize: 16, color: colors.foregroundMuted },
    logoutBtn: {
      marginTop: 20, borderRadius: borderRadius.xl, padding: 14,
      backgroundColor: '#FEE2E2', alignItems: 'center',
    },
    logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
    productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    productCard: { width: (width - 44) / 2, borderRadius: borderRadius.xl, overflow: 'hidden', backgroundColor: colors.surface },
    productImg: { width: '100%', height: 140, resizeMode: 'cover' },
    productName: { padding: 8, fontSize: 12, fontWeight: '600', color: colors.foreground },
  });

  const SETTINGS = [
    { icon: '👤', label: 'Edit Profile', route: null },
    { icon: '🎨', label: 'Fashion Preferences', route: null },
    { icon: '📍', label: 'Location', route: null },
    { icon: '🔔', label: 'Notifications', route: 'Notifications' },
    { icon: '⭐', label: 'My Reviews', route: null },
    { icon: '🔒', label: 'Privacy & Security', route: null },
    { icon: '❓', label: 'Help & Support', route: null },
  ];

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.header}>
          <LinearGradient colors={['#FF6B35', '#E85A28']} style={s.coverGrad} />
          <View style={s.avatarWrap}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={s.avatarImg} />
            ) : (
              <View style={s.avatar}>
                <Text style={s.avatarText}>{user?.name?.[0] ?? 'U'}</Text>
              </View>
            )}
          </View>
          <Text style={s.userName}>{user?.name ?? 'Fashion Explorer'}</Text>
          <Text style={s.userEmail}>{user?.email ?? ''}</Text>
          <View style={s.prefRow}>
            {(user?.fashionPreferences ?? []).slice(0, 4).map(p => (
              <View key={p} style={s.prefChip}><Text style={s.prefText}>{p}</Text></View>
            ))}
          </View>
          <TouchableOpacity style={s.editBtn}><Text style={s.editText}>Edit Profile</Text></TouchableOpacity>

          <View style={s.statsRow}>
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
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          {(['saved', 'activity'] as const).map(t => (
            <TouchableOpacity key={t} style={s.tabBtn} onPress={() => setActiveTab(t)}>
              <Text style={[s.tabText, { color: activeTab === t ? '#FF6B35' : colors.foregroundMuted, borderBottomWidth: activeTab === t ? 2 : 0, borderBottomColor: '#FF6B35' }]}>
                {t === 'saved' ? 'Saved Items' : 'Settings'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.content}>
          {activeTab === 'saved' ? (
            <View style={s.productGrid}>
              {savedProducts.slice(0, 4).map(p => (
                <View key={p.id} style={s.productCard}>
                  <Image source={{ uri: p.images[0] }} style={s.productImg} />
                  <Text style={s.productName} numberOfLines={1}>{p.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <>
              {SETTINGS.map(item => (
                <TouchableOpacity
                  key={item.label} style={s.settingItem}
                  onPress={() => item.route && navigation.navigate(item.route)}
                >
                  <View style={s.settingLeft}>
                    <Text style={s.settingIcon}>{item.icon}</Text>
                    <Text style={s.settingText}>{item.label}</Text>
                  </View>
                  <Text style={s.settingArrow}>›</Text>
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
