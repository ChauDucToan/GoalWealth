import { ThemeButton } from '@/components/ThemeButton';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { hexToRgba } from '@/components/auth/AuthKit';
import { getGoalAwareStockAdvice } from '@/components/finance/stock-advice';
import {
  investmentNewsImpacts,
  investmentPortfolioSnapshot,
  investmentSuitabilityGuardrail,
  rebalanceRecommendations,
  strategyBacktest,
  watchlistAlerts,
} from '@/components/finance/investment-intelligence-data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { MarketDisplayControls } from '@/components/finance/MarketDisplayControls';
import { StockTrendChart } from '@/components/finance/StockTrendChart';
import {
  formatDisplayCurrency,
  formatSignedDisplayCurrency,
} from '@/components/finance/finance-utils';
import { useAssistant } from '@/hooks/use-assistant';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import type { RebalanceRecommendation, WatchlistAlert } from '@/types/product-domain';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from '@/lib/expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

function toneForPriority(
  colors: ReturnType<typeof useTheme>['colors'],
  priority: RebalanceRecommendation['actionPriority']
) {
  if (priority === 'High') {
    return colors.error;
  }

  if (priority === 'Medium') {
    return colors.warning;
  }

  return colors.success;
}

function toneForAlert(
  colors: ReturnType<typeof useTheme>['colors'],
  alert: WatchlistAlert
) {
  if (alert.severity === 'High') {
    return colors.error;
  }

  if (alert.severity === 'Medium') {
    return colors.warning;
  }

  return colors.success;
}

