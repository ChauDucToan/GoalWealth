import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  importReceiptFromSource,
  receiptImportSourceCards,
  ReceiptImportSourceKey,
} from '@/components/smart-budgeting/receipt-import';
import { ColorTheme, Typography } from '@/constants/theme';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { goSmartBudgetBack, resolveSmartBudgetReturnRoute } from '@/app/(finance)/smart-budgeting/_navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSetupNavigationDebounce } from './use-setup-navigation-debounce';

export default function SmartBudgetReceiptGalleryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const backRoute = resolveSmartBudgetReturnRoute(returnTo);
  const { setReceiptImportDraft } = useAssistant();
  const [activeSource, setActiveSource] = useState<ReceiptImportSourceKey | null>(null);
  const { isNavigating, runNavigation } = useSetupNavigationDebounce();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.card }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}
            onPress={() => goSmartBudgetBack(router, backRoute)}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Import receipt</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          Use the same receipt intake as Add spending. Capture a real receipt, import an image, then OCR will review the raw text.
        </Text>

        <ResponsiveGrid
          minItemWidth={120}
          horizontalPadding={0}
          gap={12}
          maxColumns={3}
          style={styles.sourceGrid}
        >
          {receiptImportSourceCards.map((item) => {
            const isActive = activeSource === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.sourceCard,
                  {
                    backgroundColor: colors.backgroundSoft,
                    borderColor: isActive ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.08),
                  },
                ]}
                onPress={() => {
                  if (activeSource || isNavigating) {
                    return;
                  }

                  setActiveSource(item.id);
                  void importReceiptFromSource(item.id, (draft) => {
                    setReceiptImportDraft(draft);
                    runNavigation(() =>
                      router.push({
                        pathname: '/(finance)/smart-budgeting/receipt-scan',
                        params: { returnTo: returnTo ?? 'budget-setup' },
                      })
                    );
                  }).finally(() => {
                    setActiveSource(null);
                  });
                }}
              >
                <View style={[styles.sourceIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}>
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

        <View style={styles.buttonStack}>
          <Pressable
            style={[styles.secondaryButton, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}
            onPress={() =>
              runNavigation(() =>
                router.replace({
                  pathname: '/(finance)/smart-budgeting/monthly-budget',
                  params: returnTo ? { returnTo } : undefined,
                })
              )
            }
          >
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
    sourceGrid: { marginTop: 24 },
    sourceCard: { minHeight: 154, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 18 },
    sourceIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    sourceTitle: { marginTop: 18, fontSize: 15, lineHeight: 20, fontWeight: '800' },
    sourceHelper: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    buttonStack: { marginTop: 'auto', gap: 12 },
    secondaryButton: { minHeight: 50, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    secondaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
