import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spendingCategoryOptions } from '@/components/financial-assessment/data';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentSpendingCategoriesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        helperCard: {
          borderRadius: 18,
          borderWidth: 1,
          padding: 14,
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        helperTitle: { fontSize: 13, fontWeight: '800', color: colors.text },
        helperBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500', color: hexToRgba(colors.text, 0.56) },
        grid: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
        chip: {
          width: '47%',
          minHeight: 86,
          borderRadius: 22,
          borderWidth: 1,
          padding: 14,
          justifyContent: 'space-between',
        },
        chipIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
        chipLabel: { marginTop: 10, fontSize: 13, fontWeight: '800', color: colors.text },
        selectedCount: { marginTop: 18, fontSize: 12, fontWeight: '700', color: hexToRgba(colors.text, 0.48), textAlign: 'center' },
      }),
    [colors]
  );
  const router = useRouter();
  const { state, toggleSpendingCategoryId } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={8}
      totalSteps={21}
      eyebrow="Step 8 of 21"
      title="What categories do you spend the most on?"
      body="Pick up to 3 areas. We use these as the first pressure zones in your financial profile."
      footer={
        <AssessmentPrimaryButton
          label="Continue"
          disabled={state.spendingCategoryIds.length === 0}
          onPress={() => router.push('/(finance)/financial-assessment/outstanding-debt')}
        />
      }
    >
      <View style={styles.helperCard}>
        <Text style={styles.helperTitle}>Selection rule</Text>
        <Text style={styles.helperBody}>Choose the categories that usually eat the largest part of your monthly cashflow.</Text>
      </View>

      <View style={styles.grid}>
        {spendingCategoryOptions.map((item) => {
          const active = state.spendingCategoryIds.includes(item.id);

          return (
            <Pressable
              key={item.id}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                  borderColor: active ? colors.primaryDark : colors.border,
                },
              ]}
              onPress={() => toggleSpendingCategoryId(item.id)}
            >
              <View style={[styles.chipIcon, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.14) : colors.backgroundSoft }]}>
                <MaterialIcons name={item.icon} size={20} color={active ? colors.primaryDark : hexToRgba(colors.text, 0.55)} />
              </View>
              <Text style={styles.chipLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.selectedCount}>{state.spendingCategoryIds.length}/3 categories selected</Text>
    </AssessmentShell>
  );
}
