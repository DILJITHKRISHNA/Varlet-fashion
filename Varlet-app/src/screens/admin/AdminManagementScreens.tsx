import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { MOCK_SHOPS, MOCK_PRODUCTS, MOCK_USERS } from '../../services/mockData';

// ─── Admin Shops ─────────────────────────────────────────────────────────────
export function AdminShopsScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' },
    back: { fontSize: 22, color: colors.foreground, marginRight: 14 },
    title: { fontSize: 22, fontWeight: '700', color: colors.foreground, flex: 1 },
    addBtn: { borderRadius: borderRadius.full, overflow: 'hidden' },
    addGrad: { paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
    addText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    content: { padding: 16, paddingBottom: 100 },
    card: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    coverImg: { width: '100%', height: 80, resizeMode: 'cover' },
    cardBody: { padding: 14 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    shopName: { fontSize: 16, fontWeight: '700', color: colors.foreground },
    verifiedBadge: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#D1FAE5', borderRadius: borderRadius.full },
    verifiedText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
    meta: { fontSize: 12, color: colors.foregroundMuted, marginTop: 4 },
    actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    actionBtn: { flex: 1, paddingVertical: 8, borderRadius: borderRadius.lg, alignItems: 'center', borderWidth: 1 },
    actionText: { fontSize: 13, fontWeight: '600' },
  });
  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>Shop Management</Text>
        <TouchableOpacity style={s.addBtn}>
          <LinearGradient colors={['#FF6B35', '#E85A28']} style={s.addGrad}>
            <Text style={s.addText}>+ Add Shop</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {MOCK_SHOPS.map(shop => (
          <View key={shop.id} style={s.card}>
            <Image source={{ uri: shop.coverImage }} style={s.coverImg} />
            <View style={s.cardBody}>
              <View style={s.row}>
                <Text style={s.shopName}>{shop.name}</Text>
                {shop.isVerified && <View style={s.verifiedBadge}><Text style={s.verifiedText}>✓ Verified</Text></View>}
              </View>
              <Text style={s.meta}>{shop.location} · {shop.productCount} products · ⭐ {shop.rating}</Text>
              <View style={s.actionRow}>
                <TouchableOpacity style={[s.actionBtn, { borderColor: colors.border }]}>
                  <Text style={[s.actionText, { color: colors.foreground }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { borderColor: '#EF4444' }]}>
                  <Text style={[s.actionText, { color: '#EF4444' }]}>Disable</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Admin Products ───────────────────────────────────────────────────────────
export function AdminProductsScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' },
    back: { fontSize: 22, color: colors.foreground, marginRight: 14 },
    title: { fontSize: 22, fontWeight: '700', color: colors.foreground, flex: 1 },
    addBtn: { borderRadius: borderRadius.full, overflow: 'hidden' },
    addGrad: { paddingHorizontal: 16, paddingVertical: 8 },
    addText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    content: { padding: 16, paddingBottom: 100 },
    row: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
      borderRadius: borderRadius.xl, marginBottom: 10, overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    img: { width: 76, height: 76, resizeMode: 'cover' },
    info: { flex: 1, padding: 12 },
    name: { fontSize: 14, fontWeight: '700', color: colors.foreground },
    meta: { fontSize: 12, color: colors.foregroundMuted, marginTop: 2 },
    price: { fontSize: 14, fontWeight: '700', color: '#FF6B35', marginTop: 4 },
    actions: { padding: 8, gap: 6 },
    editBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  });
  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>Products</Text>
        <TouchableOpacity style={s.addBtn}>
          <LinearGradient colors={['#FF6B35', '#E85A28']} style={s.addGrad}>
            <Text style={s.addText}>+ Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {MOCK_PRODUCTS.map(p => (
          <View key={p.id} style={s.row}>
            <Image source={{ uri: p.images[0] }} style={s.img} />
            <View style={s.info}>
              <Text style={s.name} numberOfLines={1}>{p.name}</Text>
              <Text style={s.meta}>{p.brand} · {p.category}</Text>
              <Text style={s.price}>₹{p.price.toLocaleString()}</Text>
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.editBtn}><Text>✏️</Text></TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn}><Text>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Admin Users ──────────────────────────────────────────────────────────────
export function AdminUsersScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' },
    back: { fontSize: 22, color: colors.foreground, marginRight: 14 },
    title: { fontSize: 22, fontWeight: '700', color: colors.foreground },
    content: { padding: 16, paddingBottom: 100 },
    card: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
      borderRadius: borderRadius.xl, padding: 14, marginBottom: 10,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
    avatarFallback: { width: 46, height: 46, borderRadius: 23, marginRight: 12, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
    name: { fontSize: 15, fontWeight: '700', color: colors.foreground },
    meta: { fontSize: 12, color: colors.foregroundMuted, marginTop: 2 },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.full, marginTop: 4, alignSelf: 'flex-start' },
    roleText: { fontSize: 11, fontWeight: '700' },
    actionBtn: { marginLeft: 'auto' as any, padding: 6 },
    actionText: { fontSize: 18 },
  });
  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>User Management</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {MOCK_USERS.map(u => (
          <View key={u.id} style={s.card}>
            {u.avatar
              ? <Image source={{ uri: u.avatar }} style={s.avatar} />
              : <View style={s.avatarFallback}><Text style={s.avatarText}>{u.name[0]}</Text></View>
            }
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{u.name}</Text>
              <Text style={s.meta}>{u.email}</Text>
              <View style={[s.roleBadge, { backgroundColor: u.role === 'admin' ? '#FEE2E2' : colors.secondary }]}>
                <Text style={[s.roleText, { color: u.role === 'admin' ? '#EF4444' : colors.foreground }]}>{u.role}</Text>
              </View>
            </View>
            <TouchableOpacity style={s.actionBtn}>
              <Text style={s.actionText}>⋯</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Admin Promotions ─────────────────────────────────────────────────────────
export function AdminPromotionsScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const [promos] = useState([
    { id: 'p1', title: 'Summer Sale', discount: '30% off', status: 'active', ends: '2026-06-30' },
    { id: 'p2', title: 'New User Discount', discount: '₹200 off', status: 'active', ends: '2026-12-31' },
    { id: 'p3', title: 'Flash Friday', discount: '50% off', status: 'scheduled', ends: '2026-06-14' },
  ]);
  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' },
    back: { fontSize: 22, color: colors.foreground, marginRight: 14 },
    title: { fontSize: 22, fontWeight: '700', color: colors.foreground, flex: 1 },
    addBtn: { borderRadius: borderRadius.full, overflow: 'hidden' },
    addGrad: { paddingHorizontal: 16, paddingVertical: 8 },
    addText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    content: { padding: 16, paddingBottom: 100 },
    card: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    promoTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground },
    discount: { fontSize: 22, fontWeight: '700', color: '#FF6B35', marginTop: 4 },
    meta: { fontSize: 12, color: colors.foregroundMuted, marginTop: 4 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  });
  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>Promotions</Text>
        <TouchableOpacity style={s.addBtn}>
          <LinearGradient colors={['#FF6B35', '#E85A28']} style={s.addGrad}>
            <Text style={s.addText}>+ Create</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {promos.map(p => (
          <View key={p.id} style={s.card}>
            <View style={s.row}>
              <Text style={s.promoTitle}>{p.title}</Text>
              <View style={[s.statusBadge, { backgroundColor: p.status === 'active' ? '#D1FAE5' : '#FEF3C7' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: p.status === 'active' ? '#10B981' : '#F59E0B' }}>{p.status}</Text>
              </View>
            </View>
            <Text style={s.discount}>{p.discount}</Text>
            <Text style={s.meta}>Ends {p.ends}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Admin Banners ────────────────────────────────────────────────────────────
export function AdminBannersScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const { MOCK_BANNERS } = require('../../services/mockData');
  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' },
    back: { fontSize: 22, color: colors.foreground, marginRight: 14 },
    title: { fontSize: 22, fontWeight: '700', color: colors.foreground, flex: 1 },
    addBtn: { borderRadius: borderRadius.full, overflow: 'hidden' },
    addGrad: { paddingHorizontal: 16, paddingVertical: 8 },
    addText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    content: { padding: 16, paddingBottom: 100 },
    card: { borderRadius: borderRadius.xl, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    img: { width: '100%', height: 120, resizeMode: 'cover' },
    info: { backgroundColor: colors.surface, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bannerTitle: { fontSize: 14, fontWeight: '700', color: colors.foreground },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.secondary, borderRadius: borderRadius.full },
    typeText: { fontSize: 11, color: colors.foreground },
  });
  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>Banners</Text>
        <TouchableOpacity style={s.addBtn}>
          <LinearGradient colors={['#FF6B35', '#E85A28']} style={s.addGrad}>
            <Text style={s.addText}>+ Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {MOCK_BANNERS.map((b: any) => (
          <View key={b.id} style={s.card}>
            <Image source={{ uri: b.image }} style={s.img} />
            <View style={s.info}>
              <Text style={s.bannerTitle}>{b.title}</Text>
              <View style={s.typeBadge}><Text style={s.typeText}>{b.type}</Text></View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
