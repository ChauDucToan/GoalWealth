import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
          <Text style={[styles.progressText, { color: hexToRgba(colors.text, 0.5) }]}>{step}/{totalSteps}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {body ? <Text style={[styles.body, { color: hexToRgba(colors.text, 0.56) }]}>{body}</Text> : null}

        <View style={styles.bodyWrap}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </SafeAreaView>
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
    progressText: { width: 38, textAlign: 'right', fontSize: 11, fontWeight: '700' },
    title: { marginTop: 24, fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.6 },
    body: { marginTop: 10, fontSize: Typography.body, lineHeight: 20 },
    bodyWrap: { marginTop: 24, gap: 16 },
    footer: { marginTop: 24, gap: 10 },
    primaryButton: { minHeight: 50, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
    secondaryButton: { minHeight: 50, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    secondaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
