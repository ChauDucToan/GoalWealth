import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useSmartBudgeting } from '@/hooks/use-smart-budgeting';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSetupNavigationDebounce } from './use-setup-navigation-debounce';

export default function SmartBudgetGeneratedScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { completeSetup } = useSmartBudgeting();
  const { isNavigating, runNavigation } = useSetupNavigationDebounce();

  useEffect(() => {
    completeSetup();
  }, [completeSetup]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={[styles.heroOrb, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}>
          <View style={[styles.heroBadge, { backgroundColor: colors.card }]}>
            <MaterialIcons name="task-alt" size={36} color={colors.primaryDark} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Budget Set up!</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          Your first smart budget has been generated. Setup is complete now. Open the monthly planner directly, or import a receipt later as a separate flow.
        </Text>

        <View style={styles.buttonStack}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            disabled={isNavigating}
            onPress={() => runNavigation(() => router.replace('/(finance)/smart-budgeting/monthly-budget'))}
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>Open Monthly Budget</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            disabled={isNavigating}
            onPress={() => runNavigation(() => router.replace('/(finance)/smart-budgeting/setup/receipt-gallery'))}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Import Receipt</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
    heroOrb: { width: 168, height: 168, borderRadius: 84, alignItems: 'center', justifyContent: 'center' },
    heroBadge: { width: 92, height: 92, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    title: { marginTop: 26, fontSize: 30, lineHeight: 36, fontWeight: '900', letterSpacing: -0.6, textAlign: 'center' },
    body: { marginTop: 12, fontSize: Typography.body, lineHeight: 21, textAlign: 'center' },
    buttonStack: { marginTop: 28, width: '100%', gap: 12 },
    primaryButton: { minHeight: 50, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
    secondaryButton: { minHeight: 50, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    secondaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
