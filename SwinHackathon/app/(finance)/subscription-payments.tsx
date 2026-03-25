import { hexToRgba } from '@/components/auth/AuthKit';
import { subscriptionItems } from '@/components/finance/subscription-data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const FILTERS = ['All Payments', 'Upcoming', 'Paid'] as const;

export default function SubscriptionPaymentsScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [search, setSearch] = useState(mode === 'empty' ? 'unknown service' : '');
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('All Payments');
  const isForcedEmpty = mode === 'empty';

  const rows = subscriptionItems
    .filter((item) => item.status !== 'cancelled')
    .filter((item) => {
      if (activeFilter === 'Upcoming') {
        return item.status === 'active';
      }
      if (activeFilter === 'Paid') {
        return item.charges.some((charge) => charge.status === 'paid');
      }
      return true;
    })
    .filter((item) => item.service.toLowerCase().includes(search.toLowerCase().trim()));

  const isEmpty = isForcedEmpty || rows.length === 0;
  const totalUpcoming = rows.reduce((sum, item) => sum + item.amount, 0);

  return (
    <FinanceScreen
      title="My Payments"
      subtitle={isEmpty ? 'Search and filter state when no payments match your current query.' : 'Upcoming and expected subscription renewals with fast review controls.'}
      contentStyle={styles.contentStyle}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.replace(isForcedEmpty ? '/(finance)/subscription-payments' : '/(finance)/subscription-payments?mode=empty')}
        >
          <MaterialIcons name={isForcedEmpty ? 'restart-alt' : 'search'} size={18} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={[styles.heroEyebrow, { color: colors.primaryDark }]}>PAYMENT WORKSPACE</Text>
              <Text style={[styles.heroValue, { color: colors.text }]}>{formatCurrency(totalUpcoming)}</Text>
              <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>Estimated total for the currently visible payment list.</Text>
            </View>
            <View style={[styles.heroBadge, { backgroundColor: colors.card }]}>
              <MaterialIcons name="receipt-long" size={20} color={colors.primaryDark} />
              <Text style={[styles.heroBadgeValue, { color: colors.text }]}>{rows.length}</Text>
            </View>
          </View>

          <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialIcons name="search" size={18} color={hexToRgba(colors.text, 0.5)} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search subscription service"
              placeholderTextColor={hexToRgba(colors.text, 0.4)}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>

          <View style={styles.filterRow}>
            {FILTERS.map((filter) => {
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

        {isEmpty ? (
          <FinanceCard style={styles.emptyCard}>
            <View style={[styles.emptyBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}>
              <MaterialIcons name="search-off" size={34} color={colors.primaryDark} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Result not found</Text>
            <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.56) }]}>
              No subscription payment matches this query. Reset the search or switch the filter to restore the ledger.
            </Text>
            <View style={styles.emptyActionRow}>
              <Pressable
                style={[styles.emptySecondary, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  setSearch('');
                  setActiveFilter('All Payments');
                  router.replace('/(finance)/subscription-payments');
                }}
              >
                <Text style={[styles.emptySecondaryText, { color: colors.text }]}>Reset</Text>
              </Pressable>
              <Pressable style={[styles.emptyPrimary, { backgroundColor: colors.primaryDark }]} onPress={() => router.push('/(finance)/subscription-add')}>
                <Text style={[styles.emptyPrimaryText, { color: colors.card }]}>Add subscription</Text>
              </Pressable>
            </View>
          </FinanceCard>
        ) : (
          <FinanceCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Visible payments</Text>
              <Text style={[styles.sectionMeta, { color: hexToRgba(colors.text, 0.52) }]}>{rows.length} items</Text>
            </View>

            <View style={styles.listStack}>
              {rows.map((item) => (
                <View key={item.id} style={[styles.row, { borderColor: colors.border }]}>
                  <View style={[styles.iconWrap, { backgroundColor: hexToRgba(item.accent, 0.12) }]}>
                    <MaterialIcons name={item.icon} size={18} color={item.accent} />
                  </View>
                  <View style={styles.copy}>
                    <Text style={[styles.title, { color: colors.text }]}>{item.service}</Text>
                    <Text style={[styles.meta, { color: hexToRgba(colors.text, 0.52) }]}>{item.nextPayment} • {item.paymentMethod}</Text>
                  </View>
                  <View style={styles.amountWrap}>
                    <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                    <Text style={[styles.statusText, { color: item.status === 'paused' ? colors.warning : colors.primaryDark }]}>
                      {item.status === 'paused' ? 'Paused' : 'Active'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </FinanceCard>
        )}
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    headerAction: { width: 38, height: 38, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    stack: { marginTop: 18, gap: 16 },
    heroCard: { borderWidth: 0, gap: 16 },
    heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
    heroEyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
    heroValue: { marginTop: 6, fontSize: 34, fontWeight: '900', letterSpacing: -1 },
    heroBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500', maxWidth: 220 },
    heroBadge: { minWidth: 66, minHeight: 66, borderRadius: 22, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
    heroBadgeValue: { fontSize: 18, fontWeight: '900' },
    searchRow: { borderWidth: 1, borderRadius: 18, minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
    searchInput: { flex: 1, fontSize: 13, fontWeight: '600' },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    filterChip: { minHeight: 38, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
    filterChipText: { fontSize: 12, fontWeight: '700' },
    emptyCard: { alignItems: 'center', paddingVertical: 28 },
    emptyBadge: { width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '900' },
    emptyBody: { marginTop: 8, fontSize: 13, lineHeight: 19, fontWeight: '500', textAlign: 'center' },
    emptyActionRow: { marginTop: 20, flexDirection: 'row', gap: 10 },
    emptyPrimary: { minHeight: 46, minWidth: 148, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
    emptyPrimaryText: { fontSize: 13, fontWeight: '800' },
    emptySecondary: { minHeight: 46, minWidth: 110, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
    emptySecondaryText: { fontSize: 13, fontWeight: '800' },
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
    statusText: { marginTop: 4, fontSize: 11, fontWeight: '700' },
  });
}
