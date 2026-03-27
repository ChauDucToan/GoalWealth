import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { StockTrendChart } from '@/components/finance/StockTrendChart';
import {
  formatCurrency,
  formatDisplayCurrency,
  formatSignedDisplayCurrency,
} from '@/components/finance/finance-utils';
import { spendingInsights } from '@/components/home/mock-data';
import {
  proposalBacktestMetrics,
  proposalExplainabilityPoints,
  proposalNewsSignals,
  proposalRebalanceActions,
  type ProposalTone,
} from '@/components/home/proposal-data';
import { Typography } from '@/constants/theme';
import { useAssistant } from '@/hooks/use-assistant';
import { useFinance } from '@/hooks/use-finance';
import { useTabBarClearance } from '@/hooks/use-tab-bar-clearance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

function toneColor(
  colors: ReturnType<typeof useTheme>['colors'],
  tone: ProposalTone
) {
  return colors[tone];
}

export default function InsightsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { openCustomAssistantThread } = useAssistant();
  const { tabBarFloatingClearance } = useTabBarClearance();
  const { stocks, stockHoldings, watchlistSymbols, displayCurrency, categories } = useFinance();

  const holdings = stockHoldings
    .map((holding) => {
      const stock = stocks.find((item) => item.symbol === holding.symbol);
      return stock ? { holding, stock } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const watchlist = watchlistSymbols
    .map((symbol) => stocks.find((item) => item.symbol === symbol))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const featuredStock = holdings[0]?.stock ?? watchlist[0] ?? stocks[0];
  const portfolioValue = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.price,
    0
  );
  const portfolioDayChange = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.dayChange,
    0
  );
  const mostExposedCategory = [...categories].sort((left, right) => right.spent - left.spent)[0];
  const hottestSpendingDay =
    [...spendingInsights].sort((left, right) => right.amount - left.amount)[0] ??
    spendingInsights[0];

  const askAboutFeaturedStock = () => {
    if (!featuredStock) {
      return;
    }

    openCustomAssistantThread({
      id: `stock-advice-${featuredStock.symbol}`,
      title: `${featuredStock.symbol} advice`,
      prompt: `Explain the current advice for ${featuredStock.symbol}.`,
      icon: 'insights',
      messages: [
        {
          id: `featured-stock-user-${featuredStock.symbol}`,
          role: 'user',
          text: `What is your advice for ${featuredStock.symbol} right now?`,
          meta: 'Now',
        },
        {
          id: `featured-stock-reply-${featuredStock.symbol}`,
          role: 'assistant',
          text: `${featuredStock.symbol} should be reviewed against your goals and risk limits first. Use the chart and allocation context before changing exposure.`,
          meta: 'Now',
        },
      ],
    });
    router.push({
      pathname: '/(assistant)/chat/[scenario]',
      params: { scenario: 'custom' },
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(144, tabBarFloatingClearance) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
        <Text style={[styles.eyebrow, { color: hexToRgba(colors.card, 0.74) }]}>
          STRATEGY & EVIDENCE
        </Text>
        <Text style={[styles.title, { color: colors.card }]}>
          Every recommendation should show risk context, rebalance logic and historical evidence.
        </Text>
        <Text style={[styles.body, { color: hexToRgba(colors.card, 0.8) }]}>
          This workspace turns holdings, budget pressure and macro news into interpretable moves,
          not opaque signals.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Portfolio cockpit</Text>
          <Pressable onPress={() => router.push('/(finance)/investments')}>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open desk</Text>
          </Pressable>
        </View>

        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.bigValue, { color: colors.text }]}>
              {formatDisplayCurrency(portfolioValue, displayCurrency)}
            </Text>
            <Text
              style={[
                styles.bigMeta,
                { color: portfolioDayChange >= 0 ? colors.primaryDark : colors.error },
              ]}
            >
              {formatSignedDisplayCurrency(portfolioDayChange, displayCurrency)} today
            </Text>
          </View>
          <View
            style={[
              styles.roundBadge,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
            ]}
          >
            <MaterialIcons name="trending-up" size={22} color={colors.primaryDark} />
          </View>
        </View>

        {featuredStock ? (
          <View style={styles.chartWrap}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={[styles.stockSymbol, { color: colors.text }]}>
                  {featuredStock.symbol}
                </Text>
                <Text style={[styles.stockName, { color: hexToRgba(colors.text, 0.52) }]}>
                  {featuredStock.name}
                </Text>
              </View>
              <Text
                style={[
                  styles.stockChange,
                  { color: featuredStock.changePercent >= 0 ? colors.primaryDark : colors.error },
                ]}
              >
                {featuredStock.changePercent >= 0 ? '+' : ''}
                {featuredStock.changePercent.toFixed(2)}%
              </Text>
            </View>

            <StockTrendChart
              values={featuredStock.chart}
              accent={featuredStock.accent}
              labelColor={hexToRgba(colors.text, 0.44)}
              height={96}
              barWidth={10}
            />
          </View>
        ) : null}

        <View style={styles.buttonRow}>
          <ThemeButton
            title="Open portfolio"
            onPress={() => router.push('/(finance)/investments')}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.halfButton}
          />
          <ThemeButton
            title="Ask Finpal AI"
            onPress={askAboutFeaturedStock}
            colorBackground={colors.backgroundSoft}
            colorText={colors.text}
            style={styles.halfButton}
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rebalancing playbook</Text>
          <Pressable onPress={() => router.push('/(finance)/investments')}>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Take action</Text>
          </Pressable>
        </View>

        {proposalRebalanceActions.map((action) => {
          const accent = toneColor(colors, action.tone);

          return (
            <View
              key={action.id}
              style={[
                styles.rebalanceRow,
                { backgroundColor: hexToRgba(accent, 0.06) },
              ]}
            >
              <View
                style={[
                  styles.rebalanceIcon,
                  { backgroundColor: hexToRgba(accent, 0.12) },
                ]}
              >
                <MaterialIcons name={action.icon} size={18} color={accent} />
              </View>
              <View style={styles.rebalanceCopy}>
                <Text style={[styles.rebalanceTitle, { color: colors.text }]}>
                  {action.title}
                </Text>
                <Text style={[styles.rebalanceBody, { color: hexToRgba(colors.text, 0.54) }]}>
                  {action.body}
                </Text>
                <Text style={[styles.rebalanceImpact, { color: accent }]}>{action.impact}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Backtesting evidence</Text>
          <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>5-year view</Text>
        </View>

        <View style={styles.metricGrid}>
          {proposalBacktestMetrics.map((metric) => (
            <View
              key={metric.id}
              style={[
                styles.metricCard,
                { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.5) }]}>
                {metric.label}
              </Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
              <Text style={[styles.metricNote, { color: colors.primaryDark }]}>{metric.note}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.disclaimer, { color: hexToRgba(colors.text, 0.54) }]}>
          Evidence is presented as context only. It supports decision quality but does not promise
          future returns.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Why the advisor says this</Text>
          <Pressable onPress={() => router.push('/(tabs)/assistant')}>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Ask why</Text>
          </Pressable>
        </View>

        {proposalExplainabilityPoints.map((point) => {
          const accent = toneColor(colors, point.tone);

          return (
            <View
              key={point.id}
              style={[
                styles.explainRow,
                { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
            >
              <View
                style={[
                  styles.explainIcon,
                  { backgroundColor: hexToRgba(accent, 0.12) },
                ]}
              >
                <MaterialIcons name={point.icon} size={18} color={accent} />
              </View>
              <View style={styles.explainCopy}>
                <Text style={[styles.explainTitle, { color: colors.text }]}>{point.title}</Text>
                <Text style={[styles.explainBody, { color: hexToRgba(colors.text, 0.54) }]}>
                  {point.body}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Macro and watch signals</Text>
          <Pressable onPress={() => router.push('/(tabs)/news-resources')}>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open news</Text>
          </Pressable>
        </View>

        {proposalNewsSignals.map((signal) => {
          const accent = toneColor(colors, signal.tone);

          return (
            <Pressable
              key={signal.id}
              onPress={() => router.push(signal.route)}
              style={[
                styles.signalRow,
                { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
            >
              <View
                style={[
                  styles.signalIcon,
                  { backgroundColor: hexToRgba(accent, 0.12) },
                ]}
              >
                <MaterialIcons name={signal.icon} size={18} color={accent} />
              </View>
              <View style={styles.signalCopy}>
                <Text style={[styles.signalTitle, { color: colors.text }]}>{signal.title}</Text>
                <Text style={[styles.signalImpact, { color: accent }]}>{signal.impact}</Text>
                <Text style={[styles.signalBody, { color: hexToRgba(colors.text, 0.54) }]}>
                  {signal.body}
                </Text>
                <Text style={[styles.signalSymbol, { color: hexToRgba(colors.text, 0.48) }]}>
                  {signal.symbol}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget pressure points</Text>
          <Pressable onPress={() => router.push('/(tabs)/smart-budgeting')}>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Planner</Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.budgetBanner,
            { backgroundColor: hexToRgba(colors.warning, 0.08) },
          ]}
        >
          <Text style={[styles.budgetBannerTitle, { color: colors.text }]}>
            Highest category pressure: {mostExposedCategory?.name ?? 'Housing'}
          </Text>
          <Text style={[styles.budgetBannerBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Peak spending day this week was {hottestSpendingDay.label} at{' '}
            {formatCurrency(hottestSpendingDay.amount)}. Review this before the next monthly
            allocation update.
          </Text>
        </View>

        {categories.slice(0, 3).map((category) => {
          const progress = category.limit > 0 ? category.spent / category.limit : 0;

          return (
            <View key={category.id} style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryTitle, { color: colors.text }]}>{category.name}</Text>
                <Text style={[styles.categoryPercent, { color: category.accent }]}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <Text style={[styles.categoryMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                {formatCurrency(category.spent)} of {formatCurrency(category.limit)}
              </Text>
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
                      width: `${Math.min(progress * 100, 100)}%`,
                      backgroundColor: category.accent,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 68,
    paddingHorizontal: 20,
    gap: 16,
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    gap: 10,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  body: {
    fontSize: Typography.body,
    lineHeight: 21,
    maxWidth: 340,
  },
  card: {
    borderRadius: 26,
    padding: 18,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bigValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  bigMeta: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
  },
  roundBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartWrap: {
    gap: 14,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '900',
  },
  stockName: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  stockChange: {
    fontSize: 14,
    fontWeight: '800',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfButton: {
    flex: 1,
  },
  rebalanceRow: {
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rebalanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rebalanceCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  rebalanceTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  rebalanceBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  rebalanceImpact: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: 120,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  metricNote: {
    fontSize: 11,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
  },
  explainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  explainIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  explainTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  explainBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  signalIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  signalTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  signalImpact: {
    fontSize: 11,
    fontWeight: '700',
  },
  signalBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  signalSymbol: {
    fontSize: 11,
    fontWeight: '600',
  },
  budgetBanner: {
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },
  budgetBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  budgetBannerBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  categoryRow: {
    gap: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  categoryPercent: {
    fontSize: 13,
    fontWeight: '800',
  },
  categoryMeta: {
    fontSize: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressValue: {
    height: '100%',
    borderRadius: 999,
  },
});
