import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton, SetupSecondaryButton } from '@/components/profile-setup/shared';

export default function ProfileSetupAvatarScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={1}
      totalSteps={24}
      title="Let's set up your profile avatar or image"
      body="A strong profile image makes the account feel personal and keeps the rest of onboarding grounded."
      footer={
        <>
          <SetupPrimaryButton label="Start with avatar" onPress={() => router.push('/(auth)/profile-setup/choose-avatar')} />
          <SetupSecondaryButton label="Skip for now" onPress={() => router.push('/(auth)/profile-setup/link-bank')} />
        </>
      }
    >
      <View style={styles.optionGrid}>
        <View style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View style={[styles.optionIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}>
            <MaterialIcons name="account-circle" size={32} color={colors.primaryDark} />
          </View>
          <Text style={[styles.optionTitle, { color: colors.text }]}>Use avatar</Text>
          <Text style={[styles.optionBody, { color: hexToRgba(colors.text, 0.56) }]}>Choose from curated illustrated profile styles.</Text>
        </View>
        <View style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View style={[styles.optionIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}>
            <MaterialIcons name="image" size={32} color={colors.primaryDark} />
          </View>
          <Text style={[styles.optionTitle, { color: colors.text }]}>Upload image</Text>
          <Text style={[styles.optionBody, { color: hexToRgba(colors.text, 0.56) }]}>Use your own photo or profile image.</Text>
        </View>
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    optionGrid: { flexDirection: 'row', gap: 12 },
    optionCard: { flex: 1, minHeight: 192, borderRadius: 24, borderWidth: 1, padding: 18, justifyContent: 'center', alignItems: 'center' },
    optionIcon: { width: 82, height: 82, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    optionTitle: { marginTop: 16, fontSize: 16, fontWeight: '800' },
    optionBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500', textAlign: 'center' },
  });
}
