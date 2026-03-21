import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ThemeTone = 'primaryDark' | 'success' | 'warning' | 'secondary' | 'error';

type BadgeItem = {
  id: string;
  title: string;
  level: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  tone: ThemeTone;
  unlocked: boolean;
};

type ActiveAchievement = {
  id: string;
  name: string;
  hint: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  tone: ThemeTone;
  progress: number;
  progressLabel: string;
  goalLabel: string;
  reward: string;
};

type LeaderboardEntry = {
  id: string;
  name: string;
  rank: number;
  score: number;
  tone: ThemeTone;
};

type StatRow = {
  id: string;
  label: string;
  value: string;
};

const badges: BadgeItem[] = [
  { id: 'b-1', title: 'Budget Boss', level: 'Level 3', icon: 'workspace-premium', tone: 'warning', unlocked: true },
  { id: 'b-2', title: 'Investor 101', level: 'Level 2', icon: 'savings', tone: 'success', unlocked: true },
  { id: 'b-3', title: 'Cash King', level: 'Level 3', icon: 'diamond', tone: 'secondary', unlocked: true },
  { id: 'b-4', title: 'Locked', level: "Let's Unlock!", icon: 'lock', tone: 'secondary', unlocked: false },
  { id: 'b-5', title: 'Locked', level: "Let's Unlock!", icon: 'lock', tone: 'secondary', unlocked: false },
  { id: 'b-6', title: 'Locked', level: "Let's Unlock!", icon: 'lock', tone: 'secondary', unlocked: false },
];

const activeList: ActiveAchievement[] = [
  {
    id: 'a-1',
    name: 'Budget Boss',
    hint: 'Create your first budget and take control of your finances',
    icon: 'workspace-premium',
    tone: 'primaryDark',
    progress: 0.68,
    progressLabel: '$680 of $1,000 saved',
    goalLabel: '$320 left this month',
    reward: 'Unlock Budget Boss Level 4',
  },
  {
    id: 'a-2',
    name: 'Debt Slayer',
    hint: 'Pay off your first debt one step closer to financial freedom',
    icon: 'price-check',
    tone: 'primaryDark',
    progress: 0.42,
    progressLabel: '$420 of $1,000 repaid',
    goalLabel: '$580 left on target',
    reward: 'Unlock debt planner bonuses',
  },
  {
    id: 'a-3',
    name: 'Savings Superstar',
    hint: 'Save $500 in your emergency fund',
    icon: 'auto-awesome',
    tone: 'primaryDark',
    progress: 0.78,
    progressLabel: '$390 of $500 funded',
    goalLabel: '$110 left to complete',
    reward: 'Unlock a savings streak frame',
  },
  {
    id: 'a-4',
    name: 'Goal Getter',
    hint: 'Complete a month without exceeding your spending limit',
    icon: 'flag',
    tone: 'primaryDark',
    progress: 0.56,
    progressLabel: '17 of 30 days on track',
    goalLabel: '13 more days to lock it in',
    reward: 'Unlock goal celebration perks',
  },
];

const leaderboard: LeaderboardEntry[] = [
  { id: 'l-1', name: 'Julio Roberts', rank: 1, score: 4558, tone: 'success' },
  { id: 'l-2', name: 'Francis Barlow', rank: 2, score: 2558, tone: 'warning' },
  { id: 'l-3', name: 'Nina Astra', rank: 3, score: 1258, tone: 'secondary' },
  { id: 'l-4', name: 'Samantha Ray', rank: 4, score: 955, tone: 'success' },
  { id: 'l-5', name: 'Chelsea Blue', rank: 5, score: 198, tone: 'warning' },
];

