import { hexToRgba } from '@/components/auth/AuthKit';
import { receiptPresets } from '@/app/(finance)/smart-budgeting/_data';
import { ColorTheme, Typography } from '@/constants/theme';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { goSmartBudgetBack } from '@/app/(finance)/smart-budgeting/_navigation';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SmartBudgetReceiptGalleryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { startReceiptDraft } = useSmartBudgeting();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.card }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={[styles.headerButton, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]} onPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting')}>
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Choose receipt source</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          Pick a recent receipt or open the camera. This covers the receipt/gallery part of the Smart Budgeting flow.
        </Text>

        <View style={styles.galleryGrid}>
          {receiptPresets.map((receipt) => (
            <Pressable
              key={receipt.id}
              style={[styles.galleryCard, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}
              onPress={() => {
                startReceiptDraft(receipt.id);
                router.push({
                  pathname: '/(finance)/smart-budgeting/setup/receipt-scan',
                  params: { receiptId: receipt.id },
                });
              }}
            >
              <Image source={receipt.image} style={styles.galleryImage} />
            </Pressable>
          ))}
        </View>

        <View style={styles.buttonStack}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => {
              const firstReceipt = receiptPresets[0];
              startReceiptDraft(firstReceipt.id);
              router.push({
                pathname: '/(finance)/smart-budgeting/setup/receipt-scan',
                params: { receiptId: firstReceipt.id },
              });
            }}
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>Scan receipt now</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]} onPress={() => router.replace('/(finance)/smart-budgeting/monthly-budget')}>
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Skip for now</Text>
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
    body: { marginTop: 20, fontSize: Typography.body, lineHeight: 21, textAlign: 'center' },
    galleryGrid: { marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
    galleryCard: { width: '47%', aspectRatio: 0.82, borderRadius: 22, borderWidth: 1, overflow: 'hidden' },
    galleryImage: { width: '100%', height: '100%' },
    buttonStack: { marginTop: 'auto', gap: 12 },
    primaryButton: { minHeight: 50, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
    secondaryButton: { minHeight: 50, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    secondaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
