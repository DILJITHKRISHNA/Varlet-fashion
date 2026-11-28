import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Plus, Upload, Tag, MessageCircle, Store, ChevronRight, Phone, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { getMyShop, getMyProducts, getMyOffers, getEnquirySummary } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { canManageStore, offerStatus } from '../../utils/shop';
import ScreenHeader from '../../components/ui/ScreenHeader';
import StateView from '../../components/ui/StateView';
import Card from '../../components/ui/Card';

const ROLE_LABELS: Record<string, string> = { admin: 'Shop Owner', manager: 'Manager', staff: 'Staff' };

export default function ShopDashboardScreen({ navigation }: any) {
  const { colors, fonts } = useTheme();
  const { role } = useAuthStore();
  const manages = canManageStore(role);

  const { data, error, loading, reload } = useAsync(async () => {
    const [shop, products, summary, offers] = await Promise.all([
      getMyShop(),
      getMyProducts(),
      manages ? getEnquirySummary(30) : null,
      manages ? getMyOffers() : null,
    ]);
    return { shop, products, summary, offers };
  }, [manages]);

  const actions: { icon: LucideIcon; label: string; hint: string; go: () => void; show: boolean }[] = [
    { icon: Plus, label: 'Add a product', hint: 'One at a time', go: () => navigation.navigate('ProductEditor'), show: true },
    { icon: Upload, label: 'Bulk upload', hint: 'From an Excel or CSV file', go: () => navigation.navigate('BulkUpload'), show: true },
    { icon: Tag, label: 'Offers', hint: 'Discounts shoppers can see', go: () => navigation.navigate('ShopOffers'), show: manages },
    { icon: MessageCircle, label: 'Customer enquiries', hint: 'WhatsApp, calls and directions', go: () => navigation.navigate('ShopEnquiriesTab'), show: manages },
    { icon: Store, label: 'Store profile', hint: 'Details, contact and location', go: () => navigation.navigate('ShopStoreProfile'), show: true },
  ];

  const muted = { color: colors.foregroundMuted, fontFamily: fonts.regular };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={data?.shop.name ?? 'My store'}
        subtitle={[ROLE_LABELS[role ?? 'admin'], data?.shop.location].filter(Boolean).join(' · ')}
        showLogout
        dark
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={reload} tintColor={colors.accent} />}
      >
        {error && data && <Text style={[styles.stale, { color: colors.destructive }]}>{error}</Text>}
        {!data ? (
          <StateView loading={loading} error={error} action={{ label: 'Try again', onPress: reload }} />
        ) : (
          <>
            <View style={styles.stats}>
              {[
                { label: 'Products', value: data.products.length },
                { label: 'Followers', value: data.shop.followerCount },
                ...(data.summary ? [{ label: 'Enquiries, 30 days', value: data.summary.total }] : []),
                ...(data.offers
                  ? [{ label: 'Live offers', value: data.offers.filter((o) => offerStatus(o) === 'Live').length }]
                  : []),
              ].map((stat) => (
                <Card key={stat.label} style={styles.stat}>
                  <Text style={[styles.value, { color: colors.foreground, fontFamily: fonts.display }]}>
                    {stat.value.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.small, muted]}>{stat.label}</Text>
                </Card>
              ))}
            </View>

            {manages && !data.shop.phone && !data.shop.whatsapp && (
              <TouchableOpacity onPress={() => navigation.navigate('ShopStoreProfile')}>
                <Card style={[styles.notice, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]}>
                  <Phone size={18} color={colors.accent} />
                  <Text style={[styles.noticeText, { color: colors.foreground, fontFamily: fonts.medium }]}>
                    Add your phone or WhatsApp number so shoppers can contact you.
                  </Text>
                  <ChevronRight size={18} color={colors.accent} />
                </Card>
              </TouchableOpacity>
            )}

            <Card style={styles.menu}>
              {actions.filter((a) => a.show).map(({ icon: Icon, label, hint, go }, i) => (
                <TouchableOpacity
                  key={label}
                  accessibilityRole="button"
                  style={[styles.item, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                  onPress={go}
                >
                  <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
                    <Icon size={18} color={colors.accent} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.label, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{label}</Text>
                    <Text style={[styles.small, muted]}>{hint}</Text>
                  </View>
                  <ChevronRight size={18} color={colors.foregroundMuted} />
                </TouchableOpacity>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 110, gap: 14 },
  flex: { flex: 1 },
  stale: { fontSize: 12 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { flexBasis: '47%', flexGrow: 1 },
  value: { fontSize: 28, marginBottom: 2 },
  small: { fontSize: 12 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 18 },
  menu: { paddingVertical: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, marginBottom: 2 },
});
