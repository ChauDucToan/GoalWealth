import { hexToRgba } from '@/components/auth/AuthKit';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Typography } from '@/constants/theme';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export function FinanceScreen({
  title,
  subtitle,
  children,
  rightAccessory,
  contentStyle,
  scroll = true,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightAccessory?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
}) {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const router = useRouter();
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
        <Pressable
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
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={scale(22, 0.72)} color={colors.text} />
        </Pressable>

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

        <View style={[styles.rightAccessory, { minWidth: scale(38, 0.78) }]}>{rightAccessory}</View>
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
      contentContainerStyle={styles.scrollContent}
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
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: '800',
  },
  subtitle: {},
  rightAccessory: {
    alignItems: 'flex-end',
  },
  card: {},
});
