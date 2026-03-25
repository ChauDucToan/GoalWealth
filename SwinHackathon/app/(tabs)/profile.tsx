import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  ProfileSettingsBanner,
  ProfileSettingsCard,
  ProfileSettingsPill,
  ProfileSettingsRow,
  ProfileSettingsSectionTitle,
  ProfileSettingsStat,
  ProfileSettingsSwitchRow,
} from '@/components/profile-settings/ui';
import { premiumPerks } from '@/components/profile-settings/data';
import { Typography } from '@/constants/theme';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useTabBarClearance } from '@/hooks/use-tab-bar-clearance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const quickActionItems = [
  { id: 'account', label: 'Account', icon: 'person-outline', route: '/(profile)/account' },
  { id: 'preferences', label: 'Preferences', icon: 'tune', route: '/(profile)/preferences' },
  { id: 'security', label: 'Security', icon: 'shield', route: '/(profile)/security' },
  { id: 'support', label: 'Support', icon: 'support-agent', route: '/(profile)/support' },
] as const;

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { tabBarFloatingClearance } = useTabBarClearance();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const pushRoute = (route: string) => router.push(route as never);
  const { profile, notifications, security, display, linkedAccounts, invite, updateNotifications } =
    useProfileSettings();

  const enabledNotifications = Object.values(notifications).filter(Boolean).length;
  const activeAccounts = linkedAccounts.filter((item) => item.status === 'Active').length;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(120, tabBarFloatingClearance) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>Profile Settings</Text>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <Pressable style={styles.editButton} onPress={() => router.push('/(profile)/account')}>
            <MaterialIcons name="edit" size={16} color={hexToRgba(colors.text, 0.7)} />
          </Pressable>
        </View>

        <ProfileSettingsCard style={styles.profileCard}>
          <ImageBackground
            source={require('../../assets/images/loading-budget-photo.png')}
            style={styles.cover}
            imageStyle={styles.coverImage}
          >
            <View style={styles.coverOverlay} />
            <View style={styles.profileHead}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile.avatarInitial}</Text>
              </View>
              <View style={styles.userNameWrap}>
                <Text style={styles.userLabel}>{profile.planLabel}</Text>
                <Text style={styles.userName}>{profile.name}</Text>
                <Text style={styles.userMeta}>{profile.city}</Text>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.streakBox}>
            <View style={styles.streakCopy}>
              <ProfileSettingsPill label={profile.planLabel} icon="workspace-premium" tone="warning" />
              <Text style={styles.streakTitle}>{profile.streakLabel}</Text>
              <Text style={styles.streakSubTitle}>
                Strong consistency across goals, subscriptions and reminders.
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <MaterialIcons name="local-fire-department" size={18} color={colors.warning} />
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <ProfileSettingsStat value={`${activeAccounts} active`} label="Linked sources" icon="credit-card" />
            </View>
            <View style={styles.metricItem}>
              <ProfileSettingsStat value={`${enabledNotifications} on`} label="Alert channels" icon="notifications-active" tone="success" />
            </View>
            <View style={styles.metricItem}>
              <ProfileSettingsStat value={`${invite.successfulInvites} sent`} label="Referral invites" icon="group-add" tone="warning" />
            </View>
            <View style={styles.metricItem}>
              <ProfileSettingsStat value={profile.memberSince.replace('Joined ', '')} label="Member since" icon="calendar-month" tone="soft" />
            </View>
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsBanner
          eyebrow="Premium Workspace"
          title="Everything important is now surfaced here"
          body={`You have ${activeAccounts} active connections, ${enabledNotifications} alert channels enabled and ${premiumPerks.length} premium perks ready to use.`}
          icon="verified-user"
          tone="success"
        />

        <Text style={styles.sectionLabel}>Shortcuts</Text>
        <ResponsiveGrid minItemWidth={140} horizontalPadding={20} gap={12} maxColumns={2}>
          {quickActionItems.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => pushRoute(item.route)}
            >
              <View
                style={[
                  styles.actionIconWrap,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
              >
                <MaterialIcons name={item.icon} size={22} color={colors.primaryDark} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{item.label}</Text>
            </Pressable>
          ))}
        </ResponsiveGrid>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Quick controls" />
          <View style={styles.sectionStack}>
            <ProfileSettingsSwitchRow
              icon="notifications-none"
              label="Push notifications"
              summary="Transactions, reminders and activity"
              value={notifications.push}
              onValueChange={(value) => updateNotifications({ push: value })}
            />
            <ProfileSettingsSwitchRow
              icon="volume-up"
              label="Sound alerts"
              summary="Audio feedback for important actions"
              value={notifications.sound}
              onValueChange={(value) => updateNotifications({ sound: value })}
            />
            <ProfileSettingsSwitchRow
              icon="email"
              label="Email summaries"
              summary="Digest and support follow-up"
              value={notifications.email}
              onValueChange={(value) => updateNotifications({ email: value })}
            />
          </View>
        </ProfileSettingsCard>

        <Text style={styles.sectionLabel}>Workspace</Text>
        <ProfileSettingsCard>
          <View style={styles.sectionStack}>
            <ProfileSettingsRow
              icon="person-outline"
              label="Account"
              summary={`${profile.email} • ${profile.phone}`}
              onPress={() => pushRoute('/(profile)/account')}
            />
            <ProfileSettingsRow
              icon="tune"
              label="Preferences"
              summary={`${display.appearance} • ${display.language} • ${display.currency}`}
              onPress={() => pushRoute('/(profile)/preferences')}
            />
            <ProfileSettingsRow
              icon="notifications-active"
              label="Notification Settings"
              summary={`${enabledNotifications} alerts enabled`}
              onPress={() => pushRoute('/(profile)/notifications')}
            />
            <ProfileSettingsRow
              icon="credit-card"
              label="Linked Accounts & Cards"
              summary={`${activeAccounts} active sources`}
              onPress={() => pushRoute('/(profile)/linked-accounts')}
            />
          </View>
        </ProfileSettingsCard>

        <Text style={styles.sectionLabel}>Protection</Text>
        <ProfileSettingsCard>
          <View style={styles.sectionStack}>
            <ProfileSettingsRow
              icon="shield"
              label="Security Settings"
              summary={
                security.biometrics
                  ? 'Biometrics on • Login alerts on'
                  : 'Review passcode, password and trusted devices'
              }
              onPress={() => pushRoute('/(profile)/security')}
            />
            <ProfileSettingsRow
              icon="lock-outline"
              label="Change Password"
              summary="Refresh account credentials"
              onPress={() => pushRoute('/(profile)/password')}
            />
            <ProfileSettingsRow
              icon="pin"
              label="Passcode Protection"
              summary={security.passcodeEnabled ? '4-digit passcode enabled' : 'Set local unlock code'}
              onPress={() => pushRoute('/(profile)/passcode')}
            />
          </View>
        </ProfileSettingsCard>

        <Text style={styles.sectionLabel}>Support & Rewards</Text>
        <ProfileSettingsCard>
          <View style={styles.sectionStack}>
            <ProfileSettingsRow
              icon="support-agent"
              label="Help & Support"
              summary="Feedback, live chat, rating and about"
              onPress={() => pushRoute('/(profile)/support')}
            />
            <ProfileSettingsRow
              icon="group-add"
              label="Invite Friends"
              summary={`${invite.rewardLabel} • code ${invite.referralCode}`}
              onPress={() => pushRoute('/(profile)/support')}
            />
          </View>
        </ProfileSettingsCard>

        <Text style={styles.sectionLabel}>Danger Zone</Text>
        <ProfileSettingsCard>
          <View style={styles.sectionStack}>
            <ProfileSettingsRow
              icon="delete-outline"
              label="Close Account"
              summary="Disable access and start the offboarding flow"
              danger
            />
            <ProfileSettingsRow
              icon="logout"
              label="Sign Out"
              summary="Return to authentication"
              danger
              onPress={() => router.replace('/(auth)/signIn')}
            />
          </View>
        </ProfileSettingsCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.backgroundSoft,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 120,
      gap: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    headerCopy: {
      flex: 1,
      minWidth: 0,
    },
    headerEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primaryDark,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    headerTitle: {
      marginTop: 4,
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
    },
    editButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    profileCard: {
      padding: 0,
      overflow: 'hidden',
    },
    cover: {
      height: 150,
      justifyContent: 'flex-end',
      paddingHorizontal: 18,
      paddingBottom: 18,
    },
    coverImage: {
      resizeMode: 'cover',
    },
    coverOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(12,24,41,0.18)',
    },
    profileHead: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 12,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 26,
      backgroundColor: hexToRgba(colors.card, 0.94),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.card,
    },
    avatarText: {
      fontSize: 30,
      fontWeight: '900',
      color: colors.primaryDark,
    },
    userNameWrap: {
      flex: 1,
      minWidth: 0,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 18,
      backgroundColor: hexToRgba(colors.card, 0.94),
      borderWidth: 1,
      borderColor: hexToRgba(colors.text, 0.08),
    },
    userLabel: {
      fontSize: 11,
      color: hexToRgba(colors.text, 0.48),
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    userName: {
      marginTop: 2,
      fontSize: 18,
      color: colors.text,
      fontWeight: '800',
    },
    userMeta: {
      marginTop: 2,
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.6),
    },
    streakBox: {
      margin: 14,
      marginTop: 14,
      borderRadius: 18,
      backgroundColor: hexToRgba(colors.primaryDark, 0.12),
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: hexToRgba(colors.primaryDark, 0.2),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    streakCopy: {
      flex: 1,
      minWidth: 0,
      gap: 8,
    },
    streakTitle: {
      fontSize: Typography.body,
      fontWeight: '800',
      color: colors.text,
    },
    streakSubTitle: {
      marginTop: 4,
      fontSize: Typography.body,
      lineHeight: 18,
      color: hexToRgba(colors.text, 0.58),
    },
    streakBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(colors.warning, 0.2),
    },
    metricsRow: {
      marginHorizontal: 14,
      marginBottom: 14,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    metricItem: {
      width: '47%',
    },
    actionCard: {
      width: '100%',
      borderRadius: 20,
      padding: 16,
      gap: 12,
    },
    actionIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    sectionLabel: {
      marginTop: 2,
      marginBottom: -4,
      fontSize: 12,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      color: hexToRgba(colors.text, 0.55),
      fontWeight: '700',
    },
    sectionStack: {
      gap: 6,
    },
  });
}
