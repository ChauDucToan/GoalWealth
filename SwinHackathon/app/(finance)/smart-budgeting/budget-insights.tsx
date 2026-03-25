import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ColorTheme } from '@/constants/theme';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { budgetInsights } from '@/components/smart-budgeting/data';

const weeklyBars = [42, 68, 54, 80, 63, 59, 71];
const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const cycleDay = 23;
const cycleLength = 31;

export default function BudgetInsightsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { categories, importedReceipts, totalBudget } = useSmartBudgeting();

  const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
  const totalLeft = Number((totalBudget - totalSpent).toFixed(2));
  const usagePercent = Math.min(totalSpent / totalBudget, 1);
  const avgDailySpend = totalSpent / cycleDay;
  const projectedSpend = Number((avgDailySpend * cycleLength).toFixed(2));
  const forecastDelta = Number((projectedSpend - totalBudget).toFixed(2));
  const pressureCategories = [...categories].sort(
    (left, right) => right.spent / right.limit - left.spent / left.limit
  );
  const hottestCategory = pressureCategories[0];
  const highRiskCount = categories.filter((item) => item.spent / item.limit >= 0.85).length;
  const stableCount = categories.filter((item) => item.spent / item.limit < 0.7).length;
  const latestReceipt = importedReceipts[0];
  const forecastLabel =
    forecastDelta > 0
      ? `Projected overspend $${Math.abs(forecastDelta).toFixed(0)}`
      : `Projected buffer $${Math.abs(forecastDelta).toFixed(0)}`;

  return (
    <FinanceScreen
      title="Budget Insights"
      subtitle="Live pacing, category pressure and the next corrective moves."
      contentStyle={styles.contentStyle}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(finance)/smart-budgeting/monthly-budget')}
        >
          <MaterialIcons name="pie-chart-outline" size={20} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.72) }]}>MONTHLY OUTLOOK</Text>
              <Text style={[styles.heroTitle, { color: colors.card }]}>
                {forecastDelta > 0 ? 'Spending is drifting above pace.' : 'The month is still inside a healthy pace.'}
              </Text>
            </View>
            <View
              style={[
                styles.forecastBadge,
                { backgroundColor: hexToRgba(colors.card, 0.12), borderColor: hexToRgba(colors.card, 0.18) },
              ]}
            >
              <MaterialIcons name={forecastDelta > 0 ? 'trending-up' : 'task-alt'} size={16} color={colors.card} />
              <Text style={[styles.forecastBadgeText, { color: colors.card }]}>{forecastLabel}</Text>
            </View>
          </View>

          <View style={styles.heroMetrics}>
            <View style={[styles.heroMetricCard, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.card, 0.72) }]}>Spent so far</Text>
              <Text style={[styles.heroMetricValue, { color: colors.card }]}>${totalSpent.toFixed(2)}</Text>
              <Text style={[styles.heroMetricMeta, { color: hexToRgba(colors.card, 0.72) }]}>
                {Math.round(usagePercent * 100)}% of total budget
              </Text>
            </View>
            <View style={[styles.heroMetricCard, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <Text style={[styles.heroMetricLabel, { color: hexToRgba(colors.card, 0.72) }]}>Projected finish</Text>
              <Text style={[styles.heroMetricValue, { color: colors.card }]}>${projectedSpend.toFixed(0)}</Text>
              <Text style={[styles.heroMetricMeta, { color: hexToRgba(colors.card, 0.72) }]}>
                ${avgDailySpend.toFixed(0)}/day average pace
              </Text>
            </View>
          </View>

          <View style={styles.chartWrap}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.card }]}>Weekly trend</Text>
              <Text style={[styles.chartMeta, { color: hexToRgba(colors.card, 0.72) }]}>Last 7 days</Text>
            </View>
            <View style={styles.barRow}>
              {weeklyBars.map((value, index) => (
                <View key={`${weekLabels[index]}-${index}`} style={styles.barColumn}>
                  <View style={[styles.barTrack, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: 22 + value,
                          backgroundColor:
                            index === 3 || index === weeklyBars.length - 1
                              ? colors.card
                              : hexToRgba(colors.card, 0.36),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: hexToRgba(colors.card, 0.72) }]}>
                    {weekLabels[index]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </FinanceCard>

        <View style={styles.kpiRow}>
          <FinanceCard style={styles.kpiCard}>
            <Text style={[styles.kpiLabel, { color: hexToRgba(colors.text, 0.52) }]}>Budget left</Text>
            <Text style={[styles.kpiValue, { color: colors.text }]}>${totalLeft.toFixed(0)}</Text>
            <Text style={[styles.kpiMeta, { color: colors.primaryDark }]}>Available to reallocate</Text>
          </FinanceCard>
          <FinanceCard style={styles.kpiCard}>
            <Text style={[styles.kpiLabel, { color: hexToRgba(colors.text, 0.52) }]}>High pressure</Text>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{highRiskCount}</Text>
            <Text style={[styles.kpiMeta, { color: colors.error }]}>Categories above 85%</Text>
          </FinanceCard>
          <FinanceCard style={styles.kpiCard}>
            <Text style={[styles.kpiLabel, { color: hexToRgba(colors.text, 0.52) }]}>Stable zones</Text>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{stableCount}</Text>
            <Text style={[styles.kpiMeta, { color: colors.success }]}>Categories below 70%</Text>
          </FinanceCard>
        </View>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Category pressure</Text>
            <Pressable onPress={() => router.push('/(finance)/smart-budgeting/manage-categories')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Manage</Text>
            </Pressable>
          </View>

          <View style={[styles.focusPanel, { backgroundColor: hexToRgba(hottestCategory?.accent ?? colors.primaryDark, 0.08) }]}>
            <View style={[styles.focusIcon, { backgroundColor: hexToRgba(hottestCategory?.accent ?? colors.primaryDark, 0.14) }]}>
              <MaterialIcons
                name={(hottestCategory?.icon as React.ComponentProps<typeof MaterialIcons>['name']) ?? 'priority-high'}
                size={18}
                color={hottestCategory?.accent ?? colors.primaryDark}
              />
            </View>
            <View style={styles.focusCopy}>
              <Text style={[styles.focusTitle, { color: colors.text }]}>
                {hottestCategory?.name ?? 'Top category'} needs the closest watch
              </Text>
              <Text style={[styles.focusBody, { color: hexToRgba(colors.text, 0.56) }]}>
                ${hottestCategory?.spent.toFixed(0) ?? '0'} of ${hottestCategory?.limit.toFixed(0) ?? '0'} is already used.
                This category is carrying the most pressure right now.
              </Text>
            </View>
            <Text style={[styles.focusPercent, { color: hottestCategory && hottestCategory.spent / hottestCategory.limit >= 0.85 ? colors.error : colors.primaryDark }]}>
              {hottestCategory ? `${Math.round((hottestCategory.spent / hottestCategory.limit) * 100)}%` : '--'}
            </Text>
          </View>

          <View style={styles.categoryList}>
            {pressureCategories.slice(0, 4).map((item) => {
              const ratio = item.spent / item.limit;
              const tone = ratio >= 0.85 ? colors.error : ratio >= 0.7 ? colors.warning : colors.primaryDark;

              return (
                <View key={item.id} style={styles.categoryRow}>
                  <View style={styles.categoryHead}>
                    <View style={[styles.categoryDot, { backgroundColor: item.accent }]} />
                    <View style={styles.categoryCopy}>
                      <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.categoryMeta, { color: hexToRgba(colors.text, 0.5) }]}>
                        ${item.spent.toFixed(0)} spent of ${item.limit.toFixed(0)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={[styles.categoryPercent, { color: tone }]}>{Math.round(ratio * 100)}%</Text>
                    <View style={[styles.track, { backgroundColor: hexToRgba(item.accent, 0.12) }]}>
                      <View style={[styles.fill, { width: `${Math.min(ratio * 100, 100)}%`, backgroundColor: item.accent }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended moves</Text>
            {latestReceipt ? (
              <Text style={[styles.sectionCaption, { color: hexToRgba(colors.text, 0.46) }]}>
                Updated after latest receipt
              </Text>
            ) : null}
          </View>

          <View style={styles.alertStack}>
            {budgetInsights.map((item) => {
              const tone =
                item.tone === 'warning'
                  ? colors.warning
                  : item.tone === 'success'
                    ? colors.success
                    : colors.primaryDark;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.alertRow,
                    { backgroundColor: hexToRgba(tone, 0.08), borderColor: hexToRgba(tone, 0.14) },
                  ]}
                >
                  <View style={[styles.alertIcon, { backgroundColor: hexToRgba(tone, 0.14) }]}>
                    <MaterialIcons
                      name={
                        item.tone === 'warning'
                          ? 'priority-high'
                          : item.tone === 'success'
                            ? 'trending-down'
                            : 'lightbulb'
                      }
                      size={18}
                      color={tone}
                    />
                  </View>
                  <View style={styles.alertCopy}>
                    <Text style={[styles.alertTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.alertBody, { color: hexToRgba(colors.text, 0.56) }]}>{item.body}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </FinanceCard>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => router.push('/(finance)/smart-budgeting/monthly-budget')}
          >
            <MaterialIcons name="pie-chart-outline" size={18} color={colors.card} />
            <Text style={[styles.actionButtonText, { color: colors.card }]}>Open Monthly Budget</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.actionButtonSecondary, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(finance)/smart-budgeting/setup/receipt-gallery')}
          >
            <MaterialIcons name="receipt-long" size={18} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Import Receipt</Text>
          </Pressable>
        </View>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    headerAction: {
      width: 38,
      height: 38,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stack: {
      marginTop: 18,
      gap: 16,
    },
    heroCard: {
      borderWidth: 0,
      gap: 16,
    },
    heroTop: {
      gap: 12,
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    heroTitle: {
      marginTop: 8,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '900',
      letterSpacing: -0.7,
    },
    forecastBadge: {
      minHeight: 36,
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    forecastBadgeText: {
      fontSize: 12,
      fontWeight: '800',
    },
    heroMetrics: {
      flexDirection: 'row',
      gap: 12,
    },
    heroMetricCard: {
      flex: 1,
      borderRadius: 20,
      padding: 14,
      minWidth: 0,
    },
    heroMetricLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    heroMetricValue: {
      marginTop: 8,
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.6,
    },
    heroMetricMeta: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '600',
    },
    chartWrap: {
      marginTop: 2,
    },
    chartHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    chartTitle: {
      fontSize: 13,
      fontWeight: '800',
    },
    chartMeta: {
      fontSize: 12,
      fontWeight: '600',
    },
    barRow: {
      marginTop: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 8,
    },
    barColumn: {
      flex: 1,
      alignItems: 'center',
      gap: 8,
    },
    barTrack: {
      width: '100%',
      height: 118,
      borderRadius: 999,
      justifyContent: 'flex-end',
      overflow: 'hidden',
      padding: 6,
    },
    bar: {
      width: '100%',
      borderRadius: 999,
    },
    barLabel: {
      fontSize: 11,
      fontWeight: '700',
    },
    kpiRow: {
      flexDirection: 'row',
      gap: 12,
    },
    kpiCard: {
      flex: 1,
      minWidth: 0,
    },
    kpiLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    kpiValue: {
      marginTop: 8,
      fontSize: 25,
      fontWeight: '900',
      letterSpacing: -0.6,
    },
    kpiMeta: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '700',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
    sectionLink: {
      fontSize: 13,
      fontWeight: '800',
    },
    sectionCaption: {
      fontSize: 12,
      fontWeight: '600',
    },
    focusPanel: {
      marginTop: 16,
      borderRadius: 22,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    focusIcon: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    focusCopy: {
      flex: 1,
      minWidth: 0,
    },
    focusTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '800',
    },
    focusBody: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '500',
    },
    focusPercent: {
      fontSize: 16,
      fontWeight: '900',
    },
    categoryList: {
      marginTop: 16,
      gap: 14,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    categoryHead: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minWidth: 0,
    },
    categoryDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    categoryCopy: {
      flex: 1,
      minWidth: 0,
    },
    categoryName: {
      fontSize: 14,
      fontWeight: '800',
    },
    categoryMeta: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: '500',
    },
    categoryRight: {
      width: 116,
      alignItems: 'flex-end',
      gap: 8,
    },
    categoryPercent: {
      fontSize: 13,
      fontWeight: '800',
    },
    track: {
      width: '100%',
      height: 8,
      borderRadius: 999,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
    },
    alertStack: {
      marginTop: 14,
      gap: 12,
    },
    alertRow: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    alertIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertCopy: {
      flex: 1,
      minWidth: 0,
    },
    alertTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    alertBody: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '500',
    },
    actionRow: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      minHeight: 50,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 14,
    },
    actionButtonSecondary: {
      borderWidth: 1,
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: '800',
    },
  });
}
