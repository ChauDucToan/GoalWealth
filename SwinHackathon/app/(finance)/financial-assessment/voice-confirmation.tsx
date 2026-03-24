import { hexToRgba } from '@/components/auth/AuthKit';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AssessmentPrimaryButton, AssessmentShell } from './_shared';

const waveform = [18, 10, 26, 16, 34, 20, 40, 22, 14, 28, 18, 36, 20, 12, 24, 16] as const;

export default function FinancialAssessmentVoiceConfirmationScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        voiceCard: { borderRadius: 24, borderWidth: 1, padding: 18 },
        voiceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        voiceTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
        liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
        liveText: { fontSize: 11, fontWeight: '800', color: colors.primaryDark },
        waveformRow: { marginTop: 22, minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
        waveformBar: { flex: 1, borderRadius: 999 },
        phrase: { marginTop: 18, fontSize: 15, lineHeight: 22, fontWeight: '700', textAlign: 'center', color: colors.text },
        helper: { marginTop: 10, fontSize: 12, lineHeight: 18, fontWeight: '500', textAlign: 'center', color: hexToRgba(colors.text, 0.56) },
        fakeRecord: { marginTop: 18, minHeight: 50, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
        fakeRecordText: { fontSize: 14, fontWeight: '800' },
      }),
    [colors]
  );
  const router = useRouter();
  const { state, completeFourthChunk } = useFinancialAssessment();

  return (
    <AssessmentShell
      step={21}
      totalSteps={21}
      eyebrow="Step 21 of 21"
      title="Please say the following words"
      body="The design ends with a live voice confirmation state. This frontend mirrors that closing screen with an active waveform treatment."
      footer={
        <AssessmentPrimaryButton
          label="Complete assessment"
          onPress={() => {
            completeFourthChunk();
            router.replace('/(finance)/financial-assessment');
          }}
        />
      }
    >
      <View style={[styles.voiceCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={styles.voiceTop}>
          <Text style={styles.voiceTitle}>Voice confirmation</Text>
          <View style={[styles.liveBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}> 
            <MaterialIcons name="mic" size={14} color={colors.primaryDark} />
            <Text style={styles.liveText}>LISTENING</Text>
          </View>
        </View>

        <View style={styles.waveformRow}>
          {waveform.map((value, index) => (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: value,
                  backgroundColor: index % 3 === 0 ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.35),
                },
              ]}
            />
          ))}
        </View>

        <Text style={styles.phrase}>{state.commitmentPhrase}</Text>
        <Text style={styles.helper}>In production this step can be wired to microphone capture. For now it completes the UI flow shown in the board.</Text>

        <Pressable style={[styles.fakeRecord, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}> 
          <Text style={[styles.fakeRecordText, { color: colors.primaryDark }]}>Tap to re-record</Text>
        </Pressable>
      </View>
    </AssessmentShell>
  );
}