const statGroups: { id: string; title: string; rows: StatRow[] }[] = [
  {
    id: 'save-goals',
    title: 'Savings & Goals',
    rows: [
      { id: 's1', label: 'Total Savings', value: '$5,000' },
      { id: 's2', label: 'Debt Paid Off', value: '$5,000' },
      { id: 's3', label: 'Goals Achieved', value: '$5,000' },
      { id: 's4', label: 'Credit Score', value: '$5,000' },
      { id: 's5', label: 'Debt to Income', value: '$5,000' },
    ],
  },
  {
    id: 'spending',
    title: 'Spending & Budgeting',
    rows: [
      { id: 's6', label: 'Total Transactions', value: '150' },
      { id: 's7', label: 'Monthly Budget Accuracy', value: '8%' },
      { id: 's8', label: 'Weekly Spending Avg', value: '$800' },
      { id: 's9', label: 'Total Budget Streak', value: '251 days' },
      { id: 's10', label: 'Least Spending', value: '$1.22' },
    ],
  },
  {
    id: 'payment-credit',
    title: 'Payments & Credit',
    rows: [
      { id: 's11', label: 'Recurring Payments', value: '6' },
      { id: 's12', label: 'Subscriptions', value: '4' },
      { id: 's13', label: 'Subscription Cancelled', value: '8' },
      { id: 's14', label: 'Credit Score', value: '343' },
      { id: 's15', label: 'Investment Growth', value: '+15%' },
    ],
  },
];

