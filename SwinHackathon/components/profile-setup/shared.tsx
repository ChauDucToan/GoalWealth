import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ProfileSetupShell({
  step,
  totalSteps,
  title,
  body,
  children,
  footer,
  onBack,
}: {
  step: number;
  totalSteps: number;
  title: string;
  body?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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

                router.replace('/(auth)/signUp');
              })
            }
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}> 
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max((step / totalSteps) * 100, 6)}%`, backgroundColor: colors.primaryDark },
              ]}
            />
          </View>
          <View style={[styles.progressBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.progressText, { color: hexToRgba(colors.text, 0.5) }]}>{step}/{totalSteps}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {body ? <Text style={[styles.body, { color: hexToRgba(colors.text, 0.56) }]}>{body}</Text> : null}

        <View style={styles.bodyWrap}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SetupSurface({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return <View style={[styles.surface, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
}

export function SetupPill({
  label,
  icon,
  tone = 'accent',
}: {
  label: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  tone?: 'accent' | 'soft' | 'success' | 'warning';
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const backgroundColor =
    tone === 'success'
      ? hexToRgba(colors.success, 0.12)
      : tone === 'warning'
        ? hexToRgba(colors.warning, 0.14)
        : tone === 'soft'
          ? hexToRgba(colors.text, 0.06)
          : hexToRgba(colors.primaryDark, 0.1);

  const color =
    tone === 'success'
      ? colors.success
      : tone === 'warning'
        ? colors.warning
        : tone === 'soft'
          ? colors.text
          : colors.primaryDark;

  return (
    <View style={[styles.pill, { backgroundColor }]}>
      {icon ? <MaterialIcons name={icon} size={14} color={color} /> : null}
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function SetupSectionTitle({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.sectionHeader}>
      {eyebrow ? <Text style={[styles.sectionEyebrow, { color: colors.primaryDark }]}>{eyebrow}</Text> : null}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {body ? <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.56) }]}>{body}</Text> : null}
    </View>
  );
}

export function SetupCodePreview({
  value,
  length = 4,
  highlight = 0,
}: {
  value: string;
  length?: number;
  highlight?: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.codeRow}>
      {Array.from({ length }).map((_, index) => {
        const digit = value[index] ?? '0';
        const filled = Boolean(value[index]);
        const active = index === highlight && filled;

        return (
          <View
            key={index}
            style={[
              styles.codeCell,
              {
                backgroundColor: colors.card,
                borderColor: active ? colors.primaryDark : filled ? hexToRgba(colors.primaryDark, 0.2) : colors.border,
              },
            ]}
          >
            <Text style={[styles.codeCellText, { color: active ? colors.primaryDark : colors.text }]}>{digit}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function SetupPrimaryButton({
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
        { backgroundColor: disabled ? hexToRgba(colors.primaryDark, 0.24) : colors.primaryDark },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.primaryButtonText, { color: colors.card }]}>{label}</Text>
    </Pressable>
  );
}

export function SetupSecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
      <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressTrack: { flex: 1, height: 8, borderRadius: 999, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 999 },
    progressBadge: {
      minWidth: 44,
      minHeight: 28,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressText: { fontSize: 11, fontWeight: '700' },
    title: { marginTop: 24, fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.6 },
    body: { marginTop: 10, fontSize: Typography.body, lineHeight: 20 },
    bodyWrap: { marginTop: 24, gap: 16 },
    footer: { marginTop: 24, gap: 10 },
    surface: { borderRadius: 26, borderWidth: 1, padding: 18, gap: 14 },
    pill: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 7,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    pillText: { fontSize: 11, fontWeight: '800' },
    sectionHeader: { gap: 4 },
    sectionEyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' },
    sectionTitle: { fontSize: 17, lineHeight: 22, fontWeight: '900' },
    sectionBody: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
    codeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    codeCell: {
      flex: 1,
      minHeight: 70,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    codeCellText: { fontSize: 28, fontWeight: '900' },
    primaryButton: { minHeight: 50, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
    secondaryButton: { minHeight: 50, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    secondaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
