import { ThemeButton } from '@/components/ThemeButton';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { MarketDisplayControls } from '@/components/finance/MarketDisplayControls';
import { StockTrendChart } from '@/components/finance/StockTrendChart';
import {
  formatDisplayCurrency,
  formatDisplayUnit,
  formatSignedDisplayCurrency,
} from '@/components/finance/finance-utils';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

function formatSignedPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export default function InvestmentsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    stocks,
    stockHoldings,
    watchlistSymbols,
    defaultStockSymbol,
    displayCurrency,
    displayUnit,
    setDefaultStockSymbol,
    setDisplayCurrency,
    setDisplayUnit,
  } = useFinance();

  const holdings = stockHoldings
    .map((holding) => {
      const stock = stocks.find((item) => item.symbol === holding.symbol);
      return stock ? { holding, stock } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const watchlist = watchlistSymbols
    .map((symbol) => stocks.find((item) => item.symbol === symbol))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const featured =
    stocks.find((item) => item.symbol === defaultStockSymbol) ??
    holdings[0]?.stock ??
    watchlist[0] ??
    stocks[0];
  const portfolioValue = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.price,
    0
  );
  const investedCost = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.holding.averageCost,
    0
  );
  const portfolioDayChange = holdings.reduce(
    (sum, item) => sum + item.holding.shares * item.stock.dayChange,
    0
  );
  const totalGain = portfolioValue - investedCost;
  const topHolding = holdings[0];

  return (
    <FinanceScreen
      title="Investments"
      subtitle="Track holdings, buy new shares and keep an eye on your watchlist"
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
            <View style={styles.rowBetween}>
              <View>
              <Text style={[styles.heroEyebrow, { color: hexToRgba(colors.card, 0.72) }]}>
                Portfolio value
              </Text>
              <Text style={[styles.heroValue, { color: colors.card }]}>
                {formatDisplayCurrency(portfolioValue, displayCurrency)}
              </Text>
              <Text style={[styles.heroMeta, { color: hexToRgba(colors.card, 0.76) }]}>
                {formatSignedDisplayCurrency(portfolioDayChange, displayCurrency)} today
              </Text>
              </View>

              <View
                style={styles.heroRight}
              >
                <View
                  style={[
                    styles.heroIcon,
                    { backgroundColor: hexToRgba(colors.card, 0.16) },
                  ]}
                >
                  <MaterialIcons name="trending-up" size={26} color={colors.card} />
                </View>
                {featured ? (
                  <Pressable
                    style={[
                      styles.defaultBadge,
                      { backgroundColor: hexToRgba(colors.card, 0.16) },
                    ]}
                    onPress={() => setDefaultStockSymbol(featured.symbol)}
                  >
                    <MaterialIcons name="star" size={12} color={colors.card} />
                    <Text style={[styles.defaultBadgeText, { color: colors.card }]}>
                      Default {featured.symbol}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

          {featured ? (
            <View style={styles.heroChartWrap}>
              <StockTrendChart
                values={featured.chart}
                accent={colors.card}
                labelColor={hexToRgba(colors.card, 0.68)}
                height={84}
                barWidth={10}
              />
            </View>
          ) : null}

          <View style={styles.heroButtonRow}>
            <ThemeButton
              title="Buy stock"
              onPress={() => router.push('/(finance)/buy-stock')}
              colorBackground={colors.card}
              colorText={colors.primaryDark}
              style={styles.heroButton}
            />
            <ThemeButton
              title="Open chart"
              onPress={() =>
                featured
                  ? router.push({
                      pathname: '/(finance)/stock/[symbol]',
                      params: { symbol: featured.symbol },
                    })
                  : undefined
              }
              colorBackground={hexToRgba(colors.card, 0.14)}
              colorText={colors.card}
              style={[
                styles.heroButton,
                { borderWidth: 1, borderColor: hexToRgba(colors.card, 0.18) },
              ]}
            />
          </View>
        </FinanceCard>

        <MarketDisplayControls
          currency={displayCurrency}
          unit={displayUnit}
          onCurrencyChange={setDisplayCurrency}
          onUnitChange={setDisplayUnit}
        />

        <View style={styles.summaryRow}>
          <FinanceCard style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.54) }]}>
              Total gain
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: totalGain >= 0 ? colors.primaryDark : colors.error },
              ]}
            >
              {formatDisplayCurrency(totalGain, displayCurrency)}
            </Text>
          </FinanceCard>

          <FinanceCard style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.54) }]}>
              Holdings
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {holdings.length}
            </Text>
          </FinanceCard>
        </View>

        {topHolding ? (
          <FinanceCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Holding</Text>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/stock/[symbol]',
                    params: { symbol: topHolding.stock.symbol },
                  })
                }
              >
                <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open</Text>
              </Pressable>
            </View>

            <Pressable
              style={[
                styles.holdingCard,
                { backgroundColor: hexToRgba(topHolding.stock.accent, 0.08) },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/(finance)/stock/[symbol]',
                  params: { symbol: topHolding.stock.symbol },
                })
              }
            >
              <View
                style={[
                  styles.stockBadge,
                  { backgroundColor: hexToRgba(topHolding.stock.accent, 0.14) },
                ]}
              >
                <MaterialIcons
                  name={topHolding.stock.icon}
                  size={18}
                  color={topHolding.stock.accent}
                />
              </View>
              <View style={styles.stockTextWrap}>
                <Text style={[styles.stockSymbol, { color: colors.text }]}>
                  {topHolding.stock.symbol}
                </Text>
                <Text style={[styles.stockName, { color: hexToRgba(colors.text, 0.52) }]}>
                  {topHolding.stock.name}
                </Text>
              </View>
              <View style={styles.stockValueWrap}>
                <Text style={[styles.stockPrice, { color: colors.text }]}>
                  {formatDisplayCurrency(
                    topHolding.holding.shares * topHolding.stock.price,
                    displayCurrency
                  )}
                </Text>
                <Text style={[styles.stockMeta, { color: colors.primaryDark }]}>
                  {formatDisplayUnit(topHolding.holding.shares, displayUnit)}
                </Text>
              </View>
            </Pressable>
          </FinanceCard>
        ) : null}

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Watchlist</Text>
            <Pressable onPress={() => router.push('/(finance)/buy-stock')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Trade</Text>
            </Pressable>
          </View>

          <ResponsiveGrid
            minItemWidth={140}
            horizontalPadding={34}
            gap={10}
            maxColumns={2}
            style={styles.watchlistGrid}
          >
            {watchlist.slice(0, 4).map((stock) => (
              <View
                key={stock.symbol}
                style={[
                  styles.watchCard,
                  { borderColor: hexToRgba(stock.accent, 0.14) },
                ]}
              >
                <View style={styles.watchCardHeader}>
                  <Text style={[styles.watchSymbol, { color: colors.text }]}>{stock.symbol}</Text>
                  <Pressable
                    style={[
                      styles.watchDefaultButton,
                      {
                        backgroundColor:
                          stock.symbol === defaultStockSymbol
                            ? hexToRgba(stock.accent, 0.14)
                            : colors.backgroundSoft,
                      },
                    ]}
                    onPress={() => setDefaultStockSymbol(stock.symbol)}
                  >
                    <Text
                      style={[
                        styles.watchDefaultText,
                        {
                          color:
                            stock.symbol === defaultStockSymbol
                              ? stock.accent
                              : hexToRgba(colors.text, 0.6),
                        },
                      ]}
                    >
                      {stock.symbol === defaultStockSymbol ? 'Default' : 'Set default'}
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/(finance)/stock/[symbol]',
                      params: { symbol: stock.symbol },
                    })
                  }
                >
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
                </Pressable>
              </View>
            ))}
          </ResponsiveGrid>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Positions</Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Activity</Text>
            </Pressable>
          </View>

          {holdings.map(({ holding, stock }) => {
            const positionValue = holding.shares * stock.price;
            const gainPercent = ((stock.price - holding.averageCost) / holding.averageCost) * 100;

            return (
              <Pressable
                key={stock.symbol}
                style={[
                  styles.positionRow,
                  { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/(finance)/stock/[symbol]',
                    params: { symbol: stock.symbol },
                  })
                }
              >
                <View style={styles.positionLeft}>
                  <View
                    style={[
                      styles.stockBadge,
                      { backgroundColor: hexToRgba(stock.accent, 0.14) },
                    ]}
                  >
                    <MaterialIcons name={stock.icon} size={18} color={stock.accent} />
                  </View>
                  <View>
                    <Text style={[styles.stockSymbol, { color: colors.text }]}>{stock.symbol}</Text>
                    <Text style={[styles.positionMeta, { color: hexToRgba(colors.text, 0.5) }]}>
                      Avg {formatDisplayCurrency(holding.averageCost, displayCurrency)} •{' '}
                      {formatDisplayUnit(holding.shares, displayUnit)}
                    </Text>
                  </View>
                </View>
                <View style={styles.stockValueWrap}>
                  <Text style={[styles.stockPrice, { color: colors.text }]}>
                    {formatDisplayCurrency(positionValue, displayCurrency)}
                  </Text>
                  <Text
                    style={[
                      styles.stockMeta,
                      { color: gainPercent >= 0 ? colors.primaryDark : colors.error },
                    ]}
                  >
                    {formatSignedPercent(gainPercent)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    flexWrap: 'wrap',
  },
  heroCard: {
    borderRadius: 28,
  },
  heroEyebrow: {
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroValue: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '800',
  },
  heroMeta: {
    marginTop: 6,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  defaultBadge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  defaultBadgeText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  heroChartWrap: {
    marginTop: 20,
  },
  heroButtonRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroButton: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
  },
  summaryLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLink: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  holdingCard: {
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stockBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  stockSymbol: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  stockName: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  stockValueWrap: {
    alignItems: 'flex-end',
    minWidth: 0,
    marginLeft: 8,
  },
  stockPrice: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  stockMeta: {
    marginTop: 4,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  watchlistGrid: {
    marginTop: 14,
  },
  watchCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  watchCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  watchDefaultButton: {
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchDefaultText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  watchSymbol: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  watchPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  watchChange: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  positionRow: {
    minHeight: 72,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  positionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  positionMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
});
