import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { registerShop } from '../../services/api';
import { useLocation } from '../../hooks/useLocation';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';

const CATEGORIES = ['Streetwear', "Men's Wear", "Women's Wear", 'Ethnic Wear', 'Footwear', 'Accessories'];

export default function AdminRegisterScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const { signUpWithEmail, refreshProfile } = useAuthStore();
  const { coords, permissionDenied } = useLocation();

  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [locationText, setLocationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!ownerName || !email || !password || !storeName || !locationText) {
      Alert.alert('Missing fields', 'Please fill in your name, email, password, store name and location');
      return;
    }
    if (!coords) {
      Alert.alert('Location not ready', 'Still detecting your location — try again in a moment');
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail({ name: ownerName, email, password });
      await registerShop({
        name: storeName,
        description,
        category,
        locationText,
        lat: coords.lat,
        lng: coords.lng,
      });
      await refreshProfile();
      // RootNavigator re-routes to the shop dashboard automatically once the
      // refreshed profile shows role: 'admin' + shopId.
    } catch (e) {
      Alert.alert('Registration failed', e instanceof Error ? e.message : 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
    back: { fontSize: 24, color: colors.foreground, marginBottom: 24 },
    logoWrap: { marginBottom: 20 },
    title: { fontSize: 26, fontWeight: '700', color: colors.foreground, letterSpacing: -0.5, marginBottom: 6 },
    sub: { fontSize: 14, color: colors.foregroundMuted, marginBottom: 24, lineHeight: 20 },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.foregroundMuted, marginTop: 8, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    label: { fontSize: 13, fontWeight: '600', color: colors.foregroundMuted, marginBottom: 8 },
    inputWrap: { marginBottom: 16 },
    input: {
      backgroundColor: colors.surface, borderWidth: 1.5, borderRadius: borderRadius.xl,
      paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.foreground,
    },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    catChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: borderRadius.full, borderWidth: 1.5 },
    catText: { fontSize: 13, fontWeight: '600' },
    locHint: { fontSize: 12, color: colors.foregroundSubtle, marginTop: -8, marginBottom: 16 },
  });

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>

        <View style={s.logoWrap}>
          <Logo />
        </View>

        <Text style={s.title}>Register your store</Text>
        <Text style={s.sub}>Create your owner account and list your store on Varlet — both happen in one step.</Text>

        <Text style={s.sectionLabel}>Owner account</Text>
        {[
          { key: 'ownerName', label: 'Your Name', placeholder: 'Priya Nair', val: ownerName, set: setOwnerName, type: 'default' },
          { key: 'email', label: 'Email Address', placeholder: 'owner@yourshop.com', val: email, set: setEmail, type: 'email-address' },
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

        <Text style={s.sectionLabel}>Store details</Text>
        <View style={s.inputWrap}>
          <Text style={s.label}>Store Name</Text>
          <TextInput
            style={[s.input, { borderColor: focusedField === 'storeName' ? colors.primary : colors.border }]}
            placeholder="Urban Thread Co." placeholderTextColor={colors.foregroundSubtle}
            value={storeName} onChangeText={setStoreName}
            onFocus={() => setFocusedField('storeName')} onBlur={() => setFocusedField(null)}
          />
        </View>
        <View style={s.inputWrap}>
          <Text style={s.label}>Description</Text>
          <TextInput
            style={[s.input, { borderColor: focusedField === 'description' ? colors.primary : colors.border, minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="What does your store sell?" placeholderTextColor={colors.foregroundSubtle}
            value={description} onChangeText={setDescription} multiline
            onFocus={() => setFocusedField('description')} onBlur={() => setFocusedField(null)}
          />
        </View>

        <Text style={s.label}>Category</Text>
        <View style={s.catGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[s.catChip, { borderColor: category === c ? colors.accent : colors.border, backgroundColor: category === c ? colors.accentSoft : colors.surface }]}
              onPress={() => setCategory(c)}
            >
              <Text style={[s.catText, { color: category === c ? colors.accent : colors.foreground }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.inputWrap}>
          <Text style={s.label}>Location</Text>
          <TextInput
            style={[s.input, { borderColor: focusedField === 'locationText' ? colors.primary : colors.border }]}
            placeholder="MG Road, Bengaluru" placeholderTextColor={colors.foregroundSubtle}
            value={locationText} onChangeText={setLocationText}
            onFocus={() => setFocusedField('locationText')} onBlur={() => setFocusedField(null)}
          />
        </View>
        <Text style={s.locHint}>
          {permissionDenied
            ? 'Location permission denied — using an approximate default. Update it later from Store Settings.'
            : coords
              ? `Using your current coordinates (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}) for map placement.`
              : 'Detecting your location…'}
        </Text>

        <Button label={loading ? 'Registering store…' : 'Register Store'} onPress={handleSubmit} disabled={loading} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
