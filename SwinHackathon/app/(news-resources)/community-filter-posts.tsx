import { hexToRgba } from '@/components/auth/AuthKit';
import { CommunityPrimaryButton, CommunityTagChip } from '@/components/community/ui';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const types = ['Poll', 'Story'] as const;
const categories = ['Trending', 'Finance', 'Budgeting', 'Opportunity'] as const;

export default function CommunityFilterPostsScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const router = useRouter();
  const [type, setType] = useState<(typeof types)[number]>('Poll');
  const [category, setCategory] = useState<(typeof categories)[number]>('Trending');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: hexToRgba(colors.text, 0.34) }]} edges={['top', 'bottom']}>
      <Pressable style={styles.scrim} onPress={() => router.back()} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            borderColor: hexToRgba(colors.primaryDark, 0.08),
            borderTopLeftRadius: scale(30, 0.74),
            borderTopRightRadius: scale(30, 0.74),
            paddingHorizontal: scale(20, 0.8),
            paddingTop: verticalScale(18, 0.76),
            paddingBottom: verticalScale(24, 0.76),
          },
        ]}
      >
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.text, fontSize: scaleFont(20, 0.76) }]}>
            Filter Posts
          </Text>
          <Pressable onPress={() => router.back()}>
            <MaterialIcons name="close" size={scale(20, 0.72)} color={hexToRgba(colors.text, 0.48)} />
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.46), fontSize: scaleFont(12, 0.76) }]}>
            Post Date
          </Text>
          <View
            style={[
              styles.field,
              { backgroundColor: colors.backgroundSoft, borderColor: hexToRgba(colors.primaryDark, 0.08) },
            ]}
          >
            <Text style={[styles.fieldValue, { color: colors.text, fontSize: scaleFont(Typography.body, 0.76) }]}>
              02 / 03 / 2025
            </Text>
            <MaterialIcons name="calendar-month" size={scale(18, 0.72)} color={colors.primaryDark} />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.46), fontSize: scaleFont(12, 0.76) }]}>
            Post Type
          </Text>
          <View style={styles.optionRow}>
            {types.map((item) => (
              <CommunityTagChip
                key={item}
                label={item}
                active={type === item}
                onPress={() => setType(item)}
              />
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.46), fontSize: scaleFont(12, 0.76) }]}>
            Post Category
          </Text>
          <View style={styles.optionRow}>
            {categories.map((item) => (
              <CommunityTagChip
                key={item}
                label={item}
                active={category === item}
                onPress={() => setCategory(item)}
              />
            ))}
          </View>
        </View>

        <CommunityPrimaryButton title="Filter Posts (15)" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopWidth: 1,
    gap: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  fieldGroup: {
    gap: 10,
  },
  fieldLabel: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  field: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldValue: {
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
