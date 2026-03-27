import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  getFinancialGoalById,
  getGoalAccountById,
  goalFrequencyOptions,
  transferPresets,
} from '@/components/financial-goals/data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { getTransferBackHref } from '@/app/(finance)/financial-goals/navigation';
import { useFinancialGoals } from '@/hooks/use-financial-goals';
import { useTheme } from '@/hooks/use-theme-colors';
import { useLocalSearchParams, useRouter } from '@/lib/expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function FinancialGoalTransferScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isUsingLiveGoals } = useFinancialGoals();
  const params = useLocalSearchParams<{
    goalId?: string;
    accountId?: string;
    mode?: 'topup' | 'recurring';
  }>();
  const goal = getFinancialGoalById(params.goalId);
  const account = getGoalAccountById(params.accountId ?? goal.accountId);
  const isRecurring = params.mode === 'recurring';
  const [selectedAmount, setSelectedAmount] = useState(isRecurring ? goal.monthlyContribution : transferPresets[2]);
  const [selectedFrequency, setSelectedFrequency] = useState<typeof goalFrequencyOptions[number]>(
    isRecurring ? goalFrequencyOptions[2] : goalFrequencyOptions[0]
  );
  const backHref = getTransferBackHref({
    goalId: params.goalId,
    accountId: params.accountId,
    mode: params.mode,
  });

  if (isUsingLiveGoals) {
    return (
      <FinanceScreen
        title={isRecurring ? 'Recurring Transfer' : 'Add Money'}
        subtitle="This action stays off until GoalWealth exposes transfer and funding-account endpoints."
        contentStyle={styles.contentStyle}
        onBackPress={() => router.replace(backHref)}
      >
        <View style={styles.stack}>
          <FinanceCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Transfer actions are unavailable in live mode</Text>
            <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
              GoalWealth currently syncs the goal record only. Top ups, recurring transfers and
              account-linked funding will stay hidden until the backend supports them.
            </Text>
          </FinanceCard>
        </View>
      </FinanceScreen>
    );
  }

  return (
    <FinanceScreen
      title={isRecurring ? 'Recurring Transfer' : 'Add Money'}
      subtitle={isRecurring ? 'Set a clean funding rhythm for this goal.' : 'Top up this goal from a connected savings account.'}
      contentStyle={styles.contentStyle}
      onBackPress={() => router.replace(backHref)}
    >
      <View style={styles.stack}>
        <FinanceCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(goal.accent, 0.1),
              borderColor: hexToRgba(goal.accent, 0.16),
            },
          ]}
        >
          <Text style={[styles.heroEyebrow, { color: goal.accent }]}>
            {isRecurring ? 'Automatic funding' : 'One-time top up'}
          </Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{goal.title}</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
            {isRecurring
              ? 'Combine amount and cadence here instead of pushing the user through separate amount and frequency steps.'
              : 'This covers the transfer amount and linked account from one place.'}
          </Text>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transfer amount</Text>
          <View style={styles.presetRow}>
            {transferPresets.map((item) => {
              const active = item === selectedAmount;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.amountChip,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedAmount(item)}
                >
                  <Text style={[styles.amountChipText, { color: active ? colors.card : colors.text }]}>
                    {formatCurrency(item)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {isRecurring ? (
            <>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.56) }]}>Cadence</Text>
              <View style={styles.presetRow}>
                {goalFrequencyOptions.map((item) => {
                  const active = item === selectedFrequency;

                  return (
                    <Pressable
                      key={item}
                      style={[
                        styles.inlineChip,
                        {
                          backgroundColor: active ? hexToRgba(colors.success, 0.14) : colors.backgroundSoft,
                          borderColor: active ? colors.success : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedFrequency(item)}
                    >
                      <Text style={[styles.inlineChipText, { color: active ? colors.success : colors.text }]}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Savings account</Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(finance)/financial-goals/account',
                  params: {
                    origin: 'transfer',
                    goalId: goal.id,
                    accountId: account.id,
                    mode: isRecurring ? 'recurring' : 'topup',
                  },
                })
              }
            >
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Change</Text>
            </Pressable>
          </View>

          <View style={[styles.accountCard, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
            <View style={[styles.accountAccent, { backgroundColor: account.accent }]} />
            <View style={styles.accountCopy}>
              <Text style={[styles.accountTitle, { color: colors.text }]}>{account.label}</Text>
              <Text style={[styles.accountMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                {account.subtitle} • {account.mask}
              </Text>
            </View>
            <Text style={[styles.accountBalance, { color: colors.text }]}>
              {formatCurrency(account.balance)}
            </Text>
          </View>
        </FinanceCard>

        <FinanceCard style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.previewEyebrow, { color: colors.primaryDark }]}>Preview</Text>
          <Text style={[styles.previewValue, { color: colors.text }]}>{formatCurrency(selectedAmount)}</Text>
          <Text style={[styles.previewBody, { color: hexToRgba(colors.text, 0.56) }]}>
            {isRecurring
              ? `${selectedFrequency} transfers from ${account.label} will keep ${goal.title} pacing steadily.`
              : `This top up moves cash from ${account.label} directly into ${goal.title}.`}
          </Text>
        </FinanceCard>

        <View style={styles.actionRow}>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title="Cancel"
              onPress={() => router.replace(backHref)}
              colorBackground={colors.card}
              colorText={colors.text}
              style={[styles.actionButton, { borderWidth: 1, borderColor: colors.border }]}
            />
          </View>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title={isRecurring ? 'Set Transfer' : 'Move Money'}
              onPress={() =>
                router.replace({
                  pathname: '/(finance)/financial-goals/result',
                  params: {
                    mode: isRecurring ? 'recurring' : 'transferred',
                    goalId: goal.id,
                    accountId: account.id,
                  },
                })
              }
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  presetRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amountChip: {
    minWidth: 88,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  fieldLabel: {
    marginTop: 18,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inlineChip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '800',
  },
  accountCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountAccent: {
    width: 10,
    height: 42,
    borderRadius: 999,
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
  },
  accountTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  accountMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '800',
  },
  previewCard: {
    borderWidth: 1,
  },
  previewEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  previewValue: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  previewBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
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
