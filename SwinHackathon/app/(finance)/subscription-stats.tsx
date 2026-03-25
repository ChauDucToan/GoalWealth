import { hexToRgba } from '@/components/auth/AuthKit';
import { subscriptionInsights, subscriptionItems, subscriptionRecommendations } from '@/components/finance/subscription-data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SubscriptionStatsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const mostExpensive = [...subscriptionItems].sort((a, b) => b.amount - a.amount);
  const usagePercent = Math.min(subscriptionInsights.totalMonthly / 60, 1);

  return (
    <FinanceScreen title="Stats & Insights" subtitle="Recurring spend trends, cost concentration and optimization suggestions." contentStyle={styles.contentStyle}>
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}> 
          <View style={styles.heroRow}>
            <View>
              <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.72) }]}>TOTAL RECURRING</Text>
              <Text style={[styles.heroValue, { color: colors.card }]}>{formatCurrency(subscriptionInsights.totalMonthly)}</Text>
              <Text style={[styles.heroMeta, { color: hexToRgba(colors.card, 0.72) }]}>{formatCurrency(subscriptionInsights.yearlyProjection)} projected yearly</Text>
            </View>
            <View style={[styles.ringWrap, { borderColor: hexToRgba(colors.card, 0.18) }]}>
              <View
                style={[
                  styles.ringProgress,
                  {
                    borderColor: colors.card,
                    transform: [{ rotate: `${usagePercent * 220 - 110}deg` }],
                  },
                ]}
              />
              <View style={[styles.ringCore, { backgroundColor: colors.card }]}> 
                <Text style={[styles.ringValue, { color: colors.primaryDark }]}>$42</Text>
              </View>
            </View>
          </View>
        </FinanceCard>

        <View style={styles.kpiRow}>
          <FinanceCard style={styles.kpiCard}>
            <Text style={[styles.kpiLabel, { color: hexToRgba(colors.text, 0.52) }]}>Active</Text>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{subscriptionInsights.activeCount}</Text>
          </FinanceCard>
          <FinanceCard style={styles.kpiCard}>
            <Text style={[styles.kpiLabel, { color: hexToRgba(colors.text, 0.52) }]}>Paused</Text>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{subscriptionInsights.pausedCount}</Text>
          </FinanceCard>
          <FinanceCard style={styles.kpiCard}>
            <Text style={[styles.kpiLabel, { color: hexToRgba(colors.text, 0.52) }]}>Nearest due</Text>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{subscriptionInsights.nextChargeLabel}</Text>
          </FinanceCard>
        </View>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Most costly subscriptions</Text>
          <View style={styles.listStack}>
            {mostExpensive.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={[styles.dot, { backgroundColor: item.accent }]} />
                <Text style={[styles.rowTitle, { color: colors.text }]}>{item.service}</Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Optimization recommendations</Text>
          <View style={styles.recommendationStack}>
            {subscriptionRecommendations.map((item) => (
              <View key={item.id} style={styles.recommendationRow}>
                <MaterialIcons name="lightbulb" size={18} color={colors.primaryDark} />
                <View style={styles.recommendationCopy}>
                  <Text style={[styles.recommendationTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.recommendationBody, { color: hexToRgba(colors.text, 0.56) }]}>{item.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    stack: { marginTop: 18, gap: 16 },
    heroCard: { borderWidth: 0 },
    heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    heroEyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
    heroValue: { marginTop: 6, fontSize: 38, fontWeight: '900', letterSpacing: -1 },
    heroMeta: { marginTop: 6, fontSize: 12, fontWeight: '600' },
    ringWrap: { width: 104, height: 104, borderRadius: 52, borderWidth: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    ringProgress: { position: 'absolute', width: 104, height: 104, borderRadius: 52, borderWidth: 12, borderRightColor: 'transparent', borderBottomColor: 'transparent' },
    ringCore: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
    ringValue: { fontSize: 18, fontWeight: '900' },
    kpiRow: { flexDirection: 'row', gap: 12 },
    kpiCard: { flex: 1 },
    kpiLabel: { fontSize: 12, fontWeight: '700' },
    kpiValue: { marginTop: 12, fontSize: 20, fontWeight: '900' },
    sectionTitle: { fontSize: 15, fontWeight: '800' },
    listStack: { marginTop: 16, gap: 12 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    rowTitle: { flex: 1, fontSize: 13, fontWeight: '700' },
    rowValue: { fontSize: 13, fontWeight: '800' },
    recommendationStack: { marginTop: 16, gap: 14 },
    recommendationRow: { flexDirection: 'row', gap: 12 },
    recommendationCopy: { flex: 1 },
    recommendationTitle: { fontSize: 13, fontWeight: '800' },
    recommendationBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  });
}
