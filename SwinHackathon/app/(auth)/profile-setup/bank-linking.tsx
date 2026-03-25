import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton } from '@/components/profile-setup/shared';

export default function BankLinkingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={8}
      totalSteps={24}
      title="Link new bank account"
      body="We are securely connecting your institution and preparing the list of available accounts."
      footer={<SetupPrimaryButton label="Continue" onPress={() => router.push('/(auth)/profile-setup/bank-success')} />}
    >
      <View style={styles.centerWrap}>
        <View style={[styles.spinnerRing, { borderColor: hexToRgba(colors.primaryDark, 0.16), borderTopColor: colors.primaryDark }]} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Linking with Chase...</Text>
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    centerWrap: { alignItems: 'center', paddingTop: 40 },
    spinnerRing: { width: 92, height: 92, borderRadius: 46, borderWidth: 10 },
    loadingText: { marginTop: 18, fontSize: 15, fontWeight: '700' },
  });
}
