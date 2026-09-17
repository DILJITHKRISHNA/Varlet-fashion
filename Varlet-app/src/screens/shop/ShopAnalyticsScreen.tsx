import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import ScreenHeader from '../../components/ui/ScreenHeader';

export default function ShopAnalyticsScreen({ navigation }: any) {
  const { colors, borderRadius, shadow, fonts } = useTheme();
  const { shopId } = useAuthStore();

  const weeklyViews = [120, 180, 150, 210, 190, 248, 230];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Store analytics" onBack={() => navigation.goBack()} showLogout />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius['3xl'], borderColor: colors.border }, shadow.soft]}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: fonts.semiBold }]}>Weekly store views</Text>
          <View style={styles.chart}>
            {weeklyViews.map((v, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.bar, { height: (v / 250) * 100, backgroundColor: colors.accent }]} />
                <Text style={{ fontSize: 10, color: colors.foregroundMuted, marginTop: 4 }}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {[
          { label: 'Profile views', value: '3,420' },
          { label: 'Direction taps', value: '892' },
          { label: 'Product saves', value: '1,156' },
          { label: 'Follower growth', value: '+12%' },
        ].map(row => (
          <View key={row.label} style={[styles.row, { backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderColor: colors.border }]}>
            <Text style={{ color: colors.foregroundMuted, fontFamily: fonts.regular }}>{row.label}</Text>
            <Text style={{ color: colors.foreground, fontFamily: fonts.semiBold }}>{row.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 16, marginBottom: 16, borderWidth: 1 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 },
  barCol: { flex: 1, alignItems: 'center' },
  bar: { width: '100%', borderRadius: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, marginBottom: 10, borderWidth: 1 },
});
