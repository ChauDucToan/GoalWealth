import { ThemeButton } from '@/components/ThemeButton';
import { FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ProfileSettingsCard } from '@/components/profile-settings/ui';
import { hexToRgba } from '@/components/auth/AuthKit';
import { useDebouncedPress } from '@/hooks/use-debounced-press';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const resultContent = {
  profile: {
    title: 'Profile updated',
    body: 'Your account details are now refreshed across the profile workspace.',
    icon: 'check-circle',
  },
  export: {
    title: 'Export requested',
    body: 'We queued your data export. You can return to the account screen and check the latest status there.',
    icon: 'file-download-done',
  },
  password: {
    title: 'Password changed',
    body: 'Your password has been updated and future sign-ins will use the new credential.',
    icon: 'task-alt',
  },
  passcode: {
    title: 'Passcode updated',
    body: 'A fresh 4-digit passcode now protects the app on this device.',
    icon: 'pin',
  },
  feedback: {
    title: 'Feedback sent',
    body: 'Thanks for taking the time to share it. The team can review it from the support queue.',
    icon: 'send',
  },
  invite: {
    title: 'Invite prepared',
    body: 'Your referral flow is ready to share with a friend from messaging or email.',
    icon: 'group-add',
  },
} as const;

export default function ProfileResultScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: keyof typeof resultContent }>();
  const content = resultContent[mode ?? 'profile'] ?? resultContent.profile;
  const { handlePress: handleProfileSettingsPress, isCoolingDown: isProfileSettingsCoolingDown } =
    useDebouncedPress(() => {
      router.replace('/(tabs)/profile');
    }, 500);
  const { handlePress: handleBackPress, isCoolingDown: isBackCoolingDown } =
    useDebouncedPress(() => {
      router.back();
    }, 500);

  return (
    <FinanceScreen
      title={content.title}
      subtitle="A shared result state keeps profile flows shorter and more consistent."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <ProfileSettingsCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.success, 0.1),
              borderColor: hexToRgba(colors.success, 0.16),
            },
          ]}
        >
          <View style={[styles.iconBadge, { backgroundColor: colors.card }]}>
            <MaterialIcons name={content.icon} size={30} color={colors.success} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{content.title}</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.58) }]}>
            {content.body}
          </Text>
        </ProfileSettingsCard>

        <View style={styles.actionRow}>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title="Profile Settings"
              onPress={handleProfileSettingsPress}
              colorBackground={colors.primaryDark}
              colorText={colors.card}
              style={styles.fullButton}
              disabled={isProfileSettingsCoolingDown}
            />
          </View>
          <View style={styles.actionButtonWrap}>
            <ThemeButton
              title="Back"
              onPress={handleBackPress}
              colorBackground={colors.card}
              colorText={colors.text}
              style={[styles.fullButton, { borderWidth: 1, borderColor: colors.border }]}
              disabled={isBackCoolingDown}
            />
          </View>
        </View>
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
      alignItems: 'center',
    },
    iconBadge: {
      width: 76,
      height: 76,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTitle: {
      marginTop: 16,
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.6,
      textAlign: 'center',
    },
    heroBody: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    actionRow: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButtonWrap: {
      flex: 1,
    },
    fullButton: {
      width: '100%',
    },
  });
}
