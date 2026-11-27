import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LogIn } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';

type Tab = 'email' | 'mobile' | 'google';

export default function LoginScreen({ navigation }: any) {
  const { colors, borderRadius, spacing } = useTheme();
  const { signInWithEmail, isLoading } = useAuthStore();
  const [tab, setTab] = useState<Tab>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }
    try {
      await signInWithEmail(email, password);
    } catch (e) {
      Alert.alert('Sign in failed', e instanceof Error ? e.message : 'Please try again');
    }
  };

  const handleMobileLogin = () => {
    if (mobile.length < 10) { Alert.alert('Invalid number', 'Enter a valid 10-digit mobile number'); return; }
    navigation.navigate('OTPVerify', { mobile });
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google sign-in not set up yet',
      'This needs a Google sign-in client to be configured — coming in a later step.'
    );
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
    backBtn: { marginBottom: 28 },
    backText: { fontSize: 24, color: colors.foreground },
    logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    logoBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    logoV: { color: '#fff', fontSize: 20, fontWeight: '700' },
    headline: { fontSize: 28, fontWeight: '700', color: colors.foreground, letterSpacing: -0.5, marginBottom: 6 },
    sub: { fontSize: 14, color: colors.foregroundMuted, marginBottom: 28 },
    tabRow: { flexDirection: 'row', backgroundColor: colors.secondary, borderRadius: borderRadius.xl, padding: 4, marginBottom: 28 },
    tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: borderRadius.lg },
    tabText: { fontSize: 13, fontWeight: '600' },
    label: { fontSize: 13, fontWeight: '600', color: colors.foregroundMuted, marginBottom: 8 },
    inputWrap: { marginBottom: 16 },
    input: {
      backgroundColor: colors.surface, borderWidth: 1.5, borderRadius: borderRadius.xl,
      paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.foreground,
    },
    forgotRow: { alignItems: 'flex-end', marginBottom: 28 },
    forgotText: { fontSize: 13, color: '#FF6B35', fontWeight: '600' },
    primaryBtn: { borderRadius: borderRadius.full, overflow: 'hidden', marginBottom: 16 },
    btnGrad: { paddingVertical: 16, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { marginHorizontal: 12, color: colors.foregroundMuted, fontSize: 12 },
    googleBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.full,
      paddingVertical: 14, marginBottom: 28,
    },
    googleText: { fontSize: 15, fontWeight: '600', color: colors.foreground, marginLeft: 8 },
    registerRow: { flexDirection: 'row', justifyContent: 'center' },
    registerText: { fontSize: 14, color: colors.foregroundMuted },
    registerLink: { fontSize: 14, color: '#FF6B35', fontWeight: '700' },
    mobilePrefix: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.surface, borderWidth: 1.5, borderRadius: borderRadius.xl,
      paddingHorizontal: 16, paddingVertical: 14,
    },
    prefixText: { fontSize: 15, color: colors.foregroundMuted, marginRight: 8 },
    mobileInput: { flex: 1, fontSize: 15, color: colors.foreground },
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: 'email', label: 'Email' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'google', label: 'Google' },
  ];

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>

        <View style={s.logoRow}>
          <Logo />
        </View>

        <Text style={s.headline}>Welcome back</Text>
        <Text style={s.sub}>Sign in to discover fashion near you</Text>

        {/* Tab switcher */}
        <View style={s.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key} style={[s.tabBtn, tab === t.key && { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 }]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[s.tabText, { color: tab === t.key ? colors.foreground : colors.foregroundMuted }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Email login */}
        {tab === 'email' && (
          <>
            <View style={s.inputWrap}>
              <Text style={s.label}>Email Address</Text>
              <TextInput
                style={[s.input, { borderColor: focusedField === 'email' ? colors.primary : colors.border }]}
                placeholder="you@email.com" placeholderTextColor={colors.foregroundSubtle}
                value={email} onChangeText={setEmail}
                onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                keyboardType="email-address" autoCapitalize="none"
              />
            </View>
            <View style={s.inputWrap}>
              <Text style={s.label}>Password</Text>
              <TextInput
                style={[s.input, { borderColor: focusedField === 'password' ? colors.primary : colors.border }]}
                placeholder="Enter your password" placeholderTextColor={colors.foregroundSubtle}
                value={password} onChangeText={setPassword}
                onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                secureTextEntry
              />
            </View>
            <View style={s.forgotRow}>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <Button label={isLoading ? 'Signing in…' : 'Sign In'} onPress={handleEmailLogin} disabled={isLoading} fullWidth />
          </>
        )}

        {/* Mobile login */}
        {tab === 'mobile' && (
          <>
            <View style={s.inputWrap}>
              <Text style={s.label}>Mobile Number</Text>
              <View style={[s.mobilePrefix, { borderColor: focusedField === 'mobile' ? colors.primary : colors.border }]}>
                <Text style={s.prefixText}>🇮🇳 +91</Text>
                <TextInput
                  style={s.mobileInput} placeholder="9876543210"
                  placeholderTextColor={colors.foregroundSubtle}
                  value={mobile} onChangeText={setMobile}
                  onFocus={() => setFocusedField('mobile')} onBlur={() => setFocusedField(null)}
                  keyboardType="phone-pad" maxLength={10}
                />
              </View>
            </View>
            <Button label="Send OTP" onPress={handleMobileLogin} fullWidth />
          </>
        )}

        {/* Google login */}
        {tab === 'google' && (
          <>
            <Text style={[s.sub, { marginBottom: 24 }]}>Continue with your Google account for a seamless experience.</Text>
            <TouchableOpacity style={s.googleBtn} onPress={handleGoogleLogin} disabled={isLoading}>
              <LogIn size={18} color={colors.foreground} />
              <Text style={s.googleText}>{isLoading ? 'Connecting…' : 'Continue with Google'}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={s.registerRow}>
          <Text style={s.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={s.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
