import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import {
  importReceiptFromSource,
  receiptImportSourceCards as importSourceCards,
  ReceiptImportSourceKey as ImportSourceKey,
} from '@/components/smart-budgeting/receipt-import';
import { Typography } from '@/constants/theme';
import { useAssistant } from '@/hooks/use-assistant';
import { useFinance } from '@/hooks/use-finance';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSetupNavigationDebounce } from './setup/use-setup-navigation-debounce';

export default function SmartBudgetingAddSpendingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { importedReceipts } = useSmartBudgeting();
  const { resetTransactionDraft, updateTransactionDraft } = useFinance();
  const { setReceiptImportDraft } = useAssistant();
  const [activeSource, setActiveSource] = useState<ImportSourceKey | null>(null);
  const { isNavigating, runNavigation } = useSetupNavigationDebounce();

  const recentImports = useMemo(() => importedReceipts.slice(0, 3), [importedReceipts]);

  const openManualEntry = () => {
    resetTransactionDraft();
    updateTransactionDraft({
      type: 'expense',
      note: '',
      amount: '',
      merchant: '',
      ignoreFromBudgets: false,
      dateLabel: 'Today',
    });
    runNavigation(() => router.push('/(finance)/add-transaction'));
  };

  return (
    <FinanceScreen
      title="Add spending"
      subtitle="Scan a bill or enter the expense by hand."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
          <View
            style={[
              styles.heroBadge,
              { backgroundColor: hexToRgba(colors.card, 0.14) },
            ]}
          >
            <MaterialIcons name="receipt-long" size={16} color={colors.card} />
            <Text style={[styles.heroBadgeText, { color: colors.card }]}>Spending intake</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.card }]}>
            Keep every expense inside the budgeting flow.
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.82) }]}>
            Use receipt import for bills and paper receipts, or open the manual form when you need a quick entry.
          </Text>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Receipt import</Text>
          <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.58) }]}>
            Capture a bill, choose a document, then review the draft before saving it as spending.
          </Text>

          <ResponsiveGrid
            minItemWidth={120}
            horizontalPadding={0}
            gap={12}
            maxColumns={3}
            style={styles.sourceGrid}
          >
            {importSourceCards.map((item) => {
              const isActive = activeSource === item.id;

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.sourceCard,
                    {
                      backgroundColor: colors.backgroundSoft,
                      borderColor: isActive
                        ? colors.primaryDark
                        : hexToRgba(colors.primaryDark, 0.08),
                    },
                  ]}
                  onPress={() => {
                    if (activeSource || isNavigating) {
                      return;
                    }

                    setActiveSource(item.id);
                    void importReceiptFromSource(item.id, (draft) => {
                      setReceiptImportDraft(draft);
                      runNavigation(() => router.push('/(finance)/smart-budgeting/receipt-scan'));
                    }).finally(() => {
                      setActiveSource(null);
                    });
                  }}
                >
                  <View
                    style={[
                      styles.sourceIcon,
                      { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
                    ]}
                  >
                    <MaterialIcons name={item.icon} size={20} color={colors.primaryDark} />
                  </View>
                  <Text style={[styles.sourceTitle, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.sourceHelper, { color: hexToRgba(colors.text, 0.54) }]}>
                    {item.helper}
                  </Text>
                </Pressable>
              );
            })}
          </ResponsiveGrid>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Manual entry</Text>
          <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.58) }]}>
            Best for cash spending, quick notes or receipts that still need too much correction.
          </Text>
          <ThemeButton
            title="Open manual form"
            onPress={openManualEntry}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.manualButton}
            disabled={isNavigating || activeSource !== null}
          />
        </FinanceCard>

        {recentImports.length ? (
          <FinanceCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent imports</Text>
            <View style={styles.recentList}>
              {recentImports.map((item) => (
                <View key={item.id} style={styles.recentRow}>
                  <View style={styles.recentCopy}>
                    <Text numberOfLines={1} style={[styles.recentTitle, { color: colors.text }]}>
                      {item.merchant}
                    </Text>
                    <Text style={[styles.recentMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                      {item.categoryName} • {item.importedAt}
                    </Text>
                  </View>
                  <Text style={[styles.recentAmount, { color: colors.primaryDark }]}>
                    ${item.total.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </FinanceCard>
        ) : null}
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  contentStyle: {
    paddingBottom: 28,
  },
  stack: {
    marginTop: 18,
    gap: 16,
  },
  heroCard: {
    borderWidth: 0,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  heroTitle: {
    marginTop: 16,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
  },
  heroBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 21,
  },
  sourceGrid: {
    marginTop: 16,
  },
  sourceCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  sourceIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  sourceHelper: {
    fontSize: 12,
    lineHeight: 17,
  },
  manualButton: {
    marginTop: 16,
  },
  recentList: {
    marginTop: 14,
    gap: 12,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentCopy: {
    flex: 1,
    minWidth: 0,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  recentMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
  },
  recentAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
});
