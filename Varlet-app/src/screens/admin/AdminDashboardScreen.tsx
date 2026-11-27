import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Store, Package, Tag, Users, Image as ImageIcon, BarChart3, Bell, ClipboardList,
  UserCheck, Search, Palette, LayoutGrid, ChevronRight, type LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { MOCK_ANALYTICS } from '../../services/mockData';
import ScreenHeader from '../../components/ui/ScreenHeader';

const { width } = Dimensions.get('window');

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: LucideIcon; color: string }) {
  const { colors, borderRadius } = useTheme();
  return (
    <View style={{
      width: (width - 48) / 2, backgroundColor: colors.surface, borderRadius: borderRadius.xl,
      padding: 14, marginBottom: 12,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </View>
      </View>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground }}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
      <Text style={{ fontSize: 12, color: colors.foregroundMuted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const { colors } = useTheme();
  const max = Math.max(...data);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 6 }}>
      {data.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flex: 1, justifyContent: 'flex-end', width: '100%' }}>
            <View style={{ height: (v / max) * 70, backgroundColor: color, borderRadius: 4 }} />
          </View>
          <Text style={{ fontSize: 9, color: colors.foregroundMuted, marginTop: 4 }}>{labels[i]}</Text>
        </View>
      ))}
    </View>
  );
}

