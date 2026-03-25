import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentFullNameScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    fieldCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 16,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    label: { fontSize: 13, fontWeight: '800', color: colors.text },
    input: {
      marginTop: 12,
      minHeight: 54,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 16,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      backgroundColor: colors.backgroundSoft,
      borderColor: colors.border,
    },
    helper: { marginTop: 12, fontSize: 12, lineHeight: 18, fontWeight: '500', color: hexToRgba(colors.text, 0.54) },
    exampleWrap: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    exampleChip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exampleText: { fontSize: 12, fontWeight: '700', color: colors.text },
  }), [colors]);
  const router = useRouter();
  const { state, setFullName } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={1}
      totalSteps={21}
      eyebrow="Step 1 of 21"
      title="Please enter your full name"
      body="We use this to personalize insights, reports and recommendations across the assessment flow."
      footer={
        <AssessmentPrimaryButton
          label="Continue"
          disabled={!state.fullName.trim()}
          onPress={() => router.push('/(finance)/financial-assessment/purpose')}
        />
      }
    >
      <View style={styles.fieldCard}>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          value={state.fullName}
          onChangeText={setFullName}
          placeholder="Jonathan T. Doe"
          placeholderTextColor={hexToRgba(colors.text, 0.34)}
          style={styles.input}
          autoCapitalize="words"
        />
        <Text style={styles.helper}>Your name helps the assistant keep reports and goal messages more natural.</Text>
      </View>

      <View style={styles.exampleWrap}>
        {['Jonathan T. Doe', 'Emma Nguyen', 'Alex Pham'].map((item) => (
          <Pressable key={item} style={styles.exampleChip} onPress={() => setFullName(item)}>
            <Text style={styles.exampleText}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </AssessmentShell>
  );
}
