import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';

const FASHION_PREFS = [
  'Streetwear', 'Korean Fashion', 'Casual', 'Formal',
  'Ethnic Wear', 'Vintage', 'Minimalist', 'Party Wear',
  'Athleisure', 'Boho', 'Preppy', 'Luxury',
];

export default function RegisterScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const { signUpWithEmail } = useAuthStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [prefs, setPrefs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const togglePref = (p: string) =>
    setPrefs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleStep1 = () => {
    if (!name || !email || !password) { Alert.alert('Missing fields', 'Please fill all fields'); return; }
    setStep(2);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await signUpWithEmail({ name, email, password, mobile, gender, ageGroup, fashionPreferences: prefs });
    } catch (e) {
      Alert.alert('Sign up failed', e instanceof Error ? e.message : 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
    back: { fontSize: 24, color: colors.foreground, marginBottom: 32 },
    stepRow: { flexDirection: 'row', marginBottom: 32, gap: 8 },
    stepBar: { flex: 1, height: 4, borderRadius: 2 },
    title: { fontSize: 26, fontWeight: '700', color: colors.foreground, letterSpacing: -0.5, marginBottom: 6 },
    sub: { fontSize: 14, color: colors.foregroundMuted, marginBottom: 28 },
    label: { fontSize: 13, fontWeight: '600', color: colors.foregroundMuted, marginBottom: 8 },
    inputWrap: { marginBottom: 16 },
    input: {
      backgroundColor: colors.surface, borderWidth: 1.5, borderRadius: borderRadius.xl,
      paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.foreground,
    },
    row: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    chip: {
      flex: 1, paddingVertical: 12, borderRadius: borderRadius.xl,
      alignItems: 'center', borderWidth: 1.5,
    },
    chipText: { fontSize: 14, fontWeight: '600' },
    prefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
    prefChip: {
      paddingHorizontal: 14, paddingVertical: 9,
      borderRadius: borderRadius.full, borderWidth: 1.5,
    },
    prefText: { fontSize: 13, fontWeight: '600' },
    btn: { borderRadius: borderRadius.full, overflow: 'hidden', marginBottom: 16 },
    btnGrad: { paddingVertical: 16, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
    loginText: { fontSize: 14, color: colors.foregroundMuted },
    loginLink: { fontSize: 14, fontWeight: '700' },
  });

  const AGES = ['Under 18', '18–24', '25–34', '35–44', '45+'];
  const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={step === 1 ? () => navigation.goBack() : () => setStep(1)}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>

        {/* Progress bars */}
        <View style={s.stepRow}>
          {[1, 2].map(n => (
            <View key={n} style={[s.stepBar, { backgroundColor: n <= step ? colors.accent : colors.border }]} />
          ))}
        </View>

        {step === 1 ? (
          <>
            <Text style={s.title}>Create Account</Text>
            <Text style={s.sub}>Join 12,000+ fashion explorers on Varlet</Text>
            {[
              { key: 'name', label: 'Full Name', placeholder: 'Aanya Sharma', val: name, set: setName, type: 'default' },
              { key: 'email', label: 'Email Address', placeholder: 'you@email.com', val: email, set: setEmail, type: 'email-address' },
              { key: 'mobile', label: 'Mobile Number (optional)', placeholder: '+91 9876543210', val: mobile, set: setMobile, type: 'phone-pad' },
              { key: 'password', label: 'Password', placeholder: 'Min. 8 characters', val: password, set: setPassword, type: 'default', secure: true },
            ].map(field => (
              <View key={field.key} style={s.inputWrap}>
                <Text style={s.label}>{field.label}</Text>
                <TextInput
                  style={[s.input, { borderColor: focusedField === field.key ? colors.primary : colors.border }]}
                  placeholder={field.placeholder} placeholderTextColor={colors.foregroundSubtle}
                  value={field.val} onChangeText={field.set}
                  onFocus={() => setFocusedField(field.key)} onBlur={() => setFocusedField(null)}
                  keyboardType={field.type as any} secureTextEntry={field.secure} autoCapitalize="none"
                />
              </View>
            ))}
            <Button label="Continue" onPress={handleStep1} fullWidth />
            <View style={s.loginRow}>
              <Text style={s.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[s.loginLink, { color: colors.accent }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={s.title}>Your Style Profile</Text>
            <Text style={s.sub}>Help us personalise your fashion feed</Text>

            <Text style={s.label}>Gender</Text>
            <View style={s.row}>
              {GENDERS.slice(0, 2).map(g => (
                <TouchableOpacity key={g} style={[s.chip, { borderColor: gender === g ? '#FF6B35' : colors.border, backgroundColor: gender === g ? '#FFF0EA' : colors.surface }]} onPress={() => setGender(g)}>
                  <Text style={[s.chipText, { color: gender === g ? '#FF6B35' : colors.foreground }]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[s.row, { marginBottom: 20 }]}>
              {GENDERS.slice(2).map(g => (
                <TouchableOpacity key={g} style={[s.chip, { borderColor: gender === g ? '#FF6B35' : colors.border, backgroundColor: gender === g ? '#FFF0EA' : colors.surface }]} onPress={() => setGender(g)}>
                  <Text style={[s.chipText, { color: gender === g ? '#FF6B35' : colors.foreground, fontSize: 12 }]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Age Group</Text>
            <View style={[s.prefGrid, { marginBottom: 20 }]}>
              {AGES.map(a => (
                <TouchableOpacity key={a} style={[s.prefChip, { borderColor: ageGroup === a ? '#FF6B35' : colors.border, backgroundColor: ageGroup === a ? '#FFF0EA' : colors.surface }]} onPress={() => setAgeGroup(a)}>
                  <Text style={[s.prefText, { color: ageGroup === a ? '#FF6B35' : colors.foreground }]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Fashion Preferences (pick any)</Text>
            <View style={s.prefGrid}>
              {FASHION_PREFS.map(p => (
                <TouchableOpacity key={p} style={[s.prefChip, { borderColor: prefs.includes(p) ? '#FF6B35' : colors.border, backgroundColor: prefs.includes(p) ? '#FFF0EA' : colors.surface }]} onPress={() => togglePref(p)}>
                  <Text style={[s.prefText, { color: prefs.includes(p) ? '#FF6B35' : colors.foreground }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button label={loading ? 'Creating account…' : 'Start Exploring'} onPress={handleRegister} disabled={loading} fullWidth />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
