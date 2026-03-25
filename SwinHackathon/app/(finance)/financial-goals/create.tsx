import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  contributionPresets,
  getFinancialGoalById,
  getGoalAccountById,
  goalDeadlineOptions,
  goalFrequencyOptions,
  goalPriorityOptions,
  goalRiskOptions,
  goalTemplates,
  targetPresets,
} from '@/components/financial-goals/data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function CreateFinancialGoalScreen() {
  const { colors } = useTheme();
  const { isSmallPhone } = useResponsive();
  const router = useRouter();
  const params = useLocalSearchParams<{
    goalId?: string;
    accountId?: string;
    mode?: 'create' | 'edit';
  }>();
  const goal = getFinancialGoalById(params.goalId);
  const isEditMode = params.mode === 'edit' || Boolean(params.goalId);
  const activeAccount = getGoalAccountById(params.accountId ?? goal.accountId);

  const templateFallback =
    goalTemplates.find((item) => item.label.toLowerCase().includes(goal.title.toLowerCase().split(' ')[0])) ??
    goalTemplates[0];

  const [selectedTemplate, setSelectedTemplate] = useState(templateFallback.id);
  const [selectedTarget, setSelectedTarget] = useState<number>(goal.target);
  const [selectedContribution, setSelectedContribution] = useState<number>(goal.monthlyContribution);
  const [selectedFrequency, setSelectedFrequency] = useState<typeof goalFrequencyOptions[number]>(
    goalFrequencyOptions[2]
  );
  const [selectedPriority, setSelectedPriority] = useState(goal.priority);
  const [selectedRisk, setSelectedRisk] = useState(goal.allowedRisk);
  const [selectedDeadline, setSelectedDeadline] = useState<typeof goalDeadlineOptions[number]>(
    goalDeadlineOptions[1]
  );

  const selectedTemplateMeta =
    goalTemplates.find((item) => item.id === selectedTemplate) ?? goalTemplates[0];
  const projectedMonths = Math.max(1, Math.ceil(selectedTarget / Math.max(selectedContribution, 1)));
  const estimatedFundingGap = Math.max(selectedTarget - goal.saved, 0);
  const previewTitle = isEditMode ? goal.title : selectedTemplateMeta.label;

  return (
    <FinanceScreen
      title={isEditMode ? 'Edit Goal' : 'Create Goal'}
      subtitle="Set the target, contribution rhythm and savings account in one screen."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
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
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {previewTitle}
              </Text>
              <Text style={[styles.headerBody, { color: hexToRgba(colors.text, 0.56) }]}>
                This screen keeps the full planning context together: amount, cadence, priority,
                allowed risk, account selection and planner preview before saving.
              </Text>
            </View>

            <View style={[styles.headerBadge, { backgroundColor: colors.card }]}>
              <Text style={[styles.headerBadgeValue, { color: colors.text }]}>
                {formatCurrency(selectedContribution)}
              </Text>
              <Text style={[styles.headerBadgeLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                monthly
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
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transfer setup</Text>

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
                  onPress={() => setSelectedDeadline(item)}
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
        </FinanceCard>

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
                    goalId: goal.id,
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
            Saving {formatCurrency(selectedContribution)} on a {selectedFrequency.toLowerCase()} cadence
            will give this goal a visible funding rhythm in about {projectedMonths} months.
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
            <View style={[styles.previewMetaCard, { backgroundColor: colors.backgroundSoft }]}>
              <Text style={[styles.previewMetaValue, { color: colors.primaryDark }]}>
                {selectedRisk}
              </Text>
              <Text style={[styles.previewMetaLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                allowed risk
              </Text>
            </View>
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
              A {selectedPriority.toLowerCase()} priority goal with {selectedRisk.toLowerCase()} risk will
              compete for about {formatCurrency(selectedContribution)}/month. Estimated funding gap after
              current savings: {formatCurrency(estimatedFundingGap)}.
            </Text>
          </View>
        </FinanceCard>

        <View style={styles.actionRow}>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title={isEditMode ? 'Cancel' : 'Back'}
              onPress={() => router.back()}
              colorBackground={colors.card}
              colorText={colors.text}
              style={[styles.actionButton, { borderWidth: 1, borderColor: colors.border }]}
            />
          </View>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title={isEditMode ? 'Update Goal' : 'Save Goal'}
              onPress={() =>
                router.push({
                  pathname: '/(finance)/financial-goals/result',
                  params: {
                    mode: isEditMode ? 'updated' : 'created',
                    goalId: goal.id,
                    accountId: activeAccount.id,
                  },
                })
              }
              colorBackground={colors.primaryDark}
              colorText={colors.card}
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
    fontSize: 13,
    fontWeight: '800',
  },
  previewExplainBody: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
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
