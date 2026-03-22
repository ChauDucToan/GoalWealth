import { hexToRgba } from '@/components/auth/AuthKit';
import { CommunityPrimaryButton } from '@/components/community/ui';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunityDeletePostScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: hexToRgba(colors.text, 0.82) }]} edges={['top', 'bottom']}>
      <Pressable style={styles.scrim} onPress={() => router.back()} />
      <View
        style={[
          styles.modal,
          {
            backgroundColor: colors.card,
            borderColor: hexToRgba(colors.primaryDark, 0.08),
            borderRadius: scale(28, 0.74),
            paddingHorizontal: scale(22, 0.8),
            paddingVertical: verticalScale(24, 0.76),
          },
        ]}
      >
        <View style={[styles.iconShell, { backgroundColor: hexToRgba(colors.error, 0.12) }]}>
          <MaterialIcons name="delete-outline" size={scale(34, 0.72)} color={colors.error} />
        </View>
        <Text style={[styles.title, { color: colors.text, fontSize: scaleFont(24, 0.76) }]}>
          Delete Post?
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: hexToRgba(colors.text, 0.56), fontSize: scaleFont(Typography.body, 0.76) },
          ]}
        >
          Are you sure you want to delete this post? This action cannot be undone.
        </Text>

        <CommunityPrimaryButton
          title="Yes, Delete It"
          onPress={() => router.replace({ pathname: '/(tabs)/news-resources', params: { stage: 'feed' } })}
        />

        <CommunityPrimaryButton title="No, Don&apos;t Delete" subtle onPress={() => router.back()} />
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
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    width: '100%',
    borderWidth: 1,
    alignItems: 'center',
    gap: 14,
  },
  iconShell: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  subtitle: {
    lineHeight: 20,
    textAlign: 'center',
  },
});
