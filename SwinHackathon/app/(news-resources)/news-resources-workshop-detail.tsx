import { hexToRgba } from '@/components/auth/AuthKit';
import { communityNotifications } from '@/components/community/mock-data';
import { CommunityAvatar, CommunityCard, CommunityScreenHeader } from '@/components/community/ui';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const tabs = ['Today', 'Past'] as const;

export default function CommunityNotificationScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Today');

  const visibleNotifications = activeTab === 'Today'
    ? communityNotifications.slice(0, 2)
    : communityNotifications;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.card }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: scale(18, 0.8),
            paddingTop: verticalScale(10, 0.76),
            paddingBottom: verticalScale(40, 0.76),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <CommunityScreenHeader title="Community Notification" onBack={() => router.back()} />

        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: colors.backgroundSoft,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab;

            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: active ? colors.card : 'transparent',
                    borderColor: active ? hexToRgba(colors.primaryDark, 0.12) : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: active ? colors.primaryDark : hexToRgba(colors.text, 0.48),
                      fontSize: scaleFont(13, 0.76),
                    },
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {visibleNotifications.map((notification) => (
          <CommunityCard key={notification.id} style={styles.notificationCard}>
            <Pressable
              onPress={() => {
                if (notification.action === 'comments') {
                  router.push('/news-resources-article-detail');
                  return;
                }
                if (notification.action === 'message') {
                  router.push('/community-chat');
                  return;
                }
                router.push({
                  pathname: '/news-resources-instructor',
                  params: { authorId: notification.author.id },
                });
              }}
              style={styles.notificationRow}
            >
              <CommunityAvatar author={notification.author} size={scale(42, 0.76)} />
              <View style={styles.notificationBody}>
                <Text
                  style={[
                    styles.notificationText,
                    { color: hexToRgba(colors.text, 0.76), fontSize: scaleFont(Typography.body, 0.76) },
                  ]}
                >
                  {notification.body}
                </Text>
                <View style={styles.notificationMetaRow}>
                  <Text
                    style={[
                      styles.notificationTime,
                      { color: hexToRgba(colors.text, 0.42), fontSize: scaleFont(11, 0.76) },
                    ]}
                  >
                    {notification.time}
                  </Text>
                  {notification.unread ? (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primaryDark }]} />
                  ) : null}
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={scale(22, 0.72)} color={hexToRgba(colors.text, 0.28)} />
            </Pressable>
          </CommunityCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    gap: 14,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontWeight: '800',
  },
  notificationCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBody: {
    flex: 1,
    gap: 8,
  },
  notificationText: {
    lineHeight: 20,
    fontWeight: '500',
  },
  notificationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTime: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
