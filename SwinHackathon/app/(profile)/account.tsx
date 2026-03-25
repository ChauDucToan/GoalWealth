import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceScreen } from '@/components/finance/FinanceScaffold';
import { exportFormats, premiumPerks } from '@/components/profile-settings/data';
import {
  ProfilePrimaryActions,
  ProfileSettingsBanner,
  ProfileSettingsCard,
  ProfileSettingsPill,
  ProfileSettingsSectionTitle,
  ProfileSettingsStat,
} from '@/components/profile-settings/ui';
import { Typography } from '@/constants/theme';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProfileAccountScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { profile, exportStatusLabel, updateProfile, requestExport } = useProfileSettings();
  const exportStatusSummary = exportStatusLabel.includes('requested') ? 'Queued now' : 'Recent';
  const [draft, setDraft] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
  });

  return (
    <FinanceScreen
      title="Account"
      subtitle="Review your identity, member status and export options from one screen."
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
              <Text style={[styles.planLabel, { color: colors.primaryDark }]}>{profile.planLabel}</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
                {profile.memberSince} • {profile.city}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: colors.card }]}>
              <MaterialIcons name="verified" size={16} color={colors.success} />
              <Text style={[styles.statusText, { color: colors.success }]}>Verified</Text>
            </View>
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsBanner
          eyebrow="Profile Workspace"
          title="Identity, export and membership now live together"
          body="The board shows account, export and premium fragments in separate places. This screen keeps them grouped so profile management stays fast."
          icon="person-outline"
        />

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
                onChangeText={(value) => setDraft((current) => ({ ...current, email: value }))}
                placeholder="Enter your email"
                placeholderTextColor={hexToRgba(colors.text, 0.34)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft },
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
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Data & membership" />
          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <ProfileSettingsStat value={profile.planLabel} label="Membership" icon="workspace-premium" tone="warning" />
            </View>
            <View style={styles.statItem}>
              <ProfileSettingsStat value={exportStatusSummary} label="Latest export" icon="file-download-done" tone="soft" />
            </View>
          </View>

          <View style={styles.metaStack}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.56) }]}>Plan</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{profile.planLabel}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.56) }]}>Member since</Text>
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

          <View style={[styles.perksCard, { backgroundColor: colors.backgroundSoft }]}>
            <Text style={[styles.perksTitle, { color: colors.text }]}>Premium perks active</Text>
            {premiumPerks.map((item) => (
              <View key={item} style={styles.perkRow}>
                <MaterialIcons name="check-circle" size={16} color={colors.primaryDark} />
                <Text style={[styles.perkText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.inlineActions}>
            <View style={styles.inlineActionWrap}>
              <ThemeButton
                title="Export Data"
                onPress={() => {
                  requestExport();
                  router.push({ pathname: '/(profile)/result', params: { mode: 'export' } });
                }}
                colorBackground={colors.primaryDark}
                colorText={colors.card}
                style={styles.fullButton}
              />
            </View>
            <View style={styles.inlineActionWrap}>
              <ThemeButton
                title="Manage Plan"
                onPress={() => router.push('/(assistant)/upgrade')}
                colorBackground={colors.card}
                colorText={colors.text}
                style={[styles.fullButton, { borderWidth: 1, borderColor: colors.border }]}
              />
            </View>
          </View>
        </ProfileSettingsCard>

        <ProfilePrimaryActions
          primaryLabel="Save Changes"
          onPrimary={() => {
            updateProfile(draft);
            router.push({ pathname: '/(profile)/result', params: { mode: 'profile' } });
          }}
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
    planLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
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
    statusPill: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '800',
    },
    formStack: {
      marginTop: 16,
      gap: 14,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      marginBottom: 8,
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
    perksCard: {
      marginTop: 18,
      borderRadius: 18,
      padding: 14,
      gap: 10,
    },
    perksTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    perkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    perkText: {
      flex: 1,
      fontSize: Typography.body,
      lineHeight: 18,
      fontWeight: '600',
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
