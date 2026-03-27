import { getFinancialGoalsDashboardHref } from '@/app/(finance)/financial-goals/navigation';
import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  getGoalAccountById,
  getGoalLifecycleDescription,
  getGoalPrioritySummary,
} from '@/components/financial-goals/data';
import {
  FeasibilityMeter,
  FundingGapSummary,
  GoalConflictNotice,
  GoalHistoryCard,
  GoalLifecycleBadge,
  GoalProgressRing,
  GoalRecommendationSummary,
  GoalTransferList,
} from '@/components/financial-goals/ui';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { Typography } from '@/constants/theme';
import { useFinancialGoals } from '@/hooks/use-financial-goals';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import { normalizeGoalwealthError } from '@/services/api/errors';
import type { GoalwealthMemoryGoalStatus } from '@/services/api/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from '@/lib/expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type GoalLifecycleAction = {
  label: string;
  nextStatus: GoalwealthMemoryGoalStatus;
  tone: 'primary' | 'secondary' | 'success' | 'danger';
};

function getGoalLifecycleActions(status: GoalwealthMemoryGoalStatus): GoalLifecycleAction[] {
  switch (status) {
    case 'paused':
      return [
        { label: 'Resume goal', nextStatus: 'active', tone: 'primary' },
        { label: 'Mark complete', nextStatus: 'completed', tone: 'success' },
        { label: 'Archive goal', nextStatus: 'archived', tone: 'danger' },
      ];
    case 'completed':
      return [
        { label: 'Reopen goal', nextStatus: 'active', tone: 'primary' },
        { label: 'Archive goal', nextStatus: 'archived', tone: 'secondary' },
      ];
    case 'archived':
      return [{ label: 'Restore goal', nextStatus: 'active', tone: 'primary' }];
    default:
      return [
        { label: 'Pause goal', nextStatus: 'paused', tone: 'secondary' },
        { label: 'Mark complete', nextStatus: 'completed', tone: 'success' },
        { label: 'Archive goal', nextStatus: 'archived', tone: 'danger' },
      ];
  }
}

