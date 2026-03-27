import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  ProductMetricTile,
  ProductRow,
  ProductSectionHeader,
  ProductStatusChip,
  ProductSurfaceCard,
} from '@/components/shared/ProductSurface';
import { Typography } from '@/constants/theme';
import { useMyUser } from '@/context/myUserContext';
import { useTheme } from '@/hooks/use-theme-colors';
import {
  resolveGoalwealthRecommendationActionRoute,
} from '@/lib/goalwealth-recommendations';
import { useLocalSearchParams, useRouter } from '@/lib/expo-router';
import { normalizeGoalwealthError } from '@/services/api/errors';
import {
  dismissGoalwealthRecommendation,
  getGoalwealthRecommendation,
  undismissGoalwealthRecommendation,
} from '@/services/api/recommendations';
import type { GoalwealthRecommendationDetailItem } from '@/services/api/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

function formatPriority(priority: string) {
  switch (priority) {
    case 'high':
      return 'High priority';
    case 'medium':
      return 'Medium priority';
    case 'low':
      return 'Low priority';
    default:
      return 'Priority';
  }
}

function formatCategory(category: string) {
  switch (category) {
    case 'risk':
      return 'Risk';
    case 'goals':
      return 'Goals';
    case 'documents':
      return 'Documents';
    case 'planning':
      return 'Planning';
    case 'onboarding':
      return 'Profile';
    default:
      return category || 'Recommendation';
  }
}

function toneForItem(item: GoalwealthRecommendationDetailItem) {
  if (item.type === 'warning') {
    return item.priority === 'high' ? 'error' : 'warning';
  }

  switch (item.category) {
    case 'goals':
      return 'success' as const;
    case 'risk':
      return 'warning' as const;
    case 'documents':
      return 'secondary' as const;
    default:
      return 'primaryDark' as const;
  }
}

function iconForItem(item: GoalwealthRecommendationDetailItem) {
  if (item.action.target === '/chat') {
    return 'forum' as const;
  }

  if (item.action.target === '/me') {
    return 'person' as const;
  }

  if (item.action.target === '/risk-profile') {
    return 'analytics' as const;
  }

  if (item.action.target === '/goals') {
    return 'flag' as const;
  }

  if (item.action.target === '/ocr' || item.action.target?.startsWith('/ocr/records')) {
    return 'document-scanner' as const;
  }

  return 'insights' as const;
}

