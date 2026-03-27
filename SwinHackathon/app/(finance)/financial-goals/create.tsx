import { getCreateBackHref } from '@/app/(finance)/financial-goals/navigation';
import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  contributionPresets,
  getGoalAccountById,
  getGoalLifecycleDescription,
  goalDeadlineOptions,
  goalFrequencyOptions,
  goalLifecycleOptions,
  goalPriorityOptions,
  goalRiskOptions,
  goalTemplates,
  targetPresets,
} from '@/components/financial-goals/data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { Typography } from '@/constants/theme';
import { useFinancialGoals } from '@/hooks/use-financial-goals';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import { normalizeGoalwealthError } from '@/services/api/errors';
import type {
  GoalwealthGoalCreateRequest,
  GoalwealthMemoryGoalType,
  GoalwealthMemoryGoalStatus,
  GoalwealthGoalUpdateRequest,
} from '@/services/api/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from '@/lib/expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const createDefaults = {
  title: 'Vacation',
  target: targetPresets[1],
  contribution: contributionPresets[1],
  priority: 'Medium' as const,
  allowedRisk: 'Low to moderate',
};

function mapTemplateIdToGoalType(templateId: string): GoalwealthMemoryGoalType {
  switch (templateId) {
    case 'safety':
      return 'emergency_fund_goal';
    case 'debt':
      return 'debt_payoff_goal';
    case 'home':
      return 'wealth_building_goal';
    default:
      return 'savings_goal';
  }
}

function mapPriorityLabelToValue(priority: string) {
  switch (priority) {
    case 'High':
      return 8;
    case 'Low':
      return 3;
    default:
      return 5;
  }
}

function mapGoalTypeToTemplateId(goalType?: GoalwealthMemoryGoalType | null) {
  switch (goalType) {
    case 'emergency_fund_goal':
      return 'safety';
    case 'debt_payoff_goal':
      return 'debt';
    case 'wealth_building_goal':
    case 'retirement_goal':
    case 'investment_goal':
      return 'home';
    default:
      return 'travel';
  }
}

function mapPriorityValueToLabel(priority?: number | null) {
  if ((priority ?? 0) >= 8) {
    return 'High' as const;
  }

  if ((priority ?? 0) <= 3) {
    return 'Low' as const;
  }

  return 'Medium' as const;
}

function mapTargetDateToDeadlineLabel(targetDate?: string | null) {
  if (!targetDate) {
    return goalDeadlineOptions[1];
  }

  const parsed = new Date(targetDate);
  if (Number.isNaN(parsed.getTime())) {
    return goalDeadlineOptions[1];
  }

  const diffMonths = Math.max(
    1,
    Math.round((parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))
  );

  if (diffMonths <= 3) {
    return '3 months';
  }

  if (diffMonths <= 6) {
    return '6 months';
  }

  if (diffMonths <= 9) {
    return '9 months';
  }

  return '12 months';
}

function buildTargetDate(deadlineLabel: string) {
  const monthCount = Number.parseInt(deadlineLabel, 10);
  const fallbackMonthCount = Number.isFinite(monthCount) ? monthCount : 6;
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + fallbackMonthCount);
  return targetDate.toISOString().slice(0, 10);
}

