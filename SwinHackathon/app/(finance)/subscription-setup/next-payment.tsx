import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useSubscriptionSetup } from '@/hooks/use-subscription-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from '@/lib/expo-router';
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
      <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.previewLabel, { color: hexToRgba(colors.text, 0.52) }]}>Selected schedule</Text>
        <Text style={[styles.previewValue, { color: colors.text }]}>{state.nextPayment}</Text>
        <Text style={[styles.previewBody, { color: hexToRgba(colors.text, 0.56) }]}>This date will be used for reminder timing and upcoming charge cards.</Text>
      </View>
      <View style={styles.stack}>
        {dateOptions.map((item) => {
          const active = item === state.nextPayment;
          return (
            <Pressable
              key={item}
              style={[styles.dateRow, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.1) : colors.card, borderColor: active ? colors.primaryDark : colors.border }]}
              onPress={() => setNextPayment(item)}
            >
              <View>
                <Text style={[styles.dateText, { color: active ? colors.primaryDark : colors.text }]}>{item}</Text>
                <Text style={[styles.dateMeta, { color: hexToRgba(colors.text, 0.52) }]}>Upcoming renewal candidate</Text>
              </View>
              {active ? <Text style={[styles.dateBadge, { color: colors.primaryDark }]}>Selected</Text> : null}
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
    dateRow: { borderWidth: 1, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    dateText: { fontSize: 14, fontWeight: '800' },
    dateMeta: { marginTop: 4, fontSize: 11, fontWeight: '600' },
    dateBadge: { fontSize: 11, fontWeight: '800' },
  });
}
