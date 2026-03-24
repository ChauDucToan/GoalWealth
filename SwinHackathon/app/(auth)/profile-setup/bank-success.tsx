import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton } from './_shared';

export default function BankSuccessScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={9}
      totalSteps={24}
      title="Great work!"
      body="Your bank account is now connected and ready for savings selection."
      footer={<SetupPrimaryButton label="Continue" onPress={() => router.push('/(auth)/profile-setup/savings-account')} />}
    >
      <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={[styles.successBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}> 
          <MaterialIcons name="check-circle" size={40} color={colors.primaryDark} />
        </View>
        <Text style={[styles.successTitle, { color: colors.text }]}>Bank linked</Text>
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    successCard: { minHeight: 220, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    successBadge: { width: 96, height: 96, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    successTitle: { marginTop: 16, fontSize: 17, fontWeight: '800' },
  });
}
