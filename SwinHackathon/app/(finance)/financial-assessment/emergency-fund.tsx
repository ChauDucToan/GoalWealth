import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { emergencyFundOptions } from '@/components/financial-assessment/data';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentEmergencyFundScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: { gap: 12 },
        optionCard: { borderRadius: 22, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
        iconWrap: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
        copy: { flex: 1 },
        label: { fontSize: 14, lineHeight: 19, fontWeight: '800', color: colors.text },
        helper: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500', color: hexToRgba(colors.text, 0.54) },
      }),
    [colors]
  );
  const router = useRouter();
  const { state, setEmergencyFundId } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={16}
      totalSteps={21}
      eyebrow="Step 16 of 21"
      title="Do you have an emergency fund?"
      body="This is one of the clearest signals of short-term resilience."
      footer={
        <AssessmentPrimaryButton
          label="Continue"
          disabled={!state.emergencyFundId}
          onPress={() => router.push('/(finance)/financial-assessment/emergency-months')}
        />
      }
    >
      <View style={styles.stack}>
        {emergencyFundOptions.map((item) => {
          const active = item.id === state.emergencyFundId;

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
              onPress={() => setEmergencyFundId(item.id)}
            >
              <View style={[styles.iconWrap, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.12) : colors.backgroundSoft }]}> 
                <MaterialIcons name={item.icon} size={21} color={active ? colors.primaryDark : hexToRgba(colors.text, 0.55)} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.helper}>{item.helper}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </AssessmentShell>
  );
}
