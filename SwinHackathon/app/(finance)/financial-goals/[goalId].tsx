import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  getFinancialGoalById,
  getGoalAccountById,
  getGoalPrioritySummary,
} from '@/components/financial-goals/data';
import {
  FeasibilityMeter,
  FundingGapSummary,
  GoalConflictNotice,
  GoalHistoryCard,
  GoalProgressRing,
  GoalRecommendationSummary,
  GoalTransferList,
} from '@/components/financial-goals/ui';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function FinancialGoalDetailScreen() {
  const { colors } = useTheme();
  const { isSmallPhone } = useResponsive();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const router = useRouter();
  const goal = getFinancialGoalById(goalId);
  const prioritySummary = getGoalPrioritySummary(goalId);
  const account = getGoalAccountById(goal.accountId);
  const progress = goal.saved / goal.target;
  return (
    <FinanceScreen
      title={goal.title}
      subtitle={`${goal.priority} priority • ${goal.allowedRisk} • ${goal.dueLabel}`}
      contentStyle={styles.contentStyle}
      rightAccessory={
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
      }
    >
      <View style={styles.stack}>
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
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                {formatCurrency(goal.saved)}
              </Text>
              <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.58) }]}>
                {goal.note}
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Planner rationale</Text>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>
              sequence {goal.recommendedSequence}
            </Text>
          </View>

          <GoalRecommendationSummary goal={goal} />
          <FundingGapSummary
            gap={goal.fundingGap}
            monthlyAllocation={goal.recommendedMonthlyAllocation}
          />
          <FeasibilityMeter probability={goal.feasibilityProbability} accent={goal.accent} />
          <GoalConflictNotice conflicts={goal.conflictWithOtherGoals} />
        </FinanceCard>

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

        <GoalHistoryCard
          title="Balance History"
          points={goal.history}
          accent={goal.accent}
          footer={`${goal.title} is pacing toward ${goal.targetDate}.`}
        />

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
              <Text style={[styles.accountHint, { color: colors.primaryDark }]}>
                {goal.recurringLabel}
              </Text>
            </View>
            <Text style={[styles.accountBalance, { color: colors.text }]}>
              {formatCurrency(account.balance)}
            </Text>
          </View>
        </FinanceCard>

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
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  heroBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  heroStats: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroStatCard: {
    flex: 1,
    minWidth: 110,
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
    height: 46,
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
  flagWrap: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  flagChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  flagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  constraintBody: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
  },
  milestoneStack: {
    marginTop: 16,
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
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIndexText: {
    fontSize: 12,
    fontWeight: '800',
  },
  milestoneText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
