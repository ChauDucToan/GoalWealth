import { hexToRgba } from '@/components/auth/AuthKit';
import {
  expenseTrackingOptions,
  financialGoalOptions,
  goalDeadlineOptions,
  outstandingDebtPresets,
  spendingCategoryOptions,
} from '@/components/financial-assessment/data';
import {
  AssessmentPrimaryButton,
  AssessmentSectionCard,
  AssessmentShell,
} from '@/components/financial-assessment/shared';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function FinancialAssessmentPlanningScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const {
    state,
    toggleSpendingCategoryId,
    setOutstandingDebt,
    setFinancialGoalId,
    setGoalDeadlineLabel,
    setExpenseTrackingId,
  } = useFinancialAssessment();
  const isReady = Boolean(
    state.spendingCategoryIds.length > 0 &&
      state.financialGoalId &&
      state.goalDeadlineLabel &&
      state.expenseTrackingId
  );

  return (
    <AssessmentShell
      step={3}
      totalSteps={5}
      eyebrow="Section 3 of 5"
      title="Map where your money goes and what it should do next."
      body="This condensed screen keeps spending, debt, goals and tracking habits together. The original board split them into five separate screens."
      scrollable
      footer={
        <AssessmentPrimaryButton
          label="Continue to resilience"
          disabled={!isReady}
          onPress={() => router.push('/(finance)/financial-assessment/resilience')}
        />
      }
    >
      <View style={[styles.heroCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroLabel, { color: colors.primaryDark }]}>Planning block</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {state.spendingCategoryIds.length || 0} spending zones selected
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.6) }]}>
            Goal: {financialGoalOptions.find((item) => item.id === state.financialGoalId)?.label || 'not selected yet'}
          </Text>
        </View>
        <View style={[styles.heroBadge, { backgroundColor: colors.card }]}>
          <Text style={[styles.heroBadgeValue, { color: colors.primaryDark }]}>
            ${state.outstandingDebt.toLocaleString()}
          </Text>
          <Text style={[styles.heroBadgeLabel, { color: hexToRgba(colors.text, 0.55) }]}>
            debt
          </Text>
        </View>
      </View>

      <AssessmentSectionCard
        title="Top spending categories"
        body="Choose up to three categories that usually carry the most pressure."
      >
        <View style={styles.categoryGrid}>
          {spendingCategoryOptions.map((item) => {
            const active = state.spendingCategoryIds.includes(item.id);

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => toggleSpendingCategoryId(item.id)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor: active
                        ? hexToRgba(colors.primaryDark, 0.12)
                        : colors.backgroundSoft,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={active ? colors.primaryDark : hexToRgba(colors.text, 0.55)}
                  />
                </View>
                <Text style={[styles.categoryLabel, { color: colors.text }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.sectionNote, { color: hexToRgba(colors.text, 0.5) }]}>
          {state.spendingCategoryIds.length}/3 categories selected
        </Text>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="Outstanding debt"
        body="A rough number is enough here. Presets help keep this fast."
      >
        <View
          style={[
            styles.amountCard,
            { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.amountLabel, { color: hexToRgba(colors.text, 0.5) }]}>
            Outstanding debt
          </Text>
          <Text style={[styles.amountValue, { color: colors.primaryDark }]}>
            ${state.outstandingDebt.toLocaleString()}
          </Text>
          <View style={styles.stepperRow}>
            <Pressable
              style={[
                styles.stepButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setOutstandingDebt(state.outstandingDebt - 500)}
            >
              <MaterialIcons name="remove" size={20} color={colors.text} />
            </Pressable>
            <Text style={[styles.stepText, { color: colors.text }]}>Adjust by $500</Text>
            <Pressable
              style={[
                styles.stepButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setOutstandingDebt(state.outstandingDebt + 500)}
            >
              <MaterialIcons name="add" size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.presetWrap}>
          {outstandingDebtPresets.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.presetChip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setOutstandingDebt(item)}
            >
              <Text style={[styles.presetText, { color: colors.text }]}>
                ${item.toLocaleString()}
              </Text>
            </Pressable>
          ))}
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="Goal and timeline"
        body="The kit shows separate goal and deadline screens. Keeping them together makes the choice more coherent."
      >
        <View style={styles.goalStack}>
          {financialGoalOptions.map((item) => {
            const active = state.financialGoalId === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setFinancialGoalId(item.id)}
              >
                <View
                  style={[
                    styles.goalIcon,
                    {
                      backgroundColor: active
                        ? hexToRgba(colors.primaryDark, 0.12)
                        : colors.backgroundSoft,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={active ? colors.primaryDark : hexToRgba(colors.text, 0.55)}
                  />
                </View>
                <View style={styles.goalCopy}>
                  <Text style={[styles.goalLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.goalHelper, { color: hexToRgba(colors.text, 0.54) }]}>
                    {item.helper}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.deadlineWrap}>
          {goalDeadlineOptions.map((item) => {
            const active = state.goalDeadlineLabel === item;

            return (
              <Pressable
                key={item}
                style={[
                  styles.deadlineChip,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.backgroundSoft,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setGoalDeadlineLabel(item)}
              >
                <MaterialIcons
                  name="event"
                  size={16}
                  color={active ? colors.primaryDark : hexToRgba(colors.text, 0.55)}
                />
                <Text
                  style={[
                    styles.deadlineText,
                    { color: active ? colors.primaryDark : colors.text },
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="Current expense tracking"
        body="This decides whether Finpal should behave like a tracker, a cleanup layer or a habit builder."
      >
        <View style={styles.trackingStack}>
          {expenseTrackingOptions.map((item) => {
            const active = state.expenseTrackingId === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.trackingCard,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setExpenseTrackingId(item.id)}
              >
                <View
                  style={[
                    styles.trackingIcon,
                    {
                      backgroundColor: active
                        ? hexToRgba(colors.primaryDark, 0.12)
                        : colors.backgroundSoft,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={active ? colors.primaryDark : hexToRgba(colors.text, 0.55)}
                  />
                </View>
                <View style={styles.trackingCopy}>
                  <Text style={[styles.trackingLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.trackingHelper, { color: hexToRgba(colors.text, 0.54) }]}>
                    {item.helper}
                  </Text>
                </View>
                <View
                  style={[
                    styles.trackingCheck,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.card,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                >
                  {active ? <MaterialIcons name="check" size={15} color={colors.card} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </AssessmentSectionCard>
    </AssessmentShell>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    heroCard: {
      borderRadius: 28,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    heroCopy: {
      flex: 1,
      minWidth: 0,
    },
    heroLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    heroTitle: {
      marginTop: 6,
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.6,
    },
    heroBody: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '500',
    },
    heroBadge: {
      minWidth: 90,
      borderRadius: 22,
      paddingHorizontal: 12,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBadgeValue: {
      fontSize: 18,
      fontWeight: '900',
      textAlign: 'center',
    },
    heroBadgeLabel: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    categoryChip: {
      width: '47%',
      minHeight: 86,
      borderRadius: 22,
      borderWidth: 1,
      padding: 14,
      justifyContent: 'space-between',
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryLabel: {
      marginTop: 10,
      fontSize: 13,
      fontWeight: '800',
    },
    sectionNote: {
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'center',
    },
    amountCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 18,
      alignItems: 'center',
    },
    amountLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    amountValue: {
      marginTop: 14,
      fontSize: 38,
      fontWeight: '900',
      letterSpacing: -1,
    },
    stepperRow: {
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    stepButton: {
      width: 44,
      height: 44,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepText: {
      minWidth: 120,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
    },
    presetWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    presetChip: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    presetText: {
      fontSize: 12,
      fontWeight: '700',
    },
    goalStack: {
      gap: 12,
    },
    goalCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    goalIcon: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalCopy: {
      flex: 1,
      minWidth: 0,
    },
    goalLabel: {
      fontSize: 14,
      fontWeight: '800',
    },
    goalHelper: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    deadlineWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    deadlineChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    deadlineText: {
      fontSize: 12,
      fontWeight: '700',
    },
    trackingStack: {
      gap: 12,
    },
    trackingCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    trackingIcon: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    trackingCopy: {
      flex: 1,
      minWidth: 0,
    },
    trackingLabel: {
      fontSize: 14,
      fontWeight: '800',
    },
    trackingHelper: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    trackingCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
