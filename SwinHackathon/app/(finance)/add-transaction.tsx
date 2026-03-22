import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { makeReference } from '@/components/finance/finance-utils';
import { FinanceIconName } from '@/components/home/mock-data';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Typography } from '@/constants/theme';

type DraftFieldRow = {
  key: string;
  label: string;
  value: string;
  icon: FinanceIconName;
  action?: () => void;
};

export default function AddTransactionScreen() {
  const {
    categories,
    transactionDraft,
    updateTransactionDraft,
    addTransaction,
    resetTransactionDraft,
  } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();

  const selectedCategory =
    categories.find((item) => item.name === transactionDraft.category) ?? categories[0];

  const handleSave = () => {
    const parsedAmount = Number(transactionDraft.amount.replace(/[^0-9.]/g, ''));

    if (!parsedAmount || !transactionDraft.merchant.trim()) {
      return;
    }

    const transaction = addTransaction({
      merchant: transactionDraft.merchant.trim(),
      category: transactionDraft.type === 'income' ? 'Income' : transactionDraft.category,
      amount: transactionDraft.type === 'income' ? parsedAmount : -parsedAmount,
      type: transactionDraft.type === 'income' ? 'income' : 'expense',
      status: 'Completed',
      note: transactionDraft.note.trim() || 'Created from add transaction screen',
      icon: transactionDraft.type === 'income'
        ? 'payments'
        : selectedCategory?.icon ?? 'payments',
      accent: transactionDraft.type === 'income'
        ? colors.primaryDark
        : selectedCategory?.accent ?? colors.primaryDark,
      paymentMethod:
        transactionDraft.type === 'transfer' ? 'Transfer helper' : 'Main Wallet',
      location: transactionDraft.recurring,
      reference: makeReference(transactionDraft.type === 'transfer' ? 'TRF' : 'TRX'),
      dateLabel: transactionDraft.dateLabel,
      timeLabel: 'Just now',
    });

    resetTransactionDraft();
    router.replace({
      pathname: '/(finance)/transaction/[id]',
      params: { id: transaction.id },
    });
  };

  const fieldRows: DraftFieldRow[] = [
    {
      key: 'merchant',
      label: transactionDraft.type === 'transfer'
        ? 'To'
        : transactionDraft.type === 'income'
          ? 'Source'
          : 'Merchant',
      value: transactionDraft.merchant || 'Not Set',
      icon: transactionDraft.type === 'transfer' ? 'north-east' : 'storefront',
      action:
        transactionDraft.type === 'transfer'
          ? () => router.push('/(finance)/send-money?mode=draft')
          : undefined,
    },
    {
      key: 'category',
      label: 'Category',
      value: transactionDraft.type === 'income' ? 'Income' : transactionDraft.category,
      icon: 'category',
      action:
        transactionDraft.type === 'income'
          ? undefined
          : () => router.push('/(finance)/select-category'),
    },
    {
      key: 'note',
      label: 'Note',
      value: transactionDraft.note || 'Not Set',
      icon: 'description',
      action: () => router.push('/(finance)/add-note'),
    },
    {
      key: 'recurring',
      label: 'Recurring',
      value: transactionDraft.recurring || 'Not Set',
      icon: 'event-repeat',
      action: () => router.push('/(finance)/set-recurring'),
    },
    {
      key: 'date',
      label: 'Date',
      value: transactionDraft.dateLabel || 'Today',
      icon: 'calendar-month',
      action: () => router.push('/(finance)/date-range?mode=draft'),
    },
  ];

  return (
    <FinanceScreen
      title="Add New Transaction"
      subtitle="Create expense, income or transfer item"
      rightAccessory={
        <Pressable
          style={[
            styles.iconAction,
            { backgroundColor: colors.card, borderColor: hexToRgba(colors.primaryDark, 0.08) },
          ]}
          onPress={resetTransactionDraft}
        >
          <MaterialIcons name="restart-alt" size={18} color={colors.text} />
        </Pressable>
      }
    >
      <FinanceCard style={styles.card}>
        <View style={styles.segmentRow}>
          {(['expense', 'income', 'transfer'] as const).map((item) => {
            const selected = item === transactionDraft.type;
            return (
              <Pressable
                key={item}
                style={[
                  styles.segment,
                  { backgroundColor: selected ? colors.primaryDark : colors.backgroundSoft },
                ]}
                onPress={() => updateTransactionDraft({ type: item })}
              >
                <Text style={[styles.segmentText, { color: selected ? colors.card : colors.text }]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.amountLabel, { color: hexToRgba(colors.text, 0.54) }]}>
          Amount
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.amountPrefix, { color: hexToRgba(colors.text, 0.54) }]}>$</Text>
          <TextInput
            value={transactionDraft.amount}
            onChangeText={(value) => updateTransactionDraft({ amount: value })}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={hexToRgba(colors.text, 0.28)}
            style={[styles.amountInput, { color: colors.text }]}
          />
        </View>
        <View
          style={[
            styles.amountUnderline,
            { backgroundColor: hexToRgba(colors.primaryDark, 0.9) },
          ]}
        />

        <View style={styles.fieldList}>
          {fieldRows.map((row) => (
            <Pressable
              key={row.key}
              style={[
                styles.fieldRow,
                { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
              onPress={row.action ?? undefined}
              disabled={!row.action}
            >
              <View style={styles.fieldRowLeft}>
                <MaterialIcons name={row.icon} size={18} color={hexToRgba(colors.text, 0.48)} />
                <Text style={[styles.fieldLabel, { color: colors.text }]}>{row.label}</Text>
              </View>

              <View style={styles.fieldRowRight}>
                <Text style={[styles.fieldValue, { color: hexToRgba(colors.text, 0.6) }]}>
                  {row.value}
                </Text>
                {row.action ? (
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={hexToRgba(colors.text, 0.34)}
                  />
                ) : null}
              </View>
            </Pressable>
          ))}

          <View
            style={[
              styles.fieldRow,
              { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
            ]}
          >
            <View style={styles.fieldRowLeft}>
              <MaterialIcons
                name="pie-chart-outline"
                size={18}
                color={hexToRgba(colors.text, 0.48)}
              />
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Ignore from Budgets</Text>
            </View>
            <Pressable
              style={[
                styles.switchTrack,
                {
                  backgroundColor: transactionDraft.ignoreFromBudgets
                    ? colors.primaryDark
                    : hexToRgba(colors.text, 0.16),
                },
              ]}
              onPress={() =>
                updateTransactionDraft({
                  ignoreFromBudgets: !transactionDraft.ignoreFromBudgets,
                })
              }
            >
              <View
                style={[
                  styles.switchThumb,
                  {
                    backgroundColor: colors.card,
                    transform: [{ translateX: transactionDraft.ignoreFromBudgets ? 16 : 0 }],
                  },
                ]}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.helperRow}>
          <ThemeButton
            title="Type"
            onPress={() => router.push('/(finance)/select-type')}
            colorBackground={colors.backgroundSoft}
            colorText={colors.text}
            style={styles.helperButton}
          />
          <ThemeButton
            title="Category"
            onPress={() => router.push('/(finance)/select-category')}
            colorBackground={colors.backgroundSoft}
            colorText={colors.text}
            style={styles.helperButton}
          />
        </View>

        <ThemeButton
          title="Create Transaction"
          onPress={handleSave}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.primaryButton}
        />
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  iconAction: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    paddingTop: 16,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segment: {
    flex: 1,
    flexBasis: 90,
    minHeight: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  amountLabel: {
    marginTop: 18,
    alignSelf: 'center',
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  amountRow: {
    marginTop: 6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: '100%',
  },
  amountPrefix: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 4,
  },
  amountInput: {
    minWidth: 0,
    maxWidth: '100%',
    textAlign: 'left',
    fontSize: 42,
    fontWeight: '800',
    paddingVertical: 0,
    flexShrink: 1,
  },
  amountUnderline: {
    marginTop: 8,
    height: 3,
    borderRadius: 999,
    width: '100%',
    maxWidth: 220,
    alignSelf: 'center',
  },
  fieldList: {
    marginTop: 16,
  },
  fieldRow: {
    minHeight: 56,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
  },
  fieldRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  fieldRowRight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flexShrink: 1,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
    flexShrink: 1,
  },
  fieldValue: {
    fontSize: Typography.body,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  switchTrack: {
    width: 38,
    height: 22,
    borderRadius: 999,
    padding: 3,
  },
  switchThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  helperRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  helperButton: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
  },
  primaryButton: {
    marginTop: 16,
  },
});
