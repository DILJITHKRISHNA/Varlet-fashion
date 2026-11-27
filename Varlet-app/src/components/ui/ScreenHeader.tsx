import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showLogout?: boolean;
  dark?: boolean;
}

export default function ScreenHeader({ title, subtitle, onBack, showLogout = false, dark = false }: ScreenHeaderProps) {
  const { colors, fonts } = useTheme();
  const { logout } = useAuthStore();
  const insets = useSafeAreaInsets();

  const fg = colors.foreground;
  const muted = colors.foregroundMuted;

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8, backgroundColor: dark ? colors.surfaceElevated : colors.surface, borderBottomColor: dark ? 'transparent' : colors.border, borderBottomWidth: dark ? 0 : 1 }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Text style={[styles.back, { color: fg }]}>←</Text>
            </TouchableOpacity>
          )}
          <View>
            {subtitle && <Text style={[styles.subtitle, { color: muted, fontFamily: fonts.regular }]}>{subtitle}</Text>}
            <Text style={[styles.title, { color: fg, fontFamily: fonts.displaySemi }]}>{title}</Text>
          </View>
        </View>
        {showLogout && (
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutBtn, { backgroundColor: colors.secondary, borderRadius: 999 }]}
          >
            <LogOut size={18} color={colors.foreground} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { marginRight: 12 },
  back: { fontSize: 22 },
  subtitle: { fontSize: 12, marginBottom: 2 },
  title: { fontSize: 22 },
  logoutBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
