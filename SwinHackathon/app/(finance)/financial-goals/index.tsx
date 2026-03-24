import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { financialGoals } from './_data';

export default function FinancialGoalsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const totalSaved = financialGoals.reduce((sum, item) => sum + item.saved, 0);
  const totalTarget = financialGoals.reduce((sum, item) => sum + item.target, 0);
  const totalContribution = financialGoals.reduce((sum, item) => sum + item.monthlyContribution, 0);
  const overallProgress = totalSaved / totalTarget;

  return (
    <FinanceScreen
      title="Financial Goals"
      subtitle="Track saving targets, milestone pacing and the next move for each goal."
      contentStyle={styles.contentStyle}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(finance)/financial-goals/create')}
        >
          <MaterialIcons name="add" size={20} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
          <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.74) }]}>GOAL WORKSPACE</Text>
          <Text style={[styles.heroTitle, { color: colors.card }]}>Keep long-term plans visible and measurable.</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.82) }]}>
            A tighter goals view reduces scattered saving behavior and makes monthly tradeoffs easier to decide.
          </Text>

          <View style={[styles.heroTrack, { backgroundColor: hexToRgba(colors.card, 0.18) }]}>
            <View
              style={[
                styles.heroFill,
                { width: `${Math.min(overallProgress * 100, 100)}%`, backgroundColor: colors.card },
              ]}
            />
          </View>

          <View style={styles.heroMetrics}>
            <View>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.card, 0.72) }]}>Saved</Text>
              <Text style={[styles.heroMetricValue, { color: colors.card }]}>{formatCurrency(totalSaved)}</Text>
            </View>
            <View>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.card, 0.72) }]}>Monthly pace</Text>
              <Text style={[styles.heroMetricValue, { color: colors.card }]}>{formatCurrency(totalContribution)}</Text>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active goals</Text>
            <Text style={[styles.sectionMeta, { color: hexToRgba(colors.text, 0.5) }]}>
              {financialGoals.length} goals
            </Text>
          </View>

          <View style={styles.goalStack}>
            {financialGoals.map((goal) => {
              const progress = goal.saved / goal.target;

              return (
                <Pressable
                  key={goal.id}
                  style={[styles.goalCard, { borderColor: colors.border }]}
                  onPress={() =>
                    router.push({
                      pathname: '/(finance)/financial-goals/[goalId]',
                      params: { goalId: goal.id },
                    })
                  }
                >
                  <View style={styles.goalRow}>
                    <View style={[styles.goalIcon, { backgroundColor: hexToRgba(goal.accent, 0.14) }]}>
                      <MaterialIcons name={goal.icon} size={20} color={goal.accent} />
                    </View>

                    <View style={styles.goalCopy}>
                      <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
                      <Text style={[styles.goalSubtitle, { color: hexToRgba(colors.text, 0.52) }]}>
                        {goal.category} • {goal.dueLabel}
                      </Text>
                    </View>

                    <Text style={[styles.goalProgressLabel, { color: goal.accent }]}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>

                  <View style={[styles.goalTrack, { backgroundColor: hexToRgba(goal.accent, 0.12) }]}>
                    <View
                      style={[
                        styles.goalFill,
                        {
                          width: `${Math.min(progress * 100, 100)}%`,
                          backgroundColor: goal.accent,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.goalMetaRow}>
                    <Text style={[styles.goalMeta, { color: colors.text }]}>
                      {formatCurrency(goal.saved)} of {formatCurrency(goal.target)}
                    </Text>
                    <Text style={[styles.goalMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                      +{formatCurrency(goal.monthlyContribution)}/mo
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <View style={styles.bottomRow}>
          <FinanceCard style={styles.halfCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top milestone</Text>
            <Text style={[styles.miniTitle, { color: colors.text }]}>Book flights</Text>
            <Text style={[styles.miniBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Summer Trip will be fully flight-ready once it crosses $1,800.
            </Text>
          </FinanceCard>

          <FinanceCard style={styles.halfCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Next action</Text>
            <Text style={[styles.miniTitle, { color: colors.text }]}>Create a new target</Text>
            <Text style={[styles.miniBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Start a focused plan for debt payoff, home or investing.
            </Text>
            <Pressable
              style={[styles.inlineButton, { backgroundColor: colors.primaryDark }]}
              onPress={() => router.push('/(finance)/financial-goals/create')}
            >
              <Text style={[styles.inlineButtonText, { color: colors.card }]}>New goal</Text>
            </Pressable>
          </FinanceCard>
        </View>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: {
      paddingBottom: 28,
    },
    stack: {
      marginTop: 18,
      gap: 16,
    },
    headerAction: {
      width: 38,
      height: 38,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroCard: {
      borderWidth: 0,
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    heroTitle: {
      marginTop: 10,
      fontSize: 28,
      lineHeight: 33,
      fontWeight: '900',
      letterSpacing: -0.7,
    },
    heroBody: {
      marginTop: 10,
      fontSize: Typography.body,
      lineHeight: 20,
      fontWeight: '500',
    },
    heroTrack: {
      marginTop: 18,
      height: 10,
      borderRadius: 999,
      overflow: 'hidden',
    },
    heroFill: {
      height: '100%',
      borderRadius: 999,
    },
    heroMetrics: {
      marginTop: 18,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    heroMetricLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    heroMetricValue: {
      marginTop: 4,
      fontSize: 18,
      fontWeight: '800',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
    },
    sectionMeta: {
      fontSize: 12,
      fontWeight: '700',
    },
    goalStack: {
      marginTop: 16,
      gap: 14,
    },
    goalCard: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 14,
    },
    goalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    goalIcon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalCopy: {
      flex: 1,
    },
    goalTitle: {
      fontSize: 15,
      fontWeight: '800',
    },
    goalSubtitle: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '500',
    },
    goalProgressLabel: {
      fontSize: 13,
      fontWeight: '800',
    },
    goalTrack: {
      marginTop: 14,
      height: 9,
      borderRadius: 999,
      overflow: 'hidden',
    },
    goalFill: {
      height: '100%',
      borderRadius: 999,
    },
    goalMetaRow: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    goalMeta: {
      fontSize: 12,
      fontWeight: '600',
    },
    bottomRow: {
      flexDirection: 'row',
      gap: 12,
    },
    halfCard: {
      flex: 1,
      minHeight: 168,
    },
    miniTitle: {
      marginTop: 12,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '800',
    },
    miniBody: {
      marginTop: 8,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    inlineButton: {
      marginTop: 14,
      minHeight: 40,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inlineButtonText: {
      fontSize: 13,
      fontWeight: '800',
    },
  });
}
