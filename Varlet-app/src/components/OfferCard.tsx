import React from 'react';
import { Text, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import type { Offer } from '../services/api';
import { shortDate } from '../utils/format';
import PressableScale from './ui/PressableScale';

export default function OfferCard({
  offer,
  onPress,
  style,
}: {
  offer: Offer;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, borderRadius, fonts } = useTheme();
  const ink = colors.accentForeground;
  const details = [
    offer.shopName,
    offer.distance,
    offer.endsAt ? `until ${shortDate(offer.endsAt)}` : null,
  ].filter(Boolean);

  return (
    <PressableScale onPress={onPress} disabled={!onPress} style={style}>
      <LinearGradient
        colors={colors.gradientAccent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderRadius: borderRadius['2xl'] }]}
      >
        {offer.discountPercent ? (
          <Text style={[styles.discount, { color: ink, fontFamily: fonts.display }]}>
            {offer.discountPercent}% off
          </Text>
        ) : null}
        <View>
          <Text numberOfLines={2} style={[styles.title, { color: ink, fontFamily: fonts.displaySemi }]}>
            {offer.title}
          </Text>
          {offer.description ? (
            <Text numberOfLines={2} style={[styles.text, { color: ink, fontFamily: fonts.regular }]}>
              {offer.description}
            </Text>
          ) : null}
          <Text numberOfLines={1} style={[styles.meta, { color: ink, fontFamily: fonts.semiBold }]}>
            {details.join(' · ')}
          </Text>
        </View>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, minHeight: 118, justifyContent: 'space-between', gap: 8 },
  discount: { fontSize: 28, lineHeight: 32, letterSpacing: -0.5 },
  title: { fontSize: 17, lineHeight: 21 },
  text: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  meta: { fontSize: 11, marginTop: 8 },
});
