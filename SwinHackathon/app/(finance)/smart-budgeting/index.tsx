import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ColorTheme, Typography } from '@/constants/theme';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SmartBudgetingHomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { categories, importedReceipts, hasCompletedSetup, totalBudget } = useSmartBudgeting();

  const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
  const totalLeft = Number((totalBudget - totalSpent).toFixed(2));
  const topPressure = [...categories]
    .sort((left, right) => right.spent / right.limit - left.spent / left.limit)
    .slice(0, 3);
  const riskCount = categories.filter((item) => item.spent / item.limit >= 0.85).length;

  const primaryActions = [
    {
      id: 'monthly',
      title: hasCompletedSetup ? 'Open Monthly Budget' : 'Start Budget Setup',
      body: hasCompletedSetup
        ? 'Operate the active budget without returning to onboarding.'
        : 'Complete the budget setup flow before operating the workspace.',
      icon: hasCompletedSetup ? 'pie-chart-outline' : 'checklist',
      route: hasCompletedSetup ? '/(finance)/smart-budgeting/monthly-budget' : '/(finance)/smart-budgeting/setup',
    },
    {
      id: 'receipt',
      title: 'Import Receipt',
      body: 'Capture spend and apply it directly to the right category.',
      icon: 'receipt-long',
      route: '/(finance)/smart-budgeting/setup/receipt-gallery',
    },
  ] as const;

  const workspaceActions = [
    {
      id: 'insights',
      title: 'Budget Insights',
      icon: 'query-stats',
      route: '/(finance)/smart-budgeting/budget-insights',
    },
    {
      id: 'categories',
      title: 'Organize Categories',
      icon: 'category',
      route: '/(finance)/smart-budgeting/manage-categories',
    },
    {
      id: 'share',
      title: 'Invite & Share',
      icon: 'group-add',
      route: '/(finance)/smart-budgeting/share-budget',
    },
  ] as const;

  return (
    <FinanceScreen
      title="Smart Budgeting"
      subtitle="Plan, review and operate the monthly budget from a single finance workspace."
      contentStyle={styles.contentStyle}
      onBackPress={() => router.replace('/(tabs)/home')}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(finance)/smart-budgeting/manage-categories')}
        >
          <MaterialIcons name="tune" size={20} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
          <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.72) }]}>
            {hasCompletedSetup ? 'LIVE BUDGET WORKSPACE' : 'SMART BUDGET SETUP'}
          </Text>
          <Text style={[styles.heroTitle, { color: colors.card }]}>
            {hasCompletedSetup
              ? 'The budget is ready. Run monthly control, receipts and category adjustments from here.'
              : 'Build the budget first, then turn it into a working month-by-month control panel.'}
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.82) }]}>
            {hasCompletedSetup
              ? 'Receipt import, category management and insights now work as separate operational flows.'
              : 'The onboarding path is still available, but the end goal is this central operating dashboard.'}
          </Text>

          <View style={styles.heroStatRow}>
            <View style={[styles.heroStatCard, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.72) }]}>Spent</Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>${totalSpent.toFixed(0)}</Text>
            </View>
            <View style={[styles.heroStatCard, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.72) }]}>Left</Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>${totalLeft.toFixed(0)}</Text>
            </View>
            <View style={[styles.heroStatCard, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.72) }]}>Imports</Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>{importedReceipts.length}</Text>
            </View>
          </View>

          <View style={styles.heroActionRow}>
            <Pressable
              style={[styles.heroButton, { backgroundColor: colors.card }]}
              onPress={() =>
                router.push(
                  hasCompletedSetup
                    ? '/(finance)/smart-budgeting/monthly-budget'
                    : '/(finance)/smart-budgeting/setup'
                )
              }
            >
              <Text style={[styles.heroButtonText, { color: colors.primaryDark }]}>
                {hasCompletedSetup ? 'Open Monthly Budget' : 'Start Budget Setup'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.heroGhostButton, { borderColor: hexToRgba(colors.card, 0.22) }]}
              onPress={() => router.push('/(finance)/smart-budgeting/setup/receipt-gallery')}
            >
              <Text style={[styles.heroGhostButtonText, { color: colors.card }]}>Import Receipt</Text>
            </Pressable>
          </View>
        </FinanceCard>

        <View style={styles.primaryGrid}>
          {primaryActions.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.primaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(item.route)}
            >
              <View style={[styles.primaryIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                <MaterialIcons name={item.icon} size={20} color={colors.primaryDark} />
              </View>
              <Text style={[styles.primaryTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.primaryBody, { color: hexToRgba(colors.text, 0.56) }]}>{item.body}</Text>
            </Pressable>
          ))}
        </View>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Operate the workspace</Text>
            <Text style={[styles.sectionMeta, { color: hexToRgba(colors.text, 0.46) }]}>3 core tools</Text>
          </View>

          <View style={styles.workspaceActionRow}>
            {workspaceActions.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.workspaceActionCard, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}
                onPress={() => router.push(item.route)}
              >
                <View style={[styles.workspaceActionIcon, { backgroundColor: colors.card }]}>
                  <MaterialIcons name={item.icon} size={18} color={colors.primaryDark} />
                </View>
                <Text style={[styles.workspaceActionTitle, { color: colors.text }]}>{item.title}</Text>
              </Pressable>
            ))}
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pressure map</Text>
            <Text style={[styles.sectionMeta, { color: riskCount > 0 ? colors.error : colors.primaryDark }]}>
              {riskCount > 0 ? `${riskCount} categories at risk` : 'All categories stable'}
            </Text>
          </View>

          <View style={styles.pressureStack}>
            {topPressure.map((item) => {
              const progress = item.spent / item.limit;
              const remaining = Math.max(item.limit - item.spent, 0);
              const tone = progress >= 0.85 ? colors.error : progress >= 0.7 ? colors.warning : colors.primaryDark;

              return (
                <View key={item.id} style={styles.pressureCard}>
                  <View style={styles.pressureRow}>
                    <View style={styles.pressureHead}>
                      <View style={[styles.pressureDot, { backgroundColor: item.accent }]} />
                      <View>
                        <Text style={[styles.pressureTitle, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.pressureBody, { color: hexToRgba(colors.text, 0.5) }]}>
                          ${item.spent.toFixed(0)} / ${item.limit.toFixed(0)} used
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.pressurePercent, { color: tone }]}>{Math.round(progress * 100)}%</Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: hexToRgba(item.accent, 0.12) }]}>
                    <View style={[styles.fill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: item.accent }]} />
                  </View>
                  <Text style={[styles.pressureHint, { color: hexToRgba(colors.text, 0.5) }]}>${remaining.toFixed(0)} remaining before limit</Text>
                </View>
              );
            })}
          </View>
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    stack: { marginTop: 18, gap: 16 },
    headerAction: {
      width: 38,
      height: 38,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroCard: { borderWidth: 0, gap: 16 },
    heroEyebrow: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
    heroTitle: { fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7 },
    heroBody: { fontSize: Typography.body, lineHeight: 20 },
    heroStatRow: { flexDirection: 'row', gap: 10 },
    heroStatCard: { flex: 1, borderRadius: 18, padding: 12 },
    heroStatLabel: { fontSize: 11, fontWeight: '700' },
    heroStatValue: { marginTop: 4, fontSize: 17, fontWeight: '900' },
    heroActionRow: { flexDirection: 'row', gap: 10 },
    heroButton: { flex: 1, minHeight: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    heroButtonText: { fontSize: 13, fontWeight: '800' },
    heroGhostButton: { minWidth: 126, minHeight: 48, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
    heroGhostButtonText: { fontSize: 13, fontWeight: '800' },
    primaryGrid: { flexDirection: 'row', gap: 12 },
    primaryCard: { flex: 1, borderWidth: 1, borderRadius: 24, padding: 16 },
    primaryIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    primaryTitle: { marginTop: 14, fontSize: 16, fontWeight: '800' },
    primaryBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '800' },
    sectionMeta: { fontSize: 12, fontWeight: '700' },
    workspaceActionRow: { marginTop: 16, flexDirection: 'row', gap: 10 },
    workspaceActionCard: { flex: 1, borderWidth: 1, borderRadius: 20, padding: 14, alignItems: 'center' },
    workspaceActionIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    workspaceActionTitle: { marginTop: 10, fontSize: 12, fontWeight: '800', textAlign: 'center' },
    pressureStack: { marginTop: 16, gap: 14 },
    pressureCard: { gap: 8 },
    pressureRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    pressureHead: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    pressureDot: { width: 10, height: 10, borderRadius: 5 },
    pressureTitle: { fontSize: 14, fontWeight: '800' },
    pressureBody: { marginTop: 3, fontSize: 11, fontWeight: '600' },
    pressurePercent: { fontSize: 13, fontWeight: '800' },
    track: { height: 10, borderRadius: 999, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 999 },
    pressureHint: { fontSize: 11, fontWeight: '600' },
  });
}
