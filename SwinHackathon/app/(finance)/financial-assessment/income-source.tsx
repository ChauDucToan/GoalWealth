import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { incomeSourceOptions } from './_data';
import { AssessmentPrimaryButton, AssessmentShell } from './_shared';

export default function FinancialAssessmentIncomeSourceScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    stack: { gap: 12 },
    card: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
      gap: 12,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1, minWidth: 0 },
    label: { fontSize: 15, fontWeight: '800', color: colors.text },
    helper: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500', color: hexToRgba(colors.text, 0.52) },
    dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  }), [colors]);
  const router = useRouter();
  const { state, setIncomeSourceId } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={4}
      totalSteps={21}
      eyebrow="Step 4 of 21"
      title="What is your primary source of income?"
      body="This helps us gauge income regularity and decide how strict the later recommendations should be."
      footer={
        <AssessmentPrimaryButton
          label="Continue"
          disabled={!state.incomeSourceId}
          onPress={() => router.push('/(finance)/financial-assessment/monthly-income')}
        />
      }
    >
      <View style={styles.stack}>
        {incomeSourceOptions.map((item) => {
          const active = item.id === state.incomeSourceId;

          return (
            <Pressable
              key={item.id}
              style={[styles.card, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card, borderColor: active ? colors.primaryDark : colors.border }]}
              onPress={() => setIncomeSourceId(item.id)}
            >
              <View style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.12) : colors.backgroundSoft }]}>
                  <MaterialIcons name={item.icon} size={22} color={active ? colors.primaryDark : hexToRgba(colors.text, 0.55)} />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.helper}>{item.helper}</Text>
                </View>
                <View style={[styles.dot, { borderColor: active ? colors.primaryDark : colors.border, backgroundColor: active ? colors.primaryDark : colors.card }]}>
                  {active ? <MaterialIcons name="check" size={14} color={colors.card} /> : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </AssessmentShell>
  );
}
