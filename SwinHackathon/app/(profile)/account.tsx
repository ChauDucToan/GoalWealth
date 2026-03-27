import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceScreen } from '@/components/finance/FinanceScaffold';
import { exportFormats } from '@/components/profile-settings/data';
import {
  ProfilePrimaryActions,
  ProfileSettingsCard,
  ProfileSettingsPill,
  ProfileSettingsSectionTitle,
  ProfileSettingsStat,
} from '@/components/profile-settings/ui';
import { Typography } from '@/constants/theme';
import { useMyUser } from '@/context/myUserContext';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useDebouncedPress } from '@/hooks/use-debounced-press';
import { useTheme } from '@/hooks/use-theme-colors';
import { isGoalwealthLiveAdapterEnabled } from '@/services/api/config';
import { normalizeGoalwealthError } from '@/services/api/errors';
import { mapGoalwealthMeToUserProfile, patchGoalwealthMe } from '@/services/api/me';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProfileAccountScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state: userState, dispatch, actions } = useMyUser();
  const { profile, exportStatusLabel, updateProfile, requestExport } = useProfileSettings();
  const exportStatusSummary = exportStatusLabel.includes('requested') ? 'Queued now' : 'Recent';
  const liveAdapterEnabled = isGoalwealthLiveAdapterEnabled();
  const [draft, setDraft] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    city: profile.city,
    countryCode: profile.countryCode,
    timezone: profile.timezone,
  });
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { handlePress: handleExportDataPress, isCoolingDown: isExportDataCoolingDown } =
    useDebouncedPress(() => {
      requestExport();
      router.push({ pathname: '/(profile)/result', params: { mode: 'export' } });
    }, 500);
  const { handlePress: handleExportResultPress, isCoolingDown: isExportResultCoolingDown } =
    useDebouncedPress(() => {
      router.push({ pathname: '/(profile)/result', params: { mode: 'export' } });
    }, 500);

  useEffect(() => {
    setDraft({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
      countryCode: profile.countryCode,
      timezone: profile.timezone,
    });
  }, [profile]);

  const handleSaveChanges = async () => {
    setSaveError('');
    setIsSaving(true);

    try {
      const localPatch = {
        name: draft.name.trim() || profile.name,
        email: profile.email,
        phone: draft.phone.trim() || '',
        city: draft.city.trim() || '',
        countryCode: draft.countryCode.trim().toUpperCase() || '',
        timezone: draft.timezone.trim() || profile.timezone,
      };

      updateProfile(localPatch);

      if (
        liveAdapterEnabled &&
        userState.accessToken?.trim() &&
        userState.authMode !== 'registered-password'
      ) {
        const response = await patchGoalwealthMe(
          {
            display_name: localPatch.name,
            phone: localPatch.phone || undefined,
            city: localPatch.city || undefined,
            country_code: localPatch.countryCode || undefined,
            timezone: localPatch.timezone || undefined,
          },
          userState.accessToken
        );

        updateProfile({
          name: response.data.user.display_name?.trim() || localPatch.name,
          email: response.data.user.email?.trim() || profile.email,
          phone: response.data.user.phone?.trim() || localPatch.phone,
          city: response.data.user.location.city?.trim() || localPatch.city,
          countryCode: response.data.user.location.country?.trim() || localPatch.countryCode,
          timezone: response.data.user.timezone?.trim() || localPatch.timezone,
          locale: response.data.user.locale?.trim() || profile.locale,
        });
        dispatch(actions.updateProfile(mapGoalwealthMeToUserProfile(response.data)));
      } else {
        dispatch(
          actions.updateProfile({
            name: localPatch.name,
            phone: localPatch.phone || undefined,
            city: localPatch.city || undefined,
            countryCode: localPatch.countryCode || undefined,
            timezone: localPatch.timezone || undefined,
          })
        );
      }

      router.push({ pathname: '/(profile)/result', params: { mode: 'profile' } });
    } catch (error) {
      const normalizedError = normalizeGoalwealthError(error);
      setSaveError(normalizedError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FinanceScreen
      title="Account"
      subtitle="Review your identity, joined date and export options from one screen."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <ProfileSettingsCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.primaryDark, 0.06),
              borderColor: hexToRgba(colors.primaryDark, 0.1),
            },
          ]}
        >
          <View style={styles.heroHeader}>
            <View style={[styles.avatar, { backgroundColor: hexToRgba(colors.primaryDark, 0.12) }]}>
              <Text style={[styles.avatarText, { color: colors.primaryDark }]}>{profile.avatarInitial}</Text>
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
                {profile.memberSince} • {profile.city}
              </Text>
            </View>
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Profile details" />
          <View style={styles.formStack}>
            <View>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.54) }]}>Full name</Text>
              <TextInput
                value={draft.name}
                onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))}
                placeholder="Enter your name"
                placeholderTextColor={hexToRgba(colors.text, 0.34)}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft },
                ]}
              />
            </View>
            <View>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.54) }]}>Email address</Text>
              <TextInput
                value={draft.email}
                editable={false}
                placeholder="Managed by your sign-in provider"
                placeholderTextColor={hexToRgba(colors.text, 0.34)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.input,
                  { color: hexToRgba(colors.text, 0.56), borderColor: colors.border, backgroundColor: colors.backgroundSoft },
                ]}
              />
            </View>
            <View>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.54) }]}>Phone number</Text>
              <TextInput
                value={draft.phone}
                onChangeText={(value) => setDraft((current) => ({ ...current, phone: value }))}
                placeholder="Enter your phone"
                placeholderTextColor={hexToRgba(colors.text, 0.34)}
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft },
                ]}
              />
            </View>
            <View>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.54) }]}>City</Text>
              <TextInput
                value={draft.city}
                onChangeText={(value) => setDraft((current) => ({ ...current, city: value }))}
                placeholder="Enter your city"
                placeholderTextColor={hexToRgba(colors.text, 0.34)}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft },
                ]}
              />
            </View>
            <View style={styles.splitRow}>
              <View style={styles.splitField}>
                <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.54) }]}>Country code</Text>
                <TextInput
                  value={draft.countryCode}
                  onChangeText={(value) =>
                    setDraft((current) => ({ ...current, countryCode: value.toUpperCase() }))
                  }
                  placeholder="VN"
                  placeholderTextColor={hexToRgba(colors.text, 0.34)}
                  autoCapitalize="characters"
                  maxLength={2}
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft },
                  ]}
                />
              </View>
              <View style={styles.splitField}>
                <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.54) }]}>Timezone</Text>
                <TextInput
                  value={draft.timezone}
                  onChangeText={(value) => setDraft((current) => ({ ...current, timezone: value }))}
                  placeholder="Asia/Ho_Chi_Minh"
                  placeholderTextColor={hexToRgba(colors.text, 0.34)}
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft },
                  ]}
                />
              </View>
            </View>
            {saveError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{saveError}</Text>
            ) : null}
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Data & exports" />
          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <ProfileSettingsStat value={profile.memberSince.replace('Joined ', '')} label="Joined" icon="calendar-month" tone="soft" />
            </View>
            <View style={styles.statItem}>
              <ProfileSettingsStat value={exportStatusSummary} label="Latest export" icon="file-download-done" tone="soft" />
            </View>
          </View>

          <View style={styles.metaStack}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.56) }]}>Joined</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{profile.memberSince}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.56) }]}>Last export</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{exportStatusLabel}</Text>
            </View>
          </View>

          <View style={styles.formatRow}>
            {exportFormats.map((format) => (
              <ProfileSettingsPill key={format} label={format} icon="description" tone="soft" />
            ))}
          </View>

          <View style={styles.inlineActions}>
            <View style={styles.inlineActionWrap}>
              <ThemeButton
                title="Export Data"
                onPress={handleExportDataPress}
                colorBackground={colors.primaryDark}
                colorText={colors.card}
                style={styles.fullButton}
                disabled={isExportDataCoolingDown}
              />
            </View>
            <View style={styles.inlineActionWrap}>
              <ThemeButton
                title="Export Result"
                onPress={handleExportResultPress}
                colorBackground={colors.card}
                colorText={colors.text}
                style={[styles.fullButton, { borderWidth: 1, borderColor: colors.border }]}
                disabled={isExportResultCoolingDown}
              />
            </View>
          </View>
        </ProfileSettingsCard>

        <ProfilePrimaryActions
          primaryLabel="Save Changes"
          onPrimary={handleSaveChanges}
          secondaryLabel="Cancel"
          onSecondary={() => router.back()}
          primaryDisabled={isSaving}
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
    heroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    avatar: {
      width: 68,
      height: 68,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 28,
      fontWeight: '900',
    },
    heroCopy: {
      flex: 1,
      minWidth: 0,
    },
    heroTitle: {
      marginTop: 4,
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.4,
    },
    heroBody: {
      marginTop: 4,
      fontSize: Typography.body,
      lineHeight: 18,
    },
    formStack: {
      marginTop: 16,
      gap: 14,
    },
    splitRow: {
      flexDirection: 'row',
      gap: 12,
    },
    splitField: {
      flex: 1,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    errorText: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '600',
    },
    input: {
      minHeight: 48,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 14,
      fontSize: 14,
      fontWeight: '600',
    },
    metaStack: {
      marginTop: 16,
      gap: 12,
    },
    statGrid: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    statItem: {
      width: '47%',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    metaLabel: {
      fontSize: 13,
      fontWeight: '700',
    },
    metaValue: {
      fontSize: 13,
      fontWeight: '800',
      textAlign: 'right',
      flexShrink: 1,
    },
    formatRow: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    inlineActions: {
      marginTop: 18,
      flexDirection: 'row',
      gap: 12,
    },
    inlineActionWrap: {
      flex: 1,
    },
    fullButton: {
      width: '100%',
    },
  });
}
