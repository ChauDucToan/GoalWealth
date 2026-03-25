import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { useIntroPreferences } from '@/context/introPreferencesContext';
import {
  subscriptionCalendar,
  subscriptionIntroHighlights,
  subscriptionInsights,
  subscriptionItems,
  subscriptionRecommendations,
  type SubscriptionItem,
  type SubscriptionTone,
} from '@/components/finance/subscription-data';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function toneColor(colors: ReturnType<typeof useTheme>['colors'], tone: SubscriptionTone) {
  return colors[tone];
}

function SubscriptionIcon({
  item,
}: {
  item: SubscriptionItem;
}) {
  const { colors } = useTheme();
  const accent = toneColor(colors, item.tone);

  return (
    <View style={[styles.subscriptionIcon, { backgroundColor: hexToRgba(accent, 0.12) }]}>
      <MaterialIcons name={item.icon} size={20} color={accent} />
    </View>
  );
}

export default function SubscriptionsScreen() {
  const { colors } = useTheme();
  const { isSmallPhone, scaleFont } = useResponsive();
  const router = useRouter();
  const {
    hasSeenSubscriptionIntro,
    isIntroPreferencesReady,
    markSubscriptionIntroSeen,
  } = useIntroPreferences();
  const activeSubscriptions = subscriptionItems.filter((item) => item.status === 'Active');
  const monthlySpend = activeSubscriptions.reduce((sum, item) => sum + item.amount, 0);
  const yearlyProjection = monthlySpend * 12;
  const pausedCount = subscriptionItems.filter((item) => item.status === 'Paused').length;
  const visibleInsights = [subscriptionInsights[0], subscriptionInsights[2]].filter(Boolean);
  const latestCharges = subscriptionItems.flatMap((item) =>
    item.charges.slice(0, 1).map((charge) => ({
      ...charge,
      subscriptionName: item.name,
      tone: item.tone,
      icon: item.icon,
    }))
  );

  if (!isIntroPreferencesReady) {
    return (
      <FinanceScreen
        title="Subscription Management"
        subtitle="Track recurring plans, payment dates and optimization opportunities"
      >
        <View />
      </FinanceScreen>
    );
  }

  if (!hasSeenSubscriptionIntro) {
    return (
      <FinanceScreen
        title="Subscription Management"
        subtitle="Manage your subscriptions all in one place"
      >
        <View style={styles.stack}>
          <FinanceCard
            style={[
              styles.introCard,
              {
                backgroundColor: hexToRgba(colors.success, 0.1),
                borderColor: hexToRgba(colors.success, 0.16),
              },
            ]}
          >
            <View style={styles.introArtwork}>
              <View
                style={[
                  styles.introOrbLarge,
                  { backgroundColor: hexToRgba(colors.success, 0.14) },
                ]}
              />
              <View
                style={[
                  styles.introOrbSmall,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.12) },
                ]}
              />
              <View style={[styles.introMonitor, { backgroundColor: colors.card }]}>
                <View
                  style={[
                    styles.introMonitorBar,
                    { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                  ]}
                >
                  <View style={[styles.introDot, { backgroundColor: colors.success }]} />
                  <View
                    style={[
                      styles.introDot,
                      { backgroundColor: hexToRgba(colors.primaryDark, 0.22) },
                    ]}
                  />
                </View>
                <View style={styles.introChartRow}>
                  <View
                    style={[
                      styles.introChartColumn,
                      {
                        height: 28,
                        backgroundColor: hexToRgba(colors.primaryDark, 0.18),
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.introChartColumn,
                      {
                        height: 48,
                        backgroundColor: hexToRgba(colors.success, 0.82),
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.introChartColumn,
                      {
                        height: 38,
                        backgroundColor: hexToRgba(colors.warning, 0.82),
                      },
                    ]}
                  />
                </View>
              </View>
              <View
                style={[
                  styles.introBadge,
                  { backgroundColor: colors.success, borderColor: hexToRgba(colors.success, 0.2) },
                ]}
              >
                <MaterialIcons name="subscriptions" size={16} color={colors.card} />
                <Text style={[styles.introBadgeText, { color: colors.card }]}>New</Text>
              </View>
            </View>

            <Text style={[styles.introTitle, { color: colors.text }]}>
              Manage your subscriptions all in one place
            </Text>
            <Text style={[styles.introBody, { color: hexToRgba(colors.text, 0.58) }]}>
              Track recurring payments, review upcoming renewals, and open any plan without
              jumping through multiple setup screens.
            </Text>

            <View style={styles.introHighlightStack}>
              {subscriptionIntroHighlights.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.introHighlightRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: hexToRgba(colors.primaryDark, 0.08),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.introHighlightIcon,
                      { backgroundColor: hexToRgba(colors[item.tone], 0.12) },
                    ]}
                  >
                    <MaterialIcons name={item.icon} size={18} color={colors[item.tone]} />
                  </View>
                  <View style={styles.introHighlightCopy}>
                    <Text style={[styles.introHighlightTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.introHighlightBody,
                        { color: hexToRgba(colors.text, 0.54) },
                      ]}
                    >
                      {item.body}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.introActions}>
              <ThemeButton
                title="Create Subscription"
                onPress={() => {
                  markSubscriptionIntroSeen();
                  router.push('/(finance)/subscription-add');
                }}
                colorBackground={colors.success}
                colorText={colors.card}
                style={styles.introButton}
              />
              <ThemeButton
                title="Open Existing Plan"
                onPress={() => {
                  markSubscriptionIntroSeen();
                  router.push({
                    pathname: '/(finance)/subscription/[id]',
                    params: { id: 'select' },
                  });
                }}
                colorBackground={colors.card}
                colorText={colors.text}
                style={[styles.introButton, styles.introOutlineButton, { borderColor: colors.border }]}
              />
            </View>

            <Pressable
              style={styles.introSkipWrap}
              onPress={markSubscriptionIntroSeen}
            >
              <Text style={[styles.introSkip, { color: colors.primaryDark }]}>Skip and open dashboard</Text>
            </Pressable>
          </FinanceCard>
        </View>
      </FinanceScreen>
    );
  }

  return (
    <FinanceScreen
      title="Subscription Management"
      subtitle="Track recurring plans, payment dates and optimization opportunities"
      rightAccessory={
        <Pressable
          style={[
            styles.headerAction,
            {
              backgroundColor: colors.card,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
          onPress={() => router.push('/(finance)/subscription-add')}
        >
          <MaterialIcons name="add" size={20} color={colors.primaryDark} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.success, 0.12),
              borderColor: hexToRgba(colors.success, 0.16),
            },
          ]}
        >
          <View style={[styles.heroHeader, isSmallPhone && styles.heroHeaderCompact]}>
            <View style={styles.heroCopy}>
              <View
                style={[
                  styles.heroPill,
                  { backgroundColor: hexToRgba(colors.card, 0.74) },
                ]}
              >
                <MaterialIcons name="subscriptions" size={16} color={colors.success} />
                <Text
                  style={[
                    styles.heroPillText,
                    {
                      color: colors.success,
                      fontSize: scaleFont(isSmallPhone ? 13 : Typography.body, 0.76),
                    },
                  ]}
                >
                  Subscription control center
                </Text>
              </View>
              <Text
                style={[
                  styles.heroValue,
                  {
                    color: colors.text,
                    fontSize: scaleFont(isSmallPhone ? 30 : 34, 0.68),
                  },
                ]}
              >
                {formatCurrency(monthlySpend)}
              </Text>
              <Text style={[styles.heroLabel, { color: hexToRgba(colors.text, 0.6) }]}>
                monthly recurring spend across {activeSubscriptions.length} active services
              </Text>
            </View>

            <View
              style={[
                styles.heroBadge,
                isSmallPhone && styles.heroBadgeCompact,
                { backgroundColor: colors.card, borderColor: hexToRgba(colors.success, 0.18) },
              ]}
            >
              <Text style={[styles.heroBadgeValue, { color: colors.text }]}>
                {formatCurrency(yearlyProjection)}
              </Text>
              <Text style={[styles.heroBadgeLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                yearly projection
              </Text>
            </View>
          </View>

          <ResponsiveGrid
            minItemWidth={isSmallPhone ? 112 : 122}
            horizontalPadding={isSmallPhone ? 12 : 34}
            gap={10}
            maxColumns={isSmallPhone ? 2 : 3}
            style={styles.heroMetricsGrid}
          >
            <View style={[styles.heroMetricCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMetricValue, { color: colors.success }]}>
                {activeSubscriptions.length}
              </Text>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.text, 0.58) }]}>
                Active plans
              </Text>
            </View>
            <View style={[styles.heroMetricCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMetricValue, { color: colors.warning }]}>
                {pausedCount}
              </Text>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.text, 0.58) }]}>
                Paused
              </Text>
            </View>
            <View style={[styles.heroMetricCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMetricValue, { color: colors.primaryDark }]}>Jun 12</Text>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.text, 0.58) }]}>
                Nearest charge
              </Text>
            </View>
          </ResponsiveGrid>

          <View style={styles.heroButtons}>
            <View style={styles.heroButtonWrap}>
              <ThemeButton
                title="Add Plan"
                onPress={() => router.push('/(finance)/subscription-add')}
                colorBackground={colors.success}
                colorText={colors.card}
                style={styles.heroButton}
                textStyle={isSmallPhone ? styles.heroButtonTextCompact : undefined}
              />
            </View>
            <View style={styles.heroButtonWrap}>
              <ThemeButton
                title="Open Plan"
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/subscription/[id]',
                    params: { id: 'select' },
                  })
                }
                colorBackground={colors.card}
                colorText={colors.text}
                style={styles.heroButton}
                textStyle={isSmallPhone ? styles.heroButtonTextCompact : undefined}
              />
            </View>
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming renewals</Text>
            <Pressable onPress={() => router.push('/(finance)/subscription-upcoming')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>This month</Text>
            </Pressable>
          </View>

          <ResponsiveGrid
            minItemWidth={isSmallPhone ? 240 : 164}
            horizontalPadding={18}
            gap={12}
            maxColumns={isSmallPhone ? 1 : 2}
            style={styles.calendarGrid}
          >
            {subscriptionCalendar.map((item) => {
              const accent = toneColor(colors, item.tone);
              const active = item.status === 'Due today';

              return (
                <View
                  key={item.id}
                  style={[
                    styles.calendarCard,
                    {
                      backgroundColor: active ? hexToRgba(accent, 0.08) : colors.backgroundSoft,
                      borderColor: active ? hexToRgba(accent, 0.18) : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.calendarDateBadge,
                      {
                        backgroundColor: active
                          ? hexToRgba(accent, 0.12)
                          : hexToRgba(accent, 0.08),
                      },
                    ]}
                  >
                    <Text style={[styles.calendarMonth, { color: hexToRgba(colors.text, 0.46) }]}>
                      {item.month}
                    </Text>
                    <Text style={[styles.calendarDay, { color: active ? accent : colors.text }]}>
                      {item.day}
                    </Text>
                  </View>

                  <View style={styles.calendarContent}>
                    <View style={styles.calendarTitleRow}>
                      <Text style={[styles.calendarTitle, { color: colors.text }]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <MaterialIcons
                        name={active ? 'notifications-active' : 'chevron-right'}
                        size={18}
                        color={active ? accent : hexToRgba(colors.text, 0.36)}
                      />
                    </View>

                    <View
                      style={[
                        styles.calendarStatusPill,
                        {
                          backgroundColor: active
                            ? hexToRgba(accent, 0.12)
                            : hexToRgba(colors.primaryDark, 0.06),
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.calendarStatusDot,
                          { backgroundColor: active ? accent : hexToRgba(accent, 0.58) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.calendarStatus,
                          { color: active ? accent : hexToRgba(colors.text, 0.58) },
                        ]}
                        numberOfLines={1}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ResponsiveGrid>
        </FinanceCard>

        <FinanceCard
          style={[
            styles.overviewCard,
            {
              backgroundColor: hexToRgba(colors.primaryDark, 0.05),
              borderColor: hexToRgba(colors.primaryDark, 0.1),
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.overviewHeaderCopy}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Stats & Insights</Text>
            </View>
            <Pressable onPress={() => router.push('/(finance)/subscription-stats')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open</Text>
            </Pressable>
          </View>

          <View style={styles.overviewBody}>
            <View style={[styles.overviewRingPanel, { backgroundColor: colors.card }]}>
              <Text style={[styles.overviewLeadLabel, { color: hexToRgba(colors.text, 0.58) }]}>
                Current monthly load
              </Text>
              <View
                style={[
                  styles.overviewRingShell,
                  {
                    width: isSmallPhone ? 206 : 228,
                    height: isSmallPhone ? 206 : 228,
                    borderRadius: isSmallPhone ? 103 : 114,
                    borderWidth: isSmallPhone ? 16 : 18,
                  },
                  { borderColor: hexToRgba(colors.success, 0.22) },
                ]}
              >
                <View
                  style={[
                    styles.overviewRingProgress,
                    {
                      borderWidth: isSmallPhone ? 16 : 18,
                      borderRadius: isSmallPhone ? 103 : 114,
                    },
                    { borderColor: colors.success, borderRightColor: colors.warning },
                  ]}
                />
                <View
                  style={[
                    styles.overviewRingInner,
                    {
                      width: isSmallPhone ? 136 : 150,
                      height: isSmallPhone ? 136 : 150,
                      borderRadius: isSmallPhone ? 68 : 75,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.overviewRingValue,
                      {
                        color: colors.text,
                        fontSize: scaleFont(isSmallPhone ? 24 : 28, 0.72),
                      },
                    ]}
                  >
                    {formatCurrency(monthlySpend)}
                  </Text>
                  <Text
                    style={[
                      styles.overviewRingCaption,
                      { color: hexToRgba(colors.text, 0.54) },
                    ]}
                  >
                    Monthly spend
                  </Text>
                </View>
              </View>

              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.legendText, { color: hexToRgba(colors.text, 0.58) }]}>
                    {activeSubscriptions.length} active plans
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                  <Text style={[styles.legendText, { color: hexToRgba(colors.text, 0.58) }]}>
                    {pausedCount} paused plan{pausedCount === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.insightsStack, isSmallPhone && styles.insightsStackCompact]}>
              {visibleInsights.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.insightRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: hexToRgba(colors.primaryDark, 0.08),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.insightValue,
                      { color: toneColor(colors, item.tone) },
                    ]}
                  >
                    {item.value}
                  </Text>
                  <Text
                    style={[
                      styles.insightLabel,
                      { color: hexToRgba(colors.text, 0.56) },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
              ))}

              <View
                style={[
                  styles.overviewSummaryCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: hexToRgba(colors.primaryDark, 0.08),
                  },
                ]}
              >
                <Text style={[styles.overviewSummaryValue, { color: colors.primaryDark }]}>
                  {formatCurrency(yearlyProjection)}
                </Text>
                <Text style={[styles.overviewSummaryLabel, { color: hexToRgba(colors.text, 0.56) }]}>
                  yearly subscription projection based on your active plans
                </Text>
              </View>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active subscriptions</Text>
            <Pressable onPress={() => router.push('/(finance)/subscription-add')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Add New</Text>
            </Pressable>
          </View>

          <View style={styles.listStack}>
            {subscriptionItems.map((item) => {
              const accent = toneColor(colors, item.tone);

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.subscriptionCard,
                    { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/(finance)/subscription/[id]',
                      params: { id: item.id },
                    })
                  }
                >
                  <SubscriptionIcon item={item} />

                  <View style={styles.subscriptionCopy}>
                    <View style={styles.subscriptionHeader}>
                      <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
                        {item.name}
                      </Text>
                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor:
                              item.status === 'Active'
                                ? hexToRgba(colors.success, 0.12)
                                : hexToRgba(colors.warning, 0.12),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                item.status === 'Active' ? colors.success : colors.warning,
                            },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.subscriptionMeta, { color: hexToRgba(colors.text, 0.58) }]}>
                      {item.plan} • {item.category}
                    </Text>

                    <View style={styles.subscriptionFooter}>
                      <Text style={[styles.subscriptionDue, { color: hexToRgba(colors.text, 0.52) }]}>
                        {item.nextPayment === 'Paused' ? 'Billing paused' : `Next charge ${item.nextPayment}`}
                      </Text>
                      <Text style={[styles.subscriptionAmount, { color: accent }]}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent payments</Text>
            <Pressable onPress={() => router.push('/(finance)/subscription-payments')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Last 30 days</Text>
            </Pressable>
          </View>

          <View style={styles.listStack}>
            {latestCharges.map((charge) => {
              const accent = toneColor(colors, charge.tone);

              return (
                <View
                  key={charge.id}
                  style={[
                    styles.paymentRow,
                    { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
                  ]}
                >
                  <View style={[styles.paymentIcon, { backgroundColor: hexToRgba(accent, 0.12) }]}>
                    <MaterialIcons name={charge.icon} size={18} color={accent} />
                  </View>
                  <View style={styles.paymentCopy}>
                    <Text style={[styles.paymentTitle, { color: colors.text }]}>
                      {charge.subscriptionName}
                    </Text>
                    <Text style={[styles.paymentMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                      {charge.label} • {charge.date}
                    </Text>
                  </View>
                  <Text style={[styles.paymentAmount, { color: colors.text }]}>
                    {formatCurrency(charge.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard
          style={[
            styles.recommendationCard,
            {
              backgroundColor: hexToRgba(colors.primaryDark, 0.05),
              borderColor: hexToRgba(colors.primaryDark, 0.1),
            },
          ]}
        >
          <Text style={[styles.recommendationTitle, { color: colors.text }]}>
            Recommended next steps
          </Text>
          <View style={styles.recommendationStack}>
            {subscriptionRecommendations.map((item) => (
              <View key={item} style={styles.recommendationRow}>
                <View style={[styles.recommendationDot, { backgroundColor: colors.success }]} />
                <Text
                  style={[
                    styles.recommendationText,
                    { color: hexToRgba(colors.text, 0.72) },
                  ]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
          <ThemeButton
            title="Review subscription history"
            onPress={() => router.push('/(finance)/subscription-history')}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.reviewButton}
          />
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    marginTop: 18,
    gap: 14,
  },
  introCard: {
    borderWidth: 1,
  },
  introArtwork: {
    minHeight: 210,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  introOrbLarge: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: 8,
    left: -28,
  },
  introOrbSmall: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    right: -10,
    bottom: 10,
  },
  introMonitor: {
    width: 210,
    borderRadius: 26,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  introMonitorBar: {
    height: 30,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  introDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  introChartRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 14,
  },
  introChartColumn: {
    width: 28,
    borderRadius: 14,
  },
  introBadge: {
    position: 'absolute',
    right: 8,
    top: 18,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  introBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  introTitle: {
    marginTop: 6,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  introBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  introHighlightStack: {
    marginTop: 22,
    gap: 12,
  },
  introHighlightRow: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  introHighlightIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introHighlightCopy: {
    flex: 1,
    minWidth: 0,
  },
  introHighlightTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  introHighlightBody: {
    marginTop: 4,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  introActions: {
    marginTop: 24,
    gap: 12,
  },
  introButton: {
    width: '100%',
  },
  introOutlineButton: {
    borderWidth: 1,
  },
  introSkipWrap: {
    alignItems: 'center',
    marginTop: 14,
  },
  introSkip: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  heroCard: {
    borderWidth: 1,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 14,
  },
  heroHeaderCompact: {
    flexDirection: 'column',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroPill: {
    alignSelf: 'flex-start',
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
    flexShrink: 1,
  },
  heroValue: {
    marginTop: 16,
    fontSize: 34,
    fontWeight: '800',
  },
  heroLabel: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  heroBadge: {
    minWidth: 140,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroBadgeCompact: {
    width: '100%',
    minWidth: 0,
  },
  heroBadgeValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  heroBadgeLabel: {
    marginTop: 4,
    fontSize: Typography.body,
    lineHeight: 18,
  },
  heroMetricCard: {
    width: '100%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  heroMetricsGrid: {
    marginTop: 16,
  },
  heroMetricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  heroMetricLabel: {
    marginTop: 4,
    fontSize: Typography.body,
    lineHeight: 18,
  },
  heroButtons: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  heroButtonWrap: {
    flex: 1,
    minWidth: 0,
  },
  heroButton: {
    width: '100%',
  },
  heroButtonTextCompact: {
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLink: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  calendarGrid: {
    marginTop: 16,
  },
  calendarCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 88,
  },
  calendarDateBadge: {
    width: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  calendarContent: {
    flex: 1,
    minWidth: 0,
  },
  calendarTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  calendarMonth: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  calendarDay: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '800',
  },
  calendarTitle: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: '700',
    lineHeight: 19,
  },
  calendarStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  calendarStatusPill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  overviewCard: {
    borderWidth: 1,
  },
  overviewHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  overviewBody: {
    marginTop: 18,
    gap: 14,
  },
  overviewLeadLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  overviewRingPanel: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    alignItems: 'center',
  },
  overviewRingShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewRingProgress: {
    ...StyleSheet.absoluteFillObject,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-18deg' }],
  },
  overviewRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewRingValue: {
    fontWeight: '800',
    textAlign: 'center',
  },
  overviewRingCaption: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  legendRow: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  insightsStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  insightsStackCompact: {
    flexDirection: 'column',
  },
  insightRow: {
    flex: 1,
    minWidth: 150,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  insightLabel: {
    marginTop: 4,
    fontSize: Typography.body,
    lineHeight: 18,
  },
  overviewSummaryCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  overviewSummaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  overviewSummaryLabel: {
    marginTop: 4,
    fontSize: Typography.body,
    lineHeight: 18,
  },
  listStack: {
    marginTop: 16,
    gap: 12,
  },
  subscriptionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  subscriptionIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionCopy: {
    flex: 1,
    minWidth: 0,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  subscriptionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  subscriptionMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  subscriptionFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  subscriptionDue: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  subscriptionAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  paymentRow: {
    minHeight: 58,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCopy: {
    flex: 1,
    minWidth: 0,
  },
  paymentTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  paymentMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  paymentAmount: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  recommendationCard: {
    borderWidth: 1,
  },
  recommendationTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  recommendationStack: {
    marginTop: 16,
    gap: 12,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  recommendationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  recommendationText: {
    flex: 1,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  reviewButton: {
    marginTop: 20,
  },
});
