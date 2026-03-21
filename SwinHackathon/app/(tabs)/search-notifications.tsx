import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
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

type SurfaceTab = 'notifications' | 'search';
type NotificationPreview = 'inbox' | 'empty';
type SearchPreview = 'start' | 'suggest' | 'loading' | 'results' | 'filter' | 'empty';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  group: 'Today' | 'Earlier';
};

type SearchResult = {
  id: string;
  merchant: string;
  note: string;
  date: string;
  amount: string;
};

const surfaceTabs: { id: SurfaceTab; label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] = [
  { id: 'notifications', label: 'Notifications', icon: 'notifications-none' },
  { id: 'search', label: 'Search', icon: 'search' },
];

const notificationStates: { id: NotificationPreview; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'empty', label: 'Empty' },
];

const searchStates: { id: SearchPreview; label: string }[] = [
  { id: 'start', label: 'Start' },
  { id: 'suggest', label: 'Suggest' },
  { id: 'loading', label: 'Loading' },
  { id: 'results', label: 'Results' },
  { id: 'filter', label: 'Filter' },
  { id: 'empty', label: 'No result' },
];

const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Transaction needs review',
    body: "You've exceeded your Dining Out budget by $50 this month.",
    time: '1h ago',
    icon: 'warning-amber',
    group: 'Today',
  },
  {
    id: 'n2',
    title: 'Transaction Completed',
    body: 'Your $50 payment to Amazon has been successfully completed.',
    time: '1h ago',
    icon: 'check-circle-outline',
    group: 'Today',
  },
  {
    id: 'n3',
    title: 'Goal Progress Update',
    body: "You're 70% towards your Vacation Savings Goal.",
    time: '3h ago',
    icon: 'track-changes',
    group: 'Today',
  },
  {
    id: 'n4',
    title: 'Recurring Payment Reminder',
    body: 'Your music subscription renews tomorrow.',
    time: '3d ago',
    icon: 'notifications-active',
    group: 'Earlier',
  },
];

const results: SearchResult[] = [
  {
    id: 'r1',
    merchant: 'Starbucks Coffee',
    note: 'Checking account individual',
    date: 'Mar 18, 2026',
    amount: '$15',
  },
  {
    id: 'r2',
    merchant: 'FreshMart Grocery',
    note: 'Debit card ending 2241',
    date: 'Mar 16, 2026',
    amount: '$42',
  },
  {
    id: 'r3',
    merchant: 'Metro Transit',
    note: 'Public transport top-up',
    date: 'Mar 14, 2026',
    amount: '$10',
  },
];

const categoryCards = [
  { label: 'Groceries', icon: 'local-grocery-store' as const },
  { label: 'Dining', icon: 'restaurant' as const },
  { label: 'Subscriptions', icon: 'subscriptions' as const },
  { label: 'Transfers', icon: 'swap-horiz' as const },
];

const suggestItems = [
  'Apparel',
  'Accessories',
  'Art',
  'Beauty',
  'Books',
  'Computers',
  'Electronics',
];

const recentSearches = ['Groceries this week', 'Dining over $40', 'Spotify recurring', 'Transfers to Maya'];

