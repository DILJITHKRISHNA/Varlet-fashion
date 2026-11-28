import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { Product } from '../services/mockData';
import { discountOff, rupees } from '../utils/format';
import PressableScale from './ui/PressableScale';
import Thumb from './ui/Thumb';
import Badge from './ui/Badge';

const GAP = 12;

interface TileProps {
  product: Product;
  width: number;
  badge?: { label: string; strong: boolean };
  onPress: () => void;
}

export function ProductTile({ product, width, badge, onPress }: TileProps) {
  const { colors, borderRadius, fonts } = useTheme();
  const off = discountOff(product.price, product.originalPrice);

  return (
    <View style={{ width }}>
      <PressableScale onPress={onPress} accessibilityLabel={product.name}>
        <View
          style={[
            styles.photo,
            { height: width * 1.25, borderRadius: borderRadius.xl, borderColor: colors.border },
          ]}
        >
          <Thumb uri={product.images[0]} style={styles.fill} />
          {off ? (
            <View style={[styles.off, { backgroundColor: colors.accent }]}>
              <Text style={[styles.offText, { color: colors.accentForeground, fontFamily: fonts.bold }]}>
                {off}% OFF
              </Text>
            </View>
          ) : null}
        </View>
        {badge && (
          <View style={styles.badge}>
            <Badge label={badge.label} variant={badge.strong ? 'success' : 'muted'} />
          </View>
        )}
        <Text numberOfLines={1} style={[styles.shop, { color: colors.foregroundMuted, fontFamily: fonts.regular }]}>
          {product.shopName}
        </Text>
        <Text numberOfLines={1} style={[styles.name, { color: colors.foreground, fontFamily: fonts.medium }]}>
          {product.name}
        </Text>
        <Text style={[styles.price, { color: colors.foreground, fontFamily: fonts.displaySemi }]}>
          {rupees(product.price)}
        </Text>
      </PressableScale>
    </View>
  );
}

/** Two products per row, for any list inside a padded screen. */
export default function ProductGrid({
  products,
  navigation,
  badgeFor,
}: {
  products: Product[];
  navigation: any;
  badgeFor?: (product: Product) => TileProps['badge'];
}) {
  const { width } = useWindowDimensions();
  const tile = (width - 40 - GAP) / 2;

  return (
    <View style={styles.grid}>
      {products.map((p) => (
        <ProductTile
          key={p.id}
          product={p}
          width={tile}
          badge={badgeFor?.(p)}
          // push, so "goes well with" can open one product on top of another
          onPress={() =>
            navigation.push
              ? navigation.push('ProductDetail', { product: p })
              : navigation.navigate('ProductDetail', { product: p })
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  photo: { overflow: 'hidden', borderWidth: 1 },
  fill: { width: '100%', height: '100%' },
  off: { position: 'absolute', left: 10, top: 10, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  offText: { fontSize: 10 },
  badge: { marginTop: 8 },
  shop: { fontSize: 11, marginTop: 8 },
  name: { fontSize: 13, marginTop: 2 },
  price: { fontSize: 16, marginTop: 3, marginBottom: 6 },
});
