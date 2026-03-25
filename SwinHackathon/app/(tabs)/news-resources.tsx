import { hexToRgba } from '@/components/auth/AuthKit';
import { CommunityCard } from '@/components/community/ui';
import { articleFeed, workshopFeed } from '@/components/news-resources/content-data';
import { SupportBubble } from '@/components/news/SupportBubble';
import { ColorTheme, Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewsResourcesHubScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont, isCompact } = useResponsive();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const featuredArticle = articleFeed[0];
  const featuredWorkshop = workshopFeed[0];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.backgroundSoft }]} edges={['top']}>
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: scale(18, 0.8),
              paddingTop: verticalScale(14, 0.76),
              paddingBottom: Math.max(insets.bottom + verticalScale(130, 0.76), verticalScale(146, 0.76)),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={[styles.eyebrow, { color: colors.primaryDark, fontSize: scaleFont(12, 0.76) }]}>DISCOVER</Text>
              <Text style={[styles.pageTitle, { color: colors.text, fontSize: scaleFont(28, 0.76) }]}>News & Resources</Text>
              <Text
                style={[
                  styles.pageSubtitle,
                  { color: hexToRgba(colors.text, 0.56), fontSize: scaleFont(Typography.body, 0.76) },
                ]}
              >
                Read faster, join workshops and keep community support one tap away.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push('/community-notifications')}
              style={[
                styles.headerButton,
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

          <CommunityCard style={[styles.featuredCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.featuredEyebrow, { color: colors.primaryDark }]}>Featured article</Text>
            <Text style={[styles.featuredTitle, { color: colors.text }]}>{featuredArticle.title}</Text>
            <Text style={[styles.featuredBody, { color: hexToRgba(colors.text, 0.58) }]}>{featuredArticle.excerpt}</Text>

            <View style={[styles.metaRow, isCompact && styles.metaRowCompact]}>
              {[featuredArticle.category, featuredArticle.author, featuredArticle.minutes].map((item) => (
                <View key={item} style={[styles.metaChip, { backgroundColor: colors.card }]}>
                  <Text style={[styles.metaChipText, { color: colors.text }]}>{item}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
              onPress={() =>
                router.push({ pathname: '/news-resources-article-detail', params: { articleId: featuredArticle.id } })
              }
            >
              <Text style={[styles.primaryButtonText, { color: colors.card }]}>Read Featured Story</Text>
            </Pressable>
          </CommunityCard>

          <View style={[styles.dualColumn, isCompact && styles.dualColumnCompact]}>
            <Pressable
              style={[styles.panelCard, { backgroundColor: colors.card }]}
              onPress={() => router.push('/news-resources-articles')}
            >
              <View style={[styles.panelIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.12) }]}>
                <MaterialIcons name="article" size={scale(20, 0.72)} color={colors.primaryDark} />
              </View>
              <Text style={[styles.panelTitle, { color: colors.text }]}>Articles</Text>
              <Text style={[styles.panelBody, { color: hexToRgba(colors.text, 0.54) }]}>Browse quick reads and practical explainers.</Text>
            </Pressable>

            <Pressable
              style={[styles.panelCard, { backgroundColor: colors.card }]}
              onPress={() => router.push('/news-resources-workshops')}
            >
              <View style={[styles.panelIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.12) }]}>
                <MaterialIcons name="ondemand-video" size={scale(20, 0.72)} color={colors.primaryDark} />
              </View>
              <Text style={[styles.panelTitle, { color: colors.text }]}>Workshops</Text>
              <Text style={[styles.panelBody, { color: hexToRgba(colors.text, 0.54) }]}>Join live sessions and hands-on planning rooms.</Text>
            </Pressable>
          </View>

          <CommunityCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming workshop</Text>
              <Pressable onPress={() => router.push('/news-resources-workshops')}>
                <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>See all</Text>
              </Pressable>
            </View>

            <View style={[styles.workshopRow, { borderColor: colors.border, backgroundColor: colors.backgroundSoft }]}>
              <View style={styles.workshopText}>
                <Text style={[styles.workshopTitle, { color: colors.text }]}>{featuredWorkshop.title}</Text>
                <Text style={[styles.workshopSubtitle, { color: hexToRgba(colors.text, 0.52) }]}>{featuredWorkshop.subtitle}</Text>
                <Text style={[styles.workshopSchedule, { color: colors.primaryDark }]}>{featuredWorkshop.schedule}</Text>
              </View>
              <View style={[styles.workshopBadge, { backgroundColor: colors.card }]}>
                <Text style={[styles.workshopBadgeText, { color: colors.text }]}>{featuredWorkshop.minutes}</Text>
              </View>
            </View>
          </CommunityCard>

          <CommunityCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Finance Community</Text>
              <Pressable onPress={() => router.push('/community-home')}>
                <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open</Text>
              </Pressable>
            </View>
            <Text style={[styles.communityBody, { color: hexToRgba(colors.text, 0.58) }]}>
              Keep community as a separate layer for discussion, posting and peer support instead of mixing it into editorial entry screens.
            </Text>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}
              onPress={() => router.push('/community-home')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Go To Community</Text>
            </Pressable>
          </CommunityCard>
        </ScrollView>

        <SupportBubble />
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    root: { flex: 1 },
    content: { gap: 16 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 14,
    },
    headerText: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    eyebrow: {
      fontWeight: '800',
      letterSpacing: 1,
    },
    pageTitle: {
      fontWeight: '900',
      letterSpacing: -0.6,
    },
    pageSubtitle: {
      lineHeight: 20,
      fontWeight: '500',
      maxWidth: 320,
    },
    headerButton: {
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featuredCard: {
      borderWidth: 0,
      gap: 12,
    },
    featuredEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    featuredTitle: {
      fontSize: 25,
      lineHeight: 31,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    featuredBody: {
      fontSize: Typography.body,
      lineHeight: 20,
      fontWeight: '500',
    },
    metaRow: {
      flexDirection: 'row',
      gap: 8,
    },
    metaRowCompact: {
      flexWrap: 'wrap',
    },
    metaChip: {
      minHeight: 30,
      paddingHorizontal: 12,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metaChipText: {
      fontSize: 12,
      fontWeight: '700',
    },
    primaryButton: {
      marginTop: 4,
      minHeight: 48,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
    dualColumn: {
      flexDirection: 'row',
      gap: 12,
    },
    dualColumnCompact: {
      flexDirection: 'column',
    },
    panelCard: {
      flex: 1,
      minHeight: 170,
      borderRadius: 24,
      padding: 18,
      gap: 12,
    },
    panelIcon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    panelTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
    panelBody: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
    sectionLink: {
      fontSize: 13,
      fontWeight: '700',
    },
    workshopRow: {
      marginTop: 14,
      minHeight: 110,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    workshopText: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    workshopTitle: {
      fontSize: 16,
      fontWeight: '800',
    },
    workshopSubtitle: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
    },
    workshopSchedule: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '800',
    },
    workshopBadge: {
      minWidth: 72,
      minHeight: 40,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    workshopBadgeText: {
      fontSize: 12,
      fontWeight: '800',
    },
    communityBody: {
      marginTop: 12,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },
    secondaryButton: {
      marginTop: 16,
      minHeight: 46,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '700',
    },
  });
}
