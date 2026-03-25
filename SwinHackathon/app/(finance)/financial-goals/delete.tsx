import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { getFinancialGoalById } from '@/components/financial-goals/data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { useTheme } from '@/hooks/use-theme-colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function FinancialGoalDeleteScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();
  const goal = getFinancialGoalById(goalId);

  return (
    <FinanceScreen
      title="Delete Goal"
      subtitle="Remove the goal after reviewing its current balance and progress."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <FinanceCard
          style={[
            styles.warningCard,
            {
              backgroundColor: hexToRgba(colors.error, 0.1),
              borderColor: hexToRgba(colors.error, 0.16),
            },
          ]}
        >
          <Text style={[styles.warningEyebrow, { color: colors.error }]}>Confirm removal</Text>
          <Text style={[styles.warningTitle, { color: colors.text }]}>{goal.title}</Text>
          <Text style={[styles.warningBody, { color: hexToRgba(colors.text, 0.58) }]}>
            This is the compact confirm state from the kit flow. It keeps the user aware of the
            saved amount and target before deleting anything.
          </Text>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.56) }]}>Saved amount</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{formatCurrency(goal.saved)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.56) }]}>Target amount</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{formatCurrency(goal.target)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.56) }]}>Current progress</Text>
            <Text style={[styles.metaValue, { color: goal.accent }]}>
              {Math.round((goal.saved / goal.target) * 100)}%
            </Text>
          </View>
        </FinanceCard>

        <View style={styles.actionRow}>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title="Keep Goal"
              onPress={() => router.back()}
              colorBackground={colors.card}
              colorText={colors.text}
              style={[styles.actionButton, { borderWidth: 1, borderColor: colors.border }]}
            />
          </View>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title="Delete Goal"
              onPress={() =>
                router.replace({
                  pathname: '/(finance)/financial-goals/result',
                  params: { goalId: goal.id, mode: 'deleted' },
                })
              }
              colorBackground={colors.error}
              colorText={colors.card}
              style={styles.actionButton}
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
  warningCard: {
    borderWidth: 1,
  },
  warningEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  warningTitle: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  warningBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
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
