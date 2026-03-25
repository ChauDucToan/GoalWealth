import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spendingBehaviourScale } from '@/components/financial-assessment/data';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentSpendingBehaviourScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        scaleRow: { marginTop: 12, flexDirection: 'row', gap: 10 },
        scoreChip: {
          flex: 1,
          minHeight: 86,
          borderRadius: 24,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        scoreValue: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
        activeCard: { marginTop: 20, borderRadius: 20, borderWidth: 1, padding: 16 },
        activeTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
        activeBody: { marginTop: 6, fontSize: 12, lineHeight: 18, fontWeight: '500', color: hexToRgba(colors.text, 0.56) },
      }),
    [colors]
  );
  const router = useRouter();
  const { state, setSpendingBehaviourScore, completeThirdChunk } = useFinancialAssessment();
  const activeScale = spendingBehaviourScale.find((item) => item.score === state.spendingBehaviourScore);

  return (
    <AssessmentShell
      step={18}
      totalSteps={21}
      eyebrow="Step 18 of 21"
      title="What's your typical spending behaviour?"
      body="Use the scale below to describe how disciplined or impulsive your spending usually feels."
      footer={
        <AssessmentPrimaryButton
          label="Continue"
          disabled={!state.spendingBehaviourScore}
          onPress={() => {
            completeThirdChunk();
            router.push('/(finance)/financial-assessment/biggest-challenge');
          }}
        />
      }
    >
      <View style={styles.scaleRow}>
        {spendingBehaviourScale.map((item) => {
          const active = item.score === state.spendingBehaviourScore;

          return (
            <Pressable
              key={item.score}
              style={[
                styles.scoreChip,
                {
                  backgroundColor: active ? hexToRgba(colors.primaryDark, 0.1) : colors.card,
                  borderColor: active ? colors.primaryDark : colors.border,
                },
              ]}
              onPress={() => setSpendingBehaviourScore(item.score)}
            >
              <Text style={[styles.scoreValue, { color: active ? colors.primaryDark : colors.text }]}>{item.score}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.activeCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={styles.activeTitle}>{activeScale?.label || 'Choose a score'}</Text>
        <Text style={styles.activeBody}>
          {activeScale
            ? `Score ${activeScale.score} will be used to calibrate how strict Finpal should be when it flags overspending or nudges savings habits.`
            : 'Pick the score that feels closest to your real spending pattern.'}
        </Text>
      </View>
    </AssessmentShell>
  );
}
