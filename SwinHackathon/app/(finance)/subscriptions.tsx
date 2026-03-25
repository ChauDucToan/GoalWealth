import { hexToRgba } from '@/components/auth/AuthKit';
import {
  getSubscriptionById,
  subscriptionCalendar,
  subscriptionHistoryRows,
  subscriptionInsights,
  subscriptionItems,
  subscriptionRecommendations,
} from '@/components/finance/subscription-data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SubscriptionsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const recentPayments = subscriptionHistoryRows.slice(0, 4);
  const highlighted = getSubscriptionById('netflix');
  const usagePercent = Math.min(subscriptionInsights.totalMonthly / 60, 1);

  return (
    <FinanceScreen
      title="My Subscription"
      subtitle="Recurring spend, due dates, payment history and optimization in one workspace."
      contentStyle={styles.contentStyle}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(finance)/subscription-add')}
        >
          <MaterialIcons name="add" size={20} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={[styles.heroEyebrow, { color: colors.primaryDark }]}>MY SUBSCRIPTION</Text>
              <Text style={[styles.heroValue, { color: colors.text }]}>{formatCurrency(subscriptionInsights.totalMonthly)}</Text>
              <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>Monthly recurring spend across active subscriptions.</Text>
            </View>
            <Pressable
              style={[styles.heroIconButton, { backgroundColor: colors.primaryDark }]}
              onPress={() => router.push('/(finance)/subscription-setup')}
            >
              <MaterialIcons name="auto-awesome" size={18} color={colors.card} />
            </Pressable>
          </View>

          <View style={styles.heroMetrics}>
            <View style={[styles.heroMetricCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.text, 0.52) }]}>Yearly</Text>
              <Text style={[styles.heroMetricValue, { color: colors.text }]}>{formatCurrency(subscriptionInsights.yearlyProjection)}</Text>
            </View>
            <View style={[styles.heroMetricCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.text, 0.52) }]}>Active</Text>
              <Text style={[styles.heroMetricValue, { color: colors.text }]}>{subscriptionInsights.activeCount}</Text>
            </View>
            <View style={[styles.heroMetricCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.text, 0.52) }]}>Paused</Text>
              <Text style={[styles.heroMetricValue, { color: colors.text }]}>{subscriptionInsights.pausedCount}</Text>
            </View>
          </View>

          <View style={styles.heroBottomRow}>
            <View style={[styles.calendarCard, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming</Text>
                <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>May</Text>
              </View>
              {subscriptionCalendar.map((item) => (
                <View key={item.label} style={styles.calendarRow}>
                  <View style={styles.calendarHead}>
                    <View style={[styles.calendarDot, { backgroundColor: item.accent }]} />
                    <View>
                      <Text style={[styles.calendarTitle, { color: colors.text }]}>{item.service}</Text>
                      <Text style={[styles.calendarMeta, { color: hexToRgba(colors.text, 0.52) }]}>{item.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.calendarAmount, { color: colors.text }]}>{item.amount}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.summaryPanel, { backgroundColor: colors.card }]}>
              <View style={[styles.ringWrap, { borderColor: hexToRgba(colors.primaryDark, 0.16) }]}>
                <View
                  style={[
                    styles.ringProgress,
                    {
                      borderColor: colors.primaryDark,
                      transform: [{ rotate: `${usagePercent * 220 - 110}deg` }],
                    },
                  ]}
                />
                <View style={[styles.ringCore, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                  <Text style={[styles.ringValue, { color: colors.primaryDark }]}>$42</Text>
                </View>
              </View>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Active budget</Text>
              <Text style={[styles.summaryBody, { color: hexToRgba(colors.text, 0.52) }]}>Recurring cost concentration this month.</Text>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard style={[styles.signalCard, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Signal</Text>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Nearest charge</Text>
          </View>
          <View style={styles.signalRow}>
            <View>
              <Text style={[styles.signalValue, { color: colors.text }]}>{subscriptionInsights.nextChargeLabel}</Text>
              <Text style={[styles.signalBody, { color: hexToRgba(colors.text, 0.56) }]}>Next renewal check across your active services.</Text>
            </View>
            <View style={[styles.signalBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
              <MaterialIcons name="schedule" size={18} color={colors.primaryDark} />
            </View>
          </View>
        </FinanceCard>

        <View style={styles.splitRow}>
          <FinanceCard style={styles.splitCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>My Payments</Text>
              <Pressable onPress={() => router.push('/(finance)/subscription-payments')}>
                <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open</Text>
              </Pressable>
            </View>
            <Text style={[styles.miniValue, { color: colors.text }]}>{subscriptionInsights.nextChargeLabel}</Text>
            <Text style={[styles.miniBody, { color: hexToRgba(colors.text, 0.56) }]}>Nearest charge date with active reminders and payment checks.</Text>
          </FinanceCard>

          <FinanceCard style={styles.splitCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Stats & Insights</Text>
              <Pressable onPress={() => router.push('/(finance)/subscription-stats')}>
                <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open</Text>
              </Pressable>
            </View>
            <View style={[styles.ringWrap, { borderColor: hexToRgba(colors.primaryDark, 0.16) }]}>
              <View style={[styles.ringCore, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                <Text style={[styles.ringValue, { color: colors.primaryDark }]}>$42</Text>
              </View>
            </View>
          </FinanceCard>
        </View>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active subscriptions</Text>
            <Pressable onPress={() => router.push('/(finance)/subscription-history')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>History</Text>
            </Pressable>
          </View>

          <View style={styles.listStack}>
            {subscriptionItems.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.subscriptionRow, { borderColor: colors.border }]}
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/subscription/[id]',
                    params: { id: item.id },
                  })
                }
              >
                <View style={[styles.serviceIcon, { backgroundColor: hexToRgba(item.accent, 0.12) }]}>
                  <MaterialIcons name={item.icon} size={20} color={item.accent} />
                </View>
                <View style={styles.serviceCopy}>
                  <Text style={[styles.serviceTitle, { color: colors.text }]}>{item.service}</Text>
                  <Text style={[styles.serviceMeta, { color: hexToRgba(colors.text, 0.5) }]}>{item.plan} • {item.cycle}</Text>
                </View>
                <View style={styles.serviceRight}>
                  <Text style={[styles.serviceAmount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                  <Text style={[styles.serviceDue, { color: item.status === 'paused' ? colors.warning : colors.primaryDark }]}>{item.nextPayment}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent payments</Text>
            <Pressable onPress={() => router.push('/(finance)/subscription-payments?mode=empty')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>No result state</Text>
            </Pressable>
          </View>
          <View style={styles.listStack}>
            {recentPayments.map((item) => (
              <View key={item.id} style={styles.paymentRow}>
                <View style={[styles.paymentIcon, { backgroundColor: hexToRgba(item.accent, 0.12) }]}>
                  <MaterialIcons name={item.icon} size={18} color={item.accent} />
                </View>
                <View style={styles.paymentCopy}>
                  <Text style={[styles.paymentTitle, { color: colors.text }]}>{item.service}</Text>
                  <Text style={[styles.paymentMeta, { color: hexToRgba(colors.text, 0.52) }]}>{item.date}</Text>
                </View>
                <Text style={[styles.paymentAmount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>
        </FinanceCard>

        <FinanceCard style={[styles.recommendationCard, { backgroundColor: hexToRgba(highlighted.accent, 0.08) }]}>
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
    headerAction: { width: 38, height: 38, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    heroCard: { borderWidth: 0, gap: 16 },
    heroHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    heroEyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
    heroValue: { marginTop: 6, fontSize: 38, fontWeight: '900', letterSpacing: -1.1 },
    heroBody: { marginTop: 8, fontSize: 13, lineHeight: 19, fontWeight: '500' },
    heroIconButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    heroMetrics: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
    heroMetricCard: { flex: 1, borderRadius: 18, padding: 14 },
    heroMetricLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 },
    heroMetricValue: { marginTop: 4, fontSize: 17, fontWeight: '800' },
    heroBottomRow: { flexDirection: 'row', gap: 12 },
    calendarCard: { borderRadius: 22, padding: 14, gap: 12 },
    summaryPanel: { width: 120, borderRadius: 22, padding: 14, alignItems: 'center', justifyContent: 'center' },
    calendarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    calendarHead: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    calendarDot: { width: 10, height: 10, borderRadius: 5 },
    calendarTitle: { fontSize: 13, fontWeight: '700' },
    calendarMeta: { marginTop: 2, fontSize: 11, fontWeight: '600' },
    calendarAmount: { fontSize: 13, fontWeight: '800' },
    summaryTitle: { marginTop: 12, fontSize: 13, fontWeight: '800', textAlign: 'center' },
    summaryBody: { marginTop: 4, fontSize: 11, lineHeight: 16, fontWeight: '500', textAlign: 'center' },
    signalCard: { minHeight: 112 },
    signalRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    signalValue: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
    signalBody: { marginTop: 6, fontSize: 12, lineHeight: 18, fontWeight: '500', maxWidth: 220 },
    signalBadge: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    splitRow: { flexDirection: 'row', gap: 12 },
    splitCard: { flex: 1, minHeight: 162 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    sectionTitle: { fontSize: 15, fontWeight: '800' },
    sectionLink: { fontSize: 12, fontWeight: '800' },
    miniValue: { marginTop: 16, fontSize: 30, fontWeight: '900', letterSpacing: -0.8 },
    miniBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    ringWrap: { width: 96, height: 96, marginTop: 10, borderRadius: 48, borderWidth: 10, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', overflow: 'hidden' },
    ringProgress: { position: 'absolute', width: 96, height: 96, borderRadius: 48, borderWidth: 10, borderRightColor: 'transparent', borderBottomColor: 'transparent' },
    ringCore: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    ringValue: { fontSize: 20, fontWeight: '900' },
    listStack: { marginTop: 16, gap: 12 },
    subscriptionRow: { borderWidth: 1, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    serviceIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    serviceCopy: { flex: 1 },
    serviceTitle: { fontSize: 14, fontWeight: '800' },
    serviceMeta: { marginTop: 4, fontSize: 12, fontWeight: '600' },
    serviceRight: { alignItems: 'flex-end' },
    serviceAmount: { fontSize: 13, fontWeight: '800' },
    serviceDue: { marginTop: 4, fontSize: 11, fontWeight: '700' },
    paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    paymentIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    paymentCopy: { flex: 1 },
    paymentTitle: { fontSize: 13, fontWeight: '800' },
    paymentMeta: { marginTop: 3, fontSize: 11, fontWeight: '600' },
    paymentAmount: { fontSize: 13, fontWeight: '800' },
    recommendationCard: { borderWidth: 0 },
    recommendationStack: { marginTop: 14, gap: 14 },
    recommendationRow: { flexDirection: 'row', gap: 12 },
    recommendationCopy: { flex: 1 },
    recommendationTitle: { fontSize: 13, fontWeight: '800' },
    recommendationBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  });
}
