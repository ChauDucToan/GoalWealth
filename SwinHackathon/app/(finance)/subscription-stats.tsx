import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import {
  subscriptionInsights,
  subscriptionItems,
  subscriptionRecommendations,
} from '@/components/finance/subscription-data';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SubscriptionStatsScreen() {
  const { colors } = useTheme();
  const activeItems = subscriptionItems.filter((item) => item.status === 'Active');
  const monthlySpend = activeItems.reduce((sum, item) => sum + item.amount, 0);
  const yearlyProjection = monthlySpend * 12;
  const pausedCount = subscriptionItems.length - activeItems.length;

  return (
    <FinanceScreen
      title="Stats & Insights"
      subtitle="A quick snapshot of subscription spend, patterns and recommendations"
    >
      <View style={styles.stack}>
        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>June overview</Text>
          <View style={styles.ringWrap}>
            <View style={[styles.ringShell, { borderColor: hexToRgba(colors.success, 0.18) }]}>
              <View
                style={[
                  styles.ringProgress,
                  { borderColor: colors.success, borderRightColor: colors.warning },
                ]}
              />
              <View style={[styles.ringInner, { backgroundColor: colors.card }]}>
                <Text style={[styles.ringValue, { color: colors.text }]}>
                  {formatCurrency(monthlySpend)}
                </Text>
                <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>Monthly spend</Text>
              </View>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSoft }]}>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {formatCurrency(yearlyProjection)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Yearly projection</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSoft }]}>
              <Text style={[styles.metricValue, { color: colors.warning }]}>{pausedCount}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Paused plans</Text>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Insights</Text>
          <View style={styles.insightStack}>
            {subscriptionInsights.map((item) => (
              <View
                key={item.id}
                style={[styles.insightRow, { backgroundColor: colors.backgroundSoft }]}
              >
                <Text style={[styles.insightValue, { color: colors[item.tone] }]}>{item.value}</Text>
                <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>{item.title}</Text>
              </View>
            ))}
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Optimization recommendations</Text>
          <View style={styles.recommendationStack}>
            {subscriptionRecommendations.map((item) => (
              <View key={item} style={styles.recommendationRow}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={[styles.recommendationText, { color: colors.text }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginTop: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  ringWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  ringShell: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringProgress: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 14,
    borderRadius: 74,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-18deg' }],
  },
  ringInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  ringLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  metricRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  insightStack: {
    marginTop: 16,
    gap: 10,
  },
  insightRow: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  insightLabel: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  recommendationStack: {
    marginTop: 16,
    gap: 12,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  recommendationText: {
    flex: 1,
    minWidth: 0,
    fontSize: Typography.body,
    lineHeight: 20,
  },
});
