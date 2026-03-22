import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SmartBudgetReceiptReviewScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { receiptId } = useLocalSearchParams<{ receiptId?: string }>();
  const { categories, activeReceiptDraft, startReceiptDraft, confirmReceiptImport, getReceiptPreset } =
    useSmartBudgeting();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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

  useEffect(() => {
    if (receipt) {
      setSelectedCategoryId(receipt.categoryId);
    }
  }, [receipt]);

  if (!receipt) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Receipt not found</Text>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => router.replace('/(finance)/smart-budgeting/setup/receipt-gallery')}
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>Choose receipt again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Review receipt</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image source={receipt.image} style={styles.previewImage} />
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Extracted data</Text>
          <View style={styles.metaGrid}>
            <View>
              <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.46) }]}>Merchant</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{receipt.merchant}</Text>
            </View>
            <View>
              <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.46) }]}>Date</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{receipt.dateLabel}</Text>
            </View>
            <View>
              <Text style={[styles.metaLabel, { color: hexToRgba(colors.text, 0.46) }]}>Total</Text>
              <Text style={[styles.metaValue, { color: colors.primaryDark }]}>${receipt.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Line items</Text>
          <View style={styles.itemStack}>
            {receipt.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.itemAmount, { color: colors.text }]}>${item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Apply to category</Text>
          <View style={styles.categoryChips}>
            {categories.map((category) => {
              const active = selectedCategoryId === category.id;
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
                  onPress={() => setSelectedCategoryId(category.id)}
                >
                  <Text style={[styles.categoryChipText, { color: active ? colors.card : colors.text }]}>
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.buttonStack}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => {
              confirmReceiptImport(receipt.id, selectedCategoryId ?? receipt.categoryId);
              router.replace('/(finance)/smart-budgeting/monthly-budget');
            }}
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>Apply to budget</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.replace('/(finance)/smart-budgeting/setup/receipt-gallery')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Choose another receipt</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24, gap: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    headerButton: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800' },
    headerSpacer: { width: 40 },
    previewCard: { height: 220, borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    summaryCard: { borderRadius: 24, padding: 16 },
    sectionTitle: { fontSize: 17, fontWeight: '800' },
    metaGrid: { marginTop: 12, gap: 12 },
    metaLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    metaValue: { marginTop: 3, fontSize: 15, fontWeight: '700' },
    itemStack: { marginTop: 10, gap: 12 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    itemLabel: { fontSize: 14, fontWeight: '600' },
    itemAmount: { fontSize: 14, fontWeight: '800' },
    categoryChips: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    categoryChip: { minHeight: 38, borderRadius: 19, borderWidth: 1, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
    categoryChipText: { fontSize: 12, fontWeight: '800' },
    buttonStack: { gap: 12 },
    primaryButton: { minHeight: 50, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
    secondaryButton: { minHeight: 50, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    secondaryButtonText: { fontSize: 14, fontWeight: '800' },
    emptyState: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
    emptyTitle: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  });
}
