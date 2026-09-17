import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Store, Users, Bell, Shield, LogOut } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { MOCK_SHOPS } from '../../services/mockData';
import ScreenHeader from '../../components/ui/ScreenHeader';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Shop Owner',
  manager: 'Manager',
  staff: 'Staff',
};

export default function ShopSettingsScreen({ navigation }: any) {
  const { colors, borderRadius, fonts } = useTheme();
  const { user, role, shopId, logout } = useAuthStore();
  const shop = MOCK_SHOPS.find(s => s.id === shopId) ?? MOCK_SHOPS[0];

  const settings = [
    { icon: Store, label: 'Store profile', screen: 'ShopStoreProfile' },
    { icon: Users, label: 'Staff management', screen: 'ShopStaff', roles: ['admin', 'manager'] },
    { icon: Bell, label: 'Notifications', screen: null },
    { icon: Shield, label: 'Privacy & security', screen: null },
  ].filter(item => !item.roles || (role && item.roles.includes(role)));

  const handleLogout = () => {
    Alert.alert('Log out', 'Sign out of your shop account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Store" subtitle={shop.name} showLogout />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderRadius: borderRadius['3xl'], borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={{ color: colors.primaryForeground, fontSize: 20, fontFamily: fonts.semiBold }}>
              {user?.name?.[0] ?? 'S'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{user?.name}</Text>
          <Text style={{ color: colors.foregroundMuted, fontFamily: fonts.regular }}>{user?.email}</Text>
          <Text style={{ color: colors.accent, marginTop: 6, fontFamily: fonts.medium, fontSize: 13 }}>
            {ROLE_LABELS[role ?? 'admin']}
          </Text>
        </View>

        <View style={[styles.menu, { backgroundColor: colors.surface, borderRadius: borderRadius['3xl'], borderColor: colors.border }]}>
          {settings.map(item => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => item.screen && navigation.navigate(item.screen)}
            >
              <item.icon size={20} color={colors.foreground} />
              <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: fonts.medium }]}>{item.label}</Text>
              <Text style={{ color: colors.foregroundMuted }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.destructive, borderRadius: borderRadius.full }]}
          onPress={handleLogout}
        >
          <LogOut size={18} color={colors.destructive} />
          <Text style={{ color: colors.destructive, fontFamily: fonts.semiBold, marginLeft: 8 }}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: { alignItems: 'center', padding: 24, marginBottom: 16, borderWidth: 1 },
  avatar: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  userName: { fontSize: 18, fontWeight: '600' },
  menu: { borderWidth: 1, marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1 },
  menuLabel: { flex: 1, fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 1.5 },
});
