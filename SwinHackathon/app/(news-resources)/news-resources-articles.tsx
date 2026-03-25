import { hexToRgba } from '@/components/auth/AuthKit';
import { CommunityCard, CommunityScreenHeader, CommunityTagChip } from '@/components/community/ui';
import { articleFeed } from '@/components/news-resources/content-data';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const articleFilters = ['All', 'Budgeting', 'Investing', 'Loans'] as const;

export default function NewsArticlesScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<(typeof articleFilters)[number]>('All');

  const visibleArticles = useMemo(() => {
    if (activeFilter === 'All') {
      return articleFeed;
    }
    return articleFeed.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.backgroundSoft }]} edges={['top']}>
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
        <CommunityScreenHeader title="Articles" onBack={() => router.back()} />

        <CommunityCard>
          <Text style={[styles.heroTitle, { color: colors.text, fontSize: scaleFont(24, 0.76) }]}>Practical reads for better money decisions</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56), fontSize: scaleFont(Typography.body, 0.76) }]}>Short explainers, clearer thinking and less noise than scrolling random finance takes.</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {articleFilters.map((filter) => (
              <CommunityTagChip
                key={filter}
                label={filter}
                active={activeFilter === filter}
                onPress={() => setActiveFilter(filter)}
              />
            ))}
          </ScrollView>
        </CommunityCard>

        {visibleArticles.map((article) => (
          <Pressable
            key={article.id}
            style={[styles.articleCard, { backgroundColor: colors.card }]}
            onPress={() =>
              router.push({ pathname: '/news-resources-article-detail', params: { articleId: article.id } })
            }
          >
            <View style={[styles.articleBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.12) }]}> 
              <MaterialIcons name="article" size={scale(18, 0.72)} color={colors.primaryDark} />
            </View>
            <View style={styles.articleBody}>
              <Text style={[styles.articleMeta, { color: colors.primaryDark, fontSize: scaleFont(11, 0.76) }]}>
                {article.category} • {article.minutes}
              </Text>
              <Text style={[styles.articleTitle, { color: colors.text, fontSize: scaleFont(17, 0.76) }]}>{article.title}</Text>
              <Text style={[styles.articleSubtitle, { color: hexToRgba(colors.text, 0.54), fontSize: scaleFont(13, 0.76) }]}>{article.excerpt}</Text>
              <Text style={[styles.articleAuthor, { color: hexToRgba(colors.text, 0.44), fontSize: scaleFont(12, 0.76) }]}>
                {article.author}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={scale(20, 0.72)} color={hexToRgba(colors.text, 0.3)} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: 14 },
  heroTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroBody: {
    marginTop: 6,
    lineHeight: 20,
    fontWeight: '500',
  },
  filterRow: {
    marginTop: 14,
    gap: 8,
  },
  articleCard: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  articleBadge: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  articleMeta: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontWeight: '800',
    lineHeight: 22,
  },
  articleSubtitle: {
    lineHeight: 19,
    fontWeight: '500',
  },
  articleAuthor: {
    marginTop: 2,
    fontWeight: '700',
  },
});
