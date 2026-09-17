import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export default function OTPVerifyScreen({ navigation, route }: any) {
  const { colors, borderRadius } = useTheme();
  const mobile: string = route?.params?.mobile ?? '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<TextInput[]>([]);

  React.useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    // Mobile OTP needs an SMS provider (e.g. Twilio) configured in
    // supabase/config.toml under [auth.sms] — not wired up yet. Use email
    // sign-in/sign-up until that's in place.
    Alert.alert(
      'Mobile OTP not set up yet',
      'This needs an SMS provider configured on the Supabase project. Please sign in with email for now.'
    );
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
    back: { fontSize: 24, color: colors.foreground, marginBottom: 32 },
    title: { fontSize: 28, fontWeight: '700', color: colors.foreground, letterSpacing: -0.5, marginBottom: 8 },
    sub: { fontSize: 14, color: colors.foregroundMuted, marginBottom: 36, lineHeight: 20 },
    otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 36 },
    otpBox: {
      width: 48, height: 56, borderRadius: borderRadius.xl,
      borderWidth: 2, alignItems: 'center', justifyContent: 'center',
      fontSize: 22, fontWeight: '700', textAlign: 'center',
      backgroundColor: colors.surface, color: colors.foreground,
    },
    timerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
    timerText: { fontSize: 14, color: colors.foregroundMuted },
    resend: { fontSize: 14, color: '#FF6B35', fontWeight: '700', marginLeft: 4 },
    btn: { borderRadius: borderRadius.full, overflow: 'hidden' },
    btnGrad: { paddingVertical: 16, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    hint: { marginTop: 20, alignItems: 'center' },
    hintText: { fontSize: 12, color: colors.foregroundSubtle },
    hintCode: { fontSize: 13, color: '#FF6B35', fontWeight: '600', marginTop: 4 },
  });

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>

        <Text style={s.title}>Enter OTP</Text>
        <Text style={s.sub}>
          We sent a 6-digit code to{'\n'}
          <Text style={{ color: colors.foreground, fontWeight: '600' }}>+91 {mobile}</Text>
        </Text>

        <View style={s.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(r) => { if (r) inputs.current[i] = r; }}
              style={[s.otpBox, { borderColor: digit ? '#FF6B35' : colors.border }]}
              value={digit} onChangeText={v => handleChange(v.slice(-1), i)}
              keyboardType="number-pad" maxLength={1}
            />
          ))}
        </View>

        {timer > 0 ? (
          <View style={s.timerRow}>
            <Text style={s.timerText}>Resend OTP in </Text>
            <Text style={[s.timerText, { color: '#FF6B35', fontWeight: '700' }]}>{timer}s</Text>
          </View>
        ) : (
          <TouchableOpacity style={s.timerRow} onPress={() => setTimer(30)}>
            <Text style={s.timerText}>Didn't receive it?</Text>
            <Text style={s.resend}> Resend</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.btn} onPress={handleVerify} disabled={loading || otp.join('').length < 6}>
          <LinearGradient
            colors={otp.join('').length === 6 ? ['#FF6B35', '#E85A28'] : [colors.border, colors.border]}
            style={s.btnGrad}
          >
            <Text style={[s.btnText, otp.join('').length < 6 && { color: colors.foregroundMuted }]}>
              {loading ? 'Verifying…' : 'Verify OTP'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={s.hint}>
          <Text style={s.hintText}>Mobile sign-in isn't wired up yet</Text>
          <Text style={s.hintCode}>Use email sign-in for now</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
