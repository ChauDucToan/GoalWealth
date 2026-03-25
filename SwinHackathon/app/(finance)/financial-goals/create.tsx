import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { contributionPresets, goalTemplates, targetPresets } from '@/components/financial-goals/data';

export default function CreateFinancialGoalScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(goalTemplates[0]?.id ?? 'travel');
  const [selectedTarget, setSelectedTarget] = useState<number>(targetPresets[1] ?? 3000);
  const [selectedContribution, setSelectedContribution] = useState<number>(contributionPresets[1] ?? 250);

  return (
    <FinanceScreen
      title="Create Goal"
      subtitle="Build a saving target with a clear amount, category and monthly contribution."
      contentStyle={styles.contentStyle}
      scroll={false}
    >
      <View style={styles.stack}>
        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Goal category</Text>
          <View style={styles.templateGrid}>
            {goalTemplates.map((item) => {
              const active = item.id === selectedTemplate;

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.templateChip,
                    {
                      backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedTemplate(item.id)}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={active ? colors.primaryDark : hexToRgba(colors.text, 0.52)}
                  />
                  <Text style={[styles.templateLabel, { color: colors.text }]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Target amount</Text>
          <View style={styles.presetRow}>
            {targetPresets.map((item) => {
              const active = item === selectedTarget;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.valueChip,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedTarget(item)}
                >
                  <Text style={[styles.valueChipText, { color: active ? colors.card : colors.text }]}>
                    {formatCurrency(item)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly contribution</Text>
          <View style={styles.presetRow}>
            {contributionPresets.map((item) => {
              const active = item === selectedContribution;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.valueChip,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedContribution(item)}
                >
                  <Text style={[styles.valueChipText, { color: active ? colors.card : colors.text }]}>
                    {formatCurrency(item)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FinanceCard>

        <FinanceCard style={[styles.previewCard, { backgroundColor: colors.primaryDark }]}>
          <Text style={[styles.previewEyebrow, { color: hexToRgba(colors.card, 0.74) }]}>Preview</Text>
          <Text style={[styles.previewValue, { color: colors.card }]}>{formatCurrency(selectedTarget)}</Text>
          <Text style={[styles.previewBody, { color: hexToRgba(colors.card, 0.82) }]}>
            Funding this target at {formatCurrency(selectedContribution)}/month creates a clean, trackable saving plan.
          </Text>
        </FinanceCard>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
          onPress={() => router.replace('/(finance)/financial-goals')}
        >
          <Text style={[styles.primaryButtonText, { color: colors.card }]}>Save goal draft</Text>
        </Pressable>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: {
      paddingBottom: 28,
    },
    stack: {
      marginTop: 18,
      gap: 16,
      paddingBottom: 18,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      marginBottom: 14,
    },
    templateGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    templateChip: {
      width: '47%',
      minHeight: 82,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 12,
    },
    templateLabel: {
      fontSize: 13,
      fontWeight: '700',
    },
    presetRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    valueChip: {
      minWidth: 82,
      minHeight: 42,
      paddingHorizontal: 14,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    valueChipText: {
      fontSize: 13,
      fontWeight: '800',
    },
    previewCard: {
      borderWidth: 0,
    },
    previewEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    previewValue: {
      marginTop: 10,
      fontSize: 34,
      fontWeight: '900',
      letterSpacing: -0.9,
    },
    previewBody: {
      marginTop: 10,
      fontSize: Typography.body,
      lineHeight: 20,
      fontWeight: '500',
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
  });
}
