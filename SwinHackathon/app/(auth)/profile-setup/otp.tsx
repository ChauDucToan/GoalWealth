import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton } from './_shared';

export default function OtpScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={12}
      totalSteps={24}
      title="OTP Security Setup"
      body="Verify the code sent to your device before we finish the secure sign-in setup."
      footer={<SetupPrimaryButton label="Continue" onPress={() => router.push('/(auth)/profile-setup/passcode')} />}
    >
      <View style={styles.codeRow}>
        {['0', '0', '0', '0'].map((digit, index) => (
          <View key={index} style={[styles.codeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.codeText, { color: colors.text }]}>{digit}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.helper, { color: hexToRgba(colors.text, 0.56) }]}>Enter the 4-digit code that was sent to your phone.</Text>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    codeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    codeBox: { flex: 1, minHeight: 68, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    codeText: { fontSize: 28, fontWeight: '900' },
    helper: { marginTop: 14, fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: '500' },
  });
}
