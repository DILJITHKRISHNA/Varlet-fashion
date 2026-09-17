import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { MOCK_SHOPS } from '../../services/mockData';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Button from '../../components/ui/Button';

const MOCK_STAFF = [
  { id: 's1', name: 'Priya Nair', role: 'Manager', email: 'priya@urbanthread.com' },
  { id: 's2', name: 'Arjun K.', role: 'Staff', email: 'arjun@urbanthread.com' },
];

export default function ShopStaffScreen({ navigation }: any) {
  const { colors, borderRadius, shadow, fonts } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Staff" subtitle="Team access" onBack={() => navigation.goBack()} showLogout />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Button label="Invite team member" variant="outline" fullWidth style={{ marginBottom: 20 }} onPress={() => {}} />

        {MOCK_STAFF.map(s => (
          <View key={s.id} style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius['2xl'], borderColor: colors.border }, shadow.soft]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.primaryForeground, fontFamily: fonts.semiBold }}>{s.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontFamily: fonts.semiBold }}>{s.name}</Text>
              <Text style={{ color: colors.foregroundMuted, fontSize: 12 }}>{s.role} · {s.email}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 12, borderWidth: 1 },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