export default function FinancialGoalDetailScreen() {
  const { colors } = useTheme();
  const { isSmallPhone } = useResponsive();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const router = useRouter();
  const { getGoalById, goals, isUsingLiveGoals, capabilities, refreshGoal, updateGoal } =
    useFinancialGoals();
  const goal = getGoalById(goalId);
  const prioritySummary = getGoalPrioritySummary(goalId, goals);
  const [pendingStatus, setPendingStatus] = useState<GoalwealthMemoryGoalStatus | null>(null);
  const [lifecycleError, setLifecycleError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUsingLiveGoals || !goalId) {
      return;
    }

    void refreshGoal(goalId);
  }, [goalId, isUsingLiveGoals, refreshGoal]);

  if (!goal) {
    return (
      <FinanceScreen
        title="Goal not found"
        subtitle="The selected goal is unavailable in the current GoalWealth workspace."
        contentStyle={styles.contentStyle}
        onBackPress={() => router.replace(getFinancialGoalsDashboardHref())}
      >
        <View style={styles.stack}>
          <FinanceCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Goal unavailable</Text>
            <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Refresh the goals dashboard or create a new goal to continue.
            </Text>
          </FinanceCard>
        </View>
      </FinanceScreen>
    );
  }

  const account = getGoalAccountById(goal.accountId);
  const progress = goal.saved / goal.target;
  const lifecycleActions = isUsingLiveGoals ? getGoalLifecycleActions(goal.lifecycleStatus) : [];
  const detailSubtitle = isUsingLiveGoals
    ? `${goal.lifecycleLabel} • ${goal.priority} priority • ${goal.dueLabel}`
    : `${goal.lifecycleLabel} • ${goal.priority} priority • ${goal.allowedRisk} • ${goal.dueLabel}`;

  const handleLifecycleUpdate = async (nextStatus: GoalwealthMemoryGoalStatus) => {
    if (!isUsingLiveGoals || pendingStatus) {
      return;
    }

    setLifecycleError(null);
    setPendingStatus(nextStatus);

    try {
      await updateGoal(goal.id, { status: nextStatus });
    } catch (incomingError) {
      setLifecycleError(normalizeGoalwealthError(incomingError).message);
    } finally {
      setPendingStatus(null);
    }
  };

  return (
    <FinanceScreen
      title={goal.title}
      subtitle={detailSubtitle}
      contentStyle={styles.contentStyle}
      onBackPress={() => router.replace(getFinancialGoalsDashboardHref())}
      rightAccessory={
        capabilities.canEdit ? (
          <Pressable
            style={[
              styles.headerAction,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() =>
              router.push({
                pathname: '/(finance)/financial-goals/create',
                params: { goalId: goal.id, mode: 'edit' },
              })
            }
          >
            <MaterialIcons name="edit" size={18} color={colors.text} />
          </Pressable>
        ) : null
      }
    >
      <View style={styles.stack}>
        {isUsingLiveGoals ? (
          <FinanceCard
            style={[
              styles.noticeCard,
              {
                backgroundColor: hexToRgba(colors.warning, 0.08),
                borderColor: hexToRgba(colors.warning, 0.18),
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Live goal sync is active</Text>
            <Text style={[styles.noticeBody, { color: hexToRgba(colors.text, 0.56) }]}>
              GoalWealth now supports live goal detail, edit and lifecycle updates. Transfer,
              savings account, history, milestone and planner-derived sections stay off until the
              backend adds those endpoints.
            </Text>
          </FinanceCard>
        ) : null}

        <FinanceCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(goal.accent, 0.12),
              borderColor: hexToRgba(goal.accent, 0.2),
            },
          ]}
        >
          <View style={[styles.heroTop, isSmallPhone && styles.heroTopCompact]}>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroEyebrow, { color: goal.accent }]}>Goal health</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>{formatCurrency(goal.saved)}</Text>
              <View style={styles.heroStatusRow}>
                <GoalLifecycleBadge status={goal.lifecycleStatus} label={goal.lifecycleLabel} />
              </View>
              <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.58) }]}>
                {isUsingLiveGoals
                  ? 'GoalWealth is syncing the saved amount, target, timeline and lifecycle for this goal.'
                  : goal.note}
              </Text>
            </View>

            <GoalProgressRing
              accent={goal.accent}
              progress={progress}
              centerValue={`${Math.round(progress * 100)}%`}
              caption="funded"
              size={isSmallPhone ? 154 : 176}
              strokeWidth={isSmallPhone ? 14 : 16}
            />
          </View>

          <View style={styles.heroStats}>
            <View style={[styles.heroStatCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroStatValue, { color: goal.accent }]}>
                {formatCurrency(goal.fundingGap)}
              </Text>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                funding gap
              </Text>
            </View>
            <View style={[styles.heroStatCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroStatValue, { color: colors.success }]}>
                {formatCurrency(goal.recommendedMonthlyAllocation)}
              </Text>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                recommended / month
              </Text>
            </View>
            <View style={[styles.heroStatCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroStatValue, { color: colors.primaryDark, fontSize: 13 }]}>
                {prioritySummary.feasibilityLabel}
              </Text>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                feasibility
              </Text>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isUsingLiveGoals ? 'Goal snapshot' : 'Planner rationale'}
            </Text>
            {!isUsingLiveGoals ? (
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>
                sequence {goal.recommendedSequence}
              </Text>
            ) : null}
          </View>

          <FundingGapSummary
            gap={goal.fundingGap}
            monthlyAllocation={goal.recommendedMonthlyAllocation}
          />
          {!isUsingLiveGoals ? (
            <>
              <GoalRecommendationSummary goal={goal} />
              <FeasibilityMeter probability={goal.feasibilityProbability} accent={goal.accent} />
              <GoalConflictNotice conflicts={goal.conflictWithOtherGoals} />
            </>
          ) : (
            <Text style={[styles.snapshotBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Live sync currently exposes the core goal fields only. Planner conflicts, feasibility,
              transfers and funding account details stay hidden until GoalWealth exposes those
              endpoints.
            </Text>
          )}
        </FinanceCard>

        {isUsingLiveGoals ? (
          <FinanceCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Goal lifecycle</Text>
              <GoalLifecycleBadge status={goal.lifecycleStatus} label={goal.lifecycleLabel} />
            </View>
            <Text style={[styles.lifecycleBody, { color: hexToRgba(colors.text, 0.56) }]}>
              {getGoalLifecycleDescription(goal.lifecycleStatus)}
            </Text>

            <View style={styles.lifecycleActionGrid}>
              {lifecycleActions.map((action) => {
                const isPending = pendingStatus === action.nextStatus;
                const isDanger = action.tone === 'danger';
                const isSecondary = action.tone === 'secondary';
                const isSuccess = action.tone === 'success';
                const backgroundColor = isDanger
                  ? colors.error
                  : isSuccess
                    ? colors.success
                    : isSecondary
                      ? colors.card
                      : colors.primaryDark;
                const textColor = isSecondary ? colors.text : colors.card;

                return (
                  <View key={action.nextStatus} style={styles.lifecycleActionWrap}>
                    <ThemeButton
                      title={isPending ? 'Updating...' : action.label}
                      onPress={() => {
                        void handleLifecycleUpdate(action.nextStatus);
                      }}
                      colorBackground={backgroundColor}
                      colorText={textColor}
                      disabled={Boolean(pendingStatus)}
                      style={[
                        styles.lifecycleActionButton,
                        isSecondary && { borderWidth: 1, borderColor: colors.border },
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            {lifecycleError ? (
              <Text style={[styles.lifecycleError, { color: colors.error }]}>{lifecycleError}</Text>
            ) : null}
          </FinanceCard>
        ) : null}

        {!isUsingLiveGoals ? (
          <View style={styles.actionRow}>
            <View style={styles.actionButtonWrap}>
              <ThemeButton
                title="Add Money"
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/financial-goals/transfer',
                    params: { goalId: goal.id, mode: 'topup', accountId: account.id },
                  })
                }
                colorBackground={colors.primaryDark}
                colorText={colors.card}
                style={styles.actionButton}
              />
            </View>
            <View style={styles.actionButtonWrap}>
              <ThemeButton
                title="Recurring"
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/financial-goals/transfer',
                    params: { goalId: goal.id, mode: 'recurring', accountId: account.id },
                  })
                }
                colorBackground={colors.card}
                colorText={colors.text}
                style={[styles.actionButton, { borderWidth: 1, borderColor: colors.border }]}
              />
            </View>
          </View>
        ) : null}

        {!isUsingLiveGoals ? (
          <GoalHistoryCard
            title="Balance History"
            points={goal.history}
            accent={goal.accent}
            footer={`${goal.title} is pacing toward ${goal.targetDate}.`}
          />
        ) : null}

        {!isUsingLiveGoals ? (
          <FinanceCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Constraint flags</Text>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>
                {prioritySummary.fundingGapLabel}
              </Text>
            </View>
            <View style={styles.flagWrap}>
              {goal.constraintFlags.map((flag) => (
                <View
                  key={flag}
                  style={[
                    styles.flagChip,
                    { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.flagText, { color: colors.text }]}>{flag}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.constraintBody, { color: hexToRgba(colors.text, 0.54) }]}>
              {prioritySummary.conflicts}
            </Text>
          </FinanceCard>
        ) : null}

        {!isUsingLiveGoals ? (
          <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Savings account</Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(finance)/financial-goals/account',
                  params: {
                    origin: 'detail',
                    goalId: goal.id,
                    accountId: account.id,
                  },
                })
              }
            >
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Switch</Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.accountCard,
              { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
            ]}
          >
            <View style={[styles.accountAccent, { backgroundColor: account.accent }]} />
            <View style={styles.accountCopy}>
              <Text style={[styles.accountTitle, { color: colors.text }]}>{account.label}</Text>
              <Text style={[styles.accountMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                {account.subtitle} • {account.mask}
              </Text>
              <Text style={[styles.accountHint, { color: colors.primaryDark }]}>{goal.recurringLabel}</Text>
            </View>
            <Text style={[styles.accountBalance, { color: colors.text }]}>
              {formatCurrency(account.balance)}
            </Text>
          </View>
        </FinanceCard>
        ) : null}

        {!isUsingLiveGoals ? (
          <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent activity</Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(finance)/financial-goals/history',
                  params: { goalId: goal.id },
                })
              }
            >
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Full history</Text>
            </Pressable>
          </View>
          <GoalTransferList rows={goal.transfers} />
        </FinanceCard>
        ) : null}

        {!isUsingLiveGoals ? (
          <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Milestones</Text>
          <View style={styles.milestoneStack}>
            {goal.milestones.map((milestone, index) => (
              <View key={milestone} style={styles.milestoneRow}>
                <View style={[styles.milestoneIndex, { backgroundColor: hexToRgba(goal.accent, 0.12) }]}>
                  <Text style={[styles.milestoneIndexText, { color: goal.accent }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[styles.milestoneText, { color: colors.text }]}>{milestone}</Text>
              </View>
            ))}
          </View>
        </FinanceCard>
        ) : null}

        {!isUsingLiveGoals ? (
          <View style={styles.footerActions}>
            <ThemeButton
              title="Edit Goal"
              onPress={() =>
                router.push({
                  pathname: '/(finance)/financial-goals/create',
                  params: { goalId: goal.id, mode: 'edit' },
                })
              }
              colorBackground={colors.card}
              colorText={colors.text}
              style={[styles.footerButton, { borderWidth: 1, borderColor: colors.border }]}
            />
            <ThemeButton
              title="Delete Goal"
              onPress={() =>
                router.push({
                  pathname: '/(finance)/financial-goals/delete',
                  params: { goalId: goal.id },
                })
              }
              colorBackground={colors.error}
              colorText={colors.card}
              style={styles.footerButton}
            />
          </View>
        ) : null}
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  contentStyle: {
    paddingBottom: 30,
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    marginTop: 18,
    gap: 16,
  },
  noticeCard: {
    borderWidth: 1,
  },
  noticeBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  emptyBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  heroCard: {
    borderWidth: 1,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  heroTopCompact: {
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
    letterSpacing: 0.6,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  heroBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  heroStatusRow: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  heroStats: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
  },
  heroStatCard: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  heroStatLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
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
  lifecycleBody: {
    marginTop: 12,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  snapshotBody: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  lifecycleActionGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  lifecycleActionWrap: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  lifecycleActionButton: {
    width: '100%',
  },
  lifecycleError: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonWrap: {
    flex: 1,
  },
  actionButton: {
    width: '100%',
  },
  flagWrap: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  flagChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
  },
  flagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  constraintBody: {
    marginTop: 12,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  accountCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountAccent: {
    width: 10,
    height: 48,
    borderRadius: 999,
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
  },
  accountTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  accountMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  accountHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '800',
  },
  milestoneStack: {
    marginTop: 14,
    gap: 12,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestoneIndex: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIndexText: {
    fontSize: 13,
    fontWeight: '800',
  },
  milestoneText: {
    flex: 1,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
