import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { outstandingDebtPresets } from '@/components/financial-assessment/data';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentOutstandingDebtScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        amountCard: {
          borderRadius: 28,
          borderWidth: 1,
          padding: 22,
          backgroundColor: colors.card,
          borderColor: colors.border,
          alignItems: 'center',
        },
        amountLabel: { fontSize: 12, fontWeight: '800', color: hexToRgba(colors.text, 0.48), textTransform: 'uppercase', letterSpacing: 0.8 },
        amountValue: { marginTop: 14, fontSize: 40, fontWeight: '900', letterSpacing: -1.1, color: colors.primaryDark },
        amountMeta: { marginTop: 8, fontSize: 13, lineHeight: 19, fontWeight: '500', color: hexToRgba(colors.text, 0.56), textAlign: 'center' },
        stepperRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
        stepButton: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.backgroundSoft, borderWidth: 1, borderColor: colors.border },
        stepText: { minWidth: 120, textAlign: 'center', fontSize: 14, fontWeight: '700', color: colors.text },
        presetsWrap: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        presetChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
        presetText: { fontSize: 12, fontWeight: '700', color: colors.text },
      }),
    [colors]
  );
  const router = useRouter();
  const { state, setOutstandingDebt } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={9}
      totalSteps={21}
      eyebrow="Step 9 of 21"
      title="Do you have any outstanding debt?"
      body="A rough number is enough here. We only need the scale to tune risk and payoff recommendations."
      footer={<AssessmentPrimaryButton label="Continue" onPress={() => router.push('/(finance)/financial-assessment/financial-goal')} />}
    >
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Outstanding debt</Text>
        <Text style={styles.amountValue}>${state.outstandingDebt.toLocaleString()}</Text>
        <Text style={styles.amountMeta}>Include credit cards, personal loans, financing or any other debt you actively carry.</Text>

        <View style={styles.stepperRow}>
          <Pressable style={styles.stepButton} onPress={() => setOutstandingDebt(state.outstandingDebt - 500)}>
            <MaterialIcons name="remove" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.stepText}>Adjust by $500</Text>
          <Pressable style={styles.stepButton} onPress={() => setOutstandingDebt(state.outstandingDebt + 500)}>
            <MaterialIcons name="add" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.presetsWrap}>
        {outstandingDebtPresets.map((item) => (
          <Pressable key={item} style={styles.presetChip} onPress={() => setOutstandingDebt(item)}>
            <Text style={styles.presetText}>${item.toLocaleString()}</Text>
          </Pressable>
        ))}
      </View>
    </AssessmentShell>
  );
}
