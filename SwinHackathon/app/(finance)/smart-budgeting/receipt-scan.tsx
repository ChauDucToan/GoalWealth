import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { getReceiptOcrAvailability, recognizeReceiptText } from '@/components/smart-budgeting/receipt-ocr';
import { Typography } from '@/constants/theme';
import { useMyUser } from '@/context/myUserContext';
import { useAssistant } from '@/hooks/use-assistant';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import { isGoalwealthLiveAdapterEnabled } from '@/services/api/config';
import { normalizeGoalwealthError } from '@/services/api/errors';
import { getGoalwealthOcrRecord, ingestGoalwealthOcr } from '@/services/api/ocr';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSetupNavigationDebounce } from './setup/use-setup-navigation-debounce';

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

function extractAmountFromRawText(rawText?: string) {
  if (!rawText) {
    return '';
  }

  const matches = rawText.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})|\d+(?:[.,]\d{2})/g);

  if (!matches?.length) {
    return '';
  }

  const normalized = matches
    .map((value) => Number(value.replace(/,/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((left, right) => right - left);

  if (!normalized.length) {
    return '';
  }

  return normalized[0].toFixed(2);
}

function formatBackendOcrStatusLabel(
  status: 'idle' | 'submitting' | 'accepted' | 'pending_user_context' | 'pending_backend' | 'ready' | 'error' | undefined
) {
  switch (status) {
    case 'submitting':
      return 'Submitting to GoalWealth...';
    case 'accepted':
      return 'Accepted by GoalWealth';
    case 'pending_user_context':
      return 'Needs user context';
    case 'pending_backend':
      return 'Backend processing';
    case 'ready':
      return 'Normalized result ready';
    case 'error':
      return 'Sync issue';
    default:
      return 'Not submitted';
  }
}

export default function SmartBudgetingReceiptScanScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { state: userState } = useMyUser();
  const { receiptImportDraft, setReceiptImportDraft } = useAssistant();
  const { categories, updateTransactionDraft } = useFinance();
  const { isNavigating, runNavigation } = useSetupNavigationDebounce();
  const liveAdapterEnabled = isGoalwealthLiveAdapterEnabled();
  const importedName = prettifyReceiptName(receiptImportDraft?.name);
  const sourceLabel =
    receiptImportDraft?.source === 'camera'
      ? 'Camera capture'
      : receiptImportDraft?.source === 'gallery'
        ? 'Photo library'
        : receiptImportDraft?.source === 'files'
          ? 'Files import'
          : 'Imported file';
  const rawOcrText = receiptImportDraft?.ocrRawText?.trim() ?? '';
  const detectedAmount = extractAmountFromRawText(rawOcrText);
  const ocrAvailability = useMemo(
    () => getReceiptOcrAvailability(receiptImportDraft?.kind ?? 'mock'),
    [receiptImportDraft?.kind]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    guessCategoryName(
      importedName,
      categories.map((item) => item.name)
    )
  );
  const receiptSourceRoute =
    returnTo === 'budget-setup'
      ? '/(finance)/smart-budgeting/setup/receipt-gallery'
      : '/(finance)/smart-budgeting/add-spending';

  useEffect(() => {
    if (
      !receiptImportDraft ||
      !receiptImportDraft.uri ||
      receiptImportDraft.ocrStatus !== 'idle'
    ) {
      return;
    }

    let cancelled = false;

    setReceiptImportDraft({
      ...receiptImportDraft,
      ocrStatus: 'running',
      ocrError: null,
    });

    void recognizeReceiptText(receiptImportDraft.uri, receiptImportDraft.kind).then((result) => {
      if (cancelled) {
        return;
      }

      setReceiptImportDraft({
        ...receiptImportDraft,
        ocrRawText: result.text,
        ocrStatus: result.status === 'success' || result.status === 'empty' ? 'success' : 'error',
        ocrError: result.error,
        ocrProvider: result.provider,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [receiptImportDraft, setReceiptImportDraft]);

  useEffect(() => {
    if (!receiptImportDraft) {
      return;
    }

    const trimmedRawText = receiptImportDraft.ocrRawText?.trim() ?? '';
    const backendStatus = receiptImportDraft.backendOcrStatus ?? 'idle';

    if (
      !liveAdapterEnabled ||
      !trimmedRawText ||
      receiptImportDraft.backendOcrRecordId ||
      backendStatus === 'submitting' ||
      backendStatus === 'accepted' ||
      backendStatus === 'pending_user_context' ||
      backendStatus === 'pending_backend' ||
      backendStatus === 'ready' ||
      backendStatus === 'error'
    ) {
      return;
    }

    if (!userState.accessToken?.trim()) {
      setReceiptImportDraft({
        ...receiptImportDraft,
        backendOcrStatus: 'error',
        backendOcrError: 'Sign in again to sync OCR with GoalWealth.',
        backendOcrWarnings: [],
        backendOcrRequestId: null,
        backendOcrMessage: null,
      });
      return;
    }

    let cancelled = false;

    setReceiptImportDraft({
      ...receiptImportDraft,
      backendOcrStatus: 'submitting',
      backendOcrError: null,
      backendOcrWarnings: [],
      backendOcrRequestId: null,
      backendOcrMessage: null,
    });

    void ingestGoalwealthOcr({ raw_text: trimmedRawText }, userState.accessToken)
      .then(async (response) => {
        if (cancelled) {
          return;
        }

        const acceptedDraft = {
          ...receiptImportDraft,
          backendOcrRecordId: response.data.ocr_record_id,
          backendOcrStatus: response.data.status,
          backendOcrError: null,
          backendOcrWarnings: response.warnings,
          backendOcrRequestId: response.requestId,
          backendOcrMessage: response.data.message,
        };

        setReceiptImportDraft(acceptedDraft);

        try {
          const record = await getGoalwealthOcrRecord(
            response.data.ocr_record_id,
            userState.accessToken
          );

          if (cancelled) {
            return;
          }

          setReceiptImportDraft({
            ...acceptedDraft,
            backendOcrStatus: record.data.status,
            backendOcrWarnings: [
              ...new Set([
                ...(response.warnings ?? []),
                ...(record.warnings ?? []),
                ...(record.data.warnings ?? []),
              ]),
            ],
            backendOcrRequestId: record.requestId ?? response.requestId,
          });
        } catch (error) {
          if (cancelled) {
            return;
          }

          const normalizedError = normalizeGoalwealthError(error);

          setReceiptImportDraft({
            ...acceptedDraft,
            backendOcrStatus: 'error',
            backendOcrError: normalizedError.message,
            backendOcrWarnings: normalizedError.warnings,
            backendOcrRequestId: normalizedError.requestId ?? response.requestId,
          });
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const normalizedError = normalizeGoalwealthError(error);

        setReceiptImportDraft({
          ...receiptImportDraft,
          backendOcrStatus: 'error',
          backendOcrError: normalizedError.message,
          backendOcrWarnings: normalizedError.warnings,
          backendOcrRequestId: normalizedError.requestId,
          backendOcrMessage: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [liveAdapterEnabled, receiptImportDraft, setReceiptImportDraft, userState.accessToken]);

  const extractedFields = useMemo(
    () => [
      { label: 'Merchant', value: importedName },
      { label: 'Suggested category', value: selectedCategory },
      { label: 'Source', value: sourceLabel },
      { label: 'Total', value: detectedAmount ? `$${detectedAmount}` : 'Needs review' },
      {
        label: 'OCR',
        value:
          receiptImportDraft?.ocrStatus === 'running'
            ? 'Scanning text…'
            : receiptImportDraft?.ocrStatus === 'success'
              ? rawOcrText
                ? receiptImportDraft?.ocrProvider === 'mlkit'
                  ? 'Text captured'
                  : 'Manual review ready'
                : 'No text found'
              : receiptImportDraft?.ocrError ?? 'Not started',
      },
      ...(liveAdapterEnabled
        ? [
            {
              label: 'GoalWealth sync',
              value: formatBackendOcrStatusLabel(receiptImportDraft?.backendOcrStatus),
            },
          ]
        : []),
    ],
    [
      detectedAmount,
      importedName,
      liveAdapterEnabled,
      rawOcrText,
      receiptImportDraft?.backendOcrStatus,
      receiptImportDraft?.ocrError,
      receiptImportDraft?.ocrProvider,
      receiptImportDraft?.ocrStatus,
      selectedCategory,
      sourceLabel,
    ]
  );

  if (!receiptImportDraft) {
    return (
      <FinanceScreen title="Receipt review" subtitle="No imported file is ready to review yet.">
        <View style={styles.emptyState}>
          <ThemeButton
            title={returnTo === 'budget-setup' ? 'Back to receipt import' : 'Back to add spending'}
            onPress={() => runNavigation(() => router.replace(receiptSourceRoute))}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            disabled={isNavigating}
          />
        </View>
      </FinanceScreen>
    );
  }

  const openSpendingDraft = () => {
    const trimmedRawText = rawOcrText.slice(0, 420);

    updateTransactionDraft({
      type: 'expense',
      merchant: importedName,
      category: selectedCategory,
      amount: detectedAmount,
      note: trimmedRawText
        ? `Imported from ${sourceLabel.toLowerCase()}. OCR text:\n${trimmedRawText}`
        : `Imported from ${sourceLabel.toLowerCase()}. Review merchant, amount and category before saving.`,
      dateLabel: 'Today',
      ignoreFromBudgets: false,
    });
    setReceiptImportDraft(null);
    runNavigation(() => router.replace('/(finance)/add-transaction'));
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
              {ocrAvailability.available
                ? 'Run OCR, review the extracted text, then send the draft into spending.'
                : 'Review the imported draft manually, then send it into spending.'}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>OCR output</Text>
          <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.56) }]}>
            {ocrAvailability.available
              ? 'ML Kit reads text from the receipt image before you confirm the draft.'
              : ocrAvailability.reason}
          </Text>
          <View style={[styles.ocrBox, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
            <Text style={[styles.ocrText, { color: colors.text }]}>
              {receiptImportDraft.ocrStatus === 'running'
                ? 'Scanning receipt text…'
                : rawOcrText || receiptImportDraft.ocrError || 'No OCR output available.'}
            </Text>
          </View>
        </FinanceCard>

        {liveAdapterEnabled ? (
          <FinanceCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>GoalWealth sync</Text>
            <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Raw OCR text is sent to the adapter as `raw_text`. Normalization stays on the backend.
            </Text>
            <View style={styles.fieldGroup}>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.48) }]}>
                  Status
                </Text>
                <Text style={[styles.fieldValue, { color: colors.text }]}>
                  {formatBackendOcrStatusLabel(receiptImportDraft.backendOcrStatus)}
                </Text>
              </View>

              {receiptImportDraft.backendOcrRecordId ? (
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.48) }]}>
                    OCR record
                  </Text>
                  <Text style={[styles.fieldValue, { color: colors.text }]}>
                    {receiptImportDraft.backendOcrRecordId}
                  </Text>
                </View>
              ) : null}

              {receiptImportDraft.backendOcrMessage ? (
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.48) }]}>
                    Adapter
                  </Text>
                  <Text style={[styles.fieldValue, { color: colors.text }]}>
                    {receiptImportDraft.backendOcrMessage}
                  </Text>
                </View>
              ) : null}
            </View>

            {receiptImportDraft.backendOcrError ? (
              <Text style={[styles.syncError, { color: colors.error }]}>
                {receiptImportDraft.backendOcrError}
              </Text>
            ) : null}

            {receiptImportDraft.backendOcrWarnings?.length ? (
              <View style={styles.warningList}>
                {receiptImportDraft.backendOcrWarnings.map((warning) => (
                  <Text key={warning} style={[styles.syncWarning, { color: colors.warning }]}>
                    {warning}
                  </Text>
                ))}
              </View>
            ) : null}
          </FinanceCard>
        ) : null}

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
              runNavigation(() => router.replace(receiptSourceRoute));
            }}
            colorBackground={colors.card}
            colorText={colors.primaryDark}
            style={styles.button}
            disabled={isNavigating}
          />
          <ThemeButton
            title="Open spending draft"
            onPress={openSpendingDraft}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.button}
            disabled={isNavigating}
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
  ocrBox: {
    marginTop: 14,
    minHeight: 120,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  ocrText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  syncError: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  warningList: {
    marginTop: 10,
    gap: 6,
  },
  syncWarning: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
