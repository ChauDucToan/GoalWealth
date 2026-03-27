import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import {
  budgetCategories,
  merchantHighlights,
  transactionSortOptions,
} from '@/components/home/mock-data';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const transactionTypes = [
  { id: 'All', label: 'All', icon: 'grid-view' as const },
  { id: 'Expense', label: 'Spending', icon: 'north-east' as const },
  { id: 'Income', label: 'Income', icon: 'south-west' as const },
];

const datePresets = [
  { id: 'Today', label: 'Today' },
  { id: 'Last 7 days', label: '7 days' },
  { id: 'This month', label: 'This month' },
  { id: 'Last month', label: 'Last month' },
];

export default function TransactionsFiltersScreen() {
  const { colors } = useTheme();
  const { scaleFont, isSmallPhone } = useResponsive();
  const router = useRouter();
  const [type, setType] = useState('All');
  const [category, setCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState(transactionSortOptions[0]);
  const [selectedDatePreset, setSelectedDatePreset] = useState('This month');
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

  const activeFilterCount = useMemo(
    () =>
      [
        type !== 'All',
        category !== null,
        selectedMerchant !== null,
        selectedDatePreset !== 'This month',
        selectedSort !== transactionSortOptions[0],
      ].filter(Boolean).length,
    [category, selectedDatePreset, selectedMerchant, selectedSort, type]
  );

  const resetFilters = () => {
    setType('All');
    setCategory(null);
    setSelectedSort(transactionSortOptions[0]);
    setSelectedDatePreset('This month');
    setSelectedMerchant(null);
  };

  return (
    <FinanceScreen
      title="Filters"
      subtitle="Clean up the ledger before you review the entries."
    >
      <View style={styles.stack}>
        <FinanceCard
          style={[
            styles.summaryCard,
            { backgroundColor: colors.primaryDark },
          ]}
        >
          <View style={styles.summaryTop}>
            <View style={styles.summaryCopy}>
              <Text style={[styles.summaryEyebrow, { color: hexToRgba(colors.card, 0.74) }]}>
                Spending view
              </Text>
              <Text
                style={[
                  styles.summaryTitle,
                  {
                    color: colors.card,
                    fontSize: isSmallPhone ? scaleFont(22, 0.72) : scaleFont(24, 0.72),
                  },
                ]}
              >
                Focus on the entries that matter now.
              </Text>
            </View>

            <View style={[styles.summaryBadge, { backgroundColor: hexToRgba(colors.card, 0.14) }]}>
              <Text style={[styles.summaryBadgeValue, { color: colors.card }]}>
                {activeFilterCount}
              </Text>
              <Text style={[styles.summaryBadgeLabel, { color: hexToRgba(colors.card, 0.76) }]}>
                active
              </Text>
            </View>
          </View>

          <View style={styles.summaryMetaRow}>
            <View style={[styles.summaryMetaChip, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <MaterialIcons name="tune" size={14} color={colors.card} />
              <Text style={[styles.summaryMetaText, { color: colors.card }]}>
                {type === 'All' ? 'All entries' : type}
              </Text>
            </View>
            <View style={[styles.summaryMetaChip, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <MaterialIcons name="calendar-month" size={14} color={colors.card} />
              <Text style={[styles.summaryMetaText, { color: colors.card }]}>{selectedDatePreset}</Text>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Type</Text>
          <View style={styles.segmentedRow}>
            {transactionTypes.map((item) => {
              const active = item.id === type;
              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.segmentedChip,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                      borderColor: active
                        ? colors.primaryDark
                        : hexToRgba(colors.primaryDark, 0.08),
                    },
                  ]}
                  onPress={() => setType(item.id)}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={16}
                    color={active ? colors.card : colors.primaryDark}
                  />
                  <Text style={[styles.segmentedText, { color: active ? colors.card : colors.text }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Date range</Text>
          <View style={styles.segmentedRow}>
            {datePresets.map((item) => {
              const active = item.id === selectedDatePreset;
              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: active ? hexToRgba(colors.primaryDark, 0.1) : colors.backgroundSoft,
                      borderColor: active
                        ? colors.primaryDark
                        : hexToRgba(colors.primaryDark, 0.08),
                    },
                  ]}
                  onPress={() => setSelectedDatePreset(item.id)}
                >
                  <Text style={[styles.dateChipText, { color: active ? colors.primaryDark : colors.text }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top categories</Text>
            {category ? (
              <Pressable onPress={() => setCategory(null)}>
                <Text style={[styles.sectionAction, { color: colors.primaryDark }]}>Clear</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.categoryGrid}>
            {budgetCategories.map((item) => {
              const active = item.name === category;
              const progress = item.limit > 0 ? item.spent / item.limit : 0;
              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: active ? hexToRgba(item.accent, 0.14) : colors.backgroundSoft,
                      borderColor: active ? item.accent : hexToRgba(colors.primaryDark, 0.06),
                    },
                  ]}
                  onPress={() => setCategory((current) => (current === item.name ? null : item.name))}
                >
                  <View style={styles.categoryCardTop}>
                    <View style={[styles.categoryIcon, { backgroundColor: hexToRgba(item.accent, 0.18) }]}>
                      <MaterialIcons name={item.icon} size={16} color={item.accent} />
                    </View>
                    <Text style={[styles.categoryPercent, { color: active ? item.accent : hexToRgba(colors.text, 0.52) }]}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={[styles.categoryTitle, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.categoryMeta, { color: hexToRgba(colors.text, 0.56) }]}>
                    ${item.spent} / ${item.limit}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Merchants</Text>
            {selectedMerchant ? (
              <Pressable onPress={() => setSelectedMerchant(null)}>
                <Text style={[styles.sectionAction, { color: colors.primaryDark }]}>Clear</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.merchantWrap}>
            {merchantHighlights.map((item) => {
              const active = selectedMerchant === item.label;
              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.merchantCard,
                    {
                      backgroundColor: active ? hexToRgba(item.accent, 0.14) : colors.backgroundSoft,
                      borderColor: active ? item.accent : hexToRgba(colors.primaryDark, 0.06),
                    },
                  ]}
                  onPress={() =>
                    setSelectedMerchant((current) => (current === item.label ? null : item.label))
                  }
                >
                  <View style={[styles.merchantIcon, { backgroundColor: hexToRgba(item.accent, 0.16) }]}>
                    <MaterialIcons name={item.icon} size={16} color={item.accent} />
                  </View>
                  <Text numberOfLines={1} style={[styles.merchantLabel, { color: colors.text }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sort by</Text>
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
                      borderColor: active ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.06),
                    },
                  ]}
                  onPress={() => setSelectedSort(option)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                  <View
                    style={[
                      styles.radioOuter,
                      {
                        borderColor: active ? colors.primaryDark : hexToRgba(colors.text, 0.22),
                      },
                    ]}
                  >
                    {active ? (
                      <View style={[styles.radioInner, { backgroundColor: colors.primaryDark }]} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <View style={styles.buttonRow}>
          <ThemeButton
            title="Clear all"
            onPress={resetFilters}
            colorBackground={colors.backgroundSoft}
            colorText={colors.text}
            style={styles.button}
          />
          <ThemeButton
            title="Apply filters"
            onPress={() => router.back()}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.button}
          />
        </View>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginTop: 18,
    gap: 16,
  },
  summaryCard: {
    borderWidth: 0,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  summaryEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  summaryTitle: {
    marginTop: 8,
    fontWeight: '900',
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  summaryBadge: {
    minWidth: 74,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBadgeValue: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  summaryBadgeLabel: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryMetaRow: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryMetaChip: {
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryMetaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '800',
  },
  segmentedRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  segmentedChip: {
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmentedText: {
    fontSize: 13,
    fontWeight: '800',
  },
  dateChip: {
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  categoryGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    minWidth: 0,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  categoryTitle: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '800',
  },
  categoryMeta: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
  },
  merchantWrap: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  merchantCard: {
    minHeight: 42,
    maxWidth: '100%',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  merchantIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  optionList: {
    marginTop: 14,
    gap: 10,
  },
  optionRow: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: '700',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
