import { hexToRgba } from '@/components/auth/AuthKit';
import { getSubscriptionById } from '@/components/finance/subscription-data';
import { ColorTheme } from '@/constants/theme';
import { useSubscriptionSetup } from '@/hooks/use-subscription-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SubscriptionSetupPrimaryButton, SubscriptionSetupSecondaryButton, SubscriptionSetupShell } from './_shared';

export default function SubscriptionSetupAddedScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, resetDraft } = useSubscriptionSetup();
  const service = getSubscriptionById(state.serviceId);

  return (
    <SubscriptionSetupShell
      step={7}
      totalSteps={7}
      title="Subscription Added!"
      body="The first-pass setup is complete. You can continue into the full dashboard or add another plan."
      footer={
        <>
          <SubscriptionSetupPrimaryButton label="Open dashboard" onPress={() => { resetDraft(); router.replace('/(finance)/subscriptions'); }} />
          <SubscriptionSetupSecondaryButton label="Add another" onPress={() => { resetDraft(); router.replace('/(finance)/subscription-add'); }} />
        </>
      }
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={[styles.checkWrap, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}> 
          <MaterialIcons name="check-circle" size={42} color={colors.primaryDark} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{service.service}</Text>
        <Text style={[styles.cardBody, { color: hexToRgba(colors.text, 0.56) }]}>${state.amount} • {state.cycle} • next on {state.nextPayment}</Text>
      </View>
    </SubscriptionSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderRadius: 28, padding: 24, alignItems: 'center' },
    checkWrap: { width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    cardTitle: { marginTop: 16, fontSize: 18, fontWeight: '900', textAlign: 'center' },
    cardBody: { marginTop: 8, fontSize: 13, lineHeight: 19, fontWeight: '500', textAlign: 'center' },
  });
}
