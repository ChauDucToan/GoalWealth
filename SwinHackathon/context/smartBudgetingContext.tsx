import {
  budgetCategories as budgetCategoriesSeed,
  budgetSummary,
  receiptPresets,
  SmartBudgetCategory,
  SmartBudgetReceiptPreset,
} from '@/app/(finance)/smart-budgeting/_data';
import React, { createContext, useMemo, useState } from 'react';

export type ImportedReceipt = {
  id: string;
  merchant: string;
  total: number;
  dateLabel: string;
  categoryId: string;
  categoryName: string;
  items: SmartBudgetReceiptPreset['items'];
  importedAt: string;
};

type SmartBudgetingContextValue = {
  totalBudget: number;
  categories: SmartBudgetCategory[];
  importedReceipts: ImportedReceipt[];
  activeReceiptDraft: SmartBudgetReceiptPreset | null;
  hasCompletedSetup: boolean;
  completeSetup: () => void;
  startReceiptDraft: (receiptId: string) => SmartBudgetReceiptPreset | null;
  getReceiptPreset: (receiptId: string) => SmartBudgetReceiptPreset | undefined;
  confirmReceiptImport: (receiptId: string, nextCategoryId?: string) => ImportedReceipt | null;
  discardReceiptDraft: () => void;
};

export const SmartBudgetingContext = createContext<SmartBudgetingContextValue | null>(null);

export function SmartBudgetingProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<SmartBudgetCategory[]>(budgetCategoriesSeed);
  const [importedReceipts, setImportedReceipts] = useState<ImportedReceipt[]>([]);
  const [activeReceiptDraft, setActiveReceiptDraft] = useState<SmartBudgetReceiptPreset | null>(null);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);

  const value = useMemo<SmartBudgetingContextValue>(() => {
    const getReceiptPreset = (receiptId: string) => receiptPresets.find((item) => item.id === receiptId);

    const startReceiptDraft = (receiptId: string) => {
      const receipt = getReceiptPreset(receiptId) ?? null;
      setActiveReceiptDraft(receipt);
      return receipt;
    };

    const confirmReceiptImport = (receiptId: string, nextCategoryId?: string) => {
      const receipt = getReceiptPreset(receiptId);

      if (!receipt) {
        return null;
      }

      const appliedCategoryId = nextCategoryId ?? receipt.categoryId;
      const appliedCategory =
        categories.find((item) => item.id === appliedCategoryId) ??
        categories.find((item) => item.id === receipt.categoryId);

      if (!appliedCategory) {
        return null;
      }

      const imported: ImportedReceipt = {
        id: `${receipt.id}-${Date.now()}`,
        merchant: receipt.merchant,
        total: receipt.total,
        dateLabel: receipt.dateLabel,
        categoryId: appliedCategory.id,
        categoryName: appliedCategory.name,
        items: receipt.items,
        importedAt: 'Just now',
      };

      setCategories((current) =>
        current.map((item) =>
          item.id === appliedCategory.id
            ? {
                ...item,
                spent: Number((item.spent + receipt.total).toFixed(2)),
              }
            : item
        )
      );
      setImportedReceipts((current) => [imported, ...current]);
      setActiveReceiptDraft(null);
      return imported;
    };

    const discardReceiptDraft = () => {
      setActiveReceiptDraft(null);
    };

    const completeSetup = () => {
      setHasCompletedSetup(true);
    };

    return {
      totalBudget: budgetSummary.total,
      categories,
      importedReceipts,
      activeReceiptDraft,
      hasCompletedSetup,
      completeSetup,
      startReceiptDraft,
      getReceiptPreset,
      confirmReceiptImport,
      discardReceiptDraft,
    };
  }, [activeReceiptDraft, categories, hasCompletedSetup, importedReceipts]);

  return <SmartBudgetingContext.Provider value={value}>{children}</SmartBudgetingContext.Provider>;
}
