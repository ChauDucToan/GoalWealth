import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  budgetCategories,
  overviewStats,
  quickActions,
  spendingInsights,
  transactionsSeed,
} from '@/components/home/mock-data';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

function formatCurrency(value: number) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toFixed(2)}`;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const recentTransactions = transactionsSeed.slice(0, 4);
  const currentMonthSpend = budgetCategories.reduce((sum, item) => sum + item.spent, 0);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: colors.primaryDark }]}>
        <View
          style={[
            styles.heroCircleLarge,
            { backgroundColor: hexToRgba(colors.primary, 0.18) },
          ]}
        />
        <View
          style={[
            styles.heroCircleSmall,
            { backgroundColor: hexToRgba(colors.secondary, 0.16) },
          ]}
        />

        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.eyebrow, { color: hexToRgba(colors.textLight, 0.76) }]}>
              Welcome back
            </Text>
            <Text style={[styles.heroTitle, { color: colors.card }]}>
              Jonathan
            </Text>
          </View>

          <View
            style={[
              styles.iconBadge,
              { backgroundColor: hexToRgba(colors.card, 0.14) },
            ]}
          >
            <MaterialIcons name="notifications-none" size={22} color={colors.card} />
          </View>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.balanceLabel, { color: hexToRgba(colors.text, 0.55) }]}>
            Total Balance
          </Text>
          <Text style={[styles.balanceValue, { color: colors.text }]}>
            {formatCurrency(overviewStats.balance)}
          </Text>

          <View style={styles.metricRow}>
            <View
              style={[
                styles.metricChip,
                { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
            >
              <MaterialIcons name="south-west" size={16} color={colors.primaryDark} />
              <Text style={[styles.metricText, { color: colors.text }]}>
                Income {formatCurrency(overviewStats.income)}
              </Text>
            </View>

            <View
              style={[
                styles.metricChip,
                { backgroundColor: hexToRgba(colors.error, 0.08) },
              ]}
            >
              <MaterialIcons name="north-east" size={16} color={colors.error} />
              <Text style={[styles.metricText, { color: colors.text }]}>
                Spend {formatCurrency(overviewStats.expenses)}
              </Text>
            </View>
          </View>

          <View style={styles.sparklineRow}>
            {spendingInsights.map((item) => (
              <View
                key={item.label}
                style={[
                  styles.sparklineBar,
                  {
                    height: 20 + item.value,
                    backgroundColor: item.value > 80
                      ? colors.primaryDark
                      : hexToRgba(colors.primaryDark, 0.22),
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <Pressable onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>View all</Text>
          </Pressable>
        </View>

        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.id}
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => router.push('/(tabs)/transactions')}
            >
              <View
                style={[
                  styles.actionIconWrap,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
              >
                <MaterialIcons name={action.icon} size={22} color={colors.primaryDark} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
              <Text style={[styles.actionSubtitle, { color: hexToRgba(colors.text, 0.56) }]}>
                {action.subtitle}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget Highlights</Text>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>
              Left {formatCurrency(overviewStats.budgetLeft)}
            </Text>
          </View>

          {budgetCategories.map((item) => {
            const progress = Math.min(item.spent / item.limit, 1);

            return (
              <View key={item.id} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryLabelWrap}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: hexToRgba(item.accent, 0.12) },
                      ]}
                    >
                      <MaterialIcons name={item.icon} size={18} color={item.accent} />
                    </View>
                    <View>
                      <Text style={[styles.categoryTitle, { color: colors.text }]}>
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.categoryMeta,
                          { color: hexToRgba(colors.text, 0.5) },
                        ]}
                      >
                        {formatCurrency(item.spent)} of {formatCurrency(item.limit)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.categoryPercent, { color: item.accent }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>

                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                  ]}
                >
                  <View
                    style={[
                      styles.progressValue,
                      {
                        width: `${progress * 100}%`,
                        backgroundColor: item.accent,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>
                Open transactions
              </Text>
            </Pressable>
          </View>

          {recentTransactions.map((item) => (
            <Pressable
              key={item.id}
              style={styles.transactionRow}
              onPress={() => router.push('/(tabs)/transactions')}
            >
              <View
                style={[
                  styles.transactionIcon,
                  { backgroundColor: hexToRgba(item.accent, 0.12) },
                ]}
              >
                <MaterialIcons name={item.icon} size={20} color={item.accent} />
              </View>

              <View style={styles.transactionTextWrap}>
                <Text style={[styles.transactionMerchant, { color: colors.text }]}>
                  {item.merchant}
                </Text>
                <Text
                  style={[
                    styles.transactionMeta,
                    { color: hexToRgba(colors.text, 0.52) },
                  ]}
                >
                  {item.category} • {item.timeLabel}
                </Text>
              </View>

              <Text
                style={[
                  styles.transactionAmount,
                  { color: item.type === 'income' ? colors.primaryDark : colors.text },
                ]}
              >
                {formatCurrency(item.amount)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.insightCard, { backgroundColor: colors.primaryDark }]}>
          <View style={styles.insightTextWrap}>
            <Text style={[styles.insightEyebrow, { color: hexToRgba(colors.card, 0.72) }]}>
              Month in review
            </Text>
            <Text style={[styles.insightTitle, { color: colors.card }]}>
              You spent {formatCurrency(currentMonthSpend)} across your main categories.
            </Text>
          </View>
          <ThemeButton
            title="See Insights"
            onPress={() => router.push('/(tabs)/insights')}
            colorBackground={colors.card}
            colorText={colors.primaryDark}
            style={styles.insightButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 110,
  },
  hero: {
    paddingTop: 68,
    paddingHorizontal: 20,
    paddingBottom: 26,
    overflow: 'hidden',
  },
  heroCircleLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -40,
    right: -80,
  },
  heroCircleSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: -35,
    left: -28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '600',
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    marginTop: 22,
    borderRadius: 28,
    padding: 20,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  balanceValue: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: '800',
  },
  metricRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  metricChip: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  metricText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  sparklineRow: {
    marginTop: 18,
    height: 114,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sparklineBar: {
    width: 28,
    borderRadius: 14,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    borderRadius: 22,
    padding: 16,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
  },
  actionSubtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    borderRadius: 24,
    padding: 18,
  },
  categoryRow: {
    marginTop: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  categoryMeta: {
    marginTop: 4,
    fontSize: 12,
  },
  categoryPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 999,
  },
  progressValue: {
    height: 8,
    borderRadius: 999,
  },
  transactionRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  transactionMerchant: {
    fontSize: 15,
    fontWeight: '700',
  },
  transactionMeta: {
    marginTop: 4,
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  insightCard: {
    borderRadius: 26,
    padding: 20,
  },
  insightTextWrap: {
    gap: 8,
  },
  insightEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  insightTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
  },
  insightButton: {
    marginTop: 20,
  },
});
