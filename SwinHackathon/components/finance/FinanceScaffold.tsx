import { MotionPressable } from '@/components/MotionPressable';
import { hexToRgba } from '@/components/auth/AuthKit';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React from 'react';
import { Typography } from '@/constants/theme';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function FinanceScreen({
  title,
  subtitle,
  children,
  leftAccessory,
  rightAccessory,
  contentStyle,
  scroll = true,
  onBackPress,
  hideBackButton = false,
  bottomInsetSpacing = 44,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  onBackPress?: () => void;
  hideBackButton?: boolean;
  bottomInsetSpacing?: number;
}) {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const body = (
    <View
      style={[
        styles.content,
        {
          paddingTop: verticalScale(60, 0.76),
          paddingHorizontal: scale(18, 0.78),
        },
        contentStyle,
      ]}
    >
      <View style={styles.headerRow}>
        {leftAccessory ? (
          <View
            style={[
              styles.leftAccessoryWrap,
              {
                width: scale(38, 0.78),
                minHeight: scale(38, 0.78),
              },
            ]}
          >
            {leftAccessory}
          </View>
        ) : hideBackButton ? (
          <View
            style={[
              styles.backButtonSpacer,
              {
                width: scale(38, 0.78),
                height: scale(38, 0.78),
              },
            ]}
          />
        ) : (
          <MotionPressable
            style={[
              styles.backButton,
              {
                backgroundColor: colors.card,
                borderColor: hexToRgba(colors.primaryDark, 0.08),
                width: scale(38, 0.78),
                height: scale(38, 0.78),
                borderRadius: scale(13, 0.72),
              },
            ]}
            onPress={onBackPress ?? (() => router.back())}
            scaleTo={0.96}
            translateYTo={1}
          >
            <MaterialIcons name="arrow-back" size={scale(22, 0.72)} color={colors.text} />
          </MotionPressable>
        )}

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text, fontSize: scaleFont(24, 0.74) }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                {
                  color: hexToRgba(colors.text, 0.56),
                  marginTop: verticalScale(5, 0.6),
                  fontSize: scaleFont(Typography.body, 0.78),
                  lineHeight: verticalScale(21, 0.7),
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.rightAccessory,
            rightAccessory ? { minWidth: scale(38, 0.78) } : styles.rightAccessoryEmpty,
          ]}
        >
          {rightAccessory}
        </View>
      </View>

      {children}
    </View>
  );

  if (!scroll) {
    return <View style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}>{body}</View>;
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(bottomInsetSpacing, insets.bottom + 16) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {body}
    </ScrollView>
  );
}

export function FinanceCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const { scale } = useResponsive();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: scale(22, 0.75),
          padding: scale(16, 0.75),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 44,
  },
  content: {
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  backButton: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftAccessoryWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonSpacer: {},
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: '800',
    flexShrink: 1,
  },
  subtitle: {
    flexShrink: 1,
  },
  rightAccessory: {
    alignItems: 'flex-end',
  },
  rightAccessoryEmpty: {
    minWidth: 0,
  },
  card: {},
});
