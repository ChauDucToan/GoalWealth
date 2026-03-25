import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { budgetCategories, merchantHighlights, transactionSortOptions } from '@/components/home/mock-data';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

const transactionTypes = ['All', 'Income', 'Expense'];
const datePresets = ['Today', 'Last 7 days', 'This month', 'Last month'];

export default function TransactionsFiltersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [type, setType] = useState('All');
  const [category, setCategory] = useState(budgetCategories[0].name);
  const [selectedSort, setSelectedSort] = useState(transactionSortOptions[0]);
  const [selectedDatePreset, setSelectedDatePreset] = useState(datePresets[0]);
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

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
          {merchantHighlights.map((item) => {
            const active = selectedMerchant === item.label;
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? hexToRgba(item.accent, 0.16) : colors.backgroundSoft,
                    borderColor: active ? item.accent : 'transparent',
                  },
                ]}
                onPress={() => setSelectedMerchant((current) => (current === item.label ? null : item.label))}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Sort By</Text>
        <View style={styles.optionList}>
          {transactionSortOptions.map((option) => {
            const active = option === selectedSort;
            return (
              <Pressable
                key={option}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.backgroundSoft,
                    borderColor: active ? colors.primaryDark : 'transparent',
                  },
                ]}
                onPress={() => setSelectedSort(option)}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Date Range</Text>
        <View style={styles.chipWrap}>
          {datePresets.map((option) => {
            const active = option === selectedDatePreset;
            return (
              <Pressable
                key={option}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                    borderColor: active ? colors.primaryDark : 'transparent',
                  },
                ]}
                onPress={() => setSelectedDatePreset(option)}
              >
                <Text style={[styles.chipText, { color: active ? colors.card : colors.text }]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
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
  optionList: {
    marginTop: 12,
    marginBottom: 18,
    gap: 10,
  },
  optionRow: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  optionText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 16,
  },
});
