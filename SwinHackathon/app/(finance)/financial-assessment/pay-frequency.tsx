import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { payFrequencyOptions } from '@/components/financial-assessment/data';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentPayFrequencyScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: { gap: 12 },
        optionCard: {
          borderRadius: 22,
          borderWidth: 1,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        },
        iconWrap: {
          width: 42,
          height: 42,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        },
        copy: { flex: 1 },
        label: { fontSize: 15, fontWeight: '800', color: colors.text },
        helper: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500', color: hexToRgba(colors.text, 0.54) },
        check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
      }),
    [colors]
  );
  const router = useRouter();
  const { state, setPayFrequencyId } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={7}
      totalSteps={21}
      eyebrow="Step 7 of 21"
      title="How often do you get paid?"
      body="Income frequency changes how we pace budgets, reminders and emergency buffer targets."
      footer={
        <AssessmentPrimaryButton
          label="Continue"
          disabled={!state.payFrequencyId}
          onPress={() => router.push('/(finance)/financial-assessment/spending-categories')}
        />
      }
    >
      <View style={styles.stack}>
        {payFrequencyOptions.map((item) => {
          const active = item.id === state.payFrequencyId;

          return (
            <Pressable
              key={item.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                  borderColor: active ? colors.primaryDark : colors.border,
                },
              ]}
              onPress={() => setPayFrequencyId(item.id)}
            >
              <View style={[styles.iconWrap, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.12) : colors.backgroundSoft }]}>
                <MaterialIcons name="calendar-month" size={20} color={active ? colors.primaryDark : hexToRgba(colors.text, 0.5)} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.helper}>{item.helper}</Text>
              </View>
              <View style={[styles.check, { borderColor: active ? colors.primaryDark : colors.border, backgroundColor: active ? colors.primaryDark : colors.card }]}>
                {active ? <MaterialIcons name="check" size={16} color={colors.card} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </AssessmentShell>
  );
}
