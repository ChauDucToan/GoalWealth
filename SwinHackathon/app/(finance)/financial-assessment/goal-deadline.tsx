import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { goalDeadlineOptions } from '@/components/financial-assessment/data';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentGoalDeadlineScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          borderRadius: 24,
          borderWidth: 1,
          padding: 18,
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        cardTitle: { fontSize: 13, fontWeight: '800', color: colors.text },
        list: { marginTop: 14, gap: 10 },
        dateRow: {
          minHeight: 54,
          borderRadius: 18,
          borderWidth: 1,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        dateText: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
      }),
    [colors]
  );
  const router = useRouter();
  const { state, setGoalDeadlineLabel } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={11}
      totalSteps={21}
      eyebrow="Step 11 of 21"
      title="When do you need it by?"
      body="Pick the closest milestone that matches your goal timeline. You can refine exact dates later."
      footer={
        <AssessmentPrimaryButton
          label="Continue"
          disabled={!state.goalDeadlineLabel}
          onPress={() => router.push('/(finance)/financial-assessment/expense-tracking')}
        />
      }
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Goal date</Text>
        <View style={styles.list}>
          {goalDeadlineOptions.map((item) => {
            const active = item === state.goalDeadlineLabel;

            return (
              <Pressable
                key={item}
                style={[
                  styles.dateRow,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.backgroundSoft,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setGoalDeadlineLabel(item)}
              >
                <MaterialIcons name="event" size={20} color={active ? colors.primaryDark : hexToRgba(colors.text, 0.5)} />
                <Text style={styles.dateText}>{item}</Text>
                {active ? <MaterialIcons name="check-circle" size={20} color={colors.primaryDark} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </AssessmentShell>
  );
}
