import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { budgetCategories } from './_data';

export default function ManageCategoriesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <FinanceScreen
      title="Organize Category"
      subtitle="Manage order and jump into create/edit flows like the category management screens in the kit."
      contentStyle={styles.contentStyle}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(finance)/smart-budgeting/create-category')}
        >
          <MaterialIcons name="add" size={20} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget categories</Text>
            <Pressable onPress={() => router.push('/(finance)/smart-budgeting/create-category')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Create category</Text>
            </Pressable>
          </View>

          <View style={styles.list}>
            {budgetCategories.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.row, { borderBottomColor: colors.border }]}
                onPress={() => router.push('/(finance)/smart-budgeting/edit-category')}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.dot, { backgroundColor: item.accent }]} />
                  <View>
                    <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.note, { color: hexToRgba(colors.text, 0.5) }]}>{item.note}</Text>
                  </View>
                </View>
                <MaterialIcons name="drag-indicator" size={20} color={hexToRgba(colors.text, 0.36)} />
              </Pressable>
            ))}
          </View>
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    headerAction: {
      width: 38,
      height: 38,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stack: {
      marginTop: 18,
      gap: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
    sectionLink: {
      fontSize: 13,
      fontWeight: '700',
    },
    list: {
      marginTop: 14,
    },
    row: {
      minHeight: 68,
      paddingVertical: 14,
      borderBottomWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      minWidth: 0,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    name: {
      fontSize: 15,
      fontWeight: '800',
    },
    note: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: '500',
    },
  });
}
