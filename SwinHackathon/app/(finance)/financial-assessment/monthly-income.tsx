import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { incomePresets } from '@/components/financial-assessment/data';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentMonthlyIncomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    amountCard: {
      borderRadius: 28,
      borderWidth: 1,
      padding: 22,
      backgroundColor: colors.card,
      borderColor: colors.border,
      alignItems: 'center',
    },
    amountLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: hexToRgba(colors.text, 0.5) },
    amountValue: { marginTop: 16, fontSize: 42, fontWeight: '900', letterSpacing: -1.2, color: colors.primaryDark },
    amountMeta: { marginTop: 8, fontSize: 13, lineHeight: 18, fontWeight: '600', color: hexToRgba(colors.text, 0.56), textAlign: 'center' },
    stepperRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
    stepButton: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepText: { minWidth: 120, textAlign: 'center', fontSize: 14, fontWeight: '700', color: colors.text },
    presetsWrap: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    presetChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    presetText: { fontSize: 12, fontWeight: '700', color: colors.text },
  }), [colors]);
  const router = useRouter();
  const { state, setMonthlyIncome } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={5}
      totalSteps={21}
      eyebrow="Step 5 of 21"
      title="How much money are you making monthly?"
      body="A rough monthly figure is enough for now. Later screens can refine this with bill cycles and irregular income patterns."
      footer={<AssessmentPrimaryButton label="Continue" onPress={() => router.push('/(finance)/financial-assessment/savings-rate')} />}
    >
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Monthly income</Text>
        <Text style={styles.amountValue}>${state.monthlyIncome.toLocaleString()}</Text>
        <Text style={styles.amountMeta}>We use this as the baseline for budget pacing, savings expectations and recommendation intensity.</Text>

        <View style={styles.stepperRow}>
          <Pressable style={styles.stepButton} onPress={() => setMonthlyIncome(state.monthlyIncome - 250)}>
            <MaterialIcons name="remove" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.stepText}>Adjust by $250</Text>
          <Pressable style={styles.stepButton} onPress={() => setMonthlyIncome(state.monthlyIncome + 250)}>
            <MaterialIcons name="add" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.presetsWrap}>
        {incomePresets.map((item) => (
          <Pressable key={item} style={styles.presetChip} onPress={() => setMonthlyIncome(item)}>
            <Text style={styles.presetText}>${item.toLocaleString()}</Text>
          </Pressable>
        ))}
      </View>
    </AssessmentShell>
  );
}
