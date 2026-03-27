import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goSmartBudgetBack } from '../_navigation';
import { useSetupNavigationDebounce } from './use-setup-navigation-debounce';

export default function SmartBudgetStepperScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(5);
  const [dependents, setDependents] = useState(2);
  const { isNavigating, runNavigation } = useSetupNavigationDebounce();

  const buildStepper = (
    label: string,
    value: number,
    onChange: (next: number) => void,
  ) => (
    <View style={[styles.stepperCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.stepperLabel, { color: hexToRgba(colors.text, 0.54) }]}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable style={[styles.stepperButton, { backgroundColor: colors.backgroundSoft }]} onPress={() => onChange(Math.max(0, value - 1))}>
          <MaterialIcons name="remove" size={18} color={colors.text} />
        </Pressable>
        <Text style={[styles.stepperValue, { color: colors.text }]}>{value}</Text>
        <Pressable style={[styles.stepperButton, { backgroundColor: colors.backgroundSoft }]} onPress={() => onChange(value + 1)}>
          <MaterialIcons name="add" size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting/setup/status')}>
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressValue, { backgroundColor: colors.primaryDark, width: '45%' }]} />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>Household Setup</Text>
        <Text style={[styles.title, { color: colors.text }]}>How many people should this plan cover?</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          This mirrors the numeric stepper screen in the kit and adjusts shared budget assumptions.
        </Text>

        <View style={styles.stack}>
          {buildStepper('Adults', adults, setAdults)}
          {buildStepper('Children', children, setChildren)}
          {buildStepper('Dependents', dependents, setDependents)}
        </View>

        <View style={styles.bottomArea}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            disabled={isNavigating}
            onPress={() => runNavigation(() => router.push('/(finance)/smart-budgeting/setup/details'))}
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
    stack: { marginTop: 24, gap: 12 },
    stepperCard: { minHeight: 92, borderRadius: 24, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 16, justifyContent: 'space-between' },
    stepperLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    stepperControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    stepperButton: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    stepperValue: { fontSize: 34, fontWeight: '900', letterSpacing: -0.8 },
    bottomArea: { marginTop: 'auto', paddingTop: 18 },
    primaryButton: { minHeight: 50, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
