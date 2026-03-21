import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type UtilityPreset = {
  id: string;
  keyLabel: string;
  code: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel?: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

const utilityPresets: UtilityPreset[] = [
  {
    id: 'not-found',
    keyLabel: '404',
    code: 'Error Code: 404',
    title: 'Not Found',
    description: 'Unfortunately, this page is not found. Please try again sometime later or refresh.',
    primaryLabel: 'Go Home',
    secondaryLabel: 'Or Contact Support',
    icon: 'find-in-page',
  },
  {
    id: 'server-error',
    keyLabel: '501',
    code: 'Error Code: 501',
    title: 'Server Error',
    description: 'Unfortunately, we encountered an issue with our server. Please try again later.',
    primaryLabel: 'Try Again',
    secondaryLabel: 'Or Contact Support',
    icon: 'dns',
  },
  {
    id: 'no-internet',
    keyLabel: 'Net',
    code: 'Error Code: 100',
    title: 'No Internet!',
    description: 'Unfortunately, we encountered an issue with our server. Please try again or later.',
    primaryLabel: 'Try Again',
    secondaryLabel: 'Or Contact Support',
    icon: 'wifi-off',
  },
  {
    id: 'maintenance',
    keyLabel: 'Mtn',
    code: 'Come back in 2d 11h',
    title: 'Maintenance',
    description: 'Unfortunately, we encountered an issue with our server. Please try again or later.',
    primaryLabel: 'Go Home',
    secondaryLabel: 'Or Contact Support',
    icon: 'construction',
  },
  {
    id: 'not-allowed',
    keyLabel: '555',
    code: 'Error Code: 555',
    title: 'Not Allowed',
    description: 'Unfortunately, we encountered an issue with our server. Please try again or later.',
    primaryLabel: 'Go Home',
    secondaryLabel: 'Or Contact Support',
    icon: 'block',
  },
  {
    id: 'feature-locked',
    keyLabel: 'Pro',
    code: 'Go Pro',
    title: 'Feature Locked',
    description: 'Unfortunately, we encountered an issue with our server. Please try again or later.',
    primaryLabel: 'Go Pro',
    icon: 'lock',
  },
];

export default function InsightsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { issue } = useLocalSearchParams<{ issue?: string }>();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const selectedPreset = useMemo(
    () => utilityPresets.find((item) => item.id === issue) ?? null,
    [issue],
  );

  if (!selectedPreset) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.defaultState}>
          <View style={styles.defaultIconWrap}>
            <MaterialIcons name="insights" size={34} color={colors.primaryDark} />
          </View>
          <Text style={styles.defaultTitle}>Insights</Text>
          <Text style={styles.defaultDescription}>
            Utility screens chi hien khi he thong gap van de. Khi khong co loi, man nay se giu trang thai binh thuong.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Utility & Helper</Text>

        <View style={styles.phoneFrame}>
          <View style={styles.statusBarRow}>
            <Text style={styles.statusBarTime}>9:41</Text>
            <View style={styles.statusBarIcons}>
              <MaterialIcons name="signal-cellular-4-bar" size={12} color={colors.text} />
              <MaterialIcons name="wifi" size={12} color={colors.text} />
              <MaterialIcons name="battery-full" size={12} color={colors.text} />
            </View>
          </View>

          <View style={styles.artWrap}>
            <View style={styles.artCircle}>
              <MaterialIcons name={selectedPreset.icon} size={70} color={hexToRgba(colors.text, 0.8)} />
            </View>
            <MaterialIcons
              name="settings"
              size={22}
              color={hexToRgba(colors.text, 0.18)}
              style={styles.floatLeft}
            />
            <MaterialIcons
              name="blur-circular"
              size={20}
              color={hexToRgba(colors.text, 0.18)}
              style={styles.floatRight}
            />
          </View>

          <View style={styles.badge}>
            <MaterialIcons name="warning-amber" size={14} color={colors.error} />
            <Text style={styles.badgeText}>{selectedPreset.code}</Text>
          </View>

          <Text style={styles.title}>{selectedPreset.title}</Text>
          <Text style={styles.description}>{selectedPreset.description}</Text>

          <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/home')}>
            <MaterialIcons name="home-filled" size={14} color={colors.card} />
            <Text style={styles.primaryButtonText}>{selectedPreset.primaryLabel}</Text>
          </Pressable>

          {selectedPreset.secondaryLabel ? (
            <Pressable>
              <Text style={styles.secondaryAction}>{selectedPreset.secondaryLabel}</Text>
            </Pressable>
          ) : null}

          <View style={styles.homeIndicator} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.backgroundSoft,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 110,
      gap: 16,
      alignItems: 'center',
    },
    defaultState: {
      flex: 1,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
    },
    defaultIconWrap: {
      width: 76,
      height: 76,
      borderRadius: 38,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(colors.primaryDark, 0.12),
    },
    defaultTitle: {
      fontSize: 26,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: -0.4,
    },
    defaultDescription: {
      maxWidth: 320,
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 20,
      color: hexToRgba(colors.text, 0.66),
    },
    heading: {
      width: '100%',
      fontSize: 30,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: -0.5,
      marginTop: 6,
    },
    phoneFrame: {
      width: '100%',
      maxWidth: 360,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 10,
      alignItems: 'center',
    },
    statusBarRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingHorizontal: 2,
    },
    statusBarTime: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    statusBarIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    artWrap: {
      width: '100%',
      height: 250,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    artCircle: {
      width: 190,
      height: 190,
      borderRadius: 95,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    floatLeft: {
      position: 'absolute',
      left: 48,
      top: 70,
    },
    floatRight: {
      position: 'absolute',
      right: 52,
      bottom: 48,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: hexToRgba(colors.error, 0.2),
      backgroundColor: hexToRgba(colors.error, 0.08),
      borderRadius: 12,
      paddingHorizontal: 10,
      height: 24,
    },
    badgeText: {
      color: colors.error,
      fontSize: 11,
      fontWeight: '700',
    },
    title: {
      marginTop: 14,
      fontSize: 40,
      lineHeight: 44,
      fontWeight: '900',
      letterSpacing: -0.8,
      color: colors.text,
    },
    description: {
      marginTop: 10,
      textAlign: 'center',
      color: hexToRgba(colors.text, 0.64),
      fontSize: 14,
      lineHeight: 20,
      width: '90%',
    },
    primaryButton: {
      marginTop: 16,
      width: '100%',
      borderRadius: 20,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      backgroundColor: colors.primaryDark,
    },
    primaryButtonText: {
      color: colors.card,
      fontSize: 14,
      fontWeight: '800',
    },
    secondaryAction: {
      marginTop: 16,
      fontSize: 14,
      fontWeight: '700',
      color: colors.primaryDark,
    },
    homeIndicator: {
      marginTop: 40,
      width: 120,
      height: 4,
      borderRadius: 2,
      backgroundColor: hexToRgba(colors.text, 0.9),
    },
  });
}
