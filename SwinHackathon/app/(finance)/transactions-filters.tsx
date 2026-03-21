import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { budgetCategories, merchantHighlights } from '@/components/home/mock-data';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

const transactionTypes = ['All', 'Income', 'Expense', 'Transfer'];

export default function TransactionsFiltersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [type, setType] = useState('All');
  const [category, setCategory] = useState(budgetCategories[0].name);

  return (
    <FinanceScreen title="Filter Transactions" subtitle="Advanced filter controls from the board">
      <FinanceCard>
        <Text style={[styles.label, { color: colors.text }]}>Transaction Type</Text>
        <View style={styles.chipWrap}>
          {transactionTypes.map((item) => {
            const active = item === type;
            return (
              <Pressable
                key={item}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primaryDark : colors.backgroundSoft },
                ]}
                onPress={() => setType(item)}
              >
                <Text style={[styles.chipText, { color: active ? colors.card : colors.text }]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Transaction Category</Text>
        <View style={styles.chipWrap}>
          {budgetCategories.map((item) => {
            const active = item.name === category;
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? hexToRgba(item.accent, 0.18) : colors.backgroundSoft,
                    borderColor: active ? item.accent : 'transparent',
                  },
                ]}
                onPress={() => setCategory(item.name)}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>{item.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Recent Merchants</Text>
        <View style={styles.chipWrap}>
          {merchantHighlights.map((item) => (
            <View
              key={item.id}
              style={[styles.chip, { backgroundColor: colors.backgroundSoft }]}
            >
              <Text style={[styles.chipText, { color: colors.text }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.linkRow}>
          <ThemeButton
            title="Sort"
            onPress={() => router.push('/(finance)/sort-transactions')}
            colorBackground={colors.backgroundSoft}
            colorText={colors.text}
            style={styles.linkButton}
          />
          <ThemeButton
            title="Select Date"
            onPress={() => router.push('/(finance)/date-range')}
            colorBackground={colors.backgroundSoft}
            colorText={colors.text}
            style={styles.linkButton}
          />
        </View>

        <ThemeButton
          title="Apply Filter"
          onPress={() => router.back()}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.primaryButton}
        />
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  chipWrap: {
    marginTop: 12,
    marginBottom: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    gap: 10,
  },
  linkButton: {
    flex: 1,
  },
  primaryButton: {
    marginTop: 16,
  },
});
