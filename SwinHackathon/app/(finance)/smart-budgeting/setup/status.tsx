import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goSmartBudgetBack } from '../_navigation';
import { useSetupNavigationDebounce } from './use-setup-navigation-debounce';

const statusCards = [
  { id: 'save', value: '$5,000', label: 'Projected Savings', tone: 'success' },
  { id: 'gain', value: '+10 - 25%', label: 'Savings Growth', tone: 'primary' },
  { id: 'debt', value: 'Excessive Debt', label: 'Debt Signal', tone: 'error' },
];

export default function SmartBudgetStatusScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { isNavigating, runNavigation } = useSetupNavigationDebounce();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting/setup/score')}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressValue, { backgroundColor: colors.primaryDark, width: '35%' }]} />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>Quick Snapshot</Text>
        <Text style={[styles.title, { color: colors.text }]}>Early signals from your answers</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          These cards reflect the status-style screens from the kit and preview what the assistant thinks about your budget direction.
        </Text>

        <View style={styles.cardStack}>
          {statusCards.map((card) => {
            const tone =
              card.tone === 'success' ? colors.success : card.tone === 'error' ? colors.error : colors.primaryDark;

            return (
              <View
                key={card.id}
                style={[
                  styles.statusCard,
                  { backgroundColor: colors.card, borderColor: hexToRgba(tone, 0.14) },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: hexToRgba(tone, 0.12) }]}>
                  <MaterialIcons name="circle" size={10} color={tone} />
                </View>
                <View style={styles.statusCopy}>
                  <Text style={[styles.statusValue, { color: tone }]}>{card.value}</Text>
                  <Text style={[styles.statusLabel, { color: hexToRgba(colors.text, 0.54) }]}>{card.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomArea}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            disabled={isNavigating}
            onPress={() => runNavigation(() => router.push('/(finance)/smart-budgeting/setup/stepper'))}
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>Continue</Text>
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
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerButton: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    progressBar: { flex: 1, height: 8, borderRadius: 999, overflow: 'hidden' },
    progressValue: { height: '100%', borderRadius: 999 },
    headerSpacer: { width: 40 },
    eyebrow: { marginTop: 28, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
    title: { marginTop: 10, fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.6 },
    body: { marginTop: 10, fontSize: Typography.body, lineHeight: 21 },
    cardStack: { marginTop: 24, gap: 12 },
    statusCard: { minHeight: 94, borderRadius: 24, borderWidth: 1, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
    statusDot: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    statusCopy: { flex: 1, minWidth: 0 },
    statusValue: { fontSize: 24, fontWeight: '900', letterSpacing: -0.6 },
    statusLabel: { marginTop: 4, fontSize: 12, fontWeight: '600' },
    bottomArea: { marginTop: 'auto', paddingTop: 18 },
    primaryButton: { minHeight: 50, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
