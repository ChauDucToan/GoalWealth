import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentSavingsRateScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    ringWrap: { alignItems: 'center', marginTop: 8 },
    ringShell: {
      width: 184,
      height: 184,
      borderRadius: 92,
      borderWidth: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: hexToRgba(colors.primaryDark, 0.12),
      borderTopColor: colors.primaryDark,
    },
    ringCenter: {
      width: 110,
      height: 110,
      borderRadius: 55,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
    },
    ringValue: { fontSize: 34, fontWeight: '900', letterSpacing: -0.8, color: colors.text },
    ringLabel: { marginTop: 4, fontSize: 12, fontWeight: '700', color: hexToRgba(colors.text, 0.48) },
    metaCard: {
      marginTop: 20,
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    metaTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
    metaBody: { marginTop: 6, fontSize: 13, lineHeight: 19, fontWeight: '500', color: hexToRgba(colors.text, 0.56) },
    stepperRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
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
    stepText: { minWidth: 88, textAlign: 'center', fontSize: 14, fontWeight: '800', color: colors.text },
  }), [colors]);
  const router = useRouter();
  const { state, setSavingsRate, completeFirstChunk } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={6}
      totalSteps={21}
      eyebrow="Step 6 of 21"
      title="How much income do you save each month?"
      body="This gives the assessment a first signal of how conservative or stretched your current financial behavior is."
      footer={
        <AssessmentPrimaryButton
          label="Continue"
          onPress={() => {
            completeFirstChunk();
            router.push('/(finance)/financial-assessment/pay-frequency');
          }}
        />
      }
    >
      <View style={styles.ringWrap}>
        <View style={styles.ringShell}>
          <View style={styles.ringCenter}>
            <Text style={styles.ringValue}>{state.savingsRate}%</Text>
            <Text style={styles.ringLabel}>Saved monthly</Text>
          </View>
        </View>
      </View>

      <View style={styles.stepperRow}>
        <Pressable style={styles.stepButton} onPress={() => setSavingsRate(state.savingsRate - 1)}>
          <MaterialIcons name="remove" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.stepText}>1% step</Text>
        <Pressable style={styles.stepButton} onPress={() => setSavingsRate(state.savingsRate + 1)}>
          <MaterialIcons name="add" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.metaCard}>
        <Text style={styles.metaTitle}>Assessment note</Text>
        <Text style={styles.metaBody}>
          At {state.savingsRate}%, Finpal will assume you already have some saving discipline and can push slightly more structured planning in the next steps.
        </Text>
      </View>
    </AssessmentShell>
  );
}
