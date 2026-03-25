import { ThemeButton } from '@/components/ThemeButton';
import { AssistantCard, AssistantScreen } from '@/components/assistant/AssistantScaffold';
import { hexToRgba } from '@/components/auth/AuthKit';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

const extractedFields = [
  { label: 'Merchant', value: 'FreshMart Grocery' },
  { label: 'Category', value: 'Food & Groceries' },
  { label: 'Total', value: '$88.00' },
  { label: 'Date', value: 'Sep 23' },
];

export default function ReceiptScanScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { activeScenarioId, selectAssistantScenario } = useAssistant();
  const [progress, setProgress] = useState(10);

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
      return 'Extracting totals and merchant details';
    }

    if (!isDone) {
      return 'Classifying the transaction';
    }

    return 'Receipt summary ready';
  }, [isDone, progress]);

  return (
    <AssistantScreen
      title="Receipt Scanner"
      subtitle="Demo OCR flow that mirrors the scanning and result states in the board"
    >
      <View style={styles.stack}>
        <AssistantCard style={[styles.previewCard, { backgroundColor: colors.darkBackground }]}>
          <View style={[styles.receiptPreview, { backgroundColor: colors.card }]}>
            <View style={styles.receiptHeaderLine} />
            <View style={styles.receiptLineShort} />
            <View style={styles.receiptDivider} />
            <View style={styles.receiptLine} />
            <View style={styles.receiptLine} />
            <View style={styles.receiptLineShort} />
          </View>

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
                Ready to add into the AI assistant chat
              </Text>
            </View>
          </AssistantCard>
        ) : null}

        <View style={styles.buttonRow}>
          <ThemeButton
            title={isDone ? 'Scan again' : 'Cancel'}
            onPress={() => {
              if (isDone) {
                setProgress(10);
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
            onPress={() => {
              if (!isDone) {
                return;
              }

              selectAssistantScenario('receipt');
              router.replace({
                pathname: '/(assistant)/chat/[scenario]',
                params: { scenario: 'receipt' },
              });
            }}
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
    width: 170,
    height: 220,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 26,
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
  scanFrame: {
    position: 'absolute',
    top: 40,
    width: 210,
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
  fieldGroup: {
    marginTop: 14,
    gap: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    gap: 10,
  },
  button: {
    flex: 1,
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
