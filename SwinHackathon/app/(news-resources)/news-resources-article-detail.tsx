import { hexToRgba } from '@/components/auth/AuthKit';
import { CommunityCard, CommunityScreenHeader } from '@/components/community/ui';
import { articleFeed } from '@/components/news-resources/content-data';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewsArticleDetailScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const router = useRouter();
  const params = useLocalSearchParams<{ articleId?: string }>();
  const article = articleFeed.find((item) => item.id === params.articleId) ?? articleFeed[0];
  const relatedArticles = articleFeed.filter((item) => item.id !== article.id).slice(0, 2);

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
        <CommunityScreenHeader title="Article Detail" onBack={() => router.back()} />

        <CommunityCard style={[styles.heroCard, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.meta, { color: colors.primaryDark, fontSize: scaleFont(11, 0.76) }]}>
            {article.category} • {article.minutes}
          </Text>
          <Text style={[styles.title, { color: colors.text, fontSize: scaleFont(27, 0.76) }]}>
            {article.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: hexToRgba(colors.text, 0.56), fontSize: scaleFont(Typography.body, 0.76) },
            ]}
          >
            By {article.author} • {article.subtitle}
          </Text>
        </CommunityCard>

        <CommunityCard>
          {article.body.map((paragraph) => (
            <Text
              key={paragraph}
              style={[
                styles.paragraph,
                { color: hexToRgba(colors.text, 0.76), fontSize: scaleFont(Typography.body, 0.76) },
              ]}
            >
              {paragraph}
            </Text>
          ))}
        </CommunityCard>

        <CommunityCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Related reads</Text>
            <Pressable onPress={() => router.replace('/news-resources-articles')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>All articles</Text>
            </Pressable>
          </View>

          <View style={styles.relatedStack}>
            {relatedArticles.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.relatedRow, { borderBottomColor: colors.border }]}
                onPress={() =>
                  router.replace({
                    pathname: '/news-resources-article-detail',
                    params: { articleId: item.id },
                  })
                }
              >
                <View style={styles.relatedText}>
                  <Text style={[styles.relatedMeta, { color: colors.primaryDark }]}>{item.category}</Text>
                  <Text style={[styles.relatedTitle, { color: colors.text }]}>{item.title}</Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={scale(20, 0.72)}
                  color={hexToRgba(colors.text, 0.3)}
                />
              </Pressable>
            ))}
          </View>
        </CommunityCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: 14 },
  heroCard: {
    borderWidth: 0,
    gap: 8,
  },
  meta: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontWeight: '900',
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  subtitle: {
    lineHeight: 20,
    fontWeight: '500',
  },
  paragraph: {
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 14,
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
  relatedStack: {
    marginTop: 14,
  },
  relatedRow: {
    minHeight: 62,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  relatedText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  relatedMeta: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
});
