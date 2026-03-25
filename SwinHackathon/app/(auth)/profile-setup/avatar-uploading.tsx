import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton } from '@/components/profile-setup/shared';

export default function AvatarUploadingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={3}
      totalSteps={24}
      title="Uploading image..."
      body="We are preparing your profile visual and validating the file before the next step."
      footer={<SetupPrimaryButton label="Continue" onPress={() => router.push('/(auth)/profile-setup/link-bank')} />}
    >
      <View style={styles.centerWrap}>
        <View style={[styles.progressRing, { borderColor: hexToRgba(colors.primaryDark, 0.16), borderTopColor: colors.primaryDark }]}> 
          <View style={[styles.progressCore, { backgroundColor: colors.card }]}> 
            <MaterialIcons name="image" size={34} color={colors.primaryDark} />
          </View>
        </View>
        <Text style={[styles.statusText, { color: colors.text }]}>Applying your profile image</Text>
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    centerWrap: { alignItems: 'center', paddingTop: 28 },
    progressRing: { width: 160, height: 160, borderRadius: 80, borderWidth: 16, alignItems: 'center', justifyContent: 'center' },
    progressCore: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    statusText: { marginTop: 18, fontSize: 15, fontWeight: '700' },
  });
}
