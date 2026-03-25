import { hexToRgba } from '@/components/auth/AuthKit';
import { subscriptionItems } from '@/components/finance/subscription-data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SubscriptionPaymentsScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const isEmpty = mode === 'empty';
  const upcoming = subscriptionItems.filter((item) => item.status !== 'cancelled');

  return (
    <FinanceScreen
      title="My Payments"
      subtitle={isEmpty ? 'Empty or search-not-found state for payments.' : 'Upcoming and expected subscription renewals.'}
      contentStyle={styles.contentStyle}
      rightAccessory={
        <Pressable style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.replace(isEmpty ? '/(finance)/subscription-payments' : '/(finance)/subscription-payments?mode=empty')}>
          <MaterialIcons name={isEmpty ? 'restart-alt' : 'search'} size={18} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        {isEmpty ? (
          <FinanceCard style={styles.emptyCard}>
            <View style={[styles.emptyBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}>
              <MaterialIcons name="search-off" size={32} color={colors.primaryDark} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Result not found</Text>
            <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.56) }]}>Adjust your search or filter to show subscription payments again.</Text>
            <Pressable style={[styles.emptyButton, { backgroundColor: colors.primaryDark }]} onPress={() => router.replace('/(finance)/subscription-payments')}>
              <Text style={[styles.emptyButtonText, { color: colors.card }]}>Reset payments</Text>
            </Pressable>
          </FinanceCard>
        ) : (
          <FinanceCard>
            <View style={styles.listStack}>
              {upcoming.map((item) => (
                <View key={item.id} style={[styles.row, { borderColor: colors.border }]}> 
                  <View style={[styles.iconWrap, { backgroundColor: hexToRgba(item.accent, 0.12) }]}>
                    <MaterialIcons name={item.icon} size={18} color={item.accent} />
                  </View>
                  <View style={styles.copy}>
                    <Text style={[styles.title, { color: colors.text }]}>{item.service}</Text>
                    <Text style={[styles.meta, { color: hexToRgba(colors.text, 0.52) }]}>{item.nextPayment} • {item.paymentMethod}</Text>
                  </View>
                  <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                </View>
              ))}
            </View>
          </FinanceCard>
        )}
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    headerAction: { width: 38, height: 38, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    stack: { marginTop: 18, gap: 16 },
    listStack: { gap: 12 },
    row: { borderWidth: 1, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1 },
    title: { fontSize: 13, fontWeight: '800' },
    meta: { marginTop: 4, fontSize: 11, fontWeight: '600' },
    amount: { fontSize: 13, fontWeight: '800' },
    emptyCard: { alignItems: 'center', paddingVertical: 28 },
    emptyBadge: { width: 82, height: 82, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '900' },
    emptyBody: { marginTop: 8, fontSize: 13, lineHeight: 19, fontWeight: '500', textAlign: 'center' },
    emptyButton: { marginTop: 18, minHeight: 46, minWidth: 160, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
    emptyButtonText: { fontSize: 13, fontWeight: '800' },
  });
}
