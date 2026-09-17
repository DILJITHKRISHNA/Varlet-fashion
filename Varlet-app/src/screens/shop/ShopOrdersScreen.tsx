import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Badge from '../../components/ui/Badge';

const MOCK_ORDERS = [
  { id: 'o1', customer: 'Aanya S.', item: 'Oversized Graphic Tee', status: 'Pending visit', time: '2h ago' },
  { id: 'o2', customer: 'Rohan M.', item: 'Wide-Leg Cargo Pants', status: 'Reserved', time: '5h ago' },
  { id: 'o3', customer: 'Priya N.', item: 'Classic White Sneakers', status: 'Completed', time: 'Yesterday' },
];

export default function ShopOrdersScreen({ navigation }: any) {
  const { colors, borderRadius, shadow, fonts } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Orders & visits" subtitle="Customer interest" showLogout />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {MOCK_ORDERS.map(o => (
          <View key={o.id} style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius['2xl'], borderColor: colors.border }, shadow.soft]}>
            <View style={styles.row}>
              <Text style={[styles.customer, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{o.customer}</Text>
              <Text style={{ color: colors.foregroundMuted, fontSize: 12 }}>{o.time}</Text>
            </View>
            <Text style={{ color: colors.foregroundMuted, marginTop: 4, fontFamily: fonts.regular }}>{o.item}</Text>
            <View style={{ marginTop: 10 }}>
              <Badge
                label={o.status}
                variant={o.status === 'Completed' ? 'success' : o.status === 'Reserved' ? 'accent' : 'muted'}
              />
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customer: { fontSize: 15, fontWeight: '600' },
});
