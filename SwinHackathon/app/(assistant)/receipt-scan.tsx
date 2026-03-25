import { ThemeButton } from '@/components/ThemeButton';
import { AssistantCard, AssistantScreen } from '@/components/assistant/AssistantScaffold';
import { hexToRgba } from '@/components/auth/AuthKit';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

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

export default function ReceiptScanScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    activeScenarioId,
    openCustomAssistantThread,
    receiptImportDraft,
    selectAssistantScenario,
    setReceiptImportDraft,
  } = useAssistant();
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    setProgress(10);
  }, [receiptImportDraft?.name, receiptImportDraft?.uri]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => Math.min(current + 18, 100));
    }, 280);

    return () => clearInterval(interval);
  }, []);

  const isDone = progress >= 100;
  const statusText = useMemo(() => {
    if (progress < 40) {
      return 'Detecting edges and lighting';
    }

    if (progress < 80) {
      return 'Extracting file details';
    }

    if (!isDone) {
      return 'Preparing review summary';
    }

    return 'Receipt summary ready';
  }, [isDone, progress]);

  const importedName = prettifyReceiptName(receiptImportDraft?.name);
  const sourceLabel =
    receiptImportDraft?.source === 'camera'
      ? 'Camera capture'
      : receiptImportDraft?.source === 'gallery'
        ? 'Photo library'
        : receiptImportDraft?.source === 'files'
          ? 'Files import'
          : 'Demo import';

  const extractedFields = useMemo(
    () => [
      { label: 'Merchant', value: importedName },
      {
        label: 'Category',
        value: receiptImportDraft?.source === 'camera' ? 'Needs review' : 'Imported receipt',
      },
      { label: 'Source', value: sourceLabel },
      {
        label: 'File',
        value: receiptImportDraft?.name ?? 'FreshMart Grocery receipt.jpg',
      },
    ],
    [importedName, receiptImportDraft?.name, receiptImportDraft?.source, sourceLabel]
  );

  const sendToAssistant = () => {
    if (!isDone) {
      return;
    }

    if (receiptImportDraft && receiptImportDraft.source !== 'demo') {
      const now = Date.now();

      openCustomAssistantThread({
        id: `receipt-import-${now}`,
        title: 'Receipt review',
        prompt: `Review the imported receipt ${receiptImportDraft.name}.`,
        icon: 'receipt-long',
        messages: [
          {
            id: `receipt-import-user-${now}`,
            role: 'user',
            text: `I imported ${receiptImportDraft.name}. Can you review the OCR summary and tell me what to fix before I add it?`,
            meta: 'Now',
          },
          {
            id: `receipt-import-reply-${now + 1}`,
            role: 'assistant',
            text: `I reviewed ${receiptImportDraft.name}. The current draft reads ${importedName} from ${sourceLabel.toLowerCase()}. Treat the category and amount as review-needed before using this receipt in your finance plan.`,
            meta: 'Now',
          },
        ],
      });
      setReceiptImportDraft(null);
      router.replace({
        pathname: '/(assistant)/chat/[scenario]',
        params: { scenario: 'custom' },
      });
      return;
    }

    selectAssistantScenario('receipt');
    setReceiptImportDraft(null);
    router.replace({
      pathname: '/(assistant)/chat/[scenario]',
      params: { scenario: 'receipt' },
    });
  };

  return (
    <AssistantScreen
      title="Receipt Scanner"
      subtitle="Import a receipt, preview the file and send the reviewed summary into chat"
    >
      <View style={styles.stack}>
        <AssistantCard style={[styles.previewCard, { backgroundColor: colors.darkBackground }]}>
          {receiptImportDraft?.kind === 'image' && receiptImportDraft.uri ? (
            <ExpoImage
              source={{ uri: receiptImportDraft.uri }}
              style={styles.receiptPreview}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.receiptPreview, { backgroundColor: colors.card }]}>
              {receiptImportDraft?.kind === 'document' ? (
                <View style={styles.documentPreview}>
                  <View
                    style={[
                      styles.documentBadge,
                      { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                    ]}
                  >
                    <MaterialIcons name="description" size={28} color={colors.primaryDark} />
                  </View>
                  <Text style={[styles.documentName, { color: colors.text }]}>
                    {receiptImportDraft.name}
                  </Text>
                  <Text style={[styles.documentMeta, { color: hexToRgba(colors.text, 0.5) }]}>
                    PDF or document import
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.receiptHeaderLine} />
                  <View style={styles.receiptLineShort} />
                  <View style={styles.receiptDivider} />
                  <View style={styles.receiptLine} />
                  <View style={styles.receiptLine} />
                  <View style={styles.receiptLineShort} />
                </>
              )}
            </View>
          )}

          <View
            style={[
              styles.scanFrame,
              { borderColor: isDone ? colors.success : colors.primaryDark },
            ]}
          >
            <View
              style={[
                styles.scanBeam,
                {
                  backgroundColor: isDone
                    ? hexToRgba(colors.success, 0.8)
                    : hexToRgba(colors.primaryDark, 0.82),
                  top: `${Math.min(progress, 92)}%`,
                },
              ]}
            />
          </View>

          <Text style={[styles.statusTitle, { color: colors.card }]}>{statusText}</Text>
          <View style={[styles.progressBar, { backgroundColor: hexToRgba(colors.card, 0.12) }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: isDone ? colors.success : colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: hexToRgba(colors.card, 0.74) }]}>
            {progress}% complete
          </Text>
        </AssistantCard>

        {isDone ? (
          <AssistantCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Extracted receipt data</Text>
            <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Review the imported summary before adding it to chat.
            </Text>
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

            <View
              style={[
                styles.noticeCard,
                { backgroundColor: hexToRgba(colors.success, 0.12) },
              ]}
            >
              <MaterialIcons name="check-circle" size={18} color={colors.success} />
              <Text style={[styles.noticeText, { color: colors.success }]}>
                Ready to send into the assistant for review
              </Text>
            </View>
          </AssistantCard>
        ) : null}

        <View style={styles.buttonRow}>
          <ThemeButton
            title={isDone ? 'Choose another' : 'Cancel'}
            onPress={() => {
              if (isDone) {
                setReceiptImportDraft(null);
                router.replace('/(assistant)/receipt-upload');
                return;
              }

              router.back();
            }}
            colorBackground={colors.card}
            colorText={colors.primaryDark}
            style={[styles.button, styles.outlineButton]}
          />
          <ThemeButton
            title={isDone ? 'Send to assistant' : 'Processing'}
            onPress={sendToAssistant}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            disabled={!isDone}
            style={styles.button}
          />
        </View>

        {isDone ? (
          <Pressable
            onPress={() =>
              router.replace({
                pathname: '/(assistant)/chat/[scenario]',
                params: { scenario: activeScenarioId },
              })
            }
          >
            <Text style={[styles.skipText, { color: colors.primaryDark }]}>
              Back to current chat without importing
            </Text>
          </Pressable>
        ) : null}
      </View>
    </AssistantScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginTop: 18,
    gap: 16,
  },
  previewCard: {
    borderWidth: 0,
    alignItems: 'center',
  },
  receiptPreview: {
    width: '100%',
    maxWidth: 170,
    height: 220,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 26,
    overflow: 'hidden',
  },
  receiptHeaderLine: {
    height: 10,
    width: '60%',
    borderRadius: 999,
    backgroundColor: '#D6EFFF',
    alignSelf: 'center',
  },
  receiptLineShort: {
    height: 8,
    width: '36%',
    borderRadius: 999,
    backgroundColor: '#D6EFFF',
    alignSelf: 'center',
    marginTop: 10,
  },
  receiptDivider: {
    marginTop: 20,
    height: 1,
    backgroundColor: '#D6EFFF',
  },
  receiptLine: {
    marginTop: 16,
    height: 8,
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#D6EFFF',
  },
  documentPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  documentBadge: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  documentMeta: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  scanFrame: {
    position: 'absolute',
    top: 40,
    width: '100%',
    maxWidth: 210,
    height: 260,
    borderRadius: 28,
    borderWidth: 2,
  },
  scanBeam: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 999,
  },
  statusTitle: {
    marginTop: 30,
    fontSize: 18,
    fontWeight: '800',
  },
  progressBar: {
    marginTop: 14,
    width: '100%',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressLabel: {
    marginTop: 8,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionBody: {
    marginTop: 6,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  fieldGroup: {
    marginTop: 14,
    gap: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },
  fieldLabel: {
    fontSize: Typography.body,
  },
  fieldValue: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: '700',
    textAlign: 'right',
  },
  noticeCard: {
    marginTop: 16,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
  },
  outlineButton: {
    borderWidth: 1,
  },
  skipText: {
    fontSize: Typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
});
