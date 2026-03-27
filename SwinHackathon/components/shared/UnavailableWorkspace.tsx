import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { Typography } from '@/constants/theme';
import { useTabBarClearance } from '@/hooks/use-tab-bar-clearance';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from '@/lib/expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function UnavailableWorkspace({
  title,
  body,
  actionLabel = 'Back to Home',
  actionRoute = '/(tabs)/home',
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionRoute?: string;
}) {
  const { colors } = useTheme();
  const { tabBarFloatingClearance } = useTabBarClearance();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(tabBarFloatingClearance, 120) }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
        >
          <View
            style={[
              styles.iconShell,
              { backgroundColor: hexToRgba(colors.warning, 0.12) },
            ]}
          >
            <MaterialIcons name="toggle-off" size={28} color={colors.warning} />
          </View>
          <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>LIVE MODE</Text>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>{body}</Text>
          <ThemeButton
            title={actionLabel}
            onPress={() => router.replace(actionRoute as never)}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 12,
    alignItems: 'flex-start',
  },
  iconShell: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  body: {
    fontSize: Typography.body,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    marginTop: 8,
  },
});
