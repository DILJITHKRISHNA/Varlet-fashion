import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Package, Tag, Users, BarChart3 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { MOCK_PRODUCTS, MOCK_SHOPS } from '../../services/mockData';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Button from '../../components/ui/Button';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Shop Owner',
  manager: 'Manager',
  staff: 'Staff',
};

export default function ShopDashboardScreen({ navigation }: any) {
  const { colors, borderRadius, shadow, fonts } = useTheme();
  const { user, role, shopId } = useAuthStore();
  const shop = MOCK_SHOPS.find(s => s.id === shopId) ?? MOCK_SHOPS[0];
  const products = MOCK_PRODUCTS.filter(p => p.shopId === shop.id);
  const [activeSection, setActiveSection] = useState<'overview' | 'insights'>('overview');

  const navItems = [
    { icon: Package, label: 'My Products', screen: 'ShopProducts', roles: ['admin', 'manager', 'staff'] },
    { icon: Tag, label: 'Promotions', screen: 'ShopPromotions', roles: ['admin', 'manager'] },
    { icon: Users, label: 'Staff', screen: 'ShopStaff', roles: ['admin', 'manager'] },
    { icon: BarChart3, label: 'Store Analytics', screen: 'ShopAnalytics', roles: ['admin', 'manager'] },
  ].filter(item => role && item.roles.includes(role));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={shop.name}
        subtitle={`${ROLE_LABELS[role ?? 'admin']} · ${shop.location}`}
        showLogout
        dark
      />

      <View style={[styles.tabRow, { backgroundColor: colors.secondary, margin: 16, borderRadius: borderRadius.xl }]}>
        {(['overview', 'insights'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, { backgroundColor: activeSection === t ? colors.surface : 'transparent', borderRadius: borderRadius.lg }]}
            onPress={() => setActiveSection(t)}
          >
            <Text style={[styles.tabText, { color: activeSection === t ? colors.accent : colors.foregroundMuted, fontFamily: fonts.medium }]}>
              {t === 'overview' ? 'Overview' : 'Insights'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        {activeSection === 'overview' ? (
          <>
            <View style={styles.statsGrid}>
              <StatCard label="Products" value={products.length} color={colors.accent} />
              <StatCard label="Followers" value={shop.followerCount} color="#3B82F6" />
              <StatCard label="Rating" value={shop.rating} color="#10B981" />
              <StatCard label="Reviews" value={shop.reviewCount} color="#8B5CF6" />
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius['3xl'], borderColor: colors.border }, shadow.soft]}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: fonts.semiBold }]}>Store status</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: shop.isOpen ? colors.success : colors.destructive }]} />
                <Text style={{ color: colors.foreground, fontFamily: fonts.medium }}>{shop.isOpen ? 'Open now' : 'Closed'}</Text>
                {shop.isVerified && (
                  <Text style={{ color: colors.success, fontFamily: fonts.medium, marginLeft: 8 }}>· Verified</Text>
                )}
              </View>
              <Text style={{ color: colors.foregroundMuted, marginTop: 8, fontFamily: fonts.regular }}>
                {shop.description}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius['3xl'], borderColor: colors.border }, shadow.soft]}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: fonts.semiBold }]}>Quick actions</Text>
              {navItems.map(item => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.navItem, { borderBottomColor: colors.border }]}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <item.icon size={20} color={colors.foreground} />
                  <Text style={[styles.navLabel, { color: colors.foreground, fontFamily: fonts.medium }]}>{item.label}</Text>
                  <Text style={{ color: colors.foregroundMuted }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button label="View store profile" variant="outline" fullWidth onPress={() => navigation.navigate('ShopStoreProfile')} />
          </>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius['3xl'], borderColor: colors.border }, shadow.soft]}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: fonts.semiBold }]}>This week</Text>
              {[
                { label: 'Store views', value: '1,248' },
                { label: 'Product clicks', value: '386' },
                { label: 'Direction requests', value: '94' },
                { label: 'New followers', value: '47' },
              ].map(row => (
                <View key={row.label} style={[styles.insightRow, { borderBottomColor: colors.border }]}>
                  <Text style={{ color: colors.foregroundMuted, fontFamily: fonts.regular }}>{row.label}</Text>
                  <Text style={{ color: colors.foreground, fontFamily: fonts.semiBold }}>{row.value}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: colors.primary, borderRadius: borderRadius['3xl'] }]}>
              <Text style={{ color: colors.primaryForeground, fontFamily: fonts.semiBold, fontSize: 16, marginBottom: 8 }}>
                Top performing product
              </Text>
              {products[0] && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Image source={{ uri: products[0].images[0] }} style={{ width: 56, height: 56, borderRadius: borderRadius.lg }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.primaryForeground, fontFamily: fonts.medium }} numberOfLines={1}>{products[0].name}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{products[0].reviewCount} reviews</Text>
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const { colors, borderRadius, fonts } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderRadius: borderRadius['2xl'], borderColor: colors.border }]}>
      <Text style={{ fontSize: 22, fontWeight: '600', color: colors.foreground, fontFamily: fonts.semiBold }}>{value}</Text>
      <Text style={{ fontSize: 12, color: colors.foregroundMuted, marginTop: 4, fontFamily: fonts.regular }}>{label}</Text>
      <View style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { flexDirection: 'row', padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: '47%', padding: 16, borderWidth: 1 },
  card: { padding: 16, marginBottom: 16, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  navLabel: { flex: 1, fontSize: 15 },
  insightRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
});
