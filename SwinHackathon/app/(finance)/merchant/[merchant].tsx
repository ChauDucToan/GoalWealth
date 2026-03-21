import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function MerchantDetailScreen() {
  const { merchant } = useLocalSearchParams<{ merchant: string }>();
  const { getTransactionsByMerchant } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();
  const transactions = getTransactionsByMerchant(merchant ?? '');
  const spendTotal = transactions
    .filter((item) => item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  return (
    <FinanceScreen
      title="Merchant Detail"
      subtitle={merchant}
      rightAccessory={
        <ThemeButton
          title="Edit"
          onPress={() =>
            router.push({
              pathname: '/(finance)/merchant-edit',
              params: { merchant },
            })
          }
          colorBackground={colors.primaryDark}
          colorText={colors.card}
        />
      }
    >
      <FinanceCard>
        <Text style={[styles.name, { color: colors.text }]}>{merchant}</Text>
        <Text style={[styles.meta, { color: hexToRgba(colors.text, 0.56) }]}>
          Spending summary & recent history
        </Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSoft }]}>
            <Text style={[styles.label, { color: hexToRgba(colors.text, 0.54) }]}>
              Transactions
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{transactions.length}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSoft }]}>
            <Text style={[styles.label, { color: hexToRgba(colors.text, 0.54) }]}>Spent</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(spendTotal)}
            </Text>
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.05) }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Spending Overview</Text>
          <View style={styles.chartBars}>
            {[22, 34, 28, 42, 26].map((value, index) => (
              <View key={index} style={styles.chartColumn}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: value * 2,
                      backgroundColor:
                        index === 3 ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.2),
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.historyList}>
          {transactions.length > 0 ? (
            transactions.slice(0, 4).map((item) => (
              <View
                key={item.id}
                style={[styles.historyRow, { backgroundColor: colors.backgroundSoft }]}
              >
                <View>
                  <Text style={[styles.historyTitle, { color: colors.text }]}>{item.dateLabel}</Text>
                  <Text style={[styles.historyMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                    {item.category} • {item.location}
                  </Text>
                </View>
                <Text style={[styles.historyAmount, { color: colors.text }]}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: hexToRgba(colors.text, 0.56) }]}>
              No matching transaction history found for this merchant.
            </Text>
          )}
        </View>
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 24,
    fontWeight: '800',
  },
  meta: {
    marginTop: 8,
    fontSize: Typography.body,
  },
  summaryRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
  },
  label: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
  },
  chartCard: {
    marginTop: 18,
    borderRadius: 18,
    padding: 16,
  },
  chartTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  chartBars: {
    marginTop: 18,
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  chartColumn: {
    width: '17%',
    alignItems: 'center',
  },
  chartBar: {
    width: 22,
    borderRadius: 12,
  },
  historyList: {
    marginTop: 18,
    gap: 12,
  },
  historyRow: {
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  historyTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  historyMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  historyAmount: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: Typography.body,
    lineHeight: 22,
  },
});
