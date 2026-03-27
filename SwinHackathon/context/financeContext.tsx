import {
  FinanceCategory,
  StockHolding,
  StockQuote,
  FinanceTransaction,
  budgetCategories,
  stockHoldingsSeed,
  stockQuotes,
  stockWatchlistSeed,
  transactionsSeed,
} from '@/components/home/mock-data';
import {
  DisplayCurrency,
  DisplayUnit,
  makeReference,
} from '@/components/finance/finance-utils';
import React, { createContext, useMemo, useState } from 'react';

type CreateTransactionInput = Omit<FinanceTransaction, 'id'> & {
  id?: string;
  dateLabel?: string;
  timeLabel?: string;
  reference?: string;
};

type CreateCategoryInput = Omit<FinanceCategory, 'id'> & {
  id?: string;
};

export type TransactionDraft = {
  type: 'expense' | 'income' | 'transfer';
  amount: string;
  merchant: string;
  category: string;
  note: string;
  recurring: string;
  dateLabel: string;
  ignoreFromBudgets: boolean;
};

type FinanceContextValue = {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  stocks: StockQuote[];
  stockHoldings: StockHolding[];
  watchlistSymbols: string[];
  defaultStockSymbol: string;
  displayCurrency: DisplayCurrency;
  displayUnit: DisplayUnit;
  transactionDraft: TransactionDraft;
  addTransaction: (input: CreateTransactionInput) => FinanceTransaction;
  markTransactionCompleted: (id: string) => void;
  addCategory: (input: CreateCategoryInput) => FinanceCategory;
  renameMerchant: (currentName: string, nextName: string) => void;
  buyStock: (symbol: string, shares: number) => StockHolding | undefined;
  toggleStockWatch: (symbol: string) => void;
  setDefaultStockSymbol: (symbol: string) => void;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  setDisplayUnit: (unit: DisplayUnit) => void;
  getTransactionById: (id: string) => FinanceTransaction | undefined;
  getTransactionsByMerchant: (merchantQuery: string) => FinanceTransaction[];
  getStockBySymbol: (symbol: string) => StockQuote | undefined;
  getHoldingBySymbol: (symbol: string) => StockHolding | undefined;
  updateTransactionDraft: (patch: Partial<TransactionDraft>) => void;
  resetTransactionDraft: () => void;
};

export const FinanceContext = createContext<FinanceContextValue | null>(null);

