import { hexToRgba } from '@/components/auth/AuthKit';
import {
  biggestChallengeOptions,
  commitmentWaveform,
  financialGoalOptions,
  financeSituationOptions,
} from '@/components/financial-assessment/data';
import {
  AssessmentPrimaryButton,
  AssessmentSectionCard,
  AssessmentShell,
} from '@/components/financial-assessment/shared';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function FinancialAssessmentCommitmentScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setBiggestChallengeId, completeFourthChunk } = useFinancialAssessment();
  const activeGoal = financialGoalOptions.find((item) => item.id === state.financialGoalId);
  const activeSituation = financeSituationOptions.find((item) => item.id === state.financeSituationId);

  return (
    <AssessmentShell
      step={5}
      totalSteps={5}
      eyebrow="Section 5 of 5"
      title="Finish with the challenge and commitment layer."
      body="The last three screens in the design are merged here: biggest challenge, the commitment phrase and the voice-style confirmation card."
      scrollable
      footer={
        <AssessmentPrimaryButton
          label="Complete assessment"
          disabled={!state.biggestChallengeId}
          onPress={() => {
            completeFourthChunk();
            router.replace('/(finance)/financial-assessment');
          }}
        />
      }
    >
      <View style={[styles.summaryCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
        <Text style={[styles.summaryLabel, { color: colors.primaryDark }]}>Final review</Text>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          {activeGoal?.label || 'Goal not selected yet'}
        </Text>
        <View style={styles.summaryPills}>
          <View style={[styles.summaryPill, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryPillText, { color: colors.text }]}>
              {activeSituation?.label || 'Situation pending'}
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryPillText, { color: colors.text }]}>
              {state.spendingBehaviourScore ? `Behaviour ${state.spendingBehaviourScore}/5` : 'Behaviour pending'}
            </Text>
          </View>
        </View>
      </View>

      <AssessmentSectionCard
        title="Biggest financial challenge"
        body="This keeps the strong icon cards from the kit while removing one extra navigation step."
      >
        <View style={styles.challengeStack}>
          {biggestChallengeOptions.map((item) => {
            const active = state.biggestChallengeId === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.challengeCard,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setBiggestChallengeId(item.id)}
              >
                <View
                  style={[
                    styles.challengeIcon,
                    {
                      backgroundColor: active
                        ? hexToRgba(colors.primaryDark, 0.12)
                        : colors.backgroundSoft,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={22}
                    color={active ? colors.primaryDark : hexToRgba(colors.text, 0.55)}
                  />
                </View>
                <View style={styles.challengeCopy}>
                  <Text style={[styles.challengeLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.challengeHelper, { color: hexToRgba(colors.text, 0.54) }]}>
                    {item.helper}
                  </Text>
                </View>
                <View
                  style={[
                    styles.challengeCheck,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.card,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                >
                  {active ? <MaterialIcons name="check" size={15} color={colors.card} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="Commitment phrase"
        body="We keep the phrase visible here so users do not have to jump to a separate prep screen."
      >
        <View style={[styles.phraseCard, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
          <Text style={[styles.phraseLabel, { color: hexToRgba(colors.text, 0.5) }]}>
            Please say the following words
          </Text>
          <Text style={[styles.phraseText, { color: colors.text }]}>{state.commitmentPhrase}</Text>
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="Voice confirmation"
        body="This mirrors the waveform treatment from the design, but keeps it on the same completion screen."
      >
        <View style={[styles.voiceCard, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
          <View style={styles.voiceHeader}>
            <Text style={[styles.voiceTitle, { color: colors.text }]}>Voice confirmation</Text>
            <View style={[styles.liveBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.12) }]}>
              <MaterialIcons name="mic" size={14} color={colors.primaryDark} />
              <Text style={[styles.liveText, { color: colors.primaryDark }]}>Listening</Text>
            </View>
          </View>

          <View style={styles.waveformRow}>
            {commitmentWaveform.map((value, index) => (
              <View
                key={`${value}-${index}`}
                style={[
                  styles.waveformBar,
                  {
                    height: value,
                    backgroundColor:
                      index % 3 === 0 ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.36),
                  },
                ]}
              />
            ))}
          </View>

          <Text style={[styles.voiceBody, { color: hexToRgba(colors.text, 0.58) }]}>
            Production can later wire this into real microphone capture. For now the screen preserves the final visual beat from the Figma kit.
          </Text>
        </View>
      </AssessmentSectionCard>
    </AssessmentShell>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    summaryCard: {
      borderRadius: 28,
      padding: 18,
    },
    summaryLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    summaryTitle: {
      marginTop: 8,
      fontSize: 22,
      lineHeight: 29,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    summaryPills: {
      marginTop: 14,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    summaryPill: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    summaryPillText: {
      fontSize: 12,
      fontWeight: '700',
    },
    challengeStack: {
      gap: 12,
    },
    challengeCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    challengeIcon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    challengeCopy: {
      flex: 1,
      minWidth: 0,
    },
    challengeLabel: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '800',
    },
    challengeHelper: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    challengeCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    phraseCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
    },
    phraseLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    phraseText: {
      marginTop: 12,
      fontSize: 22,
      lineHeight: 30,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    voiceCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
    },
    voiceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    voiceTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    liveText: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    waveformRow: {
      marginTop: 22,
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    waveformBar: {
      flex: 1,
      borderRadius: 999,
    },
    voiceBody: {
      marginTop: 16,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
  });
}
