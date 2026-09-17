import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { MOCK_PRODUCTS } from '../../services/mockData';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Badge from '../../components/ui/Badge';

export default function ShopProductsScreen({ navigation }: any) {
  const { colors, borderRadius, shadow, fonts } = useTheme();
  const { shopId } = useAuthStore();
  const products = MOCK_PRODUCTS.filter(p => p.shopId === shopId);
  const canGoBack = navigation.canGoBack();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="My Products"
        subtitle={`${products.length} listings`}
        onBack={canGoBack ? () => navigation.goBack() : undefined}
        showLogout
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <TouchableOpacity style={{ marginBottom: 16, borderRadius: borderRadius.full, overflow: 'hidden' }}>
          <LinearGradient colors={colors.gradientAccent} style={styles.addBtn}>
            <Text style={{ color: '#fff', fontFamily: fonts.semiBold, fontWeight: '600' }}>+ Add new product</Text>
          </LinearGradient>
        </TouchableOpacity>

        {products.map(p => (
          <View key={p.id} style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius['2xl'], borderColor: colors.border }, shadow.soft]}>
            <Image source={{ uri: p.images[0] }} style={[styles.img, { borderRadius: borderRadius.lg }]} />
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.foreground, fontFamily: fonts.semiBold }]} numberOfLines={1}>{p.name}</Text>
              <Text style={{ color: colors.foregroundMuted, fontSize: 12, fontFamily: fonts.regular }}>{p.category} · {p.brand}</Text>
              <Text style={{ color: colors.foreground, fontFamily: fonts.semiBold, marginTop: 4 }}>₹{p.price.toLocaleString()}</Text>
              <View style={{ marginTop: 8 }}>
                {p.inStock ? <Badge label="In stock" variant="success" /> : <Badge label="Out of stock" variant="muted" />}
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
                <Text>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {products.length === 0 && (
          <Text style={{ textAlign: 'center', color: colors.foregroundMuted, marginTop: 40, fontFamily: fonts.regular }}>
            No products yet. Add your first listing.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: { paddingVertical: 14, alignItems: 'center' },
  card: { flexDirection: 'row', padding: 12, marginBottom: 12, borderWidth: 1, alignItems: 'center' },
  img: { width: 72, height: 72 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '600' },
  actions: { gap: 6 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
});
