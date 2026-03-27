import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { MarketDisplayControls } from '@/components/finance/MarketDisplayControls';
import {
  formatDisplayCurrency,
  formatDisplayUnit,
  unitToShares,
} from '@/components/finance/finance-utils';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import { useLocalSearchParams, useRouter } from '@/lib/expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function BuyStockScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { symbol } = useLocalSearchParams<{ symbol?: string }>();
  const {
    buyStock,
    getHoldingBySymbol,
    getStockBySymbol,
    stocks,
    watchlistSymbols,
    displayCurrency,
    displayUnit,
    setDisplayCurrency,
    setDisplayUnit,
  } = useFinance();
  const symbolOptions = useMemo(
    () =>
      Array.from(new Set([...watchlistSymbols, ...stocks.map((item) => item.symbol)])).slice(0, 6),
    [stocks, watchlistSymbols]
  );
  const fallbackSymbol = symbolOptions[0] ?? stocks[0]?.symbol ?? 'NVDA';
  const [selectedSymbol, setSelectedSymbol] = useState(symbol ?? fallbackSymbol);
  const [sharesInput, setSharesInput] = useState('1');

  useEffect(() => {
    if (symbol) {
      setSelectedSymbol(symbol);
    }
  }, [symbol]);

  const stock = getStockBySymbol(selectedSymbol) ?? stocks[0];
  const existingHolding = stock ? getHoldingBySymbol(stock.symbol) : undefined;
  const parsedQuantity = Number(sharesInput.replace(/[^0-9.]/g, ''));
  const sharesToBuy = unitToShares(parsedQuantity, displayUnit);
  const estimatedTotal = stock && sharesToBuy ? stock.price * sharesToBuy : 0;
  const validOrder = Boolean(stock && Number.isFinite(sharesToBuy) && sharesToBuy > 0);

  const handleBuy = () => {
    if (!stock || !validOrder) {
      return;
    }

    buyStock(stock.symbol, sharesToBuy);
    router.replace({
      pathname: '/(finance)/stock/[symbol]',
      params: { symbol: stock.symbol },
    });
  };

  return (
    <FinanceScreen title="Buy Stock" subtitle="Mock trade flow for portfolio and watchlist testing">
      <View style={styles.stack}>
        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose ticker</Text>
          <View style={styles.symbolWrap}>
            {symbolOptions.map((item) => {
              const selected = item === stock?.symbol;
              return (
                <Pressable
                  key={item}
                  style={[
                    styles.symbolChip,
                    {
                      backgroundColor: selected ? colors.primaryDark : colors.backgroundSoft,
                    },
                  ]}
                  onPress={() => setSelectedSymbol(item)}
                >
                  <Text
                    style={[
                      styles.symbolChipText,
                      { color: selected ? colors.card : colors.text },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        {stock ? (
          <FinanceCard
            style={[
              styles.quoteCard,
              { backgroundColor: hexToRgba(stock.accent, 0.08) },
            ]}
          >
            <View style={styles.quoteHeader}>
              <View>
                <Text style={[styles.stockSymbol, { color: colors.text }]}>{stock.symbol}</Text>
                <Text style={[styles.stockName, { color: hexToRgba(colors.text, 0.58) }]}>
                  {stock.name}
                </Text>
              </View>
              <View style={styles.quoteRight}>
                <Text style={[styles.stockPrice, { color: colors.text }]}>
                  {formatDisplayCurrency(stock.price, displayCurrency)}
                </Text>
                <Text
                  style={[
                    styles.stockChange,
                    { color: stock.changePercent >= 0 ? colors.primaryDark : colors.error },
                  ]}
                >
                  {stock.changePercent >= 0 ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                Sector
              </Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{stock.sector}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                Existing position
              </Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>
                {existingHolding ? formatDisplayUnit(existingHolding.shares, displayUnit) : 'None'}
              </Text>
            </View>
          </FinanceCard>
        ) : null}

        <MarketDisplayControls
          currency={displayCurrency}
          unit={displayUnit}
          onCurrencyChange={setDisplayCurrency}
          onUnitChange={setDisplayUnit}
        />

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order size</Text>
          <Text style={[styles.inputLabel, { color: hexToRgba(colors.text, 0.54) }]}>
            {displayUnit === 'lot' ? 'Lots' : 'Shares'}
          </Text>
          <TextInput
            value={sharesInput}
            onChangeText={setSharesInput}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={hexToRgba(colors.text, 0.32)}
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSoft,
                color: colors.text,
                borderColor: hexToRgba(colors.primaryDark, 0.08),
              },
            ]}
          />

          <View style={styles.quickRow}>
            {(displayUnit === 'lot' ? ['0.25', '0.5', '1', '2'] : ['1', '2', '5', '10']).map(
              (size) => (
              <Pressable
                key={size}
                style={[
                  styles.quickChip,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
                onPress={() => setSharesInput(size)}
              >
                <Text style={[styles.quickChipText, { color: colors.primaryDark }]}>
                  {size} {displayUnit === 'lot' ? 'lot' : `share${size === '1' ? '' : 's'}`}
                </Text>
              </Pressable>
              )
            )}
          </View>

          <View
            style={[
              styles.totalCard,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.05) },
            ]}
          >
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                Estimated total
              </Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {formatDisplayCurrency(estimatedTotal, displayCurrency)}
              </Text>
            </View>
            <Text style={[styles.totalHint, { color: hexToRgba(colors.text, 0.56) }]}>
              {displayUnit === 'lot'
                ? '1 lot = 100 shares. This mock order updates the portfolio and adds an investment transaction.'
                : 'This mock order immediately updates the portfolio and adds an investment transaction.'}
            </Text>
          </View>

          <ThemeButton
            title="Confirm purchase"
            onPress={handleBuy}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            disabled={!validOrder}
            style={styles.confirmButton}
          />
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  symbolWrap: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symbolChip: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolChipText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  quoteCard: {
    borderRadius: 24,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  quoteRight: {
    alignItems: 'flex-end',
  },
  stockSymbol: {
    fontSize: 24,
    fontWeight: '800',
  },
  stockName: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  stockPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  stockChange: {
    marginTop: 4,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  metaRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  inputLabel: {
    marginTop: 14,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  input: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
  },
  quickRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  quickChipText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  totalCard: {
    marginTop: 18,
    borderRadius: 18,
    padding: 14,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  totalHint: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 21,
  },
  confirmButton: {
    marginTop: 18,
  },
});