export default function SearchNotificationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [surface, setSurface] = useState<SurfaceTab>('notifications');
  const [notificationPreview, setNotificationPreview] = useState<NotificationPreview>('inbox');
  const [searchPreview, setSearchPreview] = useState<SearchPreview>('start');
  const [query, setQuery] = useState('');

  const searchText =
    searchPreview === 'results'
      ? 'Coffee March'
      : searchPreview === 'suggest' || searchPreview === 'loading'
        ? 'Groceries'
        : query;

  const groupedNotifications = notifications.reduce<Record<string, NotificationItem[]>>((groups, item) => {
    if (!groups[item.group]) {
      groups[item.group] = [];
    }

    groups[item.group].push(item);
    return groups;
  }, {});

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderCopy}>
            <Text style={styles.pageTitle}>Search & Notifications</Text>
            <Text style={styles.pageBody}>
              One place for alerts, merchant lookup and transaction discovery without the old clutter.
            </Text>
          </View>

          <View style={styles.pageHeaderAction}>
            <MaterialIcons
              name={surface === 'notifications' ? 'notifications-active' : 'manage-search'}
              size={24}
              color={colors.primaryDark}
            />
          </View>
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.darkBackground }]}>
          <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.74) }]}>
            {surface === 'notifications' ? 'INBOX HEALTH' : 'SEARCH TOOLS'}
          </Text>
          <Text style={[styles.heroTitle, { color: colors.card }]}>
            {surface === 'notifications'
              ? 'Stay ahead of every alert without drowning in noise.'
              : 'Find any transaction, merchant or pattern in seconds.'}
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={[styles.heroStat, { backgroundColor: hexToRgba(colors.card, 0.14) }]}>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>
                {surface === 'notifications' ? '04' : '2168'}
              </Text>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.74) }]}>
                {surface === 'notifications' ? 'Unread alerts' : 'Indexed results'}
              </Text>
            </View>
            <View style={[styles.heroStat, { backgroundColor: hexToRgba(colors.card, 0.14) }]}>
              <Text style={[styles.heroStatValue, { color: colors.card }]}>
                {surface === 'notifications' ? '02' : '07'}
              </Text>
              <Text style={[styles.heroStatLabel, { color: hexToRgba(colors.card, 0.74) }]}>
                {surface === 'notifications' ? 'Need action' : 'Smart suggestions'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.switchCard}>
          <View style={styles.surfaceSwitch}>
            {surfaceTabs.map((item) => {
              const active = item.id === surface;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSurface(item.id)}
                  style={[
                    styles.surfaceButton,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.card,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={18}
                    color={active ? colors.card : hexToRgba(colors.text, 0.58)}
                  />
                  <Text
                    style={[
                      styles.surfaceButtonText,
                      { color: active ? colors.card : colors.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.previewRow}
          >
            {(surface === 'notifications' ? notificationStates : searchStates).map((item) => {
              const active =
                surface === 'notifications'
                  ? notificationPreview === item.id
                  : searchPreview === item.id;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    if (surface === 'notifications') {
                      setNotificationPreview(item.id as NotificationPreview);
                      return;
                    }

                    setSearchPreview(item.id as SearchPreview);
                  }}
                  style={[
                    styles.previewChip,
                    {
                      backgroundColor: active ? hexToRgba(colors.primaryDark, 0.1) : colors.backgroundSoft,
                      borderColor: active ? hexToRgba(colors.primaryDark, 0.16) : hexToRgba(colors.primaryDark, 0.06),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.previewChipText,
                      { color: active ? colors.primaryDark : hexToRgba(colors.text, 0.58) },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {surface === 'notifications' ? (
          <>
            <View style={styles.surfaceCard}>
              <View style={styles.surfaceCardHeader}>
                <View style={styles.surfaceHeaderCopy}>
                  <Text style={styles.surfaceCardTitle}>Notification Inbox</Text>
                  <Text style={styles.surfaceCardBody}>
                    Review warnings, completed payments and goal updates in one place.
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <View style={[styles.statusPill, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                    <Text style={[styles.statusPillText, { color: colors.primaryDark }]}>Unread</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.statusPillText, { color: hexToRgba(colors.text, 0.6) }]}>Read</Text>
                  </View>
                </View>
              </View>
            </View>

            {notificationPreview === 'empty' ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <MaterialIcons name="notifications-none" size={42} color={colors.primaryDark} />
                </View>
                <Text style={styles.emptyTitle}>You are all caught up.</Text>
                <Text style={styles.emptyBody}>
                  No new alerts right now. The inbox will fill up again when budgets, goals or
                  transfers need attention.
                </Text>
              </View>
            ) : (
              <>
                {Object.entries(groupedNotifications).map(([group, items]) => (
                  <View key={group} style={styles.sectionStack}>
                    <View style={styles.inlineHeader}>
                      <Text style={styles.sectionTitle}>{group}</Text>
                      <Text style={styles.inlineLink}>{items.length} items</Text>
                    </View>

                    {items.map((item) => (
                      <View key={item.id} style={styles.notificationCard}>
                        <View style={styles.notificationTopRow}>
                          <View style={styles.notificationLeading}>
                            <View style={styles.notificationIconWrap}>
                              <MaterialIcons name={item.icon} size={18} color={colors.primaryDark} />
                            </View>
                            <View style={styles.notificationCopy}>
                              <Text style={styles.notificationTitle}>{item.title}</Text>
                              <Text style={styles.notificationBody}>{item.body}</Text>
                            </View>
                          </View>
                          <Text style={styles.notificationTime}>{item.time}</Text>
                        </View>

                        {item.id === 'n2' ? (
                          <Pressable style={styles.inlineAction}>
                            <Text style={styles.inlineActionText}>See transaction</Text>
                            <MaterialIcons name="arrow-forward" size={14} color={colors.primaryDark} />
                          </Pressable>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <View style={styles.surfaceCard}>
              <View style={styles.surfaceCardHeader}>
                <View>
                  <Text style={styles.surfaceCardTitle}>Search Workspace</Text>
                  <Text style={styles.surfaceCardBody}>
                    Search by merchant, note, date or category without leaving the page.
                  </Text>
                </View>
              </View>

              <View style={[styles.searchBar, searchPreview !== 'start' ? styles.searchBarFocused : undefined]}>
                <MaterialIcons name="search" size={18} color={hexToRgba(colors.text, 0.45)} />
                <TextInput
                  value={searchText}
                  onChangeText={setQuery}
                  style={styles.searchInput}
                  placeholder="Search transactions, merchants, notes..."
                  placeholderTextColor={hexToRgba(colors.text, 0.45)}
                />
                <Pressable style={styles.searchFilterButton}>
                  <MaterialIcons name="tune" size={18} color={colors.primaryDark} />
                </Pressable>
              </View>
            </View>

            {searchPreview === 'start' ? (
              <>
                <View style={styles.surfaceCard}>
                  <View style={styles.inlineHeader}>
                    <Text style={styles.sectionTitle}>Popular categories</Text>
                    <Text style={styles.inlineLink}>See all</Text>
                  </View>
                  <View style={styles.categoryGrid}>
                    {categoryCards.map((item) => (
                      <Pressable key={item.label} style={styles.categoryCard}>
                        <View style={styles.categoryIconWrap}>
                          <MaterialIcons name={item.icon} size={20} color={colors.primaryDark} />
                        </View>
                        <Text style={styles.categoryCardText}>{item.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.surfaceCard}>
                  <View style={styles.inlineHeader}>
                    <Text style={styles.sectionTitle}>Recent searches</Text>
                    <Text style={styles.inlineLink}>Clear</Text>
                  </View>
                  <View style={styles.searchHistoryList}>
                    {recentSearches.map((item, index) => (
                      <View
                        key={item}
                        style={[
                          styles.historyRow,
                          index !== recentSearches.length - 1 ? styles.rowDivider : undefined,
                        ]}
                      >
                        <View style={styles.historyLeading}>
                          <MaterialIcons name="history" size={18} color={hexToRgba(colors.text, 0.44)} />
                          <Text style={styles.historyText}>{item}</Text>
                        </View>
                        <MaterialIcons name="north-east" size={18} color={hexToRgba(colors.text, 0.32)} />
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : null}

            {searchPreview === 'suggest' ? (
              <View style={styles.surfaceCard}>
                <Text style={styles.sectionTitle}>Suggested categories</Text>
                <Text style={styles.surfaceCardBody}>
                  We found possible matches based on your input.
                </Text>
                <View style={styles.suggestionList}>
                  {suggestItems.map((item, index) => (
                    <View
                      key={item}
                      style={[
                        styles.suggestRow,
                        index !== suggestItems.length - 1 ? styles.rowDivider : undefined,
                      ]}
                    >
                      <Text style={styles.suggestText}>{item}</Text>
                      <MaterialIcons name="north-east" size={18} color={hexToRgba(colors.text, 0.3)} />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {searchPreview === 'loading' ? (
              <View style={styles.loaderCard}>
                <ActivityIndicator size="large" color={colors.primaryDark} />
                <Text style={styles.loaderTitle}>Searching transactions...</Text>
                <Text style={styles.loaderBody}>We are scanning merchants, notes and categories for matches.</Text>
              </View>
            ) : null}

            {searchPreview === 'results' ? (
              <>
                <View style={styles.surfaceCard}>
                  <View style={styles.inlineHeader}>
                    <Text style={styles.sectionTitle}>Search results</Text>
                    <Text style={styles.inlineLink}>2,168 found</Text>
                  </View>
                  <View style={styles.resultChips}>
                    {categoryCards.map((item) => (
                      <View key={item.label} style={styles.filterChip}>
                        <Text style={styles.filterChipText}>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {results.map((item) => (
                  <View key={item.id} style={styles.resultCard}>
                    <View style={styles.resultLeft}>
                      <View style={styles.resultIconWrap}>
                        <MaterialIcons name="local-cafe" size={18} color={colors.primaryDark} />
                      </View>
                      <View style={styles.resultCopy}>
                        <Text style={styles.resultMerchant}>{item.merchant}</Text>
                        <Text style={styles.resultNote}>{item.note}</Text>
                        <Text style={styles.resultDate}>{item.date}</Text>
                      </View>
                    </View>
                    <Text style={styles.resultAmount}>{item.amount}</Text>
                  </View>
                ))}
              </>
            ) : null}

            {searchPreview === 'filter' ? (
              <View style={styles.filterPanel}>
                <View style={styles.inlineHeader}>
                  <Text style={styles.sectionTitle}>Filter search</Text>
                  <Text style={styles.inlineLink}>Clear all</Text>
                </View>
                <Text style={styles.surfaceCardBody}>
                  Narrow results by date, category and amount range.
                </Text>

                <View style={styles.filterBlock}>
                  <View style={styles.inlineHeader}>
                    <Text style={styles.filterLabel}>Date range</Text>
                    <Text style={styles.filterMeta}>Flexible</Text>
                  </View>
                  <View style={styles.dateRow}>
                    <View style={styles.dateInput}>
                      <Text style={styles.dateText}>03/01/2026</Text>
                    </View>
                    <View style={styles.dateInput}>
                      <Text style={styles.dateText}>03/21/2026</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.filterBlock}>
                  <View style={styles.inlineHeader}>
                    <Text style={styles.filterLabel}>Categories</Text>
                    <Text style={styles.filterMeta}>3 selected</Text>
                  </View>
                  <View style={styles.resultChips}>
                    {categoryCards.map((item) => (
                      <View key={item.label} style={styles.filterChip}>
                        <Text style={styles.filterChipText}>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.filterBlock}>
                  <View style={styles.inlineHeader}>
                    <Text style={styles.filterLabel}>Amount</Text>
                    <Text style={styles.filterMeta}>$0 - $500</Text>
                  </View>
                  <View style={styles.sliderTrack}>
                    <View style={styles.sliderValue} />
                    <View style={styles.sliderThumb} />
                  </View>
                </View>

                <Pressable style={styles.primaryAction}>
                  <Text style={styles.primaryActionText}>Apply filter (23)</Text>
                  <MaterialIcons name="tune" size={16} color={colors.card} />
                </Pressable>
              </View>
            ) : null}

            {searchPreview === 'empty' ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <MaterialIcons name="search-off" size={42} color={colors.primaryDark} />
                </View>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptyBody}>
                  Try a broader merchant name, a wider date range, or search by category instead.
                </Text>
                <View style={styles.resultChips}>
                  {categoryCards.map((item) => (
                    <View key={item.label} style={styles.filterChip}>
                      <Text style={styles.filterChipText}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
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
      paddingBottom: 120,
      gap: 16,
    },
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 14,
    },
    pageHeaderCopy: {
      flex: 1,
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.4,
      color: colors.text,
    },
    pageBody: {
      marginTop: 8,
      fontSize: Typography.body,
      lineHeight: 21,
      color: hexToRgba(colors.text, 0.6),
    },
    pageHeaderAction: {
      width: 48,
      height: 48,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroCard: {
      borderRadius: 26,
      padding: 22,
      gap: 16,
      shadowColor: colors.shadow,
      shadowOpacity: 0.16,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 6,
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.1,
    },
    heroTitle: {
      fontSize: 22,
      lineHeight: 30,
      fontWeight: '800',
    },
    heroStatsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    heroStat: {
      flex: 1,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    heroStatValue: {
      fontSize: 22,
      fontWeight: '800',
    },
    heroStatLabel: {
      marginTop: 4,
      fontSize: Typography.body,
    },
    switchCard: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 16,
      gap: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    surfaceSwitch: {
      flexDirection: 'row',
      gap: 10,
    },
    surfaceButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 18,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    surfaceButtonText: {
      fontSize: Typography.body,
      fontWeight: '700',
    },
    previewRow: {
      gap: 8,
      paddingRight: 8,
    },
    previewChip: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    previewChipText: {
      fontSize: Typography.body,
      fontWeight: '700',
    },
    surfaceCard: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 18,
      gap: 14,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    surfaceCardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    surfaceHeaderCopy: {
      flex: 1,
      minWidth: 0,
    },
    surfaceCardTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    surfaceCardBody: {
      marginTop: 8,
      fontSize: Typography.body,
      lineHeight: 21,
      color: hexToRgba(colors.text, 0.58),
    },
    statusRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
    statusPill: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    statusPillText: {
      fontSize: Typography.body,
      fontWeight: '700',
    },
    sectionStack: {
      gap: 10,
    },
    inlineHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    inlineLink: {
      fontSize: Typography.body,
      fontWeight: '700',
      color: colors.primaryDark,
    },
    notificationCard: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 16,
      gap: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    notificationTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    notificationLeading: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    notificationIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(colors.primaryDark, 0.1),
    },
    notificationCopy: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: Typography.body,
      fontWeight: '700',
      color: colors.text,
    },
    notificationBody: {
      marginTop: 6,
      fontSize: Typography.body,
      lineHeight: 20,
      color: hexToRgba(colors.text, 0.6),
    },
    notificationTime: {
      fontSize: Typography.body,
      fontWeight: '600',
      color: hexToRgba(colors.text, 0.42),
    },
    inlineAction: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: hexToRgba(colors.primaryDark, 0.08),
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    inlineActionText: {
      fontSize: Typography.body,
      fontWeight: '700',
      color: colors.primaryDark,
    },
    emptyCard: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 22,
      paddingVertical: 30,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    emptyIconWrap: {
      width: 88,
      height: 88,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(colors.primaryDark, 0.08),
    },
    emptyTitle: {
      marginTop: 18,
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    emptyBody: {
      marginTop: 10,
      fontSize: Typography.body,
      lineHeight: 21,
      color: hexToRgba(colors.text, 0.58),
      textAlign: 'center',
    },
    searchBar: {
      minHeight: 56,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    searchBarFocused: {
      backgroundColor: colors.card,
      borderColor: hexToRgba(colors.primaryDark, 0.4),
    },
    searchInput: {
      flex: 1,
      fontSize: Typography.body,
      color: colors.text,
      paddingVertical: 0,
    },
    searchFilterButton: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(colors.primaryDark, 0.08),
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    categoryCard: {
      width: '47%',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 14,
      paddingVertical: 16,
      gap: 10,
    },
    categoryIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryLight,
    },
    categoryCardText: {
      fontSize: Typography.body,
      fontWeight: '700',
      color: colors.text,
    },
    searchHistoryList: {
      gap: 2,
    },
    historyRow: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    historyLeading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      paddingRight: 8,
    },
    historyText: {
      fontSize: Typography.body,
      color: colors.text,
      fontWeight: '600',
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: hexToRgba(colors.text, 0.08),
    },
    suggestionList: {
      marginTop: 4,
      gap: 2,
    },
    suggestRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    suggestText: {
      fontSize: Typography.body,
      color: colors.text,
      fontWeight: '600',
    },
    loaderCard: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      minHeight: 280,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    loaderTitle: {
      marginTop: 18,
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    loaderBody: {
      marginTop: 8,
      fontSize: Typography.body,
      lineHeight: 21,
      color: hexToRgba(colors.text, 0.58),
      textAlign: 'center',
    },
    resultChips: {
      marginTop: 2,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterChip: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.backgroundSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipText: {
      fontSize: Typography.body,
      fontWeight: '700',
      color: hexToRgba(colors.text, 0.68),
    },
    resultCard: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    resultLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingRight: 8,
    },
    resultIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(colors.primaryDark, 0.1),
    },
    resultCopy: {
      flex: 1,
    },
    resultMerchant: {
      fontSize: Typography.body,
      fontWeight: '700',
      color: colors.text,
    },
    resultNote: {
      marginTop: 4,
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.58),
    },
    resultDate: {
      marginTop: 4,
      fontSize: Typography.body,
      color: hexToRgba(colors.text, 0.42),
    },
    resultAmount: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    filterPanel: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 18,
      gap: 16,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    filterBlock: {
      gap: 10,
    },
    filterLabel: {
      fontSize: Typography.body,
      fontWeight: '700',
      color: colors.text,
    },
    filterMeta: {
      fontSize: Typography.body,
      fontWeight: '700',
      color: hexToRgba(colors.text, 0.52),
    },
    dateRow: {
      flexDirection: 'row',
      gap: 10,
    },
    dateInput: {
      flex: 1,
      minHeight: 44,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSoft,
      paddingHorizontal: 14,
      justifyContent: 'center',
    },
    dateText: {
      fontSize: Typography.body,
      fontWeight: '600',
      color: hexToRgba(colors.text, 0.56),
    },
    sliderTrack: {
      height: 8,
      borderRadius: 999,
      backgroundColor: hexToRgba(colors.text, 0.12),
      position: 'relative',
      overflow: 'visible',
    },
    sliderValue: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '58%',
      borderRadius: 999,
      backgroundColor: colors.primaryDark,
    },
    sliderThumb: {
      position: 'absolute',
      top: -6,
      left: '56%',
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 3,
      borderColor: colors.primaryDark,
      backgroundColor: colors.card,
    },
    primaryAction: {
      minHeight: 48,
      borderRadius: 999,
      backgroundColor: colors.primaryDark,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    primaryActionText: {
      fontSize: Typography.body,
      fontWeight: '700',
      color: colors.card,
    },
  });
}