export default function RecommendationDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { state: userState } = useMyUser();
  const params = useLocalSearchParams<{ recommendationId?: string | string[] }>();
  const recommendationId = Array.isArray(params.recommendationId)
    ? params.recommendationId[0]
    : params.recommendationId;
  const [item, setItem] = useState<GoalwealthRecommendationDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRecommendation = useCallback(async () => {
    if (!recommendationId) {
      setItem(null);
      setErrorMessage('Recommendation ID is missing.');
      setIsLoading(false);
      return false;
    }

    if (!userState.accessToken?.trim()) {
      setItem(null);
      setErrorMessage('Sign in is required to load this recommendation.');
      setIsLoading(false);
      return false;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getGoalwealthRecommendation(recommendationId, userState.accessToken);
      setItem(response.data.item);
      setErrorMessage(null);
      return true;
    } catch (error) {
      const normalized = normalizeGoalwealthError(error);
      setItem(null);
      setErrorMessage(normalized.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [recommendationId, userState.accessToken]);

  useEffect(() => {
    let cancelled = false;

    void loadRecommendation().then((loaded) => {
      if (cancelled && loaded) {
        return;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadRecommendation]);

  const isDismissed = item?.status === 'dismissed';

  const handleDismissStateChange = useCallback(async () => {
    if (!recommendationId || !userState.accessToken?.trim() || isMutating) {
      return;
    }

    setIsMutating(true);
    setErrorMessage(null);

    try {
      if (isDismissed) {
        await undismissGoalwealthRecommendation(recommendationId, userState.accessToken);
      } else {
        await dismissGoalwealthRecommendation(recommendationId, userState.accessToken);
      }

      await loadRecommendation();
    } catch (error) {
      const normalized = normalizeGoalwealthError(error);
      setErrorMessage(normalized.message);
    } finally {
      setIsMutating(false);
    }
  }, [
    isDismissed,
    isMutating,
    loadRecommendation,
    recommendationId,
    userState.accessToken,
  ]);

  const primaryRoute = useMemo(() => {
    if (!item) {
      return '/(tabs)/assistant' as const;
    }

    return resolveGoalwealthRecommendationActionRoute(item.action.target);
  }, [item]);

  const secondaryRoutes = useMemo(() => {
    if (!item) {
      return [];
    }

    return item.actions
      .map((action) => ({
        type: typeof action.type === 'string' ? action.type : 'navigate',
        target: resolveGoalwealthRecommendationActionRoute(
          typeof action.target === 'string' ? action.target : item.action.target
        ),
      }))
      .filter((action, index, list) => index === list.findIndex((entry) => entry.target === action.target));
  }, [item]);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable
          style={[
            styles.headerButton,
            { backgroundColor: colors.card, borderColor: hexToRgba(colors.primaryDark, 0.08) },
          ]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>RECOMMENDATION DETAIL</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Explain this recommendation</Text>
        </View>

        <Pressable
          style={[
            styles.headerButton,
            { backgroundColor: colors.card, borderColor: hexToRgba(colors.primaryDark, 0.08) },
          ]}
          onPress={() => router.replace('/(tabs)/assistant')}
        >
          <MaterialIcons name="home" size={22} color={colors.text} />
        </Pressable>
      </View>

      {isLoading ? (
        <ProductSurfaceCard>
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={[styles.centerLabel, { color: hexToRgba(colors.text, 0.6) }]}>
              Loading recommendation detail...
            </Text>
          </View>
        </ProductSurfaceCard>
      ) : null}

      {!isLoading && errorMessage ? (
        <ProductSurfaceCard>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Recommendation unavailable</Text>
          <Text style={[styles.errorBody, { color: hexToRgba(colors.text, 0.58) }]}>
            {errorMessage}
          </Text>
          {recommendationId ? (
            <Text style={[styles.errorMeta, { color: hexToRgba(colors.text, 0.42) }]}>
              ID: {recommendationId}
            </Text>
          ) : null}
        </ProductSurfaceCard>
      ) : null}

      {item ? (
        <>
          <ProductSurfaceCard style={[styles.heroCard, { backgroundColor: colors.primaryDark, borderColor: 'transparent' }]}>
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <Text style={[styles.heroTitle, { color: colors.card }]}>{item.title}</Text>
                <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.82) }]}>
                  {item.message}
                </Text>
              </View>
              <View style={[styles.heroIconWrap, { backgroundColor: hexToRgba(colors.card, 0.14) }]}>
                <MaterialIcons name={iconForItem(item)} size={24} color={colors.card} />
              </View>
            </View>

            <View style={styles.chipRow}>
              <ProductStatusChip label={formatPriority(item.priority)} tone={toneForItem(item)} icon="priority-high" />
              <ProductStatusChip label={formatCategory(item.category)} tone="secondary" icon="category" />
              <ProductStatusChip
                label={isDismissed ? 'Dismissed' : 'Open'}
                tone={isDismissed ? 'neutral' : 'primaryDark'}
                icon={isDismissed ? 'visibility-off' : 'check-circle'}
              />
              {item.confidence ? (
                <ProductStatusChip label={`${item.confidence} confidence`} tone="primaryDark" icon="insights" />
              ) : null}
            </View>

            <View style={styles.metricRow}>
              <ProductMetricTile
                label="Score"
                value={item.score !== null ? `${Math.round(item.score * 100)}%` : 'N/A'}
                helper={item.status}
                tone="success"
              />
              <ProductMetricTile
                label="Updated"
                value={item.updated_at ? 'Just now' : 'Unknown'}
                helper={item.generated_by}
                tone="primaryDark"
              />
            </View>
          </ProductSurfaceCard>

          <ProductSurfaceCard>
            <ProductSectionHeader title="Why this surfaced" meta={item.preview} />
            <Text style={[styles.reasoningText, { color: colors.text }]}>{item.full_reasoning}</Text>
            <View style={styles.rowStack}>
              {item.why.map((reason) => (
                <ProductRow
                  key={reason}
                  title={reason}
                  icon="check-circle"
                  tone="primaryDark"
                  divider={false}
                />
              ))}
            </View>
          </ProductSurfaceCard>

          <ProductSurfaceCard>
            <ProductSectionHeader title="Impact" meta={`${item.impact.length} focus area(s)`} />
            <View style={styles.rowStack}>
              {item.impact.map((impact) => (
                <ProductRow
                  key={impact}
                  title={impact.replaceAll('_', ' ')}
                  icon="flare"
                  tone="warning"
                  divider={false}
                />
              ))}
            </View>
          </ProductSurfaceCard>

          <ProductSurfaceCard>
            <ProductSectionHeader title="Supporting data" meta="Grounded inputs" />
            <View style={styles.rowStack}>
              {Object.entries(item.supporting_data).length ? (
                Object.entries(item.supporting_data).map(([key, value], index, entries) => (
                  <ProductRow
                    key={key}
                    title={key.replaceAll('_', ' ')}
                    body={typeof value === 'string' ? value : JSON.stringify(value)}
                    icon="dataset"
                    tone="secondary"
                    bodyNumberOfLines={2}
                    divider={index < entries.length - 1}
                  />
                ))
              ) : (
                <ProductRow
                  title="No extra supporting data"
                  body="This rule is mostly driven by current user state and summary context."
                  icon="info"
                  tone="neutral"
                  divider={false}
                />
              )}
            </View>
          </ProductSurfaceCard>

          <ProductSurfaceCard>
            <ProductSectionHeader title="Take action" meta="Choose the next move" />
            <View style={styles.actionStack}>
              <ThemeButton
                title="Open recommended action"
                onPress={() => router.push(primaryRoute)}
                colorBackground={colors.primaryDark}
                colorText={colors.card}
              />
              {secondaryRoutes
                .filter((action) => action.target !== primaryRoute)
                .slice(0, 2)
                .map((action) => (
                  <ThemeButton
                    key={`${action.type}-${action.target}`}
                    title={`Open ${action.target === '/(tabs)/assistant' ? 'assistant' : 'related screen'}`}
                    onPress={() => router.push(action.target)}
                    colorBackground={hexToRgba(colors.primaryDark, 0.08)}
                    colorText={colors.primaryDark}
                  />
                ))}
              <ThemeButton
                title={isDismissed ? 'Restore to priorities' : 'Dismiss from priorities'}
                onPress={handleDismissStateChange}
                colorBackground={hexToRgba(colors.primaryDark, 0.08)}
                colorText={colors.primaryDark}
                disabled={isMutating}
              />
              <Text style={[styles.actionHint, { color: hexToRgba(colors.text, 0.54) }]}>
                {isDismissed
                  ? 'This recommendation is hidden from Home for now, but remains available here until you restore it.'
                  : 'Dismissing hides this recommendation from Home. You can still inspect it from this detail screen.'}
              </Text>
            </View>
          </ProductSurfaceCard>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 56,
    paddingHorizontal: 18,
    paddingBottom: 42,
    gap: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 920,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  centerLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  errorBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  errorMeta: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  heroCard: {
    gap: 14,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reasoningText: {
    fontSize: Typography.body,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 10,
  },
  rowStack: {
    gap: 4,
  },
  actionStack: {
    gap: 10,
  },
  actionHint: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
});
