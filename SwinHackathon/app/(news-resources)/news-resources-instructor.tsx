import { hexToRgba } from '@/components/auth/AuthKit';
import { SupportBubble } from '@/components/news/SupportBubble';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InstructorScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.backgroundSoft }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.headerIconButton} onPress={() => router.back()}>
            <MaterialIcons name="chevron-left" size={22} color={hexToRgba(colors.text, 0.6)} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Instructor</Text>
          <View style={styles.headerIconButton} />
        </View>

        <Image source={require('../../assets/images/loading-budget-photo.png')} style={styles.avatar} />
        <Text style={[styles.name, { color: colors.text }]}>Prof. John Matthews</Text>
        <Text style={[styles.role, { color: hexToRgba(colors.text, 0.58) }]}>Certified Instructor</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>2,458</Text>
            <Text style={[styles.statLabel, { color: hexToRgba(colors.text, 0.52) }]}>Students</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>4.2</Text>
            <Text style={[styles.statLabel, { color: hexToRgba(colors.text, 0.52) }]}>Rating</Text>
          </View>
        </View>

        <Text style={[styles.bio, { color: hexToRgba(colors.text, 0.66) }]}>
          A trusted educator and mentor with 12+ years of experience helping learners build strong money habits.
        </Text>
      </ScrollView>
      <SupportBubble />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 110, gap: 8, alignItems: 'center' },
  headerRow: {
    marginTop: 2,
    height: 40,
    width: '100%',
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
  avatar: { width: 110, height: 110, borderRadius: 55, marginTop: 8 },
  name: { marginTop: 4, fontSize: 18, fontWeight: '800' },
  role: { fontSize: 11 },
  statsRow: { marginTop: 8, flexDirection: 'row', gap: 8 },
  statCard: {
    minWidth: 100,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { marginTop: 2, fontSize: 10 },
  bio: { marginTop: 6, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
