import { hexToRgba } from '@/components/auth/AuthKit';
import { avatars, banks, notificationOptions, privacySections, savingsAccounts } from '@/components/profile-setup/data';
import {
  ProfileSetupShell,
  SetupPill,
  SetupPrimaryButton,
  SetupSectionTitle,
  SetupSurface,
} from '@/components/profile-setup/shared';
import { ColorTheme } from '@/constants/theme';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';

export default function ConfirmAccountScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width < 390), [colors, width]);
  const router = useRouter();
  const { state, setNotificationsEnabled } = useProfileSetup();
  const { profile } = useProfileSettings();
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(true);

  const avatar = avatars.find((item) => item.id === state.selectedAvatarId) ?? avatars[0];
  const bank = banks.find((item) => item.id === state.linkedBankId) ?? banks[0];
  const savings = savingsAccounts.find((item) => item.id === state.selectedSavingsAccountId) ?? savingsAccounts[0];

  return (
    <ProfileSetupShell
      step={4}
      totalSteps={6}
      title="Review your account, privacy and notification setup"
      body="Profile confirmation, secure-data messaging, privacy policy and notification setup are now grouped together. It reads much closer to the kit while keeping the user in one clear completion block."
      footer={
        <SetupPrimaryButton
          label="Continue to financial overview"
          onPress={() => router.push('/(auth)/profile-setup/financial-score')}
          disabled={!acceptedPrivacy}
        />
      }
    >
      <SetupSurface>
        <SetupPill label="Account Completion" icon="check-circle" />
        <View style={styles.profileHero}>
          <View style={[styles.avatarCircle, { backgroundColor: hexToRgba(state.avatarMode === 'upload' ? colors.primaryDark : avatar.accent, 0.14) }]}>
            <MaterialIcons
              name={state.avatarMode === 'upload' ? 'image' : avatar.icon}
              size={36}
              color={state.avatarMode === 'upload' ? colors.primaryDark : avatar.accent}
            />
          </View>

          <View style={styles.profileCopy}>
            <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
            <Text style={[styles.profileMeta, { color: hexToRgba(colors.text, 0.56) }]}>{profile.email}</Text>
            <View style={styles.pillRow}>
              <SetupPill label={bank.label} icon="account-balance" tone="soft" />
              <SetupPill label={savings.label} icon="savings" tone="soft" />
            </View>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          {[
            { label: 'Face ID', value: state.faceIdEnabled ? 'Enabled' : 'Off' },
            { label: 'Biometric', value: state.biometricEnabled ? 'Active' : 'Off' },
            { label: 'Passcode', value: `••${state.passcode.slice(-2)}` },
          ].map((item) => (
            <View key={item.label} style={[styles.summaryCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.06) }]}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.52) }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </SetupSurface>

      <SetupSectionTitle
        eyebrow="Trust"
        title="Your data stays protected"
        body="The old flow split trust messaging and policy into multiple small stops. This version keeps the same information in one place."
      />

      <SetupSurface>
        {privacySections.map((item) => (
          <View key={item} style={styles.listRow}>
            <MaterialIcons name="verified-user" size={18} color={colors.primaryDark} />
            <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
          </View>
        ))}
      </SetupSurface>

      <SetupSurface>
        <View style={styles.notificationsRow}>
          <View style={styles.notificationsCopy}>
            <Text style={[styles.notificationsTitle, { color: colors.text }]}>Enable notifications</Text>
            <Text style={[styles.notificationsBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Personalize nudges, goal reminders and security updates from day one.
            </Text>
          </View>
          <Switch
            value={state.notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: colors.primaryDark, false: colors.border }}
          />
        </View>

        <View style={styles.notificationStack}>
          {notificationOptions.map((item) => (
            <View key={item.id} style={[styles.notificationCard, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
              <MaterialIcons name="notifications-active" size={18} color={colors.primaryDark} />
              <View style={styles.notificationCopy}>
                <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.notificationBody, { color: hexToRgba(colors.text, 0.56) }]}>{item.helper}</Text>
              </View>
            </View>
          ))}
        </View>
      </SetupSurface>

      <Pressable
        style={[
          styles.acceptanceRow,
          { backgroundColor: acceptedPrivacy ? hexToRgba(colors.primaryDark, 0.08) : colors.card, borderColor: acceptedPrivacy ? colors.primaryDark : colors.border },
        ]}
        onPress={() => setAcceptedPrivacy((current) => !current)}
      >
        <MaterialIcons name={acceptedPrivacy ? 'check-circle' : 'radio-button-unchecked'} size={20} color={acceptedPrivacy ? colors.primaryDark : hexToRgba(colors.text, 0.4)} />
        <Text style={[styles.acceptanceText, { color: colors.text }]}>I understand the privacy summary and want to continue.</Text>
      </Pressable>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme, isCompact: boolean) {
  return StyleSheet.create({
    profileHero: { flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'center' : 'center', gap: 16 },
    avatarCircle: { width: 96, height: 96, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    profileCopy: { flex: 1, gap: 6, minWidth: 0 },
    profileName: { fontSize: 18, fontWeight: '900', textAlign: isCompact ? 'center' : 'left' },
    profileMeta: { fontSize: 12, fontWeight: '600', textAlign: isCompact ? 'center' : 'left' },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: isCompact ? 'center' : 'flex-start' },
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    summaryCard: { minWidth: isCompact ? '47%' : '31%', flexGrow: 1, borderRadius: 18, padding: 12 },
    summaryValue: { fontSize: 14, fontWeight: '800' },
    summaryLabel: { marginTop: 4, fontSize: 11, fontWeight: '700' },
    listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    listText: { flex: 1, fontSize: 12, lineHeight: 19, fontWeight: '500' },
    notificationsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    notificationsCopy: { flex: 1 },
    notificationsTitle: { fontSize: 15, fontWeight: '800' },
    notificationsBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    notificationStack: { gap: 10 },
    notificationCard: { borderRadius: 18, borderWidth: 1, padding: 12, flexDirection: 'row', gap: 10 },
    notificationCopy: { flex: 1, minWidth: 0 },
    notificationTitle: { fontSize: 13, fontWeight: '800' },
    notificationBody: { marginTop: 3, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    acceptanceRow: { borderRadius: 20, borderWidth: 1, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center' },
    acceptanceText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  });
}
