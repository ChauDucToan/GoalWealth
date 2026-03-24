import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AssessmentShell({
  step,
  totalSteps,
  eyebrow,
  title,
  body,
  children,
  onBack,
  footer,
}: {
  step: number;
  totalSteps: number;
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
  onBack?: () => void;
  footer?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={
              onBack ??
              (() => {
                if (router.canGoBack()) {
                  router.back();
                  return;
                }

                router.replace('/(tabs)/home');
              })
            }
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressValue,
                {
                  backgroundColor: colors.primaryDark,
                  width: `${Math.max((step / totalSteps) * 100, 6)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: hexToRgba(colors.text, 0.5) }]}>
            {step}/{totalSteps}
          </Text>
        </View>

        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>{eyebrow}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>{body}</Text>

        <View style={styles.bodyWrap}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}

export function AssessmentPrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      style={[
        styles.primaryButton,
        { backgroundColor: disabled ? hexToRgba(colors.primaryDark, 0.2) : colors.primaryDark },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.primaryButtonText, { color: colors.card }]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: {
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressBar: {
      flex: 1,
      height: 8,
      borderRadius: 999,
      overflow: 'hidden',
    },
    progressValue: {
      height: '100%',
      borderRadius: 999,
    },
    progressText: {
      width: 36,
      textAlign: 'right',
      fontSize: 11,
      fontWeight: '700',
    },
    eyebrow: {
      marginTop: 28,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    title: {
      marginTop: 10,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '900',
      letterSpacing: -0.6,
    },
    body: {
      marginTop: 10,
      fontSize: Typography.body,
      lineHeight: 21,
    },
    bodyWrap: {
      flex: 1,
      marginTop: 24,
    },
    footer: {
      marginTop: 'auto',
      paddingTop: 18,
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
  });
}
