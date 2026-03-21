import { ThemeButton } from '@/components/ThemeButton';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

const options = ['Do not ignore', 'Ignore from Budgets', 'Ignore from Everything'];

export default function IgnoreTransactionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState(options[1]);

  return (
    <FinanceScreen title="Ignore Transaction" subtitle="Choose how this item should be handled">
      <FinanceCard>
        {options.map((option) => {
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
          title="Apply"
          onPress={() => router.back()}
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
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    marginTop: 8,
  },
});
