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
  type ProposalIcon,
  type ProposalPriorityItem,
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
import { useMyUser } from '@/context/myUserContext';
import { useFinance } from '@/hooks/use-finance';
import { useResponsive } from '@/hooks/use-responsive';
import { useTabBarClearance } from '@/hooks/use-tab-bar-clearance';
import { useTheme } from '@/hooks/use-theme-colors';
import { buildGoalwealthRecommendationDetailRoute } from '@/lib/goalwealth-recommendations';
import { isGoalwealthLiveAdapterEnabled } from '@/services/api/config';
import { getGoalwealthRecommendations } from '@/services/api/recommendations';
import { getGoalwealthSummary } from '@/services/api/summary';
import type {
  GoalwealthRecommendationItem,
  GoalwealthRecommendationsData,
  GoalwealthSummaryData,
  GoalwealthSummaryRecentGoal,
} from '@/services/api/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from '@/lib/expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

function toneColor(colors: ReturnType<typeof useTheme>['colors'], tone: ProposalTone) {
  return colors[tone];
}

type HomeRouteTarget = Parameters<ReturnType<typeof useRouter>['push']>[0];
type HomeRoutePath = Extract<HomeRouteTarget, string>;
type HomePriorityCardItem = Omit<ProposalPriorityItem, 'route'> & { route: HomeRoutePath };

function formatRecommendationStatus(category: string) {
  switch (category) {
    case 'risk':
      return 'Risk';
    case 'goals':
      return 'Goals';
    case 'documents':
      return 'Documents';
    case 'planning':
      return 'Planning';
    case 'onboarding':
      return 'Profile';
    default:
      return 'Action';
  }
}

function resolveRecommendationTone(item: GoalwealthRecommendationItem): ProposalTone {
  if (item.type === 'warning') {
    return item.priority === 'high' ? 'error' : 'warning';
  }

  switch (item.category) {
    case 'goals':
      return 'success';
    case 'risk':
      return 'warning';
    case 'documents':
      return 'secondary';
    case 'planning':
      return 'primaryDark';
    case 'onboarding':
      return 'secondary';
    default:
      return item.priority === 'high' ? 'warning' : 'primaryDark';
  }
}

function resolveRecommendationIcon(item: GoalwealthRecommendationItem): ProposalIcon {
  if (item.action.target === '/chat') {
    return 'forum';
  }

  if (item.action.target === '/me') {
    return 'person';
  }

  if (item.action.target === '/risk-profile') {
    return 'analytics';
  }

  if (item.action.target === '/goals') {
    return 'flag';
  }

  if (item.action.target === '/ocr' || item.action.target?.startsWith('/ocr/records')) {
    return 'document-scanner';
  }

  switch (item.category) {
    case 'risk':
      return 'analytics';
    case 'goals':
      return 'flag';
    case 'documents':
      return 'description';
    case 'planning':
      return 'forum';
    case 'onboarding':
      return 'person';
    default:
      return 'insights';
  }
}

function mapRecommendationToPriorityItem(item: GoalwealthRecommendationItem): HomePriorityCardItem {
  return {
    id: item.id,
    title: item.title,
    detail: item.preview?.trim() || item.message,
    status: formatRecommendationStatus(item.category),
    icon: resolveRecommendationIcon(item),
    tone: resolveRecommendationTone(item),
    route: buildGoalwealthRecommendationDetailRoute(item.id) as HomeRoutePath,
  };
}

function buildEmptyRecommendationItem(): HomePriorityCardItem {
  return {
    id: 'all-caught-up',
    title: 'No urgent follow-up right now',
    detail: 'Your profile, goals, and documents are in a stable state. Open the assistant if you want a fresh planning pass.',
    status: 'Planning',
    icon: 'task-alt',
    tone: 'success',
    route: '/(tabs)/assistant',
  };
}

function formatSummaryGoalStatus(status: GoalwealthSummaryRecentGoal['status']) {
  switch (status) {
    case 'paused':
      return 'Paused';
    case 'completed':
      return 'Completed';
    case 'archived':
      return 'Archived';
    default:
      return 'Active';
  }
}

function formatSummaryGoalDueLabel(goal: GoalwealthSummaryRecentGoal | null) {
  if (!goal) {
    return undefined;
  }

  if (goal.status === 'completed') {
    return 'Completed';
  }

  if (goal.status === 'paused') {
    return 'Paused for review';
  }

  if (goal.status === 'archived') {
    return 'Archived from planner';
  }

  if (!goal.target_date) {
    return 'Flexible target';
  }

  const parsed = new Date(goal.target_date);
  if (Number.isNaN(parsed.getTime())) {
    return 'Flexible target';
  }

  return `Target by ${new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(parsed)}`;
}

