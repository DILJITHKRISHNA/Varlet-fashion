import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { CheckCircle2, FileSpreadsheet } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { bulkUploadProducts, PRODUCT_TEMPLATE_URL, type BulkResult } from '../../services/api';
import type { LocalFile } from '../../services/upload';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StateView from '../../components/ui/StateView';

const TYPES = [
  'text/csv',
  'text/comma-separated-values',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const SHOWN_ERRORS = 50;

export default function BulkUploadScreen({ navigation }: any) {
  const { colors, fonts } = useTheme();
  const [file, setFile] = useState<LocalFile | null>(null);
  const [preview, setPreview] = useState<BulkResult | null>(null);
  const [done, setDone] = useState<BulkResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const attempt = async (message: string, action: () => Promise<void>) => {
    setBusy(message);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const choose = async () => {
    setError(null);
    const picked = await DocumentPicker.getDocumentAsync({ type: TYPES, copyToCacheDirectory: true });
    if (picked.canceled) return;
    const asset = picked.assets[0];
    setPreview(null);
    setDone(null);
    if (!/\.(csv|xlsx)$/i.test(asset.name)) {
      setFile(null);
      return setError('Choose a .csv or .xlsx file.');
    }
    const next: LocalFile = {
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? 'text/csv',
      size: asset.size,
      file: asset.file,
    };
    setFile(next);
    attempt('Checking your file…', async () => setPreview(await bulkUploadProducts(next, true)));
  };

  const upload = () =>
    file &&
    attempt('Adding your products…', async () => {
      setDone(await bulkUploadProducts(file, false));
      setPreview(null);
    });

  const valid = preview ? preview.created + preview.updated : 0;
  const result = done ?? preview;
  const muted = { color: colors.foregroundMuted, fontFamily: fonts.regular };
  const strong = { color: colors.foreground, fontFamily: fonts.semiBold };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Bulk upload" subtitle="Add many products at once" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={[styles.title, strong]}>1. Prepare your spreadsheet</Text>
          <Text style={[styles.text, muted]}>
            Each row is a product. <Text style={strong}>name</Text> and <Text style={strong}>price</Text> are
            required. You can also add sku, original_price, brand, category, sizes, colors, images,
            description, tags, gender and in_stock.
          </Text>
          <Text style={[styles.text, muted]}>
            Use the same sku again later to update a product instead of adding a copy.
          </Text>
          <Button
            label="Download the template"
            variant="outline"
            onPress={() => Linking.openURL(PRODUCT_TEMPLATE_URL).catch(() => setError('Could not open the template.'))}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.title, strong]}>2. Choose the file</Text>
          <Text style={[styles.text, muted]}>CSV or Excel (.xlsx), up to 1,000 products and 5 MB.</Text>
          {file && (
            <View style={styles.file}>
              <FileSpreadsheet size={18} color={colors.accent} />
              <Text numberOfLines={1} style={[styles.fileName, strong]}>{file.name}</Text>
            </View>
          )}
          <Button label={file ? 'Choose another file' : 'Choose file'} variant={file ? 'outline' : 'accent'} disabled={!!busy} onPress={choose} />
        </Card>

        {busy && <StateView loading message={busy} />}
        {error && <Text accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>{error}</Text>}

        {result && !busy && (
          <Card style={styles.card}>
            {done ? (
              <View style={styles.file}>
                <CheckCircle2 size={22} color={colors.success} />
                <Text style={[styles.title, strong]}>Upload complete</Text>
              </View>
            ) : (
              <Text style={[styles.title, strong]}>3. Check and confirm</Text>
            )}
            <Text style={[styles.text, muted]}>
              {done
                ? `${done.created} added and ${done.updated} updated.`
                : `${result.totalRows} rows: ${result.created} new, ${result.updated} to update.`}
              {result.errors.length > 0 &&
                ` ${result.errors.length} ${done ? 'skipped' : 'will be skipped'}.`}
            </Text>
            {result.errors.slice(0, SHOWN_ERRORS).map((e) => (
              <Text key={e.row} style={[styles.rowError, { color: colors.destructive, fontFamily: fonts.regular }]}>
                Row {e.row}: {e.message}
              </Text>
            ))}
            {result.errors.length > SHOWN_ERRORS && (
              <Text style={[styles.text, muted]}>…and {result.errors.length - SHOWN_ERRORS} more.</Text>
            )}
            {done ? (
              <Button label="View my products" variant="accent" onPress={() => navigation.navigate('ShopMainTabs', { screen: 'ShopProductsTab' })} />
            ) : (
              <Button
                label={valid ? `Upload ${valid} ${valid === 1 ? 'product' : 'products'}` : 'Nothing to upload'}
                variant="accent"
                disabled={!valid}
                onPress={upload}
              />
            )}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  card: { gap: 10 },
  title: { fontSize: 15 },
  text: { fontSize: 13, lineHeight: 19 },
  file: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileName: { flex: 1, fontSize: 13 },
  error: { fontSize: 13 },
  rowError: { fontSize: 12, lineHeight: 17 },
});