export default function CreateFinancialGoalScreen() {
  const { colors } = useTheme();
  const { isSmallPhone } = useResponsive();
  const router = useRouter();
  const {
    getGoalById,
    createGoal,
    updateGoal,
    isUsingLiveGoals,
    appliedGoalRecommendationPrefill,
    clearGoalRecommendationPrefill,
  } = useFinancialGoals();
  const params = useLocalSearchParams<{
    goalId?: string;
    accountId?: string;
    mode?: 'create' | 'edit';
  }>();
  const goal = getGoalById(params.goalId);
  const isEditMode = params.mode === 'edit' || Boolean(params.goalId);
  const queuedRecommendationPrefill = !isEditMode ? appliedGoalRecommendationPrefill : null;
  const [recommendationPrefill] = useState(queuedRecommendationPrefill);
  const activeAccount = getGoalAccountById(params.accountId ?? goal?.accountId ?? 'goal-wallet');

  const templateFallback =
    (goal
      ? goalTemplates.find((item) =>
          item.label.toLowerCase().includes(goal.title.toLowerCase().split(' ')[0])
        )
      : null) ?? goalTemplates[0];

  const [selectedTemplate, setSelectedTemplate] = useState(
    recommendationPrefill?.goal_type
      ? mapGoalTypeToTemplateId(recommendationPrefill.goal_type)
      : templateFallback.id
  );
  const [selectedTarget, setSelectedTarget] = useState<number>(
    recommendationPrefill?.target_amount ?? goal?.target ?? createDefaults.target
  );
  const [selectedContribution, setSelectedContribution] = useState<number>(
    goal?.monthlyContribution ?? createDefaults.contribution
  );
  const [selectedFrequency, setSelectedFrequency] = useState<typeof goalFrequencyOptions[number]>(
    goalFrequencyOptions[2]
  );
  const [selectedPriority, setSelectedPriority] = useState(
    recommendationPrefill?.priority != null
      ? mapPriorityValueToLabel(recommendationPrefill.priority)
      : goal?.priority ?? createDefaults.priority
  );
  const [selectedRisk, setSelectedRisk] = useState(
    goal?.allowedRisk ?? createDefaults.allowedRisk
  );
  const [selectedStatus, setSelectedStatus] = useState<GoalwealthMemoryGoalStatus>(
    recommendationPrefill?.status ?? goal?.lifecycleStatus ?? 'active'
  );
  const [selectedDeadline, setSelectedDeadline] = useState<typeof goalDeadlineOptions[number]>(
    recommendationPrefill?.target_date
      ? mapTargetDateToDeadlineLabel(recommendationPrefill.target_date)
      : goalDeadlineOptions[1]
  );
  const [selectedTargetDate, setSelectedTargetDate] = useState<string | null>(
    recommendationPrefill?.target_date ?? null
  );
  const [recommendedTitleOverride] = useState(recommendationPrefill?.title?.trim() || '');
  const [recommendedDescriptionOverride] = useState(
    recommendationPrefill?.description?.trim() || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!queuedRecommendationPrefill) {
      return;
    }

    clearGoalRecommendationPrefill();
  }, [clearGoalRecommendationPrefill, queuedRecommendationPrefill]);

  const selectedTemplateMeta =
    goalTemplates.find((item) => item.id === selectedTemplate) ?? goalTemplates[0];
  const recommendedTemplateId = recommendationPrefill?.goal_type
    ? mapGoalTypeToTemplateId(recommendationPrefill.goal_type)
    : null;
  const shouldUseRecommendationOverrides =
    !isEditMode && Boolean(recommendationPrefill) && selectedTemplate === recommendedTemplateId;
  const projectedMonths = Math.max(1, Math.ceil(selectedTarget / Math.max(selectedContribution, 1)));
  const estimatedFundingGap = Math.max(selectedTarget - (goal?.saved ?? 0), 0);
  const previewTitle = isEditMode
    ? goal?.title ?? createDefaults.title
    : shouldUseRecommendationOverrides && recommendedTitleOverride
      ? recommendedTitleOverride
      : selectedTemplateMeta.label;
  const backHref = getCreateBackHref({
    goalId: params.goalId,
    accountId: params.accountId,
    mode: params.mode,
  });
  const previewDeadlineLabel = selectedTargetDate ?? buildTargetDate(selectedDeadline);
  const submitPayload = useMemo<GoalwealthGoalCreateRequest>(
    () => ({
      title: previewTitle,
      goal_type: mapTemplateIdToGoalType(selectedTemplate),
      status: selectedStatus,
      priority: mapPriorityLabelToValue(selectedPriority),
      target_amount: selectedTarget,
      current_progress: recommendationPrefill?.current_progress ?? goal?.saved ?? 0,
      target_date: selectedTargetDate ?? buildTargetDate(selectedDeadline),
      description:
        (shouldUseRecommendationOverrides ? recommendedDescriptionOverride : '') ||
        (isUsingLiveGoals
          ? selectedTemplateMeta.helper
          : [
              selectedTemplateMeta.helper,
              `Allowed risk: ${selectedRisk}.`,
              `Transfer rhythm: ${selectedFrequency}.`,
              `Funding source: ${activeAccount.label}.`,
            ].join(' ')),
    }),
    [
      activeAccount.label,
      goal?.saved,
      isUsingLiveGoals,
      recommendationPrefill?.current_progress,
      previewTitle,
      recommendedDescriptionOverride,
      selectedTargetDate,
      selectedDeadline,
      selectedFrequency,
      selectedPriority,
      selectedRisk,
      selectedStatus,
      selectedTarget,
      selectedTemplate,
      selectedTemplateMeta.helper,
      shouldUseRecommendationOverrides,
    ]
  );

  const updatePayload = useMemo<GoalwealthGoalUpdateRequest>(
    () => ({
      title: previewTitle,
      goal_type: mapTemplateIdToGoalType(selectedTemplate),
      status: selectedStatus,
      priority: mapPriorityLabelToValue(selectedPriority),
      target_amount: selectedTarget,
      target_date: selectedTargetDate ?? buildTargetDate(selectedDeadline),
      description: isUsingLiveGoals
        ? selectedTemplateMeta.helper
        : [
            selectedTemplateMeta.helper,
            `Allowed risk: ${selectedRisk}.`,
            `Transfer rhythm: ${selectedFrequency}.`,
            `Funding source: ${activeAccount.label}.`,
          ].join(' '),
    }),
    [
      activeAccount.label,
      isUsingLiveGoals,
      previewTitle,
      selectedDeadline,
      selectedTargetDate,
      selectedFrequency,
      selectedPriority,
      selectedRisk,
      selectedStatus,
      selectedTarget,
      selectedTemplate,
      selectedTemplateMeta.helper,
    ]
  );

  const handleSaveGoal = async () => {
    if (isSaving) {
      return;
    }

    setSaveError(null);

    if (isEditMode && !isUsingLiveGoals) {
      router.replace({
        pathname: '/(finance)/financial-goals/result',
        params: {
          mode: 'updated',
          goalId: goal?.id,
          accountId: activeAccount.id,
        },
      });
      return;
    }

    try {
      setIsSaving(true);
      if (isEditMode && goal) {
        const updatedGoal = await updateGoal(goal.id, updatePayload);
        router.replace({
          pathname: '/(finance)/financial-goals/result',
          params: {
            mode: 'updated',
            goalId: updatedGoal.id,
            accountId: activeAccount.id,
          },
        });
        return;
      }

      const createdGoal = await createGoal(submitPayload);
      router.replace({
        pathname: '/(finance)/financial-goals/result',
        params: {
          mode: 'created',
          goalId: createdGoal.id,
          accountId: activeAccount.id,
        },
      });
    } catch (incomingError) {
      setSaveError(normalizeGoalwealthError(incomingError).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FinanceScreen
      title={isEditMode ? 'Edit Goal' : 'Create Goal'}
      subtitle={
        isUsingLiveGoals
          ? 'Set the core goal fields that GoalWealth currently persists.'
          : 'Set the target, contribution rhythm and savings account in one screen.'
      }
      contentStyle={styles.contentStyle}
      onBackPress={() => router.replace(backHref)}
    >
      <View style={styles.stack}>
        {saveError ? (
          <FinanceCard
            style={[
              styles.noticeCard,
              {
                backgroundColor: hexToRgba(colors.error, 0.08),
                borderColor: hexToRgba(colors.error, 0.18),
              },
            ]}
          >
            <Text style={[styles.noticeTitle, { color: colors.text }]}>Unable to save goal</Text>
            <Text style={[styles.noticeBody, { color: hexToRgba(colors.text, 0.56) }]}>
              {saveError}
            </Text>
          </FinanceCard>
        ) : null}

        {recommendationPrefill ? (
          <FinanceCard
            style={[
              styles.noticeCard,
              {
                backgroundColor: hexToRgba(colors.success, 0.08),
                borderColor: hexToRgba(colors.success, 0.18),
              },
            ]}
          >
            <Text style={[styles.noticeTitle, { color: colors.text }]}>Goal suggestion applied</Text>
            <Text style={[styles.noticeBody, { color: hexToRgba(colors.text, 0.56) }]}>
              GoalWealth prefilled this draft from a recommendation. Review the target, timeline,
              priority and lifecycle before you save the goal.
            </Text>
          </FinanceCard>
        ) : null}

        <FinanceCard
          style={[
            styles.headerCard,
            {
              backgroundColor: hexToRgba(colors.primaryDark, 0.05),
              borderColor: hexToRgba(colors.primaryDark, 0.1),
            },
          ]}
        >
          <View style={[styles.headerTop, isSmallPhone && styles.headerTopCompact]}>
            <View style={styles.headerCopy}>
              <Text style={[styles.headerEyebrow, { color: colors.primaryDark }]}>
                {isEditMode ? 'Update savings plan' : 'Build a new savings plan'}
              </Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{previewTitle}</Text>
              <Text style={[styles.headerBody, { color: hexToRgba(colors.text, 0.56) }]}>
                {isUsingLiveGoals
                  ? 'Live mode keeps this screen focused on endpoint-backed fields only: goal type, target, timeline, priority and lifecycle.'
                  : 'This screen keeps the full planning context together: amount, cadence, priority, allowed risk, account selection and planner preview before saving.'}
              </Text>
            </View>

            <View style={[styles.headerBadge, { backgroundColor: colors.card }]}>
              <Text style={[styles.headerBadgeValue, { color: colors.text }]}>
                {isUsingLiveGoals ? selectedDeadline : formatCurrency(selectedContribution)}
              </Text>
              <Text style={[styles.headerBadgeLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                {isUsingLiveGoals ? 'timeline' : 'monthly'}
              </Text>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Goal type</Text>
          <View style={styles.templateGrid}>
            {goalTemplates.map((item) => {
              const active = item.id === selectedTemplate;

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.templateCard,
                    {
                      backgroundColor: active ? hexToRgba(item.accent, 0.1) : colors.card,
                      borderColor: active ? item.accent : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedTemplate(item.id)}
                >
                  <View style={[styles.templateIcon, { backgroundColor: hexToRgba(item.accent, 0.12) }]}>
                    <MaterialIcons name={item.icon} size={20} color={item.accent} />
                  </View>
                  <Text style={[styles.templateTitle, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.templateBody, { color: hexToRgba(colors.text, 0.54) }]}>
                    {item.helper}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Target amount</Text>
          <View style={styles.chipRow}>
            {targetPresets.map((item) => {
              const active = item === selectedTarget;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.valueChip,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedTarget(item)}
                >
                  <Text style={[styles.valueChipText, { color: active ? colors.card : colors.text }]}>
                    {formatCurrency(item)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {!isUsingLiveGoals ? (
            <>
              <Text style={[styles.sectionTitle, styles.sectionTop, { color: colors.text }]}>
                Monthly contribution
              </Text>
              <View style={styles.chipRow}>
                {contributionPresets.map((item) => {
                  const active = item === selectedContribution;

                  return (
                    <Pressable
                      key={item}
                      style={[
                        styles.valueChip,
                        {
                          backgroundColor: active ? colors.success : colors.backgroundSoft,
                          borderColor: active ? colors.success : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedContribution(item)}
                    >
                      <Text style={[styles.valueChipText, { color: active ? colors.card : colors.text }]}>
                        {formatCurrency(item)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isUsingLiveGoals ? 'Target window' : 'Transfer setup'}
          </Text>

          {!isUsingLiveGoals ? (
            <>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.56) }]}>
                Recurring rhythm
              </Text>
              <View style={styles.chipRow}>
                {goalFrequencyOptions.map((item) => {
                  const active = item === selectedFrequency;

                  return (
                    <Pressable
                      key={item}
                      style={[
                        styles.inlineChip,
                        {
                          backgroundColor: active ? hexToRgba(colors.success, 0.14) : colors.backgroundSoft,
                          borderColor: active ? colors.success : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedFrequency(item)}
                    >
                      <Text style={[styles.inlineChipText, { color: active ? colors.success : colors.text }]}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.fieldLabel, styles.sectionTop, { color: hexToRgba(colors.text, 0.56) }]}>
                Target window
              </Text>
            </>
          ) : null}
          <View style={styles.chipRow}>
            {goalDeadlineOptions.map((item) => {
              const active = item === selectedDeadline;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.inlineChip,
                    {
                      backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.backgroundSoft,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedDeadline(item);
                    setSelectedTargetDate(buildTargetDate(item));
                  }}
                >
                  <Text style={[styles.inlineChipText, { color: active ? colors.primaryDark : colors.text }]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Planner priority</Text>
          <View style={styles.priorityStack}>
            {goalPriorityOptions.map((item) => {
              const active = item.id === selectedPriority;

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.priorityCard,
                    {
                      backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPriority(item.id)}
                >
                  <Text style={[styles.priorityLabel, { color: active ? colors.primaryDark : colors.text }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.priorityBody, { color: hexToRgba(colors.text, 0.54) }]}>
                    {item.body}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {!isUsingLiveGoals ? (
            <>
              <Text style={[styles.fieldLabel, styles.sectionTop, { color: hexToRgba(colors.text, 0.56) }]}>
                Allowed risk for this goal
              </Text>
              <View style={styles.chipRow}>
                {goalRiskOptions.map((item) => {
                  const active = item.id === selectedRisk;

                  return (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.inlineChip,
                        {
                          backgroundColor: active ? hexToRgba(colors.success, 0.14) : colors.backgroundSoft,
                          borderColor: active ? colors.success : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedRisk(item.id)}
                    >
                      <Text style={[styles.inlineChipText, { color: active ? colors.success : colors.text }]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {isEditMode ? (
            <>
              <Text style={[styles.fieldLabel, styles.sectionTop, { color: hexToRgba(colors.text, 0.56) }]}>
                Goal lifecycle
              </Text>
              <View style={styles.priorityStack}>
                {goalLifecycleOptions.map((item) => {
                  const active = item.id === selectedStatus;

                  return (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.priorityCard,
                        {
                          backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                          borderColor: active ? colors.primaryDark : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedStatus(item.id)}
                    >
                      <Text style={[styles.priorityLabel, { color: active ? colors.primaryDark : colors.text }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.priorityBody, { color: hexToRgba(colors.text, 0.54) }]}>
                        {item.body}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
        </FinanceCard>

        {!isUsingLiveGoals ? (
          <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Savings account</Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(finance)/financial-goals/account',
                  params: {
                    origin: 'create',
                    accountId: activeAccount.id,
                    goalId: goal?.id,
                    mode: isEditMode ? 'edit' : 'create',
                  },
                })
              }
            >
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Change</Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.accountCard,
              { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
            ]}
          >
            <View style={[styles.accountAccent, { backgroundColor: activeAccount.accent }]} />
            <View style={styles.accountCopy}>
              <Text style={[styles.accountLabel, { color: colors.text }]}>{activeAccount.label}</Text>
              <Text style={[styles.accountMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                {activeAccount.subtitle} • {activeAccount.mask}
              </Text>
            </View>
            <Text style={[styles.accountValue, { color: colors.text }]}>
              {formatCurrency(activeAccount.balance)}
            </Text>
          </View>
        </FinanceCard>
        ) : null}

        <FinanceCard
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.card,
              borderColor: hexToRgba(colors.primaryDark, 0.1),
            },
          ]}
        >
          <Text style={[styles.previewEyebrow, { color: colors.primaryDark }]}>Goal preview</Text>
          <Text style={[styles.previewTitle, { color: colors.text }]}>{previewTitle}</Text>
          <Text style={[styles.previewValue, { color: colors.text }]}>
            {formatCurrency(selectedTarget)}
          </Text>
          <Text style={[styles.previewBody, { color: hexToRgba(colors.text, 0.56) }]}>
            {isUsingLiveGoals
              ? `This goal will be saved with a ${selectedPriority.toLowerCase()} priority and a ${selectedDeadline.toLowerCase()} target window.`
              : `Saving ${formatCurrency(selectedContribution)} on a ${selectedFrequency.toLowerCase()} cadence will give this goal a visible funding rhythm in about ${projectedMonths} months.`}
          </Text>

          <View style={styles.previewMetaGrid}>
            <View style={[styles.previewMetaCard, { backgroundColor: colors.backgroundSoft }]}>
              <Text style={[styles.previewMetaValue, { color: colors.success }]}>
                {selectedPriority}
              </Text>
              <Text style={[styles.previewMetaLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                priority level
              </Text>
            </View>
            {!isUsingLiveGoals ? (
              <View style={[styles.previewMetaCard, { backgroundColor: colors.backgroundSoft }]}>
                <Text style={[styles.previewMetaValue, { color: colors.primaryDark }]}>
                  {selectedRisk}
                </Text>
                <Text style={[styles.previewMetaLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                  allowed risk
                </Text>
              </View>
            ) : null}
            {isEditMode ? (
              <View style={[styles.previewMetaCard, { backgroundColor: colors.backgroundSoft }]}>
                <Text style={[styles.previewMetaValue, { color: colors.warning }]}>
                  {selectedStatus[0].toUpperCase() + selectedStatus.slice(1)}
                </Text>
                <Text style={[styles.previewMetaLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                  lifecycle
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.previewExplainCard,
              {
                backgroundColor: hexToRgba(colors.primaryDark, 0.06),
                borderColor: hexToRgba(colors.primaryDark, 0.1),
              },
            ]}
          >
            <Text style={[styles.previewExplainTitle, { color: colors.text }]}>
              Planner interpretation
            </Text>
            <Text style={[styles.previewExplainBody, { color: hexToRgba(colors.text, 0.56) }]}>
              {isUsingLiveGoals
                ? `GoalWealth will save the core record for this draft: type, target, target date, priority, current progress and description. Current gap: ${formatCurrency(estimatedFundingGap)} by ${previewDeadlineLabel}.`
                : `A ${selectedPriority.toLowerCase()} priority goal with ${selectedRisk.toLowerCase()} risk will compete for about ${formatCurrency(selectedContribution)}/month. Estimated funding gap after current savings: ${formatCurrency(estimatedFundingGap)}.`}
            </Text>
            {isEditMode ? (
              <Text
                style={[
                  styles.previewExplainBody,
                  styles.previewLifecycleNote,
                  { color: hexToRgba(colors.text, 0.56) },
                ]}
              >
                {getGoalLifecycleDescription(selectedStatus)}
              </Text>
            ) : null}
          </View>
        </FinanceCard>

        <View style={styles.actionRow}>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title={isEditMode ? 'Cancel' : 'Back'}
              onPress={() => router.replace(backHref)}
              colorBackground={colors.card}
              colorText={colors.text}
              style={[styles.actionButton, { borderWidth: 1, borderColor: colors.border }]}
            />
          </View>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title={
                isSaving
                  ? 'Saving...'
                  : isEditMode
                    ? 'Update Goal'
                    : 'Save Goal'
              }
              onPress={() => {
                void handleSaveGoal();
              }}
              colorBackground={colors.primaryDark}
              colorText={colors.card}
              disabled={isSaving}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  contentStyle: {
    paddingBottom: 28,
  },
  stack: {
    marginTop: 18,
    gap: 16,
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
  headerCard: {
    borderWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  headerTopCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerTitle: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  headerBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  headerBadge: {
    minWidth: 86,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerBadgeValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerBadgeLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTop: {
    marginTop: 18,
  },
  templateGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  templateBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  chipRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  valueChip: {
    minWidth: 92,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  fieldLabel: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inlineChip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  priorityStack: {
    marginTop: 16,
    gap: 12,
  },
  priorityCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  priorityBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
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
    height: 42,
    borderRadius: 999,
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
  },
  accountLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  accountMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  previewCard: {
    borderWidth: 1,
  },
  previewEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  previewTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
  },
  previewValue: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  previewBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  previewMetaGrid: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  previewMetaCard: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  previewMetaValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  previewMetaLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  previewExplainCard: {
    marginTop: 16,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  previewExplainTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  previewExplainBody: {
    marginTop: 6,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  previewLifecycleNote: {
    marginTop: 10,
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
});
