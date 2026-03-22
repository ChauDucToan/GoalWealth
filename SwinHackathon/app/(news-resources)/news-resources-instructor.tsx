import { hexToRgba } from '@/components/auth/AuthKit';
import {
  communityPosts,
  communityProfileHighlights,
  communityProfileTabs,
  communityStats,
  getCommunityAuthor,
} from '@/components/community/mock-data';
import {
  CommunityAvatar,
  CommunityCard,
  CommunityPostCard,
  CommunityPrimaryButton,
  CommunityScreenHeader,
} from '@/components/community/ui';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const coverPhoto = require('../../assets/images/loading-budget-photo.png');

export default function CommunityProfileScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont, isCompact } = useResponsive();
  const router = useRouter();
  const params = useLocalSearchParams<{ authorId?: string }>();
  const [activeTab, setActiveTab] = useState<(typeof communityProfileTabs)[number]>('Posts');
  const author = getCommunityAuthor(params.authorId);

  const authorPosts = useMemo(
    () => communityPosts.filter((post) => post.author.id === author.id || post.isMine),
    [author.id]
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.backgroundSoft }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: verticalScale(42, 0.76),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: scale(18, 0.8), paddingTop: verticalScale(10, 0.76) }}>
          <CommunityScreenHeader title={author.name} onBack={() => router.back()} />
        </View>

        <View style={styles.coverWrap}>
          <Image source={coverPhoto} style={[styles.coverImage, { height: verticalScale(190, 0.76) }]} />
          <View style={[styles.coverFade, { backgroundColor: hexToRgba(colors.text, 0.16) }]} />
        </View>

        <View style={[styles.profileBlock, { marginTop: -verticalScale(46, 0.76) }]}>
          <CommunityAvatar author={author} size={scale(82, 0.76)} />
          <Text style={[styles.name, { color: colors.text, fontSize: scaleFont(24, 0.76) }]}>
            {author.name}
          </Text>
          <Text
            style={[
              styles.role,
              { color: hexToRgba(colors.text, 0.5), fontSize: scaleFont(Typography.body, 0.76) },
            ]}
          >
            {author.role}
          </Text>

          <View style={[styles.statsRow, isCompact && styles.statsRowCompact]}>
            {communityStats.map((stat) => (
              <View
                key={stat.id}
                style={[
                  styles.statCard,
                  isCompact && styles.statCardCompact,
                  {
                    backgroundColor: colors.card,
                    borderColor: hexToRgba(colors.primaryDark, 0.08),
                  },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.text, fontSize: scaleFont(18, 0.76) }]}>
                  {stat.value}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: hexToRgba(colors.text, 0.46), fontSize: scaleFont(12, 0.76) },
                  ]}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.actionRow, isCompact && styles.actionRowCompact]}>
            <View style={styles.primaryAction}>
              <CommunityPrimaryButton title="Follow" onPress={() => undefined} />
            </View>
            <View style={styles.secondaryAction}>
              <CommunityPrimaryButton title="Message" subtle onPress={() => router.push('/community-chat')} />
            </View>
          </View>

          <CommunityCard style={styles.highlightCard}>
            {communityProfileHighlights.map((item) => (
              <View key={item} style={styles.highlightRow}>
                <MaterialIcons name="fiber-manual-record" size={scale(8, 0.72)} color={colors.primaryDark} />
                <Text
                  style={[
                    styles.highlightText,
                    { color: hexToRgba(colors.text, 0.72), fontSize: scaleFont(Typography.body, 0.76) },
                  ]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </CommunityCard>

          <View
            style={[
              styles.profileTabBar,
              isCompact && styles.profileTabBarCompact,
              {
                backgroundColor: colors.card,
                borderColor: hexToRgba(colors.primaryDark, 0.08),
              },
            ]}
          >
            {communityProfileTabs.map((tab) => {
              const active = activeTab === tab;

              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.profileTabButton,
                    isCompact && styles.profileTabButtonCompact,
                    {
                      borderBottomColor: active ? colors.primaryDark : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.profileTabText,
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

          {activeTab === 'Posts' ? (
            <View style={styles.postStack}>
              {authorPosts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  onPressComments={(currentPost) =>
                    router.push({
                      pathname: '/news-resources-article-detail',
                      params: { postId: currentPost.id },
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <CommunityCard style={styles.videoCard}>
              <Image source={coverPhoto} style={[styles.videoPreview, { height: verticalScale(180, 0.76) }]} />
              <View style={[styles.videoPlay, { backgroundColor: hexToRgba(colors.card, 0.18) }]}>
                <MaterialIcons name="play-arrow" size={scale(28, 0.72)} color={colors.card} />
              </View>
            </CommunityCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {},
  coverWrap: {
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
  },
  coverFade: {
    ...StyleSheet.absoluteFillObject,
  },
  profileBlock: {
    paddingHorizontal: 18,
    gap: 14,
  },
  name: {
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  role: {
    marginTop: -8,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statsRowCompact: {
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statCardCompact: {
    flexBasis: '48%',
    minWidth: 0,
    flexGrow: 1,
  },
  statValue: {
    fontWeight: '900',
  },
  statLabel: {
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionRowCompact: {
    flexWrap: 'wrap',
  },
  primaryAction: {
    flex: 1,
    minWidth: 0,
    flexBasis: 150,
  },
  secondaryAction: {
    flex: 1,
    minWidth: 0,
    flexBasis: 150,
  },
  highlightCard: {
    gap: 10,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  highlightText: {
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  profileTabBar: {
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  profileTabBarCompact: {
    flexWrap: 'wrap',
    paddingBottom: 4,
  },
  profileTabButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
  },
  profileTabButtonCompact: {
    minWidth: 0,
    flexBasis: '50%',
  },
  profileTabText: {
    fontWeight: '800',
  },
  postStack: {
    gap: 14,
  },
  videoCard: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreview: {
    width: '100%',
    borderRadius: 18,
  },
  videoPlay: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
