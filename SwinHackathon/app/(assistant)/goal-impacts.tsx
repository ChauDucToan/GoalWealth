import { AssistantCard, AssistantScreen } from '@/components/assistant/AssistantScaffold';
import { advisorPrimaryRecommendation } from '@/components/assistant/advisor-data';
import { hexToRgba } from '@/components/auth/AuthKit';
import { ProductSectionHeader, ProductStatusChip } from '@/components/shared/ProductSurface';
import { ThemeButton } from '@/components/ThemeButton';
import { Typography } from '@/constants/theme';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function GoalImpactsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { assistantSettings, openCustomAssistantThread } = useAssistant();
  const impactCount = advisorPrimaryRecommendation.goalImpacts.length;
  const highPriorityCount = advisorPrimaryRecommendation.goalImpacts.filter((item) =>
    item.priorityLabel.toLowerCase().includes('high')
  ).length;

  return (
    <AssistantScreen
      title="Goal impact"
      subtitle="What changes if you follow this move"
    >
      <View style={styles.stack}>
        <AssistantCard style={[styles.summaryCard, { backgroundColor: colors.primaryDark }]}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryCopy}>
              <Text style={[styles.summaryTitle, { color: colors.card }]}>Active goals affected</Text>
              <Text style={[styles.summaryBody, { color: hexToRgba(colors.card, 0.82) }]}>
                High-priority goals stay first. Lower-priority goals stay protected.
              </Text>
            </View>
            <View style={[styles.summaryIconShell, { backgroundColor: hexToRgba(colors.card, 0.14) }]}>
              <MaterialIcons name="flag-circle" size={24} color={colors.card} />
            </View>
          </View>

          <View style={styles.summaryChipRow}>
            <ProductStatusChip label={`${impactCount} active goals`} tone="secondary" icon="flag" />
            <ProductStatusChip label={`${highPriorityCount} high priority`} tone="warning" icon="priority-high" />
          </View>
        </AssistantCard>

        <AssistantCard>
          <ProductSectionHeader title="Current impact" meta={`${impactCount} items`} />

          <View style={styles.impactStack}>
            {advisorPrimaryRecommendation.goalImpacts.map((impact) => (
              <View
                key={impact.goalId}
                style={[
                  styles.impactCard,
                  {
                    backgroundColor: colors.backgroundSoft,
                    borderColor: hexToRgba(colors.primaryDark, 0.08),
                  },
                ]}
              >
                <View style={styles.impactHeader}>
                  <View style={styles.impactHeaderCopy}>
                    <Text style={[styles.impactTitle, { color: colors.text }]}>{impact.goalTitle}</Text>
                    <Text style={[styles.impactPriority, { color: hexToRgba(colors.text, 0.5) }]}>
                      {impact.priorityLabel}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.changePill,
                      { backgroundColor: hexToRgba(colors.success, 0.12) },
                    ]}
                  >
                    <Text style={[styles.changePillText, { color: colors.success }]}>
                      {impact.changeLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.impactBodyRow}>
                  <View
                    style={[
                      styles.impactIconShell,
                      { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
                    ]}
                  >
                    <MaterialIcons name="south-east" size={18} color={colors.primaryDark} />
                  </View>
                  <Text style={[styles.impactBody, { color: colors.text }]}>
                    {impact.impact}
                  </Text>
                </View>

                <ThemeButton
                  title={`Ask ${assistantSettings.aiCompanionName}`}
                  onPress={() => {
                    openCustomAssistantThread({
                      id: `goal-impact-${impact.goalId}`,
                      title: `${impact.goalTitle} impact`,
                      prompt: `Explain how the current move affects ${impact.goalTitle.toLowerCase()}.`,
                      icon: 'flag',
                      messages: [
                        {
                          id: `goal-impact-user-${impact.goalId}`,
                          role: 'user',
                          text: `Explain in detail how this move affects my ${impact.goalTitle}.`,
                          meta: 'Now',
                        },
                        {
                          id: `goal-impact-reply-${impact.goalId}`,
                          role: 'assistant',
                          text: `${impact.goalTitle} is ${impact.priorityLabel.toLowerCase()}, so this move keeps it visible in the plan. ${impact.impact} The immediate effect is ${impact.changeLabel.toLowerCase()}, which helps you move without pulling funds into a riskier step too early.`,
                          meta: 'Now',
                        },
                      ],
                    });
                    router.push({
                      pathname: '/(assistant)/chat/[scenario]',
                      params: { scenario: 'custom' },
                    });
                  }}
                  colorBackground={colors.primaryDark}
                  colorText={colors.card}
                  style={styles.askButton}
                />
              </View>
            ))}
          </View>
        </AssistantCard>
      </View>
    </AssistantScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginTop: 18,
    gap: 16,
  },
  summaryCard: {
    borderWidth: 0,
    gap: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  summaryCopy: {
    flex: 1,
    gap: 6,
  },
  summaryTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  summaryBody: {
    fontSize: Typography.body,
    lineHeight: 20,
    maxWidth: 320,
  },
  summaryIconShell: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  impactStack: {
    gap: 12,
  },
  impactCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  impactHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  impactTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  impactPriority: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  changePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  changePillText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
  },
  impactBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  impactIconShell: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactBody: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  askButton: {
    marginTop: 2,
  },
});
