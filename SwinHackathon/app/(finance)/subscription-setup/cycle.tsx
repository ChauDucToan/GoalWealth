import { hexToRgba } from '@/components/auth/AuthKit';
import { subscriptionCycles } from '@/components/finance/subscription-data';
import { ColorTheme } from '@/constants/theme';
import { useSubscriptionSetup } from '@/hooks/use-subscription-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SubscriptionSetupPrimaryButton, SubscriptionSetupShell } from './_shared';

export default function SubscriptionSetupCycleScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setCycle } = useSubscriptionSetup();

  return (
    <SubscriptionSetupShell
      step={6}
      totalSteps={7}
      title="What is the interval for your subscription?"
      body="Cycle data powers the calendar, history grouping and optimization math."
      footer={<SubscriptionSetupPrimaryButton label="Continue" onPress={() => router.push('/(finance)/subscription-setup/added')} />}
    >
      <View style={styles.stack}>
        {subscriptionCycles.map((item) => {
          const active = item === state.cycle;
          return (
            <Pressable key={item} style={[styles.row, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.1) : colors.card, borderColor: active ? colors.primaryDark : colors.border }]} onPress={() => setCycle(item)}>
              <Text style={[styles.rowText, { color: active ? colors.primaryDark : colors.text }]}>{item}</Text>
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
    row: { borderWidth: 1, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 16 },
    rowText: { fontSize: 14, fontWeight: '800' },
  });
}
