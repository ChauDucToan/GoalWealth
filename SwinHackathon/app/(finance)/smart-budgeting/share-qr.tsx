import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { goSmartBudgetBack } from './_navigation';

const accessModes = [
  { id: 'edit', label: 'Can edit', helper: 'Partner can update categories and imports.' },
  { id: 'view', label: 'View only', helper: 'Good for family visibility without editing.' },
] as const;

export default function ShareBudgetQrScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [accessMode, setAccessMode] = useState<(typeof accessModes)[number]['id']>('edit');

  return (
    <FinanceScreen
      title="Share QR Code"
      subtitle="Generate a simple access pass for your shared budget and choose what the next member can do."
      contentStyle={styles.contentStyle}
      onBackPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting/share-budget')}
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.heroEyebrow, { color: colors.primaryDark }]}>Budget access pass</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Scan to join the March household budget</Text>

          <View style={[styles.qrShell, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.qrGrid}>
              {Array.from({ length: 49 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.qrPixel,
                    {
                      backgroundColor:
                        index % 4 === 0 || index % 7 === 0 || index % 9 === 0 ? colors.text : colors.card,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={[styles.linkRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialIcons name="link" size={18} color={hexToRgba(colors.text, 0.5)} />
            <Text style={[styles.linkText, { color: colors.text }]}>finpal.app/budget/invite/9A2XQ</Text>
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Access level</Text>
          <View style={styles.optionStack}>
            {accessModes.map((mode) => {
              const active = mode.id === accessMode;
              return (
                <Pressable
                  key={mode.id}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.backgroundSoft,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => setAccessMode(mode.id)}
                >
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: colors.text }]}>{mode.label}</Text>
                    <Text style={[styles.optionHelper, { color: hexToRgba(colors.text, 0.52) }]}>{mode.helper}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: active ? colors.primaryDark : hexToRgba(colors.text, 0.24),
                        backgroundColor: active ? colors.primaryDark : 'transparent',
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.buttonStack}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
              onPress={() => router.replace('/(finance)/smart-budgeting/share-budget')}
            >
              <Text style={[styles.primaryButtonText, { color: colors.card }]}>Share QR Code</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}
              onPress={() => router.push('/(finance)/smart-budgeting/invite-members')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Invite Members Instead</Text>
            </Pressable>
          </View>
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    stack: {
      marginTop: 18,
      gap: 16,
    },
    heroCard: {
      gap: 16,
      borderWidth: 0,
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    heroTitle: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    qrShell: {
      alignSelf: 'center',
      width: 196,
      height: 196,
      borderRadius: 30,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qrGrid: {
      width: 132,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      justifyContent: 'center',
    },
    qrPixel: {
      width: 14,
      height: 14,
      borderRadius: 3,
    },
    linkRow: {
      minHeight: 48,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    linkText: {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      fontWeight: '700',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
    optionStack: {
      marginTop: 14,
      gap: 10,
    },
    optionCard: {
      minHeight: 74,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    optionText: {
      flex: 1,
      minWidth: 0,
    },
    optionLabel: {
      fontSize: 15,
      fontWeight: '800',
    },
    optionHelper: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    radio: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
    },
    buttonStack: {
      marginTop: 22,
      gap: 12,
    },
    primaryButton: {
      minHeight: 48,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
    secondaryButton: {
      minHeight: 48,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '700',
    },
  });
}
