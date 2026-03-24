import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton } from './_shared';

export default function PasscodeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={13}
      totalSteps={24}
      title="Verify your Passcode"
      body="Use a memorable but private passcode for sensitive account actions."
      footer={<SetupPrimaryButton label="Continue" onPress={() => router.push('/(auth)/profile-setup/biometric')} />}
    >
      <View style={styles.codeRow}>
        {['1', '8', '7', '9'].map((digit, index) => (
          <View key={index} style={[styles.codeBox, { backgroundColor: colors.card, borderColor: index === 2 ? colors.primaryDark : colors.border }]}>
            <Text style={[styles.codeText, { color: index === 2 ? colors.primaryDark : colors.text }]}>{digit}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.helper, { color: hexToRgba(colors.text, 0.56) }]}>A 4-digit passcode will be used for fallback verification.</Text>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    codeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    codeBox: { flex: 1, minHeight: 72, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    codeText: { fontSize: 30, fontWeight: '900' },
    helper: { marginTop: 14, fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: '500' },
  });
}
