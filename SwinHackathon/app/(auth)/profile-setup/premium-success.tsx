import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { planOptions } from './_data';
import { ProfileSetupShell, SetupPrimaryButton, SetupSecondaryButton } from './_shared';

export default function PremiumSuccessScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, resetProfileSetup } = useProfileSetup();
  const selectedPlan = planOptions.find((item) => item.id === state.selectedPlanId) ?? planOptions[0];

  return (
    <ProfileSetupShell
      step={24}
      totalSteps={24}
      title="Your finpal premium trial has begun now."
      body="The onboarding path is complete and your premium workspace is ready."
      footer={
        <>
          <SetupPrimaryButton
            label="Go to Home"
            onPress={() => {
              resetProfileSetup();
              router.replace('/(tabs)/home');
            }}
          />
          <SetupSecondaryButton label="Back to Sign In" onPress={() => router.replace('/(auth)/signIn')} />
        </>
      }
    >
      <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={[styles.iconWrap, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}> 
          <MaterialIcons name="workspace-premium" size={44} color={colors.primaryDark} />
        </View>
        <Text style={[styles.planTitle, { color: colors.text }]}>{selectedPlan.title}</Text>
        <Text style={[styles.planBody, { color: hexToRgba(colors.text, 0.56) }]}>Premium features are now active for this account.</Text>
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    successCard: { minHeight: 240, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    iconWrap: { width: 98, height: 98, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    planTitle: { marginTop: 16, fontSize: 18, fontWeight: '800' },
    planBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500', textAlign: 'center' },
  });
}
