import { ThemeButton } from '@/components/ThemeButton';
import { AssistantCard, AssistantScreen } from '@/components/assistant/AssistantScaffold';
import { hexToRgba } from '@/components/auth/AuthKit';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

type SettingsTabId = 'general' | 'customize' | 'privacy';

const settingsTabs: { id: SettingsTabId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'customize', label: 'Customize' },
  { id: 'privacy', label: 'Privacy' },
];

export default function AssistantSettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { assistantSettings, setAssistantSettings } = useAssistant();
  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');

  const toggleSuggestion = (value: string) => {
    const exists = assistantSettings.suggestInsights.includes(value);

    setAssistantSettings({
      suggestInsights: exists
        ? assistantSettings.suggestInsights.filter((item) => item !== value)
        : [...assistantSettings.suggestInsights, value],
    });
  };

  return (
    <AssistantScreen
      title="Chat Settings"
      subtitle="Tune your assistant personality, memory and privacy options"
    >
      <View style={styles.stack}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {settingsTabs.map((tab) => {
            const selected = tab.id === activeTab;

            return (
              <Pressable
                key={tab.id}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: selected
                      ? colors.primaryDark
                      : colors.card,
                    borderColor: selected
                      ? colors.primaryDark
                      : hexToRgba(colors.primaryDark, 0.08),
                  },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    { color: selected ? colors.card : colors.text },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeTab === 'general' ? (
          <>
            <AssistantCard style={[styles.planCard, { backgroundColor: colors.primaryDark }]}>
              <Text style={[styles.planEyebrow, { color: hexToRgba(colors.card, 0.74) }]}>
                CURRENT PLAN
              </Text>
              <Text style={[styles.planTitle, { color: colors.card }]}>
                {assistantSettings.plan === 'pro' ? 'Finpal Pro' : 'Finpal Free'}
              </Text>
              <Text style={[styles.planBody, { color: hexToRgba(colors.card, 0.82) }]}>
                {assistantSettings.plan === 'pro'
                  ? 'Full assistant features with advanced model access.'
                  : 'Basic assistant features with limited monthly usage.'}
              </Text>

              <View style={styles.planButtons}>
                <ThemeButton
                  title="Upgrade"
                  onPress={() => router.push('/(assistant)/upgrade')}
                  colorBackground={colors.card}
                  colorText={colors.primaryDark}
                  style={styles.planButton}
                />
                <ThemeButton
                  title="Limit state"
                  onPress={() => router.push('/(assistant)/out-of-tokens')}
                  colorBackground={hexToRgba(colors.card, 0.14)}
                  colorText={colors.card}
                  style={[styles.planButton, styles.planOutline]}
                />
              </View>
            </AssistantCard>

            <AssistantCard>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Assistant defaults</Text>
              <View style={styles.fieldStack}>
                <SettingsField
                  label="Language"
                  value={assistantSettings.language}
                  onChangeText={(value) => setAssistantSettings({ language: value })}
                />
                <SettingsField
                  label="Voice"
                  value={assistantSettings.voiceName}
                  onChangeText={(value) => setAssistantSettings({ voiceName: value })}
                />
              </View>

              <Text style={[styles.subheading, { color: colors.text }]}>Response style</Text>
              <View style={styles.choiceWrap}>
                {(['Natural', 'Detailed', 'Short'] as const).map((option) => {
                  const selected = assistantSettings.responseType === option;

                  return (
                    <Pressable
                      key={option}
                      style={[
                        styles.choiceChip,
                        {
                          backgroundColor: selected
                            ? hexToRgba(colors.primaryDark, 0.12)
                            : colors.backgroundSoft,
                          borderColor: selected
                            ? hexToRgba(colors.primaryDark, 0.16)
                            : hexToRgba(colors.primaryDark, 0.08),
                        },
                      ]}
                      onPress={() => setAssistantSettings({ responseType: option })}
                    >
                      <Text style={[styles.choiceText, { color: colors.text }]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </AssistantCard>
          </>
        ) : null}

        {activeTab === 'customize' ? (
          <>
            <AssistantCard>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Identity & model</Text>
              <View style={styles.fieldStack}>
                <SettingsField
                  label="Assistant name"
                  value={assistantSettings.aiCompanionName}
                  onChangeText={(value) => setAssistantSettings({ aiCompanionName: value })}
                />
              </View>

              <Text style={[styles.subheading, { color: colors.text }]}>Model</Text>
              <View style={styles.choiceWrap}>
                {(['GPT 3.5', 'GPT 4.1'] as const).map((option) => {
                  const selected = assistantSettings.model === option;

                  return (
                    <Pressable
                      key={option}
                      style={[
                        styles.choiceChip,
                        {
                          backgroundColor: selected
                            ? hexToRgba(colors.primaryDark, 0.12)
                            : colors.backgroundSoft,
                          borderColor: selected
                            ? hexToRgba(colors.primaryDark, 0.16)
                            : hexToRgba(colors.primaryDark, 0.08),
                        },
                      ]}
                      onPress={() => setAssistantSettings({ model: option })}
                    >
                      <Text style={[styles.choiceText, { color: colors.text }]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </AssistantCard>

            <AssistantCard>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Custom instructions</Text>
              <TextInput
                value={assistantSettings.customInstructions}
                onChangeText={(value) => setAssistantSettings({ customInstructions: value })}
                multiline
                placeholder="Tell Finpal how to respond"
                placeholderTextColor={hexToRgba(colors.text, 0.34)}
                style={[
                  styles.textArea,
                  { color: colors.text, borderColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
              />

              <Text style={[styles.subheading, { color: colors.text }]}>Suggested insight modules</Text>
              <View style={styles.choiceWrap}>
                {[
                  'Spending Recommendations',
                  'Budget Insights',
                  'Saving Tips & Tricks',
                  'News & Resources',
                ].map((item) => {
                  const selected = assistantSettings.suggestInsights.includes(item);

                  return (
                    <Pressable
                      key={item}
                      style={[
                        styles.choiceChip,
                        {
                          backgroundColor: selected
                            ? hexToRgba(colors.primaryDark, 0.12)
                            : colors.backgroundSoft,
                          borderColor: selected
                            ? hexToRgba(colors.primaryDark, 0.16)
                            : hexToRgba(colors.primaryDark, 0.08),
                        },
                      ]}
                      onPress={() => toggleSuggestion(item)}
                    >
                      <Text style={[styles.choiceText, { color: colors.text }]}>{item}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </AssistantCard>
          </>
        ) : null}

        {activeTab === 'privacy' ? (
          <>
            <AssistantCard>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Memory & privacy</Text>
              <View style={styles.toggleStack}>
                <ToggleRow
                  label="Adaptive memory"
                  helper="Remember useful preferences across sessions"
                  value={assistantSettings.adaptiveMemory}
                  onValueChange={(value) => setAssistantSettings({ adaptiveMemory: value })}
                />
                <ToggleRow
                  label="Privacy mode"
                  helper="Keep the assistant more conservative with follow-up prompts"
                  value={assistantSettings.privacyMode}
                  onValueChange={(value) => setAssistantSettings({ privacyMode: value })}
                />
                <ToggleRow
                  label="Share data for quality"
                  helper="Use anonymized usage to improve assistant suggestions"
                  value={assistantSettings.shareData}
                  onValueChange={(value) => setAssistantSettings({ shareData: value })}
                />
              </View>
            </AssistantCard>

            <AssistantCard>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Assistant memory notes</Text>
              <TextInput
                value={assistantSettings.memoryNotes}
                onChangeText={(value) => setAssistantSettings({ memoryNotes: value })}
                multiline
                placeholder="What should Finpal remember?"
                placeholderTextColor={hexToRgba(colors.text, 0.34)}
                style={[
                  styles.textArea,
                  { color: colors.text, borderColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
              />

              <View style={styles.privacyButtons}>
                <ThemeButton
                  title="Clear assistant data"
                  onPress={() => router.push('/(assistant)/reset-memory')}
                  colorBackground={colors.primaryDark}
                  colorText={colors.card}
                  style={styles.privacyButton}
                />
              </View>
            </AssistantCard>
          </>
        ) : null}
      </View>
    </AssistantScreen>
  );
}

function SettingsField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <View>
      <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.48) }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={hexToRgba(colors.text, 0.34)}
        style={[
          styles.input,
          { color: colors.text, borderColor: hexToRgba(colors.primaryDark, 0.08) },
        ]}
      />
    </View>
  );
}

function ToggleRow({
  label,
  helper,
  value,
  onValueChange,
}: {
  label: string;
  helper: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.toggleHelper, { color: hexToRgba(colors.text, 0.54) }]}>
          {helper}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? '#ffffff' : '#ffffff'}
        trackColor={{
          false: hexToRgba(colors.text, 0.16),
          true: colors.primaryDark,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginTop: 18,
    gap: 16,
  },
  tabsRow: {
    gap: 10,
    paddingRight: 12,
  },
  tabChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  planCard: {
    borderWidth: 0,
  },
  planEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  planTitle: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: '800',
  },
  planBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  planButtons: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  planButton: {
    flex: 1,
  },
  planOutline: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  fieldStack: {
    marginTop: 16,
    gap: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 14,
  },
  subheading: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: '800',
  },
  choiceWrap: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  choiceText: {
    fontSize: 13,
    fontWeight: '700',
  },
  textArea: {
    marginTop: 14,
    minHeight: 120,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 21,
    textAlignVertical: 'top',
  },
  toggleStack: {
    marginTop: 14,
    gap: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 14,
  },
  toggleCopy: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  toggleHelper: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
  },
  privacyButtons: {
    marginTop: 18,
  },
  privacyButton: {
    width: '100%',
  },
});
