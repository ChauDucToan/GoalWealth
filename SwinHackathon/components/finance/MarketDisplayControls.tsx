import { hexToRgba } from '@/components/auth/AuthKit';
import { DisplayCurrency, DisplayUnit } from '@/components/finance/finance-utils';
import { useTheme } from '@/hooks/use-theme-colors';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

const CURRENCIES: DisplayCurrency[] = ['USD', 'AUD', 'VND'];
const UNITS: { label: string; value: DisplayUnit }[] = [
  { label: 'Share', value: 'share' },
  { label: 'Lot', value: 'lot' },
];

export function MarketDisplayControls({
  currency,
  unit,
  onCurrencyChange,
  onUnitChange,
}: {
  currency: DisplayCurrency;
  unit: DisplayUnit;
  onCurrencyChange: (currency: DisplayCurrency) => void;
  onUnitChange: (unit: DisplayUnit) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.group,
          {
            backgroundColor: colors.card,
            borderColor: hexToRgba(colors.primaryDark, 0.08),
          },
        ]}
      >
        <Text style={[styles.label, { color: hexToRgba(colors.text, 0.52) }]}>Currency</Text>
        <View style={styles.chipRow}>
          {CURRENCIES.map((item) => {
            const selected = item === currency;

            return (
              <Pressable
                key={item}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.primaryDark : colors.backgroundSoft,
                  },
                ]}
                onPress={() => onCurrencyChange(item)}
              >
                <Text style={[styles.chipText, { color: selected ? colors.card : colors.text }]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.group,
          {
            backgroundColor: colors.card,
            borderColor: hexToRgba(colors.primaryDark, 0.08),
          },
        ]}
      >
        <Text style={[styles.label, { color: hexToRgba(colors.text, 0.52) }]}>Unit</Text>
        <View style={styles.chipRow}>
          {UNITS.map((item) => {
            const selected = item.value === unit;

            return (
              <Pressable
                key={item.value}
                style={[
                  styles.chip,
                  {
                    flex: 1,
                    backgroundColor: selected ? colors.primaryDark : colors.backgroundSoft,
                  },
                ]}
                onPress={() => onUnitChange(item.value)}
              >
                <Text style={[styles.chipText, { color: selected ? colors.card : colors.text }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  group: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  label: {
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chipRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
});
