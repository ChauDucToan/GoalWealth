import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goSmartBudgetBack } from '../_navigation';

const scoreSteps = [
  { id: 'careful', label: 'Very careful', value: 25 },
  { id: 'steady', label: 'Balanced', value: 55 },
  { id: 'aggressive', label: 'Aggressive', value: 85 },
];

export default function SmartBudgetScoreScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [selectedValue, setSelectedValue] = useState(55);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting/setup/start-date')}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressValue, { backgroundColor: colors.primaryDark, width: '25%' }]} />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>Budget Attitude</Text>
        <Text style={[styles.title, { color: colors.text }]}>How strict should this budget feel?</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          This mirrors the early preference screens in the kit and tunes the planner before the detailed steps.
        </Text>

        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.scoreValue, { color: colors.primaryDark }]}>{selectedValue}</Text>
          <Text style={[styles.scoreLabel, { color: hexToRgba(colors.text, 0.5) }]}>budget tone score</Text>

          <View style={[styles.scoreTrack, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}>
            <View style={[styles.scoreFill, { width: `${selectedValue}%`, backgroundColor: colors.primaryDark }]} />
          </View>

          <View style={styles.scoreSteps}>
            {scoreSteps.map((step) => {
              const active = selectedValue === step.value;
              return (
                <Pressable
                  key={step.id}
                  style={[
                    styles.scoreChip,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedValue(step.value)}
                >
                  <Text style={[styles.scoreChipText, { color: active ? colors.card : colors.text }]}>
                    {step.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomArea}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => router.push('/(finance)/smart-budgeting/setup/status')}
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
    scoreCard: {
      marginTop: 28,
      borderRadius: 28,
      borderWidth: 1,
      paddingHorizontal: 18,
      paddingVertical: 24,
      alignItems: 'center',
    },
    scoreValue: { fontSize: 46, fontWeight: '900', letterSpacing: -1 },
    scoreLabel: { marginTop: 6, fontSize: 12, fontWeight: '600' },
    scoreTrack: { marginTop: 18, width: '100%', height: 12, borderRadius: 999, overflow: 'hidden' },
    scoreFill: { height: '100%', borderRadius: 999 },
    scoreSteps: { marginTop: 18, width: '100%', gap: 10 },
    scoreChip: { minHeight: 42, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    scoreChipText: { fontSize: 13, fontWeight: '800' },
    bottomArea: { marginTop: 'auto', paddingTop: 18 },
    primaryButton: { minHeight: 50, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
