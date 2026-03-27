import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goSmartBudgetBack } from '../_navigation';
import { useSetupNavigationDebounce } from './use-setup-navigation-debounce';

const categoryPresets = [4, 6, 8, 10];
const memberPresets = [1, 2, 3, 4];

export default function SmartBudgetCategoriesMembersScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [categoryCount, setCategoryCount] = useState(6);
  const [memberCount, setMemberCount] = useState(2);
  const { isNavigating, runNavigation } = useSetupNavigationDebounce();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting/setup/household')}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressValue, { backgroundColor: colors.primaryDark, width: '64%' }]} />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>Budget Structure</Text>
        <Text style={[styles.title, { color: colors.text }]}>How many categories and members do you expect?</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          This helps preload the right level of budget detail and sharing controls before we generate the planner.
        </Text>

        <View style={styles.stack}>
          <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelTitle, { color: colors.text }]}>Budget categories</Text>
                <Text style={[styles.panelBody, { color: hexToRgba(colors.text, 0.5) }]}>
                  More categories means a more granular plan.
                </Text>
              </View>
              <View style={styles.counterWrap}>
                <Pressable
                  style={[styles.counterButton, { backgroundColor: colors.backgroundSoft }]}
                  onPress={() => setCategoryCount((current) => Math.max(1, current - 1))}
                >
                  <MaterialIcons name="remove" size={18} color={colors.text} />
                </Pressable>
                <Text style={[styles.counterValue, { color: colors.text }]}>{categoryCount}</Text>
                <Pressable
                  style={[styles.counterButton, { backgroundColor: colors.backgroundSoft }]}
                  onPress={() => setCategoryCount((current) => Math.min(12, current + 1))}
                >
                  <MaterialIcons name="add" size={18} color={colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={styles.chipRow}>
              {categoryPresets.map((preset) => {
                const active = preset === categoryCount;
                return (
                  <Pressable
                    key={preset}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                        borderColor: active ? colors.primaryDark : colors.border,
                      },
                    ]}
                    onPress={() => setCategoryCount(preset)}
                  >
                    <Text style={[styles.chipText, { color: active ? colors.card : colors.text }]}>
                      {preset} categories
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelTitle, { color: colors.text }]}>Budget members</Text>
                <Text style={[styles.panelBody, { color: hexToRgba(colors.text, 0.5) }]}>
                  Sharing unlocks invite tools, QR access and role controls.
                </Text>
              </View>
              <View style={styles.counterWrap}>
                <Pressable
                  style={[styles.counterButton, { backgroundColor: colors.backgroundSoft }]}
                  onPress={() => setMemberCount((current) => Math.max(1, current - 1))}
                >
                  <MaterialIcons name="remove" size={18} color={colors.text} />
                </Pressable>
                <Text style={[styles.counterValue, { color: colors.text }]}>{memberCount}</Text>
                <Pressable
                  style={[styles.counterButton, { backgroundColor: colors.backgroundSoft }]}
                  onPress={() => setMemberCount((current) => Math.min(6, current + 1))}
                >
                  <MaterialIcons name="add" size={18} color={colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={styles.chipRow}>
              {memberPresets.map((preset) => {
                const active = preset === memberCount;
                return (
                  <Pressable
                    key={preset}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                        borderColor: active ? colors.primaryDark : colors.border,
                      },
                    ]}
                    onPress={() => setMemberCount(preset)}
                  >
                    <Text style={[styles.chipText, { color: active ? colors.card : colors.text }]}>
                      {preset} member{preset > 1 ? 's' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={[styles.helperCard, { backgroundColor: colors.card }]}>
          <View style={[styles.helperIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
            <MaterialIcons name="hub" size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.helperCopy}>
            <Text style={[styles.helperTitle, { color: colors.text }]}>Current planner shape</Text>
            <Text style={[styles.helperBody, { color: hexToRgba(colors.text, 0.54) }]}>
              {"We'll"} start with {categoryCount} categories and {memberCount} budget member{memberCount > 1 ? 's' : ''}.
            </Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            disabled={isNavigating}
            onPress={() => runNavigation(() => router.push('/(finance)/smart-budgeting/setup/amount'))}
          >
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: {
      flexGrow: 1,
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 28,
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
    stack: {
      marginTop: 24,
      gap: 14,
    },
    panel: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 16,
      gap: 14,
    },
    panelHeader: {
      gap: 14,
    },
    panelTitle: {
      fontSize: 16,
      fontWeight: '800',
    },
    panelBody: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    counterWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      alignSelf: 'flex-start',
    },
    counterButton: {
      width: 36,
      height: 36,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    counterValue: {
      minWidth: 28,
      textAlign: 'center',
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    chip: {
      minHeight: 38,
      borderRadius: 19,
      borderWidth: 1,
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipText: {
      fontSize: 12,
      fontWeight: '800',
    },
    helperCard: {
      marginTop: 16,
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
      marginTop: 24,
      paddingTop: 8,
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
