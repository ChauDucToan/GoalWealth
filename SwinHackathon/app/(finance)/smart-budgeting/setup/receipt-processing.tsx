import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SmartBudgetReceiptProcessingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { receiptId, returnTo } = useLocalSearchParams<{ receiptId?: string; returnTo?: string }>();
  const { startReceiptDraft } = useSmartBudgeting();

  useEffect(() => {
    if (receiptId) {
      startReceiptDraft(receiptId);
    }

    const timer = setTimeout(() => {
      router.replace({
        pathname: '/(finance)/smart-budgeting/setup/receipt-review',
        params: receiptId ? { receiptId, returnTo } : returnTo ? { returnTo } : undefined,
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [receiptId, returnTo, router, startReceiptDraft]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={[styles.loaderWrap, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Analyzing receipt…</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          We are extracting merchant, date and category suggestions before showing a review screen.
        </Text>
        <View style={[styles.helperRow, { backgroundColor: colors.card }]}>
          <MaterialIcons name="receipt-long" size={18} color={colors.primaryDark} />
          <Text style={[styles.helperText, { color: colors.text }]}>This covers the loading and import transition from the center of the kit flow.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
    loaderWrap: { width: 96, height: 96, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.6, textAlign: 'center' },
    body: { fontSize: Typography.body, lineHeight: 21, textAlign: 'center' },
    helperRow: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
    helperText: { flex: 1, minWidth: 0, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  });
}
