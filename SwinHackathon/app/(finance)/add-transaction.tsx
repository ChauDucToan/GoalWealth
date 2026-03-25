import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { makeReference } from '@/components/finance/finance-utils';
import { FinanceIconName, recurringOptions } from '@/components/home/mock-data';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Typography } from '@/constants/theme';

type DraftFieldRow = {
  key: string;
  label: string;
  value: string;
  icon: FinanceIconName;
  action?: () => void;
};

const MAX_TRANSACTION_AMOUNT = 999999.99;
const MAX_AMOUNT_WHOLE_DIGITS = 6;
const MAX_AMOUNT_DECIMAL_DIGITS = 2;

function sanitizeAmountInput(value: string) {
  const normalized = value.replace(/[^0-9.]/g, '');
  const [whole = '', ...decimalParts] = normalized.split('.');
  const limitedWhole = whole.slice(0, MAX_AMOUNT_WHOLE_DIGITS).replace(/^0+(?=\d)/, '');
  const decimal = decimalParts.join('').slice(0, MAX_AMOUNT_DECIMAL_DIGITS);

  if (normalized.includes('.')) {
    return `${limitedWhole || '0'}.${decimal}`;
  }

  return limitedWhole;
}

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
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  const selectedCategory =
    categories.find((item) => item.name === transactionDraft.category) ?? categories[0];
  const titleLabel =
    transactionDraft.type === 'transfer'
      ? 'To'
      : transactionDraft.type === 'income'
        ? 'Source'
        : 'Merchant';
  const rawAmount = transactionDraft.amount.trim();
  const parsedAmount = Number(rawAmount);
  const hasAmount = rawAmount.length > 0;
  const isAmountValid =
    hasAmount &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= MAX_TRANSACTION_AMOUNT &&
    new RegExp(`^\\d{1,${MAX_AMOUNT_WHOLE_DIGITS}}(?:\\.\\d{0,${MAX_AMOUNT_DECIMAL_DIGITS}})?$`).test(
      rawAmount
    ) &&
    rawAmount !== '.';
  const amountError =
    hasAmount && !isAmountValid
      ? `Enter an amount from $0.01 to $${MAX_TRANSACTION_AMOUNT.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}.`
      : '';
  const isMerchantValid = transactionDraft.merchant.trim().length > 0;
  const canSave = isAmountValid && isMerchantValid;

  const handleSave = () => {
    if (!canSave) {
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
        <Text style={[styles.sectionLabel, { color: hexToRgba(colors.text, 0.54) }]}>
          Transaction Type
        </Text>
        <Pressable
          style={[
            styles.selectorRow,
            {
              backgroundColor: colors.backgroundSoft,
              borderColor: hexToRgba(colors.primaryDark, 0.1),
            },
          ]}
          onPress={() => setTypeMenuOpen((current) => !current)}
        >
          <View style={styles.selectorCopy}>
            <MaterialIcons
              name={
                transactionDraft.type === 'income'
                  ? 'south-west'
                  : transactionDraft.type === 'transfer'
                    ? 'swap-horiz'
                    : 'north-east'
              }
              size={18}
              color={colors.primaryDark}
            />
            <Text style={[styles.selectorLabel, { color: colors.text }]}>
              {transactionDraft.type.charAt(0).toUpperCase() + transactionDraft.type.slice(1)}
            </Text>
          </View>
          <MaterialIcons
            name={typeMenuOpen ? 'expand-less' : 'expand-more'}
            size={20}
            color={hexToRgba(colors.text, 0.42)}
          />
        </Pressable>

        {typeMenuOpen ? (
          <View style={styles.typeOptionWrap}>
            {(['expense', 'income', 'transfer'] as const).map((item) => {
              const selected = item === transactionDraft.type;
              return (
                <Pressable
                  key={item}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: selected ? colors.primaryDark : colors.backgroundSoft,
                      borderColor: selected ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.1),
                    },
                  ]}
                  onPress={() => {
                    updateTransactionDraft({ type: item });
                    setTypeMenuOpen(false);
                  }}
                >
                  <Text style={[styles.typeOptionText, { color: selected ? colors.card : colors.text }]}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Text style={[styles.amountLabel, { color: hexToRgba(colors.text, 0.54) }]}>
          Amount
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.amountPrefix, { color: hexToRgba(colors.text, 0.54) }]}>$</Text>
          <TextInput
            value={transactionDraft.amount}
            onChangeText={(value) =>
              updateTransactionDraft({ amount: sanitizeAmountInput(value) })
            }
            keyboardType="numeric"
            placeholder="0.00"
            maxLength={MAX_AMOUNT_WHOLE_DIGITS + MAX_AMOUNT_DECIMAL_DIGITS + 1}
            placeholderTextColor={hexToRgba(colors.text, 0.28)}
            style={[styles.amountInput, { color: colors.text }]}
          />
        </View>
        <View
          style={[
            styles.amountUnderline,
            {
              backgroundColor: amountError
                ? colors.error
                : hexToRgba(colors.primaryDark, 0.9),
            },
          ]}
        />
        <Text
          style={[
            styles.amountHelper,
            {
              color: amountError ? colors.error : hexToRgba(colors.text, 0.48),
            },
          ]}
        >
          {amountError ||
            `Use a positive amount up to $${MAX_TRANSACTION_AMOUNT.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}.`}
        </Text>

        <View
          style={[
            styles.inputBlock,
            {
              backgroundColor: colors.backgroundSoft,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
        >
          <Text style={[styles.inputLabel, { color: hexToRgba(colors.text, 0.54) }]}>{titleLabel}</Text>
          <TextInput
            value={transactionDraft.merchant}
            onChangeText={(value) => updateTransactionDraft({ merchant: value })}
            placeholder={
              transactionDraft.type === 'transfer'
                ? 'Enter recipient'
                : transactionDraft.type === 'income'
                  ? 'Enter income source'
                  : 'Enter merchant name'
            }
            placeholderTextColor={hexToRgba(colors.text, 0.28)}
            style={[styles.textInput, { color: colors.text }]}
          />
        </View>

        <View
          style={[
            styles.inputBlock,
            {
              backgroundColor: colors.backgroundSoft,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
        >
          <Text style={[styles.inputLabel, { color: hexToRgba(colors.text, 0.54) }]}>Note</Text>
          <TextInput
            value={transactionDraft.note}
            onChangeText={(value) => updateTransactionDraft({ note: value })}
            placeholder="Add a note for this transaction"
            placeholderTextColor={hexToRgba(colors.text, 0.28)}
            style={[styles.textInput, styles.noteInput, { color: colors.text }]}
            multiline
          />
        </View>

        <Text style={[styles.sectionLabel, { color: hexToRgba(colors.text, 0.54) }]}>
          Repeat Schedule
        </Text>
        <View style={styles.quickOptionWrap}>
          {recurringOptions.map((option) => {
            const active = transactionDraft.recurring === option;
            return (
              <Pressable
                key={option}
                style={[
                  styles.quickOptionChip,
                  {
                    backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                    borderColor: active ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.1),
                  },
                ]}
                onPress={() => updateTransactionDraft({ recurring: option })}
              >
                <Text style={[styles.quickOptionText, { color: active ? colors.card : colors.text }]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

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
            title="Category"
            onPress={() => router.push('/(finance)/select-category')}
            colorBackground={colors.backgroundSoft}
            colorText={colors.text}
            style={styles.helperButton}
          />
          <ThemeButton
            title="Date"
            onPress={() => router.push('/(finance)/date-range?mode=draft')}
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
          disabled={!canSave}
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  selectorRow: {
    marginTop: 10,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectorCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectorLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  typeOptionWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexBasis: 92,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '700',
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
  amountHelper: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputBlock: {
    marginTop: 18,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  textInput: {
    marginTop: 8,
    fontSize: Typography.body,
    fontWeight: '600',
    paddingVertical: 0,
  },
  noteInput: {
    minHeight: 52,
    textAlignVertical: 'top',
  },
  quickOptionWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickOptionChip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickOptionText: {
    fontSize: 12,
    fontWeight: '700',
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
