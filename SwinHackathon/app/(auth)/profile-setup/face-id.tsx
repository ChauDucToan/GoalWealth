import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton, SetupSecondaryButton } from '@/components/profile-setup/shared';

export default function FaceIdScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={11}
      totalSteps={24}
      title="Would you like to enable FaceID to sign in quickly?"
      body="Biometric sign-in reduces friction and keeps your account access secure."
      footer={
        <>
          <SetupPrimaryButton label="Turn on Face ID" onPress={() => router.push('/(auth)/profile-setup/otp')} />
          <SetupSecondaryButton label="Not now" onPress={() => router.push('/(auth)/profile-setup/otp')} />
        </>
      }
    >
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={[styles.heroBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}> 
          <MaterialIcons name="face-retouching-natural" size={44} color={colors.primaryDark} />
        </View>
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    heroCard: { minHeight: 240, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    heroBadge: { width: 112, height: 112, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  });
}
