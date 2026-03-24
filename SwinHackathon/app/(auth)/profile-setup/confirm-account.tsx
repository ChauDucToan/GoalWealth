import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { avatars, banks, savingsAccounts } from './_data';
import { ProfileSetupShell, SetupPrimaryButton } from './_shared';

export default function ConfirmAccountScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state } = useProfileSetup();
  const avatar = avatars.find((item) => item.id === state.selectedAvatarId) ?? avatars[0];
  const bank = banks.find((item) => item.id === state.linkedBankId) ?? banks[0];
  const savings = savingsAccounts.find((item) => item.id === state.selectedSavingsAccountId) ?? savingsAccounts[0];

  return (
    <ProfileSetupShell
      step={15}
      totalSteps={24}
      title="Let's Confirm Your Account"
      body="Review the profile, bank and savings details before the final trust and policy screens."
      footer={<SetupPrimaryButton label="Continue" onPress={() => router.push('/(auth)/profile-setup/data-secure')} />}
    >
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={[styles.avatarCircle, { backgroundColor: hexToRgba(avatar.accent, 0.14) }]}> 
          <MaterialIcons name={avatar.icon} size={28} color={avatar.accent} />
        </View>
        <Text style={[styles.profileTitle, { color: colors.text }]}>Jonathan Doe</Text>
        <Text style={[styles.profileBody, { color: hexToRgba(colors.text, 0.56) }]}>Primary bank: {bank.label} • Savings: {savings.label}</Text>
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    profileCard: { minHeight: 220, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    avatarCircle: { width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    profileTitle: { marginTop: 16, fontSize: 18, fontWeight: '800' },
    profileBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500', textAlign: 'center' },
  });
}
