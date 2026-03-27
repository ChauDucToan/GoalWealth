import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { groupTransactionsByDate } from '@/components/finance/finance-utils';
import { Typography } from '@/constants/theme';
import { useFinance } from '@/hooks/use-finance';
import { useResponsive } from '@/hooks/use-responsive';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTabBarClearance } from '@/hooks/use-tab-bar-clearance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type FilterKey = 'all' | 'expense' | 'income';

type TransactionSection = {
  title: string;
  data: ReturnType<typeof useFinance>['transactions'];
};

function formatCurrency(value: number) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toFixed(2)}`;
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { scaleFont, isSmallPhone } = useResponsive();
  const router = useRouter();
  const { tabBarFloatingClearance } = useTabBarClearance();
  const { transactions } = useFinance();
  const { categories, totalBudget, hasCompletedSetup } = useSmartBudgeting();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [visibleSectionCount, setVisibleSectionCount] = useState(3);

  const completedTransactions = useMemo(
    () => transactions.filter((item) => item.status !== 'Pending'),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return completedTransactions.filter((item) => {
      if (filter === 'income') return item.type === 'income';
      if (filter === 'expense') return item.type === 'expense';
      return true;
    });
  }, [completedTransactions, filter]);

  const sections = useMemo<TransactionSection[]>(() => {
    return Object.entries(groupTransactionsByDate(filteredTransactions)).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredTransactions]);

  useEffect(() => {
    setVisibleSectionCount(3);
  }, [filter, filteredTransactions.length]);

  const visibleSections = useMemo(
    () => sections.slice(0, visibleSectionCount),
    [sections, visibleSectionCount]
  );

  const monthSpent = useMemo(
    () => categories.reduce((sum, item) => sum + item.spent, 0),
    [categories]
  );
  const leftToSpend = Math.max(totalBudget - monthSpent, 0);
  const spentRatio = totalBudget > 0 ? monthSpent / totalBudget : 0;
  const topCategories = useMemo(
    () => [...categories].sort((left, right) => right.spent - left.spent).slice(0, 4),
    [categories]
  );
  const totalCompletedTransactions = filteredTransactions.length;

  const handleLoadMore = () => {
    if (visibleSectionCount < sections.length) {
      setVisibleSectionCount((current) => Math.min(current + 3, sections.length));
    }
  };

  const filterOptions: { key: FilterKey; label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] =
    [
      { key: 'all', label: 'All entries', icon: 'grid-view' },
      { key: 'expense', label: 'Spending', icon: 'north-east' },
      { key: 'income', label: 'Income', icon: 'south-west' },
    ];

  const listHeader = (
    <View style={styles.headerStack}>
      <View style={[styles.heroCard, { backgroundColor: colors.primaryDark, shadowColor: colors.shadow }]}>
        <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.72) }]}>
          My Transactions
        </Text>
        <Text
          style={[
            styles.heroTitle,
            { color: colors.card, fontSize: isSmallPhone ? scaleFont(24, 0.7) : scaleFont(28, 0.72) },
          ]}
        >
          Spending detail and smart budget in one view.
        </Text>
        <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.82) }]}>
          Track category pace, receipt imports and every completed entry without leaving the budget flow.
        </Text>

        <View style={styles.heroMetricRow}>
          <View
            style={[
              styles.heroMetricCard,
              styles.heroMetricCardHalf,
              isSmallPhone && styles.heroMetricCardStack,
              { backgroundColor: hexToRgba(colors.card, 0.12) },
            ]}
          >
            <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.card, 0.72) }]}>
              Month spent
            </Text>
            <Text style={[styles.heroMetricValue, { color: colors.card }]}>
              {formatCurrency(monthSpent)}
            </Text>
          </View>

          <View
            style={[
              styles.heroMetricCard,
              styles.heroMetricCardHalf,
              isSmallPhone && styles.heroMetricCardStack,
              { backgroundColor: hexToRgba(colors.card, 0.12) },
            ]}
          >
            <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.card, 0.72) }]}>
              Left to spend
            </Text>
            <Text style={[styles.heroMetricValue, { color: colors.card }]}>
              {formatCurrency(leftToSpend)}
            </Text>
          </View>
        </View>

        <View style={[styles.heroActionRow, isSmallPhone && styles.heroActionRowStack]}>
          <View style={styles.heroButtonWrap}>
            <ThemeButton
              title="Add spending"
              onPress={() => router.push('/(finance)/smart-budgeting/add-spending')}
              colorBackground={colors.card}
              colorText={colors.primaryDark}
              style={[styles.heroButton, isSmallPhone && styles.heroButtonStack]}
              textStyle={styles.heroButtonText}
            />
          </View>
          <View style={styles.heroButtonWrap}>
            <ThemeButton
              title={hasCompletedSetup ? 'Monthly budget' : 'Start budget setup'}
              onPress={() =>
                router.push(
                  hasCompletedSetup
                    ? '/(finance)/smart-budgeting/monthly-budget'
                    : '/(finance)/smart-budgeting/setup'
                )
              }
              colorBackground={hexToRgba(colors.card, 0.16)}
              colorText={colors.card}
              style={[styles.heroButton, isSmallPhone && styles.heroButtonStack]}
              textStyle={styles.heroButtonText}
            />
          </View>
        </View>
      </View>

      <View style={[styles.filterPanel, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={[styles.panelTitle, { color: colors.text }]}>Filters</Text>
            <Text style={[styles.panelBody, { color: hexToRgba(colors.text, 0.54) }]}>
              {totalCompletedTransactions} completed entries in view.
            </Text>
          </View>
          <Pressable
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.backgroundSoft,
                borderColor: hexToRgba(colors.primaryDark, 0.08),
              },
            ]}
            onPress={() => router.push('/(finance)/transactions-search')}
          >
            <MaterialIcons name="search" size={18} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.filterWrap}>
          {filterOptions.map((item) => {
            const active = filter === item.key;
            return (
              <Pressable
                key={item.key}
                style={[
                  styles.filterChip,
                  item.key === 'all'
                    ? isSmallPhone
                      ? styles.filterChipFull
                      : styles.filterChipWide
                    : styles.filterChipThird,
                  {
                    backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                    borderColor: active
                      ? colors.primaryDark
                      : hexToRgba(colors.primaryDark, 0.08),
                  },
                ]}
                onPress={() => setFilter(item.key)}
              >
                <MaterialIcons
                  name={item.icon}
                  size={16}
                  color={active ? colors.card : colors.primaryDark}
                />
                <Text style={[styles.filterText, { color: active ? colors.card : colors.text }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.categoryPanel, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={[styles.panelTitle, { color: colors.text }]}>Top categories</Text>
            <Text style={[styles.panelBody, { color: hexToRgba(colors.text, 0.54) }]}>
              Highest spending categories this month.
            </Text>
          </View>
          <Pressable onPress={() => router.push('/(finance)/smart-budgeting/manage-categories')}>
            <Text style={[styles.panelMeta, { color: colors.primaryDark }]}>Edit</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {topCategories.map((item) => {
            const progress = item.limit > 0 ? item.spent / item.limit : 0;
            return (
              <View
                key={item.id}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: hexToRgba(item.accent, 0.1),
                    borderColor: hexToRgba(item.accent, 0.18),
                  },
                ]}
              >
                <View style={styles.categoryCardTop}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: hexToRgba(item.accent, 0.18) },
                    ]}
                  >
                    <MaterialIcons
                      name={item.icon as React.ComponentProps<typeof MaterialIcons>['name']}
                      size={18}
                      color={item.accent}
                    />
                  </View>
                  <Text style={[styles.categoryPercent, { color: item.accent }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>

                <Text numberOfLines={1} style={[styles.categoryTitle, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.categoryValue, { color: colors.text }]}>
                  {formatCurrency(item.spent)}
                </Text>
                <Text style={[styles.categoryMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                  Limit {formatCurrency(item.limit)}
                </Text>

                <View style={[styles.progressTrack, { backgroundColor: hexToRgba(item.accent, 0.14) }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(progress * 100, 100)}%`,
                        backgroundColor: item.accent,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.summaryBarWrap}>
          <View style={[styles.summaryBarTrack, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
            <View
              style={[
                styles.summaryBarFill,
                {
                  width: `${Math.min(spentRatio * 100, 100)}%`,
                  backgroundColor: colors.primaryDark,
                },
              ]}
            />
          </View>
          <Text style={[styles.summaryBarText, { color: hexToRgba(colors.text, 0.56) }]}>
            {Math.round(spentRatio * 100)}% of monthly budget used
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SectionList
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(120, tabBarFloatingClearance) },
      ]}
      sections={visibleSections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <Text style={[styles.groupLabel, { color: hexToRgba(colors.text, 0.54) }]}>
          {section.title}
        </Text>
      )}
      renderItem={({ item }) => (
        <Pressable
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
              {item.category} • {item.timeLabel} • {item.reference}
            </Text>
          </View>

          <Text
            style={[
              styles.transactionAmount,
              { color: item.type === 'income' ? colors.primaryDark : colors.text },
            ]}
          >
            {formatCurrency(item.amount)}
          </Text>
        </Pressable>
      )}
      ListHeaderComponent={listHeader}
      ListHeaderComponentStyle={styles.listHeader}
      ListEmptyComponent={
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <MaterialIcons name="receipt-long" size={20} color={hexToRgba(colors.text, 0.34)} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No matching entries</Text>
          <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.54) }]}>
            Change the filter or add a new spending entry.
          </Text>
        </View>
      }
      ListFooterComponent={
        visibleSectionCount < sections.length ? (
          <Text style={[styles.footerHint, { color: hexToRgba(colors.text, 0.48) }]}>
            Scroll to load more
          </Text>
        ) : (
          <View style={styles.footerSpacer} />
        )
      }
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={8}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.35}
      SectionSeparatorComponent={() => <View style={styles.sectionSpacer} />}
      ItemSeparatorComponent={() => <View style={styles.itemSpacer} />}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 66,
    paddingHorizontal: 20,
  },
  listHeader: {
    paddingBottom: 18,
  },
  headerStack: {
    gap: 16,
  },
  heroCard: {
    borderRadius: 28,
    padding: 18,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    marginTop: 8,
    fontWeight: '900',
    lineHeight: 34,
    letterSpacing: -0.7,
  },
  heroBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 21,
  },
  heroMetricRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroMetricCard: {
    borderRadius: 18,
    padding: 14,
  },
  heroMetricCardHalf: {
    width: '48%',
  },
  heroMetricCardStack: {
    width: '100%',
  },
  heroMetricLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroMetricValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
  },
  heroActionRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  heroButtonWrap: {
    flex: 1,
    minWidth: 0,
  },
  heroActionRowStack: {
    flexDirection: 'column',
  },
  heroButton: {
    width: '100%',
    minWidth: 0,
  },
  heroButtonStack: {
    width: '100%',
  },
  heroButtonText: {
    fontSize: 13,
    lineHeight: 17,
  },
  filterPanel: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  panelBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 250,
  },
  panelMeta: {
    fontSize: 13,
    fontWeight: '700',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterWrap: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  filterChipWide: {
    flexBasis: '39%',
  },
  filterChipThird: {
    flexBasis: '28%',
  },
  filterChipFull: {
    flexBasis: '100%',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  categoryPanel: {
    borderRadius: 24,
    padding: 18,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  categoryScrollContent: {
    paddingTop: 16,
    gap: 12,
  },
  categoryCard: {
    width: 196,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  categoryCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  categoryTitle: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '800',
  },
  categoryValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  categoryMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
  },
  progressTrack: {
    marginTop: 14,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  summaryBarWrap: {
    marginTop: 16,
    gap: 8,
  },
  summaryBarTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  summaryBarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  groupLabel: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  transactionMerchant: {
    fontSize: 15,
    fontWeight: '700',
  },
  transactionMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionSpacer: {
    height: 18,
  },
  itemSpacer: {
    height: 12,
  },
  emptyState: {
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  footerHint: {
    paddingVertical: 18,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  footerSpacer: {
    height: 6,
  },
});
