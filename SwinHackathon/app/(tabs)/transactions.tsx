import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { groupTransactionsByDate } from '@/components/finance/finance-utils';
import { merchantHighlights, overviewStats } from '@/components/home/mock-data';
import { useFinance } from '@/hooks/use-finance';
import { useTabBarClearance } from '@/hooks/use-tab-bar-clearance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

type FilterKey = 'all' | 'income' | 'expense' | 'pending';

function formatCurrency(value: number) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toFixed(2)}`;
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { tabBarFloatingClearance } = useTabBarClearance();
  const { transactions, categories } = useFinance();
  const [filter, setFilter] = useState<FilterKey>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      if (filter === 'income') return item.type === 'income';
      if (filter === 'expense') return item.type === 'expense';
      if (filter === 'pending') return item.status === 'Pending';
      return true;
    });
  }, [filter, transactions]);

  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(filteredTransactions),
    [filteredTransactions]
  );

  const pendingCount = transactions.filter((item) => item.status === 'Pending').length;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(120, tabBarFloatingClearance) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <Text style={[styles.title, { color: colors.text }]}>My Transactions</Text>
        <Text style={[styles.subtitle, { color: hexToRgba(colors.text, 0.56) }]}>
          Track all money in and out in one place.
        </Text>

        <Pressable
          style={[
            styles.searchRow,
            {
              borderColor: hexToRgba(colors.primaryDark, 0.12),
              backgroundColor: hexToRgba(colors.primaryDark, 0.03),
            },
          ]}
          onPress={() => router.push('/(finance)/transactions-search')}
        >
          <MaterialIcons name="search" size={20} color={hexToRgba(colors.text, 0.46)} />
          <Text style={[styles.searchText, { color: hexToRgba(colors.text, 0.42) }]}>
            Search merchant, category, reference
          </Text>
        </Pressable>

        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: hexToRgba(colors.primaryDark, 0.08),
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.58) }]}>
              Income
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primaryDark }]}>
              {formatCurrency(overviewStats.income)}
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: hexToRgba(colors.error, 0.08),
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.58) }]}>
              Expenses
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(overviewStats.expenses)}
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: hexToRgba('#F59E0B', 0.12),
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.58) }]}>
              Pending
            </Text>
            <Text style={[styles.summaryValue, { color: '#B45309' }]}>{pendingCount}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <ThemeButton
            title="Add"
            onPress={() => router.push('/(finance)/add-transaction')}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.actionButton}
          />
          <ThemeButton
            title="Send"
            onPress={() => router.push('/(finance)/send-money')}
            colorBackground={colors.backgroundSoft}
            colorText={colors.text}
            style={styles.actionButton}
          />
          <ThemeButton
            title="Categories"
            onPress={() => router.push('/(finance)/categories')}
            colorBackground={colors.backgroundSoft}
            colorText={colors.text}
            style={styles.actionButton}
          />
        </View>

        <View style={styles.merchantRow}>
          {merchantHighlights.map((merchant) => (
            <Pressable
              key={merchant.id}
              style={[
                styles.merchantChip,
                { backgroundColor: hexToRgba(merchant.accent, 0.1) },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/(finance)/merchant/[merchant]',
                  params: { merchant: merchant.label },
                })
              }
            >
              <MaterialIcons name={merchant.icon} size={16} color={merchant.accent} />
              <Text style={[styles.merchantText, { color: colors.text }]}>{merchant.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.filterPanel, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <View style={styles.filterPanelHeader}>
          <View>
            <Text style={[styles.filterPanelTitle, { color: colors.text }]}>Quick Filters</Text>
            <Text style={[styles.filterPanelBody, { color: hexToRgba(colors.text, 0.54) }]}>
              {filteredTransactions.length} transactions visible. Sorting and date range live inside Filters.
            </Text>
          </View>
          <Pressable
            style={[
              styles.filterWorkspaceButton,
              {
                backgroundColor: hexToRgba(colors.primaryDark, 0.08),
                borderColor: hexToRgba(colors.primaryDark, 0.12),
              },
            ]}
            onPress={() => router.push('/(finance)/transactions-filters')}
          >
            <MaterialIcons name="tune" size={18} color={colors.primaryDark} />
            <Text style={[styles.filterWorkspaceButtonText, { color: colors.primaryDark }]}>
              Filters
            </Text>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {(['all', 'income', 'expense', 'pending'] as const).map((item) => {
            const selected = filter === item;
            const label = item.charAt(0).toUpperCase() + item.slice(1);

            return (
              <Pressable
                key={item}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selected ? colors.primaryDark : colors.backgroundSoft,
                    borderColor: selected
                      ? colors.primaryDark
                      : hexToRgba(colors.primaryDark, 0.1),
                  },
                ]}
                onPress={() => setFilter(item)}
              >
                <Text style={[styles.filterText, { color: selected ? colors.card : colors.text }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.categoryPanel, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <View style={styles.panelHeader}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>Top Categories</Text>
          <Pressable onPress={() => router.push('/(finance)/categories')}>
            <Text style={[styles.panelMeta, { color: colors.primaryDark }]}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.categoryWrap}>
          {categories.slice(0, 4).map((item) => (
            <View
              key={item.id}
              style={[styles.categoryChip, { backgroundColor: hexToRgba(item.accent, 0.1) }]}
            >
              <MaterialIcons name={item.icon} size={16} color={item.accent} />
              <Text style={[styles.categoryChipText, { color: colors.text }]}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.listCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        {Object.entries(groupedTransactions).map(([group, items]) => (
          <View key={group} style={styles.groupWrap}>
            <Text style={[styles.groupLabel, { color: hexToRgba(colors.text, 0.54) }]}>
              {group}
            </Text>

            {items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.transactionRow}
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/transaction/[id]',
                    params: { id: item.id },
                  })
                }
              >
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: hexToRgba(item.accent, 0.12) },
                  ]}
                >
                  <MaterialIcons name={item.icon} size={20} color={item.accent} />
                </View>

                <View style={styles.transactionTextWrap}>
                  <Text style={[styles.transactionMerchant, { color: colors.text }]}>
                    {item.merchant}
                  </Text>
                  <Text style={[styles.transactionMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                    {item.category} • {item.timeLabel}
                  </Text>
                </View>

                <View style={styles.amountWrap}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: item.type === 'income' ? colors.primaryDark : colors.text },
                    ]}
                  >
                    {formatCurrency(item.amount)}
                  </Text>
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === 'Pending' ? '#B45309' : hexToRgba(colors.text, 0.5),
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 66,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerCard: {
    borderRadius: 28,
    padding: 20,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 22,
  },
  searchRow: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchText: {
    fontSize: Typography.body,
    flex: 1,
    minWidth: 0,
  },
  summaryRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    flexBasis: 96,
    minWidth: 0,
    borderRadius: 18,
    padding: 14,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  summaryLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
  },
  actionRow: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexBasis: 100,
    minWidth: 0,
  },
  merchantRow: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  merchantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  merchantText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  filterRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterPanel: {
    marginTop: 18,
    borderRadius: 24,
    padding: 18,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  filterPanelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  filterPanelTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  filterPanelBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 240,
  },
  filterWorkspaceButton: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterWorkspaceButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  filterChip: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  categoryPanel: {
    marginTop: 18,
    borderRadius: 24,
    padding: 18,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  panelMeta: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  categoryWrap: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryChipText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  listCard: {
    marginTop: 18,
    borderRadius: 26,
    padding: 18,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  groupWrap: {
    marginTop: 6,
  },
  groupLabel: {
    marginBottom: 10,
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  transactionIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  transactionMerchant: {
    fontSize: Typography.body,
    fontWeight: '700',
    flexShrink: 1,
  },
  transactionMeta: {
    marginTop: 4,
    fontSize: Typography.body,
    flexShrink: 1,
  },
  amountWrap: {
    alignItems: 'flex-end',
    minWidth: 0,
    marginLeft: 8,
  },
  transactionAmount: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  statusText: {
    marginTop: 4,
    fontSize: Typography.body,
    fontWeight: '700',
  },
});
