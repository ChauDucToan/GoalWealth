import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import { overviewStats, walletAccounts } from '@/components/home/mock-data';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from '@/lib/expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function AccountScreen() {
  const { colors } = useTheme();
  const { transactions } = useFinance();
  const router = useRouter();
  const { accountId } = useLocalSearchParams<{ accountId?: string }>();
  const account = walletAccounts.find((item) => item.id === accountId) ?? walletAccounts[0];

  return (
    <FinanceScreen title="My Account" subtitle={account.label}>
      <FinanceCard>
        <Text style={[styles.balance, { color: colors.text }]}>
          {formatCurrency(account.balance)}
        </Text>
        <Text style={[styles.change, { color: colors.primaryDark }]}>{account.changeLabel}</Text>

        <View style={[styles.chartCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.05) }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartLabel, { color: colors.text }]}>3m</Text>
            <Text style={[styles.chartLabel, { color: hexToRgba(colors.text, 0.48) }]}>6m</Text>
            <Text style={[styles.chartLabel, { color: hexToRgba(colors.text, 0.48) }]}>1y</Text>
            <Text style={[styles.chartLabel, { color: hexToRgba(colors.text, 0.48) }]}>YTD</Text>
          </View>
          <View style={styles.chartBars}>
            {[24, 28, 22, 36, 40].map((value, index) => (
              <View key={index} style={styles.chartBarWrap}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: value * 2,
                      backgroundColor:
                        index === 4 ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.18),
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSoft }]}>
            <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.54) }]}>
              Income
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primaryDark }]}>
              {formatCurrency(overviewStats.income)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSoft }]}>
            <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.54) }]}>
              Expenses
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(overviewStats.expenses)}
            </Text>
          </View>
        </View>

        <View style={styles.list}>
          {transactions.slice(0, 4).map((item) => (
            <View
              key={item.id}
              style={[styles.row, { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) }]}
            >
              <View style={styles.rowLeft}>
                <MaterialIcons name={item.icon} size={18} color={item.accent} />
                <Text style={[styles.rowText, { color: colors.text }]}>{item.merchant}</Text>
              </View>
              <Text style={[styles.rowAmount, { color: colors.text }]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        <ThemeButton
          title="Add New Transaction"
          onPress={() => router.push('/(finance)/add-transaction')}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.button}
        />
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  balance: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '800',
  },
  change: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: Typography.body,
    fontWeight: '700',
  },
  chartCard: {
    marginTop: 18,
    borderRadius: 18,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  chartBars: {
    marginTop: 18,
    height: 110,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartBarWrap: {
    width: '17%',
    alignItems: 'center',
  },
  chartBar: {
    width: 22,
    borderRadius: 12,
  },
  summaryRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
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
  list: {
    marginTop: 18,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  rowAmount: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  button: {
    marginTop: 18,
  },
});
