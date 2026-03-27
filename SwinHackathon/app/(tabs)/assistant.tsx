import { ThemeButton } from '@/components/ThemeButton';
import {
  advisorPrimaryRecommendation,
} from '@/components/assistant/advisor-data';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  AssistantCard as AssistantMessageCard,
  assistantIntroSlides,
  assistantScenarios,
} from '@/components/assistant/mock-data';
import {
  ProductDisclosure,
  ProductMetricTile,
  ProductRow,
  ProductSectionHeader,
  ProductStatusChip,
  ProductSurfaceCard,
} from '@/components/shared/ProductSurface';
import { Typography } from '@/constants/theme';
import { useIntroPreferences } from '@/context/introPreferencesContext';
import { useAssistant } from '@/hooks/use-assistant';
import { useResponsive } from '@/hooks/use-responsive';
import { useTabBarClearance } from '@/hooks/use-tab-bar-clearance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AssistantTabScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const pushRoute = (route: string) => router.push(route as never);
  const { isSmallPhone } = useResponsive();
  const { tabBarFloatingClearance } = useTabBarClearance();
  const {
    hasSeenAssistantIntro,
    isIntroPreferencesReady,
    markAssistantIntroSeen,
  } = useIntroPreferences();
  const {
    activeScenarioId,
    assistantSettings,
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

  const primaryAction = advisorPrimaryRecommendation.actions[0];
  const secondaryAction = advisorPrimaryRecommendation.actions[1];
  const visibleThreads = sortedScenarios.slice(0, 3);

  if (!isIntroPreferencesReady) {
    return <View style={[styles.introScreen, { backgroundColor: colors.backgroundSoft }]} />;
  }

  if (!hasSeenAssistantIntro) {
    const slide = assistantIntroSlides[introIndex];
    const isLastSlide = introIndex === assistantIntroSlides.length - 1;

    return (
      <ScrollView
        style={[styles.introScreen, { backgroundColor: colors.backgroundSoft }]}
        contentContainerStyle={[
          styles.introScrollContent,
          { paddingBottom: Math.max(tabBarFloatingClearance, 148) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.introOrbLarge, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]} />
        <View style={[styles.introOrbSmall, { backgroundColor: hexToRgba(colors.success, 0.16) }]} />

        <View style={styles.introContent}>
          <View
            style={[
              styles.introArtwork,
              { backgroundColor: isLastSlide ? colors.darkBackground : colors.primaryDark },
            ]}
          >
            <View style={[styles.introArtworkHalo, { backgroundColor: hexToRgba(colors.card, 0.14) }]} />
            <View style={[styles.introIconShell, { backgroundColor: colors.card }]}>
              <MaterialIcons
                name={slide.icon}
                size={54}
                color={isLastSlide ? colors.warning : colors.primaryDark}
              />
            </View>
            <View style={styles.introBadgeRow}>
              {['Explainability', 'Backtests', 'OCR', 'Alerts'].map((item) => (
                <View
                  key={item}
                  style={[styles.introBadge, { backgroundColor: hexToRgba(colors.card, 0.14) }]}
                >
                  <Text style={[styles.introBadgeText, { color: colors.card }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={[styles.introTitle, { color: colors.text }]}>{slide.title}</Text>
          <Text style={[styles.introBody, { color: hexToRgba(colors.text, 0.64) }]}>{slide.body}</Text>

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
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(tabBarFloatingClearance, 152) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>ADVISOR WORKSPACE</Text>
            <Text style={[styles.headerTitle, { color: colors.text }, isSmallPhone && styles.headerTitleCompact]}>
              Recommendation first.
            </Text>
          </View>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.card, borderColor: hexToRgba(colors.primaryDark, 0.08) }]}
            onPress={() => router.push('/(assistant)/settings')}
          >
            <MaterialIcons name="tune" size={20} color={colors.text} />
          </Pressable>
        </View>

        <ProductSurfaceCard style={[styles.heroCard, { backgroundColor: colors.primaryDark, borderColor: 'transparent' }]}>
          <View style={[styles.heroTop, isSmallPhone && styles.heroTopCompact]}>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroTitle, { color: colors.card }]}>
                {assistantSettings.aiCompanionName}
              </Text>
              <Text style={[styles.heroSummary, { color: hexToRgba(colors.card, 0.82) }]}>
                {advisorPrimaryRecommendation.summary}
              </Text>
            </View>
            <View style={[styles.heroAvatar, { backgroundColor: hexToRgba(colors.card, 0.14) }]}>
              <MaterialIcons name="smart-toy" size={26} color={colors.card} />
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            {[
              { label: 'Fresh now', icon: 'schedule' as const },
              { label: 'Suitability on', icon: 'verified-user' as const },
            ].map((item) => (
              <View
                key={item.label}
                style={[styles.heroMetaChip, { backgroundColor: hexToRgba(colors.card, 0.14), borderColor: hexToRgba(colors.card, 0.18) }]}
              >
                <MaterialIcons name={item.icon} size={14} color={colors.card} />
                <Text style={[styles.heroMetaLabel, { color: colors.card }]}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.heroActions, isSmallPhone && styles.heroActionsCompact]}>
            <ThemeButton
              title={primaryAction.label}
              onPress={() => primaryAction.route && pushRoute(primaryAction.route)}
              colorBackground={colors.card}
              colorText={colors.primaryDark}
              style={styles.heroButton}
            />
            <ThemeButton
              title="Open thread"
              onPress={() => {
                const target = activeScenario?.id ?? assistantScenarios[0]?.id ?? 'overview';
                selectAssistantScenario(target);
                router.push({
                  pathname: '/(assistant)/chat/[scenario]',
                  params: { scenario: target },
                });
              }}
              colorBackground={hexToRgba(colors.card, 0.26)}
              colorText={colors.card}
              style={[styles.heroButton, styles.heroOutlineButton]}
            />
          </View>
        </ProductSurfaceCard>

        <ProductSurfaceCard>
          <ProductSectionHeader
            title={advisorPrimaryRecommendation.recommendationLabel}
            actionLabel={secondaryAction.label}
            onPress={() => secondaryAction.route && pushRoute(secondaryAction.route)}
          />

          <Text style={[styles.recommendationTitle, { color: colors.text }]}>
            {advisorPrimaryRecommendation.title}
          </Text>

          <View style={styles.signalChipRow}>
            <ProductStatusChip label={advisorPrimaryRecommendation.confidenceLabel} tone="primaryDark" icon="insights" />
            <ProductStatusChip label="Near-term goals first" tone="warning" icon="flag" />
          </View>

          <View style={styles.metricRow}>
            <ProductMetricTile
              label="Why now"
              value="Near-term goals first"
              tone="primaryDark"
            />
            <ProductMetricTile
              label="Updated"
              value={advisorPrimaryRecommendation.freshness.updatedAt}
              tone="success"
            />
          </View>

          <ThemeButton
            title="Open goal impact"
            onPress={() => pushRoute('/(assistant)/goal-impacts')}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.impactButton}
          />
        </ProductSurfaceCard>

        <ProductSurfaceCard>
          <ProductSectionHeader title="Safety checks" meta="Before you act" />

          <View style={styles.rowStack}>
            {advisorPrimaryRecommendation.guardrails.map((item) => {
              return (
                <ProductRow
                  key={item.id}
                  title={item.title}
                  meta={item.severity === 'info' ? 'Info' : 'Warning'}
                  body={item.nextStep ?? item.body}
                  icon={item.severity === 'blocked' ? 'block' : 'verified-user'}
                  tone={item.severity === 'info' ? 'primaryDark' : item.severity === 'warning' ? 'warning' : 'error'}
                  bodyNumberOfLines={2}
                />
              );
            })}
          </View>

          <ProductDisclosure
            title="Risks & alternatives"
            summary="Caution details and safer paths."
            meta={`${advisorPrimaryRecommendation.riskWarnings.length} risks • ${advisorPrimaryRecommendation.alternatives.length} alternatives`}
          >
            <View style={styles.rowStack}>
              {advisorPrimaryRecommendation.riskWarnings.map((warning, index) => (
                <ProductRow
                  key={warning.id}
                  title={warning.title}
                  meta={warning.level === 'high' ? 'High' : 'Moderate'}
                  body={warning.body}
                  icon="warning-amber"
                  tone={warning.level === 'high' ? 'error' : 'warning'}
                  bodyNumberOfLines={2}
                  divider={index < advisorPrimaryRecommendation.riskWarnings.length - 1}
                />
              ))}
            </View>

            <View style={styles.rowStack}>
              {advisorPrimaryRecommendation.alternatives.map((item, index) => (
                <ProductRow
                  key={item.id}
                  title={item.title}
                  meta={item.suitability}
                  body={item.body}
                  icon="alt-route"
                  tone="primaryDark"
                  bodyNumberOfLines={1}
                  divider={index < advisorPrimaryRecommendation.alternatives.length - 1}
                  onPress={() => item.route && pushRoute(item.route)}
                />
              ))}
            </View>
          </ProductDisclosure>
        </ProductSurfaceCard>

        <ProductSurfaceCard>
          <ProductSectionHeader title="Recent conversations" meta="Secondary" />

          <View style={styles.rowStack}>
            {visibleThreads.map((scenario, index) => {
              const preview = getScenarioPreview(scenario.messages);
              const meta =
                [...scenario.messages].reverse().find((item) => item.meta)?.meta ?? 'Now';

              return (
                <ProductRow
                  key={scenario.id}
                  title={scenario.title}
                  meta={meta}
                  body={preview}
                  icon="forum"
                  tone={scenario.id === activeScenarioId ? 'primaryDark' : 'neutral'}
                  titleNumberOfLines={1}
                  bodyNumberOfLines={1}
                  metaNumberOfLines={1}
                  divider={index < visibleThreads.length - 1}
                  onPress={() => {
                    selectAssistantScenario(scenario.id);
                    router.push({
                      pathname: '/(assistant)/chat/[scenario]',
                      params: { scenario: scenario.id },
                    });
                  }}
                />
              );
            })}
          </View>
        </ProductSurfaceCard>
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
    return 'Open this thread to continue.';
  }

  switch (card.type) {
    case 'budget':
      return 'Budget snapshot ready.';
    case 'subscriptions':
      return 'Subscription review ready.';
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
      return `${card.fileName} ready to review.`;
    default:
      return 'Open this thread to continue.';
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 46,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 18,
    gap: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerTitleCompact: {
    fontSize: 25,
    lineHeight: 29,
  },
  headerBody: {
    fontSize: Typography.body,
    lineHeight: 19,
    maxWidth: 320,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    gap: 14,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTopCompact: {
    flexDirection: 'column',
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroSummary: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
  },
  heroAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroMetaChip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaLabel: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroActionsCompact: {
    flexDirection: 'column',
  },
  heroButton: {
    flex: 1,
  },
  heroOutlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  recommendationTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  signalChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  impactButton: {
    marginTop: 2,
  },
  rowStack: {
    gap: 0,
  },
  introScreen: {
    flex: 1,
  },
  introScrollContent: {
    flexGrow: 1,
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
    flexGrow: 1,
    paddingTop: 82,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 560,
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
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introBadgeRow: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  introBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  introBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  introTitle: {
    marginTop: 32,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  introBody: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  introDots: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  introDot: {
    height: 8,
    borderRadius: 999,
  },
  introButton: {
    marginTop: 28,
  },
  introSkip: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
