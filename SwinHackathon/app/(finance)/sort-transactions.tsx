import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { transactionSortOptions } from '@/components/home/mock-data';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function SortTransactionsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState(transactionSortOptions[0]);

  return (
    <FinanceScreen title="Sort Transactions" subtitle="Preview sort states from the board">
      <FinanceCard>
        <View style={styles.optionList}>
          {transactionSortOptions.map((option) => {
            const active = option === selected;
            return (
              <Pressable
                key={option}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.backgroundSoft,
                    borderColor: active ? colors.primaryDark : 'transparent',
                  },
                ]}
                onPress={() => setSelected(option)}
              >
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>{option}</Text>
                  <Text style={[styles.optionMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                    {option === 'Newest first' ? 'Apr 1, 2026' : 'A-Z • Highest amount'}
                  </Text>
                </View>
                <MaterialIcons
                  name={active ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={20}
                  color={active ? colors.primaryDark : hexToRgba(colors.text, 0.34)}
                />
              </Pressable>
            );
          })}
        </View>

        <ThemeButton
          title="Sort Transactions"
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
  optionList: {
    gap: 12,
  },
  optionRow: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  optionMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  button: {
    marginTop: 18,
  },
});