export default function InvestmentsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol?: string }>();
  const pushRoute = (route: string) => router.push(route as never);
  const { openCustomAssistantThread } = useAssistant();
  const {
    stocks,
    stockHoldings,
    watchlistSymbols,
    defaultStockSymbol,
    displayCurrency,
    displayUnit,
    setDefaultStockSymbol,
    setDisplayCurrency,
    setDisplayUnit,
  } = useFinance();

  const holdings = stockHoldings
    .map((holding) => {
      const stock = stocks.find((item) => item.symbol === holding.symbol);
      return stock ? { holding, stock } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const watchlist = watchlistSymbols
    .map((symbol) => stocks.find((item) => item.symbol === symbol))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const selectableStocks = useMemo(() => {
    const seen = new Set<string>();

    return [...holdings.map((item) => item.stock), ...watchlist, ...stocks]
      .filter((item) => {
        if (seen.has(item.symbol)) {
          return false;
        }

        seen.add(item.symbol);
        return true;
      });
  }, [holdings, stocks, watchlist]);
  const [selectedSymbol, setSelectedSymbol] = useState(defaultStockSymbol);

  useEffect(() => {
    const nextSymbol = params.symbol?.trim().toUpperCase();

    if (!nextSymbol) {
      return;
    }

    if (selectableStocks.some((item) => item.symbol === nextSymbol)) {
      setSelectedSymbol(nextSymbol);
    }
  }, [params.symbol, selectableStocks]);

  const featured =
    selectableStocks.find((item) => item.symbol === selectedSymbol) ??
    stocks.find((item) => item.symbol === defaultStockSymbol) ??
    holdings[0]?.stock ??
    watchlist[0] ??
    stocks[0];
  const portfolioValue = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.price,
    0
  );
  const investedCost = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.holding.averageCost,
    0
  );
  const portfolioDayChange = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.dayChange,
    0
  );
  const totalGain = portfolioValue - investedCost;

  const portfolioSnapshot = {
    ...investmentPortfolioSnapshot,
    totalValue: portfolioValue,
    dayChange: portfolioDayChange,
  };
  const featuredAlert = featured
    ? watchlistAlerts.find((item) => item.symbol === featured.symbol)
    : undefined;
  const featuredHolding = featured
    ? holdings.find((item) => item.stock.symbol === featured.symbol)?.holding
    : undefined;
  const featuredAdvice = featured
    ? getGoalAwareStockAdvice({
        stock: featured,
        holding: featuredHolding,
        isWatched: watchlistSymbols.includes(featured.symbol),
        displayCurrency,
        signalText: featuredAlert?.explanation,
      })
    : null;

  const openStockAdvisor = (symbol: string, title: string, assistantReply: string) => {
    openCustomAssistantThread({
      id: `stock-advice-${symbol}`,
      title: `${symbol} advice`,
      prompt: `Explain the current advice for ${symbol}.`,
      icon: 'insights',
      messages: [
        {
          id: `stock-advice-user-${symbol}`,
          role: 'user',
          text: `What is your advice for ${symbol} right now?`,
          meta: 'Now',
        },
        {
          id: `stock-advice-reply-${symbol}`,
          role: 'assistant',
          text: assistantReply,
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
    <FinanceScreen
      title="Portfolio Intelligence"
      subtitle="Rebalancing, watchlist signals and evidence-backed strategy context"
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
          <View style={styles.rowBetween}>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.72) }]}>
                {portfolioSnapshot.freshness.label}
              </Text>
              <Text style={[styles.heroValue, { color: colors.card }]}>
                {formatDisplayCurrency(portfolioValue, displayCurrency)}
              </Text>
              <Text style={[styles.heroMeta, { color: hexToRgba(colors.card, 0.76) }]}>
                {formatSignedDisplayCurrency(portfolioDayChange, displayCurrency)} today
              </Text>
              <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.78) }]}>
                {portfolioSnapshot.riskProfileLabel} • {portfolioSnapshot.liquidityLabel}
              </Text>
            </View>

            <View style={styles.heroRight}>
              <View
                style={[
                  styles.heroIcon,
                  { backgroundColor: hexToRgba(colors.card, 0.16) },
                ]}
              >
                <MaterialIcons name="donut-large" size={26} color={colors.card} />
              </View>
              <View
                style={[
                  styles.heroStatusPill,
                  { backgroundColor: hexToRgba(colors.card, 0.14) },
                ]}
              >
                <MaterialIcons name="schedule" size={12} color={colors.card} />
                <Text style={[styles.heroStatusText, { color: colors.card }]}>
                  {portfolioSnapshot.freshness.updatedAt}
                </Text>
              </View>
            </View>
          </View>

          {featured ? (
            <View style={styles.heroChartWrap}>
              <View style={styles.featuredRow}>
                <View>
                  <Text style={[styles.featuredSymbol, { color: colors.card }]}>
                    {featured.symbol}
                  </Text>
                  <Text style={[styles.featuredName, { color: hexToRgba(colors.card, 0.74) }]}>
                    {featured.name}
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.defaultBadge,
                    { backgroundColor: hexToRgba(colors.card, 0.16) },
                  ]}
                  onPress={() => setDefaultStockSymbol(featured.symbol)}
                >
                  <MaterialIcons name="star" size={12} color={colors.card} />
                  <Text style={[styles.defaultBadgeText, { color: colors.card }]}>
                    {featured.symbol === defaultStockSymbol ? 'Default' : 'Set default'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.symbolSelectorBlock}>
                <View style={styles.symbolSelectorHeader}>
                  <Text
                    style={[styles.symbolSelectorLabel, { color: hexToRgba(colors.card, 0.7) }]}
                  >
                    Choose a stock
                  </Text>
                  <Pressable
                    style={[
                      styles.searchLaunchButton,
                      {
                        backgroundColor: hexToRgba(colors.card, 0.14),
                        borderColor: hexToRgba(colors.card, 0.18),
                      },
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: '/(finance)/stock-search',
                        params: { symbol: featured.symbol },
                      })
                    }
                  >
                    <MaterialIcons name="search" size={16} color={colors.card} />
                    <Text style={[styles.searchLaunchText, { color: colors.card }]}>
                      Search stocks
                    </Text>
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.symbolChipRow}
                >
                  {selectableStocks.map((item) => {
                    const selected = item.symbol === featured.symbol;

                    return (
                      <Pressable
                        key={item.symbol}
                        style={[
                          styles.symbolChip,
                          {
                            backgroundColor: selected
                              ? colors.card
                              : hexToRgba(colors.card, 0.18),
                            borderColor: selected
                              ? colors.card
                              : hexToRgba(colors.card, 0.24),
                          },
                        ]}
                        onPress={() => setSelectedSymbol(item.symbol)}
                      >
                        <Text
                          style={[
                            styles.symbolChipText,
                            { color: selected ? colors.primaryDark : colors.card },
                          ]}
                        >
                          {item.symbol}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <StockTrendChart
                values={featured.chart}
                accent={colors.card}
                labelColor={hexToRgba(colors.card, 0.68)}
                height={84}
                barWidth={10}
              />

              <View
                style={[
                  styles.featuredAdviceCard,
                  {
                    backgroundColor: hexToRgba(colors.card, 0.12),
                    borderColor: hexToRgba(colors.card, 0.16),
                  },
                ]}
              >
                <Text style={[styles.featuredAdviceLabel, { color: hexToRgba(colors.card, 0.74) }]}>
                  STOCK ADVICE
                </Text>
                <Text style={[styles.featuredAdviceTitle, { color: colors.card }]}>
                  {featuredAdvice?.title ?? 'Review this name in goal context'}
                </Text>
                <Text style={[styles.featuredAdviceBody, { color: hexToRgba(colors.card, 0.82) }]}>
                  {featuredAdvice?.body ?? 'Use your goal order before deciding whether this stock deserves capital now.'}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.heroButtonRow}>
            <ThemeButton
              title="Open chart"
              onPress={() =>
                featured
                  ? router.push({
                      pathname: '/(finance)/stock/[symbol]',
                      params: { symbol: featured.symbol },
                    })
                  : undefined
              }
              colorBackground={colors.card}
              colorText={colors.primaryDark}
              style={styles.heroButton}
            />
            <ThemeButton
              title="Ask Finpal AI"
              onPress={() =>
                featured
                  ? openStockAdvisor(
                      featured.symbol,
                      featuredAdvice?.title ?? featured.symbol,
                      featuredAdvice?.assistantReply ??
                        `${featured.symbol} should be reviewed in the context of your goal order before any action.`
                    )
                  : undefined
              }
              colorBackground={hexToRgba(colors.card, 0.14)}
              colorText={colors.card}
              style={[
                styles.heroButton,
                { borderWidth: 1, borderColor: hexToRgba(colors.card, 0.18) },
              ]}
            />
          </View>
        </FinanceCard>

        <MarketDisplayControls
          currency={displayCurrency}
          unit={displayUnit}
          onCurrencyChange={setDisplayCurrency}
          onUnitChange={setDisplayUnit}
        />

        <View style={styles.summaryRow}>
          <FinanceCard style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.54) }]}>
              Total gain
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: totalGain >= 0 ? colors.primaryDark : colors.error },
              ]}
            >
              {formatDisplayCurrency(totalGain, displayCurrency)}
            </Text>
          </FinanceCard>
          <FinanceCard style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.54) }]}>
              Holdings
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{holdings.length}</Text>
          </FinanceCard>
          <FinanceCard style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.54) }]}>
              Guardrail
            </Text>
            <Text style={[styles.summaryValue, { color: colors.warning }]}>Active</Text>
          </FinanceCard>
        </View>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Allocation drift</Text>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>
              current vs target
            </Text>
          </View>

          <View
            style={[
              styles.guardrailBanner,
              { backgroundColor: hexToRgba(colors.warning, 0.08) },
            ]}
          >
            <Text style={[styles.guardrailTitle, { color: colors.text }]}>
              {investmentSuitabilityGuardrail.title}
            </Text>
            <Text style={[styles.guardrailBody, { color: hexToRgba(colors.text, 0.56) }]}>
              {investmentSuitabilityGuardrail.body}
            </Text>
            <Text style={[styles.guardrailNext, { color: colors.warning }]}>
              {investmentSuitabilityGuardrail.nextStep}
            </Text>
          </View>

          <View style={styles.allocationStack}>
            {portfolioSnapshot.currentAllocation.map((slice) => {
              const isOverweight = slice.drift > 0;
              const accent = isOverweight ? colors.warning : colors.success;

              return (
                <View key={slice.label} style={styles.allocationRow}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.allocationTitle, { color: colors.text }]}>{slice.label}</Text>
                    <Text style={[styles.allocationMeta, { color: accent }]}>
                      {slice.currentWeight}% vs {slice.targetWeight}% target
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
                          width: `${Math.min(slice.currentWeight, 100)}%`,
                          backgroundColor: accent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.driftText, { color: hexToRgba(colors.text, 0.54) }]}>
                    Drift {slice.drift >= 0 ? '+' : ''}
                    {slice.drift} pts
                  </Text>
                </View>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Per-goal allocation</Text>
            <Pressable onPress={() => router.push('/(finance)/financial-goals')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open planner</Text>
            </Pressable>
          </View>

          {portfolioSnapshot.goalAllocations.map((item) => {
            const progress =
              item.targetFunding > 0 ? item.currentFunding / item.targetFunding : 0;

            return (
              <View
                key={item.goalId}
                style={[
                  styles.goalAllocationRow,
                  { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
              >
                <View style={styles.goalAllocationHeader}>
                  <View style={styles.goalAllocationCopy}>
                    <Text style={[styles.goalAllocationTitle, { color: colors.text }]}>
                      {item.goalTitle}
                    </Text>
                    <Text style={[styles.goalAllocationPriority, { color: colors.primaryDark }]}>
                      {item.priorityLabel} • {item.riskBand}
                    </Text>
                    <Text style={[styles.goalAllocationBody, { color: hexToRgba(colors.text, 0.54) }]}>
                      {item.note}
                    </Text>
                  </View>
                  <Text style={[styles.goalAllocationAmount, { color: colors.text }]}>
                    {formatDisplayCurrency(item.monthlyAllocation, displayCurrency)}/mo
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
                        width: `${Math.min(progress * 100, 100)}%`,
                        backgroundColor: colors.primaryDark,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Rebalancing recommendations</Text>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>decision support</Text>
          </View>

          {rebalanceRecommendations.map((item) => {
            const tone = toneForPriority(colors, item.actionPriority);

            return (
              <View
                key={item.id}
                style={[
                  styles.rebalanceCard,
                  { backgroundColor: hexToRgba(tone, 0.06) },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.rebalanceTitle, { color: colors.text }]}>{item.title}</Text>
                  <View
                    style={[
                      styles.priorityPill,
                      { backgroundColor: hexToRgba(tone, 0.12) },
                    ]}
                  >
                    <Text style={[styles.priorityPillText, { color: tone }]}>
                      {item.actionPriority}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.rebalanceSummary, { color: hexToRgba(colors.text, 0.56) }]}>
                  {item.summary}
                </Text>
                <Text style={[styles.rebalanceWhyNow, { color: colors.text }]}>
                  {item.whyNow}
                </Text>
                <Text style={[styles.rebalanceUncertainty, { color: hexToRgba(colors.text, 0.52) }]}>
                  Uncertainty: {item.uncertainty}
                </Text>

                {item.goalImpacts.map((impact) => (
                  <View key={impact.goalId} style={styles.rebalanceImpactRow}>
                    <Text style={[styles.rebalanceImpactTitle, { color: colors.text }]}>
                      {impact.goalTitle}
                    </Text>
                    <Text style={[styles.rebalanceImpactBody, { color: hexToRgba(colors.text, 0.54) }]}>
                      {impact.impact}
                    </Text>
                  </View>
                ))}

                {item.saferAlternative ? (
                  <Pressable
                    onPress={() => item.saferAlternative?.route && pushRoute(item.saferAlternative.route)}
                    style={[
                      styles.alternativeCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.alternativeTitle, { color: colors.text }]}>
                      Safer alternative
                    </Text>
                    <Text style={[styles.alternativeBody, { color: hexToRgba(colors.text, 0.54) }]}>
                      {item.saferAlternative.title}
                    </Text>
                    <Text style={[styles.alternativeSuitability, { color: colors.primaryDark }]}>
                      {item.saferAlternative.suitability}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </FinanceCard>

        <ResponsiveGrid minItemWidth={210} horizontalPadding={18} gap={12} maxColumns={2}>
          <FinanceCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Watchlist alerts</Text>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>monitoring only</Text>
            </View>

            {watchlistAlerts.map((alert) => {
              const tone = toneForAlert(colors, alert);

              return (
                <View
                  key={alert.id}
                  style={[
                    styles.alertRow,
                    { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
                  ]}
                >
                  <View
                    style={[
                      styles.alertIcon,
                      { backgroundColor: hexToRgba(tone, 0.12) },
                    ]}
                  >
                    <MaterialIcons name="notifications-active" size={18} color={tone} />
                  </View>
                  <View style={styles.alertCopy}>
                    <Text style={[styles.alertTitle, { color: colors.text }]}>
                      {alert.symbol} • {alert.title}
                    </Text>
                    <Text style={[styles.alertTrigger, { color: tone }]}>
                      {alert.trigger} • {alert.suggestedResponse}
                    </Text>
                    <Text style={[styles.alertBody, { color: hexToRgba(colors.text, 0.54) }]}>
                      {alert.explanation}
                    </Text>
                    <Text style={[styles.alertMeta, { color: hexToRgba(colors.text, 0.44) }]}>
                      {alert.updatedAt}
                    </Text>
                    <Pressable
                      onPress={() => {
                        const stock = stocks.find((item) => item.symbol === alert.symbol);
                        const holding = stockHoldings.find((item) => item.symbol === alert.symbol);

                        if (!stock) {
                          return;
                        }

                        const advice = getGoalAwareStockAdvice({
                          stock,
                          holding,
                          isWatched: watchlistSymbols.includes(alert.symbol),
                          displayCurrency,
                          signalText: alert.explanation,
                        });
                        openStockAdvisor(
                          alert.symbol,
                          advice.title,
                          advice.assistantReply
                        );
                      }}
                    >
                      <Text style={[styles.alertAction, { color: colors.primaryDark }]}>
                        Ask Finpal AI
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </FinanceCard>

          <FinanceCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Backtesting evidence</Text>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>
                {strategyBacktest.horizonLabel}
              </Text>
            </View>

            <View style={styles.metricGrid}>
              {[
                ['CAGR', strategyBacktest.cagr],
                ['Volatility', strategyBacktest.volatility],
                ['Max drawdown', strategyBacktest.maxDrawdown],
                ['Sharpe', strategyBacktest.sharpe],
                ['Win rate', strategyBacktest.winRate],
                ['Turnover', strategyBacktest.turnover],
              ].map(([label, value]) => (
                <View
                  key={label}
                  style={[
                    styles.metricCard,
                    { backgroundColor: colors.backgroundSoft },
                  ]}
                >
                  <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.5) }]}>
                    {label}
                  </Text>
                  <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.assumptionText, { color: hexToRgba(colors.text, 0.52) }]}>
              Assumptions: {strategyBacktest.feeAssumption} • {strategyBacktest.slippageAssumption}
            </Text>
            <Text style={[styles.disclaimerText, { color: colors.warning }]}>
              {strategyBacktest.disclaimer}
            </Text>
          </FinanceCard>
        </ResponsiveGrid>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Macro impact</Text>
            <Pressable onPress={() => router.push('/(tabs)/news-resources')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open news intelligence</Text>
            </Pressable>
          </View>

          {investmentNewsImpacts.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.newsRow,
                { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
              onPress={() => item.route && pushRoute(item.route)}
            >
              <View
                style={[
                  styles.alertIcon,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.12) },
                ]}
              >
                <MaterialIcons name="newspaper" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.alertCopy}>
                <Text style={[styles.alertTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.alertTrigger, { color: colors.primaryDark }]}>
                  {item.impactLabel} • {item.affectedArea}
                </Text>
                <Text style={[styles.alertBody, { color: hexToRgba(colors.text, 0.54) }]}>
                  {item.explanation}
                </Text>
                <Text style={[styles.alertMeta, { color: hexToRgba(colors.text, 0.44) }]}>
                  {item.updatedAt}
                </Text>
              </View>
            </Pressable>
          ))}
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    flexWrap: 'wrap',
  },
  heroCard: {
    borderRadius: 28,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroEyebrow: {
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroValue: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '800',
  },
  heroMeta: {
    marginTop: 6,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  heroBody: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  heroStatusPill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  defaultBadge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  defaultBadgeText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  heroChartWrap: {
    marginTop: 20,
    gap: 12,
  },
  symbolSelectorBlock: {
    gap: 8,
  },
  symbolSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  symbolSelectorLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  searchLaunchButton: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchLaunchText: {
    fontSize: 12,
    fontWeight: '800',
  },
  symbolChipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  symbolChip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  featuredAdviceCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  featuredAdviceLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuredAdviceTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  featuredAdviceBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  featuredSymbol: {
    fontSize: 16,
    fontWeight: '800',
  },
  featuredName: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  heroButtonRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroButton: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    flexBasis: 120,
    minWidth: 0,
  },
  summaryLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '800',
  },
  guardrailBanner: {
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  guardrailTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  guardrailBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  guardrailNext: {
    fontSize: 11,
    fontWeight: '800',
  },
  allocationStack: {
    gap: 12,
  },
  allocationRow: {
    gap: 6,
  },
  allocationTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  allocationMeta: {
    fontSize: 12,
    fontWeight: '700',
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
  driftText: {
    fontSize: 11,
    fontWeight: '600',
  },
  goalAllocationRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  goalAllocationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  goalAllocationCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  goalAllocationTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  goalAllocationPriority: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalAllocationBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  goalAllocationAmount: {
    fontSize: 12,
    fontWeight: '800',
  },
  rebalanceCard: {
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  rebalanceTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: '800',
  },
  priorityPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rebalanceSummary: {
    fontSize: 12,
    lineHeight: 18,
  },
  rebalanceWhyNow: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  rebalanceUncertainty: {
    fontSize: 12,
    lineHeight: 18,
  },
  rebalanceImpactRow: {
    gap: 4,
  },
  rebalanceImpactTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  rebalanceImpactBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  alternativeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  alternativeTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  alternativeBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  alternativeSuitability: {
    fontSize: 11,
    fontWeight: '800',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  alertTrigger: {
    fontSize: 11,
    fontWeight: '800',
  },
  alertBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  alertMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
  alertAction: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: 110,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  assumptionText: {
    fontSize: 12,
    lineHeight: 18,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  newsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
});
