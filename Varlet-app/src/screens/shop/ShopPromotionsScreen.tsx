import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Button from '../../components/ui/Button';

const MOCK_PROMOTIONS = [
  { id: 'p1', title: 'Summer Sale — 20% off', status: 'Active', ends: 'Jun 30' },
  { id: 'p2', title: 'New arrivals spotlight', status: 'Scheduled', ends: 'Jul 15' },
  { id: 'p3', title: 'Weekend flash deal', status: 'Draft', ends: '—' },
];

export default function ShopPromotionsScreen({ navigation }: any) {
  const { colors, borderRadius, shadow, fonts } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Promotions" subtitle="Boost visibility" onBack={() => navigation.goBack()} showLogout />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Button label="Create promotion" variant="accent" fullWidth style={{ marginBottom: 20 }} onPress={() => {}} />

        {MOCK_PROMOTIONS.map(p => (
          <View key={p.id} style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius['2xl'], borderColor: colors.border }, shadow.soft]}>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{p.title}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.badge, { backgroundColor: colors.accentSoft, color: colors.accent }]}>{p.status}</Text>
              <Text style={{ color: colors.foregroundMuted, fontSize: 12, fontFamily: fonts.regular }}>Ends {p.ends}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 16, marginBottom: 12, borderWidth: 1 },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
});
