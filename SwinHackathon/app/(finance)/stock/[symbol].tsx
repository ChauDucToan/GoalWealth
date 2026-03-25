import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { getGoalAwareStockAdvice } from '@/components/finance/stock-advice';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { MarketDisplayControls } from '@/components/finance/MarketDisplayControls';
import { StockTrendChart } from '@/components/finance/StockTrendChart';
import {
  formatDisplayCurrency,
  formatDisplayUnit,
  formatSignedDisplayCurrency,
} from '@/components/finance/finance-utils';
import { useAssistant } from '@/hooks/use-assistant';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

function formatSignedPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export default function StockDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { openCustomAssistantThread } = useAssistant();
  const { symbol } = useLocalSearchParams<{ symbol?: string }>();
  const {
    getHoldingBySymbol,
    getStockBySymbol,
    toggleStockWatch,
    watchlistSymbols,
    defaultStockSymbol,
    displayCurrency,
    displayUnit,
    setDefaultStockSymbol,
    setDisplayCurrency,
    setDisplayUnit,
  } = useFinance();
  const stock = getStockBySymbol(symbol ?? '');
  const holding = stock ? getHoldingBySymbol(stock.symbol) : undefined;
  const isWatched = stock ? watchlistSymbols.includes(stock.symbol) : false;
  const isDefault = stock ? defaultStockSymbol === stock.symbol : false;
  const labels = ['1D', '1W', '1M', '3M', '6M', '1Y'];

  if (!stock) {
    return (
      <FinanceScreen title="Stock Detail" subtitle="No stock found for this symbol">
        <FinanceCard>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            This mock quote is not available yet.
          </Text>
          <ThemeButton
            title="Back to investments"
            onPress={() => router.replace('/(finance)/investments')}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.fullButton}
          />
        </FinanceCard>
      </FinanceScreen>
    );
  }

  const positionValue = holding ? holding.shares * stock.price : 0;
  const unrealizedPnL = holding ? (stock.price - holding.averageCost) * holding.shares : 0;
  const stockAdvice = getGoalAwareStockAdvice({
    stock,
    holding,
    isWatched,
    displayCurrency,
  });

  const askAboutStock = () => {
    openCustomAssistantThread({
      id: `stock-detail-${stock.symbol}`,
      title: `${stock.symbol} advice`,
      prompt: `Explain the current advice for ${stock.symbol}.`,
      icon: 'insights',
      messages: [
        {
          id: `stock-detail-user-${stock.symbol}`,
          role: 'user',
          text: `Explain the current advice for ${stock.symbol}.`,
          meta: 'Now',
        },
        {
          id: `stock-detail-reply-${stock.symbol}`,
          role: 'assistant',
          text: stockAdvice.assistantReply,
          meta: 'Now',
        },
      ],
    });
    router.push({
      pathname: '/(assistant)/chat/[scenario]',
      params: { scenario: 'custom' },
    });
  };

  return (
    <FinanceScreen
      title={stock.symbol}
      subtitle={stock.name}
      rightAccessory={
        <Pressable
          style={[
            styles.watchButton,
            {
              backgroundColor: isWatched
                ? hexToRgba(stock.accent, 0.12)
                : colors.card,
              borderColor: hexToRgba(stock.accent, 0.18),
            },
          ]}
          onPress={() => toggleStockWatch(stock.symbol)}
        >
          <MaterialIcons
            name={isWatched ? 'bookmark' : 'bookmark-border'}
            size={18}
            color={stock.accent}
          />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard
          style={[
            styles.heroCard,
            { backgroundColor: hexToRgba(stock.accent, 0.1) },
          ]}
        >
          <Text style={[styles.heroPrice, { color: colors.text }]}>
            {formatDisplayCurrency(stock.price, displayCurrency)}
          </Text>
          <Text
            style={[
              styles.heroChange,
              { color: stock.changePercent >= 0 ? colors.primaryDark : colors.error },
            ]}
          >
            {formatSignedDisplayCurrency(stock.dayChange, displayCurrency)} (
            {formatSignedPercent(stock.changePercent)})
          </Text>
          <Text style={[styles.heroSector, { color: hexToRgba(colors.text, 0.56) }]}>
            {stock.sector}
          </Text>

          <View style={styles.heroChart}>
            <StockTrendChart
              values={stock.chart}
              accent={stock.accent}
              labelColor={hexToRgba(colors.text, 0.44)}
              height={122}
              barWidth={12}
            />
          </View>

          <View style={styles.rangeRow}>
            {labels.map((label, index) => (
              <View
                key={label}
                style={[
                  styles.rangeChip,
                  {
                    backgroundColor:
                      index === 2 ? stock.accent : hexToRgba(stock.accent, 0.1),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rangeChipText,
                    { color: index === 2 ? colors.card : stock.accent },
                  ]}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </FinanceCard>

        <View style={styles.buttonRow}>
          <ThemeButton
            title="Ask Finpal AI"
            onPress={askAboutStock}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.halfButton}
          />
          <ThemeButton
            title={isDefault ? 'Default stock' : 'Set default'}
            onPress={() => setDefaultStockSymbol(stock.symbol)}
            colorBackground={colors.card}
            colorText={colors.text}
            style={[
              styles.halfButton,
              { borderWidth: 1, borderColor: hexToRgba(stock.accent, 0.16) },
            ]}
          />
        </View>

        <FinanceCard style={[styles.adviceCard, { backgroundColor: colors.backgroundSoft }]}>
          <Text style={[styles.adviceLabel, { color: hexToRgba(colors.text, 0.5) }]}>
            CURRENT ADVICE
          </Text>
          <Text style={[styles.adviceTitle, { color: colors.text }]}>{stockAdvice.title}</Text>
          <Text style={[styles.adviceBody, { color: hexToRgba(colors.text, 0.56) }]}>
            {stockAdvice.body}
          </Text>
        </FinanceCard>

        <MarketDisplayControls
          currency={displayCurrency}
          unit={displayUnit}
          onCurrencyChange={setDisplayCurrency}
          onUnitChange={setDisplayUnit}
        />

        <View style={styles.statRow}>
          <FinanceCard style={styles.statCard}>
            <Text style={[styles.statLabel, { color: hexToRgba(colors.text, 0.52) }]}>
              Market cap
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stock.marketCap}</Text>
          </FinanceCard>
          <FinanceCard style={styles.statCard}>
            <Text style={[styles.statLabel, { color: hexToRgba(colors.text, 0.52) }]}>
              Volume
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stock.volume}</Text>
          </FinanceCard>
        </View>

        <View style={styles.statRow}>
          <FinanceCard style={styles.statCard}>
            <Text style={[styles.statLabel, { color: hexToRgba(colors.text, 0.52) }]}>
              P/E
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stock.peRatio}</Text>
          </FinanceCard>
          <FinanceCard style={styles.statCard}>
            <Text style={[styles.statLabel, { color: hexToRgba(colors.text, 0.52) }]}>
              Watchlist
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {isWatched ? 'Saved' : 'Not saved'}
            </Text>
          </FinanceCard>
        </View>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Position</Text>

          {holding ? (
            <View style={styles.positionWrap}>
              <View style={styles.positionRow}>
                <Text style={[styles.positionLabel, { color: hexToRgba(colors.text, 0.56) }]}>
                  Quantity
                </Text>
                <Text style={[styles.positionValue, { color: colors.text }]}>
                  {formatDisplayUnit(holding.shares, displayUnit)}
                </Text>
              </View>
              <View style={styles.positionRow}>
                <Text style={[styles.positionLabel, { color: hexToRgba(colors.text, 0.56) }]}>
                  Avg cost
                </Text>
                <Text style={[styles.positionValue, { color: colors.text }]}>
                  {formatDisplayCurrency(holding.averageCost, displayCurrency)}
                </Text>
              </View>
              <View style={styles.positionRow}>
                <Text style={[styles.positionLabel, { color: hexToRgba(colors.text, 0.56) }]}>
                  Position value
                </Text>
                <Text style={[styles.positionValue, { color: colors.text }]}>
                  {formatDisplayCurrency(positionValue, displayCurrency)}
                </Text>
              </View>
              <View style={styles.positionRow}>
                <Text style={[styles.positionLabel, { color: hexToRgba(colors.text, 0.56) }]}>
                  Unrealized P/L
                </Text>
                <Text
                  style={[
                    styles.positionValue,
                    { color: unrealizedPnL >= 0 ? colors.primaryDark : colors.error },
                  ]}
                >
                  {formatSignedDisplayCurrency(unrealizedPnL, displayCurrency)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: hexToRgba(colors.text, 0.58) }]}>
              You are not holding this stock yet. Keep it on watch or ask Finpal AI for context.
            </Text>
          )}
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.aboutText, { color: hexToRgba(colors.text, 0.6) }]}>
            {stock.about}
          </Text>
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  fullButton: {
    marginTop: 16,
  },
  watchButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.body,
    lineHeight: 22,
  },
  heroCard: {
    borderRadius: 28,
  },
  heroPrice: {
    fontSize: 30,
    fontWeight: '800',
  },
  heroChange: {
    marginTop: 8,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  heroSector: {
    marginTop: 6,
    fontSize: Typography.body,
  },
  heroChart: {
    marginTop: 18,
  },
  rangeRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rangeChip: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeChipText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfButton: {
    flex: 1,
  },
  adviceCard: {
    gap: 6,
  },
  adviceLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  adviceTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  adviceBody: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  statValue: {
    marginTop: 8,
    fontSize: 19,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  positionWrap: {
    marginTop: 14,
    gap: 14,
  },
  positionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  positionLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  positionValue: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  aboutText: {
    marginTop: 12,
    fontSize: Typography.body,
    lineHeight: 23,
  },
});
