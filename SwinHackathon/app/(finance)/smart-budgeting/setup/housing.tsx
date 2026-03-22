import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const housingOptions = ['Rent', 'Mortgage', 'Family Home'] as const;

export default function SmartBudgetHousingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [selected, setSelected] = useState<(typeof housingOptions)[number]>('Mortgage');

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressValue, { backgroundColor: colors.primaryDark, width: '65%' }]} />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>Housing</Text>
        <Text style={[styles.title, { color: colors.text }]}>Select how housing should be handled.</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          This matches the single-focus category screens in the kit where one budget area is configured in detail.
        </Text>

        <View style={styles.stack}>
          {housingOptions.map((option) => {
            const active = selected === option;
            return (
              <Pressable
                key={option}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setSelected(option)}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.12) : colors.backgroundSoft }]}>
                    <MaterialIcons name="house" size={20} color={active ? colors.primaryDark : colors.text} />
                  </View>
                  <View>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>{option}</Text>
                    <Text style={[styles.optionBody, { color: hexToRgba(colors.text, 0.5) }]}>
                      {option === 'Mortgage'
                        ? 'Track principal, utilities and repairs.'
                        : option === 'Rent'
                          ? 'Track rent, utilities and renter costs.'
                          : 'Lower housing pressure with family support.'}
                    </Text>
                  </View>
                </View>
                {active ? <MaterialIcons name="check-circle" size={20} color={colors.primaryDark} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.bottomArea}>
          <Pressable style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]} onPress={() => router.push('/(finance)/smart-budgeting/setup/planning')}>
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
    optionCard: { minHeight: 88, borderRadius: 24, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
    optionIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    optionTitle: { fontSize: 15, fontWeight: '800' },
    optionBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    bottomArea: { marginTop: 'auto', paddingTop: 18 },
    primaryButton: { minHeight: 50, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
