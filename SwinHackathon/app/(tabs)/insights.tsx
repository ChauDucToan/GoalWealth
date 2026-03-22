import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { StockTrendChart } from '@/components/finance/StockTrendChart';
import {
  formatCompactCurrency,
  formatCurrency,
  formatDisplayCurrency,
} from '@/components/finance/finance-utils';
import { budgetCategories, spendingInsights } from '@/components/home/mock-data';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

function formatSignedPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export default function InsightsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { stocks, stockHoldings, watchlistSymbols, displayCurrency, defaultStockSymbol } =
    useFinance();
  const [selectedActivityDay, setSelectedActivityDay] = React.useState(
    spendingInsights[3] ?? spendingInsights[0]
  );
  const weeklyAverage =
    spendingInsights.reduce((sum, item) => sum + item.amount, 0) / spendingInsights.length;
  const holdings = stockHoldings
    .map((holding) => {
      const stock = stocks.find((item) => item.symbol === holding.symbol);
      return stock ? { holding, stock } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const watchlist = watchlistSymbols
    .map((symbol) => stocks.find((item) => item.symbol === symbol))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const portfolioValue = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.price,
    0
  );
  const portfolioDayChange = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.dayChange,
    0
  );
  const featuredStock =
    stocks.find((item) => item.symbol === defaultStockSymbol) ??
    holdings[0]?.stock ??
    watchlist[0] ??
    stocks[0];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
        <Text style={[styles.eyebrow, { color: hexToRgba(colors.card, 0.74) }]}>
          Insights & markets
        </Text>
        <Text style={[styles.title, { color: colors.card }]}>
          Spending is on track, and your portfolio is still trending upward this week.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Portfolio Snapshot</Text>
          <Pressable onPress={() => router.push('/(finance)/investments')}>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open</Text>
          </Pressable>
        </View>

        <View style={styles.portfolioHeader}>
          <View>
            <Text style={[styles.portfolioValue, { color: colors.text }]}>
              {formatDisplayCurrency(portfolioValue, displayCurrency)}
            </Text>
            <Text
              style={[
                styles.portfolioMeta,
                { color: portfolioDayChange >= 0 ? colors.primaryDark : colors.error },
              ]}
            >
              {portfolioDayChange >= 0 ? '+' : '-'}
              {formatDisplayCurrency(Math.abs(portfolioDayChange), displayCurrency)} today
            </Text>
          </View>

          <View
            style={[
              styles.portfolioBadge,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
            ]}
          >
            <MaterialIcons name="query-stats" size={22} color={colors.primaryDark} />
          </View>
        </View>

        {featuredStock ? (
          <>
            <View style={styles.featuredRow}>
              <View>
                <Text style={[styles.featuredSymbol, { color: colors.text }]}>
                  {featuredStock.symbol}
                </Text>
                <Text style={[styles.featuredName, { color: hexToRgba(colors.text, 0.56) }]}>
                  {featuredStock.name}
                </Text>
              </View>
              <Text
                style={[
                  styles.featuredChange,
                  {
                    color: featuredStock.changePercent >= 0 ? colors.primaryDark : colors.error,
                  },
                ]}
              >
                {formatSignedPercent(featuredStock.changePercent)}
              </Text>
            </View>

            <View style={styles.chartWrap}>
              <StockTrendChart
                values={featuredStock.chart}
                accent={featuredStock.accent}
                labelColor={hexToRgba(colors.text, 0.44)}
                height={94}
                barWidth={10}
              />
            </View>

            <View style={styles.buttonRow}>
              <ThemeButton
                title="Buy stock"
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/buy-stock',
                    params: { symbol: featuredStock.symbol },
                  })
                }
                colorBackground={colors.primaryDark}
                colorText={colors.card}
                style={styles.halfButton}
              />
              <ThemeButton
                title="View chart"
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/stock/[symbol]',
                    params: { symbol: featuredStock.symbol },
                  })
                }
                colorBackground={colors.backgroundSoft}
                colorText={colors.text}
                style={styles.halfButton}
              />
            </View>
          </>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Watchlist</Text>
          <Pressable onPress={() => router.push('/(finance)/investments')}>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Manage</Text>
          </Pressable>
        </View>

        {watchlist.slice(0, 4).map((stock) => (
          <Pressable
            key={stock.symbol}
            style={[
              styles.watchRow,
              { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
            ]}
            onPress={() =>
              router.push({
                pathname: '/(finance)/stock/[symbol]',
                params: { symbol: stock.symbol },
              })
            }
          >
            <View style={styles.watchLeft}>
              <View
                style={[
                  styles.watchIcon,
                  { backgroundColor: hexToRgba(stock.accent, 0.12) },
                ]}
              >
                <MaterialIcons name={stock.icon} size={18} color={stock.accent} />
              </View>
              <View>
                <Text style={[styles.watchSymbol, { color: colors.text }]}>{stock.symbol}</Text>
                <Text style={[styles.watchName, { color: hexToRgba(colors.text, 0.52) }]}>
                  {stock.sector}
                </Text>
              </View>
            </View>
            <View style={styles.watchRight}>
              <Text style={[styles.watchPrice, { color: colors.text }]}>
                {formatDisplayCurrency(stock.price, displayCurrency)}
              </Text>
              <Text
                style={[
                  styles.watchChange,
                  { color: stock.changePercent >= 0 ? colors.primaryDark : colors.error },
                ]}
              >
                {formatSignedPercent(stock.changePercent)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Activity</Text>
          <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>
            {selectedActivityDay.label}
          </Text>
        </View>
        <View style={styles.chartRow}>
          {spendingInsights.map((item) => (
            <Pressable
              key={item.label}
              style={styles.chartColumn}
              onPress={() => setSelectedActivityDay(item)}
            >
              <View
                style={[
                  styles.chartBar,
                  {
                    height: 30 + item.value,
                    backgroundColor:
                      selectedActivityDay.label === item.label
                        ? colors.primaryDark
                        : item.value > 80
                          ? colors.primaryDark
                          : hexToRgba(colors.primaryDark, 0.2),
                  },
                ]}
              />
              <Text
                style={[
                  styles.chartLabel,
                  {
                    color:
                      selectedActivityDay.label === item.label
                        ? colors.primaryDark
                        : hexToRgba(colors.text, 0.52),
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          style={[
            styles.activityDetailCard,
            { backgroundColor: hexToRgba(colors.primaryDark, 0.06) },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.activityDetailLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                {selectedActivityDay.label} spending
              </Text>
              <Text style={[styles.activityDetailValue, { color: colors.text }]}>
                {formatCurrency(selectedActivityDay.amount)}
              </Text>
            </View>
            <View
              style={[
                styles.activityBadge,
                { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
              ]}
            >
              <Text style={[styles.activityBadgeText, { color: colors.primaryDark }]}>
                {selectedActivityDay.transactions} txns
              </Text>
            </View>
          </View>

          <Text style={[styles.activityDetailBody, { color: hexToRgba(colors.text, 0.58) }]}>
            Top category: {selectedActivityDay.topCategory}. {selectedActivityDay.summary}
          </Text>

          <Text style={[styles.activityDetailFooter, { color: colors.primaryDark }]}>
            Weekly average {formatCurrency(weeklyAverage)}
          </Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
          <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>
            {formatCompactCurrency(
              budgetCategories.reduce((sum, item) => sum + item.spent, 0)
            )}
          </Text>
        </View>

        {budgetCategories.map((item) => (
          <View key={item.id} style={styles.categoryRow}>
            <View style={styles.categoryTextWrap}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: hexToRgba(item.accent, 0.12) },
                ]}
              >
                <MaterialIcons name={item.icon} size={18} color={item.accent} />
              </View>
              <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
            </View>
            <Text style={[styles.categoryValue, { color: item.accent }]}>
              {formatCurrency(item.spent)}
            </Text>
          </View>
        ))}

        <ThemeButton
          title="Open investment center"
          onPress={() => router.push('/(finance)/investments')}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.investmentButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 66,
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 16,
  },
  heroCard: {
    borderRadius: 26,
    padding: 20,
    shadowColor: 'rgba(15,23,42,0.12)',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  eyebrow: {
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    marginTop: 10,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '800',
  },
  card: {
    borderRadius: 24,
    padding: 18,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionLink: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  portfolioHeader: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    flexWrap: 'wrap',
  },
  portfolioValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  portfolioMeta: {
    marginTop: 6,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  portfolioBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  featuredSymbol: {
    fontSize: 18,
    fontWeight: '800',
  },
  featuredName: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  featuredChange: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  chartWrap: {
    marginTop: 16,
  },
  buttonRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  halfButton: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
  },
  watchRow: {
    minHeight: 70,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  watchLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  watchIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchSymbol: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  watchName: {
    marginTop: 4,
    fontSize: Typography.body,
    flexShrink: 1,
  },
  watchRight: {
    alignItems: 'flex-end',
    minWidth: 0,
    marginLeft: 8,
  },
  watchPrice: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  watchChange: {
    marginTop: 4,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  chartRow: {
    marginTop: 20,
    height: 150,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartColumn: {
    alignItems: 'center',
  },
  chartBar: {
    width: 24,
    borderRadius: 12,
  },
  chartLabel: {
    marginTop: 10,
    fontSize: Typography.body,
  },
  activityDetailCard: {
    marginTop: 18,
    borderRadius: 18,
    padding: 14,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  activityDetailLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  activityDetailValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
  },
  activityBadge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBadgeText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  activityDetailBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  activityDetailFooter: {
    marginTop: 10,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  categoryRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: Typography.body,
    fontWeight: '700',
    flexShrink: 1,
  },
  categoryValue: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  investmentButton: {
    marginTop: 20,
    width: '100%',
  },
});
