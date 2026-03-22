import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  type?: 'link' | 'external' | 'toggle';
};

type MenuSection = {
  id: string;
  title: string;
  items: MenuItem[];
};

const sections: MenuSection[] = [
  {
    id: 'general',
    title: 'General Settings',
    items: [
      { id: 'account', label: 'Account', icon: 'person-outline' },
      { id: 'appearance', label: 'Display Appearance', icon: 'palette' },
      { id: 'language', label: 'Language', icon: 'language' },
      { id: 'currency', label: 'Currency', icon: 'currency-exchange' },
      { id: 'about', label: 'About Us', icon: 'info-outline' },
    ],
  },
  {
    id: 'notification',
    title: 'Notifications',
    items: [
      { id: 'push', label: 'Push Notification', icon: 'notifications-none', type: 'toggle' },
      { id: 'sound', label: 'Sound Notification', icon: 'volume-up', type: 'toggle' },
      { id: 'email-notification', label: 'Email Notification', icon: 'email', type: 'toggle' },
    ],
  },
  {
    id: 'payments',
    title: 'Payment & Transactions',
    items: [
      { id: 'methods', label: 'Payment Methods', icon: 'payment' },
      { id: 'cards', label: 'Linked Accounts & Cards', icon: 'credit-card' },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    items: [
      { id: 'password', label: 'Change Password', icon: 'lock-outline' },
      { id: 'pin', label: 'Change PIN', icon: 'pin' },
      { id: 'bio', label: 'Biometric Login', icon: 'fingerprint' },
    ],
  },
  {
    id: 'help',
    title: 'Help & Support',
    items: [
      { id: 'chat', label: 'Live Chat', icon: 'chat-bubble-outline' },
      { id: 'report', label: 'Feature Request', icon: 'report-problem', type: 'external' },
      { id: 'help-center', label: 'Help Center', icon: 'support-agent', type: 'external' },
    ],
  },
];

const overviewMetrics = [
  { id: 'accounts', label: 'Accounts', value: '4' },
  { id: 'goals', label: 'Goals', value: '5 active' },
  { id: 'alerts', label: 'Alerts', value: '3 today' },
];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [notificationState, setNotificationState] = useState({
    push: true,
    sound: true,
    'email-notification': false,
  });

  const renderMenuArrow = (type: MenuItem['type']) => {
    if (type === 'toggle') {
      return null;
    }

    if (type === 'external') {
      return <MaterialIcons name="open-in-new" size={16} color={hexToRgba(colors.text, 0.38)} />;
    }

    return <MaterialIcons name="chevron-right" size={20} color={hexToRgba(colors.text, 0.38)} />;
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable style={styles.editButton}>
            <MaterialIcons name="edit" size={16} color={hexToRgba(colors.text, 0.7)} />
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <ImageBackground
            source={require('../../assets/images/loading-budget-photo.png')}
            style={styles.cover}
            imageStyle={styles.coverImage}
          >
            <View style={styles.profileHead}>
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={34} color={hexToRgba(colors.text, 0.72)} />
              </View>
              <View style={styles.userNameWrap}>
                <Text style={styles.userLabel}>Account Holder</Text>
                <Text style={styles.userName}>Jane Doe Watson</Text>
                <Text style={styles.userMeta}>Premium Member</Text>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.streakBox}>
            <View style={styles.streakCopy}>
              <Text style={styles.streakTitle}>Longest Streak: 22</Text>
              <Text style={styles.streakSubTitle}>Keep going, you are on your best run</Text>
            </View>
            <View style={styles.streakBadge}>
              <MaterialIcons name="local-fire-department" size={18} color={colors.warning} />
            </View>
          </View>

          <View style={styles.metricsRow}>
            {overviewMetrics.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.metricCard,
                  index !== overviewMetrics.length - 1 ? styles.metricCardDivider : undefined,
                ]}
              >
                <Text style={styles.metricValue}>{item.value}</Text>
                <Text style={styles.metricLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {sections.map((section) => (
          <View key={section.id}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => {
                const isToggle = item.type === 'toggle';
                const isActive = notificationState[item.id as keyof typeof notificationState];

                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.itemRow,
                      index !== section.items.length - 1 ? styles.rowDivider : undefined,
                    ]}
                  >
                    <View style={styles.itemLeading}>
                      <View style={styles.itemIconWrap}>
                        <MaterialIcons name={item.icon} size={16} color={hexToRgba(colors.text, 0.72)} />
                      </View>
                      <Text style={styles.itemLabel}>{item.label}</Text>
                    </View>
                    {isToggle ? (
                      <Switch
                        value={Boolean(isActive)}
                        onValueChange={(value) =>
                          setNotificationState((prev) => ({
                            ...prev,
                            [item.id]: value,
                          }))
                        }
                        thumbColor={colors.card}
                        trackColor={{ false: colors.border, true: colors.primaryDark }}
                      />
                    ) : (
                      renderMenuArrow(item.type)
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Text style={styles.sectionLabel}>Danger Zone</Text>
        <View style={styles.sectionCard}>
          <Pressable style={[styles.itemRow, styles.rowDivider]}>
            <View style={styles.itemLeading}>
              <View style={[styles.itemIconWrap, styles.dangerIconWrap]}>
                <MaterialIcons name="delete-outline" size={16} color={colors.error} />
              </View>
              <Text style={styles.dangerText}>Close Account</Text>
            </View>
          </Pressable>
          <Pressable style={styles.itemRow} onPress={() => router.replace('/(auth)/signIn')}>
            <View style={styles.itemLeading}>
              <View style={[styles.itemIconWrap, styles.dangerIconWrap]}>
                <MaterialIcons name="logout" size={16} color={colors.error} />
              </View>
              <Text style={styles.dangerText}>Sign Out</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
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
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 6,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
    },
    editButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    profileCard: {
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    cover: {
      height: 134,
      paddingHorizontal: 18,
      paddingVertical: 14,
      justifyContent: 'flex-end',
    },
    coverImage: {
      resizeMode: 'cover',
    },
    profileHead: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: 12,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: hexToRgba(colors.card, 0.92),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.card,
    },
    userNameWrap: {
      flex: 1,
      minWidth: 0,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      backgroundColor: hexToRgba(colors.card, 0.92),
      borderWidth: 1,
      borderColor: hexToRgba(colors.text, 0.08),
    },
    userLabel: {
      fontSize: 12,
      color: hexToRgba(colors.text, 0.48),
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    userName: {
      marginTop: 2,
      fontSize: 16,
      color: colors.text,
      fontWeight: '800',
    },
    userMeta: {
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.6),
      marginTop: 2,
    },
    streakBox: {
      margin: 14,
      marginTop: 14,
      borderRadius: 16,
      backgroundColor: hexToRgba(colors.primaryDark, 0.12),
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: hexToRgba(colors.primaryDark, 0.3),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: 12,
    },
    streakCopy: {
      flex: 1,
      minWidth: 0,
    },
    metricsRow: {
      marginHorizontal: 14,
      marginBottom: 14,
      borderRadius: 16,
      overflow: 'hidden',
      flexDirection: 'row',
      flexWrap: 'wrap',
      backgroundColor: colors.backgroundSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metricCard: {
      flex: 1,
      flexBasis: 100,
      minWidth: 0,
      minHeight: 72,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 12,
    },
    metricCardDivider: {
      borderRightWidth: 1,
      borderRightColor: hexToRgba(colors.text, 0.08),
    },
    metricValue: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    metricLabel: {
      marginTop: 4,
      fontSize: Typography.body,
      fontWeight: '600',
      color: hexToRgba(colors.text, 0.56),
      textAlign: 'center',
    },
    streakTitle: {
      fontSize: Typography.body,
      fontWeight: '700',
      color: colors.text,
    },
    streakSubTitle: {
      marginTop: 2,
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.6),
      flexShrink: 1,
    },
    streakBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(colors.warning, 0.2),
    },
    sectionLabel: {
      marginTop: 2,
      marginBottom: 4,
      fontSize: Typography.body,
      letterSpacing: 0.2,
      textTransform: 'uppercase',
      color: hexToRgba(colors.text, 0.55),
      fontWeight: '700',
    },
    sectionCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    itemRow: {
      minHeight: 58,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: hexToRgba(colors.text, 0.07),
    },
    itemLeading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      minWidth: 0,
    },
    itemIconWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(colors.text, 0.07),
    },
    dangerIconWrap: {
      backgroundColor: hexToRgba(colors.error, 0.14),
    },
    itemLabel: {
      fontSize: Typography.body,
      color: colors.text,
      fontWeight: '500',
      flexShrink: 1,
    },
    dangerText: {
      fontSize: Typography.body,
      color: colors.error,
      fontWeight: '600',
      flexShrink: 1,
    },
  });
}
