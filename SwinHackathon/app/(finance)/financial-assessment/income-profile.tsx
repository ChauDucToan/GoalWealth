import { hexToRgba } from '@/components/auth/AuthKit';
import {
  liquidAssetPresets,
  obligationPresets,
  incomePresets,
  incomeSourceOptions,
  payFrequencyOptions,
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

export default function FinancialAssessmentIncomeProfileScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const {
    state,
    setIncomeSourceId,
    setMonthlyIncome,
    setSavingsRate,
    setLiquidAssets,
    setMonthlyObligations,
    setPayFrequencyId,
  } = useFinancialAssessment();
  const estimatedSaved = Math.round((state.monthlyIncome * state.savingsRate) / 100);
  const isReady = Boolean(state.incomeSourceId && state.payFrequencyId);

  return (
    <AssessmentShell
      step={2}
      totalSteps={5}
      eyebrow="Section 2 of 5"
      title="Capture your income profile in one view."
      body="This screen keeps income source, cash-flow strength and pay cadence together so suitability and planning can use a cleaner financial-capacity baseline."
      scrollable
      footer={
        <AssessmentPrimaryButton
          label="Continue to planning"
          disabled={!isReady}
          onPress={() => router.push('/(finance)/financial-assessment/planning')}
        />
      }
    >
      <View style={[styles.heroCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroLabel, { color: colors.primaryDark }]}>Income snapshot</Text>
          <Text style={[styles.heroValue, { color: colors.text }]}>
            ${state.monthlyIncome.toLocaleString()}
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.6) }]}>
            About ${estimatedSaved.toLocaleString()} saved monthly at your current pace, with
            ${` ${state.liquidAssets.toLocaleString()} `}in liquid assets and
            ${` ${state.monthlyObligations.toLocaleString()} `}in monthly obligations.
          </Text>
        </View>
        <View style={[styles.heroBadge, { backgroundColor: colors.card }]}>
          <Text style={[styles.heroBadgeValue, { color: colors.primaryDark }]}>
            {state.savingsRate}%
          </Text>
          <Text style={[styles.heroBadgeLabel, { color: hexToRgba(colors.text, 0.55) }]}>
            saved
          </Text>
        </View>
      </View>

      <AssessmentSectionCard
        title="Primary income source"
        body="This mirrors the choice cards from the kit, but keeps them inside a broader income block."
      >
        <View style={styles.sourceStack}>
          {incomeSourceOptions.map((item) => {
            const active = state.incomeSourceId === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.sourceCard,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setIncomeSourceId(item.id)}
              >
                <View
                  style={[
                    styles.sourceIcon,
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
                <View style={styles.sourceCopy}>
                  <Text style={[styles.sourceLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.sourceHelper, { color: hexToRgba(colors.text, 0.54) }]}>
                    {item.helper}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="Monthly income"
        body="A rough figure is enough. Presets keep this step fast on mobile."
      >
        <View
          style={[
            styles.amountCard,
            { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.amountLabel, { color: hexToRgba(colors.text, 0.5) }]}>
            Monthly income
          </Text>
          <Text style={[styles.amountValue, { color: colors.primaryDark }]}>
            ${state.monthlyIncome.toLocaleString()}
          </Text>
          <View style={styles.stepperRow}>
            <Pressable
              style={[
                styles.stepButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setMonthlyIncome(state.monthlyIncome - 250)}
            >
              <MaterialIcons name="remove" size={20} color={colors.text} />
            </Pressable>
            <Text style={[styles.stepText, { color: colors.text }]}>Adjust by $250</Text>
            <Pressable
              style={[
                styles.stepButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setMonthlyIncome(state.monthlyIncome + 250)}
            >
              <MaterialIcons name="add" size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.presetWrap}>
          {incomePresets.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.presetChip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setMonthlyIncome(item)}
            >
              <Text style={[styles.presetText, { color: colors.text }]}>
                ${item.toLocaleString()}
              </Text>
            </Pressable>
          ))}
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="How much do you save?"
        body="The circular treatment from the kit works better here when it lives next to the income value instead of on a separate screen."
      >
        <View style={styles.savingsRow}>
          <View style={styles.ringWrap}>
            <View style={[styles.ringShell, { borderColor: hexToRgba(colors.primaryDark, 0.12) }]}>
              <View
                style={[
                  styles.ringArc,
                  {
                    borderColor: hexToRgba(colors.primaryDark, 0.2),
                    borderTopColor: colors.primaryDark,
                    borderRightColor:
                      state.savingsRate > 45 ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.2),
                  },
                ]}
              />
              <View style={[styles.ringCenter, { backgroundColor: colors.card }]}>
                <Text style={[styles.ringValue, { color: colors.text }]}>{state.savingsRate}%</Text>
                <Text style={[styles.ringCaption, { color: hexToRgba(colors.text, 0.5) }]}>
                  saved
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.savingsMeta}>
            <Text style={[styles.metaTitle, { color: colors.text }]}>Estimated monthly buffer</Text>
            <Text style={[styles.metaValue, { color: colors.primaryDark }]}>
              ${estimatedSaved.toLocaleString()}
            </Text>
            <Text style={[styles.metaBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Finpal uses this to tune how aggressive savings nudges should be.
            </Text>

            <View style={styles.savingsControls}>
              <Pressable
                style={[
                  styles.stepButton,
                  { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
                ]}
                onPress={() => setSavingsRate(state.savingsRate - 1)}
              >
                <MaterialIcons name="remove" size={20} color={colors.text} />
              </Pressable>
              <Pressable
                style={[
                  styles.stepButton,
                  { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
                ]}
                onPress={() => setSavingsRate(state.savingsRate + 1)}
              >
                <MaterialIcons name="add" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="Liquidity and obligations"
        body="These figures strengthen the financial-capacity side of the assessment and later influence suitability checks."
      >
        <View style={styles.dualMetricGrid}>
          <View
            style={[
              styles.amountCard,
              { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.amountLabel, { color: hexToRgba(colors.text, 0.5) }]}>
              Liquid assets
            </Text>
            <Text style={[styles.amountValue, { color: colors.primaryDark }]}>
              ${state.liquidAssets.toLocaleString()}
            </Text>
            <View style={styles.presetWrap}>
              {liquidAssetPresets.map((item) => (
                <Pressable
                  key={item}
                  style={[
                    styles.presetChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => setLiquidAssets(item)}
                >
                  <Text style={[styles.presetText, { color: colors.text }]}>
                    ${item.toLocaleString()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.amountCard,
              { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.amountLabel, { color: hexToRgba(colors.text, 0.5) }]}>
              Monthly obligations
            </Text>
            <Text style={[styles.amountValue, { color: colors.warning }]}>
              ${state.monthlyObligations.toLocaleString()}
            </Text>
            <View style={styles.presetWrap}>
              {obligationPresets.map((item) => (
                <Pressable
                  key={item}
                  style={[
                    styles.presetChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => setMonthlyObligations(item)}
                >
                  <Text style={[styles.presetText, { color: colors.text }]}>
                    ${item.toLocaleString()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="How often do you get paid?"
        body="This cadence shapes budget pacing, reminders and emergency-fund targets."
      >
        <View style={styles.frequencyGrid}>
          {payFrequencyOptions.map((item) => {
            const active = state.payFrequencyId === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.frequencyCard,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setPayFrequencyId(item.id)}
              >
                <Text style={[styles.frequencyLabel, { color: active ? colors.primaryDark : colors.text }]}>
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.frequencyHelper,
                    { color: active ? hexToRgba(colors.primaryDark, 0.86) : hexToRgba(colors.text, 0.54) },
                  ]}
                >
                  {item.helper}
                </Text>
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
    heroValue: {
      marginTop: 6,
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.8,
    },
    heroBody: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '500',
    },
    heroBadge: {
      width: 86,
      height: 86,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBadgeValue: {
      fontSize: 24,
      fontWeight: '900',
    },
    heroBadgeLabel: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sourceStack: {
      gap: 12,
    },
    sourceCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    sourceIcon: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sourceCopy: {
      flex: 1,
      minWidth: 0,
    },
    sourceLabel: {
      fontSize: 14,
      fontWeight: '800',
    },
    sourceHelper: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
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
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    amountValue: {
      marginTop: 14,
      fontSize: 40,
      fontWeight: '900',
      letterSpacing: -1.1,
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
      minWidth: 112,
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
    savingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    ringWrap: {
      width: 156,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringShell: {
      width: 156,
      height: 156,
      borderRadius: 78,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringArc: {
      position: 'absolute',
      width: 156,
      height: 156,
      borderRadius: 78,
      borderWidth: 16,
      transform: [{ rotate: '18deg' }],
    },
    ringCenter: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringValue: {
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.8,
    },
    ringCaption: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    savingsMeta: {
      flex: 1,
      minWidth: 0,
      gap: 6,
    },
    metaTitle: {
      fontSize: 13,
      fontWeight: '800',
    },
    metaValue: {
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.6,
    },
    metaBody: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    savingsControls: {
      marginTop: 6,
      flexDirection: 'row',
      gap: 10,
    },
    dualMetricGrid: {
      gap: 12,
    },
    frequencyGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    frequencyCard: {
      width: '47%',
      minHeight: 88,
      borderRadius: 22,
      borderWidth: 1,
      padding: 14,
      justifyContent: 'space-between',
    },
    frequencyLabel: {
      fontSize: 14,
      fontWeight: '800',
    },
    frequencyHelper: {
      marginTop: 8,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '500',
    },
  });
}
