import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import {
  subscriptionDueDateOptions,
  subscriptionItems,
  type SubscriptionItem,
} from '@/components/finance/subscription-data';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from '@/lib/expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function getSortIndex(nextPayment: string) {
  const index = subscriptionDueDateOptions.indexOf(nextPayment);
  return index === -1 ? subscriptionDueDateOptions.length + 1 : index;
}

function DatePill({ item }: { item: SubscriptionItem }) {
  const { colors } = useTheme();
  const accent = colors[item.tone];
  const [month = 'Now', day = '--'] = item.nextPayment === 'Paused' ? ['Paused', '--'] : item.nextPayment.split(' ');

  return (
    <View
      style={[
        styles.datePill,
        {
          backgroundColor:
            item.nextPayment === 'Paused'
              ? hexToRgba(colors.warning, 0.1)
              : hexToRgba(accent, 0.12),
        },
      ]}
    >
      <Text style={[styles.dateMonth, { color: hexToRgba(colors.text, 0.52) }]}>{month}</Text>
      <Text style={[styles.dateDay, { color: item.nextPayment === 'Paused' ? colors.warning : accent }]}>
        {day}
      </Text>
    </View>
  );
}

export default function SubscriptionUpcomingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const upcomingItems = [...subscriptionItems].sort(
    (left, right) => getSortIndex(left.nextPayment) - getSortIndex(right.nextPayment)
  );
  const dueSoonCount = upcomingItems.filter((item) => item.status === 'Active').length;

  return (
    <FinanceScreen
      title="Upcoming"
      subtitle="Review upcoming renewals and stay ahead of your recurring bills"
    >
      <View style={styles.stack}>
        <FinanceCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.success, 0.08),
              borderColor: hexToRgba(colors.success, 0.14),
            },
          ]}
        >
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {dueSoonCount} subscriptions are coming up soon
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.58) }]}>
            Keep an eye on upcoming renewals, paused services and the next bill you may want to
            act on first.
          </Text>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Renewal timeline</Text>
          <View style={styles.listStack}>
            {upcomingItems.map((item) => {
              const accent = colors[item.tone];

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.row,
                    {
                      backgroundColor: colors.backgroundSoft,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/(finance)/subscription/[id]',
                      params: { id: item.id },
                    })
                  }
                >
                  <DatePill item={item} />
                  <View style={styles.rowCopy}>
                    <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.rowMeta, { color: hexToRgba(colors.text, 0.56) }]} numberOfLines={1}>
                      {item.plan} • {item.paymentMethod}
                    </Text>
                  </View>
                  <View style={styles.rowAside}>
                    <Text style={[styles.rowAmount, { color: accent }]}>{`$${item.amount.toFixed(2)}`}</Text>
                    <Text style={[styles.rowStatus, { color: hexToRgba(colors.text, 0.52) }]}>
                      {item.status}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <ThemeButton
          title="View Payment History"
          onPress={() => router.push('/(finance)/subscription-payments')}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
        />
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginTop: 18,
    gap: 14,
  },
  heroCard: {
    borderWidth: 1,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  heroBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  listStack: {
    marginTop: 16,
    gap: 12,
  },
  row: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  datePill: {
    width: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateDay: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '800',
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  rowMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  rowAside: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  rowStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
});
