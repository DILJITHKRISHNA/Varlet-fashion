import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Tag } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getPriceCollections } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import ScreenHeader from '../../components/ui/ScreenHeader';
import StateView from '../../components/ui/StateView';
import { ProductTile } from '../../components/ProductGrid';

export default function CollectionsScreen({ navigation }: any) {
  const { colors, fonts } = useTheme();
  const { data, error, loading, reload } = useAsync(getPriceCollections);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Shop by price" subtitle="Collections for every budget" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={reload} tintColor={colors.accent} />}
      >
        {!data ? (
          <StateView loading={loading} error={error} action={{ label: 'Try again', onPress: reload }} />
        ) : data.length === 0 ? (
          <StateView icon={Tag} title="No products yet" message="Collections appear as shops add products." />
        ) : (
          data.map((band) => (
            <View key={band.label} style={styles.band}>
              <View style={styles.heading}>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: fonts.displaySemi }]}>{band.label}</Text>
                <TouchableOpacity
                  onPress={() => navigation.popTo('MainTabs', { screen: 'Search', params: { price: band.label, at: Date.now() } })}
                >
                  <Text style={[styles.all, { color: colors.accent, fontFamily: fonts.medium }]}>
                    See all {band.count}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {band.products.map((p) => (
                  <ProductTile key={p.id} product={p} width={148} onPress={() => navigation.navigate('ProductDetail', { product: p })} />
                ))}
              </ScrollView>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: 20, paddingBottom: 48 },
  band: { marginBottom: 26 },
  heading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  title: { fontSize: 20 },
  all: { fontSize: 13 },
  row: { paddingHorizontal: 20, gap: 12 },
});
