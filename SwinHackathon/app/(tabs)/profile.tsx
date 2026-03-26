import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  ProfileSettingsCard,
  ProfileSettingsRow,
  ProfileSettingsSectionTitle,
  ProfileSettingsStat,
  ProfileSettingsSwitchRow,
} from '@/components/profile-settings/ui';
import { Typography } from '@/constants/theme';
import { useMyUser } from '@/context/myUserContext';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useTabBarClearance } from '@/hooks/use-tab-bar-clearance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  Alert,
  Image,
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
  const { signOut } = useMyUser();
  const lastNavigationAtRef = useRef(0);
  const pushRoute = useCallback((route: string) => {
    const now = Date.now();

    if (now - lastNavigationAtRef.current < 500) {
      return;
    }

    lastNavigationAtRef.current = now;
    router.push(route as never);
  }, [router]);
  const { profile, notifications, linkedAccounts, invite, updateNotifications, updateProfile } =
    useProfileSettings();

  const enabledNotifications = Object.values(notifications).filter(Boolean).length;
  const activeAccounts = linkedAccounts.filter((item) => item.status === 'Active').length;

  const pickProfileImage = useCallback(async (target: 'avatar' | 'cover') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to update your profile images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: target === 'cover' ? [16, 9] : [1, 1],
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    updateProfile(
      target === 'cover'
        ? { coverUri: result.assets[0].uri }
        : { avatarUri: result.assets[0].uri }
    );
  }, [updateProfile]);

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
        </View>

        <ProfileSettingsCard style={styles.profileCard}>
          <ImageBackground
            source={
              profile.coverUri
                ? { uri: profile.coverUri }
                : require('../../assets/images/loading-budget-photo.png')
            }
            style={styles.cover}
            imageStyle={styles.coverImage}
          >
            <View style={styles.coverOverlay} />
            <Pressable style={styles.coverEditButton} onPress={() => pickProfileImage('cover')}>
              <MaterialIcons name="photo-camera" size={16} color={colors.card} />
              <Text style={styles.coverEditText}>Change cover</Text>
            </Pressable>
            <View style={styles.profileHead}>
              <Pressable style={styles.avatar} onPress={() => pickProfileImage('avatar')}>
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{profile.avatarInitial}</Text>
                )}
              </Pressable>
              <View style={styles.userNameWrap}>
                <Text style={styles.userLabel}>{profile.memberSince}</Text>
                <Text style={styles.userName}>{profile.name}</Text>
                <Text style={styles.userMeta}>{profile.city}</Text>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.streakBox}>
            <View style={styles.streakCopy}>
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
              density="compact"
              summaryNumberOfLines={1}
            />
            <ProfileSettingsSwitchRow
              icon="volume-up"
              label="Sound alerts"
              summary="Audio feedback for important actions"
              value={notifications.sound}
              onValueChange={(value) => updateNotifications({ sound: value })}
              density="compact"
              summaryNumberOfLines={1}
            />
            <ProfileSettingsSwitchRow
              icon="email"
              label="Email summaries"
              summary="Digest and support follow-up"
              value={notifications.email}
              onValueChange={(value) => updateNotifications({ email: value })}
              density="compact"
              summaryNumberOfLines={1}
            />
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard style={styles.listSectionCard}>
          <ProfileSettingsSectionTitle title="Workspace" />
          <View style={styles.listSectionStack}>
            <ProfileSettingsRow
              icon="person-outline"
              label="Account"
              onPress={() => pushRoute('/(profile)/account')}
              density="compact"
            />
            <ProfileSettingsRow
              icon="tune"
              label="Preferences"
              onPress={() => pushRoute('/(profile)/preferences')}
              density="compact"
            />
            <ProfileSettingsRow
              icon="notifications-active"
              label="Notification Settings"
              onPress={() => pushRoute('/(profile)/notifications')}
              density="compact"
            />
            <ProfileSettingsRow
              icon="credit-card"
              label="Linked Accounts & Cards"
              onPress={() => pushRoute('/(profile)/linked-accounts')}
              density="compact"
            />
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard style={styles.listSectionCard}>
          <ProfileSettingsSectionTitle title="Protection" />
          <View style={styles.listSectionStack}>
            <ProfileSettingsRow
              icon="shield"
              label="Security Settings"
              onPress={() => pushRoute('/(profile)/security')}
              density="compact"
            />
            <ProfileSettingsRow
              icon="lock-outline"
              label="Change Password"
              onPress={() => pushRoute('/(profile)/password')}
              density="compact"
            />
            <ProfileSettingsRow
              icon="pin"
              label="Passcode Protection"
              onPress={() => pushRoute('/(profile)/passcode')}
              density="compact"
            />
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard style={styles.listSectionCard}>
          <ProfileSettingsSectionTitle title="Support & Rewards" />
          <View style={styles.listSectionStack}>
            <ProfileSettingsRow
              icon="support-agent"
              label="Help & Support"
              onPress={() => pushRoute('/(profile)/support')}
              density="compact"
            />
            <ProfileSettingsRow
              icon="group-add"
              label="Invite Friends"
              onPress={() => pushRoute('/(profile)/support')}
              density="compact"
            />
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard style={styles.listSectionCard}>
          <ProfileSettingsSectionTitle title="Danger Zone" />
          <View style={styles.listSectionStack}>
            <ProfileSettingsRow
              icon="delete-outline"
              label="Close Account"
              danger
              density="compact"
            />
            <ProfileSettingsRow
              icon="logout"
              label="Sign Out"
              danger
              onPress={() => {
                void signOut().then(() => {
                  router.replace('/(auth)/signIn');
                });
              }}
              density="compact"
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
    profileCard: {
      padding: 0,
      overflow: 'hidden',
    },
    cover: {
      height: 150,
      paddingTop: 14,
      justifyContent: 'space-between',
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
    coverEditButton: {
      alignSelf: 'flex-end',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: hexToRgba(colors.text, 0.34),
      borderWidth: 1,
      borderColor: hexToRgba(colors.card, 0.24),
    },
    coverEditText: {
      color: colors.card,
      fontSize: 12,
      fontWeight: '700',
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
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
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
    listSectionCard: {
      paddingTop: 14,
      paddingBottom: 10,
      paddingHorizontal: 14,
    },
    listSectionStack: {
      gap: 0,
      marginTop: 2,
    },
  });
}
