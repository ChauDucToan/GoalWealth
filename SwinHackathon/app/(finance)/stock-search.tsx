import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { StockTrendChart } from '@/components/finance/StockTrendChart';
import {
  formatDisplayCurrency,
  formatSignedDisplayCurrency,
} from '@/components/finance/finance-utils';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function StockSearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol?: string }>();
  const { stocks, stockHoldings, watchlistSymbols, displayCurrency } = useFinance();
  const [query, setQuery] = useState(params.symbol?.toString() ?? '');

  const heldSymbols = useMemo(
    () => new Set(stockHoldings.map((item) => item.symbol.toUpperCase())),
    [stockHoldings]
  );
  const watchSymbols = useMemo(
    () => new Set(watchlistSymbols.map((item) => item.toUpperCase())),
    [watchlistSymbols]
  );
  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    const scored = stocks
      .map((stock) => {
        if (!normalizedQuery) {
          const baseScore = heldSymbols.has(stock.symbol.toUpperCase())
            ? 30
            : watchSymbols.has(stock.symbol.toUpperCase())
              ? 20
              : 10;
          return { stock, score: baseScore };
        }

        const symbol = stock.symbol.toLowerCase();
        const name = stock.name.toLowerCase();
        const sector = stock.sector.toLowerCase();

        let score = 0;

        if (symbol === normalizedQuery) {
          score += 100;
        } else if (symbol.startsWith(normalizedQuery)) {
          score += 80;
        } else if (symbol.includes(normalizedQuery)) {
          score += 60;
        }

        if (name.startsWith(normalizedQuery)) {
          score += 45;
        } else if (name.includes(normalizedQuery)) {
          score += 30;
        }

        if (sector.includes(normalizedQuery)) {
          score += 12;
        }

        if (heldSymbols.has(stock.symbol.toUpperCase())) {
          score += 6;
        } else if (watchSymbols.has(stock.symbol.toUpperCase())) {
          score += 3;
        }

        return { stock, score };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score || left.stock.symbol.localeCompare(right.stock.symbol));

    return scored.map((item) => item.stock);
  }, [heldSymbols, normalizedQuery, stocks, watchSymbols]);

  const openStockOnDesk = (symbol: string) => {
    router.replace({
      pathname: '/(finance)/investments',
      params: { symbol },
    });
  };

  return (
    <FinanceScreen
      title="Search Stocks"
      subtitle="Find a symbol to preview on your portfolio desk"
    >
      <View style={styles.stack}>
        <FinanceCard>
          <View
            style={[
              styles.searchRow,
              {
                backgroundColor: colors.backgroundSoft,
                borderColor: hexToRgba(colors.primaryDark, 0.1),
              },
            ]}
          >
            <MaterialIcons name="search" size={20} color={hexToRgba(colors.text, 0.48)} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search symbol or company"
              placeholderTextColor={hexToRgba(colors.text, 0.42)}
              style={[styles.searchInput, { color: colors.text }]}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        </FinanceCard>

        {results.length === 0 ? (
          <FinanceCard>
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyBadge,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
              >
                <MaterialIcons name="search-off" size={34} color={colors.primaryDark} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No stock found</Text>
              <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.56) }]}>
                We only search the sample market data already bundled in this app.
              </Text>
            </View>
          </FinanceCard>
        ) : (
          <View style={styles.resultsList}>
            {results.map((stock) => {
              const held = heldSymbols.has(stock.symbol.toUpperCase());
              const watched = watchSymbols.has(stock.symbol.toUpperCase());

              return (
                <Pressable
                  key={stock.symbol}
                  style={[styles.resultCard, { backgroundColor: colors.card }]}
                  onPress={() => openStockOnDesk(stock.symbol)}
                >
                  <View style={styles.resultHeader}>
                    <View style={styles.resultCopy}>
                      <Text style={[styles.resultSymbol, { color: colors.text }]}>{stock.symbol}</Text>
                      <Text style={[styles.resultName, { color: hexToRgba(colors.text, 0.56) }]}>
                        {stock.name}
                      </Text>
                    </View>
                    <View style={styles.resultPriceWrap}>
                      <Text style={[styles.resultPrice, { color: colors.text }]}>
                        {formatDisplayCurrency(stock.price, displayCurrency)}
                      </Text>
                      <Text
                        style={[
                          styles.resultChange,
                          { color: stock.dayChange >= 0 ? colors.success : colors.error },
                        ]}
                      >
                        {formatSignedDisplayCurrency(stock.dayChange, displayCurrency)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={[styles.resultMeta, { color: hexToRgba(colors.text, 0.48) }]}>
                      {stock.sector}
                    </Text>
                    <View style={styles.metaChipRow}>
                      {held ? (
                        <View
                          style={[
                            styles.metaChip,
                            { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                          ]}
                        >
                          <Text style={[styles.metaChipText, { color: colors.primaryDark }]}>
                            Held
                          </Text>
                        </View>
                      ) : null}
                      {watched ? (
                        <View
                          style={[
                            styles.metaChip,
                            { backgroundColor: hexToRgba(colors.warning, 0.12) },
                          ]}
                        >
                          <Text style={[styles.metaChipText, { color: colors.warning }]}>
                            Watchlist
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.chartWrap}>
                    <StockTrendChart
                      values={stock.chart}
                      accent={stock.accent}
                      labelColor={hexToRgba(colors.text, 0.38)}
                      height={56}
                      barWidth={8}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  searchRow: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: Typography.body,
    fontWeight: '600',
    paddingVertical: 0,
  },
  resultsList: {
    gap: 12,
  },
  resultCard: {
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultCopy: {
    flex: 1,
    minWidth: 0,
  },
  resultSymbol: {
    fontSize: 16,
    fontWeight: '800',
  },
  resultName: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  resultPriceWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  resultChange: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  resultMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaChipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaChip: {
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  chartWrap: {
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyBadge: {
    width: 78,
    height: 78,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 21,
    textAlign: 'center',
  },
});
