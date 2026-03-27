import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentDependentsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        counterCard: { borderRadius: 28, borderWidth: 1, padding: 22, alignItems: 'center' },
        counterLabel: { fontSize: 12, fontWeight: '800', color: hexToRgba(colors.text, 0.48), textTransform: 'uppercase', letterSpacing: 0.8 },
        counterValue: { marginTop: 16, fontSize: 44, fontWeight: '900', letterSpacing: -1.1, color: colors.text },
        stepperRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 18 },
        button: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
        helper: { marginTop: 14, fontSize: 13, lineHeight: 19, fontWeight: '500', textAlign: 'center', color: hexToRgba(colors.text, 0.56) },
      }),
    [colors]
  );
  const router = useRouter();
  const { state, setDependentCount } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={14}
      totalSteps={21}
      eyebrow="Step 14 of 21"
      title="Do you have any financial dependents?"
      body="Dependents change risk tolerance and the kind of safety buffer the app should recommend."
      footer={<AssessmentPrimaryButton label="Continue" onPress={() => router.push('/(finance)/financial-assessment/finance-situation')} />}
    >
      <View style={[styles.counterCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={styles.counterLabel}>Dependents</Text>
        <Text style={styles.counterValue}>{state.dependentCount}</Text>

        <View style={styles.stepperRow}>
          <Pressable style={[styles.button, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]} onPress={() => setDependentCount(state.dependentCount - 1)}>
            <MaterialIcons name="remove" size={22} color={colors.text} />
          </Pressable>
          <Pressable style={[styles.button, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]} onPress={() => setDependentCount(state.dependentCount + 1)}>
            <MaterialIcons name="add" size={22} color={colors.text} />
          </Pressable>
        </View>

        <Text style={styles.helper}>Include children, parents or anyone whose finances materially depend on your income.</Text>
      </View>
    </AssessmentShell>
  );
}
