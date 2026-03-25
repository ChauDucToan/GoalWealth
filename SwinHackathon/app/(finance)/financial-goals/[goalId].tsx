import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { financialGoals } from '@/components/financial-goals/data';

export default function FinancialGoalDetailScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const goal = financialGoals.find((item) => item.id === goalId) ?? financialGoals[0];
  const progress = goal.saved / goal.target;
  const left = goal.target - goal.saved;

  return (
    <FinanceScreen
      title={goal.title}
      subtitle={`${goal.category} goal • ${goal.dueLabel}`}
      contentStyle={styles.contentStyle}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(finance)/financial-goals/create')}
        >
          <MaterialIcons name="edit" size={18} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: goal.accent }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.76) }]}>Goal progress</Text>
              <Text style={[styles.heroValue, { color: colors.card }]}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={[styles.ringWrap, { borderColor: hexToRgba(colors.card, 0.24) }]}>
              <View style={[styles.ringCore, { backgroundColor: colors.card }]}>
                <MaterialIcons name={goal.icon} size={26} color={goal.accent} />
              </View>
            </View>
          </View>

          <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.84) }]}>
            {goal.note}
          </Text>

          <View style={styles.heroStats}>
            <View>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.72) }]}>Saved</Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>{formatCurrency(goal.saved)}</Text>
            </View>
            <View>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.72) }]}>Left</Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>{formatCurrency(left)}</Text>
            </View>
            <View>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.72) }]}>Monthly</Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>{formatCurrency(goal.monthlyContribution)}</Text>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Milestones</Text>
          <View style={styles.milestoneStack}>
            {goal.milestones.map((item, index) => (
              <View key={item} style={styles.milestoneRow}>
                <View style={[styles.milestoneIndex, { backgroundColor: hexToRgba(goal.accent, 0.12) }]}>
                  <Text style={[styles.milestoneIndexText, { color: goal.accent }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.milestoneText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>
        </FinanceCard>

        <View style={styles.bottomRow}>
          <FinanceCard style={styles.halfCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contribution rhythm</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{formatCurrency(goal.monthlyContribution)}</Text>
            <Text style={[styles.cardBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Monthly transfer currently assumed for this goal.
            </Text>
          </FinanceCard>

          <FinanceCard style={styles.halfCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Completion gap</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{formatCurrency(left)}</Text>
            <Text style={[styles.cardBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Remaining amount before this target is fully funded.
            </Text>
          </FinanceCard>
        </View>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
          onPress={() => router.push('/(finance)/financial-goals/create')}
        >
          <Text style={[styles.primaryButtonText, { color: colors.card }]}>Adjust goal</Text>
        </Pressable>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    headerAction: {
      width: 38,
      height: 38,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stack: {
      marginTop: 18,
      gap: 16,
    },
    heroCard: {
      borderWidth: 0,
    },
    heroTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    heroValue: {
      marginTop: 6,
      fontSize: 42,
      fontWeight: '900',
      letterSpacing: -1.2,
    },
    ringWrap: {
      width: 92,
      height: 92,
      borderRadius: 46,
      borderWidth: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringCore: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBody: {
      marginTop: 16,
      fontSize: Typography.body,
      lineHeight: 20,
      fontWeight: '500',
    },
    heroStats: {
      marginTop: 18,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    heroStatLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    heroStatValue: {
      marginTop: 4,
      fontSize: 16,
      fontWeight: '800',
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
    },
    milestoneStack: {
      marginTop: 16,
      gap: 12,
    },
    milestoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    milestoneIndex: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    milestoneIndexText: {
      fontSize: 12,
      fontWeight: '800',
    },
    milestoneText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '600',
    },
    bottomRow: {
      flexDirection: 'row',
      gap: 12,
    },
    halfCard: {
      flex: 1,
      minHeight: 150,
    },
    cardValue: {
      marginTop: 10,
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.6,
    },
    cardBody: {
      marginTop: 8,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
  });
}
