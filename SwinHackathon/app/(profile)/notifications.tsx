import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceScreen } from '@/components/finance/FinanceScaffold';
import {
  ProfileSettingsBanner,
  ProfileSettingsCard,
  ProfileSettingsPill,
  ProfileSettingsSectionTitle,
  ProfileSettingsStat,
  ProfileSettingsSwitchRow,
} from '@/components/profile-settings/ui';
import { Typography } from '@/constants/theme';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useTheme } from '@/hooks/use-theme-colors';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileNotificationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { notifications, updateNotifications } = useProfileSettings();
  const enabledNotifications = Object.values(notifications).filter(Boolean).length;

  return (
    <FinanceScreen
      title="Notification Settings"
      subtitle="Manage alerts, digest cadence and quieter moments from one place."
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
          <Text style={[styles.heroEyebrow, { color: colors.primaryDark }]}>Alert center</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Stay informed without overload.</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
            The kit shows several notification variants. This screen folds them into one detailed panel so users do not have to bounce between near-identical states.
          </Text>
        </ProfileSettingsCard>

        <View style={styles.statGrid}>
          <View style={styles.statItem}>
            <ProfileSettingsStat value={`${enabledNotifications} active`} label="Enabled toggles" icon="notifications-active" />
          </View>
          <View style={styles.statItem}>
            <ProfileSettingsStat value={notifications.quietHours ? 'On' : 'Off'} label="Quiet hours" icon="dark-mode" tone="soft" />
          </View>
          <View style={styles.statItem}>
            <ProfileSettingsStat value={notifications.billReminders ? 'Ready' : 'Off'} label="Bill reminders" icon="receipt-long" tone="warning" />
          </View>
          <View style={styles.statItem}>
            <ProfileSettingsStat value={notifications.weeklyDigest ? 'Weekly' : 'Paused'} label="Digest cadence" icon="insights" tone="success" />
          </View>
        </View>

        <ProfileSettingsBanner
          eyebrow="Notification Preview"
          title="Your current alert mix looks balanced"
          body="Urgent account activity can still break through while quieter reminders stay grouped into digest-style updates."
          icon="notifications-paused"
        />

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Primary channels" />
          <View style={styles.sectionStack}>
            <ProfileSettingsSwitchRow
              icon="notifications-none"
              label="Push notifications"
              summary="Transactions, goals and reminders in real time"
              value={notifications.push}
              onValueChange={(value) => updateNotifications({ push: value })}
            />
            <ProfileSettingsSwitchRow
              icon="volume-up"
              label="Sound alerts"
              summary="Audio feedback for urgent or confirmed actions"
              value={notifications.sound}
              onValueChange={(value) => updateNotifications({ sound: value })}
            />
            <ProfileSettingsSwitchRow
              icon="email"
              label="Email digests"
              summary="Longer summaries, support replies and receipts"
              value={notifications.email}
              onValueChange={(value) => updateNotifications({ email: value })}
            />
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Smart alerts" />
          <View style={styles.pillRow}>
            <ProfileSettingsPill label="Billing" icon="receipt-long" tone="soft" />
            <ProfileSettingsPill label="Security" icon="shield" tone="soft" />
            <ProfileSettingsPill label="Digest" icon="insights" tone="soft" />
          </View>
          <View style={styles.sectionStack}>
            <ProfileSettingsSwitchRow
              icon="receipt-long"
              label="Bill reminders"
              summary="Upcoming subscriptions and due dates"
              value={notifications.billReminders}
              onValueChange={(value) => updateNotifications({ billReminders: value })}
            />
            <ProfileSettingsSwitchRow
              icon="insights"
              label="Weekly digest"
              summary="One concise summary for spending and saving performance"
              value={notifications.weeklyDigest}
              onValueChange={(value) => updateNotifications({ weeklyDigest: value })}
            />
            <ProfileSettingsSwitchRow
              icon="forum"
              label="Community replies"
              summary="Mentions and responses from the finance community"
              value={notifications.communityReplies}
              onValueChange={(value) => updateNotifications({ communityReplies: value })}
            />
            <ProfileSettingsSwitchRow
              icon="dark-mode"
              label="Quiet hours"
              summary="Reduce noise at night while keeping critical reminders"
              value={notifications.quietHours}
              onValueChange={(value) => updateNotifications({ quietHours: value })}
            />
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
    pillRow: {
      marginTop: 14,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
  });
}
