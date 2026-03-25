import { hexToRgba } from '@/components/auth/AuthKit';
import { trustedDevices } from '@/components/profile-settings/data';
import {
  ProfileSettingsBanner,
  ProfileSettingsCard,
  ProfileSettingsPill,
  ProfileSettingsRow,
  ProfileSettingsSectionTitle,
  ProfileSettingsStat,
  ProfileSettingsSwitchRow,
} from '@/components/profile-settings/ui';
import { FinanceScreen } from '@/components/finance/FinanceScaffold';
import { Typography } from '@/constants/theme';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileSecurityScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { security, updateSecurity } = useProfileSettings();
  const securityScore = Object.values(security).filter(Boolean).length;

  return (
    <FinanceScreen
      title="Security Settings"
      subtitle="Passcode, password and sign-in protection live together for quicker review."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <ProfileSettingsCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.success, 0.08),
              borderColor: hexToRgba(colors.success, 0.14),
            },
          ]}
        >
          <Text style={[styles.heroEyebrow, { color: colors.success }]}>Security center</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Protection stays visible here.</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Instead of splitting every security action into isolated screens, the hub shows the main toggles first and then routes into password and passcode details only when needed.
          </Text>
        </ProfileSettingsCard>

        <View style={styles.statGrid}>
          <View style={styles.statItem}>
            <ProfileSettingsStat value={`${securityScore}/4`} label="Security score" icon="shield" tone="success" />
          </View>
          <View style={styles.statItem}>
            <ProfileSettingsStat value={security.twoFactor ? 'Enabled' : 'Off'} label="2FA status" icon="shield" />
          </View>
          <View style={styles.statItem}>
            <ProfileSettingsStat value={security.biometrics ? 'Ready' : 'Off'} label="Biometrics" icon="fingerprint" tone="soft" />
          </View>
          <View style={styles.statItem}>
            <ProfileSettingsStat value={`${trustedDevices.length}`} label="Trusted devices" icon="devices" tone="warning" />
          </View>
        </View>

        <ProfileSettingsBanner
          eyebrow="Security State"
          title="Core protection is already turned on"
          body="You can now fine tune credentials and trusted devices from a single security center instead of hopping through multiple shallow screens."
          icon="shield"
          tone="success"
        />

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Sign-in controls" />
          <View style={styles.sectionStack}>
            <ProfileSettingsSwitchRow
              icon="fingerprint"
              label="Biometric login"
              summary="Use Face ID or fingerprint when available"
              value={security.biometrics}
              onValueChange={(value) => updateSecurity({ biometrics: value })}
            />
            <ProfileSettingsSwitchRow
              icon="shield"
              label="Two-factor verification"
              summary="Extra confirmation for new devices"
              value={security.twoFactor}
              onValueChange={(value) => updateSecurity({ twoFactor: value })}
            />
            <ProfileSettingsSwitchRow
              icon="notifications-active"
              label="Login alerts"
              summary="Get notified when a sign-in looks unusual"
              value={security.loginAlerts}
              onValueChange={(value) => updateSecurity({ loginAlerts: value })}
            />
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Credentials" />
          <View style={styles.sectionStack}>
            <ProfileSettingsRow
              icon="lock-outline"
              label="Change password"
              summary="Update your account password"
              onPress={() => router.push('/(profile)/password')}
            />
            <ProfileSettingsRow
              icon="pin"
              label="Change passcode"
              summary={security.passcodeEnabled ? '4-digit app unlock is enabled' : 'Set a local unlock code'}
              onPress={() => router.push('/(profile)/passcode')}
            />
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Trusted devices" />
          <View style={styles.pillRow}>
            <ProfileSettingsPill label="Protected" icon="shield" tone="success" />
            <ProfileSettingsPill label="Session history" icon="history" tone="soft" />
          </View>
          <View style={styles.deviceStack}>
            {trustedDevices.map((device) => (
              <View key={device.id} style={styles.deviceRow}>
                <View style={[styles.deviceDot, { backgroundColor: colors.primaryDark }]} />
                <View style={styles.deviceCopy}>
                  <Text style={[styles.deviceLabel, { color: colors.text }]}>{device.label}</Text>
                  <Text style={[styles.deviceMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                    {device.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ProfileSettingsCard>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    contentStyle: {
      paddingBottom: 30,
    },
    stack: {
      marginTop: 18,
      gap: 16,
    },
    heroCard: {
      borderWidth: 1,
    },
    statGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    statItem: {
      width: '47%',
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    heroTitle: {
      marginTop: 8,
      fontSize: 26,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    heroBody: {
      marginTop: 10,
      fontSize: Typography.body,
      lineHeight: 20,
    },
    sectionStack: {
      marginTop: 10,
      gap: 4,
    },
    deviceStack: {
      marginTop: 14,
      gap: 12,
    },
    pillRow: {
      marginTop: 14,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    deviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    deviceDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    deviceCopy: {
      flex: 1,
      minWidth: 0,
    },
    deviceLabel: {
      fontSize: 14,
      fontWeight: '700',
    },
    deviceMeta: {
      marginTop: 4,
      fontSize: Typography.body,
      lineHeight: 18,
    },
  });
}
