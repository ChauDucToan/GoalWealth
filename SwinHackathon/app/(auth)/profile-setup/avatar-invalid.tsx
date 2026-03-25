import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton, SetupSecondaryButton } from '@/components/profile-setup/shared';

export default function AvatarInvalidScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={4}
      totalSteps={24}
      title="Invalid format"
      body="The uploaded file could not be used as a profile image. Please choose a different file type or go back to avatars."
      footer={
        <>
          <SetupPrimaryButton label="Back to choose avatar" onPress={() => router.replace('/(auth)/profile-setup/choose-avatar')} />
          <SetupSecondaryButton label="Skip to bank linking" onPress={() => router.push('/(auth)/profile-setup/link-bank')} />
        </>
      }
    >
      <View style={styles.alertCard}>
        <View style={[styles.alertIcon, { backgroundColor: hexToRgba(colors.error, 0.12) }]}> 
          <MaterialIcons name="warning-amber" size={34} color={colors.error} />
        </View>
        <Text style={[styles.alertTitle, { color: colors.text }]}>Unsupported image</Text>
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    alertCard: { minHeight: 220, borderRadius: 28, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', padding: 20 },
    alertIcon: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    alertTitle: { marginTop: 18, fontSize: 16, fontWeight: '800' },
  });
}
