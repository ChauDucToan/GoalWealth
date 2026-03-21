import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { makeReference } from '@/components/finance/finance-utils';
import { financeRecipients, overviewStats } from '@/components/home/mock-data';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SendMoneyScreen() {
  const { addTransaction, transactionDraft, updateTransactionDraft } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [query, setQuery] = useState('');
  const [amount, setAmount] = useState(transactionDraft.amount);
  const [note, setNote] = useState(transactionDraft.note);
  const [selectedRecipientId, setSelectedRecipientId] = useState(financeRecipients[0].id);

  const recipients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return financeRecipients;
    return financeRecipients.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [query]);

  const selectedRecipient =
    financeRecipients.find((item) => item.id === selectedRecipientId) ?? financeRecipients[0];

  const handleApply = () => {
    if (mode === 'draft') {
      updateTransactionDraft({
        type: 'transfer',
        merchant: selectedRecipient.name,
      });
      router.back();
      return;
    }

    const parsedAmount = Number(amount.replace(/[^0-9.]/g, ''));

    if (!parsedAmount || !selectedRecipient) {
      return;
    }

    const success = parsedAmount <= overviewStats.balance;
    let transactionId = '';

    if (success) {
      const transaction = addTransaction({
        merchant: selectedRecipient.name,
        category: 'Transfer',
        amount: -parsedAmount,
        type: 'expense',
        status: 'Completed',
        note: note.trim() || 'Sent from transfer screen',
        icon: 'north-east',
        accent: colors.primaryDark,
        paymentMethod: 'Main Wallet',
        location: selectedRecipient.subtitle,
        reference: makeReference('TRF'),
        dateLabel: 'Today',
        timeLabel: 'Just now',
      });
      transactionId = transaction.id;
    }

    router.push({
      pathname: '/(finance)/sending',
      params: {
        amount: parsedAmount.toFixed(2),
        recipient: selectedRecipient.name,
        status: success ? 'success' : 'failed',
        transactionId,
      },
    });
  };

  return (
    <FinanceScreen
      title="Send To"
      subtitle={mode === 'draft' ? 'Select recipient for draft transaction' : 'Choose a recipient and amount'}
    >
      <FinanceCard>
        <View
          style={[
            styles.searchRow,
            {
              borderColor: hexToRgba(colors.primaryDark, 0.12),
              backgroundColor: colors.backgroundSoft,
            },
          ]}
        >
          <MaterialIcons name="search" size={20} color={hexToRgba(colors.text, 0.46)} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search people or institutions"
            placeholderTextColor={hexToRgba(colors.text, 0.42)}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        <View style={styles.recipientList}>
          {recipients.map((recipient) => {
            const selected = recipient.id === selectedRecipientId;
            return (
              <Pressable
                key={recipient.id}
                style={[
                  styles.recipientRow,
                  {
                    backgroundColor: selected ? hexToRgba(recipient.accent, 0.12) : colors.card,
                    borderColor: selected
                      ? recipient.accent
                      : hexToRgba(colors.primaryDark, 0.08),
                  },
                ]}
                onPress={() => setSelectedRecipientId(recipient.id)}
              >
                <View
                  style={[
                    styles.recipientIcon,
                    { backgroundColor: hexToRgba(recipient.accent, 0.14) },
                  ]}
                >
                  <MaterialIcons name={recipient.icon} size={18} color={recipient.accent} />
                </View>
                <View style={styles.recipientText}>
                  <Text style={[styles.recipientName, { color: colors.text }]}>
                    {recipient.name}
                  </Text>
                  <Text style={[styles.recipientMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                    {recipient.subtitle}
                  </Text>
                </View>
                {selected ? (
                  <MaterialIcons name="check-circle" size={20} color={recipient.accent} />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {mode !== 'draft' ? (
          <>
            <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={hexToRgba(colors.text, 0.34)}
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundSoft,
                  color: colors.text,
                  borderColor: hexToRgba(colors.primaryDark, 0.08),
                },
              ]}
            />

            <Text style={[styles.label, { color: colors.text }]}>Note</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Optional message"
              placeholderTextColor={hexToRgba(colors.text, 0.34)}
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundSoft,
                  color: colors.text,
                  borderColor: hexToRgba(colors.primaryDark, 0.08),
                },
              ]}
            />

            <View
              style={[
                styles.helper,
                { backgroundColor: hexToRgba(colors.primaryDark, 0.05) },
              ]}
            >
              <MaterialIcons name="info-outline" size={18} color={colors.primaryDark} />
              <Text style={[styles.helperText, { color: hexToRgba(colors.text, 0.58) }]}>
                Transfers above ${overviewStats.balance.toFixed(2)} will open the failed state screen
                for testing.
              </Text>
            </View>
          </>
        ) : null}

        <ThemeButton
          title="Apply"
          onPress={handleApply}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.button}
        />
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  recipientList: {
    marginTop: 18,
    gap: 10,
  },
  recipientRow: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recipientIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientText: {
    flex: 1,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '700',
  },
  recipientMeta: {
    marginTop: 4,
    fontSize: 12,
  },
  label: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    marginTop: 8,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  helper: {
    marginTop: 18,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  button: {
    marginTop: 20,
  },
});
