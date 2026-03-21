import { hexToRgba } from '@/components/auth/AuthKit';
import { SupportBubble } from '@/components/news/SupportBubble';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/constants/theme';

export default function ArticleDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.backgroundSoft }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.headerIconButton} onPress={() => router.back()}>
            <MaterialIcons name="chevron-left" size={22} color={hexToRgba(colors.text, 0.6)} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Article Detail</Text>
          <Pressable style={styles.headerIconButton} onPress={() => router.push('/news-resources-instructor')}>
            <MaterialIcons name="person-outline" size={18} color={hexToRgba(colors.text, 0.55)} />
          </Pressable>
        </View>
        <Image source={require('../../assets/images/loading-budget-photo.png')} style={styles.hero} />
        <Text style={[styles.title, { color: colors.text }]}>Budgeting Basics: How to Manage Your Money Like a Pro</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.68) }]}>
          Budgeting is the foundation of financial success. With a simple framework you can reduce impulse spending and build savings consistently.
        </Text>
        {['Track all income and expenses', 'Set monthly spending limits', 'Review your plan every weekend'].map((item) => (
          <View key={item} style={styles.row}>
            <MaterialIcons name="check-circle" size={14} color={colors.primaryDark} />
            <Text style={[styles.rowText, { color: hexToRgba(colors.text, 0.74) }]}>{item}</Text>
          </View>
        ))}
        <Pressable style={[styles.cta, { backgroundColor: colors.primaryDark }]}>
          <Text style={[styles.ctaText, { color: colors.card }]}>Go To Unlock Full Article</Text>
        </Pressable>
      </ScrollView>
      <SupportBubble />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 110, gap: 8 },
  headerRow: { marginTop: 2, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerIconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  hero: { width: '100%', height: 180, borderRadius: 12 },
  title: { marginTop: 8, fontSize: 22, lineHeight: 26, fontWeight: '800' },
  body: { fontSize: Typography.body, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowText: { fontSize: 11 },
  cta: { marginTop: 8, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: Typography.body, fontWeight: '700' },
});
