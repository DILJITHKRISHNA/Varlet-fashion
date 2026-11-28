import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { MessageCircle, Phone, Navigation, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getEnquirySummary, getRecentEnquiries, type EnquiryKind } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { dateTime, shortDate } from '../../utils/format';
import ScreenHeader from '../../components/ui/ScreenHeader';
import StateView from '../../components/ui/StateView';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';

const PERIODS = [7, 30, 90];
const CHART_HEIGHT = 110;
const KINDS: Record<EnquiryKind, { label: string; one: string; icon: LucideIcon; color: string }> = {
  whatsapp: { label: 'WhatsApp', one: 'WhatsApp tap', icon: MessageCircle, color: '#34D399' },
  call: { label: 'Calls', one: 'Call tap', icon: Phone, color: '#FF6B35' },
  directions: { label: 'Directions', one: 'Directions request', icon: Navigation, color: '#8B7CFF' },
};
const ORDER = Object.keys(KINDS) as EnquiryKind[];

export default function ShopEnquiriesScreen() {
  const { colors, fonts } = useTheme();
  const [days, setDays] = useState(7);
  const { data, error, loading, reload } = useAsync(async () => {
    const [summary, recent] = await Promise.all([getEnquirySummary(days), getRecentEnquiries()]);
    return { days, summary, recent };
  }, [days]);

  const summary = data?.days === days ? data.summary : null;
  const peak = Math.max(1, ...(summary?.byDay.map((d) => d.whatsapp + d.call + d.directions) ?? []));
  const muted = { color: colors.foregroundMuted, fontFamily: fonts.regular };
  const strong = { color: colors.foreground, fontFamily: fonts.semiBold };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Enquiries" subtitle="How shoppers reach out" showLogout />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading && !!summary} onRefresh={reload} tintColor={colors.accent} />}
      >
        <View style={styles.periods}>
          {PERIODS.map((p) => (
            <Chip key={p} label={`${p} days`} selected={days === p} onPress={() => setDays(p)} />
          ))}
        </View>

        {error && summary && <Text style={[styles.small, { color: colors.destructive }]}>{error}</Text>}

        {!summary || !data ? (
          <StateView loading={loading} error={error} action={{ label: 'Try again', onPress: reload }} />
        ) : (
          <>
            <View style={styles.totals}>
              {ORDER.map((kind) => {
                const { label, icon: Icon, color } = KINDS[kind];
                return (
                  <Card key={kind} style={styles.total}>
                    <Icon size={18} color={color} />
                    <Text style={[styles.value, { color: colors.foreground, fontFamily: fonts.display }]}>{summary.totals[kind]}</Text>
                    <Text style={[styles.small, muted]}>{label}</Text>
                  </Card>
                );
              })}
            </View>

            {summary.total === 0 ? (
              <StateView
                icon={MessageCircle}
                title="No enquiries in this period"
                message="They appear when shoppers tap WhatsApp, Call or Directions on your store or products."
              />
            ) : (
              <>
                <Card>
                  <Text style={[styles.heading, strong]}>Day by day</Text>
                  <View
                    style={[styles.chart, { gap: days > 30 ? 1 : 3 }]}
                    accessibilityLabel={`${summary.total} enquiries in ${days} days, at most ${peak} in a day`}
                  >
                    {summary.byDay.map((day) => (
                      <View key={day.date} style={styles.column}>
                        {ORDER.map((kind) =>
                          day[kind] ? (
                            <View key={kind} style={{ height: (day[kind] / peak) * CHART_HEIGHT, backgroundColor: KINDS[kind].color }} />
                          ) : null
                        )}
                        <View style={[styles.base, { backgroundColor: colors.border }]} />
                      </View>
                    ))}
                  </View>
                  <View style={styles.axis}>
                    <Text style={[styles.tiny, muted]}>{shortDate(summary.byDay[0].date)}</Text>
                    <Text style={[styles.tiny, muted]}>Busiest day: {peak}</Text>
                    <Text style={[styles.tiny, muted]}>Today</Text>
                  </View>
                </Card>

                {summary.topProducts.length > 0 && (
                  <Card>
                    <Text style={[styles.heading, strong]}>Most asked about</Text>
                    {summary.topProducts.map((p) => (
                      <View key={p.productId} style={[styles.line, { borderTopColor: colors.border }]}>
                        <Text numberOfLines={1} style={[styles.flex, styles.lineText, strong]}>{p.name}</Text>
                        <Text style={[styles.lineText, muted]}>{p.count}</Text>
                      </View>
                    ))}
                  </Card>
                )}
              </>
            )}

            {data.recent.length > 0 && (
              <Card>
                <Text style={[styles.heading, strong]}>Latest</Text>
                {data.recent.map((e) => {
                  const { one, icon: Icon, color } = KINDS[e.kind];
                  return (
                    <View key={e.id} style={[styles.line, { borderTopColor: colors.border }]}>
                      <Icon size={16} color={color} />
                      <View style={styles.flex}>
                        <Text style={[styles.lineText, strong]}>{one}</Text>
                        <Text numberOfLines={1} style={[styles.small, muted]}>{e.productName ?? 'Store page'}</Text>
                      </View>
                      <Text style={[styles.tiny, muted]}>{dateTime(e.createdAt)}</Text>
                    </View>
                  );
                })}
              </Card>
            )}
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
  periods: { flexDirection: 'row', gap: 8 },
  totals: { flexDirection: 'row', gap: 10 },
  total: { flex: 1, padding: 12, gap: 4 },
  value: { fontSize: 28 },
  small: { fontSize: 12 },
  tiny: { fontSize: 10 },
  heading: { fontSize: 15, marginBottom: 12 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: CHART_HEIGHT + 2 },
  column: { flex: 1, justifyContent: 'flex-end' },
  base: { height: 2 },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1 },
  lineText: { fontSize: 13 },
});
