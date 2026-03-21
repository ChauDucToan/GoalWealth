import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

const participants = [
  { id: 'p1', name: 'Andrew', owes: 8.0, status: 'Received' },
  { id: 'p2', name: 'Mia', owes: 2.0, status: 'Pending' },
];

export default function SplitTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTransactionById } = useFinance();
  const { colors } = useTheme();
  const transaction = getTransactionById(id);

  return (
    <FinanceScreen title="Split Payment" subtitle={transaction?.merchant ?? 'Selected expense'}>
      <FinanceCard>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(Math.abs(transaction?.amount ?? 10))}
        </Text>
        <Text style={[styles.meta, { color: hexToRgba(colors.text, 0.54) }]}>
          Tuesday, 25 Aug 2026
        </Text>

        <View style={styles.list}>
          {participants.map((participant) => (
            <View
              key={participant.id}
              style={[styles.row, { backgroundColor: colors.backgroundSoft }]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.name, { color: colors.text }]}>{participant.name}</Text>
                <Text style={[styles.detail, { color: hexToRgba(colors.text, 0.52) }]}>
                  Split over 2 items
                </Text>
              </View>
              <View style={styles.rowAmount}>
                <Text style={[styles.value, { color: colors.text }]}>
                  {formatCurrency(participant.owes)}
                </Text>
                <Text
                  style={[
                    styles.status,
                    {
                      color:
                        participant.status === 'Received'
                          ? colors.primaryDark
                          : '#B45309',
                    },
                  ]}
                >
                  {participant.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <ThemeButton
          title="Add Split"
          onPress={() => {}}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.button}
        />

        <View style={[styles.tipCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.05) }]}>
          <MaterialIcons name="info-outline" size={18} color={colors.primaryDark} />
          <Text style={[styles.tipText, { color: hexToRgba(colors.text, 0.58) }]}>
            This screen is a UI-only split payment state from the board. No backend collection flow
            has been wired yet.
          </Text>
        </View>
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  amount: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
  },
  meta: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: Typography.body,
  },
  list: {
    marginTop: 22,
    gap: 12,
  },
  row: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  detail: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  rowAmount: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  status: {
    marginTop: 4,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  button: {
    marginTop: 20,
  },
  tipCard: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.body,
    lineHeight: 20,
  },
});