function buildLiveSummaryBody(summary: GoalwealthSummaryData) {
  const displayName = summary.user.display_name || 'You';
  const riskLabel = summary.risk_profile.risk_tolerance
    ? summary.risk_profile.risk_tolerance.replaceAll('_', ' ')
    : 'pending';

  if (summary.goals.total_active_goals > 0) {
    return `${displayName} have ${summary.goals.total_active_goals} active goals, ${summary.documents.recent_document_count} synced documents, and a ${riskLabel} risk profile in GoalWealth.`;
  }

  if (summary.goals.total_goals > 0) {
    return `${displayName} have ${summary.goals.total_goals} goals in the workspace, but none are actively funding right now. ${summary.documents.recent_document_count} synced documents are available for review.`;
  }

  return `${displayName} are connected to GoalWealth. Risk profile and document context are ready; create the next goal to start the live funding plan.`;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const navigationCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { state: userState, isSessionReady } = useMyUser();
  const liveAdapterEnabled = isGoalwealthLiveAdapterEnabled();
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
  const [liveSummary, setLiveSummary] = useState<GoalwealthSummaryData | null>(null);
  const [liveRecommendations, setLiveRecommendations] = useState<GoalwealthRecommendationsData | null>(null);
  const recentTransactions = transactions.slice(0, 3);
  const topSignal = proposalNewsSignals[0];
  const topRebalance = proposalRebalanceActions[0];

  useFocusEffect(
    useCallback(() => {
      if (
        !liveAdapterEnabled ||
        !isSessionReady ||
        !userState.isAuthenticated ||
        !userState.accessToken?.trim() ||
        userState.authMode === 'registered-password'
      ) {
        setLiveSummary(null);
        return undefined;
      }

      let cancelled = false;

      void getGoalwealthSummary(userState.accessToken)
        .then((response) => {
          if (!cancelled) {
            setLiveSummary(response.data);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setLiveSummary(null);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [
      isSessionReady,
      liveAdapterEnabled,
      userState.accessToken,
      userState.authMode,
      userState.isAuthenticated,
    ])
  );

  useFocusEffect(
    useCallback(() => {
      if (
        !liveAdapterEnabled ||
        !isSessionReady ||
        !userState.isAuthenticated ||
        !userState.accessToken?.trim() ||
        userState.authMode === 'registered-password'
      ) {
        setLiveRecommendations(null);
        return undefined;
      }

      let cancelled = false;

      void getGoalwealthRecommendations(userState.accessToken)
        .then((response) => {
          if (!cancelled) {
            setLiveRecommendations(response.data);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setLiveRecommendations(null);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [
      isSessionReady,
      liveAdapterEnabled,
      userState.accessToken,
      userState.authMode,
      userState.isAuthenticated,
    ])
  );

  useEffect(() => {
    if (
      !liveAdapterEnabled ||
      !isSessionReady ||
      !userState.isAuthenticated ||
      !userState.accessToken?.trim() ||
      userState.authMode === 'registered-password'
    ) {
      setLiveSummary(null);
      return undefined;
    }
  }, [
    isSessionReady,
    liveAdapterEnabled,
    userState.accessToken,
    userState.authMode,
    userState.isAuthenticated,
  ]);

  useEffect(() => {
    if (
      !liveAdapterEnabled ||
      !isSessionReady ||
      !userState.isAuthenticated ||
      !userState.accessToken?.trim() ||
      userState.authMode === 'registered-password'
    ) {
      setLiveRecommendations(null);
      return undefined;
    }
  }, [
    isSessionReady,
    liveAdapterEnabled,
    userState.accessToken,
    userState.authMode,
    userState.isAuthenticated,
  ]);

  const fallbackPriorityGoal = financeGoals.find((goal) => goal.id === 'emergency') ?? financeGoals[0];
  const livePriorityGoal =
    liveSummary?.goals.recent_goals.find((goal) => goal.status === 'active') ??
    liveSummary?.goals.recent_goals[0] ??
    null;
  const priorityGoalTitle = livePriorityGoal?.title?.trim() || fallbackPriorityGoal?.title || 'Goal priority';
  const priorityGoalSaved = Math.max(
    0,
    livePriorityGoal?.current_progress ?? fallbackPriorityGoal?.saved ?? 0
  );
  const priorityGoalTarget = Math.max(
    livePriorityGoal?.target_amount ?? fallbackPriorityGoal?.target ?? priorityGoalSaved,
    priorityGoalSaved,
    1
  );
  const priorityGoalProgress = priorityGoalTarget > 0 ? priorityGoalSaved / priorityGoalTarget : 0;
  const priorityGoalGap = Math.max(priorityGoalTarget - priorityGoalSaved, 0);
  const priorityGoalStatus = livePriorityGoal
    ? formatSummaryGoalStatus(livePriorityGoal.status)
    : 'Funding';
  const priorityGoalDueLabel = livePriorityGoal
    ? formatSummaryGoalDueLabel(livePriorityGoal)
    : fallbackPriorityGoal?.dueLabel;
  const heroBody = liveSummary ? buildLiveSummaryBody(liveSummary) : proposalAdvisorSnapshot.summary;
  const heroSignalItems = liveSummary
    ? [
        {
          label: `${Math.round(liveSummary.risk_profile.calculated_score ?? 0)}/100 risk`,
          icon: 'analytics' as const,
          tint: colors.primaryDark,
        },
        {
          label: `${liveSummary.goals.total_active_goals} goals live`,
          icon: 'flag' as const,
          tint: colors.success,
        },
        {
          label: `${liveSummary.documents.recent_document_count} docs synced`,
          icon: 'description' as const,
          tint: colors.warning,
        },
      ]
    : [
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
      ];
  const priorityItems = useMemo<HomePriorityCardItem[]>(() => {
    if (!liveRecommendations) {
      return proposalTopPriorities.map((item) => ({ ...item }));
    }

    if (liveRecommendations.items.length === 0) {
      return [buildEmptyRecommendationItem()];
    }

    return liveRecommendations.items.map(mapRecommendationToPriorityItem);
  }, [liveRecommendations]);
  const prioritySectionMeta = liveRecommendations
    ? `${liveRecommendations.summary.high_priority} high • ${liveRecommendations.summary.total} total`
    : 'Act on the highest-value items first';

  useEffect(() => {
    return () => {
      if (navigationCooldownRef.current) {
        clearTimeout(navigationCooldownRef.current);
      }
    };
  }, []);

  const pushDebounced = useCallback((target: HomeRouteTarget) => {
    if (navigationCooldownRef.current) {
      return;
    }

    router.push(target);
    navigationCooldownRef.current = setTimeout(() => {
      navigationCooldownRef.current = null;
    }, 650);
  }, [router]);

  const openRoute = useCallback((route: HomeRoutePath) => {
    pushDebounced(route as HomeRouteTarget);
  }, [pushDebounced]);

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
            {heroBody}
          </Text>

          <View style={styles.heroChipRow}>
            {heroSignalItems.map((item) => (
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
            <View style={styles.heroButtonWrap}>
              <ThemeButton
                title="Open advisor"
                onPress={() => pushDebounced('/(tabs)/assistant')}
                colorBackground={colors.card}
                colorText={colors.primaryDark}
                style={styles.heroButton}
              />
            </View>
            <View style={styles.heroButtonWrap}>
              <ThemeButton
                title="Review plan"
                onPress={() => pushDebounced('/(finance)/financial-goals')}
                colorBackground={hexToRgba(colors.card, 0.14)}
                colorText={colors.card}
                style={[styles.heroButton, styles.heroOutlineButton]}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.sectionStack}>
          <ProductSectionHeader
            title="Top priorities"
            meta={prioritySectionMeta}
            actionLabel="Advisor"
            onPress={() => pushDebounced('/(tabs)/assistant')}
          />

          <ResponsiveGrid
            minItemWidth={164}
            horizontalPadding={20}
            gap={12}
            maxColumns={2}
            maxContentWidth={960}
          >
            {priorityItems.map((item) => {
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
                meta={priorityGoalTitle}
                actionLabel="Planner"
                onPress={() => pushDebounced('/(finance)/financial-goals')}
              />

              <View style={styles.progressHeader}>
                <Text style={[styles.progressValue, { color: colors.text }]}>
                  {formatCurrency(priorityGoalSaved)}
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
                  helper={priorityGoalDueLabel}
                  tone="warning"
                />
                <ProductMetricTile
                  label={livePriorityGoal ? 'Current status' : 'Monthly focus'}
                  value={livePriorityGoal ? priorityGoalStatus : '$450'}
                  helper={
                    livePriorityGoal
                      ? `${liveSummary?.goals.total_active_goals ?? 0} active goals in GoalWealth`
                      : 'Fund high-priority goal first'
                  }
                  tone={livePriorityGoal ? 'primaryDark' : 'success'}
                />
              </View>
            </ProductSurfaceCard>

            <ProductSurfaceCard>
              <ProductSectionHeader
                title="Portfolio"
                meta={featuredStock?.symbol ?? 'No symbol selected'}
                actionLabel="Desk"
                onPress={() => pushDebounced('/(finance)/investments')}
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
                onPress={() => pushDebounced('/(finance)/investments')}
              />
            </ProductSurfaceCard>

            <ProductSurfaceCard>
              <ProductSectionHeader
                title="Financial profile"
                meta="Assessment-based"
                actionLabel="Open"
                onPress={() => pushDebounced('/(finance)/financial-assessment')}
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

              <ThemeButton
                title="Open financial assessment"
                onPress={() => pushDebounced('/(finance)/financial-assessment')}
                colorBackground={colors.primaryDark}
                colorText={colors.card}
                style={styles.assessmentButton}
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
              onPress={() => pushDebounced('/(tabs)/transactions')}
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
                  pushDebounced({
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
  heroButtonWrap: {
    flex: 1,
    minWidth: 0,
  },
  heroButton: {
    width: '100%',
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
  assessmentButton: {
    marginTop: 14,
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
