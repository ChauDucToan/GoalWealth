import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  financialGoalIntroHighlights,
  getGoalsByPriority,
  getGoalsPortfolioRecommendation,
  getGoalTransferSummary,
} from '@/components/financial-goals/data';
import {
  GoalConflictNotice,
  GoalHistoryCard,
  GoalLifecycleBadge,
  GoalPriorityStack,
  GoalProgressRing,
  GoalsPortfolioRecommendationCard,
} from '@/components/financial-goals/ui';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { Typography } from '@/constants/theme';
import { useIntroPreferences } from '@/context/introPreferencesContext';
import { useFinancialGoals } from '@/hooks/use-financial-goals';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import { buildGoalwealthRecommendationDetailRoute } from '@/lib/goalwealth-recommendations';
import { normalizeGoalwealthError } from '@/services/api/errors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from '@/lib/expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function FinancialGoalsScreen() {
  const { colors } = useTheme();
  const { isSmallPhone } = useResponsive();
  const router = useRouter();
  const {
    goals,
    isUsingLiveGoals,
    isLoading,
    error,
    capabilities,
    refreshGoals,
    goalRecommendation,
    isGoalRecommendationLoading,
    goalRecommendationError,
    dismissGoalRecommendation,
    completeGoalRecommendation,
    refreshGoalRecommendation,
  } = useFinancialGoals();
  const {
    hasSeenFinancialGoalsIntro,
    isIntroPreferencesReady,
    markFinancialGoalsIntroSeen,
  } = useIntroPreferences();
  const [goalRecommendationAction, setGoalRecommendationAction] = useState<
    'dismiss' | 'complete' | null
  >(null);
  const [goalRecommendationActionError, setGoalRecommendationActionError] = useState<string | null>(
    null
  );
  const summary = getGoalTransferSummary(goals);
  const orderedGoals = getGoalsByPriority(goals);
  const activeOrderedGoals = orderedGoals.filter((goal) => goal.lifecycleStatus === 'active');
  const overallProgress = summary.totalTarget > 0 ? summary.totalSaved / summary.totalTarget : 0;
  const leadGoal = summary.nextPriorityGoal ?? null;
  const portfolioRecommendation = getGoalsPortfolioRecommendation(goals);
  const introHighlights = isUsingLiveGoals
    ? [
        {
          id: 'goal-intro-live-track',
          title: 'Track synced goal progress',
          body: 'Create goals, edit core fields and keep lifecycle status aligned with GoalWealth.',
          icon: 'pie-chart' as const,
          accent: '#1A73E8',
        },
        {
          id: 'goal-intro-live-priority',
          title: 'Keep one live funding order',
          body: 'Review active goals in one place without mixing in preview-only transfer or history tools.',
          icon: 'flag' as const,
          accent: '#6A927A',
        },
        {
          id: 'goal-intro-live-status',
          title: 'Update goal lifecycle directly',
          body: 'Pause, resume, complete or archive a goal from the detail screen with live backend updates.',
          icon: 'task-alt' as const,
          accent: '#B2955A',
        },
      ]
    : financialGoalIntroHighlights;
  const prioritySummary =
    summary.activeGoals === 0 && summary.totalGoals > 0
      ? 'No goals are actively funding right now. Resume or restore one to restart the plan.'
      : summary.highPriorityGoals > 0
        ? `${summary.highPriorityGoals} active high-priority ${
          summary.highPriorityGoals === 1 ? 'goal is' : 'goals are'
        } being funded first before the rest.`
        : 'Active goals are funded without a separate high-priority tier.';
  const insightCards = [
    {
      id: 'goal-live-pace',
      title: 'Monthly funding pace',
      body: isUsingLiveGoals
        ? 'This card is derived from GoalWealth goal targets and remaining timeline.'
        : 'Preview mode keeps the existing mock funding cadence for the goals dashboard.',
      value: formatCurrency(summary.monthlyContribution),
      tone: 'primaryDark' as const,
    },
    {
      id: 'goal-live-count',
      title: isUsingLiveGoals ? 'Goals in workspace' : 'Tracked goals',
      body:
        summary.activeGoals > 0 && leadGoal
          ? `${leadGoal.title} is currently the lead funding target.`
          : summary.totalGoals > 0
            ? 'Live goals are synced, but none are actively funding right now.'
            : 'Create a goal to start building a live funding order.',
      value: `${summary.totalGoals}`,
      tone: 'success' as const,
    },
    {
      id: 'goal-live-readiness',
      title: 'Needs attention',
      body:
        summary.activeGoals > 0 && leadGoal
          ? `${leadGoal.title} still has ${formatCurrency(leadGoal.fundingGap)} left to fund.`
          : summary.totalGoals > 0
            ? 'Review paused, completed or archived goals before you reopen the next funding track.'
            : 'No active goals yet. Create one to unlock planning signals.',
      value: leadGoal ? leadGoal.dueLabel : 'No goals',
      tone: 'warning' as const,
    },
  ];

  useFocusEffect(
    useCallback(() => {
      if (!isUsingLiveGoals) {
        return;
      }

      void refreshGoals();
      void refreshGoalRecommendation();
    }, [isUsingLiveGoals, refreshGoalRecommendation, refreshGoals])
  );

  const handleDismissGoalRecommendation = useCallback(async () => {
    if (!goalRecommendation || goalRecommendationAction) {
      return;
    }

    setGoalRecommendationAction('dismiss');
    setGoalRecommendationActionError(null);

    try {
      await dismissGoalRecommendation(goalRecommendation.id);
    } catch (incomingError) {
      setGoalRecommendationActionError(normalizeGoalwealthError(incomingError).message);
    } finally {
      setGoalRecommendationAction(null);
    }
  }, [dismissGoalRecommendation, goalRecommendation, goalRecommendationAction]);

  const handleCompleteGoalRecommendation = useCallback(async () => {
    if (!goalRecommendation || goalRecommendationAction) {
      return;
    }

    setGoalRecommendationAction('complete');
    setGoalRecommendationActionError(null);

    try {
      await completeGoalRecommendation(goalRecommendation.id, goalRecommendation.action.target);
      router.push('/(finance)/financial-goals/create');
    } catch (incomingError) {
      setGoalRecommendationActionError(normalizeGoalwealthError(incomingError).message);
    } finally {
      setGoalRecommendationAction(null);
    }
  }, [
    completeGoalRecommendation,
    goalRecommendationAction,
    goalRecommendation,
    router,
  ]);

  const handleOpenGoalRecommendation = useCallback(() => {
    if (!goalRecommendation || goalRecommendationAction) {
      return;
    }

    router.push(buildGoalwealthRecommendationDetailRoute(goalRecommendation.id));
  }, [goalRecommendation, goalRecommendationAction, router]);

  const goalRecommendationCard =
    isUsingLiveGoals &&
    (
      goalRecommendation ||
      isGoalRecommendationLoading ||
      goalRecommendationError ||
      goalRecommendationActionError
    ) ? (
      <FinanceCard
        style={[
          styles.noticeCard,
          {
            backgroundColor: hexToRgba(colors.primaryDark, 0.05),
            borderColor: hexToRgba(colors.primaryDark, 0.12),
          },
        ]}
      >
        <View style={styles.goalRecommendationHeader}>
          <View style={[styles.goalRecommendationIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.12) }]}>
            <MaterialIcons name="auto-awesome" size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.goalRecommendationCopy}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Goal suggestion</Text>
            <Text style={[styles.goalRecommendationMeta, { color: hexToRgba(colors.text, 0.54) }]}>
              Live recommendation from GoalWealth for scope: goals
            </Text>
          </View>
        </View>

        {isGoalRecommendationLoading && !goalRecommendation ? (
          <Text style={[styles.noticeBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Checking GoalWealth recommendations for the goals flow...
          </Text>
        ) : null}

        {goalRecommendationError ? (
          <Text style={[styles.goalRecommendationError, { color: colors.error }]}>
            {goalRecommendationError}
          </Text>
        ) : null}

        {goalRecommendation ? (
          <>
            <Text style={[styles.goalRecommendationTitle, { color: colors.text }]}>
              {goalRecommendation.title}
            </Text>
            <Text style={[styles.noticeBody, { color: hexToRgba(colors.text, 0.56) }]}>
              {goalRecommendation.message}
            </Text>
            {goalRecommendation.preview ? (
              <View
                style={[
                  styles.goalRecommendationPreview,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.goalRecommendationPreviewText, { color: colors.text }]}>
                  {goalRecommendation.preview}
                </Text>
              </View>
            ) : null}

            <View style={styles.goalRecommendationActions}>
              <ThemeButton
                title={goalRecommendationAction === 'dismiss' ? 'Dismissing...' : 'Dismiss'}
                onPress={handleDismissGoalRecommendation}
                disabled={Boolean(goalRecommendationAction)}
                colorBackground={colors.card}
                colorText={colors.text}
                style={[
                  styles.goalRecommendationActionButton,
                  { borderWidth: 1, borderColor: colors.border },
                ]}
              />
              {goalRecommendation.action.type === 'complete' ? (
                <ThemeButton
                  title={
                    goalRecommendationAction === 'complete' ? 'Applying...' : 'Use suggestion'
                  }
                  onPress={handleCompleteGoalRecommendation}
                  disabled={Boolean(goalRecommendationAction)}
                  colorBackground={colors.primaryDark}
                  colorText={colors.card}
                  style={styles.goalRecommendationActionButton}
                />
              ) : (
                <ThemeButton
                  title="Review suggestion"
                  onPress={handleOpenGoalRecommendation}
                  disabled={Boolean(goalRecommendationAction)}
                  colorBackground={colors.primaryDark}
                  colorText={colors.card}
                  style={styles.goalRecommendationActionButton}
                />
              )}
            </View>
          </>
        ) : null}

        {goalRecommendationActionError ? (
          <Text style={[styles.goalRecommendationError, { color: colors.error }]}>
            {goalRecommendationActionError}
          </Text>
        ) : null}
      </FinanceCard>
    ) : null;

  if (!isIntroPreferencesReady) {
    return (
      <FinanceScreen
        title="Financial Goals"
        subtitle={
          isUsingLiveGoals
            ? 'Track live goal progress, priority order and lifecycle changes from GoalWealth.'
            : 'Track goal progress, recurring contributions and account-linked savings plans.'
        }
      >
        <View />
      </FinanceScreen>
    );
  }

  if (!hasSeenFinancialGoalsIntro) {
    return (
      <FinanceScreen
        title="Financial Goals"
        subtitle="Create, prioritize and fund each goal from one planning workspace."
      >
        <View style={styles.stack}>
          {goalRecommendationCard}

          <FinanceCard
            style={[
              styles.introCard,
              {
                backgroundColor: hexToRgba(colors.success, 0.1),
                borderColor: hexToRgba(colors.success, 0.16),
              },
            ]}
          >
            <View style={styles.introTop}>
              <View style={styles.introCopy}>
                <Text style={[styles.introEyebrow, { color: colors.success }]}>Goal center</Text>
                <Text style={[styles.introTitle, { color: colors.text }]}>
                  Keep every goal visible, prioritized and easier to fund.
                </Text>
                <Text style={[styles.introBody, { color: hexToRgba(colors.text, 0.58) }]}> 
                  {isUsingLiveGoals
                    ? 'Live mode keeps this workspace focused on endpoint-backed goal creation, synced progress and lifecycle updates.'
                    : 'This flow now combines creation, priority planning, savings account selection, trade-off review, history and delete states into fewer, clearer screens.'}
                </Text>
              </View>

              <View style={[styles.introBadge, { backgroundColor: colors.card }]}> 
                <MaterialIcons name="flag-circle" size={20} color={colors.success} />
                <Text style={[styles.introBadgeText, { color: colors.text }]}> 
                  {summary.activeGoals} active goals
                </Text>
              </View>
            </View>

            <View style={styles.introHighlightStack}>
              {introHighlights.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.introHighlight,
                    {
                      backgroundColor: colors.card,
                      borderColor: hexToRgba(colors.primaryDark, 0.08),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.introHighlightIcon,
                      { backgroundColor: hexToRgba(item.accent, 0.12) },
                    ]}
                  >
                    <MaterialIcons name={item.icon} size={18} color={item.accent} />
                  </View>
                  <View style={styles.introHighlightCopy}>
                    <Text style={[styles.introHighlightTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.introHighlightBody,
                        { color: hexToRgba(colors.text, 0.54) },
                      ]}
                    >
                      {item.body}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.introActions}>
              <ThemeButton
                title="Create Goal"
                onPress={() => {
                  markFinancialGoalsIntroSeen();
                  router.push('/(finance)/financial-goals/create');
                }}
                colorBackground={colors.success}
                colorText={colors.card}
                style={styles.introActionButton}
              />
              <ThemeButton
                title="Open Dashboard"
                onPress={markFinancialGoalsIntroSeen}
                colorBackground={colors.card}
                colorText={colors.text}
                style={[styles.introActionButton, { borderWidth: 1, borderColor: colors.border }]}
              />
            </View>
          </FinanceCard>
        </View>
      </FinanceScreen>
    );
  }

  return (
    <FinanceScreen
      title="Financial Goals"
      subtitle={
        isUsingLiveGoals
          ? 'Live goal workspace for synced progress, priority order and lifecycle updates.'
          : 'Multi-goal planner with priority order, feasibility signals and funding trade-offs.'
      }
      contentStyle={styles.contentStyle}
      rightAccessory={
        <Pressable
          style={[
            styles.headerAction,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => router.push('/(finance)/financial-goals/create')}
        >
          <MaterialIcons name="add" size={20} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        {goalRecommendationCard}

        {isUsingLiveGoals && error ? (
          <FinanceCard
            style={[
              styles.noticeCard,
              {
                backgroundColor: hexToRgba(colors.warning, 0.08),
                borderColor: hexToRgba(colors.warning, 0.2),
              },
            ]}
          >
            <Text style={[styles.noticeTitle, { color: colors.text }]}> 
              GoalWealth goals are unavailable right now
            </Text>
            <Text style={[styles.noticeBody, { color: hexToRgba(colors.text, 0.56) }]}> 
              {error}
            </Text>
          </FinanceCard>
        ) : null}

        <FinanceCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.success, 0.1),
              borderColor: hexToRgba(colors.success, 0.16),
            },
          ]}
        >
          <View style={[styles.heroHeader, isSmallPhone && styles.heroHeaderCompact]}>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroEyebrow, { color: colors.success }]}> 
                {isUsingLiveGoals ? 'Goal overview · live' : 'Goal overview'}
              </Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}> 
                {leadGoal ? formatCurrency(summary.totalSaved) : 'No goals yet'}
              </Text>
              <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.58) }]}> 
                {leadGoal
                  ? `Saved across ${summary.totalGoals} goals. ${summary.activeGoals} ${
                      summary.activeGoals === 1 ? 'goal is' : 'goals are'
                    } actively funding with ${formatCurrency(summary.monthlyContribution)} allocated monthly. ${prioritySummary}`
                  : 'Create your first goal to start syncing live goal progress, funding pace and priority order from GoalWealth.'}
              </Text>
            </View>

            {leadGoal ? (
              <GoalProgressRing
                accent={colors.success}
                progress={overallProgress}
                centerValue={`${Math.round(overallProgress * 100)}%`}
                caption="Portfolio funded"
                size={isSmallPhone ? 158 : 182}
                strokeWidth={isSmallPhone ? 14 : 16}
              />
            ) : (
              <View style={[styles.emptyHeroBadge, { backgroundColor: colors.card }]}> 
                <MaterialIcons name="flag-circle" size={22} color={colors.success} />
                <Text style={[styles.emptyHeroBadgeValue, { color: colors.text }]}> 
                  {summary.activeGoals}
                </Text>
                <Text style={[styles.emptyHeroBadgeLabel, { color: hexToRgba(colors.text, 0.52) }]}> 
                  live goals
                </Text>
              </View>
            )}
          </View>

          <ResponsiveGrid
            minItemWidth={isSmallPhone ? 128 : 148}
            horizontalPadding={18}
            gap={10}
            maxColumns={isSmallPhone ? 2 : 3}
            style={styles.heroMetricGrid}
          >
            <View style={[styles.heroMetricCard, { backgroundColor: colors.card }]}> 
              <Text style={[styles.heroMetricValue, { color: colors.primaryDark }]}> 
                {formatCurrency(summary.totalLeft)}
              </Text>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.text, 0.54) }]}> 
                left to fund
              </Text>
            </View>
            <View style={[styles.heroMetricCard, { backgroundColor: colors.card }]}> 
              <Text style={[styles.heroMetricValue, { color: colors.success }]}> 
                {leadGoal?.targetMonth ?? 'Flex'}
              </Text>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.text, 0.54) }]}> 
                next target month
              </Text>
            </View>
            <View style={[styles.heroMetricCard, { backgroundColor: colors.card }]}> 
              <Text style={[styles.heroMetricValue, { color: colors.warning }]}> 
                {summary.activeGoals}
              </Text>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.text, 0.54) }]}> 
                active goals
              </Text>
            </View>
          </ResponsiveGrid>

          <View style={styles.heroActions}>
            <View style={styles.heroActionWrap}>
              <ThemeButton
                title="Add Goal"
                onPress={() => router.push('/(finance)/financial-goals/create')}
                colorBackground={colors.success}
                colorText={colors.card}
                style={styles.heroActionButton}
              />
            </View>
            {capabilities.canViewHistory ? (
              <View style={styles.heroActionWrap}>
                <ThemeButton
                  title="Open History"
                  onPress={() => router.push('/(finance)/financial-goals/history')}
                  colorBackground={colors.card}
                  colorText={colors.text}
                  disabled={!orderedGoals.length}
                  style={[styles.heroActionButton, { borderWidth: 1, borderColor: colors.border }]}
                />
              </View>
            ) : null}
          </View>
        </FinanceCard>

        {isUsingLiveGoals && isLoading && !orderedGoals.length ? (
          <FinanceCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Loading live goals</Text>
            <Text style={[styles.loadingBody, { color: hexToRgba(colors.text, 0.56) }]}> 
              GoalWealth is syncing the latest goals for this user.
            </Text>
          </FinanceCard>
        ) : null}

        {leadGoal && capabilities.canViewHistory ? (
          <GoalHistoryCard
            title="Balance History"
            points={leadGoal.history}
            accent={leadGoal.accent}
            footer={`${leadGoal.title} has the strongest visible momentum right now.`}
          />
        ) : null}

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Priority funding order</Text>
            <Pressable onPress={() => router.push('/(finance)/financial-goals/create')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>New goal</Text>
            </Pressable>
          </View>

          {activeOrderedGoals.length ? (
            <GoalPriorityStack
              goals={activeOrderedGoals}
              showPlanningSignals={capabilities.canViewDerivedInsights}
            />
          ) : (
            <Text style={[styles.emptySectionBody, { color: hexToRgba(colors.text, 0.56) }]}> 
              No active goals are funding right now. Resume or create a goal to rebuild the live order.
            </Text>
          )}
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Goals workspace</Text>
            {capabilities.canViewHistory ? (
              <Pressable onPress={() => router.push('/(finance)/financial-goals/history')}>
                <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>History</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.goalStack}>
            {orderedGoals.map((goal) => {
              const progress = goal.currentProgress;

              return (
                <Pressable
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/(finance)/financial-goals/[goalId]',
                      params: { goalId: goal.id },
                    })
                  }
                >
                  <View style={styles.goalHeader}>
                    <View style={[styles.goalIcon, { backgroundColor: hexToRgba(goal.accent, 0.12) }]}>
                      <MaterialIcons name={goal.icon} size={20} color={goal.accent} />
                    </View>

                    <View style={styles.goalCopy}>
                      <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
                      <View style={styles.goalMetaRow}>
                        <GoalLifecycleBadge
                          status={goal.lifecycleStatus}
                          label={goal.lifecycleLabel}
                        />
                        <Text style={[styles.goalMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                          {capabilities.canViewDerivedInsights
                            ? `${goal.priority} priority • ${goal.allowedRisk}`
                            : `${goal.priority} priority`}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.goalProgressWrap}>
                      <Text style={[styles.goalProgress, { color: goal.accent }]}>
                        {Math.round(progress * 100)}%
                      </Text>
                      <Text style={[styles.goalProgressMeta, { color: hexToRgba(colors.text, 0.48) }]}>
                        {capabilities.canViewDerivedInsights
                          ? `${Math.round(goal.feasibilityProbability * 100)}% feasible`
                          : goal.dueLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.goalTrack, { backgroundColor: hexToRgba(goal.accent, 0.12) }]}>
                    <View
                      style={[
                        styles.goalFill,
                        { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: goal.accent },
                      ]}
                    />
                  </View>

                  <View style={styles.goalFooter}>
                    <Text style={[styles.goalValue, { color: colors.text }]}> 
                      {formatCurrency(goal.saved)} of {formatCurrency(goal.target)}
                    </Text>
                    <Text style={[styles.goalContribution, { color: hexToRgba(colors.text, 0.52) }]}> 
                      gap {formatCurrency(goal.fundingGap)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            {!orderedGoals.length ? (
              <View
                style={[
                  styles.goalCard,
                  styles.emptyGoalCard,
                  { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.goalTitle, { color: colors.text }]}>No goals yet</Text>
                <Text style={[styles.goalMeta, { color: hexToRgba(colors.text, 0.52) }]}> 
                  Create your first goal to populate this workspace from GoalWealth.
                </Text>
              </View>
            ) : null}
          </View>
        </FinanceCard>

        {capabilities.canViewDerivedInsights ? (
          <GoalsPortfolioRecommendationCard recommendation={portfolioRecommendation} />
        ) : null}
        {leadGoal && capabilities.canViewDerivedInsights ? (
          <GoalConflictNotice conflicts={leadGoal.conflictWithOtherGoals} />
        ) : null}

        <ResponsiveGrid minItemWidth={190} horizontalPadding={18} gap={12} maxColumns={2}>
          {insightCards.map((item) => (
            <FinanceCard key={item.id}>
              <Text style={[styles.insightValue, { color: colors[item.tone] }]}>{item.value}</Text>
              <Text style={[styles.insightTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.insightBody, { color: hexToRgba(colors.text, 0.56) }]}> 
                {item.body}
              </Text>
            </FinanceCard>
          ))}
        </ResponsiveGrid>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  contentStyle: {
    paddingBottom: 30,
  },
  stack: {
    marginTop: 18,
    gap: 16,
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introCard: {
    borderWidth: 1,
  },
  noticeCard: {
    borderWidth: 1,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  noticeBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  goalRecommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalRecommendationIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalRecommendationCopy: {
    flex: 1,
    minWidth: 0,
  },
  goalRecommendationMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
  },
  goalRecommendationTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  goalRecommendationPreview: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  goalRecommendationPreviewText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  goalRecommendationActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  goalRecommendationActionButton: {
    flex: 1,
  },
  goalRecommendationError: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  introTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  introCopy: {
    flex: 1,
    minWidth: 0,
  },
  introEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  introTitle: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  introBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  introBadge: {
    minWidth: 78,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  introBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  introHighlightStack: {
    marginTop: 18,
    gap: 12,
  },
  introHighlight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  introHighlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introHighlightCopy: {
    flex: 1,
    minWidth: 0,
  },
  introHighlightTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  introHighlightBody: {
    marginTop: 4,
    fontSize: Typography.body,
    lineHeight: 19,
  },
  introActions: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
  },
  introActionButton: {
    flex: 1,
  },
  heroCard: {
    borderWidth: 1,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  heroHeaderCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.9,
  },
  heroBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  emptyHeroBadge: {
    minWidth: 104,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyHeroBadgeValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  emptyHeroBadgeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroMetricGrid: {
    marginTop: 18,
  },
  heroMetricCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  heroMetricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  heroMetricLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  heroActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  heroActionWrap: {
    flex: 1,
  },
  heroActionButton: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '800',
  },
  loadingBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  emptySectionBody: {
    marginTop: 12,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  goalStack: {
    marginTop: 16,
    gap: 12,
  },
  goalCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  emptyGoalCard: {
    minHeight: 110,
    justifyContent: 'center',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCopy: {
    flex: 1,
    minWidth: 0,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  goalMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  goalMetaRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '800',
  },
  goalProgressWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  goalProgressMeta: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalTrack: {
    marginTop: 16,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 999,
  },
  goalFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  goalValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalContribution: {
    fontSize: 12,
    fontWeight: '700',
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  insightTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '800',
  },
  insightBody: {
    marginTop: 6,
    fontSize: Typography.body,
    lineHeight: 20,
  },
});
