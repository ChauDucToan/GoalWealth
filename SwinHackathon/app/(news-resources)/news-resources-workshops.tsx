import { hexToRgba } from '@/components/auth/AuthKit';
import { CommunityCard, CommunityScreenHeader } from '@/components/community/ui';
import { workshopFeed } from '@/components/news-resources/content-data';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewsWorkshopsScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const router = useRouter();

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
        <CommunityScreenHeader title="Workshops" onBack={() => router.back()} />

        <CommunityCard>
          <Text style={[styles.heroTitle, { color: colors.text, fontSize: scaleFont(24, 0.76) }]}>Live rooms to review your money plan with structure</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56), fontSize: scaleFont(Typography.body, 0.76) }]}>Smaller groups, clear topics and practical sessions instead of passive content alone.</Text>
        </CommunityCard>

        {workshopFeed.map((workshop) => (
          <Pressable
            key={workshop.id}
            style={[styles.workshopCard, { backgroundColor: colors.card }]}
            onPress={() =>
              router.push({ pathname: '/news-resources-workshop-detail', params: { workshopId: workshop.id } })
            }
          >
            <View style={[styles.workshopTop, { borderBottomColor: colors.border }]}> 
              <View style={[styles.workshopBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.12) }]}> 
                <MaterialIcons name="play-circle-outline" size={scale(22, 0.72)} color={colors.primaryDark} />
              </View>
              <View style={styles.workshopHead}>
                <Text style={[styles.workshopMeta, { color: colors.primaryDark, fontSize: scaleFont(11, 0.76) }]}>
                  {workshop.category} • {workshop.minutes}
                </Text>
                <Text style={[styles.workshopTitle, { color: colors.text, fontSize: scaleFont(17, 0.76) }]}>{workshop.title}</Text>
                <Text style={[styles.workshopSubtitle, { color: hexToRgba(colors.text, 0.54), fontSize: scaleFont(13, 0.76) }]}>{workshop.subtitle}</Text>
              </View>
            </View>

            <View style={styles.workshopFooter}>
              <View>
                <Text style={[styles.footerLabel, { color: hexToRgba(colors.text, 0.42), fontSize: scaleFont(11, 0.76) }]}>Instructor</Text>
                <Text style={[styles.footerValue, { color: colors.text, fontSize: scaleFont(13, 0.76) }]}>{workshop.instructor}</Text>
              </View>
              <View>
                <Text style={[styles.footerLabel, { color: hexToRgba(colors.text, 0.42), fontSize: scaleFont(11, 0.76) }]}>Schedule</Text>
                <Text style={[styles.footerValue, { color: colors.primaryDark, fontSize: scaleFont(13, 0.76) }]}>{workshop.schedule}</Text>
              </View>
            </View>
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
  workshopCard: {
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  workshopTop: {
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  workshopBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workshopHead: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  workshopMeta: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  workshopTitle: {
    fontWeight: '800',
    lineHeight: 22,
  },
  workshopSubtitle: {
    lineHeight: 19,
    fontWeight: '500',
  },
  workshopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerLabel: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerValue: {
    marginTop: 4,
    fontWeight: '700',
  },
});
