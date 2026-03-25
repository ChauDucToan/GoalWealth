import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
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
  scrollable = false,
  contentContainerStyle,
}: {
  step: number;
  totalSteps: number;
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
  onBack?: () => void;
  footer?: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: ViewStyle;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  const content = (
    <>
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

      <View style={[styles.bodyWrap, scrollable ? styles.bodyWrapScroll : undefined]}>{children}</View>

      {footer ? <View style={[styles.footer, scrollable ? styles.footerScroll : undefined]}>{footer}</View> : null}
    </>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentContainerStyle]}>{content}</View>
      )}
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

export function AssessmentSectionCard({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {body ? <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.56) }]}>{body}</Text> : null}
      <View style={styles.sectionContent}>{children}</View>
    </View>
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 28,
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
    bodyWrapScroll: {
      flexGrow: 0,
    },
    footer: {
      marginTop: 'auto',
      paddingTop: 18,
    },
    footerScroll: {
      marginTop: 24,
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
    sectionCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    sectionBody: {
      marginTop: 6,
      fontSize: Typography.body,
      lineHeight: 19,
      fontWeight: '500',
    },
    sectionContent: {
      marginTop: 16,
      gap: 12,
    },
  });
}
