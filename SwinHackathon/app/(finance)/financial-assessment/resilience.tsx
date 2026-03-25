import { hexToRgba } from '@/components/auth/AuthKit';
import {
  emergencyFundOptions,
  financeSituationOptions,
  spendingBehaviourScale,
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

const retirementAgeOptions = [65, 66, 67, 68, 69] as const;

export default function FinancialAssessmentResilienceScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const {
    state,
    setRetirementAge,
    setDependentCount,
    setFinanceSituationId,
    setEmergencyFundId,
    setEmergencyFundMonths,
    setSpendingBehaviourScore,
  } = useFinancialAssessment();
  const activeBehaviour = spendingBehaviourScale.find(
    (item) => item.score === state.spendingBehaviourScore
  );
  const monthsEditable = state.emergencyFundId === 'yes';
  const isReady = Boolean(
    state.financeSituationId && state.emergencyFundId && state.spendingBehaviourScore
  );

  const handleEmergencySelection = (value: string) => {
    setEmergencyFundId(value);

    if (value === 'no') {
      setEmergencyFundMonths(0);
    } else if (state.emergencyFundMonths === 0) {
      setEmergencyFundMonths(3);
    }
  };

  return (
    <AssessmentShell
      step={4}
      totalSteps={5}
      eyebrow="Section 4 of 5"
      title="Measure resilience, safety and spending discipline."
      body="The Figma board spreads these prompts across several screens. Grouping them here makes the risk picture much easier to understand in one pass."
      scrollable
      footer={
        <AssessmentPrimaryButton
          label="Continue to commitment"
          disabled={!isReady}
          onPress={() => router.push('/(finance)/financial-assessment/commitment')}
        />
      }
    >
      <View style={[styles.heroCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroLabel, { color: colors.primaryDark }]}>Resilience profile</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Retire at {state.retirementAge}, support {state.dependentCount} dependents
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.6) }]}>
            Emergency buffer: {state.emergencyFundId === 'yes' ? `${state.emergencyFundMonths} months` : 'not built yet'}
          </Text>
        </View>
        <View style={[styles.heroIconWrap, { backgroundColor: colors.card }]}>
          <MaterialIcons name="shield" size={28} color={colors.primaryDark} />
        </View>
      </View>

      <AssessmentSectionCard
        title="Future planning and household"
        body="Retirement age and dependents are closely related, so they work better on the same screen."
      >
        <View style={styles.ageRow}>
          {retirementAgeOptions.map((age) => {
            const active = age === state.retirementAge;

            return (
              <Pressable
                key={age}
                style={[
                  styles.ageChip,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.1) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setRetirementAge(age)}
              >
                <Text style={[styles.ageValue, { color: active ? colors.primaryDark : colors.text }]}>
                  {age}
                </Text>
                <Text
                  style={[
                    styles.ageLabel,
                    { color: active ? colors.primaryDark : hexToRgba(colors.text, 0.5) },
                  ]}
                >
                  age
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.counterCard,
            { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.counterLabel, { color: hexToRgba(colors.text, 0.5) }]}>
            Financial dependents
          </Text>
          <Text style={[styles.counterValue, { color: colors.text }]}>{state.dependentCount}</Text>
          <View style={styles.counterActions}>
            <Pressable
              style={[
                styles.counterButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setDependentCount(state.dependentCount - 1)}
            >
              <MaterialIcons name="remove" size={20} color={colors.text} />
            </Pressable>
            <Pressable
              style={[
                styles.counterButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setDependentCount(state.dependentCount + 1)}
            >
              <MaterialIcons name="add" size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="How do you feel right now?"
        body="This softer signal helps Finpal interpret the hard numbers with the right level of urgency."
      >
        <View style={styles.situationRow}>
          {financeSituationOptions.map((item) => {
            const active = state.financeSituationId === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.situationCard,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setFinanceSituationId(item.id)}
              >
                <Text style={styles.situationEmoji}>{item.emoji}</Text>
                <Text
                  style={[
                    styles.situationLabel,
                    { color: active ? colors.primaryDark : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.situationHelper,
                    {
                      color: active
                        ? hexToRgba(colors.primaryDark, 0.84)
                        : hexToRgba(colors.text, 0.54),
                    },
                  ]}
                >
                  {item.helper}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="Emergency readiness"
        body="We keep the yes or no decision and the month counter in the same place so the buffer story is clearer."
      >
        <View style={styles.fundStack}>
          {emergencyFundOptions.map((item) => {
            const active = state.emergencyFundId === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.fundCard,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => handleEmergencySelection(item.id)}
              >
                <View
                  style={[
                    styles.fundIcon,
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
                <View style={styles.fundCopy}>
                  <Text style={[styles.fundLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.fundHelper, { color: hexToRgba(colors.text, 0.54) }]}>
                    {item.helper}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.coverageCard,
            {
              backgroundColor: monthsEditable ? colors.backgroundSoft : hexToRgba(colors.text, 0.04),
              borderColor: colors.border,
              opacity: monthsEditable ? 1 : 0.7,
            },
          ]}
        >
          <Text style={[styles.coverageLabel, { color: hexToRgba(colors.text, 0.5) }]}>
            Emergency coverage
          </Text>
          <Text style={[styles.coverageValue, { color: colors.primaryDark }]}>
            {state.emergencyFundMonths}
          </Text>
          <Text style={[styles.coverageMeta, { color: hexToRgba(colors.text, 0.56) }]}>
            months of essentials
          </Text>

          <View style={styles.counterActions}>
            <Pressable
              style={[
                styles.counterButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: monthsEditable ? 1 : 0.45,
                },
              ]}
              onPress={() =>
                monthsEditable
                  ? setEmergencyFundMonths(state.emergencyFundMonths - 1)
                  : undefined
              }
              disabled={!monthsEditable}
            >
              <MaterialIcons name="remove" size={20} color={colors.text} />
            </Pressable>
            <Pressable
              style={[
                styles.counterButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: monthsEditable ? 1 : 0.45,
                },
              ]}
              onPress={() =>
                monthsEditable
                  ? setEmergencyFundMonths(state.emergencyFundMonths + 1)
                  : undefined
              }
              disabled={!monthsEditable}
            >
              <MaterialIcons name="add" size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="Typical spending behaviour"
        body="The visual scale from the kit works well as a compact score selector."
      >
        <View style={styles.behaviourRow}>
          {spendingBehaviourScale.map((item) => {
            const active = item.score === state.spendingBehaviourScore;

            return (
              <Pressable
                key={item.score}
                style={[
                  styles.behaviourCard,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.1) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setSpendingBehaviourScore(item.score)}
              >
                <Text
                  style={[
                    styles.behaviourValue,
                    { color: active ? colors.primaryDark : colors.text },
                  ]}
                >
                  {item.score}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.behaviourSummary,
            { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.behaviourTitle, { color: colors.text }]}>
            {activeBehaviour?.label || 'Choose a score'}
          </Text>
          <Text style={[styles.behaviourBody, { color: hexToRgba(colors.text, 0.56) }]}>
            {activeBehaviour
              ? `Score ${activeBehaviour.score} helps Finpal decide how strict savings nudges and overspending warnings should feel.`
              : 'Pick the score that is closest to your real spending pattern.'}
          </Text>
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
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    heroTitle: {
      marginTop: 6,
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    heroBody: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '500',
    },
    heroIconWrap: {
      width: 74,
      height: 74,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    ageChip: {
      flex: 1,
      minHeight: 78,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    ageValue: {
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.8,
    },
    ageLabel: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    counterCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 18,
      alignItems: 'center',
    },
    counterLabel: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    counterValue: {
      marginTop: 12,
      fontSize: 42,
      fontWeight: '900',
      letterSpacing: -1.1,
    },
    counterActions: {
      marginTop: 16,
      flexDirection: 'row',
      gap: 14,
    },
    counterButton: {
      width: 44,
      height: 44,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    situationRow: {
      flexDirection: 'row',
      gap: 12,
    },
    situationCard: {
      flex: 1,
      minHeight: 154,
      borderRadius: 24,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    situationEmoji: {
      fontSize: 34,
    },
    situationLabel: {
      marginTop: 10,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '800',
      textAlign: 'center',
    },
    situationHelper: {
      marginTop: 6,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    fundStack: {
      gap: 12,
    },
    fundCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    fundIcon: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fundCopy: {
      flex: 1,
      minWidth: 0,
    },
    fundLabel: {
      fontSize: 14,
      fontWeight: '800',
    },
    fundHelper: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    coverageCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 18,
      alignItems: 'center',
    },
    coverageLabel: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    coverageValue: {
      marginTop: 12,
      fontSize: 40,
      fontWeight: '900',
      letterSpacing: -1.1,
    },
    coverageMeta: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '600',
    },
    behaviourRow: {
      flexDirection: 'row',
      gap: 10,
    },
    behaviourCard: {
      flex: 1,
      minHeight: 88,
      borderRadius: 24,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    behaviourValue: {
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.8,
    },
    behaviourSummary: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 16,
    },
    behaviourTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    behaviourBody: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
  });
}
