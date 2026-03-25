import { hexToRgba } from '@/components/auth/AuthKit';
import { subscriptionHistoryRows } from '@/components/finance/subscription-data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const HISTORY_FILTERS = ['All', 'Paid', 'Pending'] as const;

export default function SubscriptionHistoryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeFilter, setActiveFilter] = useState<(typeof HISTORY_FILTERS)[number]>('All');

  const rows = subscriptionHistoryRows.filter((item) => {
    if (activeFilter === 'Paid') {
      return item.status === 'paid';
    }
    if (activeFilter === 'Pending') {
      return item.status === 'pending';
    }
    return true;
  });

  const totalTracked = rows.reduce((sum, item) => sum + item.amount, 0);

  return (
    <FinanceScreen title="My Subscription History" subtitle="Ledger-style review across all recurring charges and pending renewal events." contentStyle={styles.contentStyle}>
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={[styles.heroEyebrow, { color: colors.primaryDark }]}>HISTORY LEDGER</Text>
              <Text style={[styles.heroValue, { color: colors.text }]}>{rows.length}</Text>
              <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>Tracked charges in the current filtered history list.</Text>
            </View>
            <View style={[styles.heroMetric, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.text, 0.5) }]}>Total value</Text>
              <Text style={[styles.heroMetricValue, { color: colors.text }]}>{formatCurrency(totalTracked)}</Text>
            </View>
          </View>

          <View style={styles.filterRow}>
            {HISTORY_FILTERS.map((filter) => {
              const active = filter === activeFilter;
              return (
                <Pressable
                  key={filter}
                  style={[styles.filterChip, { backgroundColor: active ? colors.primaryDark : colors.card, borderColor: active ? colors.primaryDark : colors.border }]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterChipText, { color: active ? colors.card : colors.text }]}>{filter}</Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>History ledger</Text>
            <Text style={[styles.sectionMeta, { color: hexToRgba(colors.text, 0.52) }]}>{rows.length} rows</Text>
          </View>

          <View style={styles.listStack}>
            {rows.map((item) => (
              <View key={item.id} style={[styles.row, { borderColor: colors.border }]}>
                <View style={[styles.iconWrap, { backgroundColor: hexToRgba(item.accent, 0.12) }]}>
                  <MaterialIcons name={item.icon} size={18} color={item.accent} />
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.title, { color: colors.text }]}>{item.service}</Text>
                  <Text style={[styles.meta, { color: hexToRgba(colors.text, 0.52) }]}>{item.date}</Text>
                </View>
                <View style={styles.amountWrap}>
                  <Text style={[styles.amount, { color: item.status === 'pending' ? colors.warning : colors.text }]}>{formatCurrency(item.amount)}</Text>
                  <Text style={[styles.statusBadge, { color: item.status === 'pending' ? colors.warning : colors.primaryDark }]}>
                    {item.status === 'pending' ? 'Pending' : 'Paid'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    stack: { marginTop: 18, gap: 16 },
    heroCard: { borderWidth: 0, gap: 16 },
    heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
    heroEyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
    heroValue: { marginTop: 6, fontSize: 34, fontWeight: '900', letterSpacing: -1 },
    heroBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500', maxWidth: 220 },
    heroMetric: { minWidth: 114, borderRadius: 20, padding: 14 },
    heroMetricLabel: { fontSize: 11, fontWeight: '700' },
    heroMetricValue: { marginTop: 6, fontSize: 16, fontWeight: '800' },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    filterChip: { minHeight: 38, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
    filterChipText: { fontSize: 12, fontWeight: '700' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    sectionTitle: { fontSize: 15, fontWeight: '800' },
    sectionMeta: { fontSize: 12, fontWeight: '700' },
    listStack: { marginTop: 16, gap: 12 },
    row: { borderWidth: 1, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1 },
    title: { fontSize: 13, fontWeight: '800' },
    meta: { marginTop: 4, fontSize: 11, fontWeight: '600' },
    amountWrap: { alignItems: 'flex-end' },
    amount: { fontSize: 13, fontWeight: '800' },
    statusBadge: { marginTop: 4, fontSize: 11, fontWeight: '700' },
  });
}
