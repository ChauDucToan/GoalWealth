import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { retirementAgeOptions } from '@/components/financial-assessment/data';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentRetirementAgeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        rail: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
        ageChip: {
          flex: 1,
          minHeight: 74,
          borderRadius: 22,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 6,
        },
        ageValue: { fontSize: 30, fontWeight: '900', letterSpacing: -0.8 },
        ageLabel: { marginTop: 4, fontSize: 11, fontWeight: '700' },
        helperCard: { marginTop: 18, borderRadius: 20, borderWidth: 1, padding: 16 },
        helperTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
        helperBody: { marginTop: 6, fontSize: 12, lineHeight: 18, fontWeight: '500', color: hexToRgba(colors.text, 0.56) },
      }),
    [colors]
  );
  const router = useRouter();
  const { state, setRetirementAge } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={13}
      totalSteps={21}
      eyebrow="Step 13 of 21"
      title="At what age would you like to retire?"
      body="A rough target is enough for now. It helps us judge how much long-term pressure your plan should carry."
      footer={<AssessmentPrimaryButton label="Continue" onPress={() => router.push('/(finance)/financial-assessment/dependents')} />}
    >
      <View style={styles.rail}>
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
              <Text style={[styles.ageValue, { color: active ? colors.primaryDark : colors.text }]}>{age}</Text>
              <Text style={[styles.ageLabel, { color: active ? colors.primaryDark : hexToRgba(colors.text, 0.5) }]}>AGE</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.helperCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={styles.helperTitle}>Current selection</Text>
        <Text style={styles.helperBody}>Finpal will treat age {state.retirementAge} as your working retirement milestone until you refine it later.</Text>
      </View>
    </AssessmentShell>
  );
}
