import { ThemeButton } from '@/components/ThemeButton';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { hexToRgba } from '@/components/auth/AuthKit';
import { StockTrendChart } from '@/components/finance/StockTrendChart';
import {
  formatCompactCurrency,
  formatCurrency,
  formatDisplayCurrency,
} from '@/components/finance/finance-utils';
import {
  activityHighlights,
  financeGoals,
  merchantHighlights,
  overviewStats,
  quickActions,
  resourceCards,
  spendingInsights,
  upcomingBills,
  walletAccounts,
} from '@/components/home/mock-data';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    categories,
    transactions,
    stockHoldings,
    stocks,
    watchlistSymbols,
    displayCurrency,
    defaultStockSymbol,
  } = useFinance();
  const currentMonthSpend = categories.reduce((sum, item) => sum + item.spent, 0);
  const savingsProgress = overviewStats.savingsProgress / overviewStats.savingsTarget;
  const recentTransactions = transactions.slice(0, 4);
  const [selectedActivityDay, setSelectedActivityDay] = React.useState(
    spendingInsights[3] ?? spendingInsights[0]
  );
  const weeklyAverage =
    spendingInsights.reduce((sum, item) => sum + item.amount, 0) / spendingInsights.length;
  const investmentHoldings = stockHoldings
    .map((holding) => {
      const stock = stocks.find((item) => item.symbol === holding.symbol);
      return stock ? { holding, stock } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const watchlist = watchlistSymbols
    .map((symbol) => stocks.find((item) => item.symbol === symbol))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const portfolioValue = investmentHoldings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.price,
    0
  );
  const portfolioDayChange = investmentHoldings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.dayChange,
    0
  );
  const featuredStock =
    stocks.find((item) => item.symbol === defaultStockSymbol) ??
    investmentHoldings[0]?.stock ??
    watchlist[0];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: colors.primaryDark }]}>
        <View
          style={[
            styles.heroGlowLarge,
            { backgroundColor: hexToRgba(colors.secondary, 0.24) },
          ]}
        />
        <View
          style={[
            styles.heroGlowSmall,
            { backgroundColor: hexToRgba(colors.card, 0.12) },
          ]}
        />

        <View style={styles.heroHeader}>
          <View>
            <Text style={[styles.eyebrow, { color: hexToRgba(colors.card, 0.68) }]}>
              Dashboard
            </Text>
            <Text style={[styles.heroTitle, { color: colors.card }]}>Welcome, Jonathan</Text>
          </View>

          <View style={styles.heroActions}>
            <Pressable
              style={[
                styles.iconBadge,
                { backgroundColor: hexToRgba(colors.card, 0.14) },
              ]}
            >
              <MaterialIcons name="notifications-none" size={22} color={colors.card} />
            </Pressable>

            <View
              style={[
                styles.avatarBadge,
                { backgroundColor: hexToRgba(colors.card, 0.16) },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.card }]}>J</Text>
            </View>
          </View>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: colors.card }]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.balanceLabel, { color: hexToRgba(colors.text, 0.55) }]}>
                Total Balance
              </Text>
              <Text style={[styles.balanceValue, { color: colors.text }]}>
                {formatCurrency(overviewStats.balance)}
              </Text>
            </View>

            <View
              style={[
                styles.balanceChip,
                { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
              ]}
            >
              <MaterialIcons name="trending-up" size={16} color={colors.primaryDark} />
              <Text style={[styles.balanceChipText, { color: colors.primaryDark }]}>
                +12.4%
              </Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View
              style={[
                styles.metricCard,
                { backgroundColor: hexToRgba(colors.primaryDark, 0.07) },
              ]}
            >
              <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.58) }]}>
                Income
              </Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {formatCompactCurrency(overviewStats.income)}
              </Text>
            </View>

            <View
              style={[
                styles.metricCard,
                { backgroundColor: hexToRgba(colors.error, 0.08) },
              ]}
            >
              <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.58) }]}>
                Expenses
              </Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {formatCompactCurrency(overviewStats.expenses)}
              </Text>
            </View>
          </View>

          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly activity</Text>
            <Text style={[styles.chartMeta, { color: hexToRgba(colors.text, 0.52) }]}>
              {selectedActivityDay.label} • {selectedActivityDay.topCategory}
            </Text>
          </View>

          <View style={styles.sparklineWrap}>
            {spendingInsights.map((item) => (
              <Pressable
                key={item.label}
                style={styles.sparklineColumn}
                onPress={() => setSelectedActivityDay(item)}
              >
                <View
                  style={[
                    styles.sparklineBar,
                    {
                      height: 18 + item.value,
                      backgroundColor:
                        selectedActivityDay.label === item.label
                          ? colors.primaryDark
                          : item.value >= 80
                          ? colors.primaryDark
                          : hexToRgba(colors.primaryDark, 0.2),
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.sparklineLabel,
                    {
                      color:
                        selectedActivityDay.label === item.label
                          ? colors.primaryDark
                          : hexToRgba(colors.text, 0.48),
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View
            style={[
              styles.activityDetailCard,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.06) },
            ]}
          >
            <View style={styles.rowBetween}>
              <View>
                <Text style={[styles.activityDetailLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                  {selectedActivityDay.label} details
                </Text>
                <Text style={[styles.activityDetailValue, { color: colors.text }]}>
                  {formatCurrency(selectedActivityDay.amount)}
                </Text>
              </View>
              <View
                style={[
                  styles.activityBadge,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
                ]}
              >
                <Text style={[styles.activityBadgeText, { color: colors.primaryDark }]}>
                  {selectedActivityDay.transactions} txns
                </Text>
              </View>
            </View>

            <Text style={[styles.activityDetailBody, { color: hexToRgba(colors.text, 0.58) }]}>
              {selectedActivityDay.summary}
            </Text>

            <Text style={[styles.activityDetailFooter, { color: colors.primaryDark }]}>
              Weekly average {formatCurrency(weeklyAverage)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Accounts</Text>
            <Pressable onPress={() => router.push('/(tabs)/profile')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Manage</Text>
            </Pressable>
          </View>

          <View style={[styles.accountsPanel, { backgroundColor: colors.card }]}>
            {walletAccounts.map((account) => (
              <Pressable
                key={account.id}
                style={[
                  styles.accountRow,
                  { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/account',
                    params: { accountId: account.id },
                  })
                }
              >
                <View style={styles.accountLeft}>
                  <View
                    style={[
                      styles.accountDot,
                      { backgroundColor: account.accent },
                    ]}
                  />
                  <View style={styles.accountCopy}>
                    <Text style={[styles.accountLabel, { color: colors.text }]}>
                      {account.label}
                    </Text>
                    <Text style={[styles.accountMask, { color: hexToRgba(colors.text, 0.5) }]}>
                      {account.numberMask}
                    </Text>
                  </View>
                </View>
                <View style={styles.accountRight}>
                  <Text style={[styles.accountBalance, { color: colors.text }]}>
                    {formatCurrency(account.balance)}
                  </Text>
                  <Text style={[styles.accountChange, { color: colors.primaryDark }]}>
                    {account.changeLabel}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open all</Text>
            </Pressable>
          </View>

          <ResponsiveGrid minItemWidth={148} horizontalPadding={20} gap={12} maxColumns={2}>
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                style={[styles.actionCard, { backgroundColor: colors.card }]}
                onPress={() => {
                  if (action.id === 'send') {
                    router.push('/(finance)/send-money');
                    return;
                  }

                  if (action.id === 'budget') {
                    router.push('/(finance)/smart-budgeting');
                    return;
                  }

                  if (action.id === 'request') {
                    router.push('/(finance)/add-transaction');
                    return;
                  }

                  if (action.id === 'assessment') {
                    router.push('/(finance)/financial-assessment');
                    return;
                  }

                  if (action.id === 'receipt') {
                    router.push('/(finance)/subscriptions');
                    return;
                  }

                  router.push('/(tabs)/transactions');
                }}
              >
                <View
                  style={[
                    styles.actionIconWrap,
                    { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                  ]}
                >
                  <MaterialIcons name={action.icon} size={22} color={colors.primaryDark} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
                <Text style={[styles.actionSubtitle, { color: hexToRgba(colors.text, 0.56) }]}>
                  {action.subtitle}
                </Text>
              </Pressable>
            ))}
          </ResponsiveGrid>
        </View>

        <ResponsiveGrid minItemWidth={164} horizontalPadding={20} gap={12} maxColumns={2}>
          {activityHighlights.map((item) => (
            <View
              key={item.id}
              style={[styles.highlightCard, { backgroundColor: colors.card }]}
            >
              <View
                style={[
                  styles.highlightIcon,
                  { backgroundColor: hexToRgba(item.accent, 0.12) },
                ]}
              >
                <MaterialIcons name={item.icon} size={20} color={item.accent} />
              </View>
              <Text style={[styles.highlightTitle, { color: hexToRgba(colors.text, 0.56) }]}>
                {item.title}
              </Text>
              <Text style={[styles.highlightValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.highlightMeta, { color: hexToRgba(colors.text, 0.5) }]}>
                {item.detail}
              </Text>
            </View>
          ))}
        </ResponsiveGrid>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget Highlights</Text>
            <Pressable onPress={() => router.push('/(finance)/smart-budgeting')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>
                Open planner
              </Text>
            </Pressable>
          </View>

          {categories.map((item) => {
            const progress = Math.min(item.spent / item.limit, 1);

            return (
              <View key={item.id} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryLabelWrap}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: hexToRgba(item.accent, 0.12) },
                      ]}
                    >
                      <MaterialIcons name={item.icon} size={18} color={item.accent} />
                    </View>
                    <View style={styles.categoryCopy}>
                      <Text style={[styles.categoryTitle, { color: colors.text }]}>
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.categoryMeta,
                          { color: hexToRgba(colors.text, 0.5) },
                        ]}
                      >
                        {formatCurrency(item.spent)} of {formatCurrency(item.limit)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.categoryPercent, { color: item.accent }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>

                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                  ]}
                >
                  <View
                    style={[
                      styles.progressValue,
                      {
                        width: `${progress * 100}%`,
                        backgroundColor: item.accent,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Goals</Text>
            <Pressable onPress={() => router.push('/(finance)/financial-goals')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Track</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {financeGoals.map((goal) => {
              const progress = goal.saved / goal.target;

              return (
                <Pressable
                  key={goal.id}
                  style={[styles.goalCard, { backgroundColor: colors.card }]}
                  onPress={() =>
                    router.push({
                      pathname: '/(finance)/financial-goals/[goalId]',
                      params: { goalId: goal.id },
                    })
                  }
                >
                  <View style={styles.rowBetween}>
                    <View
                      style={[
                        styles.goalIcon,
                        { backgroundColor: hexToRgba(goal.accent, 0.12) },
                      ]}
                    >
                      <MaterialIcons name={goal.icon} size={20} color={goal.accent} />
                    </View>
                    <Text style={[styles.goalDue, { color: hexToRgba(colors.text, 0.5) }]}>
                      {goal.dueLabel}
                    </Text>
                  </View>

                  <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
                  <Text style={[styles.goalAmount, { color: colors.text }]}>
                    {formatCurrency(goal.saved)}
                  </Text>
                  <Text style={[styles.goalMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                    of {formatCurrency(goal.target)}
                  </Text>

                  <View
                    style={[
                      styles.progressTrack,
                      {
                        marginTop: 16,
                        backgroundColor: hexToRgba(goal.accent, 0.12),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressValue,
                        {
                          width: `${Math.min(progress * 100, 100)}%`,
                          backgroundColor: goal.accent,
                        },
                      ]}
                    />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ResponsiveGrid minItemWidth={220} horizontalPadding={20} gap={12} maxColumns={2}>
          <View style={[styles.savingsCard, { backgroundColor: colors.primaryDark }]}>
            <Text style={[styles.savingsEyebrow, { color: hexToRgba(colors.card, 0.72) }]}>
              Savings target
            </Text>
            <Text style={[styles.savingsValue, { color: colors.card }]}>
              {formatCurrency(overviewStats.savingsProgress)}
            </Text>
            <Text style={[styles.savingsMeta, { color: hexToRgba(colors.card, 0.76) }]}>
              of {formatCurrency(overviewStats.savingsTarget)}
            </Text>
            <View
              style={[
                styles.savingsTrack,
                { backgroundColor: hexToRgba(colors.card, 0.18) },
              ]}
            >
              <View
                style={[
                  styles.savingsValueTrack,
                  {
                    width: `${Math.min(savingsProgress * 100, 100)}%`,
                    backgroundColor: colors.card,
                  },
                ]}
              />
            </View>
          </View>

          <View style={[styles.billsCard, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.billTitle, { color: colors.text }]}>Upcoming Bills</Text>
              <Text style={[styles.billMeta, { color: colors.primaryDark }]}>3 due soon</Text>
            </View>

            {upcomingBills.slice(0, 2).map((bill) => (
              <View key={bill.id} style={styles.billRow}>
                <View
                  style={[
                    styles.billIcon,
                    { backgroundColor: hexToRgba(bill.accent, 0.12) },
                  ]}
                >
                  <MaterialIcons name={bill.icon} size={18} color={bill.accent} />
                </View>
                <View style={styles.billTextWrap}>
                  <Text style={[styles.billName, { color: colors.text }]}>{bill.name}</Text>
                  <Text style={[styles.billDue, { color: hexToRgba(colors.text, 0.5) }]}>
                    {bill.dueLabel}
                  </Text>
                </View>
                <Text style={[styles.billAmount, { color: colors.text }]}>
                  {formatCurrency(bill.amount)}
                </Text>
              </View>
            ))}
          </View>
        </ResponsiveGrid>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Investments</Text>
            <Pressable onPress={() => router.push('/(finance)/investments')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Portfolio</Text>
            </Pressable>
          </View>

          <View style={[styles.investmentCard, { backgroundColor: colors.card }]}>
            <View style={styles.rowBetween}>
              <View>
                <Text
                  style={[
                    styles.investmentEyebrow,
                    { color: hexToRgba(colors.text, 0.52) },
                  ]}
                >
                  Live portfolio
                </Text>
                <Text style={[styles.investmentValue, { color: colors.text }]}>
                  {formatDisplayCurrency(portfolioValue, displayCurrency)}
                </Text>
                <Text
                  style={[
                    styles.investmentMeta,
                    { color: portfolioDayChange >= 0 ? colors.primaryDark : colors.error },
                  ]}
                >
                  {portfolioDayChange >= 0 ? '+' : '-'}
                  {formatDisplayCurrency(Math.abs(portfolioDayChange), displayCurrency)} today
                </Text>
              </View>

              <View
                style={[
                  styles.investmentBadge,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
                ]}
              >
                <MaterialIcons name="trending-up" size={22} color={colors.primaryDark} />
              </View>
            </View>

            {featuredStock ? (
              <View style={styles.investmentChartWrap}>
                <StockTrendChart
                  values={featuredStock.chart}
                  accent={featuredStock.accent}
                  labelColor={hexToRgba(colors.text, 0.44)}
                  height={84}
                  barWidth={10}
                />
              </View>
            ) : null}

            <View style={styles.investmentChipRow}>
              {watchlist.slice(0, 3).map((stock) => (
                <Pressable
                  key={stock.symbol}
                  style={[
                    styles.investmentChip,
                    { backgroundColor: hexToRgba(stock.accent, 0.1) },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/(finance)/stock/[symbol]',
                      params: { symbol: stock.symbol },
                    })
                  }
                >
                  <Text style={[styles.investmentChipSymbol, { color: colors.text }]}>
                    {stock.symbol}
                  </Text>
                  <Text
                    style={[
                      styles.investmentChipChange,
                      { color: stock.changePercent >= 0 ? colors.primaryDark : colors.error },
                    ]}
                  >
                    {stock.changePercent >= 0 ? '+' : ''}
                    {stock.changePercent.toFixed(2)}%
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.investmentActionRow}>
              <ThemeButton
                title="Buy stock"
                onPress={() => router.push('/(finance)/buy-stock')}
                colorBackground={colors.primaryDark}
                colorText={colors.card}
                style={styles.investmentActionButton}
              />
              <ThemeButton
                title="Open chart"
                onPress={() =>
                  router.push(
                    featuredStock
                      ? {
                          pathname: '/(finance)/stock/[symbol]',
                          params: { symbol: featuredStock.symbol },
                        }
                      : '/(finance)/investments'
                  )
                }
                colorBackground={colors.backgroundSoft}
                colorText={colors.text}
                style={styles.investmentActionButton}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Merchant Activity</Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open list</Text>
            </Pressable>
          </View>

          <ResponsiveGrid minItemWidth={148} horizontalPadding={20} gap={12} maxColumns={2}>
            {merchantHighlights.map((merchant) => (
              <Pressable
                key={merchant.id}
                style={[styles.merchantChip, { backgroundColor: colors.card }]}
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/merchant/[merchant]',
                    params: { merchant: merchant.label },
                  })
                }
              >
                <View
                  style={[
                    styles.merchantIcon,
                    { backgroundColor: hexToRgba(merchant.accent, 0.12) },
                  ]}
                >
                  <MaterialIcons name={merchant.icon} size={18} color={merchant.accent} />
                </View>
                <View style={styles.merchantCopy}>
                  <Text style={[styles.merchantLabel, { color: colors.text }]}>
                    {merchant.label}
                  </Text>
                  <Text style={[styles.merchantCount, { color: hexToRgba(colors.text, 0.48) }]}>
                    {merchant.count}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ResponsiveGrid>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>News & Resources</Text>
            <Pressable onPress={() => router.push('/(tabs)/insights')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>More</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {resourceCards.map((resource) => (
              <View
                key={resource.id}
                style={[styles.resourceCard, { backgroundColor: colors.card }]}
              >
                <View
                  style={[
                    styles.resourceBadge,
                    { backgroundColor: hexToRgba(resource.accent, 0.12) },
                  ]}
                >
                  <MaterialIcons name="auto-awesome" size={18} color={resource.accent} />
                </View>
                <Text style={[styles.resourceSource, { color: hexToRgba(colors.text, 0.48) }]}>
                  {resource.source}
                </Text>
                <Text style={[styles.resourceTitle, { color: colors.text }]}>
                  {resource.title}
                </Text>
                <Text style={[styles.resourceCaption, { color: resource.accent }]}>
                  {resource.caption}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View
          style={[
            styles.assistantCard,
            {
              backgroundColor: colors.card,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
        >
          <View
            style={[
              styles.assistantIcon,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
            ]}
          >
            <MaterialIcons name="tips-and-updates" size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.assistantTextWrap}>
            <Text style={[styles.assistantTitle, { color: colors.text }]}>Finpal tip</Text>
            <Text style={[styles.assistantBody, { color: hexToRgba(colors.text, 0.54) }]}>
              Moving $35 from spending to savings today keeps your monthly goal on track.
            </Text>
          </View>
          <Pressable style={styles.assistantAction} onPress={() => router.push('/(tabs)/insights')}>
            <MaterialIcons name="chevron-right" size={22} color={colors.primaryDark} />
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>View all</Text>
            </Pressable>
          </View>

          {recentTransactions.map((item) => (
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
                <Text
                  style={[
                    styles.transactionMeta,
                    { color: hexToRgba(colors.text, 0.52) },
                  ]}
                >
                  {item.category} • {item.timeLabel}
                </Text>
              </View>

              <View style={styles.transactionAmountWrap}>
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
                    styles.transactionStatus,
                    {
                      color:
                        item.status === 'Pending' ? '#F59E0B' : hexToRgba(colors.text, 0.48),
                    },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={[styles.insightCard, { backgroundColor: colors.primaryDark }]}>
          <View style={styles.insightTextWrap}>
            <Text style={[styles.insightEyebrow, { color: hexToRgba(colors.card, 0.72) }]}>
              Month in review
            </Text>
            <Text style={[styles.insightTitle, { color: colors.card }]}>
              You spent {formatCurrency(currentMonthSpend)} across your main categories.
            </Text>
            <Text style={[styles.insightBody, { color: hexToRgba(colors.card, 0.74) }]}>
              Smart summaries and goal nudges are ready in the insights tab.
            </Text>
          </View>

          <ThemeButton
            title="See Insights"
            onPress={() => router.push('/(tabs)/insights')}
            colorBackground={colors.card}
            colorText={colors.primaryDark}
            style={styles.insightButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 114,
  },
  hero: {
    paddingTop: 68,
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  heroGlowLarge: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -54,
    right: -76,
  },
  heroGlowSmall: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: -30,
    left: -30,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 'auto',
  },
  eyebrow: {
    fontSize: Typography.body,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  balanceCard: {
    marginTop: 22,
    borderRadius: 30,
    padding: 20,
    shadowColor: 'rgba(15,23,42,0.12)',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  balanceLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  balanceValue: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: '800',
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  balanceChipText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  metricRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
    borderRadius: 18,
    padding: 14,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  metricLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  metricValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '800',
  },
  chartHeader: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  chartTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  chartMeta: {
    fontSize: Typography.body,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  sparklineWrap: {
    marginTop: 16,
    height: 118,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sparklineColumn: {
    alignItems: 'center',
    gap: 8,
  },
  sparklineBar: {
    width: 24,
    borderRadius: 12,
  },
  sparklineLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  activityDetailCard: {
    marginTop: 18,
    borderRadius: 18,
    padding: 14,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  activityDetailLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  activityDetailValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
  },
  activityBadge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBadgeText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  activityDetailBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  activityDetailFooter: {
    marginTop: 10,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionLink: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  horizontalList: {
    gap: 12,
    paddingRight: 20,
  },
  accountsPanel: {
    borderRadius: 24,
    paddingHorizontal: 18,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  accountRow: {
    minHeight: 66,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
  },
  accountDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  accountRight: {
    alignItems: 'flex-end',
    minWidth: 0,
    marginLeft: 8,
  },
  accountLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
    flexShrink: 1,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '800',
  },
  accountMask: {
    fontSize: Typography.body,
    marginTop: 4,
    flexShrink: 1,
  },
  accountChange: {
    marginTop: 4,
    fontSize: Typography.body,
    fontWeight: '700',
    textAlign: 'right',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '100%',
    borderRadius: 22,
    padding: 16,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
  },
  actionSubtitle: {
    marginTop: 6,
    fontSize: Typography.body,
    lineHeight: 18,
  },
  rowGap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  highlightCard: {
    width: '100%',
    borderRadius: 22,
    padding: 16,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightTitle: {
    marginTop: 14,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  highlightValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '800',
  },
  highlightMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  categoryRow: {
    marginTop: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  categoryCopy: {
    flex: 1,
    minWidth: 0,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
    flexShrink: 1,
  },
  categoryMeta: {
    marginTop: 4,
    fontSize: Typography.body,
    flexShrink: 1,
  },
  categoryPercent: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 999,
  },
  progressValue: {
    height: 8,
    borderRadius: 999,
  },
  goalCard: {
    width: 214,
    borderRadius: 24,
    padding: 18,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  goalIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalDue: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  goalTitle: {
    marginTop: 18,
    fontSize: 17,
    fontWeight: '800',
  },
  goalAmount: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: '800',
  },
  goalMeta: {
    marginTop: 6,
    fontSize: Typography.body,
  },
  savingsCard: {
    width: '100%',
    borderRadius: 24,
    padding: 18,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  savingsEyebrow: {
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  savingsValue: {
    marginTop: 14,
    fontSize: 28,
    fontWeight: '800',
  },
  savingsMeta: {
    marginTop: 6,
    fontSize: Typography.body,
  },
  savingsTrack: {
    marginTop: 20,
    height: 9,
    borderRadius: 999,
  },
  savingsValueTrack: {
    height: 9,
    borderRadius: 999,
  },
  billsCard: {
    width: '100%',
    borderRadius: 24,
    padding: 18,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  investmentCard: {
    borderRadius: 24,
    padding: 18,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  investmentEyebrow: {
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  investmentValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '800',
  },
  investmentMeta: {
    marginTop: 6,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  investmentBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  investmentChartWrap: {
    marginTop: 18,
  },
  investmentChipRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  investmentChip: {
    flex: 1,
    flexBasis: 96,
    minWidth: 0,
    borderRadius: 18,
    padding: 12,
    gap: 4,
  },
  investmentChipSymbol: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  investmentChipChange: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  investmentActionRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  investmentActionButton: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  billMeta: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  billRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  billIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billTextWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  billName: {
    fontSize: Typography.body,
    fontWeight: '700',
    flexShrink: 1,
  },
  billDue: {
    marginTop: 4,
    fontSize: Typography.body,
    flexShrink: 1,
  },
  billAmount: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  merchantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  merchantChip: {
    width: '100%',
    borderRadius: 20,
    padding: 14,
  },
  merchantCopy: {
    flex: 1,
    minWidth: 0,
  },
  merchantIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantLabel: {
    marginTop: 12,
    fontSize: Typography.body,
    fontWeight: '700',
    flexShrink: 1,
  },
  merchantCount: {
    marginTop: 4,
    fontSize: Typography.body,
    flexShrink: 1,
  },
  resourceCard: {
    width: 224,
    borderRadius: 22,
    padding: 16,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  resourceBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceSource: {
    marginTop: 16,
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  resourceTitle: {
    marginTop: 10,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
  },
  resourceCaption: {
    marginTop: 14,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  assistantCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 14,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  assistantIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  assistantTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  assistantBody: {
    marginTop: 6,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  assistantAction: {
    marginLeft: 'auto',
    alignSelf: 'center',
  },
  transactionRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
  transactionAmountWrap: {
    alignItems: 'flex-end',
    minWidth: 0,
    marginLeft: 8,
  },
  transactionAmount: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  transactionStatus: {
    marginTop: 4,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  insightCard: {
    borderRadius: 26,
    padding: 20,
    shadowColor: 'rgba(15,23,42,0.12)',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  insightTextWrap: {
    gap: 8,
  },
  insightEyebrow: {
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  insightTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
  },
  insightBody: {
    fontSize: Typography.body,
    lineHeight: 20,
  },
  insightButton: {
    marginTop: 20,
  },
});
