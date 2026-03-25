import { ThemeButton } from '@/components/ThemeButton';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Typography } from '@/constants/theme';

const types = ['expense', 'income'] as const;

export default function SelectTypeScreen() {
  const { transactionDraft, updateTransactionDraft } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState(
    transactionDraft.type === 'transfer' ? 'expense' : transactionDraft.type
  );

  return (
    <FinanceScreen title="Select Type" subtitle="Transaction type for the current draft">
      <FinanceCard>
        {types.map((item) => {
          const active = item === selected;
          return (
            <Pressable
              key={item}
              style={[
                styles.row,
                { backgroundColor: active ? colors.primaryLight : colors.backgroundSoft },
              ]}
              onPress={() => setSelected(item)}
            >
              <Text style={[styles.rowText, { color: colors.text }]}>{item}</Text>
            </Pressable>
          );
        })}

        <ThemeButton
          title="Apply"
          onPress={() => {
            updateTransactionDraft({ type: selected });
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
    textTransform: 'capitalize',
  },
  button: {
    marginTop: 8,
  },
});
