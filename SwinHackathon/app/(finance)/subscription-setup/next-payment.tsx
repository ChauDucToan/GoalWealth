import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useSubscriptionSetup } from '@/hooks/use-subscription-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SubscriptionSetupPrimaryButton, SubscriptionSetupShell } from './_shared';

const dateOptions = ['May 28, 2023', 'Jun 02, 2023', 'Jul 28, 2023', 'Aug 24, 2023'];

export default function SubscriptionSetupNextPaymentScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setNextPayment } = useSubscriptionSetup();

  return (
    <SubscriptionSetupShell
      step={5}
      totalSteps={7}
      title="When is the next payment due?"
      body="The reminder and upcoming charge sections depend on this date."
      footer={<SubscriptionSetupPrimaryButton label="Continue" onPress={() => router.push('/(finance)/subscription-setup/cycle')} />}
    >
      <View style={styles.stack}>
        {dateOptions.map((item) => {
          const active = item === state.nextPayment;
          return (
            <Pressable
              key={item}
              style={[styles.dateRow, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.1) : colors.card, borderColor: active ? colors.primaryDark : colors.border }]}
              onPress={() => setNextPayment(item)}
            >
              <Text style={[styles.dateText, { color: active ? colors.primaryDark : colors.text }]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
    </SubscriptionSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    stack: { gap: 12 },
    dateRow: { borderWidth: 1, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 16 },
    dateText: { fontSize: 14, fontWeight: '800' },
  });
}
