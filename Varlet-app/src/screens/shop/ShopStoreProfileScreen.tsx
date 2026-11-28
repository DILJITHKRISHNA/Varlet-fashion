import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { getMyShop, getCategories, updateMyShop } from '../../services/api';
import type { Shop } from '../../services/mockData';
import { canManageStore } from '../../utils/shop';
import ScreenHeader from '../../components/ui/ScreenHeader';
import StateView from '../../components/ui/StateView';
import Field from '../../components/ui/Field';
import Chip from '../../components/ui/Chip';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

function toForm(shop: Shop) {
  return {
    name: shop.name,
    description: shop.description,
    category: shop.category,
    location: shop.location,
    phone: shop.phone ?? '',
    whatsapp: shop.whatsapp ?? '',
    open: shop.isOpen,
    coords: undefined as { lat: number; lng: number } | undefined,
  };
}

export default function ShopStoreProfileScreen({ navigation }: any) {
  const { colors, fonts } = useTheme();
  const { role } = useAuthStore();
  const manages = canManageStore(role);
  const [form, setForm] = useState<ReturnType<typeof toForm> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  // Loaded once, so typing is never overwritten by a refresh.
  const load = useCallback(() => {
    setLoadError(null);
    getMyShop().then((s) => setForm(toForm(s))).catch((e) => setLoadError(e.message));
    getCategories().then((c) => setCategories(c.map((x) => x.name))).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const edit = (patch: Partial<ReturnType<typeof toForm>>) => {
    setMessage(null);
    setForm((f) => f && { ...f, ...patch });
  };

  const locate = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Allow location access to set your store on the map.');
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      edit({ coords: { lat: coords.latitude, lng: coords.longitude } });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Your location could not be found.' });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!form) return;
    if (form.name.trim().length < 2 || form.location.trim().length < 2) {
      return setMessage({ ok: false, text: 'Store name and address are required.' });
    }
    setBusy(true);
    setMessage(null);
    try {
      const shop = await updateMyShop({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category || null,
        location_text: form.location.trim(),
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        is_open: form.open,
        ...form.coords,
      });
      setForm(toForm(shop));
      setMessage({ ok: true, text: 'Saved.' });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const muted = { color: colors.foregroundMuted, fontFamily: fonts.regular };
  const strong = { color: colors.foreground, fontFamily: fonts.semiBold };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Store profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!form ? (
          <StateView loading={!loadError} error={loadError} action={{ label: 'Try again', onPress: load }} />
        ) : (
          <>
            {!manages && <Text style={[styles.text, muted]}>Only the owner or a manager can change these details.</Text>}
            <View pointerEvents={manages ? 'auto' : 'none'}>
              <Card style={styles.switchRow}>
                <View>
                  <Text style={[styles.switchText, strong]}>{form.open ? 'Open now' : 'Closed'}</Text>
                  <Text style={[styles.small, muted]}>Shoppers see this on your store.</Text>
                </View>
                <Switch accessibilityLabel="Store open" value={form.open} onValueChange={(open) => edit({ open })} trackColor={{ true: colors.success, false: colors.surfaceElevated }} thumbColor="#fff" />
              </Card>
              <Field label="Store name" value={form.name} onChangeText={(name) => edit({ name })} />
              <Field label="Description" value={form.description} onChangeText={(description) => edit({ description })} multiline />
              <Text style={[styles.label, muted]}>Category</Text>
              <View style={styles.chips}>
                {categories.map((c) => (
                  <Chip key={c} label={c} selected={form.category === c} onPress={() => edit({ category: c })} />
                ))}
              </View>
              <Field label="Phone number" value={form.phone} onChangeText={(phone) => edit({ phone })} keyboardType="phone-pad" placeholder="+91 …" />
              <Field label="WhatsApp number" value={form.whatsapp} onChangeText={(whatsapp) => edit({ whatsapp })} keyboardType="phone-pad" placeholder="+91 …" hint="Shoppers' WhatsApp button opens a chat with this number." />
              <Field label="Address" value={form.location} onChangeText={(location) => edit({ location })} />
              <Button label="Set map position to where I am" variant="outline" disabled={busy} onPress={locate} />
              <View style={styles.pin}>
                <MapPin size={13} color={colors.foregroundMuted} />
                <Text style={[styles.small, muted]}>
                  {form.coords
                    ? 'New position ready. Save to apply it.'
                    : 'Press this while you are inside the store, so directions lead there.'}
                </Text>
              </View>
            </View>
            {message && (
              <Text accessibilityRole="alert" style={[styles.text, { color: message.ok ? colors.success : colors.destructive }]}>
                {message.text}
              </Text>
            )}
            {manages && <Button label={busy ? 'Please wait…' : 'Save changes'} variant="accent" disabled={busy} onPress={save} />}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  text: { fontSize: 13, marginBottom: 12 },
  small: { fontSize: 12, flexShrink: 1 },
  label: { fontSize: 13, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  switchText: { fontSize: 15, marginBottom: 2 },
  pin: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 18 },
});
