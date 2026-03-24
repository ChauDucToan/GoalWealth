import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton } from './_shared';

export default function PlanProcessingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={23}
      totalSteps={24}
      title="We're processing your premium membership."
      body="This loading state mirrors the kit before the final success confirmation."
      footer={<SetupPrimaryButton label="Continue" onPress={() => router.push('/(auth)/profile-setup/premium-success')} />}
    >
      <View style={styles.centerWrap}>
        <View style={[styles.spinnerRing, { borderColor: hexToRgba(colors.primaryDark, 0.16), borderTopColor: colors.primaryDark }]} />
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    centerWrap: { alignItems: 'center', paddingTop: 42 },
    spinnerRing: { width: 92, height: 92, borderRadius: 46, borderWidth: 10 },
  });
}
