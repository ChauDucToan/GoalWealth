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
      <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.previewLabel, { color: hexToRgba(colors.text, 0.52) }]}>Renewal rhythm</Text>
        <Text style={[styles.previewValue, { color: colors.text }]}>{state.cycle}</Text>
        <Text style={[styles.previewBody, { color: hexToRgba(colors.text, 0.56) }]}>Use the billing interval that best matches how this subscription renews in real life.</Text>
      </View>
      <View style={styles.stack}>
        {subscriptionCycles.map((item) => {
          const active = item === state.cycle;
          return (
            <Pressable key={item} style={[styles.row, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.1) : colors.card, borderColor: active ? colors.primaryDark : colors.border }]} onPress={() => setCycle(item)}>
              <View>
                <Text style={[styles.rowText, { color: active ? colors.primaryDark : colors.text }]}>{item}</Text>
                <Text style={[styles.rowMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                  {item === 'Monthly'
                    ? 'Best for standard monthly services'
                    : 'Best for annual plans'}
                </Text>
              </View>
              {active ? <Text style={[styles.rowBadge, { color: colors.primaryDark }]}>Selected</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </SubscriptionSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    previewCard: { borderWidth: 1, borderRadius: 24, padding: 18 },
    previewLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 },
    previewValue: { marginTop: 8, fontSize: 22, fontWeight: '900' },
    previewBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    stack: { gap: 12 },
    row: { borderWidth: 1, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    rowText: { fontSize: 14, fontWeight: '800' },
    rowMeta: { marginTop: 4, fontSize: 11, fontWeight: '600', maxWidth: 220 },
    rowBadge: { fontSize: 11, fontWeight: '800' },
  });
}
