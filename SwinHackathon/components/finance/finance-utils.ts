import { FinanceTransaction } from '@/components/home/mock-data';

export type DisplayCurrency = 'USD' | 'AUD' | 'VND';
export type DisplayUnit = 'share' | 'lot';

const CURRENCY_CONFIG: Record<DisplayCurrency, { symbol: string; rate: number; suffix?: string }> = {
  USD: { symbol: '$', rate: 1 },
  AUD: { symbol: 'A$', rate: 1.54 },
  VND: { symbol: '₫', rate: 25500 },
};

export function formatCurrency(value: number) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toFixed(2)}`;
}

export function formatCompactCurrency(value: number) {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }

  return formatCurrency(value);
}

export function groupTransactionsByDate(transactions: FinanceTransaction[]) {
  return transactions.reduce<Record<string, FinanceTransaction[]>>((acc, item) => {
    if (!acc[item.dateLabel]) {
      acc[item.dateLabel] = [];
    }

    acc[item.dateLabel].push(item);
    return acc;
  }, {});
}

export function makeReference(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

export function convertCurrencyFromUsd(value: number, currency: DisplayCurrency) {
  return value * CURRENCY_CONFIG[currency].rate;
}

export function formatDisplayCurrency(value: number, currency: DisplayCurrency) {
  const config = CURRENCY_CONFIG[currency];
  const converted = convertCurrencyFromUsd(value, currency);
  const abs = Math.abs(converted);
  const decimals = currency === 'VND' ? 0 : 2;
  const body = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${converted < 0 ? '-' : ''}${config.symbol}${body}${config.suffix ?? ''}`;
}

export function formatSignedDisplayCurrency(value: number, currency: DisplayCurrency) {
  const formatted = formatDisplayCurrency(Math.abs(value), currency);
  return `${value >= 0 ? '+' : '-'}${formatted}`;
}

export function unitToShares(quantity: number, unit: DisplayUnit) {
  return unit === 'lot' ? quantity * 100 : quantity;
}

export function sharesToUnit(shares: number, unit: DisplayUnit) {
  return unit === 'lot' ? shares / 100 : shares;
}

export function formatDisplayUnit(shares: number, unit: DisplayUnit) {
  const quantity = sharesToUnit(shares, unit);
  const suffix = unit === 'lot' ? 'lots' : quantity === 1 ? 'share' : 'shares';
  return `${quantity.toFixed(unit === 'lot' ? 2 : 2)} ${suffix}`;
}
