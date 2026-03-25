import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useSubscriptionSetup } from '@/hooks/use-subscription-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SubscriptionSetupPrimaryButton, SubscriptionSetupShell } from './_shared';

const presets = ['8', '10', '15', '20'];

export default function SubscriptionSetupAmountScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setAmount } = useSubscriptionSetup();
  const numeric = Number(state.amount || '0');

  return (
    <SubscriptionSetupShell
      step={4}
      totalSteps={7}
      title="What is the amount of your subscription?"
      body="Use a rough number if you do not know the exact renewal amount yet."
      footer={<SubscriptionSetupPrimaryButton label="Continue" onPress={() => router.push('/(finance)/subscription-setup/next-payment')} />}
    >
      <View style={[styles.valueCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.valueLabel, { color: hexToRgba(colors.text, 0.54) }]}>Subscription amount</Text>
        <Text style={[styles.valueText, { color: colors.primaryDark }]}>${state.amount}</Text>
        <Text style={[styles.valueHint, { color: hexToRgba(colors.text, 0.52) }]}>This amount will appear in projections and payment cards.</Text>
      </View>

      <View style={styles.stepperRow}>
        <Pressable style={[styles.stepperButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setAmount(String(Math.max(0, numeric - 1)))}>
          <MaterialIcons name="remove" size={18} color={colors.text} />
        </Pressable>
        <View style={[styles.stepperValue, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
          <Text style={[styles.stepperValueText, { color: colors.text }]}>{state.amount}</Text>
        </View>
        <Pressable style={[styles.stepperButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setAmount(String(numeric + 1))}>
          <MaterialIcons name="add" size={18} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.presetRow}>
        {presets.map((item) => (
          <Pressable key={item} style={[styles.presetChip, { backgroundColor: state.amount === item ? hexToRgba(colors.primaryDark, 0.1) : colors.card, borderColor: state.amount === item ? colors.primaryDark : colors.border }]} onPress={() => setAmount(item)}>
            <Text style={[styles.presetText, { color: state.amount === item ? colors.primaryDark : colors.text }]}>${item}</Text>
          </Pressable>
        ))}
      </View>
    </SubscriptionSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    valueCard: { borderWidth: 1, borderRadius: 24, padding: 18 },
    valueLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
    valueText: { marginTop: 8, fontSize: 44, fontWeight: '900', letterSpacing: -1.2 },
    valueHint: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
    stepperButton: { width: 54, height: 54, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    stepperValue: { flex: 1, minHeight: 54, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    stepperValueText: { fontSize: 26, fontWeight: '900' },
    presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    presetChip: { minWidth: 68, minHeight: 42, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
    presetText: { fontSize: 13, fontWeight: '800' },
  });
}
