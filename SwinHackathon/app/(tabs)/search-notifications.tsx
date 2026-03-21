import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type DemoMode =
  | 'notifications'
  | 'notifications-empty'
  | 'search-start'
  | 'search-empty'
  | 'search-suggest'
  | 'search-loading'
  | 'search-results'
  | 'search-filter';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

type SearchResult = {
  id: string;
  merchant: string;
  note: string;
  date: string;
  amount: string;
};

const modes: { id: DemoMode; label: string }[] = [
  { id: 'notifications', label: 'Inbox' },
  { id: 'notifications-empty', label: 'Empty' },
  { id: 'search-start', label: 'Search' },
  { id: 'search-empty', label: 'No Result' },
  { id: 'search-suggest', label: 'Suggest' },
  { id: 'search-loading', label: 'Loading' },
  { id: 'search-results', label: 'Results' },
  { id: 'search-filter', label: 'Filter' },
];

const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Transaction needs review',
    body: "You've exceeded your Dining Out budget by $50 this month.",
    time: '1h ago',
    icon: 'warning-amber',
  },
  {
    id: 'n2',
    title: 'Transaction Completed',
    body: 'Your $50 payment to Amazon has been successfully completed.',
    time: '1h ago',
    icon: 'check-circle-outline',
  },
  {
    id: 'n3',
    title: 'Goal Progress Update',
    body: "You're 70% towards your Vacation Savings Goal.",
    time: '1h ago',
    icon: 'track-changes',
  },
  {
    id: 'n4',
    title: 'Recurring Payment Reminder',
    body: 'Your music subscription renews tomorrow.',
    time: '3d ago',
    icon: 'notifications-active',
  },
];

const results: SearchResult[] = [
  { id: 'r1', merchant: 'Starbucks Coffee', note: 'Checking account individual', date: 'Jun 25, 2025', amount: '$15' },
  { id: 'r2', merchant: 'Starbucks Coffee', note: 'Checking account individual', date: 'Jun 21, 2025', amount: '$10' },
  { id: 'r3', merchant: 'Starbucks Coffee', note: 'Checking account individual', date: 'Jun 20, 2025', amount: '$10' },
  { id: 'r4', merchant: 'Starbucks Coffee', note: 'Checking account individual', date: 'Jun 19, 2025', amount: '$8' },
];

const chips = ['Budget', 'Goal', 'Savings', 'Subscription'];
const suggestItems = ['Apparel', 'Accessories', 'Art', 'Beauty', 'Books', 'Computers', 'Electronics'];

