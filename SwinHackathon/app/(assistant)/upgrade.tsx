import { ThemeButton } from '@/components/ThemeButton';
import { AssistantCard, AssistantScreen } from '@/components/assistant/AssistantScaffold';
import { hexToRgba } from '@/components/auth/AuthKit';
import { assistantPlans } from '@/components/assistant/mock-data';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

const planFeatures = [
  'Voice-first assistant sessions',
  'Receipt OCR with transaction summaries',
  'Advanced budget projections and richer context',
  'Longer assistant memory and custom instructions',
];

export default function UpgradeAssistantScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { assistantSettings, setAssistantSettings } = useAssistant();
  const isPro = assistantSettings.plan === 'pro';

  return (
    <AssistantScreen
      title="Upgrade to Pro"
      subtitle="Plan cards and premium messaging based on the AI assistant reference board"
    >
      <View style={styles.stack}>
        <AssistantCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
          <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.74) }]}>
            PREMIUM ASSISTANT
          </Text>
          <Text style={[styles.heroTitle, { color: colors.card }]}>
            Unlock the complete Finpal AI experience
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.82) }]}>
            Voice, receipt OCR, stronger models and deeper financial suggestions all in one plan.
          </Text>
        </AssistantCard>

        <View style={styles.planStack}>
          {assistantPlans.map((plan) => {
            const selected = assistantSettings.plan === plan.id;
            const premium = plan.id === 'pro';

            return (
              <Pressable
                key={plan.id}
                style={[
                  styles.planTile,
                  {
                    backgroundColor: premium ? colors.card : colors.backgroundSoft,
                    borderColor: selected
                      ? colors.primaryDark
                      : hexToRgba(colors.primaryDark, 0.08),
                  },
                ]}
                onPress={() =>
                  setAssistantSettings({
                    plan: plan.id as 'free' | 'pro',
                    model: plan.id === 'pro' ? 'GPT 4.1' : 'GPT 3.5',
                  })
                }
              >
                <View style={styles.planTileHeader}>
                  <View>
                    <Text style={[styles.planTileTitle, { color: colors.text }]}>{plan.name}</Text>
                    <Text style={[styles.planTileCaption, { color: hexToRgba(colors.text, 0.5) }]}>
                      {plan.caption}
                    </Text>
                  </View>
                  {selected ? (
                    <View
                      style={[
                        styles.selectedBadge,
                        { backgroundColor: hexToRgba(colors.primaryDark, 0.12) },
                      ]}
                    >
                      <MaterialIcons name="check-circle" size={16} color={colors.primaryDark} />
                      <Text style={[styles.selectedText, { color: colors.primaryDark }]}>
                        Current
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.planTilePrice, { color: premium ? colors.primaryDark : colors.text }]}>
                  {plan.price}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <AssistantCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Included with Pro</Text>
          <View style={styles.featureStack}>
            {planFeatures.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <MaterialIcons name="stars" size={18} color={colors.primaryDark} />
                <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
              </View>
            ))}
          </View>
        </AssistantCard>

        <View style={styles.buttonRow}>
          <ThemeButton
            title="Not now"
            onPress={() => router.back()}
            colorBackground={colors.card}
            colorText={colors.primaryDark}
            style={[styles.button, styles.outlineButton]}
          />
          <ThemeButton
            title={isPro ? 'Back to assistant' : 'Switch to Pro'}
            onPress={() => {
              if (!isPro) {
                setAssistantSettings({ plan: 'pro', model: 'GPT 4.1' });
              }

              router.replace('/(tabs)/assistant');
            }}
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
  },
  heroEyebrow: {
    fontSize: Typography.body,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  heroTitle: {
    marginTop: 12,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  heroBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 21,
  },
  planStack: {
    gap: 12,
  },
  planTile: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 18,
  },
  planTileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  planTileTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  planTileCaption: {
    marginTop: 6,
    fontSize: Typography.body,
    lineHeight: 19,
  },
  selectedBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  planTilePrice: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  featureStack: {
    marginTop: 14,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
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