export default function AdminDashboardScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const [activeSection, setActiveSection] = useState<'overview' | 'analytics'>('overview');

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    greeting: { fontSize: 13, color: colors.foregroundMuted },
    title: { fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 2 },
    badge: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.accentSoft, borderRadius: borderRadius.full },
    badgeText: { fontSize: 12, fontWeight: '600', color: '#FF6B35' },
    tabRow: { flexDirection: 'row', margin: 16, backgroundColor: colors.secondary, borderRadius: borderRadius.xl, padding: 4 },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: borderRadius.lg, alignItems: 'center' },
    tabText: { fontSize: 13, fontWeight: '600' },
    content: { paddingHorizontal: 16, paddingBottom: 100 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    sectionCard: {
      backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: 16, marginBottom: 14,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
    navItem: {
      flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    navIconWrap: { width: 36, alignItems: 'center' },
    navLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.foreground, marginLeft: 12 },
    rankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    rankNum: { fontSize: 14, fontWeight: '700', color: colors.foregroundMuted, width: 24 },
    rankBar: { flex: 1, height: 8, borderRadius: 4, marginHorizontal: 10 },
    rankLabel: { fontSize: 12, color: colors.foreground, width: 80 },
  });

  const NAV_ITEMS: { icon: LucideIcon; label: string; screen: string | null }[] = [
    { icon: Store, label: 'Shop Management', screen: 'AdminShops' },
    { icon: Package, label: 'Product Management', screen: 'AdminProducts' },
    { icon: Tag, label: 'Promotions', screen: 'AdminPromotions' },
    { icon: Users, label: 'User Management', screen: 'AdminUsers' },
    { icon: ImageIcon, label: 'Banner Management', screen: 'AdminBanners' },
    { icon: BarChart3, label: 'Analytics', screen: null },
    { icon: Bell, label: 'Notifications', screen: null },
    { icon: ClipboardList, label: 'Reports & Moderation', screen: null },
  ];

  return (
    <View style={s.container}>
      <ScreenHeader title="Platform Admin" subtitle="Varlet overview" showLogout dark />

      <View style={s.tabRow}>
        {(['overview', 'analytics'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tabBtn, { backgroundColor: activeSection === t ? colors.surface : 'transparent', elevation: activeSection === t ? 2 : 0 }]} onPress={() => setActiveSection(t)}>
            <Text style={[s.tabText, { color: activeSection === t ? '#FF6B35' : colors.foregroundMuted }]}>
              {t === 'overview' ? 'Overview' : 'Analytics'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {activeSection === 'overview' ? (
          <>
            <View style={s.statsGrid}>
              <StatCard label="Total Users" value={MOCK_ANALYTICS.totalUsers} icon={Users} color="#3B82F6" />
              <StatCard label="Active Users" value={MOCK_ANALYTICS.activeUsers} icon={UserCheck} color="#10B981" />
              <StatCard label="Total Products" value={MOCK_ANALYTICS.totalProducts} icon={Package} color="#8B5CF6" />
              <StatCard label="Total Shops" value={MOCK_ANALYTICS.totalShops} icon={Store} color="#FF6B35" />
            </View>

            {/* Revenue card */}
            <View style={s.sectionCard}>
              <Text style={s.sectionTitle}>Monthly Revenue</Text>
              <BarChart
                data={MOCK_ANALYTICS.monthlyRevenue}
                labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
                color="#FF6B35"
              />
              <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 12 }}>
                ₹{MOCK_ANALYTICS.revenue.toLocaleString()}
              </Text>
              <Text style={{ fontSize: 12, color: '#10B981', marginTop: 2 }}>↑ 18% from last month</Text>
            </View>

            {/* Quick nav */}
            <View style={s.sectionCard}>
              <Text style={s.sectionTitle}>Manage</Text>
              {NAV_ITEMS.map(item => (
                <TouchableOpacity key={item.label} style={s.navItem} onPress={() => item.screen && navigation.navigate(item.screen)}>
                  <View style={s.navIconWrap}>
                    <item.icon size={20} color={colors.foreground} />
                  </View>
                  <Text style={s.navLabel}>{item.label}</Text>
                  <ChevronRight size={18} color={colors.foregroundMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Most Searched */}
            <View style={s.sectionCard}>
              <View style={s.sectionTitleRow}>
                <Search size={16} color={colors.foregroundMuted} />
                <Text style={s.sectionTitle}>Most Searched Products</Text>
              </View>
              {MOCK_ANALYTICS.mostSearched.map((term, i) => (
                <View key={term} style={s.rankRow}>
                  <Text style={s.rankNum}>#{i + 1}</Text>
                  <View style={[s.rankBar, { backgroundColor: `rgba(255,107,53,${1 - i * 0.15})`, width: `${90 - i * 12}%` as any }]} />
                  <Text style={s.rankLabel} numberOfLines={1}>{term}</Text>
                </View>
              ))}
            </View>

            {/* Popular categories */}
            <View style={s.sectionCard}>
              <View style={s.sectionTitleRow}>
                <LayoutGrid size={16} color={colors.foregroundMuted} />
                <Text style={s.sectionTitle}>Popular Categories</Text>
              </View>
              <BarChart
                data={[581, 342, 276, 218, 195]}
                labels={["Women's", "Men's", 'Footwear', 'Street', 'Ethnic']}
                color="#8B5CF6"
              />
            </View>

            {/* Popular colors */}
            <View style={s.sectionCard}>
              <View style={s.sectionTitleRow}>
                <Palette size={16} color={colors.foregroundMuted} />
                <Text style={s.sectionTitle}>Popular Colors</Text>
              </View>
              {MOCK_ANALYTICS.popularColors.map((color, i) => (
                <View key={color} style={s.rankRow}>
                  <Text style={s.rankNum}>#{i + 1}</Text>
                  <View style={[s.rankBar, { backgroundColor: '#3B82F6', opacity: 1 - i * 0.15 }]} />
                  <Text style={s.rankLabel}>{color}</Text>
                </View>
              ))}
            </View>

            {/* Demographics */}
            <View style={s.sectionCard}>
              <View style={s.sectionTitleRow}>
                <Users size={16} color={colors.foregroundMuted} />
                <Text style={s.sectionTitle}>User Demographics</Text>
              </View>
              {Object.entries(MOCK_ANALYTICS.userDemographics).map(([age, pct]) => (
                <View key={age} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.foreground, fontWeight: '600' }}>{age} years</Text>
                    <Text style={{ fontSize: 13, color: colors.foregroundMuted }}>{pct}%</Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: colors.secondary, borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ width: `${pct}%`, height: '100%', backgroundColor: '#FF6B35', borderRadius: 4 }} />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
