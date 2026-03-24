import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firstChunkSteps, fourthChunkSteps, secondChunkSteps, thirdChunkSteps } from './_data';

export default function FinancialAssessmentEntryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, restartFirstChunk } = useFinancialAssessment();
  const implementedSteps = [...firstChunkSteps, ...secondChunkSteps, ...thirdChunkSteps, ...fourthChunkSteps];
  const nextRoute = !state.isFirstChunkComplete
    ? '/(finance)/financial-assessment/full-name'
    : !state.isSecondChunkComplete
    ? '/(finance)/financial-assessment/pay-frequency'
    : !state.isThirdChunkComplete
    ? '/(finance)/financial-assessment/retirement-age'
    : !state.isFourthChunkComplete
    ? '/(finance)/financial-assessment/biggest-challenge'
    : '/(finance)/financial-assessment/full-name';
  const primaryLabel = !state.isFirstChunkComplete
    ? 'Start first block'
    : !state.isSecondChunkComplete
    ? 'Continue assessment'
    : !state.isThirdChunkComplete
    ? 'Continue next block'
    : !state.isFourthChunkComplete
    ? 'Finish assessment'
    : 'Review assessment';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroOrb, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}>
          <View style={[styles.heroBadge, { backgroundColor: colors.card }]}>
            <MaterialIcons name="analytics" size={36} color={colors.primaryDark} />
          </View>
        </View>

        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>COMPREHENSIVE ASSESSMENT</Text>
        <Text style={[styles.title, { color: colors.text }]}>Start your financial assessment.</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          This release now covers the first 21 assessment screens: profile basics, income structure, goals, behavior signals and final commitment screens.
        </Text>

        <View style={styles.stepStack}>
          {implementedSteps.map((label, index) => (
            <View key={label} style={[styles.stepRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.stepIndex, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                <Text style={[styles.stepIndexText, { color: colors.primaryDark }]}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{label}</Text>
            </View>
          ))}
        </View>

        {state.isFirstChunkComplete ? (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Saved answers</Text>
            <Text style={[styles.summaryBody, { color: hexToRgba(colors.text, 0.56) }]}>
              {state.fullName || 'Unnamed profile'} • ${state.monthlyIncome.toLocaleString()} monthly • {state.savingsRate}% saved
            </Text>
            {state.isSecondChunkComplete ? (
              <Text style={[styles.summaryBody, { color: hexToRgba(colors.text, 0.56) }]}>
                {state.spendingCategoryIds.length || 0} spending areas • {state.goalDeadlineLabel || 'No goal date'} • {state.expenseTrackingId || 'tracking not set'}
              </Text>
            ) : null}
            {state.isThirdChunkComplete ? (
              <Text style={[styles.summaryBody, { color: hexToRgba(colors.text, 0.56) }]}>
                Retire at {state.retirementAge} • {state.dependentCount} dependents • {state.emergencyFundMonths} months buffer
              </Text>
            ) : null}
            {state.isFourthChunkComplete ? (
              <Text style={[styles.summaryBody, { color: hexToRgba(colors.text, 0.56) }]}>
                Challenge: {state.biggestChallengeId || 'not set'} • final commitment complete
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.scopeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.scopeTitle, { color: colors.text }]}>Current scope</Text>
          <Text style={[styles.scopeBody, { color: hexToRgba(colors.text, 0.56) }]}>
            The assessment currently covers 21 screens from the full design board. This includes the final challenge and voice commitment screens shown at the end of the design.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => router.push(nextRoute)}
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>{primaryLabel}</Text>
          </Pressable>

          {state.isFirstChunkComplete ? (
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={restartFirstChunk}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Reset answers</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24 },
    heroOrb: {
      alignSelf: 'center',
      width: 128,
      height: 128,
      borderRadius: 64,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    heroBadge: {
      width: 76,
      height: 76,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eyebrow: {
      marginTop: 18,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      textAlign: 'center',
    },
    title: {
      marginTop: 10,
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '900',
      letterSpacing: -0.7,
      textAlign: 'center',
    },
    body: {
      marginTop: 10,
      fontSize: Typography.body,
      lineHeight: 21,
      textAlign: 'center',
    },
    stepStack: { marginTop: 16, gap: 2 },
    stepRow: {
      minHeight: 50,
      borderBottomWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
    },
    stepIndex: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepIndexText: { fontSize: 13, fontWeight: '800' },
    stepTitle: { flex: 1, fontSize: 15, lineHeight: 20, fontWeight: '800' },
    summaryCard: {
      marginTop: 16,
      borderRadius: 20,
      borderWidth: 1,
      padding: 16,
    },
    summaryTitle: { fontSize: 14, fontWeight: '800' },
    summaryBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    scopeCard: {
      marginTop: 14,
      borderRadius: 20,
      borderWidth: 1,
      padding: 16,
    },
    scopeTitle: { fontSize: 14, fontWeight: '800' },
    scopeBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    actionGroup: {
      marginTop: 18,
      paddingTop: 6,
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
    secondaryButton: {
      marginTop: 12,
      minHeight: 50,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
