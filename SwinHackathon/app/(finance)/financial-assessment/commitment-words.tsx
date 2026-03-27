import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AssessmentPrimaryButton, AssessmentShell } from '@/components/financial-assessment/shared';

export default function FinancialAssessmentCommitmentWordsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        phraseCard: { borderRadius: 24, borderWidth: 1, padding: 18 },
        phraseLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, color: hexToRgba(colors.text, 0.48) },
        phraseText: { marginTop: 12, fontSize: 22, lineHeight: 30, fontWeight: '900', letterSpacing: -0.4, color: colors.text },
        helper: { marginTop: 14, fontSize: 12, lineHeight: 18, fontWeight: '500', color: hexToRgba(colors.text, 0.56) },
        chips: { marginTop: 18, flexDirection: 'row', gap: 10 },
        chip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
        chipText: { fontSize: 12, fontWeight: '700' },
      }),
    [colors]
  );
  const router = useRouter();
  const { state } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={20}
      totalSteps={21}
      eyebrow="Step 20 of 21"
      title="Please say the following words"
      body="This final section mirrors the closing commitment screens in the design. Here we prepare the phrase before the voice confirmation step."
      footer={<AssessmentPrimaryButton label="Continue" onPress={() => router.push('/(finance)/financial-assessment/voice-confirmation')} />}
    >
      <View style={[styles.phraseCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={styles.phraseLabel}>Commitment phrase</Text>
        <Text style={styles.phraseText}>{state.commitmentPhrase}</Text>
        <Text style={styles.helper}>Read this phrase out loud on the next screen to complete your assessment commitment.</Text>
      </View>

      <View style={styles.chips}>
        <View style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <MaterialIcons name="record-voice-over" size={16} color={colors.primaryDark} />
          <Text style={[styles.chipText, { color: colors.text }]}>Voice guided</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <MaterialIcons name="timer" size={16} color={colors.primaryDark} />
          <Text style={[styles.chipText, { color: colors.text }]}>~10 sec</Text>
        </View>
      </View>
    </AssessmentShell>
  );
}
