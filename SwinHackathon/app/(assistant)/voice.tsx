import { ThemeButton } from '@/components/ThemeButton';
import { AssistantCard, AssistantScreen } from '@/components/assistant/AssistantScaffold';
import { hexToRgba } from '@/components/auth/AuthKit';
import { assistantScenarios } from '@/components/assistant/mock-data';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function VoiceAssistantScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { activeScenarioId, assistantSettings, selectAssistantScenario } = useAssistant();
  const [isListening, setIsListening] = useState(true);
  const [selectedScenarioId, setSelectedScenarioId] = useState(activeScenarioId);
  const [waveTick, setWaveTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveTick((current) => current + 1);
    }, 320);

    return () => clearInterval(interval);
  }, []);

  const bars = useMemo(
    () =>
      [28, 52, 36, 68, 48, 72, 40, 58].map((base, index) =>
        isListening ? base + ((waveTick + index) % 3) * 10 : 18 + (index % 2) * 8
      ),
    [isListening, waveTick]
  );

  const highlightedScenario =
    assistantScenarios.find((item) => item.id === selectedScenarioId) ?? assistantScenarios[0];

  return (
    <AssistantScreen
      title="Voice Assistant"
      subtitle="Say anything to Finpal and route it back into the assistant chat"
    >
      <View style={styles.stack}>
        <AssistantCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
          <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.76) }]}>
            SAY ANYTHING TO FINPAL
          </Text>
          <Text style={[styles.heroTitle, { color: colors.card }]}>
            {isListening ? 'Listening now...' : 'Voice paused'}
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.82) }]}>
            Voice: {assistantSettings.voiceName}
          </Text>

          <View
            style={[
              styles.micOrb,
              { backgroundColor: hexToRgba(colors.card, 0.14), borderColor: hexToRgba(colors.card, 0.2) },
            ]}
          >
            <View
              style={[
                styles.micInnerOrb,
                { backgroundColor: colors.card },
              ]}
            >
              <MaterialIcons
                name={isListening ? 'keyboard-voice' : 'mic-off'}
                size={34}
                color={colors.primaryDark}
              />
            </View>
          </View>

          <View style={styles.waveRow}>
            {bars.map((height, index) => (
              <View
                key={`voice-bar-${index}`}
                style={[
                  styles.waveBar,
                  {
                    height,
                    backgroundColor:
                      index % 2 === 0 ? colors.card : hexToRgba(colors.card, 0.64),
                  },
                ]}
              />
            ))}
          </View>
        </AssistantCard>

        <AssistantCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick voice prompts</Text>
          <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Choose the demo flow you want voice mode to open when you finish.
          </Text>

          <View style={styles.promptWrap}>
            {assistantScenarios.slice(0, 6).map((scenario) => {
              const selected = scenario.id === selectedScenarioId;

              return (
                <Pressable
                  key={scenario.id}
                  style={[
                    styles.promptChip,
                    {
                      backgroundColor: selected
                        ? hexToRgba(colors.primaryDark, 0.12)
                        : colors.backgroundSoft,
                      borderColor: selected
                        ? hexToRgba(colors.primaryDark, 0.16)
                        : hexToRgba(colors.primaryDark, 0.08),
                    },
                  ]}
                  onPress={() => setSelectedScenarioId(scenario.id)}
                >
                  <MaterialIcons
                    name={scenario.icon}
                    size={18}
                    color={selected ? colors.primaryDark : scenario.accent}
                  />
                  <Text style={[styles.promptText, { color: colors.text }]}>
                    {scenario.chipLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            style={[
              styles.previewCard,
              { backgroundColor: colors.backgroundSoft },
            ]}
          >
            <Text style={[styles.previewTitle, { color: colors.text }]}>
              {highlightedScenario.title}
            </Text>
            <Text style={[styles.previewBody, { color: hexToRgba(colors.text, 0.56) }]}>
              {highlightedScenario.prompt}
            </Text>
          </View>
        </AssistantCard>

        <View style={styles.buttonRow}>
          <ThemeButton
            title={isListening ? 'Pause mic' : 'Resume mic'}
            onPress={() => setIsListening((current) => !current)}
            colorBackground={colors.card}
            colorText={colors.primaryDark}
            style={[styles.button, styles.outlineButton]}
          />
          <ThemeButton
            title="Use this prompt"
            onPress={() => {
              selectAssistantScenario(selectedScenarioId);
              router.replace({
                pathname: '/(assistant)/chat/[scenario]',
                params: { scenario: selectedScenarioId },
              });
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
    alignItems: 'center',
  },
  heroEyebrow: {
    fontSize: Typography.body,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 27,
    fontWeight: '800',
  },
  heroBody: {
    marginTop: 8,
    fontSize: Typography.body,
  },
  micOrb: {
    marginTop: 28,
    width: '100%',
    maxWidth: 168,
    aspectRatio: 1,
    height: 168,
    borderRadius: 84,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micInnerOrb: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveRow: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  waveBar: {
    width: 12,
    borderRadius: 999,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 21,
  },
  promptWrap: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  promptChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  previewCard: {
    marginTop: 16,
    borderRadius: 20,
    padding: 14,
  },
  previewTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  previewBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
  },
  outlineButton: {
    borderWidth: 1,
  },
});
