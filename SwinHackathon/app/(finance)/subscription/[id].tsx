import { hexToRgba } from '@/components/auth/AuthKit';
import { getSubscriptionById } from '@/components/finance/subscription-data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const item = getSubscriptionById(id);
  const activeMode = item.status === 'paused' ? 'reactivated' : 'paused';
  const totalTracked = item.charges.filter((charge) => charge.status === 'paid').reduce((sum, charge) => sum + charge.amount, 0);

  return (
    <FinanceScreen
      title={item.service}
      subtitle={`${item.category} • ${item.plan}`}
      contentStyle={styles.contentStyle}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push({ pathname: '/(finance)/subscription-add', params: { preset: item.id } })}
        >
          <MaterialIcons name="edit" size={18} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: hexToRgba(item.accent, 0.12) }]}> 
          <View style={styles.heroTop}>
            <View style={[styles.serviceIcon, { backgroundColor: item.accent }]}>
              <MaterialIcons name={item.icon} size={22} color={colors.card} />
            </View>
            <View style={[styles.statusPill, { backgroundColor: item.status === 'paused' ? hexToRgba(colors.warning, 0.14) : hexToRgba(colors.primaryDark, 0.12) }]}>
              <Text style={[styles.statusText, { color: item.status === 'paused' ? colors.warning : colors.primaryDark }]}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={[styles.heroAmount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
          <Text style={[styles.heroCycle, { color: hexToRgba(colors.text, 0.56) }]}>{item.cycle} • next payment {item.nextPayment}</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.62) }]}>{item.description}</Text>
          <View style={styles.timelineRow}>
            {item.charges.map((charge, index) => (
              <View key={charge.id} style={styles.timelineStep}>
                <View style={[styles.timelineDot, { backgroundColor: charge.status === 'pending' ? hexToRgba(item.accent, 0.22) : item.accent }]} />
                {index < item.charges.length - 1 ? <View style={[styles.timelineLine, { backgroundColor: hexToRgba(item.accent, 0.18) }]} /> : null}
              </View>
            ))}
          </View>
        </FinanceCard>

        <View style={styles.metricRow}>
          <FinanceCard style={styles.metricCard}>
            <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.52) }]}>Started on</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{item.startedOn}</Text>
          </FinanceCard>
          <FinanceCard style={styles.metricCard}>
            <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.52) }]}>Tracked total</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{formatCurrency(totalTracked)}</Text>
          </FinanceCard>
        </View>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Plan summary</Text>
          <View style={styles.planSummaryRow}>
            <View style={[styles.planSummaryCard, { backgroundColor: colors.backgroundSoft }]}>
              <Text style={[styles.planSummaryLabel, { color: hexToRgba(colors.text, 0.52) }]}>Current plan</Text>
              <Text style={[styles.planSummaryValue, { color: colors.text }]}>{item.plan}</Text>
            </View>
            <View style={[styles.planSummaryCard, { backgroundColor: colors.backgroundSoft }]}>
              <Text style={[styles.planSummaryLabel, { color: hexToRgba(colors.text, 0.52) }]}>Payment method</Text>
              <Text style={[styles.planSummaryValue, { color: colors.text }]}>{item.paymentMethod}</Text>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Billing setup</Text>
          <View style={styles.infoStack}>
            {[
              { label: 'Category', value: item.category },
              { label: 'Type', value: item.type },
              { label: 'Auto renew', value: item.autoRenew ? 'Enabled' : 'Disabled' },
            ].map((row) => (
              <View key={row.label} style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: hexToRgba(colors.text, 0.52) }]}>{row.label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent charges</Text>
          <View style={styles.chargeStack}>
            {item.charges.map((charge) => (
              <View key={charge.id} style={styles.chargeRow}>
                <View>
                  <Text style={[styles.chargeTitle, { color: colors.text }]}>{charge.label}</Text>
                  <Text style={[styles.chargeMeta, { color: hexToRgba(colors.text, 0.52) }]}>{charge.date}</Text>
                </View>
                <Text style={[styles.chargeAmount, { color: charge.status === 'pending' ? colors.warning : colors.text }]}>{formatCurrency(charge.amount)}</Text>
              </View>
            ))}
          </View>
        </FinanceCard>

        <View style={styles.actionStack}>
          <Pressable style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]} onPress={() => router.push({ pathname: '/(finance)/subscription-add', params: { preset: item.id } })}>
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>Change plan</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push({ pathname: '/(finance)/subscription-result', params: { mode: activeMode, id: item.id } })}>
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{item.status === 'paused' ? 'Activate subscription' : 'Pause subscription'}</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: hexToRgba(colors.error, 0.2) }]} onPress={() => router.push({ pathname: '/(finance)/subscription-result', params: { mode: 'cancelled', id: item.id } })}>
            <Text style={[styles.secondaryButtonText, { color: colors.error }]}>Cancel subscription</Text>
          </Pressable>
        </View>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    headerAction: { width: 38, height: 38, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    stack: { marginTop: 18, gap: 16 },
    heroCard: { borderWidth: 0 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    serviceIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    statusPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
    statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.7 },
    heroAmount: { marginTop: 18, fontSize: 38, fontWeight: '900', letterSpacing: -1 },
    heroCycle: { marginTop: 6, fontSize: 13, fontWeight: '700' },
    heroBody: { marginTop: 10, fontSize: 13, lineHeight: 19, fontWeight: '500' },
    timelineRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center' },
    timelineStep: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    timelineDot: { width: 12, height: 12, borderRadius: 6 },
    timelineLine: { flex: 1, height: 3, borderRadius: 999, marginHorizontal: 6 },
    metricRow: { flexDirection: 'row', gap: 12 },
    metricCard: { flex: 1, minHeight: 112 },
    metricLabel: { fontSize: 12, fontWeight: '700' },
    metricValue: { marginTop: 14, fontSize: 18, fontWeight: '800' },
    sectionTitle: { fontSize: 15, fontWeight: '800' },
    planSummaryRow: { marginTop: 16, flexDirection: 'row', gap: 12 },
    planSummaryCard: { flex: 1, borderRadius: 18, padding: 14 },
    planSummaryLabel: { fontSize: 11, fontWeight: '700' },
    planSummaryValue: { marginTop: 6, fontSize: 13, fontWeight: '800' },
    infoStack: { marginTop: 16, gap: 14 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    infoLabel: { fontSize: 12, fontWeight: '700' },
    infoValue: { fontSize: 13, fontWeight: '800' },
    chargeStack: { marginTop: 16, gap: 14 },
    chargeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    chargeTitle: { fontSize: 13, fontWeight: '800' },
    chargeMeta: { marginTop: 4, fontSize: 11, fontWeight: '600' },
    chargeAmount: { fontSize: 13, fontWeight: '800' },
    actionStack: { gap: 10 },
    primaryButton: { minHeight: 50, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
    secondaryButton: { minHeight: 50, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    secondaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
