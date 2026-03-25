import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { privacySections } from '@/components/profile-setup/data';
import { ProfileSetupShell, SetupPrimaryButton } from '@/components/profile-setup/shared';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={17}
      totalSteps={24}
      title="Privacy Policy"
      body="These are the most relevant policy points before notifications and personalization are enabled."
      footer={<SetupPrimaryButton label="I understand" onPress={() => router.push('/(auth)/profile-setup/notifications')} />}
    >
      <View style={[styles.policyCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        {privacySections.map((item) => (
          <Text key={item} style={[styles.policyText, { color: hexToRgba(colors.text, 0.72) }]}>{item}</Text>
        ))}
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    policyCard: { borderRadius: 24, borderWidth: 1, padding: 18, gap: 14 },
    policyText: { fontSize: 12, lineHeight: 19, fontWeight: '500' },
  });
}