const segments = ['Badges', 'Leaderboard', 'Stats'] as const;

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedSegment, setSelectedSegment] = useState<(typeof segments)[number]>('Badges');
  const tone = (key: ThemeTone) => colors[key];
  const unlockedCount = badges.filter((item) => item.unlocked).length;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.headerIconButton}>
            <MaterialIcons name="chevron-left" size={22} color={hexToRgba(colors.text, 0.5)} />
          </Pressable>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Pressable style={styles.headerIconButton}>
            <MaterialIcons name="info-outline" size={18} color={hexToRgba(colors.text, 0.4)} />
          </Pressable>
        </View>

        <View style={styles.segmentWrap}>
          {segments.map((item) => {
            const active = item === selectedSegment;
            return (
              <Pressable
                key={item}
                onPress={() => setSelectedSegment(item)}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryValue}>{unlockedCount}</Text>
            <Text style={styles.summaryLabel}>Unlocked</Text>
          </View>
          <View style={styles.summaryMetricDivider} />
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryValue}>{activeList.length}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={styles.summaryMetricDivider} />
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryValue}>4.8K</Text>
            <Text style={styles.summaryLabel}>Monthly pts</Text>
          </View>
        </View>

        {selectedSegment === 'Badges' ? (
          <>
            <View style={styles.badgeGridCard}>
              <View style={styles.badgeGrid}>
                {badges.map((item) => (
                  <View key={item.id} style={styles.badgeCard}>
                    <View
                      style={[
                        styles.badgeHex,
                        {
                          backgroundColor: item.unlocked
                            ? hexToRgba(tone(item.tone), 0.14)
                            : hexToRgba(colors.text, 0.06),
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={22}
                        color={item.unlocked ? tone(item.tone) : hexToRgba(colors.text, 0.42)}
                      />
                    </View>
                    <Text style={[styles.badgeName, !item.unlocked && styles.badgeNameMuted]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.badgeLevel, !item.unlocked && styles.badgeLevelMuted]}>
                      {item.level}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.activeHeader}>
              <Text style={styles.activeTitle}>Active Achievements</Text>
              <Pressable>
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>

            <View style={styles.activeList}>
              {activeList.map((item) => (
                <View key={item.id} style={styles.activeCard}>
                  <View style={styles.activeCardTop}>
                    <View style={[styles.activeIconWrap, { backgroundColor: hexToRgba(tone(item.tone), 0.14) }]}>
                      <MaterialIcons name={item.icon} size={20} color={tone(item.tone)} />
                    </View>

                    <View style={styles.activeBody}>
                      <Text style={styles.activeName}>{item.name}</Text>
                      <Text style={styles.activeHint}>{item.hint}</Text>
                    </View>

                    <View style={[styles.progressBadge, { backgroundColor: hexToRgba(tone(item.tone), 0.1) }]}>
                      <Text style={[styles.progressBadgeText, { color: tone(item.tone) }]}>
                        {Math.round(item.progress * 100)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressMetaRow}>
                    <Text style={styles.progressMeta}>{item.progressLabel}</Text>
                    <Text style={styles.progressMeta}>{item.goalLabel}</Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressValue,
                        {
                          width: `${item.progress * 100}%`,
                          backgroundColor: tone(item.tone),
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.activeFooter}>
                    <Text style={styles.activeFooterText}>{item.reward}</Text>
                    <MaterialIcons name="north-east" size={18} color={hexToRgba(colors.text, 0.32)} />
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {selectedSegment === 'Leaderboard' ? (
          <>
            <View style={styles.leadHeroCard}>
              <View style={styles.leadHero}>
                <View style={styles.leadAvatar}>
                  <MaterialIcons name="person" size={26} color={colors.text} />
                </View>
                <Text style={styles.leadScore}>4,841pt</Text>
                <Text style={styles.leadRole}>Frugal Expert</Text>
                <Text style={styles.leadRank}>#42 ranked</Text>
              </View>
            </View>

            <View style={styles.activeHeader}>
              <Text style={styles.activeTitle}>Leaderboard Rank</Text>
              <Pressable>
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>

            <View style={styles.activeList}>
              {leaderboard.map((item, index) => (
                <View key={item.id} style={[styles.leadRow, index !== leaderboard.length - 1 && styles.rowDivider]}>
                  <View style={styles.leadUser}>
                    <View style={styles.leadUserAvatar}>
                      <MaterialIcons name="person" size={16} color={hexToRgba(colors.text, 0.5)} />
                    </View>
                    <View>
                      <Text style={styles.activeName}>{item.name}</Text>
                      <Text style={styles.activeHint}>Ranked #{item.rank} • +{item.score}pts</Text>
                    </View>
                  </View>
                  <View style={[styles.leadBadge, { backgroundColor: hexToRgba(tone(item.tone), 0.14) }]}>
                    <MaterialIcons name="shield" size={16} color={tone(item.tone)} />
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {selectedSegment === 'Stats' ? (
          <>
          
            <Text style={styles.statsTitle}>My Statistics</Text>
            <Text style={styles.statsSubTitle}>Here you can see your accomplishment stat.</Text>

            <View style={styles.statsQuickGrid}>
              <View style={styles.quickItem}>
                <Text style={styles.quickKey}>2018</Text>
                <Text style={styles.quickLabel}>Use Since</Text>
              </View>
              <View style={styles.quickItem}>
                <Text style={styles.quickKey}>82h</Text>
                <Text style={styles.quickLabel}>App Time</Text>
              </View>
              <View style={[styles.quickItem, styles.quickItemLast]}>
                <Text style={styles.quickKey}>$5.2K</Text>
                <Text style={styles.quickLabel}>Saving Total</Text>
              </View>
            </View>

            {statGroups.map((group) => (
              <View key={group.id} style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>{group.title}</Text>
                {group.rows.map((row, idx) => (
                  <View key={row.id} style={[styles.statsRow, idx !== group.rows.length - 1 && styles.rowDividerSoft]}>
                    <Text style={styles.statsLabel}>{row.label}</Text>
                    <Text style={styles.statsValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.backgroundSoft,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 110,
      gap: 18,
    },
    headerRow: {
      height: 48,
      marginTop: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerIconButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      fontSize: 28,
      color: colors.text,
      fontWeight: '800',
      letterSpacing: -0.4,
    },
    segmentWrap: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bottomBarBackground,
      padding: 4,
      flexDirection: 'row',
    },
    segmentButton: {
      flex: 1,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentButtonActive: {
      backgroundColor: colors.card,
    },
    segmentText: {
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.5),
      fontWeight: '600',
    },
    segmentTextActive: {
      color: colors.text,
    },
    countWrap: {
      alignItems: 'center',
      paddingVertical: 6,
    },
    countNumber: {
      fontSize: 50,
      lineHeight: 54,
      color: colors.text,
      fontWeight: '800',
    },
    countLabel: {
      marginTop: 4,
      fontSize: 20,
      color: hexToRgba(colors.text, 0.68),
      fontWeight: '500',
    },
    summaryCard: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 10,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'stretch',
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    summaryMetric: {
      flex: 1,
      minHeight: 74,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    summaryMetricDivider: {
      width: 1,
      backgroundColor: hexToRgba(colors.text, 0.08),
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
    },
    summaryLabel: {
      marginTop: 4,
      fontSize: Typography.body,
      fontWeight: '600',
      color: hexToRgba(colors.text, 0.56),
    },
    badgeGridCard: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingVertical: 14,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    badgeGrid: {
      paddingHorizontal: 2,
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -6,
    },
    badgeCard: {
      width: '33.333%',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 6,
    },
    badgeHex: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeName: {
      marginTop: 6,
      fontSize: Typography.body,
      color: colors.text,
      fontWeight: '700',
      textAlign: 'center',
    },
    badgeNameMuted: {
      color: hexToRgba(colors.text, 0.6),
    },
    badgeLevel: {
      marginTop: 2,
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.5),
    },
    badgeLevelMuted: {
      color: hexToRgba(colors.text, 0.42),
    },
    activeHeader: {
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    activeTitle: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '800',
    },
    seeAll: {
      fontSize: Typography.body,
      fontWeight: '700',
      color: colors.primaryDark,
    },
    activeList: {
      gap: 12,
    },
    activeCard: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 14,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    activeCardTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: hexToRgba(colors.text, 0.08),
    },
    activeIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    activeBody: {
      flex: 1,
    },
    activeName: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '800',
    },
    activeHint: {
      marginTop: 4,
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.58),
      lineHeight: 21,
    },
    progressMetaRow: {
      marginTop: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    progressMeta: {
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.5),
      fontWeight: '600',
      flex: 1,
    },
    progressTrack: {
      marginTop: 2,
      height: 8,
      borderRadius: 999,
      backgroundColor: hexToRgba(colors.text, 0.1),
      overflow: 'hidden',
    },
    progressValue: {
      height: '100%',
      borderRadius: 999,
    },
    progressBadge: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignSelf: 'flex-start',
    },
    progressBadgeText: {
      fontSize: Typography.body,
      fontWeight: '700',
    },
    activeFooter: {
      marginTop: 4,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: hexToRgba(colors.text, 0.06),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    activeFooterText: {
      flex: 1,
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.5),
      fontWeight: '600',
    },
    leadHero: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    leadHeroCard: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingVertical: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    leadAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(colors.primaryDark, 0.12),
    },
    leadScore: {
      marginTop: 8,
      fontSize: 36,
      lineHeight: 40,
      fontWeight: '800',
      color: colors.text,
    },
    leadRole: {
      marginTop: 2,
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.66),
      fontWeight: '600',
    },
    leadRank: {
      marginTop: 1,
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.5),
      fontWeight: '600',
    },
    leadRow: {
      minHeight: 64,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leadUser: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    leadUserAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(colors.primaryDark, 0.08),
    },
    leadBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsTitle: {
      marginTop: 4,
      textAlign: 'center',
      fontSize: 30,
      lineHeight: 34,
      fontWeight: '800',
      color: colors.text,
    },
    statsSubTitle: {
      textAlign: 'center',
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.58),
      marginTop: 4,
      marginBottom: 2,
    },
    statsQuickGrid: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      backgroundColor: colors.card,
      overflow: 'hidden',
    },
    quickItem: {
      flex: 1,
      minHeight: 74,
      alignItems: 'center',
      justifyContent: 'center',
      borderRightWidth: 1,
      borderRightColor: hexToRgba(colors.text, 0.08),
    },
    quickItemLast: {
      borderRightWidth: 0,
    },
    quickKey: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    quickLabel: {
      marginTop: 2,
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.55),
      fontWeight: '600',
    },
    statsSection: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      backgroundColor: colors.card,
      overflow: 'hidden',
    },
    statsSectionTitle: {
      height: 40,
      paddingHorizontal: 16,
      textAlignVertical: 'center',
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.72),
      fontWeight: '700',
      backgroundColor: colors.primaryLight,
      includeFontPadding: false,
      lineHeight: 40,
    },
    statsRow: {
      minHeight: 42,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowDividerSoft: {
      borderBottomWidth: 1,
      borderBottomColor: hexToRgba(colors.text, 0.08),
    },
    statsLabel: {
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.6),
      fontWeight: '500',
    },
    statsValue: {
      fontSize: Typography.body,
      color: colors.text,
      fontWeight: '700',
    },
  });
}
