import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ColorTheme, Typography } from '@/constants/theme';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import { goSmartBudgetBack, resolveSmartBudgetReturnRoute } from '@/app/(finance)/smart-budgeting/_navigation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const weeklyBars = [38, 66, 52, 80, 61, 57, 72];

export default function MonthlyBudgetScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { categories, importedReceipts, totalBudget } = useSmartBudgeting();
  const backRoute = resolveSmartBudgetReturnRoute(returnTo);
  const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
  const totalLeft = Number((totalBudget - totalSpent).toFixed(2));
  const usagePercent = Math.min(totalSpent / totalBudget, 1);
  const highlightedCategory = [...categories].sort((left, right) => right.spent / right.limit - left.spent / left.limit)[0];
  const latestReceipt = importedReceipts[0];

  return (
    <FinanceScreen
      title="Monthly Budget"
      subtitle="A tighter monthly workspace with live budget status, imports and category pacing."
      contentStyle={styles.contentStyle}
      onBackPress={() => goSmartBudgetBack(router, backRoute)}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(finance)/smart-budgeting/budget-insights')}
        >
          <MaterialIcons name="query-stats" size={20} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}> 
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.72) }]}>MONTHLY CONTROL</Text>
              <Text style={[styles.heroTitle, { color: colors.card }]}>${totalLeft.toFixed(0)} left to spend this month.</Text>
              <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.8) }]}>The current pace is {Math.round(usagePercent * 100)}% used. {highlightedCategory?.name ?? 'Housing'} needs the closest watch.</Text>
            </View>
            <View style={[styles.ringShell, { borderColor: hexToRgba(colors.card, 0.18) }]}> 
              <View style={[styles.ringProgress, { transform: [{ rotate: `${usagePercent * 220 - 110}deg` }], borderColor: colors.card }]} />
              <View style={[styles.ringCenter, { backgroundColor: colors.primaryDark }]}> 
                <Text style={[styles.ringValue, { color: colors.card }]}>{Math.round(usagePercent * 100)}%</Text>
                <Text style={[styles.ringLabel, { color: hexToRgba(colors.card, 0.72) }]}>used</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroStatRow}>
            <View style={[styles.heroStatCard, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.72) }]}>Spent</Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>${totalSpent.toFixed(0)}</Text>
            </View>
            <View style={[styles.heroStatCard, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.72) }]}>Budget</Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>${totalBudget.toFixed(0)}</Text>
            </View>
            <View style={[styles.heroStatCard, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.72) }]}>Imports</Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>{importedReceipts.length}</Text>
            </View>
          </View>
        </FinanceCard>

        <View style={styles.dualRow}>
          <FinanceCard style={styles.dualCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Spend trend</Text>
            <View style={styles.barRow}>
              {weeklyBars.map((value, index) => (
                <View key={String(index)} style={styles.barColumn}>
                  <View style={[styles.barTrack, { backgroundColor: colors.backgroundSoft }]}> 
                    <View style={[styles.bar, { height: value, backgroundColor: index >= 5 ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.36) }]} />
                  </View>
                </View>
              ))}
            </View>
            <Text style={[styles.sectionHint, { color: hexToRgba(colors.text, 0.52) }]}>Last 7-day movement of tracked spend.</Text>
          </FinanceCard>

          <FinanceCard style={styles.dualCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Focus category</Text>
            <View style={[styles.focusPanel, { backgroundColor: hexToRgba(highlightedCategory?.accent ?? colors.primaryDark, 0.08) }]}> 
              <View style={[styles.focusDot, { backgroundColor: highlightedCategory?.accent ?? colors.primaryDark }]} />
              <Text style={[styles.focusTitle, { color: colors.text }]}>{highlightedCategory?.name ?? 'Housing'}</Text>
              <Text style={[styles.focusMeta, { color: hexToRgba(colors.text, 0.52) }]}>${highlightedCategory?.spent.toFixed(0) ?? '0'} of ${highlightedCategory?.limit.toFixed(0) ?? '0'} used</Text>
              <Text style={[styles.focusPercent, { color: highlightedCategory && highlightedCategory.spent / highlightedCategory.limit >= 0.85 ? colors.error : colors.primaryDark }]}>
                {highlightedCategory ? `${Math.round((highlightedCategory.spent / highlightedCategory.limit) * 100)}%` : '--'}
              </Text>
            </View>
          </FinanceCard>
        </View>

        {latestReceipt ? (
          <FinanceCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest import</Text>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>{latestReceipt.importedAt}</Text>
            </View>

            <View style={styles.receiptRow}>
              <View style={[styles.receiptIconWrap, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}> 
                <MaterialIcons name="receipt-long" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.receiptCopy}>
                <Text style={[styles.receiptMerchant, { color: colors.text }]}>{latestReceipt.merchant}</Text>
                <Text style={[styles.receiptMeta, { color: hexToRgba(colors.text, 0.5) }]}>{latestReceipt.dateLabel} • {latestReceipt.items.length} line items</Text>
                <Text style={[styles.receiptCategory, { color: colors.primaryDark }]}>Applied to {latestReceipt.categoryName}</Text>
              </View>
              <Text style={[styles.receiptAmount, { color: colors.primaryDark }]}>+${latestReceipt.total.toFixed(2)}</Text>
            </View>
          </FinanceCard>
        ) : null}

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Category status</Text>
            <Pressable onPress={() => router.push('/(finance)/smart-budgeting/manage-categories')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Manage</Text>
            </Pressable>
          </View>

          <View style={styles.categoryStack}>
            {categories.map((item) => {
              const progress = item.spent / item.limit;
              const remaining = Math.max(item.limit - item.spent, 0);
              const tone = progress >= 0.85 ? colors.error : progress >= 0.7 ? colors.warning : colors.primaryDark;

              return (
                <View key={item.id} style={[styles.categoryCard, { backgroundColor: colors.backgroundSoft }]}> 
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryHead}>
                      <View style={[styles.categoryIconWrap, { backgroundColor: hexToRgba(item.accent, 0.14) }]}> 
                        <MaterialIcons name={item.icon as React.ComponentProps<typeof MaterialIcons>['name']} size={18} color={item.accent} />
                      </View>
                      <View>
                        <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.categoryNote, { color: hexToRgba(colors.text, 0.48) }]}>{item.note}</Text>
                      </View>
                    </View>
                    <Text style={[styles.categoryPercent, { color: tone }]}>{Math.round(progress * 100)}%</Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: hexToRgba(item.accent, 0.12) }]}>
                    <View style={[styles.fill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: item.accent }]} />
                  </View>
                  <View style={styles.categoryFooter}>
                    <Text style={[styles.categoryFootValue, { color: colors.text }]}>${item.spent.toFixed(0)} spent</Text>
                    <Text style={[styles.categoryFootValue, { color: hexToRgba(colors.text, 0.56) }]}>${remaining.toFixed(0)} left</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </FinanceCard>

        <View style={styles.actionRow}>
          <Pressable style={[styles.actionButton, { backgroundColor: colors.primaryDark }]} onPress={() => router.push('/(finance)/smart-budgeting/budget-insights')}>
            <MaterialIcons name="query-stats" size={18} color={colors.card} />
            <Text style={[styles.actionButtonText, { color: colors.card }]}>See Insights</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.secondaryActionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
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
    stack: { marginTop: 18, gap: 16 },
    heroCard: { borderWidth: 0, gap: 16 },
    heroTop: { flexDirection: 'row', gap: 14 },
    heroCopy: { flex: 1 },
    heroEyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
    heroTitle: { marginTop: 8, fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7 },
    heroBody: { marginTop: 8, fontSize: Typography.body, lineHeight: 20 },
    ringShell: {
      width: 114,
      height: 114,
      borderRadius: 57,
      borderWidth: 10,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    ringProgress: {
      position: 'absolute',
      width: 114,
      height: 114,
      borderRadius: 57,
      borderWidth: 10,
      borderRightColor: 'transparent',
      borderBottomColor: 'transparent',
    },
    ringCenter: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    ringValue: { fontSize: 20, fontWeight: '900' },
    ringLabel: { marginTop: 3, fontSize: 11, fontWeight: '700' },
    heroStatRow: { flexDirection: 'row', gap: 10 },
    heroStatCard: { flex: 1, borderRadius: 18, padding: 12 },
    heroStatLabel: { fontSize: 11, fontWeight: '700' },
    heroStatValue: { marginTop: 4, fontSize: 16, fontWeight: '900' },
    dualRow: { flexDirection: 'row', gap: 12 },
    dualCard: { flex: 1 },
    sectionTitle: { fontSize: 16, fontWeight: '800' },
    sectionHint: { marginTop: 8, fontSize: 11, fontWeight: '600' },
    barRow: { marginTop: 18, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    barColumn: { flex: 1, alignItems: 'center' },
    barTrack: { width: '100%', height: 104, borderRadius: 999, justifyContent: 'flex-end', padding: 4 },
    bar: { width: '100%', borderRadius: 999 },
    focusPanel: { marginTop: 16, borderRadius: 22, padding: 16, alignItems: 'flex-start' },
    focusDot: { width: 12, height: 12, borderRadius: 6 },
    focusTitle: { marginTop: 12, fontSize: 15, fontWeight: '800' },
    focusMeta: { marginTop: 4, fontSize: 12, fontWeight: '600' },
    focusPercent: { marginTop: 10, fontSize: 22, fontWeight: '900' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    sectionLink: { fontSize: 13, fontWeight: '700' },
    receiptRow: { marginTop: 16, flexDirection: 'row', gap: 12, alignItems: 'center' },
    receiptIconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    receiptCopy: { flex: 1 },
    receiptMerchant: { fontSize: 15, fontWeight: '800' },
    receiptMeta: { marginTop: 3, fontSize: 11, fontWeight: '600' },
    receiptCategory: { marginTop: 6, fontSize: 12, fontWeight: '700' },
    receiptAmount: { fontSize: 14, fontWeight: '800' },
    categoryStack: { marginTop: 16, gap: 12 },
    categoryCard: { borderRadius: 22, padding: 14, gap: 10 },
    categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    categoryHead: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    categoryIconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    categoryName: { fontSize: 14, fontWeight: '800' },
    categoryNote: { marginTop: 3, fontSize: 11, fontWeight: '600' },
    categoryPercent: { fontSize: 13, fontWeight: '800' },
    track: { height: 10, borderRadius: 999, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 999 },
    categoryFooter: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    categoryFootValue: { fontSize: 12, fontWeight: '700' },
    actionRow: { flexDirection: 'row', gap: 12 },
    actionButton: { flex: 1, minHeight: 48, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    secondaryActionButton: { borderWidth: 1 },
    actionButtonText: { fontSize: 13, fontWeight: '800' },
  });
}
