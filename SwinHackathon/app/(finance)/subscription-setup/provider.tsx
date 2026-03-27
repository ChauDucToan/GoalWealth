import { hexToRgba } from '@/components/auth/AuthKit';
import { subscriptionServices } from '@/components/finance/subscription-data';
import { ColorTheme } from '@/constants/theme';
import { useSubscriptionSetup } from '@/hooks/use-subscription-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SubscriptionSetupPrimaryButton, SubscriptionSetupShell } from './_shared';

export default function SubscriptionSetupProviderScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setServiceId, setType, setAmount, setCycle } = useSubscriptionSetup();

  return (
    <SubscriptionSetupShell
      step={2}
      totalSteps={7}
      title="What service or subscription do you want to track?"
      body="Choose one provider to prefill the next screens and keep the setup quick."
      footer={<SubscriptionSetupPrimaryButton label="Continue" onPress={() => router.push('/(finance)/subscription-setup/type')} />}
    >
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.5) }]}>Quick library</Text>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>Pick a known provider</Text>
        <Text style={[styles.summaryBody, { color: hexToRgba(colors.text, 0.56) }]}>The setup will auto-fill category, cycle and starting amount from the selected service.</Text>
      </View>
      <View style={styles.stack}>
        {subscriptionServices.map((item) => {
          const active = item.id === state.serviceId;

          return (
            <Pressable
              key={item.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: active ? hexToRgba(item.accent, 0.1) : colors.card,
                  borderColor: active ? item.accent : colors.border,
                },
              ]}
              onPress={() => {
                setServiceId(item.id);
                setType(item.type);
                setAmount(String(item.amount));
                setCycle(item.cycle);
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: hexToRgba(item.accent, 0.14) }]}>
                <MaterialIcons name={item.icon} size={20} color={item.accent} />
              </View>
              <View style={styles.optionCopy}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{item.service}</Text>
                <Text style={[styles.optionBody, { color: hexToRgba(colors.text, 0.52) }]}>{item.type} • {item.cycle}</Text>
                <Text style={[styles.optionAmount, { color: active ? item.accent : colors.text }]}>${item.amount.toFixed(2)}</Text>
              </View>
              {active ? <MaterialIcons name="check-circle" size={20} color={item.accent} /> : null}
            </Pressable>
          );
        })}
      </View>
    </SubscriptionSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    summaryCard: { borderWidth: 1, borderRadius: 24, padding: 18 },
    summaryLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
    summaryTitle: { marginTop: 8, fontSize: 18, fontWeight: '900' },
    summaryBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    stack: { gap: 12 },
    optionCard: { borderWidth: 1, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    optionIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    optionCopy: { flex: 1 },
    optionTitle: { fontSize: 14, fontWeight: '800' },
    optionBody: { marginTop: 4, fontSize: 12, fontWeight: '600' },
    optionAmount: { marginTop: 6, fontSize: 12, fontWeight: '800' },
  });
}
