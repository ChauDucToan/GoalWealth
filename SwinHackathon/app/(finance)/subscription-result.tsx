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

const RESULT_COPY = {
  added: {
    title: 'Subscription Added.',
    body: 'The new recurring service is now visible in the workspace and payment sections.',
    icon: 'check-circle',
  },
  updated: {
    title: 'Subscription Updated.',
    body: 'The edited plan details have been refreshed in the subscription workspace.',
    icon: 'task-alt',
  },
  paused: {
    title: 'Subscription Paused.',
    body: 'The plan is paused and will stay visible for later review or reactivation.',
    icon: 'pause-circle',
  },
  reactivated: {
    title: 'Subscription Activated.',
    body: 'The plan is active again and upcoming payments will resume in the dashboard.',
    icon: 'play-circle',
  },
  cancelled: {
    title: 'Subscription Cancelled.',
    body: 'The cancellation state is stored so the service remains visible in your history.',
    icon: 'cancel',
  },
} as const;

export default function SubscriptionResultScreen() {
  const { mode, id } = useLocalSearchParams<{ mode?: keyof typeof RESULT_COPY; id?: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const item = getSubscriptionById(id);
  const copy = RESULT_COPY[mode ?? 'added'] ?? RESULT_COPY.added;
  const toneColor =
    mode === 'cancelled'
      ? colors.error
      : mode === 'paused'
        ? colors.warning
        : colors.primaryDark;

  return (
    <FinanceScreen title="Subscription Result" subtitle="Confirmation state after a create, update or lifecycle action." contentStyle={styles.contentStyle}>
      <View style={styles.stack}>
        <FinanceCard style={[styles.resultCard, { backgroundColor: hexToRgba(toneColor, 0.06) }]}>
          <View style={[styles.resultBadge, { backgroundColor: hexToRgba(toneColor, 0.1) }]}>
            <MaterialIcons name={copy.icon} size={42} color={toneColor} />
          </View>
          <Text style={[styles.resultTitle, { color: colors.text }]}>{copy.title}</Text>
          <Text style={[styles.resultBody, { color: hexToRgba(colors.text, 0.56) }]}>{copy.body}</Text>
          <View style={[styles.resultPill, { backgroundColor: colors.card, borderColor: hexToRgba(toneColor, 0.18) }]}>
            <Text style={[styles.resultPillText, { color: toneColor }]}>
              {mode === 'cancelled' ? 'Moved to inactive history' : mode === 'paused' ? 'Renewal flow paused' : 'Workspace updated'}
            </Text>
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
          <View style={styles.summaryStack}>
            {[
              { label: 'Subscription', value: item.service },
              { label: 'Plan', value: item.plan },
              { label: 'Next payment', value: item.nextPayment },
              { label: 'Amount', value: formatCurrency(item.amount) },
            ].map((row) => (
              <View key={row.label} style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.52) }]}>{row.label}</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        </FinanceCard>

        <View style={styles.actionStack}>
          <Pressable style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]} onPress={() => router.push({ pathname: '/(finance)/subscription/[id]', params: { id: item.id } })}>
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>Open details</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.replace('/(finance)/subscriptions')}>
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back to subscriptions</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(finance)/subscription-add')}>
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Add another subscription</Text>
          </Pressable>
        </View>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    stack: { marginTop: 18, gap: 16 },
    resultCard: { alignItems: 'center', paddingVertical: 28 },
    resultBadge: { width: 88, height: 88, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    resultTitle: { marginTop: 16, fontSize: 20, fontWeight: '900', textAlign: 'center' },
    resultBody: { marginTop: 8, fontSize: 13, lineHeight: 19, fontWeight: '500', textAlign: 'center' },
    resultPill: { marginTop: 14, minHeight: 34, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
    resultPillText: { fontSize: 11, fontWeight: '800' },
    sectionTitle: { fontSize: 15, fontWeight: '800' },
    summaryStack: { marginTop: 16, gap: 14 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    summaryLabel: { fontSize: 12, fontWeight: '700' },
    summaryValue: { fontSize: 13, fontWeight: '800', textAlign: 'right', flexShrink: 1 },
    actionStack: { gap: 10 },
    primaryButton: { minHeight: 50, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
    secondaryButton: { minHeight: 50, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    secondaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
