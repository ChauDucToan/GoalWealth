import { ThemeButton } from '@/components/ThemeButton';
import { AssistantCard } from '@/components/assistant/AssistantScaffold';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  AssistantCard as AssistantMessageCard,
  assistantIntroSlides,
  assistantScenarios,
} from '@/components/assistant/mock-data';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/constants/theme';

export default function AssistantTabScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    hasSeenAssistantIntro,
    activeScenarioId,
    assistantSettings,
    markAssistantIntroSeen,
    selectAssistantScenario,
    getAssistantScenario,
  } = useAssistant();
  const [introIndex, setIntroIndex] = useState(0);
  const activeScenario = getAssistantScenario(activeScenarioId);

  const sortedScenarios = useMemo(() => {
    return [...assistantScenarios].sort((left, right) => {
      if (left.id === activeScenarioId) {
        return -1;
      }

      if (right.id === activeScenarioId) {
        return 1;
      }

      return 0;
    });
  }, [activeScenarioId]);

  if (!hasSeenAssistantIntro) {
    const slide = assistantIntroSlides[introIndex];
    const isLastSlide = introIndex === assistantIntroSlides.length - 1;

    return (
      <View style={[styles.introScreen, { backgroundColor: colors.backgroundSoft }]}>
        <View
          style={[
            styles.introOrbLarge,
            { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
          ]}
        />
        <View
          style={[
            styles.introOrbSmall,
            { backgroundColor: hexToRgba(colors.success, 0.16) },
          ]}
        />

        <View style={styles.introContent}>
          <View
            style={[
              styles.introArtwork,
              { backgroundColor: isLastSlide ? colors.darkBackground : colors.primaryDark },
            ]}
          >
            <View
              style={[
                styles.introArtworkHalo,
                { backgroundColor: hexToRgba(colors.card, 0.14) },
              ]}
            />
            <View style={[styles.introIconShell, { backgroundColor: colors.card }]}>
              <MaterialIcons
                name={slide.icon}
                size={54}
                color={isLastSlide ? colors.warning : colors.primaryDark}
              />
            </View>
            <View style={styles.introBadgeRow}>
              {['Budget help', 'Receipt OCR', 'Voice', 'Insights'].map((item) => (
                <View
                  key={item}
                  style={[
                    styles.introBadge,
                    { backgroundColor: hexToRgba(colors.card, 0.14) },
                  ]}
                >
                  <Text style={[styles.introBadgeText, { color: colors.card }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={[styles.introTitle, { color: colors.text }]}>{slide.title}</Text>
          <Text style={[styles.introBody, { color: hexToRgba(colors.text, 0.64) }]}>
            {slide.body}
          </Text>

          <View style={styles.introDots}>
            {assistantIntroSlides.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.introDot,
                  {
                    width: index === introIndex ? 28 : 8,
                    backgroundColor:
                      index === introIndex
                        ? colors.primaryDark
                        : hexToRgba(colors.primaryDark, 0.18),
                  },
                ]}
              />
            ))}
          </View>

          <ThemeButton
            title={slide.buttonLabel}
            onPress={() => {
              if (isLastSlide) {
                markAssistantIntroSeen();
                return;
              }

              setIntroIndex((current) => current + 1);
            }}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.introButton}
          />

          {!isLastSlide ? (
            <Pressable onPress={markAssistantIntroSeen}>
              <Text style={[styles.introSkip, { color: colors.primaryDark }]}>Skip for now</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom + 120, 148) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>PERSONAL AI</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Conversation Inbox</Text>
            <Text style={[styles.headerBody, { color: hexToRgba(colors.text, 0.58) }]}>
              Mỗi cuộc trò chuyện được tách riêng. Chọn một thread để mở chat đầy đủ với voice,
              receipt và các tool khác bên trong.
            </Text>
          </View>
          <Pressable
            style={[
              styles.headerIconButton,
              { backgroundColor: colors.card, borderColor: hexToRgba(colors.primaryDark, 0.08) },
            ]}
            onPress={() => router.push('/(assistant)/settings')}
          >
            <MaterialIcons name="tune" size={22} color={colors.text} />
          </Pressable>
        </View>

        <AssistantCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroName, { color: colors.card }]}>
                {assistantSettings.aiCompanionName}
              </Text>
              <Text style={[styles.heroPrompt, { color: hexToRgba(colors.card, 0.82) }]}>
                {activeScenario
                  ? `Current thread: ${activeScenario.title}`
                  : 'Open a conversation to start planning, scanning or asking Finpal anything.'}
              </Text>
            </View>
            <View
              style={[
                styles.heroAvatar,
                { backgroundColor: hexToRgba(colors.card, 0.14) },
              ]}
            >
              <MaterialIcons name="forum" size={28} color={colors.card} />
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <View
              style={[
                styles.heroPill,
                { backgroundColor: hexToRgba(colors.card, 0.14) },
              ]}
            >
              <MaterialIcons name="chat-bubble-outline" size={14} color={colors.card} />
              <Text style={[styles.heroPillText, { color: colors.card }]}>
                {assistantScenarios.length} demo threads
              </Text>
            </View>
            <View
              style={[
                styles.heroPill,
                { backgroundColor: hexToRgba(colors.card, 0.14) },
              ]}
            >
              <MaterialIcons name="workspace-premium" size={14} color={colors.card} />
              <Text style={[styles.heroPillText, { color: colors.card }]}>
                {assistantSettings.plan === 'pro' ? 'Pro plan' : 'Free plan'}
              </Text>
            </View>
          </View>

          <View style={styles.heroButtonRow}>
            <ThemeButton
              title={activeScenario ? 'Continue active chat' : 'Open first chat'}
              onPress={() => {
                const target = activeScenario?.id ?? assistantScenarios[0]?.id ?? 'overview';
                selectAssistantScenario(target);
                router.push({
                  pathname: '/(assistant)/chat/[scenario]',
                  params: { scenario: target },
                });
              }}
              colorBackground={colors.card}
              colorText={colors.primaryDark}
              style={styles.heroButton}
            />
            <ThemeButton
              title={assistantSettings.plan === 'pro' ? 'Manage plan' : 'Upgrade'}
              onPress={() => router.push('/(assistant)/upgrade')}
              colorBackground={hexToRgba(colors.card, 0.14)}
              colorText={colors.card}
              style={[styles.heroButton, styles.heroOutlineButton]}
            />
          </View>
        </AssistantCard>

        <AssistantCard>
          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent conversations</Text>
            <Text style={[styles.sectionCaption, { color: hexToRgba(colors.text, 0.44) }]}>
              Tap a thread to open the full conversation view
            </Text>
          </View>

          <View style={styles.threadList}>
            {sortedScenarios.map((scenario) => {
              const selected = scenario.id === activeScenarioId;
              const preview = getScenarioPreview(scenario.messages);
              const meta =
                [...scenario.messages].reverse().find((item) => item.meta)?.meta ?? 'Now';

              return (
                <Pressable
                  key={scenario.id}
                  style={[
                    styles.threadRow,
                    {
                      backgroundColor: selected
                        ? hexToRgba(colors.primaryDark, 0.08)
                        : colors.backgroundSoft,
                      borderColor: selected
                        ? hexToRgba(colors.primaryDark, 0.14)
                        : hexToRgba(colors.primaryDark, 0.06),
                    },
                  ]}
                  onPress={() => {
                    selectAssistantScenario(scenario.id);
                    router.push({
                      pathname: '/(assistant)/chat/[scenario]',
                      params: { scenario: scenario.id },
                    });
                  }}
                >
                  <View
                    style={[
                      styles.threadIcon,
                      { backgroundColor: hexToRgba(scenario.accent, 0.14) },
                    ]}
                  >
                    <MaterialIcons name={scenario.icon} size={20} color={scenario.accent} />
                  </View>

                  <View style={styles.threadCopy}>
                    <View style={styles.threadHeader}>
                      <Text style={[styles.threadTitle, { color: colors.text }]}>
                        {scenario.title}
                      </Text>
                      <Text style={[styles.threadMeta, { color: hexToRgba(colors.text, 0.4) }]}>
                        {meta}
                      </Text>
                    </View>

                    <Text
                      numberOfLines={2}
                      style={[styles.threadPreview, { color: hexToRgba(colors.text, 0.56) }]}
                    >
                      {preview}
                    </Text>

                    <View style={styles.threadFooter}>
                      <View
                        style={[
                          styles.threadTag,
                          { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                        ]}
                      >
                        <Text style={[styles.threadTagText, { color: colors.primaryDark }]}>
                          {scenario.chipLabel}
                        </Text>
                      </View>
                      {selected ? (
                        <View
                          style={[
                            styles.threadTag,
                            { backgroundColor: hexToRgba(colors.success, 0.14) },
                          ]}
                        >
                          <Text style={[styles.threadTagText, { color: colors.success }]}>
                            Active
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <MaterialIcons name="chevron-right" size={24} color={hexToRgba(colors.text, 0.36)} />
                </Pressable>
              );
            })}
          </View>
        </AssistantCard>
      </View>
    </ScrollView>
  );
}

function getScenarioPreview(messages: { text?: string; card?: AssistantMessageCard }[]) {
  const textMessage = [...messages].reverse().find((message) => message.text?.trim());

  if (textMessage?.text) {
    return textMessage.text;
  }

  const card = [...messages].reverse().find((message) => message.card)?.card;

  if (!card) {
    return 'Open this thread to continue the conversation.';
  }

  switch (card.type) {
    case 'budget':
      return 'Budget snapshot with spending, savings and category breakdown.';
    case 'subscriptions':
      return 'Subscription review with possible cancellations and monthly totals.';
    case 'actions':
      return card.title;
    case 'calendar':
      return card.footer;
    case 'confirmation':
      return card.summary;
    case 'transaction':
      return card.title;
    case 'quote':
      return card.body;
    case 'bar-chart':
      return card.title;
    case 'projection':
      return card.targetLabel;
    case 'resource':
      return card.caption;
    case 'map':
      return card.detail;
    case 'receipt':
      return `${card.fileName} ready to import into chat.`;
    default:
      return 'Open this thread to continue the conversation.';
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 42,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 18,
    gap: 16,
  },
  introScreen: {
    flex: 1,
  },
  introOrbLarge: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  introOrbSmall: {
    position: 'absolute',
    bottom: 160,
    left: -28,
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  introContent: {
    flex: 1,
    paddingTop: 82,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  introArtwork: {
    height: 280,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  introArtworkHalo: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  introIconShell: {
    width: 110,
    height: 110,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introBadgeRow: {
    marginTop: 26,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 28,
  },
  introBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  introBadgeText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  introTitle: {
    marginTop: 34,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '800',
  },
  introBody: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 25,
  },
  introDots: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  introDot: {
    height: 8,
    borderRadius: 999,
  },
  introButton: {
    marginTop: 30,
    width: '100%',
  },
  introSkip: {
    marginTop: 16,
    fontSize: Typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: Typography.body,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerTitle: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
  },
  headerBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 23,
  },
  heroCard: {
    borderWidth: 0,
    gap: 18,
    shadowColor: 'rgba(15,23,42,0.14)',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 14,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
  },
  heroPrompt: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 22,
  },
  heroAvatar: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroPillText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  heroButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroButton: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
  },
  heroOutlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  sectionHeading: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionCaption: {
    fontSize: Typography.body,
    lineHeight: 19,
  },
  threadList: {
    marginTop: 16,
    gap: 12,
  },
  threadRow: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  threadIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadCopy: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  threadTitle: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: '800',
  },
  threadMeta: {
    fontSize: Typography.body,
    fontWeight: '700',
    flexShrink: 0,
  },
  threadPreview: {
    fontSize: Typography.body,
    lineHeight: 19,
  },
  threadFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  threadTag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  threadTagText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
});
