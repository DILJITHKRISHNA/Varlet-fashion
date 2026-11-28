import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getCategories, saveProduct, deleteProduct, type ProductInput } from '../../services/api';
import type { Product } from '../../services/mockData';
import { confirm } from '../../utils/confirm';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Field from '../../components/ui/Field';
import Chip from '../../components/ui/Chip';
import Button from '../../components/ui/Button';

const GENDERS = ['women', 'men', 'unisex'] as const;

const list = (text: string) => text.split(',').map((v) => v.trim()).filter(Boolean);
const lines = (text: string) => text.split(/\s+/).filter(Boolean);

/** "₹1,299" and "1299.50" are both accepted. */
function money(text: string): number | null {
  const cleaned = text.replace(/[₹,\s]/g, '');
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : NaN;
}

export default function ProductEditorScreen({ navigation, route }: any) {
  const { colors, fonts } = useTheme();
  const product: Product | undefined = route?.params?.product;

  const [form, setForm] = useState({
    name: product?.name ?? '',
    price: product ? String(product.price) : '',
    originalPrice: product?.originalPrice ? String(product.originalPrice) : '',
    sku: product?.sku ?? '',
    brand: product?.brand ?? '',
    sizes: product?.sizes.join(', ') ?? '',
    colors: product?.colors.map((c) => c.name).join(', ') ?? '',
    images: product?.images.join('\n') ?? '',
    tags: product?.tags.join(', ') ?? '',
    description: product?.description ?? '',
  });
  const [category, setCategory] = useState(product?.category ?? '');
  const [gender, setGender] = useState<(typeof GENDERS)[number]>(product?.gender ?? 'unisex');
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [categories, setCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then((c) => setCategories(c.map((x) => x.name))).catch(() => {});
  }, []);

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    setError(null);
    try {
      await action();
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
      setSaving(false);
    }
  };

  const save = () => {
    const price = money(form.price);
    const original = money(form.originalPrice);
    if (form.name.trim().length < 2) return setError('Enter the product name.');
    if (price === null || Number.isNaN(price)) return setError('Enter the selling price as a number.');
    if (Number.isNaN(original)) return setError('Enter the original price as a number, or leave it empty.');
    const images = lines(form.images);
    if (images.some((url) => !/^https?:\/\//i.test(url))) {
      return setError('Photo links must start with http:// or https://');
    }
    const input: ProductInput = {
      name: form.name.trim(),
      price,
      original_price: original,
      sku: form.sku.trim() || null,
      brand: form.brand.trim() || null,
      category: category || null,
      sizes: list(form.sizes),
      // Keep the colour code of names that were already there.
      colors: list(form.colors).map((name) => ({
        name,
        hex: product?.colors.find((c) => c.name.toLowerCase() === name.toLowerCase())?.hex || null,
      })),
      images,
      tags: list(form.tags).map((t) => t.toLowerCase()),
      description: form.description.trim(),
      gender,
      in_stock: inStock,
    };
    run(() => saveProduct(input, product?.id));
  };

  const remove = async () => {
    if (!product) return;
    if (await confirm('Delete product', `Remove "${product.name}" from your store?`, 'Delete')) {
      run(() => deleteProduct(product.id));
    }
  };

  const label = [styles.label, { color: colors.foregroundMuted, fontFamily: fonts.semiBold }];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title={product ? 'Edit product' : 'Add product'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Product name" value={form.name} onChangeText={set('name')} placeholder="Oversized graphic tee" />
        <View style={styles.pair}>
          <View style={styles.flex}>
            <Field label="Price (₹)" value={form.price} onChangeText={set('price')} keyboardType="decimal-pad" placeholder="799" />
          </View>
          <View style={styles.flex}>
            <Field label="MRP (optional)" value={form.originalPrice} onChangeText={set('originalPrice')} keyboardType="decimal-pad" placeholder="1299" />
          </View>
        </View>

        <Text style={label}>Category</Text>
        <View style={styles.chips}>
          {categories.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(category === c ? '' : c)} />
          ))}
        </View>

        <Text style={label}>For</Text>
        <View style={styles.chips}>
          {GENDERS.map((g) => (
            <Chip key={g} label={g.charAt(0).toUpperCase() + g.slice(1)} selected={gender === g} onPress={() => setGender(g)} />
          ))}
        </View>

        <Field label="Brand" value={form.brand} onChangeText={set('brand')} />
        <Field label="Sizes" value={form.sizes} onChangeText={set('sizes')} placeholder="S, M, L, XL" hint="Separate with commas." autoCapitalize="characters" />
        <Field label="Colours" value={form.colors} onChangeText={set('colors')} placeholder="Black, White" hint="Separate with commas. Used to match photo searches." />
        <Field label="Photo links" value={form.images} onChangeText={set('images')} multiline autoCapitalize="none" autoCorrect={false} placeholder="https://…" hint="One link per line. Uploading photos from the phone isn't available yet." />
        <Field label="Search words" value={form.tags} onChangeText={set('tags')} placeholder="oversized, graphic, cotton" autoCapitalize="none" />
        <Field label="Description" value={form.description} onChangeText={set('description')} multiline />
        <Field label="SKU (your product code)" value={form.sku} onChangeText={set('sku')} autoCapitalize="characters" hint="Lets a later bulk upload update this product." />

        <View style={styles.switchRow}>
          <Text style={[styles.switchText, { color: colors.foreground, fontFamily: fonts.medium }]}>In stock</Text>
          <Switch accessibilityLabel="In stock" value={inStock} onValueChange={setInStock} trackColor={{ true: colors.success, false: colors.surfaceElevated }} thumbColor="#fff" />
        </View>

        {error && <Text accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
        <Button label={saving ? 'Saving…' : 'Save product'} variant="accent" fullWidth disabled={saving} onPress={save} />
        {product && <Button label="Delete product" variant="ghost" fullWidth disabled={saving} onPress={remove} style={styles.delete} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  pair: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  label: { fontSize: 13, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  switchText: { fontSize: 15 },
  error: { fontSize: 13, marginBottom: 12 },
  delete: { marginTop: 12 },
});
