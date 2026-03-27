import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { financeSituationOptions } from '@/components/financial-assessment/data';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentFinanceSituationScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row', gap: 12 },
        option: {
          flex: 1,
          minHeight: 150,
          borderRadius: 24,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 12,
        },
        emoji: { fontSize: 34 },
        label: { marginTop: 10, fontSize: 13, lineHeight: 18, fontWeight: '800', textAlign: 'center' },
        helper: { marginTop: 6, fontSize: 11, lineHeight: 16, fontWeight: '500', textAlign: 'center' },
      }),
    []
  );
  const router = useRouter();
  const { state, setFinanceSituationId } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={15}
      totalSteps={21}
      eyebrow="Step 15 of 21"
      title="How do you feel about your current finance situation?"
      body="This gives the app a softer signal about financial stress, not just hard numbers."
      footer={
        <AssessmentPrimaryButton
          label="Continue"
          disabled={!state.financeSituationId}
          onPress={() => router.push('/(finance)/financial-assessment/emergency-fund')}
        />
      }
    >
      <View style={styles.row}>
        {financeSituationOptions.map((item) => {
          const active = item.id === state.financeSituationId;

          return (
            <Pressable
              key={item.id}
              style={[
                styles.option,
                {
                  backgroundColor: active ? hexToRgba(colors.primaryDark, 0.09) : colors.card,
                  borderColor: active ? colors.primaryDark : colors.border,
                },
              ]}
              onPress={() => setFinanceSituationId(item.id)}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.label, { color: active ? colors.primaryDark : colors.text }]}>{item.label}</Text>
              <Text style={[styles.helper, { color: active ? hexToRgba(colors.primaryDark, 0.85) : hexToRgba(colors.text, 0.54) }]}>{item.helper}</Text>
            </Pressable>
          );
        })}
      </View>
    </AssessmentShell>
  );
}
