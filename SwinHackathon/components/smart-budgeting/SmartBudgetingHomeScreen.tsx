import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ColorTheme, Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { budgetCategories, budgetSummary } from './data';

export function SmartBudgetingHomeScreen() {
  const { colors } = useTheme();
  const { isCompact, verticalScale } = useResponsive();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { hasCompletedSetup } = useSmartBudgeting();
  const totalProgress = budgetSummary.spent / budgetSummary.total;
  const quickDestinations = useMemo(
    () => [
      hasCompletedSetup
        ? {
            id: 'workspace',
            title: 'Budget Workspace',
            body: 'Setup is complete. Open the live budget instead of re-running onboarding.',
            route: '/(finance)/smart-budgeting/monthly-budget',
            icon: 'task-alt' as const,
          }
        : {
            id: 'setup',
            title: 'Budget Setup',
            body: 'Walk through the onboarding questions from the left side of the kit.',
            route: '/(finance)/smart-budgeting/setup',
            icon: 'checklist' as const,
          },
      {
        id: 'receipt',
        title: 'Import Receipt',
        body: 'Open receipt capture and apply spending directly into the budget.',
        route: '/(finance)/smart-budgeting/setup/receipt-gallery',
        icon: 'receipt-long' as const,
      },
      {
        id: 'monthly',
        title: 'Monthly Budget',
        body: 'See the ring, breakdown and active budget progress.',
        route: '/(finance)/smart-budgeting/monthly-budget',
        icon: 'pie-chart-outline' as const,
      },
      {
        id: 'insights',
        title: 'Budget Insights',
        body: 'Open recommendations, pacing and monthly patterns.',
        route: '/(finance)/smart-budgeting/budget-insights',
        icon: 'insights' as const,
      },
      {
        id: 'categories',
        title: 'Organize Category',
        body: 'Create, edit and reorder budget categories.',
        route: '/(finance)/smart-budgeting/manage-categories',
        icon: 'category' as const,
      },
      {
        id: 'share',
        title: 'Budget Together Easily',
        body: 'Share by QR and invite members into the plan.',
        route: '/(finance)/smart-budgeting/share-budget',
        icon: 'group-add' as const,
      },
    ],
    [hasCompletedSetup]
  );

  return (
    <FinanceScreen
      title="Smart Budgeting"
      subtitle="A routed flow that matches the budgeting kit: dashboard, insights, categories and sharing."
      contentStyle={styles.contentStyle}
      hideBackButton
      bottomInsetSpacing={verticalScale(isCompact ? 180 : 150, 0.72)}
      leftAccessory={
        <View
          style={[
            styles.headerBadge,
            {
              backgroundColor: hexToRgba(colors.primaryDark, 0.08),
              borderColor: hexToRgba(colors.primaryDark, 0.12),
            },
          ]}
        >
          <MaterialIcons name="savings" size={20} color={colors.primaryDark} />
        </View>
      }
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
          <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.74) }]}>
            {hasCompletedSetup ? 'Budget Workspace' : 'Budget Set Up'}
          </Text>
          <Text style={[styles.heroTitle, { color: colors.card }]}>
            {hasCompletedSetup
              ? 'Your budget is ready. You can operate it directly without re-running setup.'
              : "Let's set up your budget and keep every category on pace."}
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.82) }]}>
            {hasCompletedSetup
              ? 'Receipt import, category management and monthly budget review are now independent flows.'
              : 'The design kit shows this flow as a sequence. This screen is the operational hub to open each step directly.'}
          </Text>

          <View style={[styles.progressTrack, { backgroundColor: hexToRgba(colors.card, 0.16) }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(totalProgress * 100, 100)}%`, backgroundColor: colors.card },
              ]}
            />
          </View>

          <View style={styles.heroMetaRow}>
            <View>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.74) }]}>
                Spent
              </Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>
                ${budgetSummary.spent.toFixed(2)}
              </Text>
            </View>
            <View>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.74) }]}>
                Left
              </Text>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>
                ${budgetSummary.left.toFixed(0)}
              </Text>
            </View>
          </View>

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

          {hasCompletedSetup ? (
            <Pressable
              style={[styles.heroSecondaryButton, { borderColor: hexToRgba(colors.card, 0.18) }]}
              onPress={() => router.push('/(finance)/smart-budgeting/setup/receipt-gallery')}
            >
              <Text style={[styles.heroSecondaryButtonText, { color: colors.card }]}>
                Import Receipt
              </Text>
            </Pressable>
          ) : null}
        </FinanceCard>

        <View style={styles.grid}>
          {quickDestinations.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(item.route)}
            >
              <View
                style={[styles.navIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}
              >
                <MaterialIcons name={item.icon} size={20} color={colors.primaryDark} />
              </View>
              <Text style={[styles.navTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.navBody, { color: hexToRgba(colors.text, 0.56) }]}>
                {item.body}
              </Text>
            </Pressable>
          ))}
        </View>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>At a glance</Text>
            <Pressable onPress={() => router.push('/(finance)/smart-budgeting/budget-insights')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>See insights</Text>
            </Pressable>
          </View>

          <View style={styles.peekStack}>
            {budgetCategories.slice(0, 3).map((item) => {
              const progress = item.spent / item.limit;
              return (
                <View key={item.id} style={styles.peekRow}>
                  <View style={styles.peekHead}>
                    <View style={[styles.peekDot, { backgroundColor: item.accent }]} />
                    <Text style={[styles.peekTitle, { color: colors.text }]}>{item.name}</Text>
                  </View>
                  <Text
                    style={[
                      styles.peekValue,
                      { color: progress > 0.85 ? colors.error : colors.primaryDark },
                    ]}
                  >
                    {Math.round(progress * 100)}%
                  </Text>
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
    contentStyle: {
      paddingBottom: 28,
    },
    stack: {
      marginTop: 18,
      gap: 16,
    },
    headerAction: {
      width: 38,
      height: 38,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerBadge: {
      width: 38,
      height: 38,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroCard: {
      borderWidth: 0,
      gap: 14,
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    heroTitle: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '900',
      letterSpacing: -0.7,
    },
    heroBody: {
      fontSize: Typography.body,
      lineHeight: 20,
    },
    progressTrack: {
      height: 10,
      borderRadius: 999,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 999,
    },
    heroMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
    },
    heroStatLabel: {
      fontSize: 12,
      fontWeight: '600',
    },
    heroStatValue: {
      marginTop: 4,
      fontSize: 18,
      fontWeight: '800',
    },
    heroButton: {
      minHeight: 46,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    heroButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
    heroSecondaryButton: {
      minHeight: 44,
      borderRadius: 18,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroSecondaryButtonText: {
      fontSize: 13,
      fontWeight: '700',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    navCard: {
      width: '47%',
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
      minHeight: 148,
      justifyContent: 'space-between',
    },
    navIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '800',
      marginTop: 14,
    },
    navBody: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
      marginTop: 6,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
    },
    sectionLink: {
      fontSize: 12,
      fontWeight: '700',
    },
    peekStack: {
      marginTop: 16,
      gap: 12,
    },
    peekRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    peekHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      minWidth: 0,
    },
    peekDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    peekTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    peekValue: {
      fontSize: 13,
      fontWeight: '800',
    },
  });
}
