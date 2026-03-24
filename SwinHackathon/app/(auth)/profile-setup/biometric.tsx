import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton } from './_shared';

export default function BiometricScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={14}
      totalSteps={24}
      title="Biometric Setup"
      body="Your device biometrics can be used for fast and secure account access."
      footer={<SetupPrimaryButton label="Use fingerprint" onPress={() => router.push('/(auth)/profile-setup/confirm-account')} />}
    >
      <View style={[styles.fingerprintWrap, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <MaterialIcons name="fingerprint" size={110} color={colors.primaryDark} />
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    fingerprintWrap: { minHeight: 260, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  });
}
