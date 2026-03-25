import { AssistantCard } from '@/components/assistant/AssistantScaffold';
import { AssistantConversation } from '@/components/assistant/AssistantWidgets';
import { hexToRgba } from '@/components/auth/AuthKit';
import { assistantScenarios } from '@/components/assistant/mock-data';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Typography } from '@/constants/theme';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AssistantChatScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ scenario?: string | string[] }>();
  const {
    activeScenarioId,
    conversation,
    activeThreadRuntime,
    assistantSettings,
    customThread,
    selectAssistantScenario,
    sendAssistantMessage,
    getAssistantScenario,
  } = useAssistant();
  const [draft, setDraft] = useState('');
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const scenarioParam = Array.isArray(params.scenario) ? params.scenario[0] : params.scenario;
  const isCustomThread = scenarioParam === 'custom' && customThread;
  const normalizedScenarioId =
    scenarioParam && assistantScenarios.some((item) => item.id === scenarioParam)
      ? scenarioParam
      : activeScenarioId;

  useEffect(() => {
    if (!isCustomThread && normalizedScenarioId && normalizedScenarioId !== activeScenarioId) {
      selectAssistantScenario(normalizedScenarioId);
    }
  }, [activeScenarioId, isCustomThread, normalizedScenarioId, selectAssistantScenario]);

  const scenario = isCustomThread
    ? customThread
    : getAssistantScenario(normalizedScenarioId) ?? assistantScenarios[0];
  const usedContextLabels = [
    activeThreadRuntime.usedContext?.memory ? 'Memory' : null,
    activeThreadRuntime.usedContext?.ocr_records?.length ? 'OCR' : null,
    activeThreadRuntime.usedContext?.smart_agent ? 'Smart agent' : null,
    activeThreadRuntime.usedContext?.user_present ? 'Profile' : null,
  ].filter(Boolean) as string[];

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 12 },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Pressable
              style={[
                styles.backButton,
                { backgroundColor: colors.card, borderColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </Pressable>

            <View style={styles.headerTextWrap}>
              <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>THREAD</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{scenario.title}</Text>
              <Text style={[styles.headerBody, { color: hexToRgba(colors.text, 0.56) }]}>
                {scenario.prompt}
              </Text>
            </View>
            <Pressable
              style={[
                styles.headerIconButton,
                { backgroundColor: colors.card, borderColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
              onPress={() => router.push('/(assistant)/settings')}
            >
              <MaterialIcons name="tune" size={24} color={colors.text} />
            </Pressable>
          </View>

          <AssistantCard style={[styles.summaryCard, { backgroundColor: colors.primaryDark }]}>
            <View style={styles.summaryTopRow}>
              <View style={styles.summaryCopy}>
                <Text style={[styles.summaryTitle, { color: colors.card }]}>
                  {assistantSettings.aiCompanionName}
                </Text>
                <Text style={[styles.summaryBody, { color: hexToRgba(colors.card, 0.82) }]}>
                  Voice và receipt nằm ngay trong chat để gửi vào thread hiện tại. Settings và
                  upgrade đã được đưa ra ngoài phần nội dung chat.
                </Text>
              </View>
              <View
                style={[
                  styles.summaryIcon,
                  { backgroundColor: hexToRgba(colors.card, 0.14) },
                ]}
              >
                <MaterialIcons name={scenario.icon} size={24} color={colors.card} />
              </View>
            </View>
          </AssistantCard>

          {(activeThreadRuntime.status === 'sending' ||
            activeThreadRuntime.error ||
            activeThreadRuntime.warnings.length ||
            activeThreadRuntime.sessionId ||
            activeThreadRuntime.requestId) ? (
            <AssistantCard>
              <View style={styles.runtimeTopRow}>
                <View
                  style={[
                    styles.runtimeBadge,
                    {
                      backgroundColor:
                        activeThreadRuntime.mode === 'goalwealth-adapter'
                          ? hexToRgba(colors.primaryDark, 0.1)
                          : hexToRgba(colors.warning, 0.12),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.runtimeBadgeText,
                      {
                        color:
                          activeThreadRuntime.mode === 'goalwealth-adapter'
                            ? colors.primaryDark
                            : '#B45309',
                      },
                    ]}
                  >
                    {activeThreadRuntime.mode === 'goalwealth-adapter'
                      ? 'GoalWealth live'
                      : 'Local preview'}
                  </Text>
                </View>

                {activeThreadRuntime.status === 'sending' ? (
                  <Text style={[styles.runtimeMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                    Sending...
                  </Text>
                ) : null}
              </View>

              {activeThreadRuntime.error ? (
                <Text style={[styles.runtimeError, { color: colors.error }]}>
                  {activeThreadRuntime.error}
                </Text>
              ) : null}

              {activeThreadRuntime.warnings.map((warning) => (
                <Text key={warning} style={[styles.runtimeWarning, { color: colors.warning }]}>
                  {warning}
                </Text>
              ))}

              <View style={styles.runtimeMetaStack}>
                {usedContextLabels.length ? (
                  <Text style={[styles.runtimeMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                    Used context: {usedContextLabels.join(' • ')}
                  </Text>
                ) : null}
                {activeThreadRuntime.sessionId ? (
                  <Text style={[styles.runtimeMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                    Session {activeThreadRuntime.sessionId}
                  </Text>
                ) : null}
                {activeThreadRuntime.requestId ? (
                  <Text style={[styles.runtimeMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                    Request {activeThreadRuntime.requestId}
                  </Text>
                ) : null}
              </View>
            </AssistantCard>
          ) : null}

          <AssistantConversation messages={conversation} />
        </View>
      </ScrollView>

        <View
          style={[
            styles.bottomDock,
            {
              backgroundColor: colors.backgroundSoft,
              paddingBottom: Math.max(Math.min(insets.bottom, 8), 4),
            },
          ]}
        >
        {isToolMenuOpen ? (
          <View style={styles.toolMenu}>
            <Pressable
              style={[
                styles.toolChip,
                { backgroundColor: colors.card, borderColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
              onPress={() => {
                setIsToolMenuOpen(false);
                router.push('/(assistant)/voice');
              }}
            >
              <MaterialIcons name="keyboard-voice" size={18} color={colors.primaryDark} />
              <Text style={[styles.toolChipText, { color: colors.text }]}>Voice</Text>
            </Pressable>
            <Pressable
              style={[
                styles.toolChip,
                { backgroundColor: colors.card, borderColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
              onPress={() => {
                setIsToolMenuOpen(false);
                router.push('/(finance)/smart-budgeting/add-spending');
              }}
            >
              <MaterialIcons name="photo-camera" size={18} color={colors.primaryDark} />
              <Text style={[styles.toolChipText, { color: colors.text }]}>Spending</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          style={[
            styles.composerShell,
            { backgroundColor: colors.card, borderColor: hexToRgba(colors.primaryDark, 0.08) },
          ]}
          onPress={() => inputRef.current?.focus()}
        >
          <Pressable
            style={[
              styles.composerIconButton,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
            ]}
            onPress={() => setIsToolMenuOpen((current) => !current)}
          >
            <MaterialIcons name="add" size={24} color={colors.primaryDark} />
          </Pressable>

          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${assistantSettings.aiCompanionName}...`}
            placeholderTextColor={hexToRgba(colors.text, 0.34)}
            style={[styles.composerInput, { color: colors.text }]}
            multiline
            showSoftInputOnFocus
            blurOnSubmit={false}
            returnKeyType="default"
            onPressIn={() => inputRef.current?.focus()}
          />

          <Pressable
            style={[
              styles.composerSend,
              {
                backgroundColor: draft.trim() && activeThreadRuntime.status !== 'sending'
                  ? colors.primaryDark
                  : hexToRgba(colors.primaryDark, 0.2),
              },
            ]}
            onPress={async () => {
              const trimmed = draft.trim();

              if (!trimmed || activeThreadRuntime.status === 'sending') {
                return;
              }

              setDraft('');
              await sendAssistantMessage(trimmed);
            }}
            disabled={activeThreadRuntime.status === 'sending'}
          >
            <MaterialIcons
              name={activeThreadRuntime.status === 'sending' ? 'hourglass-top' : 'north-east'}
              size={22}
              color={colors.card}
            />
          </Pressable>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 18,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: Typography.body,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  headerTitle: {
    marginTop: 6,
    fontSize: 27,
    fontWeight: '800',
  },
  headerBody: {
    marginTop: 7,
    fontSize: Typography.body,
    lineHeight: 21,
  },
  summaryCard: {
    borderWidth: 0,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 21,
    fontWeight: '800',
  },
  summaryBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 21,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runtimeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  runtimeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  runtimeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  runtimeMetaStack: {
    marginTop: 10,
    gap: 4,
  },
  runtimeMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  runtimeError: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  runtimeWarning: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  bottomDock: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  toolMenu: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    flexDirection: 'row',
    gap: 10,
  },
  toolChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolChipText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  composerShell: {
    minHeight: 62,
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  composerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerInput: {
    flex: 1,
    maxHeight: 104,
    fontSize: Typography.body,
    lineHeight: 21,
    paddingVertical: 6,
  },
  composerSend: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
