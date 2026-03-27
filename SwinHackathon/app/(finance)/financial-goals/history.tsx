import { getHistoryBackHref } from '@/app/(finance)/financial-goals/navigation';
import { hexToRgba } from '@/components/auth/AuthKit';
import { findFinancialGoalById } from '@/components/financial-goals/data';
import { GoalHistoryCard, GoalTransferList } from '@/components/financial-goals/ui';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { Typography } from '@/constants/theme';
import { useFinancialGoals } from '@/hooks/use-financial-goals';
import { useTheme } from '@/hooks/use-theme-colors';
import { useLocalSearchParams, useRouter } from '@/lib/expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function FinancialGoalHistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { goals, isUsingLiveGoals } = useFinancialGoals();
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();
  const initialGoal = findFinancialGoalById(goalId, goals) ?? goals[0] ?? null;
  const backHref = getHistoryBackHref({ goalId });
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(initialGoal?.id ?? null);
  const selectedGoal = useMemo(
    () => goals.find((goal) => goal.id === selectedGoalId) ?? initialGoal,
    [goals, initialGoal, selectedGoalId]
  );

  useEffect(() => {
    if (!selectedGoalId && goals[0]?.id) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

  if (isUsingLiveGoals) {
    return (
      <FinanceScreen
        title="Balance History"
        subtitle="This screen stays off until GoalWealth exposes goal history and transfer endpoints."
        contentStyle={styles.contentStyle}
        onBackPress={() => router.replace(backHref)}
      >
        <View style={styles.stack}>
          <FinanceCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>History is unavailable in live mode</Text>
            <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.56) }]}>
              The current backend only syncs core goal records. History charts and funding activity
              stay hidden until dedicated endpoints are available.
            </Text>
          </FinanceCard>
        </View>
      </FinanceScreen>
    );
  }

  return (
    <FinanceScreen
      title="Balance History"
      subtitle="Review growth, transfers and recurring funding without leaving the goals flow."
      contentStyle={styles.contentStyle}
      onBackPress={() => router.replace(backHref)}
    >
      <View style={styles.stack}>
        {!goals.length || !selectedGoal ? (
          <FinanceCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>No goal history yet</Text>
            <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.56) }]}> 
              Create a goal first, then its planner-derived balance history will appear here.
            </Text>
          </FinanceCard>
        ) : null}

        {goals.length ? (
          <View style={styles.filterRow}>
            {goals.map((goal) => {
              const active = goal.id === selectedGoalId;

              return (
                <Pressable
                  key={goal.id}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? goal.accent : colors.card,
                      borderColor: active ? goal.accent : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedGoalId(goal.id)}
                >
                  <Text style={[styles.filterText, { color: active ? colors.card : colors.text }]}> 
                    {goal.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {selectedGoal ? (
          <>
            <GoalHistoryCard
              title={selectedGoal.title}
              points={selectedGoal.history}
              accent={selectedGoal.accent}
              footer={`${selectedGoal.category} goal • ${selectedGoal.dueLabel}`}
            />

            <FinanceCard>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Funding activity</Text>
              <GoalTransferList rows={selectedGoal.transfers} />
            </FinanceCard>

            <FinanceCard
              style={[
                styles.noteCard,
                {
                  backgroundColor: hexToRgba(selectedGoal.accent, 0.08),
                  borderColor: hexToRgba(selectedGoal.accent, 0.16),
                },
              ]}
            >
              <Text style={[styles.noteTitle, { color: colors.text }]}>What this history says</Text>
              <Text style={[styles.noteBody, { color: hexToRgba(colors.text, 0.58) }]}> 
                {selectedGoal.title} is growing through a healthy mix of recurring transfers and occasional top ups.
                Keeping that balance makes the goal easier to maintain without feeling rigid.
              </Text>
            </FinanceCard>
          </>
        ) : null}
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  noteCard: {
    borderWidth: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  noteBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});
