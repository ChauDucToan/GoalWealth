import { ThemeButton } from '@/components/ThemeButton';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { recurringOptions } from '@/components/home/mock-data';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Typography } from '@/constants/theme';

export default function SetRecurringScreen() {
  const { transactionDraft, updateTransactionDraft } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState(transactionDraft.recurring);

  return (
    <FinanceScreen title="Set Recurring" subtitle="Select repeat schedule for the draft">
      <FinanceCard>
        {recurringOptions.map((option) => {
          const active = option === selected;
          return (
            <Pressable
              key={option}
              style={[
                styles.row,
                { backgroundColor: active ? colors.primaryLight : colors.backgroundSoft },
              ]}
              onPress={() => setSelected(option)}
            >
              <Text style={[styles.rowText, { color: colors.text }]}>{option}</Text>
            </Pressable>
          );
        })}

        <ThemeButton
          title="Set Recurring"
          onPress={() => {
            updateTransactionDraft({ recurring: selected });
            router.back();
          }}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.button}
        />
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  rowText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  button: {
    marginTop: 8,
  },
});