const initialDraft: TransactionDraft = {
  type: 'expense',
  amount: '',
  merchant: '',
  category: budgetCategories[0]?.name ?? 'Housing',
  note: '',
  recurring: 'No repeat',
  dateLabel: 'Today',
  ignoreFromBudgets: false,
};

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState(transactionsSeed);
  const [categories, setCategories] = useState(budgetCategories);
  const [stockHoldings, setStockHoldings] = useState(stockHoldingsSeed);
  const [watchlistSymbols, setWatchlistSymbols] = useState(stockWatchlistSeed);
  const [defaultStockSymbol, setDefaultStockSymbol] = useState('AAPL');
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>('USD');
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>('share');
  const [transactionDraft, setTransactionDraft] = useState<TransactionDraft>(initialDraft);

  const value = useMemo<FinanceContextValue>(() => {
    const addTransaction = (input: CreateTransactionInput) => {
      const transaction: FinanceTransaction = {
        ...input,
        id: input.id ?? `txn-${Date.now()}`,
        dateLabel: input.dateLabel ?? 'Today',
        timeLabel: input.timeLabel ?? 'Just now',
        reference: input.reference ?? makeReference('TRX'),
      };

      setTransactions((current) => [transaction, ...current]);
      return transaction;
    };

    const markTransactionCompleted = (id: string) => {
      setTransactions((current) =>
        current.map((item) => (item.id === id ? { ...item, status: 'Completed' } : item))
      );
    };

    const addCategory = (input: CreateCategoryInput) => {
      const category: FinanceCategory = {
        ...input,
        id: input.id ?? `category-${Date.now()}`,
      };

      setCategories((current) => [...current, category]);
      return category;
    };

    const renameMerchant = (currentName: string, nextName: string) => {
      const currentLower = currentName.trim().toLowerCase();
      const nextTrimmed = nextName.trim();

      if (!currentLower || !nextTrimmed) {
        return;
      }

      setTransactions((current) =>
        current.map((item) =>
          item.merchant.toLowerCase().includes(currentLower)
            ? { ...item, merchant: nextTrimmed }
            : item
        )
      );
    };

    const getStockBySymbol = (symbol: string) =>
      stockQuotes.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase());

    const getHoldingBySymbol = (symbol: string) =>
      stockHoldings.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase());

    const buyStock = (symbol: string, shares: number) => {
      const normalizedShares = Number(shares);
      const stock = getStockBySymbol(symbol);

      if (!stock || !Number.isFinite(normalizedShares) || normalizedShares <= 0) {
        return undefined;
      }

      let nextHolding: StockHolding | undefined;

      setStockHoldings((current) => {
        const existing = current.find(
          (item) => item.symbol.toLowerCase() === stock.symbol.toLowerCase()
        );

        if (!existing) {
          nextHolding = {
            symbol: stock.symbol,
            shares: normalizedShares,
            averageCost: stock.price,
          };
          return [...current, nextHolding];
        }

        const totalShares = existing.shares + normalizedShares;
        nextHolding = {
          ...existing,
          shares: totalShares,
          averageCost:
            (existing.averageCost * existing.shares + stock.price * normalizedShares) / totalShares,
        };

        return current.map((item) => (item.symbol === existing.symbol ? nextHolding! : item));
      });

      setTransactions((current) => [
        {
          id: `txn-stock-${Date.now()}`,
          merchant: `Buy ${stock.symbol}`,
          category: 'Investments',
          amount: -(stock.price * normalizedShares),
          type: 'expense',
          status: 'Completed',
          dateLabel: 'Today',
          timeLabel: 'Just now',
          note: `Purchased ${normalizedShares} shares of ${stock.name}`,
          icon: 'trending-up',
          accent: stock.accent,
          paymentMethod: 'Brokerage Wallet',
          location: stock.sector,
          reference: makeReference('STK'),
        },
        ...current,
      ]);

      setWatchlistSymbols((current) =>
        current.includes(stock.symbol) ? current : [stock.symbol, ...current]
      );

      return nextHolding;
    };

    const toggleStockWatch = (symbol: string) => {
      const normalized = symbol.trim().toUpperCase();

      if (!normalized) {
        return;
      }

      setWatchlistSymbols((current) =>
        current.includes(normalized)
          ? current.filter((item) => item !== normalized)
          : [normalized, ...current]
      );
    };

    const updateDefaultStock = (symbol: string) => {
      const normalized = symbol.trim().toUpperCase();

      if (!normalized || !getStockBySymbol(normalized)) {
        return;
      }

      setDefaultStockSymbol(normalized);

      setWatchlistSymbols((current) =>
        current.includes(normalized) ? current : [normalized, ...current]
      );
    };

    const getTransactionById = (id: string) => transactions.find((item) => item.id === id);

    const getTransactionsByMerchant = (merchantQuery: string) => {
      const query = merchantQuery.trim().toLowerCase();

      if (!query) {
        return [];
      }

      return transactions.filter((item) => item.merchant.toLowerCase().includes(query));
    };

    const updateTransactionDraft = (patch: Partial<TransactionDraft>) => {
      setTransactionDraft((current) => ({ ...current, ...patch }));
    };

    const resetTransactionDraft = () => {
      setTransactionDraft((current) => ({
        ...initialDraft,
        category: categories[0]?.name ?? initialDraft.category,
        recurring: current.recurring || initialDraft.recurring,
      }));
    };

    return {
      transactions,
      categories,
      stocks: stockQuotes,
      stockHoldings,
      watchlistSymbols,
      defaultStockSymbol,
      displayCurrency,
      displayUnit,
      transactionDraft,
      addTransaction,
      markTransactionCompleted,
      addCategory,
      renameMerchant,
      buyStock,
      toggleStockWatch,
      setDefaultStockSymbol: updateDefaultStock,
      setDisplayCurrency,
      setDisplayUnit,
      getTransactionById,
      getTransactionsByMerchant,
      getStockBySymbol,
      getHoldingBySymbol,
      updateTransactionDraft,
      resetTransactionDraft,
    };
  }, [
    categories,
    defaultStockSymbol,
    displayCurrency,
    displayUnit,
    stockHoldings,
    transactionDraft,
    transactions,
    watchlistSymbols,
  ]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
