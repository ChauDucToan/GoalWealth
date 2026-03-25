import { hexToRgba } from '@/components/auth/AuthKit';
import { CommunityPrimaryButton, PostSuccessIllustration } from '@/components/community/ui';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunityPostSuccessScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: hexToRgba(colors.text, 0.9) }]} edges={['top', 'bottom']}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: hexToRgba(colors.primaryDark, 0.08),
            borderRadius: scale(30, 0.74),
            paddingHorizontal: scale(22, 0.8),
            paddingVertical: verticalScale(24, 0.76),
          },
        ]}
      >
        <PostSuccessIllustration />
        <Text style={[styles.title, { color: colors.text, fontSize: scaleFont(26, 0.76) }]}>
          Post Successful!
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: hexToRgba(colors.text, 0.56), fontSize: scaleFont(Typography.body, 0.76) },
          ]}
        >
          You have successfully posted your post. Let&apos;s share and see what others think.
        </Text>

        <CommunityPrimaryButton
          title="See Post"
          onPress={() =>
            router.replace({
              pathname: '/community-home',
              params: { stage: 'feed', tab: 'my-posts' },
            })
          }
        />

        <Pressable
          style={styles.shareRow}
          onPress={() => router.replace({ pathname: '/community-home', params: { stage: 'feed' } })}
        >
          <MaterialIcons name="share" size={scale(18, 0.72)} color={colors.primaryDark} />
          <Text style={[styles.shareText, { color: colors.primaryDark, fontSize: scaleFont(13, 0.76) }]}>
            Share
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareText: {
    fontWeight: '800',
  },
});
