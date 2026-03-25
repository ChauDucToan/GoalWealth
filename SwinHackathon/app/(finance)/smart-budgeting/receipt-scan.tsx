import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { Typography } from '@/constants/theme';
import { useAssistant } from '@/hooks/use-assistant';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function prettifyReceiptName(name?: string) {
  if (!name) {
    return 'Imported receipt';
  }

  const cleaned = name
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || /^img\s*\d+/i.test(cleaned)) {
    return 'Imported receipt';
  }

  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}

function guessCategoryName(name: string, availableCategories: string[]) {
  const normalized = name.toLowerCase();

  if (normalized.match(/grocery|market|basket|food|coffee|cafe|restaurant/)) {
    return availableCategories.find((item) => item.toLowerCase() === 'food') ?? availableCategories[0];
  }

  if (normalized.match(/fuel|gas|taxi|ride|bus|metro|transport|parking/)) {
    return (
      availableCategories.find((item) => item.toLowerCase().includes('transport')) ??
      availableCategories[0]
    );
  }

  if (normalized.match(/pharmacy|clinic|hospital|health|medicine/)) {
    return (
      availableCategories.find((item) => item.toLowerCase().includes('health')) ??
      availableCategories[0]
    );
  }

  if (normalized.match(/movie|cinema|game|fun|netflix|spotify/)) {
    return (
      availableCategories.find((item) => item.toLowerCase().includes('entertainment')) ??
      availableCategories[0]
    );
  }

  if (normalized.match(/rent|mortgage|utility|electric|water|housing/)) {
    return (
      availableCategories.find((item) => item.toLowerCase().includes('housing')) ??
      availableCategories[0]
    );
  }

  return availableCategories[0];
}

export default function SmartBudgetingReceiptScanScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { receiptImportDraft, setReceiptImportDraft } = useAssistant();
  const { categories, updateTransactionDraft } = useFinance();
  const importedName = prettifyReceiptName(receiptImportDraft?.name);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    guessCategoryName(
      importedName,
      categories.map((item) => item.name)
    )
  );

  const sourceLabel =
    receiptImportDraft?.source === 'camera'
      ? 'Camera capture'
      : receiptImportDraft?.source === 'gallery'
        ? 'Photo library'
        : receiptImportDraft?.source === 'files'
          ? 'Files import'
          : 'Imported file';

  const extractedFields = useMemo(
    () => [
      { label: 'Merchant', value: importedName },
      { label: 'Suggested category', value: selectedCategory },
      { label: 'Source', value: sourceLabel },
      { label: 'Total', value: 'Needs review' },
    ],
    [importedName, selectedCategory, sourceLabel]
  );

  if (!receiptImportDraft) {
    return (
      <FinanceScreen title="Receipt review" subtitle="No imported file is ready to review yet.">
        <View style={styles.emptyState}>
          <ThemeButton
            title="Back to add spending"
            onPress={() => router.replace('/(finance)/smart-budgeting/add-spending')}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
          />
        </View>
      </FinanceScreen>
    );
  }

  const openSpendingDraft = () => {
    updateTransactionDraft({
      type: 'expense',
      merchant: importedName,
      category: selectedCategory,
      amount: '',
      note: `Imported from ${sourceLabel.toLowerCase()}. Review merchant, amount and category before saving.`,
      dateLabel: 'Today',
      ignoreFromBudgets: false,
    });
    setReceiptImportDraft(null);
    router.replace('/(finance)/add-transaction');
  };

  return (
    <FinanceScreen
      title="Review receipt"
      subtitle="Check the draft before it becomes a spending entry."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.previewCard, { backgroundColor: colors.darkBackground }]}>
          {receiptImportDraft.kind === 'image' && receiptImportDraft.uri ? (
            <ExpoImage
              source={{ uri: receiptImportDraft.uri }}
              style={styles.receiptPreview}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.receiptPreview, styles.documentPreview, { backgroundColor: colors.card }]}>
              <View
                style={[
                  styles.documentBadge,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
              >
                <MaterialIcons name="description" size={28} color={colors.primaryDark} />
              </View>
              <Text style={[styles.documentName, { color: colors.text }]}>{receiptImportDraft.name}</Text>
              <Text style={[styles.documentMeta, { color: hexToRgba(colors.text, 0.5) }]}>
                PDF or document import
              </Text>
            </View>
          )}

          <View style={styles.previewMeta}>
            <Text style={[styles.previewTitle, { color: colors.card }]}>{importedName}</Text>
            <Text style={[styles.previewBody, { color: hexToRgba(colors.card, 0.76) }]}>
              Review the suggested category and fill in the final amount in the spending form.
            </Text>
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Draft details</Text>
          <View style={styles.fieldGroup}>
            {extractedFields.map((field) => (
              <View key={field.label} style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.48) }]}>
                  {field.label}
                </Text>
                <Text style={[styles.fieldValue, { color: colors.text }]}>{field.value}</Text>
              </View>
            ))}
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget category</Text>
          <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Choose where this spending draft should land before you finish the manual review.
          </Text>
          <View style={styles.categoryChips}>
            {categories.map((category) => {
              const active = selectedCategory === category.name;

              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Text style={[styles.categoryChipText, { color: active ? colors.card : colors.text }]}>
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <View style={styles.buttonRow}>
          <ThemeButton
            title="Choose another"
            onPress={() => {
              setReceiptImportDraft(null);
              router.replace('/(finance)/smart-budgeting/add-spending');
            }}
            colorBackground={colors.card}
            colorText={colors.primaryDark}
            style={styles.button}
          />
          <ThemeButton
            title="Open spending draft"
            onPress={openSpendingDraft}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.button}
          />
        </View>
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
  emptyState: {
    marginTop: 22,
  },
  previewCard: {
    borderWidth: 0,
  },
  receiptPreview: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
  },
  documentPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  documentBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentName: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  documentMeta: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  previewMeta: {
    marginTop: 16,
    gap: 8,
  },
  previewTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  previewBody: {
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
  fieldGroup: {
    marginTop: 14,
    gap: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  fieldValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  categoryChips: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
