import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { smartBudgetSetupSteps } from '@/components/smart-budgeting/data';
import { useSetupNavigationDebounce } from './use-setup-navigation-debounce';

export default function SmartBudgetSetupStepScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { step } = useLocalSearchParams<{ step?: string }>();

  const currentIndex = smartBudgetSetupSteps.findIndex((item) => item.id === step);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentStep = smartBudgetSetupSteps[safeIndex];
  const [selectedOption, setSelectedOption] = useState(currentStep.options[0]?.id);
  const { isNavigating, runNavigation } = useSetupNavigationDebounce();

  const isLastStep = safeIndex === smartBudgetSetupSteps.length - 1;

  const onContinue = () => {
    runNavigation(() => {
      if (isLastStep) {
        router.push('/(finance)/smart-budgeting/setup/categories-members');
        return;
      }

      const nextStep = smartBudgetSetupSteps[safeIndex + 1];
      router.push(`/(finance)/smart-budgeting/setup/${nextStep.id}`);
    });
  };

  useEffect(() => {
    setSelectedOption(currentStep.options[0]?.id);
  }, [currentStep]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressValue,
                {
                  backgroundColor: colors.primaryDark,
                  width: `${((safeIndex + 1) / smartBudgetSetupSteps.length) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>{currentStep.eyebrow}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{currentStep.title}</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>{currentStep.body}</Text>

        <View style={styles.optionStack}>
          {currentStep.options.map((option) => {
            const active = option.id === selectedOption;
            return (
              <Pressable
                key={option.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setSelectedOption(option.id)}
              >
                <View style={styles.optionCopy}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                  {option.helper ? (
                    <Text style={[styles.optionHelper, { color: hexToRgba(colors.text, 0.5) }]}>{option.helper}</Text>
                  ) : null}
                </View>
                <View
                  style={[
                    styles.optionCheck,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.card,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                >
                  {active ? <MaterialIcons name="check" size={16} color={colors.card} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.bottomArea}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            disabled={isNavigating}
            onPress={onContinue}
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>
              Continue
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
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
    optionStack: {
      marginTop: 26,
      gap: 12,
    },
    optionCard: {
      minHeight: 78,
      borderRadius: 22,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
    },
    optionCopy: {
      flex: 1,
      minWidth: 0,
    },
    optionLabel: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '800',
    },
    optionHelper: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    optionCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
