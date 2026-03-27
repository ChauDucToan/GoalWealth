import { hexToRgba } from '@/components/auth/AuthKit';
import { planOptions } from '@/components/profile-setup/data';
import {
  ProfileSetupShell,
  SetupPill,
  SetupPrimaryButton,
  SetupSecondaryButton,
  SetupSurface,
} from '@/components/profile-setup/shared';
import { ColorTheme } from '@/constants/theme';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PremiumSuccessScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, resetProfileSetup } = useProfileSetup();
  const { updateNotifications, updateSecurity } = useProfileSettings();
  const selectedPlan = planOptions.find((item) => item.id === state.selectedPlanId) ?? planOptions[0];

  return (
    <ProfileSetupShell
      step={6}
      totalSteps={6}
      title="Your Finpal premium trial is now active"
      body="The onboarding path is complete. This screen keeps the celebratory ending from the kit, but with a tighter summary of what just got unlocked."
      footer={
        <>
          <SetupPrimaryButton
            label="Go to Home"
            onPress={() => {
              updateNotifications({
                push: state.notificationsEnabled,
                email: state.notificationsEnabled,
                billReminders: state.notificationsEnabled,
                weeklyDigest: state.notificationsEnabled,
                communityReplies: state.notificationsEnabled,
              });
              updateSecurity({
                biometrics: state.faceIdEnabled || state.biometricEnabled,
                passcodeEnabled: Boolean(state.passcode.trim()),
                twoFactor: Boolean(state.otpCode.trim()),
              });
              resetProfileSetup();
              router.replace('/(tabs)/home');
            }}
          />
          <SetupSecondaryButton label="Back to Sign In" onPress={() => router.replace('/(auth)/signIn')} />
        </>
      }
    >
      <SetupSurface style={{ alignItems: 'center' }}>
        <SetupPill label="Premium Active" icon="workspace-premium" tone="success" />
        <View style={[styles.heroBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}>
          <MaterialIcons name="workspace-premium" size={48} color={colors.primaryDark} />
        </View>
        <Text style={[styles.planTitle, { color: colors.text }]}>{selectedPlan.title}</Text>
        <Text style={[styles.planBody, { color: hexToRgba(colors.text, 0.56) }]}>
          Premium features are active for this account and the assistant can now personalize more of your finance workflow.
        </Text>

        <View style={styles.unlockStack}>
          {['Unlimited reports unlocked', 'Priority assistant access enabled', 'Planning tools and premium insights activated'].map((item) => (
            <View key={item} style={[styles.unlockRow, { backgroundColor: colors.backgroundSoft }]}>
              <MaterialIcons name="check-circle" size={18} color={colors.primaryDark} />
              <Text style={[styles.unlockText, { color: colors.text }]}>{item}</Text>
            </View>
          ))}
        </View>
      </SetupSurface>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    heroBadge: { width: 104, height: 104, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
    planTitle: { marginTop: 16, fontSize: 20, fontWeight: '900', textAlign: 'center' },
    planBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500', textAlign: 'center' },
    unlockStack: { width: '100%', gap: 10 },
    unlockRow: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
    unlockText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  });
}
