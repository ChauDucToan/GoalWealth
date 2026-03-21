import { hexToRgba } from '@/components/auth/AuthKit';
import { SupportBubble } from '@/components/news/SupportBubble';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentFeed } from './_data';

export default function NewsWorkshopsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.backgroundSoft }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.headerIconButton} onPress={() => router.back()}>
            <MaterialIcons name="chevron-left" size={22} color={hexToRgba(colors.text, 0.6)} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Our Workshops</Text>
          <Pressable style={styles.headerIconButton} onPress={() => router.push('/news-resources-instructor')}>
            <MaterialIcons name="person-outline" size={18} color={hexToRgba(colors.text, 0.55)} />
          </Pressable>
        </View>

        <View style={[styles.searchBar, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <MaterialIcons name="search" size={14} color={hexToRgba(colors.text, 0.5)} />
          <TextInput
            placeholder="Search for a workshop..."
            placeholderTextColor={hexToRgba(colors.text, 0.45)}
            style={[styles.searchInput, { color: colors.text }]}
          />
          <MaterialIcons name="tune" size={14} color={hexToRgba(colors.text, 0.5)} />
        </View>

        {contentFeed.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.feedRow, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push('/news-resources-workshop-detail')}
          >
            <Image source={require('../../assets/images/loading-budget-photo.png')} style={styles.thumb} />
            <View style={styles.body}>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.meta, { color: hexToRgba(colors.text, 0.56) }]}>
                Workshop • {item.minutes}
              </Text>
            </View>
            <MaterialIcons name="play-circle-outline" size={22} color={colors.primaryDark} />
          </Pressable>
        ))}
      </ScrollView>
      <SupportBubble />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 110, gap: 8 },
  headerRow: {
    marginTop: 2,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  searchBar: {
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  searchInput: { flex: 1, fontSize: 12, paddingVertical: 0 },
  feedRow: {
    marginTop: 2,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thumb: { width: 76, height: 54, borderRadius: 8 },
  body: { flex: 1 },
  title: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  meta: { marginTop: 3, fontSize: 10 },
});
