import { hexToRgba } from '@/components/auth/AuthKit';
import { SupportBubble } from '@/components/news/SupportBubble';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewsResourcesScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.backgroundSoft }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>News & Resources</Text>

        <View
          style={[
            styles.heroBox,
            {
              backgroundColor: hexToRgba(colors.primaryDark, 0.12),
              borderColor: hexToRgba(colors.primaryDark, 0.24),
            },
          ]}
        >
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Finance Resources, Made Only for You
          </Text>
          <Text style={[styles.heroSub, { color: hexToRgba(colors.text, 0.64) }]}>
            Explore the latest resources from our experts
          </Text>
          <Pressable
            style={[styles.heroButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => router.push('/news-resources-articles')}
          >
            <Text style={[styles.heroButtonText, { color: colors.card }]}>Start Exploring</Text>
            <MaterialIcons name="north-east" size={14} color={colors.card} />
          </Pressable>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionCard, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push('/news-resources-articles')}
          >
            <MaterialIcons name="article" size={18} color={colors.primaryDark} />
            <Text style={[styles.actionText, { color: colors.text }]}>Our Articles</Text>
          </Pressable>
          <Pressable
            style={[styles.actionCard, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push('/news-resources-workshops')}
          >
            <MaterialIcons name="ondemand-video" size={18} color={colors.primaryDark} />
            <Text style={[styles.actionText, { color: colors.text }]}>Our Workshops</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/news-resources-article-detail')} style={styles.coverWrap}>
          <Image source={require('../../assets/images/loading-budget-photo.png')} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
          <Text style={styles.coverText}>Budgeting Basics: How to Manage Your Money Like a Pro</Text>
        </Pressable>
      </ScrollView>
      <SupportBubble />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 110, gap: 10 },
  pageTitle: { fontSize: 30, fontWeight: '900', marginTop: 0, letterSpacing: -0.4 },
  heroBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  heroTitle: { fontSize: 22, lineHeight: 26, fontWeight: '800' },
  heroSub: { marginTop: 6, fontSize: 12, lineHeight: 17 },
  heroButton: {
    marginTop: 12,
    height: 34,
    borderRadius: 17,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  heroButtonText: { fontSize: 11, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionCard: {
    flex: 1,
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionText: { fontSize: 12, fontWeight: '700' },
  coverWrap: { marginTop: 6, height: 140, borderRadius: 14, overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' },
  coverText: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 8,
    color: '#fff',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
});
