import {
  financialGoals,
  getFinancialGoalById,
} from '@/components/financial-goals/data';
import {
  GoalHistoryCard,
  GoalTransferList,
} from '@/components/financial-goals/ui';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { useTheme } from '@/hooks/use-theme-colors';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { hexToRgba } from '@/components/auth/AuthKit';

export default function FinancialGoalHistoryScreen() {
  const { colors } = useTheme();
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();
  const initialGoal = getFinancialGoalById(goalId);
  const [selectedGoalId, setSelectedGoalId] = useState(initialGoal.id);
  const selectedGoal = useMemo(
    () => financialGoals.find((goal) => goal.id === selectedGoalId) ?? initialGoal,
    [initialGoal, selectedGoalId]
  );

  return (
    <FinanceScreen
      title="Balance History"
      subtitle="Review growth, transfers and recurring funding without leaving the goals flow."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <View style={styles.filterRow}>
          {financialGoals.map((goal) => {
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
