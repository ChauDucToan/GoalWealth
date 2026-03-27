import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goSmartBudgetBack } from '../_navigation';
import { useSetupNavigationDebounce } from './use-setup-navigation-debounce';

const budgetPresets = [1500, 2500, 3500, 5000];

export default function SmartBudgetAmountScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [amount, setAmount] = useState('3250');
  const { isNavigating, runNavigation } = useSetupNavigationDebounce();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting/setup/categories-members')}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressValue, { backgroundColor: colors.primaryDark, width: '72%' }]} />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>Budget Amount</Text>
        <Text style={[styles.title, { color: colors.text }]}>How much do you want to budget each month?</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          This becomes the main monthly cap used across the dashboard, category planner and alerts.
        </Text>

        <View style={[styles.amountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.amountPrefix, { color: hexToRgba(colors.text, 0.44) }]}>USD</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={hexToRgba(colors.text, 0.28)}
            style={[styles.amountInput, { color: colors.text }]}
          />
        </View>

        <View style={styles.presetRow}>
          {budgetPresets.map((preset) => {
            const active = amount === String(preset);
            return (
              <Pressable
                key={preset}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: active ? colors.primaryDark : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setAmount(String(preset))}
              >
                <Text
                  style={[
                    styles.presetText,
                    { color: active ? colors.card : colors.text },
                  ]}
                >
                  ${preset}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.helperCard, { backgroundColor: colors.card }]}>
          <View style={[styles.helperIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
            <MaterialIcons name="lightbulb" size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.helperCopy}>
            <Text style={[styles.helperTitle, { color: colors.text }]}>Suggested starting point</Text>
            <Text style={[styles.helperBody, { color: hexToRgba(colors.text, 0.54) }]}>
              Start with the amount that already covers fixed costs. We can optimize categories later.
            </Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            disabled={isNavigating}
            onPress={() => runNavigation(() => router.push('/(finance)/smart-budgeting/setup/review-period'))}
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
    content: {
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressBar: {
      flex: 1,
      height: 8,
      borderRadius: 999,
      overflow: 'hidden',
    },
    progressValue: {
      height: '100%',
      borderRadius: 999,
    },
    headerSpacer: {
      width: 40,
    },
    eyebrow: {
      marginTop: 28,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    title: {
      marginTop: 10,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '900',
      letterSpacing: -0.6,
    },
    body: {
      marginTop: 10,
      fontSize: Typography.body,
      lineHeight: 21,
    },
    amountCard: {
      marginTop: 28,
      minHeight: 112,
      borderRadius: 28,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    amountPrefix: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    amountInput: {
      fontSize: 42,
      fontWeight: '900',
      letterSpacing: -1,
      textAlign: 'center',
      minWidth: 180,
    },
    presetRow: {
      marginTop: 18,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    presetChip: {
      minHeight: 40,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    presetText: {
      fontSize: 13,
      fontWeight: '800',
    },
    helperCard: {
      marginTop: 18,
      borderRadius: 22,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    helperIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    helperCopy: {
      flex: 1,
      minWidth: 0,
    },
    helperTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    helperBody: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    bottomArea: {
      marginTop: 'auto',
      paddingTop: 18,
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
  });
}
