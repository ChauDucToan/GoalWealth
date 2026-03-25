import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { occupationExamples } from '@/components/financial-assessment/data';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentOccupationScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    card: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 16,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    label: { fontSize: 13, fontWeight: '800', color: colors.text },
    input: {
      marginTop: 12,
      minHeight: 132,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      backgroundColor: colors.backgroundSoft,
      borderColor: colors.border,
      textAlignVertical: 'top',
    },
    helper: { marginTop: 12, fontSize: 12, lineHeight: 18, fontWeight: '500', color: hexToRgba(colors.text, 0.54) },
    chipWrap: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipText: { fontSize: 12, fontWeight: '700', color: colors.text },
  }), [colors]);
  const router = useRouter();
  const { state, setOccupation } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={3}
      totalSteps={21}
      eyebrow="Step 3 of 21"
      title="What do you do for a living?"
      body="Enter your profession or describe what kind of work you do. This helps tailor income stability and planning questions later."
      footer={
        <AssessmentPrimaryButton
          label="Continue"
          disabled={!state.occupation.trim()}
          onPress={() => router.push('/(finance)/financial-assessment/income-source')}
        />
      }
    >
      <View style={styles.card}>
        <Text style={styles.label}>Your occupation</Text>
        <TextInput
          value={state.occupation}
          onChangeText={setOccupation}
          placeholder="Enter your job title, description or the type of work you do..."
          placeholderTextColor={hexToRgba(colors.text, 0.34)}
          style={styles.input}
          multiline
        />
        <Text style={styles.helper}>Example: “I am a freelance product designer and I mostly work with startup clients.”</Text>
      </View>

      <View style={styles.chipWrap}>
        {occupationExamples.map((item) => (
          <Pressable key={item} style={styles.chip} onPress={() => setOccupation(item)}>
            <Text style={styles.chipText}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </AssessmentShell>
  );
}
