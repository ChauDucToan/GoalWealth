import { ThemeButton } from '@/components/ThemeButton';
import { AssistantCard, AssistantScreen } from '@/components/assistant/AssistantScaffold';
import { hexToRgba } from '@/components/auth/AuthKit';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function OutOfTokensScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { assistantSettings } = useAssistant();
  const isPro = assistantSettings.plan === 'pro';

  return (
    <AssistantScreen
      title="Usage Limit"
      subtitle="Demo state for the quota warning and upgrade CTA shown in the assistant board"
    >
      <View style={styles.stack}>
        <AssistantCard style={[styles.heroCard, { backgroundColor: colors.darkBackground }]}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: hexToRgba(colors.warning, 0.16) },
            ]}
          >
            <MaterialIcons name="hourglass-top" size={30} color={colors.warning} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.card }]}>
            {isPro ? 'Usage monitor' : 'Oops, you are out of tokens'}
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.8) }]}>
            {isPro
              ? 'You are on Pro, so this screen acts as a usage monitor preview rather than a hard stop.'
              : 'Your free monthly assistant allowance is exhausted. Upgrade to keep voice, receipt OCR and deeper insights unlocked.'}
          </Text>

          <View style={[styles.progressTrack, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: isPro ? '62%' : '100%',
                  backgroundColor: isPro ? colors.success : colors.warning,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressMeta, { color: hexToRgba(colors.card, 0.74) }]}>
            {isPro ? '62% of Pro quota used' : '100% of free quota used'}
          </Text>
        </AssistantCard>

        <AssistantCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What gets restricted</Text>
          <View style={styles.itemStack}>
            {[
              'New voice assistant sessions',
              'Receipt OCR processing',
              'Advanced budget projection prompts',
              'Extended context memory',
            ].map((item) => (
              <View key={item} style={styles.itemRow}>
                <MaterialIcons name="lock-outline" size={18} color={colors.primaryDark} />
                <Text style={[styles.itemText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>
        </AssistantCard>

        <View style={styles.buttonRow}>
          <ThemeButton
            title="Back to assistant"
            onPress={() => router.replace('/(tabs)/assistant')}
            colorBackground={colors.card}
            colorText={colors.primaryDark}
            style={[styles.button, styles.outlineButton]}
          />
          <ThemeButton
            title={isPro ? 'Manage plan' : 'Upgrade to Pro'}
            onPress={() => router.push('/(assistant)/upgrade')}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.button}
          />
        </View>
      </View>
    </AssistantScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginTop: 18,
    gap: 16,
  },
  heroCard: {
    borderWidth: 0,
    alignItems: 'center',
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    marginTop: 18,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 21,
    textAlign: 'center',
  },
  progressTrack: {
    marginTop: 20,
    width: '100%',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressMeta: {
    marginTop: 10,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  itemStack: {
    marginTop: 14,
    gap: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemText: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
  },
  outlineButton: {
    borderWidth: 1,
  },
});
