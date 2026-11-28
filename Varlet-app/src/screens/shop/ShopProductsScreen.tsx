import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { Package } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getMyProducts, saveProduct } from '../../services/api';
import type { Product } from '../../services/mockData';
import { useAsync } from '../../hooks/useAsync';
import { rupees } from '../../utils/format';
import ScreenHeader from '../../components/ui/ScreenHeader';
import SearchBar from '../../components/ui/SearchBar';
import StateView from '../../components/ui/StateView';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Thumb from '../../components/ui/Thumb';

export default function ShopProductsScreen({ navigation }: any) {
  const { colors, borderRadius, fonts } = useTheme();
  const { data, error, loading, reload } = useAsync(getMyProducts);
  const [query, setQuery] = useState('');
  const [stockError, setStockError] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const q = query.trim().toLowerCase();
  const shown = (data ?? []).filter((p) => !q || `${p.name} ${p.sku ?? ''} ${p.brand}`.toLowerCase().includes(q));

  const setStock = async (product: Product, inStock: boolean) => {
    setStockError(null);
    setPending((p) => ({ ...p, [product.id]: inStock }));
    try {
      await saveProduct({ in_stock: inStock }, product.id);
      await reload();
    } catch (e) {
      setStockError(e instanceof Error ? e.message : 'Could not update the stock.');
    } finally {
      setPending(({ [product.id]: _done, ...rest }) => rest);
    }
  };

  const muted = { color: colors.foregroundMuted, fontFamily: fonts.regular };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Products" subtitle={data ? `${data.length} listed` : undefined} showLogout />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={reload} tintColor={colors.accent} />}
      >
        <View style={styles.actions}>
          <Button label="Add product" variant="accent" style={styles.flex} onPress={() => navigation.navigate('ProductEditor')} />
          <Button label="Bulk upload" variant="outline" style={styles.flex} onPress={() => navigation.navigate('BulkUpload')} />
        </View>

        {stockError && <Text style={[styles.small, { color: colors.destructive }]}>{stockError}</Text>}
        {error && data && <Text style={[styles.small, { color: colors.destructive }]}>{error}</Text>}

        {!data ? (
          <StateView loading={loading} error={error} action={{ label: 'Try again', onPress: reload }} />
        ) : data.length === 0 ? (
          <StateView icon={Package} title="No products yet" message="Add one, or upload your whole list from a spreadsheet." />
        ) : (
          <>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Find by name, SKU or brand" />
            {shown.length === 0 && <StateView title="No match" message="Try different words." />}
            {shown.map((p) => {
              const inStock = pending[p.id] ?? p.inStock;
              return (
                <Card key={p.id} style={styles.row}>
                  <TouchableOpacity
                    accessibilityLabel={`Edit ${p.name}`}
                    style={styles.tap}
                    onPress={() => navigation.navigate('ProductEditor', { product: p })}
                  >
                    <Thumb uri={p.images[0]} style={[styles.image, { borderRadius: borderRadius.lg }]} />
                    <View style={styles.flex}>
                      <Text numberOfLines={1} style={[styles.name, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{p.name}</Text>
                      <Text numberOfLines={1} style={[styles.small, muted]}>
                        {[p.sku, p.category, p.brand].filter(Boolean).join(' · ') || 'Tap to add details'}
                      </Text>
                      <Text style={[styles.price, { color: colors.foreground, fontFamily: fonts.displaySemi }]}>{rupees(p.price)}</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.stock}>
                    <Switch
                      accessibilityLabel={`${p.name} in stock`}
                      value={inStock}
                      disabled={p.id in pending}
                      onValueChange={(value) => setStock(p, value)}
                      trackColor={{ true: colors.success, false: colors.surfaceElevated }}
                      thumbColor="#fff"
                    />
                    <Text style={[styles.stockText, muted]}>{inStock ? 'In stock' : 'Sold out'}</Text>
                  </View>
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 110, gap: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  tap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  image: { width: 64, height: 76 },
  name: { fontSize: 14, marginBottom: 2 },
  small: { fontSize: 12 },
  price: { fontSize: 15, marginTop: 4 },
  stock: { alignItems: 'center', gap: 4, width: 64 },
  stockText: { fontSize: 10 },
});
