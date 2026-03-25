import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import {
  FinancialGoalHistoryPoint,
  FinancialGoalItem,
  FinancialGoalTransfer,
} from '@/components/financial-goals/data';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function GoalProgressRing({
  accent,
  progress,
  centerValue,
  caption,
  size = 180,
  strokeWidth = 16,
}: {
  accent: string;
  progress: number;
  centerValue: string;
  caption: string;
  size?: number;
  strokeWidth?: number;
}) {
  const { colors } = useTheme();
  const normalized = Math.max(0.08, Math.min(progress, 1));
  const rotation = `${Math.round(normalized * 240 - 120)}deg`;

  return (
    <View style={[styles.ringShell, { width: size, height: size }]}>
      <View
        style={[
          styles.ringTrack,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: hexToRgba(accent, 0.18),
          },
        ]}
      />
      <View
        style={[
          styles.ringProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: accent,
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [{ rotate: rotation }],
          },
        ]}
      />
      <View
        style={[
          styles.ringCore,
          {
            width: size - strokeWidth * 3,
            height: size - strokeWidth * 3,
            borderRadius: (size - strokeWidth * 3) / 2,
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text style={[styles.ringValue, { color: colors.text }]}>{centerValue}</Text>
        <Text style={[styles.ringCaption, { color: hexToRgba(colors.text, 0.54) }]}>{caption}</Text>
      </View>
    </View>
  );
}

export function GoalHistoryCard({
  title,
  points,
  accent,
  footer,
}: {
  title: string;
  points: FinancialGoalHistoryPoint[];
  accent: string;
  footer?: string;
}) {
  const { colors } = useTheme();
  const maxValue = Math.max(...points.map((point) => point.amount), 1);

  return (
    <FinanceCard>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.historyChart}>
        {points.map((point) => {
          const height = 34 + Math.round((point.amount / maxValue) * 74);

          return (
            <View key={point.id} style={styles.historyColumn}>
              <View
                style={[
                  styles.historyBar,
                  {
                    height,
                    backgroundColor:
                      point === points[points.length - 1]
                        ? accent
                        : hexToRgba(accent, 0.2),
                  },
                ]}
              />
              <Text style={[styles.historyLabel, { color: hexToRgba(colors.text, 0.5) }]}>
                {point.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.historySummary}>
        <Text style={[styles.historyValue, { color: colors.text }]}>
          {formatCurrency(points[points.length - 1]?.amount ?? 0)}
        </Text>
        {footer ? (
          <Text style={[styles.historyFooter, { color: hexToRgba(colors.text, 0.54) }]}>
            {footer}
          </Text>
        ) : null}
      </View>
    </FinanceCard>
  );
}

export function GoalTransferList({
  rows,
}: {
  rows: FinancialGoalTransfer[];
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.transferStack}>
      {rows.map((row, index) => (
        <View
          key={row.id}
          style={[
            styles.transferRow,
            index < rows.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
        >
          <View
            style={[
              styles.transferIcon,
              {
                backgroundColor:
                  row.type === 'Recurring transfer'
                    ? hexToRgba(colors.success, 0.14)
                    : hexToRgba(colors.primaryDark, 0.1),
              },
            ]}
          >
            <MaterialIcons
              name={row.type === 'Recurring transfer' ? 'autorenew' : 'savings'}
              size={18}
              color={row.type === 'Recurring transfer' ? colors.success : colors.primaryDark}
            />
          </View>

          <View style={styles.transferCopy}>
            <Text style={[styles.transferTitle, { color: colors.text }]}>{row.label}</Text>
            <Text style={[styles.transferMeta, { color: hexToRgba(colors.text, 0.54) }]}>
              {row.type} • {row.date}
            </Text>
          </View>

          <View style={styles.transferAmountWrap}>
            <Text style={[styles.transferAmount, { color: colors.text }]}>
              {formatCurrency(row.amount)}
            </Text>
            <Text
              style={[
                styles.transferStatus,
                {
                  color: row.status === 'Completed' ? colors.success : colors.warning,
                },
              ]}
            >
              {row.status}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function GoalPriorityStack({
  goals,
}: {
  goals: FinancialGoalItem[];
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.priorityStack}>
      {goals.map((goal) => (
        <View
          key={goal.id}
          style={[
            styles.priorityRow,
            { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
          ]}
        >
          <View style={[styles.priorityIndex, { backgroundColor: hexToRgba(goal.accent, 0.12) }]}>
            <Text style={[styles.priorityIndexText, { color: goal.accent }]}>
              {goal.priorityOrder}
            </Text>
          </View>
          <View style={styles.priorityCopy}>
            <Text style={[styles.priorityTitle, { color: colors.text }]}>{goal.title}</Text>
            <Text style={[styles.priorityMeta, { color: hexToRgba(colors.text, 0.54) }]}>
              {goal.priority} priority • {goal.allowedRisk}
            </Text>
          </View>
          <Text style={[styles.priorityValue, { color: goal.accent }]}>
            {Math.round(goal.feasibilityProbability * 100)}%
          </Text>
        </View>
      ))}
    </View>
  );
}

export function FeasibilityMeter({
  probability,
  accent,
}: {
  probability: number;
  accent: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.meterWrap}>
      <View
        style={[
          styles.meterTrack,
          { backgroundColor: hexToRgba(accent, 0.14) },
        ]}
      >
        <View
          style={[
            styles.meterValue,
            {
              width: `${Math.min(probability * 100, 100)}%`,
              backgroundColor: accent,
            },
          ]}
        />
      </View>
      <Text style={[styles.meterLabel, { color: hexToRgba(colors.text, 0.54) }]}>
        {Math.round(probability * 100)}% estimated feasibility
      </Text>
    </View>
  );
}

export function FundingGapSummary({
  gap,
  monthlyAllocation,
}: {
  gap: number;
  monthlyAllocation: number;
}) {
  const { colors } = useTheme();
  const months = Math.max(1, Math.ceil(gap / Math.max(monthlyAllocation, 1)));

  return (
    <View
      style={[
        styles.fundingGapCard,
        { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.fundingGapValue, { color: colors.text }]}>
        {formatCurrency(gap)}
      </Text>
      <Text style={[styles.fundingGapLabel, { color: hexToRgba(colors.text, 0.54) }]}>
        still needs funding
      </Text>
      <Text style={[styles.fundingGapMeta, { color: colors.primaryDark }]}>
        About {months} months at the recommended pace
      </Text>
    </View>
  );
}

export function GoalConflictNotice({
  conflicts,
}: {
  conflicts: string[];
}) {
  const { colors } = useTheme();

  if (!conflicts.length) {
    return null;
  }

  return (
    <View
      style={[
        styles.conflictCard,
        { backgroundColor: hexToRgba(colors.warning, 0.08) },
      ]}
    >
      <Text style={[styles.conflictTitle, { color: colors.text }]}>Trade-off notice</Text>
      <Text style={[styles.conflictBody, { color: hexToRgba(colors.text, 0.56) }]}>
        Funding this goal earlier will temporarily slow: {conflicts.join(', ')}.
      </Text>
    </View>
  );
}

export function GoalRecommendationSummary({
  goal,
}: {
  goal: FinancialGoalItem;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.recommendationCard,
        { backgroundColor: hexToRgba(goal.accent, 0.08) },
      ]}
    >
      <Text style={[styles.recommendationTitle, { color: colors.text }]}>
        Why this allocation comes first
      </Text>
      <Text style={[styles.recommendationBody, { color: hexToRgba(colors.text, 0.56) }]}>
        {goal.priority} priority goals are funded first in GoalWealth. This goal currently receives
        {` ${formatCurrency(goal.recommendedMonthlyAllocation)}/mo `}because it must protect the plan
        before lower-priority goals absorb the remaining free cash.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ringShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
  },
  ringProgress: {
    position: 'absolute',
  },
  ringCore: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  ringValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  ringCaption: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  historyChart: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    minHeight: 132,
  },
  historyColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  historyBar: {
    width: '100%',
    minWidth: 18,
    borderRadius: 14,
  },
  historyLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  historySummary: {
    marginTop: 16,
    gap: 6,
  },
  historyValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  historyFooter: {
    fontSize: Typography.body,
    lineHeight: 19,
  },
  transferStack: {
    marginTop: 14,
  },
  transferRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transferIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferCopy: {
    flex: 1,
    minWidth: 0,
  },
  transferTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  transferMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  transferAmountWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transferAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  transferStatus: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  priorityStack: {
    gap: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  priorityIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityIndexText: {
    fontSize: 12,
    fontWeight: '800',
  },
  priorityCopy: {
    flex: 1,
    minWidth: 0,
  },
  priorityTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  priorityMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  priorityValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  meterWrap: {
    gap: 6,
  },
  meterTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  meterValue: {
    height: '100%',
    borderRadius: 999,
  },
  meterLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  fundingGapCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  fundingGapValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  fundingGapLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fundingGapMeta: {
    fontSize: 11,
    fontWeight: '800',
  },
  conflictCard: {
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  conflictTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  conflictBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  recommendationCard: {
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  recommendationTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  recommendationBody: {
    fontSize: 12,
    lineHeight: 18,
  },
});
