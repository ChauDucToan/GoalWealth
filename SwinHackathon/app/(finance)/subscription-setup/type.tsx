import { hexToRgba } from '@/components/auth/AuthKit';
import { subscriptionTypes } from '@/components/finance/subscription-data';
import { ColorTheme } from '@/constants/theme';
import { useSubscriptionSetup } from '@/hooks/use-subscription-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SubscriptionSetupPrimaryButton, SubscriptionSetupShell } from './_shared';

export default function SubscriptionSetupTypeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setType } = useSubscriptionSetup();

  return (
    <SubscriptionSetupShell
      step={3}
      totalSteps={7}
      title="What type of subscription is it?"
      body="This is used for grouping, reminders and later optimization suggestions."
      footer={<SubscriptionSetupPrimaryButton label="Continue" onPress={() => router.push('/(finance)/subscription-setup/amount')} />}
    >
      <View style={styles.wrap}>
        {subscriptionTypes.map((item) => {
          const active = item === state.type;
          return (
            <Pressable
              key={item}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? hexToRgba(colors.primaryDark, 0.1) : colors.card,
                  borderColor: active ? colors.primaryDark : colors.border,
                },
              ]}
              onPress={() => setType(item)}
            >
              <Text style={[styles.chipText, { color: active ? colors.primaryDark : colors.text }]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
    </SubscriptionSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    chip: { minWidth: '47%', borderWidth: 1, borderRadius: 20, paddingVertical: 18, paddingHorizontal: 14, alignItems: 'center' },
    chipText: { fontSize: 14, fontWeight: '800' },
  });
}
