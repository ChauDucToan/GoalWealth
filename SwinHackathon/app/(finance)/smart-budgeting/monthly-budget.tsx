import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ColorTheme, Typography } from '@/constants/theme';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function MonthlyBudgetScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { categories, importedReceipts, totalBudget } = useSmartBudgeting();
  const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
  const totalLeft = Number((totalBudget - totalSpent).toFixed(2));
  const usagePercent = Math.min(totalSpent / totalBudget, 1);
  const highlightedCategory = [...categories].sort((left, right) => right.spent / right.limit - left.spent / left.limit)[0];
  const latestReceipt = importedReceipts[0];

  return (
    <FinanceScreen
      title="Monthly Budget"
      subtitle="A focused version of the main monthly budget screens in the kit."
      contentStyle={styles.contentStyle}
      onBackPress={() => router.replace('/(finance)/smart-budgeting')}
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
        <FinanceCard>
          <View style={styles.ringRow}>
            <View
              style={[
                styles.ringShell,
                {
                  borderColor: hexToRgba(colors.primaryDark, 0.16),
                  borderTopColor: colors.primaryDark,
                  borderRightColor: colors.success,
                  borderBottomColor: colors.warning,
                  borderLeftColor: colors.error,
                },
              ]}
            >
              <View style={[styles.ringCenter, { backgroundColor: colors.card }]}>
                <Text style={[styles.ringValue, { color: colors.text }]}>${totalLeft.toFixed(2)}</Text>
                <Text style={[styles.ringLabel, { color: hexToRgba(colors.text, 0.48) }]}>left</Text>
              </View>
            </View>

            <View style={styles.ringMeta}>
              <Text style={[styles.metaEyebrow, { color: colors.primaryDark }]}>BUDGET STATUS</Text>
              <Text style={[styles.metaTitle, { color: colors.text }]}>
                {usagePercent > 0.85 ? 'Needs attention' : usagePercent > 0.7 ? 'Watch closely' : 'Healthy pace'}
              </Text>
              <Text style={[styles.metaBody, { color: hexToRgba(colors.text, 0.56) }]}>
                You have used {Math.round(usagePercent * 100)}% of the monthly budget. {highlightedCategory?.name ?? 'Housing'} is currently the closest category to its limit.
              </Text>
              <Pressable
                style={[styles.metaButton, { backgroundColor: colors.primaryDark }]}
                onPress={() => router.push('/(finance)/smart-budgeting/manage-categories')}
              >
                <Text style={[styles.metaButtonText, { color: colors.card }]}>Manage budget category</Text>
              </Pressable>
            </View>
          </View>
        </FinanceCard>

        {latestReceipt ? (
          <FinanceCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest import</Text>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>{latestReceipt.importedAt}</Text>
            </View>

            <View style={styles.receiptSummaryRow}>
              <View style={[styles.receiptIconWrap, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                <MaterialIcons name="receipt-long" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.receiptCopy}>
                <Text style={[styles.receiptMerchant, { color: colors.text }]}>{latestReceipt.merchant}</Text>
                <Text style={[styles.receiptMeta, { color: hexToRgba(colors.text, 0.5) }]}>
                  {latestReceipt.dateLabel} • Applied to {latestReceipt.categoryName}
                </Text>
              </View>
              <Text style={[styles.receiptAmount, { color: colors.primaryDark }]}>+${latestReceipt.total.toFixed(2)}</Text>
            </View>
          </FinanceCard>
        ) : null}

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Category status</Text>
            <Pressable onPress={() => router.push('/(finance)/smart-budgeting/setup/receipt-gallery')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Import receipt</Text>
            </Pressable>
          </View>

          <View style={styles.categoryStack}>
            {categories.map((item) => {
              const progress = item.spent / item.limit;
              return (
                <View key={item.id} style={styles.categoryBlock}>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryHead}>
                      <View style={[styles.iconWrap, { backgroundColor: hexToRgba(item.accent, 0.14) }]}>
                        <MaterialIcons
                          name={item.icon as React.ComponentProps<typeof MaterialIcons>['name']}
                          size={18}
                          color={item.accent}
                        />
                      </View>
                      <View>
                        <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.categoryMeta, { color: hexToRgba(colors.text, 0.48) }]}>
                          ${item.spent} / ${item.limit}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.categoryPercent, { color: progress > 0.85 ? colors.error : colors.primaryDark }]}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: hexToRgba(item.accent, 0.12) }]}>
                    <View
                      style={[
                        styles.fill,
                        { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: item.accent },
                      ]}
                    />
                  </View>
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
    ringRow: {
      gap: 18,
    },
    ringShell: {
      alignSelf: 'center',
      width: 182,
      height: 182,
      borderRadius: 91,
      borderWidth: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringCenter: {
      width: 108,
      height: 108,
      borderRadius: 54,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringValue: {
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    ringLabel: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '600',
    },
    ringMeta: {
      gap: 8,
    },
    metaEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    metaTitle: {
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    metaBody: {
      fontSize: Typography.body,
      lineHeight: 20,
    },
    metaButton: {
      marginTop: 6,
      minHeight: 44,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metaButtonText: {
      fontSize: 13,
      fontWeight: '800',
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
      fontWeight: '700',
    },
    receiptSummaryRow: {
      marginTop: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    receiptIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    receiptCopy: {
      flex: 1,
      minWidth: 0,
    },
    receiptMerchant: {
      fontSize: 15,
      fontWeight: '800',
    },
    receiptMeta: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
    },
    receiptAmount: {
      fontSize: 14,
      fontWeight: '800',
    },
    categoryStack: {
      marginTop: 14,
      gap: 14,
    },
    categoryBlock: {
      gap: 8,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    categoryHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryName: {
      fontSize: 15,
      fontWeight: '800',
    },
    categoryMeta: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
    },
    categoryPercent: {
      fontSize: 14,
      fontWeight: '800',
    },
    track: {
      height: 10,
      borderRadius: 999,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
    },
  });
}
