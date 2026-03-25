import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import { goSmartBudgetBack } from '@/app/(finance)/smart-budgeting/_navigation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SmartBudgetReceiptScanScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { receiptId, returnTo } = useLocalSearchParams<{ receiptId?: string; returnTo?: string }>();
  const { activeReceiptDraft, startReceiptDraft, getReceiptPreset } = useSmartBudgeting();
  const receipt =
    activeReceiptDraft?.id === receiptId
      ? activeReceiptDraft
      : receiptId
        ? getReceiptPreset(receiptId) ?? null
        : null;

  useEffect(() => {
    if (receiptId) {
      startReceiptDraft(receiptId);
    }
  }, [receiptId, startReceiptDraft]);

  if (!receipt) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Receipt not found</Text>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => router.replace('/(finance)/smart-budgeting/setup/receipt-gallery')}
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>Back to receipts</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.card }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}
            onPress={() =>
              goSmartBudgetBack(
                router,
                returnTo
                  ? { pathname: '/(finance)/smart-budgeting/setup/receipt-gallery', params: { returnTo } }
                  : '/(finance)/smart-budgeting/setup/receipt-gallery'
              )
            }
          >
            <MaterialIcons name="close" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Receipt preview</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.previewCard, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
          <Image source={receipt.image} style={styles.previewImage} />
        </View>

        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          We&apos;ll read merchant, date and spending lines from {receipt.merchant} before importing it into the budget.
        </Text>

        <View style={styles.buttonStack}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            onPress={() =>
              router.push({
                pathname: '/(finance)/smart-budgeting/setup/receipt-processing',
                params: { receiptId: receipt.id, returnTo },
              })
            }
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>Process receipt</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}
            onPress={() =>
              goSmartBudgetBack(
                router,
                returnTo
                  ? { pathname: '/(finance)/smart-budgeting/setup/receipt-gallery', params: { returnTo } }
                  : '/(finance)/smart-budgeting/setup/receipt-gallery'
              )
            }
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Retake</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    headerButton: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800' },
    headerSpacer: { width: 40 },
    previewCard: { marginTop: 20, flex: 1, borderRadius: 26, borderWidth: 1, overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    body: { marginTop: 18, fontSize: Typography.body, lineHeight: 21, textAlign: 'center' },
    buttonStack: { marginTop: 20, gap: 12 },
    primaryButton: { minHeight: 50, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
    secondaryButton: { minHeight: 50, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    secondaryButtonText: { fontSize: 14, fontWeight: '800' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
    emptyTitle: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  });
}
