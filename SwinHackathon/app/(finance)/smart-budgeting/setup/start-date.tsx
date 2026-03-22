import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const calendarDays = Array.from({ length: 31 }, (_, index) => index + 1);

export default function SmartBudgetStartDateScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(1);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressValue, { backgroundColor: colors.primaryDark, width: '100%' }]} />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>Budget Start Date</Text>
        <Text style={[styles.title, { color: colors.text }]}>When should this budget cycle begin?</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.58) }]}>
          Pick the start date we should use for monthly rollovers, reports and reminder timing.
        </Text>

        <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.calendarHeader}>
            <Text style={[styles.calendarTitle, { color: colors.text }]}>March 2026</Text>
            <View style={styles.calendarActions}>
              <Pressable style={[styles.calendarButton, { backgroundColor: colors.backgroundSoft }]}>
                <MaterialIcons name="chevron-left" size={18} color={colors.text} />
              </Pressable>
              <Pressable style={[styles.calendarButton, { backgroundColor: colors.backgroundSoft }]}>
                <MaterialIcons name="chevron-right" size={18} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.weekHeader}>
            {weekDays.map((day, index) => (
              <Text key={`${day}-${index}`} style={[styles.weekLabel, { color: hexToRgba(colors.text, 0.46) }]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((day) => {
              const active = selectedDay === day;
              return (
                <Pressable
                  key={day}
                  style={[
                    styles.dayCell,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.backgroundSoft,
                    },
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayText, { color: active ? colors.card : colors.text }]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.selectionCard, { backgroundColor: colors.card }]}>
          <View style={[styles.selectionIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
            <MaterialIcons name="event" size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.selectionCopy}>
            <Text style={[styles.selectionTitle, { color: colors.text }]}>Selected date</Text>
            <Text style={[styles.selectionBody, { color: hexToRgba(colors.text, 0.54) }]}>
              March {selectedDay}, 2026
            </Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => router.replace('/(finance)/smart-budgeting/setup/budget-generated')}
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
    calendarCard: {
      marginTop: 24,
      borderRadius: 24,
      borderWidth: 1,
      padding: 16,
    },
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    calendarTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
    calendarActions: {
      flexDirection: 'row',
      gap: 8,
    },
    calendarButton: {
      width: 32,
      height: 32,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekHeader: {
      marginTop: 18,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 6,
    },
    weekLabel: {
      width: '13%',
      textAlign: 'center',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    daysGrid: {
      marginTop: 10,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    dayCell: {
      width: '12.8%',
      aspectRatio: 1,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayText: {
      fontSize: 13,
      fontWeight: '700',
    },
    selectionCard: {
      marginTop: 16,
      borderRadius: 20,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    selectionIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectionCopy: {
      flex: 1,
      minWidth: 0,
    },
    selectionTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    selectionBody: {
      marginTop: 3,
      fontSize: 12,
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
