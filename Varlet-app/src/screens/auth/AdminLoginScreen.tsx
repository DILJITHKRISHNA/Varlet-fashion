import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';

const SHOP_ROLES = [
  { key: 'admin' as const, label: 'Shop Owner', desc: 'Full access to your store settings' },
  { key: 'manager' as const, label: 'Manager', desc: 'Manage products, orders and staff' },
  { key: 'staff' as const, label: 'Staff', desc: 'View and update product listings' },
];

const PLATFORM_ROLE = { key: 'super_admin' as const, label: 'Platform Admin', desc: 'Varlet platform-wide administration' };

type LoginRole = 'admin' | 'manager' | 'staff' | 'super_admin';

export default function AdminLoginScreen({ navigation }: any) {
  const { colors, borderRadius, fonts } = useTheme();
  const { signInWithEmail, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<LoginRole>('admin');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Enter your email and password');
      return;
    }
    try {
      await signInWithEmail(email, password);
      const { role } = useAuthStore.getState();
      const isShopAccount = role === 'admin' || role === 'manager' || role === 'staff';
      const expectingShopAccount = selectedRole !== 'super_admin';
      if ((expectingShopAccount && !isShopAccount) || (!expectingShopAccount && role !== 'super_admin')) {
        Alert.alert(
          'Wrong portal',
          `This account isn't provisioned as a ${selectedRole === 'super_admin' ? 'platform admin' : 'shop'} account — you're signed in as ${role}.`
        );
      }
    } catch (e) {
      Alert.alert('Sign in failed', e instanceof Error ? e.message : 'Please try again');
    }
  };

  const allRoles = [...SHOP_ROLES, PLATFORM_ROLE];

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.foreground }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.logoWrap}>
          <Logo />
        </View>

        <View style={[styles.badge, { backgroundColor: colors.accentSoft, borderRadius: borderRadius.full }]}>
          <View style={[styles.badgeDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.badgeText, { color: colors.accent, fontFamily: fonts.medium }]}>Shop & Admin Portal</Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground, fontFamily: fonts.semiBold }]}>Sign in</Text>
        <Text style={[styles.sub, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
          Shop owners manage their store. Platform admins manage all of Varlet.
        </Text>

        <Text style={[styles.roleLabel, { color: colors.foregroundMuted, fontFamily: fonts.medium }]}>Sign in as</Text>
        {allRoles.map(r => (
          <TouchableOpacity
            key={r.key}
            style={[styles.roleCard, {
              borderColor: selectedRole === r.key ? colors.accent : colors.border,
              backgroundColor: selectedRole === r.key ? colors.accentSoft : colors.surface,
              borderRadius: borderRadius.xl,
            }]}
            onPress={() => setSelectedRole(r.key)}
          >
            <View>
              <Text style={[styles.roleName, { color: selectedRole === r.key ? colors.accent : colors.foreground, fontFamily: fonts.semiBold }]}>
                {r.label}
              </Text>
              <Text style={[styles.roleDesc, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>{r.desc}</Text>
            </View>
            <View style={[styles.roleCheck, { borderColor: selectedRole === r.key ? colors.accent : colors.border }]}>
              {selectedRole === r.key && <View style={[styles.roleCheckInner, { backgroundColor: colors.accent }]} />}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.inputSection}>
          <View style={styles.inputWrap}>
            <Text style={[styles.label, { color: colors.foregroundMuted, fontFamily: fonts.medium }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { borderColor: focusedField === 'email' ? colors.primary : colors.border, backgroundColor: colors.surface, color: colors.foreground, borderRadius: borderRadius.xl }]}
              placeholder={selectedRole === 'super_admin' ? 'admin@varlet.in' : 'owner@yourshop.com'}
              placeholderTextColor={colors.foregroundSubtle}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputWrap}>
            <Text style={[styles.label, { color: colors.foregroundMuted, fontFamily: fonts.medium }]}>Password</Text>
            <TextInput
              style={[styles.input, { borderColor: focusedField === 'password' ? colors.primary : colors.border, backgroundColor: colors.surface, color: colors.foreground, borderRadius: borderRadius.xl }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.foregroundSubtle}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry
            />
          </View>
        </View>

        <Button
          label={isLoading ? 'Signing in…' : selectedRole === 'super_admin' ? 'Sign in to Platform Admin' : 'Sign in to Shop Dashboard'}
          onPress={handleLogin}
          disabled={isLoading}
          fullWidth
        />

        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>New shop? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('AdminRegister')}>
            <Text style={[styles.registerLink, { color: colors.accent, fontFamily: fonts.semiBold }]}>Register your store →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  back: { fontSize: 24, marginBottom: 24 },
  logoWrap: { marginBottom: 20 },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, marginBottom: 20 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '600', letterSpacing: -0.5, marginBottom: 6 },
  sub: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
  roleLabel: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  roleCard: { borderWidth: 1.5, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roleName: { fontSize: 15, fontWeight: '600' },
  roleDesc: { fontSize: 12, marginTop: 2 },
  roleCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  roleCheckInner: { width: 12, height: 12, borderRadius: 6 },
  inputSection: { marginTop: 20 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  inputWrap: { marginBottom: 16 },
  input: { borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '600' },
});
