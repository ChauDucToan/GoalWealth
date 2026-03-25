import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

type DetailField = {
  label: string;
  value: string;
  action?: () => void;
};

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTransactionById, markTransactionCompleted, transactions } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();
  const transaction = getTransactionById(id);

  if (!transaction) {
    return (
      <FinanceScreen title="Transaction Detail" subtitle="No transaction found">
        <FinanceCard>
          <Text style={[styles.muted, { color: hexToRgba(colors.text, 0.56) }]}>
            The selected transaction is not available in the current mock dataset.
          </Text>
        </FinanceCard>
      </FinanceScreen>
    );
  }

  const relatedTransactions = transactions
    .filter((item) => item.merchant === transaction.merchant && item.id !== transaction.id)
    .slice(0, 4);
  const detailFields: DetailField[] = [
    { label: 'Note', value: transaction.note || 'No note' },
    {
      label: 'Merchant',
      value: transaction.merchant,
      action: () =>
        router.push({
          pathname: '/(finance)/merchant/[merchant]',
          params: { merchant: transaction.merchant },
        }),
    },
    { label: 'Type', value: transaction.type, action: () => router.push('/(finance)/select-type') },
  ];

  return (
    <FinanceScreen title="Transaction Detail" subtitle={transaction.dateLabel}>
      <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryLight }]}>
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: hexToRgba(transaction.accent, 0.12) },
          ]}
        >
          <MaterialIcons name={transaction.icon} size={24} color={transaction.accent} />
        </View>

        <Text style={[styles.metaTop, { color: hexToRgba(colors.text, 0.52) }]}>
          Tuesday, 25 Aug 2026
        </Text>
        <Text style={[styles.merchant, { color: colors.text }]}>{transaction.merchant}</Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(Math.abs(transaction.amount))}
        </Text>

        <View style={styles.inlineBadgeRow}>
          <View
            style={[
              styles.inlineBadge,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
            ]}
          >
            <MaterialIcons name="event-repeat" size={14} color={colors.primaryDark} />
            <Text style={[styles.inlineBadgeText, { color: colors.primaryDark }]}>
              {transaction.location}
            </Text>
          </View>
        </View>

        <View style={styles.fieldList}>
          {detailFields.map((field) => (
            <Pressable
              key={field.label}
              style={[
                styles.fieldRow,
                { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
              onPress={field.action}
              disabled={!field.action}
            >
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.58) }]}>
                {field.label}
              </Text>
              <View style={styles.fieldRight}>
                <Text style={[styles.fieldValue, { color: colors.text }]}>{field.value}</Text>
                {field.action ? (
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={hexToRgba(colors.text, 0.32)}
                  />
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      </FinanceCard>

      {transaction.status === 'Pending' ? (
        <FinanceCard style={styles.secondaryCard}>
          <ThemeButton
            title="Mark as Completed"
            onPress={() => markTransactionCompleted(transaction.id)}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.primaryButton}
          />
        </FinanceCard>
      ) : null}

      <FinanceCard style={styles.secondaryCard}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
          <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>See all</Text>
        </View>

        {relatedTransactions.length > 0 ? (
          relatedTransactions.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.relatedRow,
                { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
              onPress={() =>
                router.replace({
                  pathname: '/(finance)/transaction/[id]',
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.relatedText}>
                <Text style={[styles.relatedTitle, { color: colors.text }]}>{item.merchant}</Text>
                <Text style={[styles.relatedMeta, { color: hexToRgba(colors.text, 0.5) }]}>
                  {item.category} • {item.dateLabel}
                </Text>
              </View>
              <Text style={[styles.relatedAmount, { color: colors.error }]}>
                {formatCurrency(item.amount)}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={[styles.muted, { color: hexToRgba(colors.text, 0.56) }]}>
            No additional history for this merchant yet.
          </Text>
        )}
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    paddingTop: 20,
  },
  secondaryCard: {
    marginTop: 16,
  },
  iconBadge: {
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaTop: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: Typography.body,
    fontWeight: '600',
  },
  merchant: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
  },
  amount: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '800',
  },
  inlineBadgeRow: {
    marginTop: 14,
    alignItems: 'center',
  },
  inlineBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inlineBadgeText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  fieldList: {
    marginTop: 18,
  },
  fieldRow: {
    minHeight: 54,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  fieldRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  fieldValue: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionLink: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  relatedRow: {
    marginTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  relatedText: {
    flex: 1,
  },
  relatedTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  relatedMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  relatedAmount: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  muted: {
    fontSize: Typography.body,
    lineHeight: 22,
  },
});
