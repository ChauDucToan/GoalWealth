import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function TransactionsSearchScreen() {
  const { transactions } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('Fresh Subscription');

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return transactions;
    return transactions.filter((item) =>
      [item.merchant, item.category, item.reference].join(' ').toLowerCase().includes(normalized)
    );
  }, [query, transactions]);

  return (
    <FinanceScreen title="Search Transactions" subtitle="Find by merchant, category or reference">
      <FinanceCard>
        <View
          style={[
            styles.searchRow,
            {
              borderColor: hexToRgba(colors.primaryDark, 0.12),
              backgroundColor: colors.backgroundSoft,
            },
          ]}
        >
          <MaterialIcons name="search" size={20} color={hexToRgba(colors.text, 0.46)} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search transaction"
            placeholderTextColor={hexToRgba(colors.text, 0.42)}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyBadge,
                { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
            >
              <MaterialCommunityIcons
                name="file-search-outline"
                size={36}
                color={colors.primaryDark}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Whoops! No results found.</Text>
            <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.56) }]}>
              We couldn&apos;t find a transaction matching &quot;{query}&quot;.
            </Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {results.slice(0, 6).map((item) => (
              <Pressable
                key={item.id}
                style={[styles.row, { backgroundColor: colors.backgroundSoft }]}
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/transaction/[id]',
                    params: { id: item.id },
                  })
                }
              >
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: hexToRgba(item.accent, 0.12) },
                  ]}
                >
                  <MaterialIcons name={item.icon} size={18} color={item.accent} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{item.merchant}</Text>
                  <Text style={[styles.rowMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                    {item.category} • {item.timeLabel}
                  </Text>
                </View>
                <Text style={[styles.rowAmount, { color: colors.text }]}>
                  {formatCurrency(item.amount)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyBadge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  resultsList: {
    marginTop: 18,
    gap: 12,
  },
  row: {
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  rowMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  rowAmount: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
});
