import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  financialGoalAccounts,
  getFinancialGoalById,
  getGoalAccountById,
} from '@/components/financial-goals/data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { useTheme } from '@/hooks/use-theme-colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function FinancialGoalAccountScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    goalId?: string;
    accountId?: string;
    origin?: 'create' | 'transfer' | 'detail';
    mode?: 'create' | 'edit' | 'topup' | 'recurring';
  }>();
  const goal = getFinancialGoalById(params.goalId);
  const initialAccount = getGoalAccountById(params.accountId ?? goal.accountId);
  const [selectedAccountId, setSelectedAccountId] = useState(initialAccount.id);
  const selectedAccount = useMemo(
    () => financialGoalAccounts.find((item) => item.id === selectedAccountId) ?? initialAccount,
    [initialAccount, selectedAccountId]
  );

  const handleContinue = () => {
    if (params.origin === 'transfer') {
      router.replace({
        pathname: '/(finance)/financial-goals/transfer',
        params: {
          goalId: goal.id,
          mode: params.mode ?? 'topup',
          accountId: selectedAccount.id,
        },
      });
      return;
    }

    router.replace({
      pathname: '/(finance)/financial-goals/create',
      params: {
        goalId: goal.id,
        accountId: selectedAccount.id,
        mode: params.origin === 'detail' ? 'edit' : params.mode ?? 'create',
      },
    });
  };

  return (
    <FinanceScreen
      title="Select Savings Account"
      subtitle="Choose where this goal should pull or store money from."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <FinanceCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.success, 0.1),
              borderColor: hexToRgba(colors.success, 0.16),
            },
          ]}
        >
          <Text style={[styles.heroEyebrow, { color: colors.success }]}>Linked funding source</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{goal.title}</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Pick one savings source. You can still change cadence and amount later from the same create/edit flow.
          </Text>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.accountStack}>
            {financialGoalAccounts.map((account) => {
              const active = account.id === selectedAccountId;

              return (
                <Pressable
                  key={account.id}
                  style={[
                    styles.accountCard,
                    {
                      backgroundColor: active ? hexToRgba(account.accent, 0.08) : colors.card,
                      borderColor: active ? account.accent : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedAccountId(account.id)}
                >
                  <View style={[styles.accountAccent, { backgroundColor: account.accent }]} />
                  <View style={styles.accountCopy}>
                    <Text style={[styles.accountLabel, { color: colors.text }]}>{account.label}</Text>
                    <Text style={[styles.accountMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                      {account.subtitle} • {account.mask}
                    </Text>
                  </View>

                  <View style={styles.accountRight}>
                    <Text style={[styles.accountBalance, { color: colors.text }]}>
                      {formatCurrency(account.balance)}
                    </Text>
                    <Text
                      style={[
                        styles.accountState,
                        { color: active ? account.accent : hexToRgba(colors.text, 0.42) },
                      ]}
                    >
                      {active ? 'Selected' : 'Available'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <View style={styles.actionRow}>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title="Cancel"
              onPress={() => router.back()}
              colorBackground={colors.card}
              colorText={colors.text}
              style={[styles.actionButton, { borderWidth: 1, borderColor: colors.border }]}
            />
          </View>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title="Use This Account"
              onPress={handleContinue}
              colorBackground={colors.primaryDark}
              colorText={colors.card}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  contentStyle: {
    paddingBottom: 28,
  },
  stack: {
    marginTop: 18,
    gap: 16,
  },
  heroCard: {
    borderWidth: 1,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  heroBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  accountStack: {
    gap: 12,
  },
  accountCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountAccent: {
    width: 10,
    height: 46,
    borderRadius: 999,
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
  },
  accountLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  accountMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  accountRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '800',
  },
  accountState: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonWrap: {
    flex: 1,
  },
  actionButton: {
    width: '100%',
  },
});
