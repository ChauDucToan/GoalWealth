import { hexToRgba } from '@/components/auth/AuthKit';
import {
  assessmentFlowBlocks,
  assessmentOutputHighlights,
  biggestChallengeOptions,
  buildAssessmentResult,
  financialGoalOptions,
  financeSituationOptions,
  incomeSourceOptions,
  payFrequencyOptions,
} from '@/components/financial-assessment/data';
import { Typography } from '@/constants/theme';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FinancialAssessmentEntryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const pushRoute = (route: string) => router.push(route as never);
  const { state, restartFirstChunk } = useFinancialAssessment();
  const result = buildAssessmentResult(state);

  const sectionCompletion = {
    essentials: Boolean(state.fullName.trim() && state.purposeId && state.occupation.trim()),
    income: Boolean(state.incomeSourceId && state.payFrequencyId),
    planning: Boolean(
      state.spendingCategoryIds.length > 0 &&
        state.financialGoalId &&
        state.goalDeadlineLabel &&
        state.expenseTrackingId
    ),
    resilience: Boolean(
      state.financeSituationId && state.emergencyFundId && state.spendingBehaviourScore
    ),
    commitment: Boolean(state.isFourthChunkComplete),
  } as const;

  const completedBlocks = assessmentFlowBlocks.filter((item) => sectionCompletion[item.id]).length;
  const nextBlock = assessmentFlowBlocks.find((item) => !sectionCompletion[item.id]);
  const nextRoute = nextBlock?.route ?? '/(finance)/financial-assessment/essentials';
  const primaryLabel = nextBlock
    ? completedBlocks === 0
      ? 'Start assessment'
      : `Continue with ${nextBlock.label}`
    : 'Review condensed flow';

  const incomeSourceLabel =
    incomeSourceOptions.find((item) => item.id === state.incomeSourceId)?.label ?? 'Income pending';
  const payFrequencyLabel =
    payFrequencyOptions.find((item) => item.id === state.payFrequencyId)?.label ?? 'Pay cycle pending';
  const goalLabel =
    financialGoalOptions.find((item) => item.id === state.financialGoalId)?.label ?? 'Goal pending';
  const situationLabel =
    financeSituationOptions.find((item) => item.id === state.financeSituationId)?.label ??
    'Situation pending';
  const challengeLabel =
    biggestChallengeOptions.find((item) => item.id === state.biggestChallengeId)?.label ??
    'Challenge pending';

  const sectionSummary = {
    essentials: state.fullName.trim()
      ? `${state.fullName} • ${state.occupation || 'occupation pending'}`
      : 'Name, work context and purpose',
    income: `${incomeSourceLabel} • ${payFrequencyLabel} • $${state.monthlyObligations.toLocaleString()} obligations`,
    planning: `${state.spendingCategoryIds.length || 0} categories • ${goalLabel}`,
    resilience:
      state.emergencyFundId === 'yes'
        ? `${situationLabel} • ${state.emergencyFundMonths} months covered`
        : `${situationLabel} • emergency fund pending`,
    commitment: challengeLabel,
  } as const;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>
              COMPREHENSIVE ASSESSMENT
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Dynamic assessment with outputs the advisor can actually use.
            </Text>
            <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
              GoalWealth uses this flow to combine risk tolerance, financial capacity, behavioural signals and data quality before surfacing planning or portfolio recommendations.
            </Text>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: colors.card }]}>
            <Text style={[styles.heroBadgeValue, { color: colors.primaryDark }]}>
              {completedBlocks}/{assessmentFlowBlocks.length}
            </Text>
            <Text style={[styles.heroBadgeLabel, { color: hexToRgba(colors.text, 0.55) }]}>
              blocks ready
            </Text>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{result.riskTolerance.label}</Text>
              <Text style={[styles.statLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                current risk mode
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{result.goalReadiness.readinessScore}</Text>
              <Text style={[styles.statLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                readiness score
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{result.suitability.status}</Text>
              <Text style={[styles.statLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                suitability
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionList}>
          {assessmentFlowBlocks.map((item) => {
            const completed = sectionCompletion[item.id];

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: completed ? hexToRgba(colors.primaryDark, 0.24) : colors.border,
                  },
                ]}
                onPress={() => pushRoute(item.route)}
              >
                <View
                  style={[
                    styles.sectionIconWrap,
                    {
                      backgroundColor: completed
                        ? hexToRgba(colors.primaryDark, 0.12)
                        : colors.backgroundSoft,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={completed ? 'check-circle' : item.icon}
                    size={22}
                    color={completed ? colors.primaryDark : hexToRgba(colors.text, 0.56)}
                  />
                </View>

                <View style={styles.sectionCopy}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{item.label}</Text>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: completed
                            ? hexToRgba(colors.primaryDark, 0.08)
                            : colors.backgroundSoft,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: completed ? colors.primaryDark : hexToRgba(colors.text, 0.56) },
                        ]}
                      >
                        {completed ? 'Ready' : `${item.stepCount} prompts`}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.sectionHelper, { color: hexToRgba(colors.text, 0.54) }]}>
                    {item.helper}
                  </Text>
                  <Text style={[styles.sectionSummary, { color: colors.text }]}>
                    {sectionSummary[item.id]}
                  </Text>
                </View>

                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={hexToRgba(colors.text, 0.34)}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.outputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.outputTitle, { color: colors.text }]}>Assessment output</Text>
            <Text style={[styles.outputMeta, { color: colors.primaryDark }]}>
              {result.suitability.title}
            </Text>
          </View>

          <Text style={[styles.outputBody, { color: hexToRgba(colors.text, 0.58) }]}>
            {result.riskTolerance.body}
          </Text>

          <View style={styles.highlightGrid}>
            {assessmentOutputHighlights.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.highlightCard,
                  { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
                ]}
              >
                <View style={[styles.highlightIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.12) }]}>
                  <MaterialIcons name={item.icon} size={18} color={colors.primaryDark} />
                </View>
                <Text style={[styles.highlightTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.highlightBody, { color: hexToRgba(colors.text, 0.54) }]}>
                  {item.body}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.guardrailCard,
              {
                backgroundColor:
                  result.suitability.status === 'blocked'
                    ? hexToRgba(colors.error, 0.08)
                    : result.suitability.status === 'caution'
                      ? hexToRgba(colors.warning, 0.08)
                      : hexToRgba(colors.success, 0.08),
              },
            ]}
          >
            <Text style={[styles.guardrailTitle, { color: colors.text }]}>
              {result.suitability.title}
            </Text>
            <Text style={[styles.guardrailBody, { color: hexToRgba(colors.text, 0.56) }]}>
              {result.suitability.body}
            </Text>
            <Text style={[styles.guardrailMeta, { color: colors.primaryDark }]}>
              {result.ocr.title} • {result.ocr.fieldsDetected} detected fields
            </Text>
          </View>

          <View style={styles.resultActionStack}>
            {result.nextActions.map((action) => (
              <Pressable
                key={action.id}
                style={[
                  styles.resultAction,
                  { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
                ]}
                onPress={() => action.route && pushRoute(action.route)}
              >
                <View style={styles.resultActionCopy}>
                  <Text style={[styles.resultActionTitle, { color: colors.text }]}>
                    {action.label}
                  </Text>
                  <Text style={[styles.resultActionBody, { color: hexToRgba(colors.text, 0.54) }]}>
                    {action.body}
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-forward"
                  size={18}
                  color={colors.primaryDark}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.actionGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => pushRoute(nextRoute)}
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>{primaryLabel}</Text>
          </Pressable>

          {completedBlocks > 0 ? (
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}
              onPress={restartFirstChunk}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Reset answers</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 28,
      gap: 16,
    },
    heroCard: {
      borderRadius: 30,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    heroCopy: {
      flex: 1,
      minWidth: 0,
    },
    eyebrow: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    title: {
      marginTop: 10,
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '900',
      letterSpacing: -0.7,
    },
    body: {
      marginTop: 10,
      fontSize: Typography.body,
      lineHeight: 21,
    },
    heroBadge: {
      width: 110,
      height: 110,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    heroBadgeValue: {
      fontSize: 26,
      fontWeight: '900',
      letterSpacing: -0.8,
      textAlign: 'center',
    },
    heroBadgeLabel: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    statsCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 16,
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 0,
    },
    statDivider: {
      width: 1,
      height: 38,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '900',
    },
    statLabel: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '700',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionList: {
      gap: 12,
    },
    outputCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 16,
      gap: 14,
    },
    outputTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
    outputMeta: {
      fontSize: 12,
      fontWeight: '800',
    },
    outputBody: {
      fontSize: Typography.body,
      lineHeight: 20,
    },
    highlightGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    highlightCard: {
      flexGrow: 1,
      minWidth: 150,
      borderRadius: 18,
      borderWidth: 1,
      padding: 14,
      gap: 8,
    },
    highlightIcon: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    highlightTitle: {
      fontSize: 13,
      fontWeight: '800',
    },
    highlightBody: {
      fontSize: 12,
      lineHeight: 18,
    },
    guardrailCard: {
      borderRadius: 18,
      padding: 14,
      gap: 6,
    },
    guardrailTitle: {
      fontSize: 13,
      fontWeight: '800',
    },
    guardrailBody: {
      fontSize: 12,
      lineHeight: 18,
    },
    guardrailMeta: {
      fontSize: 11,
      fontWeight: '800',
    },
    resultActionStack: {
      gap: 10,
    },
    resultAction: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    resultActionCopy: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    resultActionTitle: {
      fontSize: 13,
      fontWeight: '800',
    },
    resultActionBody: {
      fontSize: 12,
      lineHeight: 18,
    },
    sectionCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    sectionIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionCopy: {
      flex: 1,
      minWidth: 0,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    sectionTitle: {
      flex: 1,
      minWidth: 0,
      fontSize: 15,
      fontWeight: '800',
    },
    statusPill: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    sectionHelper: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    sectionSummary: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
    },
    actionGroup: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 16,
      gap: 12,
    },
    primaryButton: {
      minHeight: 52,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
    secondaryButton: {
      minHeight: 52,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
  });
}
