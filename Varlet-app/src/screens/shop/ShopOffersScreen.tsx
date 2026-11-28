import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Tag } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { getMyOffers, saveOffer, deleteOffer, type Offer } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { canManageStore, offerStatus } from '../../utils/shop';
import { shortDate } from '../../utils/format';
import { confirm } from '../../utils/confirm';
import ScreenHeader from '../../components/ui/ScreenHeader';
import StateView from '../../components/ui/StateView';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import Field from '../../components/ui/Field';
import Badge from '../../components/ui/Badge';

const KEEP = 'Keep end date';
const DURATIONS: Record<string, number | null> = {
  '3 days': 3,
  '1 week': 7,
  '2 weeks': 14,
  '1 month': 30,
  'No end date': null,
};
const BLANK = { title: '', description: '', discount: '', duration: '1 week', active: true };

export default function ShopOffersScreen({ navigation }: any) {
  const { colors, fonts } = useTheme();
  const { role } = useAuthStore();
  const manages = canManageStore(role);
  const { data, error, loading, reload } = useAsync(getMyOffers);
  // null = form closed, 'new' = creating, otherwise the offer being edited
  const [editing, setEditing] = useState<Offer | 'new' | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const scroll = useRef<ScrollView>(null);

  const open = (offer: Offer | 'new') => {
    setProblem(null);
    setEditing(offer);
    setForm(
      offer === 'new'
        ? BLANK
        : {
            title: offer.title,
            description: offer.description,
            discount: offer.discountPercent ? String(offer.discountPercent) : '',
            duration: KEEP,
            active: offer.isActive,
          }
    );
    scroll.current?.scrollTo({ y: 0, animated: true });
  };

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    setProblem(null);
    try {
      await action();
      setEditing(null);
      await reload();
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const save = () => {
    if (!editing) return;
    const discount = form.discount.trim() ? Number(form.discount) : null;
    if (form.title.trim().length < 2) return setProblem('Give the offer a title.');
    if (discount !== null && !(Number.isInteger(discount) && discount >= 1 && discount <= 90)) {
      return setProblem('Discount must be a whole number from 1 to 90, or empty.');
    }
    const days = DURATIONS[form.duration];
    run(() =>
      saveOffer(
        {
          title: form.title.trim(),
          description: form.description.trim(),
          discountPercent: discount,
          isActive: form.active,
          endsAt:
            form.duration === KEEP
              ? undefined
              : days === null
                ? null
                : new Date(Date.now() + days * 86_400_000).toISOString(),
        },
        editing === 'new' ? undefined : editing.id
      )
    );
  };

  const remove = async (offer: Offer) => {
    if (await confirm('Delete offer', `Delete "${offer.title}"?`, 'Delete')) {
      run(() => deleteOffer(offer.id));
    }
  };

  const muted = { color: colors.foregroundMuted, fontFamily: fonts.regular };
  const strong = { color: colors.foreground, fontFamily: fonts.semiBold };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Offers" subtitle="Shown to shoppers near you" onBack={() => navigation.goBack()} />
      <ScrollView ref={scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {manages && !editing && <Button label="New offer" variant="accent" fullWidth onPress={() => open('new')} />}

        {editing && (
          <Card style={[styles.form, { borderColor: colors.accent }]}>
            <Text style={[styles.formTitle, strong]}>{editing === 'new' ? 'New offer' : 'Edit offer'}</Text>
            <Field label="Title" value={form.title} onChangeText={(title) => setForm({ ...form, title })} placeholder="Festive week sale" />
            <Field label="Discount % (optional)" value={form.discount} onChangeText={(discount) => setForm({ ...form, discount })} keyboardType="number-pad" placeholder="20" />
            <Field label="Details (optional)" value={form.description} onChangeText={(description) => setForm({ ...form, description })} multiline placeholder="On all kurtas, in store only" />
            <Text style={[styles.label, muted]}>Runs for</Text>
            <View style={styles.chips}>
              {[...(editing === 'new' ? [] : [KEEP]), ...Object.keys(DURATIONS)].map((d) => (
                <Chip key={d} label={d} selected={form.duration === d} onPress={() => setForm({ ...form, duration: d })} />
              ))}
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.switchText, strong]}>Visible to shoppers</Text>
              <Switch accessibilityLabel="Visible to shoppers" value={form.active} onValueChange={(active) => setForm({ ...form, active })} trackColor={{ true: colors.success, false: colors.surfaceElevated }} thumbColor="#fff" />
            </View>
            {problem && <Text accessibilityRole="alert" style={[styles.small, { color: colors.destructive }]}>{problem}</Text>}
            <Button label={saving ? 'Saving…' : 'Save offer'} variant="accent" disabled={saving} onPress={save} />
            <Button label="Cancel" variant="outline" disabled={saving} onPress={() => setEditing(null)} />
          </Card>
        )}

        {!editing && problem && <Text style={[styles.small, { color: colors.destructive }]}>{problem}</Text>}

        {!data ? (
          <StateView loading={loading} error={error} action={{ label: 'Try again', onPress: reload }} />
        ) : data.length === 0 ? (
          !editing && <StateView icon={Tag} title="No offers yet" message="Create one to bring shoppers to your store." />
        ) : (
          data.map((offer) => {
            const status = offerStatus(offer);
            return (
              <Card key={offer.id} style={styles.offer}>
                <View style={styles.offerHead}>
                  <Text style={[styles.offerTitle, strong]}>{offer.title}</Text>
                  <Badge label={status} variant={status === 'Live' ? 'success' : status === 'Scheduled' ? 'accent' : 'muted'} />
                </View>
                <Text style={[styles.small, muted]}>
                  {[
                    offer.discountPercent ? `${offer.discountPercent}% off` : null,
                    offer.endsAt ? `ends ${shortDate(offer.endsAt)}` : 'no end date',
                  ].filter(Boolean).join(' · ')}
                </Text>
                {offer.description ? <Text style={[styles.small, muted]}>{offer.description}</Text> : null}
                {manages && (
                  <View style={styles.links}>
                    <TouchableOpacity onPress={() => open(offer)}>
                      <Text style={[styles.link, { color: colors.accent, fontFamily: fonts.semiBold }]}>Edit</Text>
                    </TouchableOpacity>
                    {status !== 'Ended' && (
                      <TouchableOpacity disabled={saving} onPress={() => run(() => saveOffer({ isActive: !offer.isActive }, offer.id))}>
                        <Text style={[styles.link, { color: colors.foreground, fontFamily: fonts.semiBold }]}>
                          {offer.isActive ? 'Pause' : 'Resume'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity disabled={saving} onPress={() => remove(offer)}>
                      <Text style={[styles.link, { color: colors.destructive, fontFamily: fonts.semiBold }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 60, gap: 12 },
  form: { gap: 4 },
  formTitle: { fontSize: 16, marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  switchText: { fontSize: 14 },
  offer: { gap: 6 },
  offerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  offerTitle: { flex: 1, fontSize: 15 },
  small: { fontSize: 12, lineHeight: 17 },
  links: { flexDirection: 'row', gap: 22, marginTop: 6 },
  link: { fontSize: 13, paddingVertical: 4 },
});
