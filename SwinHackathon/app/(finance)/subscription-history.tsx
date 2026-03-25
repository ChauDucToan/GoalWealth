import { hexToRgba } from '@/components/auth/AuthKit';
import { subscriptionHistoryRows } from '@/components/finance/subscription-data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SubscriptionHistoryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <FinanceScreen title="My Subscription History" subtitle="Recent charges across all services, grouped as a clean ledger." contentStyle={styles.contentStyle}>
      <View style={styles.stack}>
        <FinanceCard>
          <View style={styles.headerRow}>
            <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.52) }]}>All payments</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{subscriptionHistoryRows.length}</Text>
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.listStack}>
            {subscriptionHistoryRows.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: hexToRgba(item.accent, 0.12) }]}>
                  <MaterialIcons name={item.icon} size={18} color={item.accent} />
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.title, { color: colors.text }]}>{item.service}</Text>
                  <Text style={[styles.meta, { color: hexToRgba(colors.text, 0.52) }]}>{item.date}</Text>
                </View>
                <Text style={[styles.amount, { color: item.status === 'pending' ? colors.warning : colors.text }]}>{formatCurrency(item.amount)}</Text>
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
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: 12, fontWeight: '700' },
    summaryValue: { fontSize: 24, fontWeight: '900' },
    listStack: { gap: 16 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1 },
    title: { fontSize: 13, fontWeight: '800' },
    meta: { marginTop: 4, fontSize: 11, fontWeight: '600' },
    amount: { fontSize: 13, fontWeight: '800' },
  });
}
