import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { subscriptionItems } from '@/components/finance/subscription-data';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SubscriptionHistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <FinanceScreen
      title="My Subscription History"
      subtitle="Review tracked plans, payment totals and current renewal status"
    >
      <View style={styles.stack}>
        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tracked plans</Text>
          <View style={styles.listStack}>
            {subscriptionItems.map((item) => {
              const accent = colors[item.tone];
              const totalPaid = item.charges.reduce((sum, charge) => sum + charge.amount, 0);

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.historyCard,
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
                  <View style={[styles.historyIcon, { backgroundColor: hexToRgba(accent, 0.12) }]}>
                    <MaterialIcons name={item.icon} size={18} color={accent} />
                  </View>
                  <View style={styles.historyCopy}>
                    <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.historyMeta, { color: hexToRgba(colors.text, 0.56) }]} numberOfLines={1}>
                      {item.plan} • {item.startedOn} • {item.paymentMethod}
                    </Text>
                    <Text style={[styles.historySpent, { color: accent }]}>
                      {formatCurrency(totalPaid)} total paid
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          item.status === 'Active'
                            ? hexToRgba(colors.success, 0.12)
                            : hexToRgba(colors.warning, 0.12),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: item.status === 'Active' ? colors.success : colors.warning },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
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
  listStack: {
    marginTop: 16,
    gap: 12,
  },
  historyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  historyIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCopy: {
    flex: 1,
    minWidth: 0,
  },
  historyTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  historyMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  historySpent: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '800',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
