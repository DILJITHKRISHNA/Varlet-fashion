import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { MessageCircle, Phone, Navigation, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { recordEnquiry, type EnquiryKind } from '../services/api';
import type { Product, Shop } from '../services/mockData';
import PressableScale from './ui/PressableScale';

/** wa.me needs the country code; ten digits are taken to be an Indian number. */
function whatsappNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}

function links(shop: Shop, product?: Product) {
  const greeting = product
    ? `Hi ${shop.name}, I saw "${product.name}" (₹${product.price}) on Varlet. Is it available?`
    : `Hi ${shop.name}, I found your store on Varlet.`;
  const found: { kind: EnquiryKind; label: string; icon: LucideIcon; url: string }[] = [];
  if (shop.whatsapp) {
    found.push({
      kind: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/${whatsappNumber(shop.whatsapp)}?text=${encodeURIComponent(greeting)}`,
    });
  }
  if (shop.phone) {
    found.push({ kind: 'call', label: 'Call', icon: Phone, url: `tel:${shop.phone.replace(/[^\d+]/g, '')}` });
  }
  if (shop.lat !== undefined && shop.lng !== undefined) {
    found.push({
      kind: 'directions',
      label: 'Directions',
      icon: Navigation,
      url: `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`,
    });
  }
  return found;
}

/** WhatsApp, call and directions buttons. Each tap is counted for the shop owner. */
export default function ContactActions({ shop, product }: { shop: Shop; product?: Product }) {
  const { colors, borderRadius, fonts } = useTheme();
  const [problem, setProblem] = useState<string | null>(null);
  const actions = links(shop, product);

  const open = async (kind: EnquiryKind, url: string) => {
    setProblem(null);
    // Counting must never delay or block the shopper.
    recordEnquiry(shop.id, kind, product?.id).catch(() => {});
    try {
      await Linking.openURL(url);
    } catch {
      setProblem("This phone couldn't open that. Check that the app is installed.");
    }
  };

  return (
    <View>
      <View style={styles.row}>
        {actions.map(({ kind, label, icon: Icon, url }) => (
          <PressableScale
            key={kind}
            accessibilityRole="button"
            accessibilityLabel={`${label} ${shop.name}`}
            onPress={() => open(kind, url)}
            style={[
              styles.button,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderRadius: borderRadius.xl },
            ]}
          >
            <Icon size={20} color={colors.accent} />
            <Text style={[styles.label, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{label}</Text>
          </PressableScale>
        ))}
      </View>
      {!shop.phone && !shop.whatsapp && (
        <Text style={[styles.note, { color: colors.foregroundSubtle, fontFamily: fonts.regular }]}>
          This store hasn't added a phone number yet.
        </Text>
      )}
      {problem && (
        <Text style={[styles.note, { color: colors.destructive, fontFamily: fonts.regular }]}>{problem}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  button: { alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderWidth: 1, minWidth: 104 },
  label: { fontSize: 12 },
  note: { fontSize: 12, marginTop: 8 },
});
