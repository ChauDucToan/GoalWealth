import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { smartBudgetSetupSteps } from '@/components/smart-budgeting/data';
import { goSmartBudgetBack } from '../_navigation';
import { useSetupNavigationDebounce } from './use-setup-navigation-debounce';

export default function SmartBudgetSetupIntroScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { hasCompletedSetup } = useSmartBudgeting();
  const { isNavigating, runNavigation } = useSetupNavigationDebounce();
  const nextRoute = hasCompletedSetup
    ? '/(finance)/smart-budgeting/monthly-budget'
    : '/(finance)/smart-budgeting/setup/goal';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => goSmartBudgetBack(router, '/(tabs)/smart-budgeting')}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Budget Setup</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.heroOrb, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}>
          <View style={[styles.heroBadge, { backgroundColor: colors.card }]}>
            <MaterialIcons name="tune" size={36} color={colors.primaryDark} />
          </View>
        </View>

        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>
          {hasCompletedSetup ? 'SETUP COMPLETE' : 'SMART BUDGET SETUP'}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          {hasCompletedSetup ? 'Your budget is already ready.' : "Let's set up your budget."}
        </Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          {hasCompletedSetup
            ? 'You do not need to run onboarding again. Use Monthly Budget for daily work, or import a receipt directly.'
            : 'A short guided flow based on the onboarding sequence in the design. Answer a few questions and then jump straight into the budget dashboard.'}
        </Text>

        <View style={styles.stepStack}>
          {hasCompletedSetup ? (
            <>
              <View style={[styles.stepRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.stepIndex, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                  <MaterialIcons name="task-alt" size={16} color={colors.primaryDark} />
                </View>
                <View style={styles.stepCopy}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Monthly Budget</Text>
                  <Text style={[styles.stepBody, { color: hexToRgba(colors.text, 0.5) }]}>
                    Open the live plan and review the latest imported spending.
                  </Text>
                </View>
              </View>
              <View style={[styles.stepRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.stepIndex, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                  <MaterialIcons name="receipt-long" size={16} color={colors.primaryDark} />
                </View>
                <View style={styles.stepCopy}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Import Receipt</Text>
                  <Text style={[styles.stepBody, { color: hexToRgba(colors.text, 0.5) }]}>
                    Add new spending without going through the setup flow again.
                  </Text>
                </View>
              </View>
            </>
          ) : (
            smartBudgetSetupSteps.map((step, index) => (
              <View key={step.id} style={[styles.stepRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.stepIndex, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                  <Text style={[styles.stepIndexText, { color: colors.primaryDark }]}>{index + 1}</Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                  <Text style={[styles.stepBody, { color: hexToRgba(colors.text, 0.5) }]}>{step.body}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.buttonStack}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            disabled={isNavigating}
            onPress={() => runNavigation(() => router.push(nextRoute))}
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>
              {hasCompletedSetup ? 'Open Monthly Budget' : 'Start Setup'}
            </Text>
          </Pressable>

          {hasCompletedSetup ? (
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(finance)/smart-budgeting/add-spending')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Add Spending</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 22,
      paddingTop: 18,
      paddingBottom: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '800',
    },
    headerSpacer: {
      width: 40,
    },
    heroOrb: {
      alignSelf: 'center',
      width: 170,
      height: 170,
      borderRadius: 85,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
    },
    heroBadge: {
      width: 94,
      height: 94,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eyebrow: {
      marginTop: 24,
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
      marginTop: 12,
      fontSize: Typography.body,
      lineHeight: 21,
      textAlign: 'center',
    },
    stepStack: {
      marginTop: 22,
      gap: 6,
    },
    stepRow: {
      minHeight: 68,
      borderBottomWidth: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 12,
    },
    stepIndex: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    stepIndexText: {
      fontSize: 13,
      fontWeight: '800',
    },
    stepCopy: {
      flex: 1,
      minWidth: 0,
    },
    stepTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '800',
    },
    stepBody: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    buttonStack: {
      marginTop: 24,
      paddingTop: 10,
      gap: 12,
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 1,
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
    secondaryButton: {
      minHeight: 50,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
  });
}
