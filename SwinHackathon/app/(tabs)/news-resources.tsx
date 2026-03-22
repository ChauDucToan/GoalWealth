import { hexToRgba } from '@/components/auth/AuthKit';
import {
  communityAuthors,
  communityFeedTags,
  communityIntroPoints,
  communityPosts,
  communityRules,
  type CommunityPost,
} from '@/components/community/mock-data';
import {
  CommunityAvatar,
  CommunityCard,
  CommunityLandingIllustration,
  CommunityPostCard,
  CommunityPrimaryButton,
  CommunityRulesIllustration,
  CommunityTagChip,
} from '@/components/community/ui';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const feedTabs = ['Feed', 'My Posts'] as const;

function getFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function FinanceCommunityScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont, isCompact } = useResponsive();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ stage?: string | string[]; tab?: string | string[] }>();
  const stage = getFirstParam(params.stage) ?? 'landing';
  const tabParam = getFirstParam(params.tab);
  const [activeTab, setActiveTab] = useState<(typeof feedTabs)[number]>(
    tabParam === 'my-posts' ? 'My Posts' : 'Feed'
  );
  const [selectedTag, setSelectedTag] = useState('trending');

  useEffect(() => {
    setActiveTab(tabParam === 'my-posts' ? 'My Posts' : 'Feed');
  }, [tabParam]);

  const visiblePosts = useMemo(() => {
    const tabPosts =
      activeTab === 'My Posts' ? communityPosts.filter((post) => post.isMine) : communityPosts;

    if (selectedTag === 'trending') {
      return tabPosts;
    }

    return tabPosts.filter((post) =>
      [post.category.toLowerCase(), ...post.tags.map((tag) => tag.replace('#', ''))].some((entry) =>
        entry.includes(selectedTag)
      )
    );
  }, [activeTab, selectedTag]);

  const setStage = (nextStage: 'landing' | 'rules' | 'feed', nextTab?: 'feed' | 'my-posts') => {
    const paramsObject =
      nextStage === 'landing'
        ? {}
        : nextStage === 'feed' && nextTab
          ? { stage: nextStage, tab: nextTab }
          : { stage: nextStage };

    router.replace({
      pathname: '/(tabs)/news-resources',
      params: paramsObject,
    });
  };

  const openComments = (post: CommunityPost) => {
    router.push({
      pathname: '/news-resources-article-detail',
      params: { postId: post.id },
    });
  };

  if (stage === 'rules') {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.card }]} edges={['top']}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: scale(20, 0.8),
              paddingTop: verticalScale(10, 0.76),
              paddingBottom: verticalScale(132, 0.76),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.rulesHeaderRow}>
            <View style={styles.rulesHeaderSpacer} />
            <Text style={[styles.rulesHeaderTitle, { color: colors.text, fontSize: scaleFont(20, 0.76) }]}>
              Before you post...
            </Text>
            <Pressable
              onPress={() => setStage('landing')}
              style={[
                styles.iconButton,
                {
                  width: scale(42, 0.76),
                  height: scale(42, 0.76),
                  borderRadius: scale(21, 0.72),
                  backgroundColor: colors.backgroundSoft,
                  borderColor: colors.border,
                },
              ]}
            >
              <MaterialIcons name="close" size={scale(18, 0.72)} color={colors.text} />
            </Pressable>
          </View>

          <CommunityRulesIllustration />

          <Text style={[styles.title, { color: colors.text, fontSize: scaleFont(29, 0.76) }]}>
            Before you post...
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: hexToRgba(colors.text, 0.58),
                fontSize: scaleFont(Typography.body, 0.76),
              },
            ]}
          >
            Please read our terms and conditions and remember the community rules before posting.
          </Text>

          <View style={styles.ruleStack}>
            {communityRules.map((rule) => {
              const tone = rule.status === 'warn' ? colors.warning : colors.error;

              return (
                <View key={rule.id} style={[styles.ruleRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.ruleLabel, { color: colors.text, fontSize: scaleFont(15, 0.76) }]}>
                    {rule.title}
                  </Text>
                  <View
                    style={[
                      styles.ruleDot,
                      { backgroundColor: hexToRgba(tone, 0.12), borderColor: hexToRgba(tone, 0.2) },
                    ]}
                  >
                    <MaterialIcons
                      name={rule.status === 'warn' ? 'priority-high' : 'close'}
                      size={scale(14, 0.72)}
                      color={tone}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <CommunityPrimaryButton
            title="Understood, let's post"
            onPress={() => setStage('feed')}
          />

          <View style={styles.legalRow}>
            {['Terms & Condition', 'Privacy Policy'].map((item) => (
              <Text
                key={item}
                style={[
                  styles.legalText,
                  { color: colors.primaryDark, fontSize: scaleFont(12, 0.76) },
                ]}
              >
                {item}
              </Text>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (stage === 'feed') {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.backgroundSoft }]} edges={['top']}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: scale(18, 0.8),
              paddingTop: verticalScale(12, 0.76),
              paddingBottom: verticalScale(156, 0.76),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.headerRow, isCompact && styles.headerRowCompact]}>
            <CommunityAvatar author={communityAuthors.melissa} size={scale(36, 0.76)} />
            <View style={styles.headerBody}>
              <Text style={[styles.feedTitle, { color: colors.text, fontSize: scaleFont(24, 0.76) }]}>
                Community
              </Text>
              <Text
                style={[
                  styles.feedSubtitle,
                  { color: hexToRgba(colors.text, 0.56), fontSize: scaleFont(12, 0.76) },
                ]}
              >
                Explore finance-related posts from people.
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/news-resources-workshop-detail')}
              style={[
                styles.iconButton,
                {
                  width: scale(42, 0.76),
                  height: scale(42, 0.76),
                  borderRadius: scale(21, 0.72),
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <MaterialIcons name="notifications-none" size={scale(22, 0.72)} color={colors.text} />
            </Pressable>
          </View>

          <CommunityCard style={styles.tabCard}>
            <View
              style={[
                styles.tabBar,
                {
                  backgroundColor: colors.backgroundSoft,
                  borderColor: hexToRgba(colors.primaryDark, 0.08),
                },
              ]}
            >
              {feedTabs.map((tab) => {
                const active = activeTab === tab;

                return (
                  <Pressable
                    key={tab}
                    onPress={() => {
                      setActiveTab(tab);
                      router.setParams?.({ tab: tab === 'My Posts' ? 'my-posts' : 'feed', stage: 'feed' } as never);
                    }}
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
                        styles.tabLabel,
                        {
                          color: active ? colors.primaryDark : hexToRgba(colors.text, 0.5),
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

            <View style={[styles.feedMetaRow, isCompact && styles.feedMetaRowCompact]}>
              <Text
                style={[
                  styles.feedMetaText,
                  isCompact && styles.feedMetaTextCompact,
                  { color: hexToRgba(colors.text, 0.46), fontSize: scaleFont(11, 0.76) },
                ]}
              >
                18 trending posts
              </Text>
              <Pressable
                onPress={() => router.push('/community-filter-posts')}
                style={[
                  styles.filterButton,
                  isCompact && styles.filterButtonCompact,
                  { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
                ]}
              >
                <MaterialIcons name="tune" size={scale(16, 0.72)} color={colors.primaryDark} />
                <Text
                  style={[
                    styles.filterText,
                    { color: colors.primaryDark, fontSize: scaleFont(12, 0.76) },
                  ]}
                >
                  Filter
                </Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagScroll}
            >
              {communityFeedTags.map((tag) => (
                <CommunityTagChip
                  key={tag.id}
                  label={tag.label}
                  active={selectedTag === tag.id}
                  onPress={() => setSelectedTag(tag.id)}
                />
              ))}
            </ScrollView>
          </CommunityCard>

          {visiblePosts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              onPressAuthor={(author) =>
                router.push({
                  pathname: '/news-resources-instructor',
                  params: { authorId: author.id },
                })
              }
              onPressComments={openComments}
              onPressDelete={(currentPost) =>
                router.push({
                  pathname: '/community-delete-post',
                  params: { postId: currentPost.id },
                })
              }
            />
          ))}

          {activeTab === 'My Posts' ? (
            <Pressable
              style={[
                styles.loadMore,
                {
                  backgroundColor: colors.card,
                  borderColor: hexToRgba(colors.primaryDark, 0.08),
                },
              ]}
            >
              <MaterialIcons name="expand-more" size={scale(18, 0.72)} color={colors.primaryDark} />
              <Text
                style={[
                  styles.loadMoreText,
                  { color: colors.primaryDark, fontSize: scaleFont(12, 0.76) },
                ]}
              >
                Load More
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>

        <View
          pointerEvents="box-none"
          style={[
            styles.bottomActionWrap,
            {
              bottom: Math.max(insets.bottom, verticalScale(8, 0.76)) + verticalScale(72, 0.72),
              paddingHorizontal: scale(20, 0.8),
            },
          ]}
        >
          <CommunityPrimaryButton
            title="Add New Post"
            onPress={() => router.push('/news-resources-workshops')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.backgroundSoft }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: scale(20, 0.8),
            paddingTop: verticalScale(16, 0.76),
            paddingBottom: verticalScale(132, 0.76),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <Text style={[styles.eyebrow, { color: colors.primaryDark, fontSize: scaleFont(13, 0.76) }]}>
            FINPAL SOCIAL
          </Text>
          <Text style={[styles.title, { color: colors.text, fontSize: scaleFont(31, 0.76) }]}>
            finpal Finance Community
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: hexToRgba(colors.text, 0.62),
                fontSize: scaleFont(Typography.body, 0.76),
              },
            ]}
          >
            Let&apos;s join a community where everyone is learning to spend smarter, save consistently
            and grow together.
          </Text>
        </View>

        <CommunityCard style={styles.illustrationCard}>
          <CommunityLandingIllustration />
        </CommunityCard>

        <CommunityCard style={styles.infoCard}>
          {communityIntroPoints.map((point) => (
            <View key={point} style={styles.pointRow}>
              <View style={[styles.pointIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.12) }]}>
                <MaterialIcons name="check" size={scale(16, 0.72)} color={colors.primaryDark} />
              </View>
              <Text
                style={[
                  styles.pointText,
                  { color: hexToRgba(colors.text, 0.74), fontSize: scaleFont(Typography.body, 0.76) },
                ]}
              >
                {point}
              </Text>
            </View>
          ))}

          <View style={[styles.statRow, isCompact && styles.statRowCompact]}>
            {[
              ['25k+', 'active members'],
              ['4.9', 'community rating'],
              ['120+', 'daily stories'],
            ].map(([value, label]) => (
              <View
                key={label}
                style={[
                  styles.statCard,
                  isCompact && styles.statCardCompact,
                  {
                    backgroundColor: colors.backgroundSoft,
                    borderColor: hexToRgba(colors.primaryDark, 0.06),
                  },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.text, fontSize: scaleFont(18, 0.76) }]}>
                  {value}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: hexToRgba(colors.text, 0.48), fontSize: scaleFont(12, 0.76) },
                  ]}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </CommunityCard>

        <CommunityPrimaryButton title="Explore Community" onPress={() => setStage('rules')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    gap: 16,
  },
  heroWrap: {
    alignItems: 'center',
    gap: 8,
  },
  eyebrow: {
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  title: {
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 320,
  },
  illustrationCard: {
    paddingVertical: 22,
  },
  infoCard: {
    gap: 14,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pointIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: {
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statRowCompact: {
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minHeight: 74,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
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
    textAlign: 'center',
  },
  rulesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  rulesHeaderSpacer: {
    width: 42,
  },
  rulesHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  iconButton: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleStack: {
    gap: 2,
  },
  ruleRow: {
    minHeight: 60,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    gap: 12,
  },
  ruleLabel: {
    fontWeight: '600',
    flex: 1,
    minWidth: 0,
  },
  ruleDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 18,
  },
  legalText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRowCompact: {
    alignItems: 'flex-start',
  },
  headerBody: {
    flex: 1,
    minWidth: 0,
  },
  feedTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  feedSubtitle: {
    marginTop: 2,
    fontWeight: '500',
  },
  tabCard: {
    gap: 12,
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
  tabLabel: {
    fontWeight: '800',
  },
  feedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  feedMetaRowCompact: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  feedMetaText: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  feedMetaTextCompact: {
    flexBasis: '100%',
  },
  filterButton: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterButtonCompact: {
    alignSelf: 'flex-start',
  },
  filterText: {
    fontWeight: '800',
  },
  tagScroll: {
    gap: 8,
  },
  loadMore: {
    alignSelf: 'center',
    minHeight: 38,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadMoreText: {
    fontWeight: '800',
  },
  bottomActionWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
