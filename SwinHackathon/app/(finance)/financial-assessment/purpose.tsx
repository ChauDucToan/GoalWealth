import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { assessmentPurposeOptions } from './_data';
import { AssessmentPrimaryButton, AssessmentShell } from './_shared';

export default function FinancialAssessmentPurposeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    stack: { gap: 12 },
    card: {
      minHeight: 82,
      borderRadius: 22,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    iconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1, minWidth: 0 },
    label: { fontSize: 14, lineHeight: 19, fontWeight: '800', color: colors.text },
    helper: { marginTop: 4, fontSize: 12, lineHeight: 17, fontWeight: '500', color: hexToRgba(colors.text, 0.52) },
    check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  }), [colors]);
  const router = useRouter();
  const { state, setPurposeId } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={2}
      totalSteps={21}
      eyebrow="Step 2 of 21"
      title="What's your app purpose?"
      body="Choose the main reason you want Finpal to assess your finances. We will bias later questions around this goal."
      footer={
        <AssessmentPrimaryButton
          label="Continue"
          disabled={!state.purposeId}
          onPress={() => router.push('/(finance)/financial-assessment/occupation')}
        />
      }
    >
      <View style={styles.stack}>
        {assessmentPurposeOptions.map((item) => {
          const active = item.id === state.purposeId;

          return (
            <Pressable
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                  borderColor: active ? colors.primaryDark : colors.border,
                },
              ]}
              onPress={() => setPurposeId(item.id)}
            >
              <View style={[styles.iconWrap, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.12) : colors.backgroundSoft }]}>
                <MaterialIcons name={item.icon} size={20} color={active ? colors.primaryDark : hexToRgba(colors.text, 0.55)} />
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
