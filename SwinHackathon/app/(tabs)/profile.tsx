import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
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
                <Text style={styles.userName}>Jane Doe Watson</Text>
                <Text style={styles.userMeta}>Premium Member</Text>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.streakBox}>
            <View>
              <Text style={styles.streakTitle}>Longest Streak: 22</Text>
              <Text style={styles.streakSubTitle}>Keep going, you are on your best run</Text>
            </View>
            <View style={styles.streakBadge}>
              <MaterialIcons name="local-fire-department" size={18} color={colors.warning} />
            </View>
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
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 120,
      gap: 14,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    cover: {
      height: 134,
      paddingHorizontal: 14,
      paddingVertical: 10,
      justifyContent: 'flex-end',
    },
    coverImage: {
      resizeMode: 'cover',
    },
    profileHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
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
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: hexToRgba(colors.card, 0.88),
    },
    userName: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '700',
    },
    userMeta: {
      fontSize: 11,
      color: hexToRgba(colors.text, 0.6),
      marginTop: 2,
    },
    streakBox: {
      margin: 10,
      marginTop: 12,
      borderRadius: 12,
      backgroundColor: hexToRgba(colors.primaryDark, 0.12),
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: hexToRgba(colors.primaryDark, 0.3),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    streakTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    streakSubTitle: {
      marginTop: 2,
      fontSize: 11,
      color: hexToRgba(colors.text, 0.6),
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
      fontSize: 11,
      letterSpacing: 0.2,
      textTransform: 'uppercase',
      color: hexToRgba(colors.text, 0.55),
      fontWeight: '700',
    },
    sectionCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      overflow: 'hidden',
    },
    itemRow: {
      minHeight: 51,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: hexToRgba(colors.text, 0.07),
    },
    itemLeading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
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
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
    },
    dangerText: {
      fontSize: 13,
      color: colors.error,
      fontWeight: '600',
    },
  });
}