export default function SearchNotificationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [mode, setMode] = useState<DemoMode>('notifications');
  const [query, setQuery] = useState('');

  const searchText =
    mode === 'search-results' ? 'Starbucks June' : mode === 'search-suggest' || mode === 'search-loading' ? 'Groceries' : query;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Search & Notifications</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRow}>
          {modes.map((item) => {
            const active = item.id === mode;
            return (
              <Pressable
                key={item.id}
                onPress={() => setMode(item.id)}
                style={[
                  styles.modeChip,
                  {
                    backgroundColor: active ? colors.primaryDark : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
              >
                <Text style={[styles.modeChipText, { color: active ? colors.card : hexToRgba(colors.text, 0.62) }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.phone}>
          {(mode === 'notifications' || mode === 'notifications-empty') && (
            <>
              <View style={styles.headerRow}>
                <MaterialIcons name="chevron-left" size={22} color={hexToRgba(colors.text, 0.62)} />
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.avatar}>
                  <MaterialIcons name="person" size={14} color={colors.card} />
                </View>
              </View>
              <View style={styles.toggleRow}>
                <View style={[styles.togglePill, styles.togglePillActive]}>
                  <Text style={styles.toggleTextActive}>Unread</Text>
                </View>
                <View style={styles.togglePill}>
                  <Text style={styles.toggleText}>Read</Text>
                </View>
              </View>
            </>
          )}

          {(mode === 'search-start' ||
            mode === 'search-empty' ||
            mode === 'search-suggest' ||
            mode === 'search-loading' ||
            mode === 'search-results' ||
            mode === 'search-filter') && (
            <>
              <View style={styles.searchTopRow}>
                <MaterialIcons name="chevron-left" size={22} color={hexToRgba(colors.text, 0.62)} />
                <View style={styles.avatar}>
                  <MaterialIcons name="person" size={14} color={colors.card} />
                </View>
              </View>
              <Text style={styles.searchTitle}>Search Anything...</Text>

              <View style={[styles.searchBar, mode === 'search-results' || mode === 'search-suggest' || mode === 'search-loading' ? styles.searchBarFocused : undefined]}>
                <MaterialIcons name="search" size={15} color={hexToRgba(colors.text, 0.45)} />
                <TextInput
                  value={searchText}
                  onChangeText={setQuery}
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor={hexToRgba(colors.text, 0.45)}
                />
                <MaterialIcons name="tune" size={15} color={hexToRgba(colors.text, 0.6)} />
              </View>
            </>
          )}

          {mode === 'notifications' && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Today</Text>
              {notifications.map((item, index) => (
                <View key={item.id} style={[styles.notificationCard, index > 0 ? styles.mt8 : undefined]}>
                  <View style={styles.notificationRow}>
                    <View style={styles.notificationTitleWrap}>
                      <MaterialIcons name={item.icon} size={14} color={colors.primaryDark} />
                      <Text style={styles.notificationTitle}>{item.title}</Text>
                    </View>
                    <Text style={styles.notificationTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.notificationBody}>{item.body}</Text>
                  {item.id === 'n2' && (
                    <Pressable style={styles.actionGhost}>
                      <Text style={styles.actionGhostText}>See Transaction</Text>
                      <MaterialIcons name="arrow-forward" size={12} color={colors.primaryDark} />
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}

          {mode === 'notifications-empty' && (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyArt}>
                <MaterialIcons name="notifications-none" size={46} color={hexToRgba(colors.primaryDark, 0.7)} />
              </View>
              <Text style={styles.emptyTitle}>You are all caught up.</Text>
              <Text style={styles.emptyDesc}>There are no notifications to show. Pull down to refresh this list.</Text>
              <Pressable style={styles.refreshChip}>
                <MaterialIcons name="refresh" size={12} color={hexToRgba(colors.text, 0.55)} />
                <Text style={styles.refreshText}>Pull to refresh</Text>
              </Pressable>
            </View>
          )}

          {mode === 'search-start' && (
            <View style={styles.section}>
              <View style={styles.inlineTitleRow}>
                <Text style={styles.sectionLabel}>Search by categories</Text>
                <Text style={styles.seeAll}>See All</Text>
              </View>
              <View style={styles.chipsWrap}>
                {chips.map((item) => (
                  <View key={item} style={styles.filterChip}>
                    <MaterialIcons name="sell" size={11} color={hexToRgba(colors.text, 0.52)} />
                    <Text style={styles.filterChipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {mode === 'search-empty' && (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyCircle}>
                <MaterialIcons name="close" size={20} color={colors.error} />
              </View>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyDesc}>Try browsing the following categories below to see if you can find something.</Text>
              <View style={styles.chipsWrapCenter}>
                {chips.map((item) => (
                  <View key={item} style={styles.filterChip}>
                    <Text style={styles.filterChipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {mode === 'search-suggest' && (
            <View style={styles.suggestCard}>
              {suggestItems.map((item, index) => (
                <Text key={item} style={[styles.suggestItem, index !== suggestItems.length - 1 ? styles.suggestDivider : undefined]}>
                  {item}
                </Text>
              ))}
            </View>
          )}

          {mode === 'search-loading' && (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color={colors.primaryDark} />
            </View>
          )}

          {mode === 'search-results' && (
            <View style={styles.section}>
              <View style={styles.chipsWrap}>
                {chips.map((item) => (
                  <View key={item} style={styles.filterChip}>
                    <Text style={styles.filterChipText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>2,168 results found</Text>
                <Text style={styles.sortText}>Sort By: Date</Text>
              </View>

              {results.map((item) => (
                <View key={item.id} style={styles.resultCard}>
                  <View style={styles.resultLeft}>
                    <View style={styles.logoBubble}>
                      <MaterialIcons name="local-cafe" size={12} color={colors.primaryDark} />
                    </View>
                    <View>
                      <Text style={styles.resultMerchant}>{item.merchant}</Text>
                      <Text style={styles.resultNote}>{item.note}</Text>
                      <Text style={styles.resultDate}>{item.date}</Text>
                    </View>
                  </View>
                  <Text style={styles.resultAmount}>{item.amount}</Text>
                </View>
              ))}
            </View>
          )}

          {mode === 'search-filter' && (
            <View style={styles.filterPanel}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Filter Search</Text>
                <Text style={styles.clearAll}>Clear All</Text>
              </View>
              <Text style={styles.filterDesc}>
                Narrow down your results to find specific transaction based on amount, date, category, and more.
              </Text>

              <View style={styles.filterBlock}>
                <View style={styles.inlineTitleRow}>
                  <Text style={styles.filterLabel}>Date Range</Text>
                  <Text style={styles.clearAll}>Clear All</Text>
                </View>
                <View style={styles.dateRow}>
                  <View style={styles.dateInput}><Text style={styles.dateText}>08/08/2028</Text></View>
                  <View style={styles.dateInput}><Text style={styles.dateText}>08/08/2029</Text></View>
                </View>
              </View>

              <View style={styles.filterBlock}>
                <View style={styles.inlineTitleRow}>
                  <Text style={styles.filterLabel}>Search Category</Text>
                  <Text style={styles.clearAll}>Clear All</Text>
                </View>
                <View style={styles.chipsWrap}>{chips.map((item) => <View key={item} style={styles.filterChip}><Text style={styles.filterChipText}>{item}</Text></View>)}</View>
              </View>

              <View style={styles.filterBlock}>
                <View style={styles.inlineTitleRow}>
                  <Text style={styles.filterLabel}>Search Amount</Text>
                  <Text style={styles.usd}>USD</Text>
                </View>
                <View style={styles.sliderTrack}>
                  <View style={styles.sliderValue} />
                  <View style={styles.sliderThumb} />
                </View>
                <View style={styles.sliderMeta}>
                  <Text style={styles.dateText}>0</Text>
                  <Text style={styles.dateText}>25</Text>
                </View>
              </View>

              <Pressable style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>Apply Filter (23)</Text>
                <MaterialIcons name="tune" size={14} color={colors.card} />
              </Pressable>
            </View>
          )}
        </View>
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
      paddingHorizontal: 14,
      paddingBottom: 110,
      gap: 12,
    },
    pageTitle: {
      fontSize: 30,
      fontWeight: '900',
      letterSpacing: -0.5,
      color: colors.text,
      marginTop: 4,
    },
    modeRow: {
      gap: 8,
      paddingRight: 8,
    },
    modeChip: {
      borderWidth: 1,
      borderRadius: 999,
      height: 30,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modeChipText: {
      fontSize: 11,
      fontWeight: '700',
    },
    phone: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      overflow: 'hidden',
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: 14,
      minHeight: 600,
    },
    headerRow: {
      height: 28,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    searchTopRow: {
      height: 28,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    searchTitle: {
      fontSize: 32,
      lineHeight: 36,
      fontWeight: '800',
      color: colors.text,
      marginTop: 8,
    },
    avatar: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryDark,
    },
    toggleRow: {
      marginTop: 10,
      height: 28,
      borderRadius: 999,
      backgroundColor: colors.primaryLight,
      flexDirection: 'row',
      padding: 2,
      gap: 2,
    },
    togglePill: {
      flex: 1,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    togglePillActive: {
      backgroundColor: colors.card,
    },
    toggleText: {
      color: hexToRgba(colors.text, 0.48),
      fontSize: 10,
      fontWeight: '700',
    },
    toggleTextActive: {
      color: colors.text,
      fontSize: 10,
      fontWeight: '700',
    },
    section: {
      marginTop: 10,
      gap: 8,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: hexToRgba(colors.text, 0.72),
    },
    notificationCard: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 10,
      gap: 6,
    },
    mt8: {
      marginTop: 8,
    },
    notificationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    notificationTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
      paddingRight: 8,
    },
    notificationTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
    },
    notificationTime: {
      fontSize: 9,
      fontWeight: '600',
      color: hexToRgba(colors.text, 0.42),
    },
    notificationBody: {
      fontSize: 11,
      lineHeight: 16,
      color: hexToRgba(colors.text, 0.66),
    },
    actionGhost: {
      height: 28,
      borderRadius: 999,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: hexToRgba(colors.primaryDark, 0.3),
      backgroundColor: hexToRgba(colors.primaryDark, 0.08),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      flexDirection: 'row',
      gap: 6,
    },
    actionGhostText: {
      color: colors.primaryDark,
      fontSize: 10,
      fontWeight: '700',
    },
    emptyWrap: {
      flex: 1,
      minHeight: 420,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    emptyArt: {
      width: 92,
      height: 92,
      borderRadius: 24,
      backgroundColor: hexToRgba(colors.primaryDark, 0.1),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: hexToRgba(colors.error, 0.12),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 34,
      lineHeight: 38,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    emptyDesc: {
      marginTop: 10,
      textAlign: 'center',
      fontSize: 12,
      lineHeight: 18,
      color: hexToRgba(colors.text, 0.62),
    },
    refreshChip: {
      marginTop: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      height: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    refreshText: {
      fontSize: 10,
      fontWeight: '600',
      color: hexToRgba(colors.text, 0.55),
    },
    searchBar: {
      marginTop: 12,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.primaryLight,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      gap: 6,
    },
    searchBarFocused: {
      borderColor: hexToRgba(colors.primaryDark, 0.55),
      backgroundColor: colors.card,
    },
    searchInput: {
      flex: 1,
      fontSize: 12,
      color: colors.text,
      paddingVertical: 0,
    },
    inlineTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    seeAll: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primaryDark,
    },
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    chipsWrapCenter: {
      marginTop: 10,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 6,
    },
    filterChip: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 999,
      height: 28,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    filterChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: hexToRgba(colors.text, 0.68),
    },
    suggestCard: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.card,
      overflow: 'hidden',
    },
    suggestItem: {
      minHeight: 32,
      textAlignVertical: 'center',
      lineHeight: 32,
      paddingHorizontal: 10,
      fontSize: 14,
      color: hexToRgba(colors.text, 0.8),
      includeFontPadding: false,
    },
    suggestDivider: {
      borderBottomWidth: 1,
      borderBottomColor: hexToRgba(colors.text, 0.08),
    },
    loaderWrap: {
      minHeight: 360,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultsHeader: {
      marginTop: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    resultsCount: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
    },
    sortText: {
      fontSize: 10,
      fontWeight: '600',
      color: hexToRgba(colors.text, 0.55),
    },
    resultCard: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.card,
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    resultLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      paddingRight: 8,
    },
    logoBubble: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: hexToRgba(colors.primaryDark, 0.12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultMerchant: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
    },
    resultNote: {
      fontSize: 10,
      color: hexToRgba(colors.text, 0.58),
      marginTop: 1,
    },
    resultDate: {
      fontSize: 9,
      color: hexToRgba(colors.text, 0.44),
      marginTop: 2,
    },
    resultAmount: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.text,
    },
    filterPanel: {
      marginTop: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: 12,
      gap: 10,
    },
    filterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    filterTitle: {
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '800',
      color: colors.text,
    },
    clearAll: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primaryDark,
    },
    filterDesc: {
      fontSize: 11,
      lineHeight: 16,
      color: hexToRgba(colors.text, 0.58),
    },
    filterBlock: {
      gap: 6,
    },
    filterLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
    },
    dateRow: {
      flexDirection: 'row',
      gap: 8,
    },
    dateInput: {
      flex: 1,
      height: 32,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      justifyContent: 'center',
      backgroundColor: colors.primaryLight,
    },
    dateText: {
      fontSize: 10,
      fontWeight: '600',
      color: hexToRgba(colors.text, 0.55),
    },
    usd: {
      fontSize: 10,
      fontWeight: '700',
      color: hexToRgba(colors.text, 0.55),
    },
    sliderTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: hexToRgba(colors.text, 0.16),
      marginTop: 6,
      position: 'relative',
    },
    sliderValue: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '26%',
      backgroundColor: colors.primaryDark,
      borderRadius: 2,
    },
    sliderThumb: {
      position: 'absolute',
      top: -6,
      left: '24%',
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.primaryDark,
      backgroundColor: colors.card,
    },
    sliderMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    primaryAction: {
      marginTop: 4,
      height: 42,
      borderRadius: 999,
      backgroundColor: colors.primaryDark,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    primaryActionText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.card,
    },
  });
}
