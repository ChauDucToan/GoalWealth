import { getResultBackHref } from '@/app/(finance)/financial-goals/navigation';
import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { useFinancialGoals } from '@/hooks/use-financial-goals';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from '@/lib/expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const resultMap = {
  created: {
    title: 'Goal created',
    body: 'The new goal is now ready to track, fund and review from the dashboard.',
    icon: 'check-circle',
  },
  updated: {
    title: 'Goal updated',
    body: 'Your savings plan now reflects the latest amount, cadence and account settings.',
    icon: 'task-alt',
  },
  transferred: {
    title: 'Money moved',
    body: 'The balance has been topped up and the goal can continue with a healthier pace.',
    icon: 'north-east',
  },
  recurring: {
    title: 'Recurring transfer set',
    body: 'Automatic funding is now attached to this goal for easier consistency.',
    icon: 'autorenew',
  },
  deleted: {
    title: 'Goal deleted',
    body: 'The goal has been removed from the active workspace.',
    icon: 'check-circle',
  },
} as const;

export default function FinancialGoalResultScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { getGoalById } = useFinancialGoals();
  const params = useLocalSearchParams<{
    goalId?: string;
    mode?: keyof typeof resultMap;
  }>();
  const goal = getGoalById(params.goalId);
  const mode = resultMap[params.mode ?? 'created'] ? (params.mode ?? 'created') : 'created';
  const result = resultMap[mode];
  const backHref = getResultBackHref({
    goalId: params.goalId,
    mode,
  });
  const homeHref = '/(tabs)/home' as const;

  return (
    <FinanceScreen
      title={result.title}
      subtitle="One shared success state keeps the flow lighter than the original multi-screen kit."
      contentStyle={styles.contentStyle}
      onBackPress={() => router.replace(homeHref)}
    >
      <View style={styles.stack}>
        <FinanceCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.success, 0.1),
              borderColor: hexToRgba(colors.success, 0.16),
            },
          ]}
        >
          <View style={[styles.iconBadge, { backgroundColor: colors.card }]}> 
            <MaterialIcons name={result.icon} size={28} color={colors.success} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{result.title}</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.58) }]}> 
            {result.body}
          </Text>
        </FinanceCard>

        {mode !== 'deleted' && goal ? (
          <FinanceCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{goal.title}</Text>
            <View style={styles.metaStack}>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.56) }]}>Category</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{goal.category}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.56) }]}>Target</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{formatCurrency(goal.target)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.56) }]}>Monthly pace</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}> 
                  {formatCurrency(goal.monthlyContribution)}
                </Text>
              </View>
            </View>
          </FinanceCard>
        ) : null}

        <View style={styles.actionRow}>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title={mode === 'deleted' ? 'Back to Goals' : 'Open Goal'}
              onPress={() => router.replace(backHref)}
              colorBackground={colors.primaryDark}
              colorText={colors.card}
              style={styles.actionButton}
            />
          </View>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title="Goals Dashboard"
              onPress={() => router.replace('/(finance)/financial-goals')}
              colorBackground={colors.card}
              colorText={colors.text}
              style={[styles.actionButton, { borderWidth: 1, borderColor: colors.border }]}
            />
          </View>
        </View>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  contentStyle: {
    paddingBottom: 28,
  },
  stack: {
    marginTop: 18,
    gap: 16,
  },
  heroCard: {
    borderWidth: 1,
    alignItems: 'center',
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.7,
    textAlign: 'center',
  },
  heroBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  metaStack: {
    marginTop: 14,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonWrap: {
    flex: 1,
  },
  actionButton: {
    width: '100%',
  },
});
