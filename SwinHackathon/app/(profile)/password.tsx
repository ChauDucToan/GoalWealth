import { FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ProfilePrimaryActions, ProfileSettingsCard, ProfileSettingsSectionTitle } from '@/components/profile-settings/ui';
import { hexToRgba } from '@/components/auth/AuthKit';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProfilePasswordScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <FinanceScreen
      title="Change Password"
      subtitle="This version merges the confirmation and success steps into one shorter flow."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <ProfileSettingsCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.error, 0.08),
              borderColor: hexToRgba(colors.error, 0.14),
            },
          ]}
        >
          <Text style={[styles.heroEyebrow, { color: colors.error }]}>Credential update</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Create a stronger password.</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
            The kit shows several password screens. Here the input, confirmation and result are compressed into one efficient pass.
          </Text>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Password details" />
          <View style={styles.formStack}>
            <View>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.54) }]}>Current password</Text>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Current password"
                placeholderTextColor={hexToRgba(colors.text, 0.34)}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft },
                ]}
              />
            </View>
            <View>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.54) }]}>New password</Text>
              <TextInput
                value={nextPassword}
                onChangeText={setNextPassword}
                secureTextEntry
                placeholder="New password"
                placeholderTextColor={hexToRgba(colors.text, 0.34)}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft },
                ]}
              />
            </View>
            <View>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.54) }]}>Confirm password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirm password"
                placeholderTextColor={hexToRgba(colors.text, 0.34)}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft },
                ]}
              />
            </View>
          </View>

          <View style={[styles.tipCard, { backgroundColor: colors.backgroundSoft }]}>
            <Text style={[styles.tipTitle, { color: colors.text }]}>Password tips</Text>
            <Text style={[styles.tipBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Use at least 8 characters with a number and a symbol. Avoid reusing old passwords.
            </Text>
          </View>
        </ProfileSettingsCard>

        <ProfilePrimaryActions
          primaryLabel="Update Password"
          onPrimary={() => router.push({ pathname: '/(profile)/result', params: { mode: 'password' } })}
          secondaryLabel="Cancel"
          onSecondary={() => router.back()}
        />
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
    formStack: {
      marginTop: 16,
      gap: 14,
    },
    fieldLabel: {
      marginBottom: 8,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    input: {
      minHeight: 48,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 14,
      fontSize: 14,
      fontWeight: '600',
    },
    tipCard: {
      marginTop: 18,
      borderRadius: 18,
      padding: 14,
    },
    tipTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    tipBody: {
      marginTop: 6,
      fontSize: Typography.body,
      lineHeight: 18,
    },
  });
}
