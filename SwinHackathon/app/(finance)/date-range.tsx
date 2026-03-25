import { ThemeButton } from '@/components/ThemeButton';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

const dates = ['Apr 23', 'Apr 24', 'Today', 'Apr 26', 'Apr 27'];
const hours = ['04', '05', '06', '07', '08'];

export default function DateRangeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { updateTransactionDraft, transactionDraft } = useFinance();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [selectedDate, setSelectedDate] = useState(transactionDraft.dateLabel || 'Today');
  const [selectedHour, setSelectedHour] = useState('07');

  const applySelection = () => {
    if (mode === 'draft') {
      updateTransactionDraft({ dateLabel: selectedDate });
    }

    router.back();
  };

  return (
    <FinanceScreen
      title="Select Date"
      subtitle={mode === 'draft' ? 'Set transaction date' : 'Date range state from the board'}
    >
      <FinanceCard>
        <View style={styles.grid}>
          <View style={styles.column}>
            {dates.map((date) => {
              const active = date === selectedDate;
              return (
                <Pressable
                  key={date}
                  style={[
                    styles.dateOption,
                    { backgroundColor: active ? colors.primaryLight : colors.backgroundSoft },
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{date}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.column}>
            {hours.map((hour) => {
              const active = hour === selectedHour;
              return (
                <Pressable
                  key={hour}
                  style={[
                    styles.dateOption,
                    { backgroundColor: active ? colors.primaryLight : colors.backgroundSoft },
                  ]}
                  onPress={() => setSelectedHour(hour)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{hour}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ThemeButton
          title={mode === 'draft' ? 'Set Date' : 'Select Date'}
          onPress={applySelection}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.button}
        />
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 10,
  },
  dateOption: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  optionText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  button: {
    marginTop: 18,
  },
});
