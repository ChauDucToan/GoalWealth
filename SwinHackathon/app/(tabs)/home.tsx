import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { StockTrendChart } from '@/components/finance/StockTrendChart';
import {
  formatCurrency,
  formatDisplayCurrency,
  formatSignedDisplayCurrency,
} from '@/components/finance/finance-utils';
import { financeGoals } from '@/components/home/mock-data';
import {
  proposalAdvisorSnapshot,
  proposalNewsSignals,
  proposalRebalanceActions,
  proposalTopPriorities,
  type ProposalRoute,
  type ProposalTone,
} from '@/components/home/proposal-data';
import {
  ProductMetricTile,
  ProductRow,
  ProductSectionHeader,
  ProductStatusChip,
  ProductSurfaceCard,
} from '@/components/shared/ProductSurface';
import { Typography } from '@/constants/theme';
import { useFinance } from '@/hooks/use-finance';
import { useResponsive } from '@/hooks/use-responsive';
import { useTabBarClearance } from '@/hooks/use-tab-bar-clearance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

function toneColor(colors: ReturnType<typeof useTheme>['colors'], tone: ProposalTone) {
  return colors[tone];
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isSmallPhone } = useResponsive();
  const { tabBarFloatingClearance } = useTabBarClearance();
  const {
    transactions,
    stockHoldings,
    stocks,
    watchlistSymbols,
    defaultStockSymbol,
    displayCurrency,
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

    return [...holdings.map((item) => item.stock), ...watchlist, ...stocks].filter((item) => {
      if (seen.has(item.symbol)) {
        return false;
      }

      seen.add(item.symbol);
      return true;
    });
  }, [holdings, stocks, watchlist]);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(defaultStockSymbol);
  const featuredStock =
    selectableStocks.find((item) => item.symbol === selectedStockSymbol) ??
    stocks.find((item) => item.symbol === defaultStockSymbol) ??
    holdings[0]?.stock ??
    watchlist[0] ??
    stocks[0];
  const portfolioValue = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.price,
    0
  );
  const portfolioDayChange = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.dayChange,
    0
  );
  const priorityGoal = financeGoals.find((goal) => goal.id === 'emergency') ?? financeGoals[0];
  const priorityGoalProgress = priorityGoal ? priorityGoal.saved / priorityGoal.target : 0;
  const priorityGoalGap = priorityGoal ? Math.max(priorityGoal.target - priorityGoal.saved, 0) : 0;
  const recentTransactions = transactions.slice(0, 3);
  const topSignal = proposalNewsSignals[0];
  const topRebalance = proposalRebalanceActions[0];

  const openRoute = (route: ProposalRoute) => router.push(route as never);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(tabBarFloatingClearance, 148) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: colors.primaryDark }]}>
        <View style={[styles.heroOrbLarge, { backgroundColor: hexToRgba(colors.card, 0.08) }]} />
        <View style={[styles.heroOrbSmall, { backgroundColor: hexToRgba(colors.success, 0.2) }]} />
        <View style={styles.heroInner}>
          <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.74) }]}>TODAY</Text>
          <Text style={[styles.heroTitle, { color: colors.card }, isSmallPhone && styles.heroTitleCompact]}>
            Stay on plan.
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.82) }]}>
            {proposalAdvisorSnapshot.summary}
          </Text>

          <View style={styles.heroChipRow}>
            {[
              {
                label: `${proposalAdvisorSnapshot.disciplineScore}/100 discipline`,
                icon: 'emoji-events' as const,
                tint: colors.primaryDark,
              },
              {
                label: `${proposalAdvisorSnapshot.activeGoals} goals live`,
                icon: 'flag' as const,
                tint: colors.success,
              },
              {
                label: `${proposalAdvisorSnapshot.highImpactSignals} alerts`,
                icon: 'notifications-active' as const,
                tint: colors.warning,
              },
            ].map((item) => (
              <View
                key={item.label}
                style={[
                  styles.heroSignalChip,
                  {
                    backgroundColor: hexToRgba(colors.card, 0.94),
                    borderColor: hexToRgba(colors.card, 0.98),
                  },
                ]}
              >
                <MaterialIcons name={item.icon} size={14} color={item.tint} />
                <Text style={[styles.heroSignalText, { color: colors.primaryDark }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.heroStatRow, isSmallPhone && styles.heroStackRow]}>
            <View style={[styles.heroStatCard, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.72) }]}>Priority gap</Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>
                {formatCurrency(priorityGoalGap)}
              </Text>
            </View>
            <View style={[styles.heroStatCard, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.72) }]}>Portfolio</Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>
                {formatDisplayCurrency(portfolioValue, displayCurrency)}
              </Text>
            </View>
          </View>

          <View style={[styles.heroActionRow, isSmallPhone && styles.heroStackRow]}>
            <ThemeButton
              title="Open advisor"
              onPress={() => router.push('/(tabs)/assistant')}
              colorBackground={colors.card}
              colorText={colors.primaryDark}
              style={styles.heroButton}
            />
            <ThemeButton
              title="Review plan"
              onPress={() => router.push('/(finance)/financial-goals')}
              colorBackground={hexToRgba(colors.card, 0.14)}
              colorText={colors.card}
              style={[styles.heroButton, styles.heroOutlineButton]}
            />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.sectionStack}>
          <ProductSectionHeader
            title="Top priorities"
            meta="Act on the highest-value items first"
            actionLabel="Advisor"
            onPress={() => router.push('/(tabs)/assistant')}
          />

          <ResponsiveGrid
            minItemWidth={164}
            horizontalPadding={20}
            gap={12}
            maxColumns={2}
            maxContentWidth={960}
          >
            {proposalTopPriorities.map((item) => {
              const accent = toneColor(colors, item.tone);

              return (
                <Pressable key={item.id} onPress={() => openRoute(item.route)}>
                  <ProductSurfaceCard compact style={styles.priorityCard}>
                    <View style={styles.priorityHeader}>
                      <View style={[styles.priorityIcon, { backgroundColor: hexToRgba(accent, 0.12) }]}>
                        <MaterialIcons name={item.icon} size={18} color={accent} />
                      </View>
                      <ProductStatusChip label={item.status} tone={item.tone} />
                    </View>
                    <Text style={[styles.priorityTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.priorityBody, { color: hexToRgba(colors.text, 0.56) }]}>
                      {item.detail}
                    </Text>
                  </ProductSurfaceCard>
                </Pressable>
              );
            })}
          </ResponsiveGrid>
        </View>

        <View style={styles.sectionStack}>
          <ProductSectionHeader title="Core guidance" meta="Goal, portfolio and risk in one view" />

          <ResponsiveGrid
            minItemWidth={220}
            horizontalPadding={20}
            gap={12}
            maxColumns={2}
            maxContentWidth={960}
          >
            <ProductSurfaceCard>
              <ProductSectionHeader
                title="Goal funding"
                meta={priorityGoal ? priorityGoal.title : 'Goal priority'}
                actionLabel="Planner"
                onPress={() => router.push('/(finance)/financial-goals')}
              />

              <View style={styles.progressHeader}>
                <Text style={[styles.progressValue, { color: colors.text }]}>
                  {priorityGoal ? formatCurrency(priorityGoal.saved) : '$0'}
                </Text>
                <Text style={[styles.progressMeta, { color: colors.primaryDark }]}>
                  {Math.round(priorityGoalProgress * 100)}%
                </Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(priorityGoalProgress * 100, 100)}%`,
                      backgroundColor: colors.success,
                    },
                  ]}
                />
              </View>

              <View style={styles.metricRow}>
                <ProductMetricTile
                  label="Gap"
                  value={formatCurrency(priorityGoalGap)}
                  helper={priorityGoal?.dueLabel}
                  tone="warning"
                />
                <ProductMetricTile
                  label="Monthly focus"
                  value="$450"
                  helper="Fund high-priority goal first"
                  tone="success"
                />
              </View>
            </ProductSurfaceCard>

            <ProductSurfaceCard>
              <ProductSectionHeader
                title="Portfolio"
                meta={featuredStock?.symbol ?? 'No symbol selected'}
                actionLabel="Desk"
                onPress={() => router.push('/(finance)/investments')}
              />

              <View style={styles.portfolioHeader}>
                <View>
                  <Text style={[styles.portfolioValue, { color: colors.text }]}>
                    {formatDisplayCurrency(portfolioValue, displayCurrency)}
                  </Text>
                  <Text
                    style={[
                      styles.portfolioChange,
                      { color: portfolioDayChange >= 0 ? colors.primaryDark : colors.error },
                    ]}
                  >
                    {formatSignedDisplayCurrency(portfolioDayChange, displayCurrency)} today
                  </Text>
                </View>
                <ProductStatusChip label="Rebalance watch" tone="warning" icon="query-stats" />
              </View>

              {featuredStock ? (
                <View style={styles.chartWrap}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.portfolioSymbolScroll}
                  >
                    {selectableStocks.map((item) => {
                      const selected = item.symbol === featuredStock.symbol;

                      return (
                        <Pressable
                          key={item.symbol}
                          style={[
                            styles.portfolioSymbolChip,
                            {
                              backgroundColor: selected
                                ? colors.primaryDark
                                : colors.backgroundSoft,
                              borderColor: selected
                                ? colors.primaryDark
                                : hexToRgba(colors.primaryDark, 0.08),
                            },
                          ]}
                          onPress={() => setSelectedStockSymbol(item.symbol)}
                        >
                          <Text
                            style={[
                              styles.portfolioSymbolText,
                              {
                                color: selected ? colors.card : colors.text,
                              },
                            ]}
                          >
                            {item.symbol}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <StockTrendChart
                    values={featuredStock.chart}
                    accent={featuredStock.accent}
                    labelColor={hexToRgba(colors.text, 0.38)}
                    height={84}
                    barWidth={10}
                  />
                </View>
              ) : null}

              <ProductRow
                title={topRebalance.title}
                body={topRebalance.body}
                icon={topRebalance.icon}
                tone={topRebalance.tone}
                rightText={topRebalance.impact}
                divider={false}
                onPress={() => router.push('/(finance)/investments')}
              />
            </ProductSurfaceCard>

            <ProductSurfaceCard>
              <ProductSectionHeader
                title="Risk check"
                meta="Assessment-based"
                actionLabel="Refresh"
                onPress={() => router.push('/(finance)/financial-assessment')}
              />

              <View style={styles.metricRow}>
                <ProductMetricTile
                  label="Risk mode"
                  value="Moderate growth"
                  helper="Balanced upside with tighter safety needs"
                  tone="primaryDark"
                />
                <ProductMetricTile
                  label="Emergency cover"
                  value="4.2 months"
                  helper="Target 6 months"
                  tone="success"
                />
              </View>
              <ProductRow
                title="Input model"
                body="Guided setup, manual entries and OCR review feed the current profile."
                icon="edit-note"
                tone="primaryDark"
                rightText="No live sync"
                divider={false}
              />
            </ProductSurfaceCard>
          </ResponsiveGrid>
        </View>

        <View style={styles.sectionStack}>
          <ProductSurfaceCard>
            <ProductSectionHeader
              title="Next activity"
              meta="Recent ledger and alert context"
              actionLabel="Ledger"
              onPress={() => router.push('/(tabs)/transactions')}
            />

            <ProductRow
              title={topSignal.title}
              body={topSignal.body}
              icon={topSignal.icon}
              tone={topSignal.tone}
              rightText={topSignal.impact}
              onPress={() => openRoute(topSignal.route)}
            />

            {recentTransactions.map((item, index) => (
              <ProductRow
                key={item.id}
                title={item.merchant}
                meta={item.timeLabel}
                body={item.category}
                icon={item.icon}
                tone={item.type === 'income' ? 'success' : 'neutral'}
                rightText={formatCurrency(item.amount)}
                divider={index < recentTransactions.length - 1}
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/transaction/[id]',
                    params: { id: item.id },
                  })
                }
              />
            ))}
          </ProductSurfaceCard>
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
    paddingBottom: 148,
  },
  hero: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  heroInner: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 960,
    gap: 14,
  },
  heroOrbLarge: {
    position: 'absolute',
    top: -62,
    right: -78,
    width: 230,
    height: 230,
    borderRadius: 115,
  },
  heroOrbSmall: {
    position: 'absolute',
    bottom: -26,
    left: -20,
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: -0.6,
    maxWidth: 260,
  },
  heroTitleCompact: {
    fontSize: 27,
    lineHeight: 31,
  },
  heroBody: {
    fontSize: Typography.body,
    lineHeight: 20,
    maxWidth: 340,
  },
  heroChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroSignalChip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroSignalText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
  },
  heroStatRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroStackRow: {
    flexDirection: 'column',
  },
  heroStatCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroButton: {
    flex: 1,
  },
  heroOutlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 18,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1000,
  },
  sectionStack: {
    gap: 12,
  },
  priorityCard: {
    gap: 10,
    minHeight: 136,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  priorityIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  priorityBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  progressMeta: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  portfolioValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  portfolioChange: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
  },
  chartWrap: {
    marginTop: -2,
    gap: 10,
  },
  portfolioSymbolScroll: {
    paddingBottom: 2,
    gap: 8,
  },
  portfolioSymbolChip: {
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioSymbolText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
