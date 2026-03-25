import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { categoryColorOptions, categoryIconOptions } from '@/components/smart-budgeting/data';

export default function EditCategoryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(categoryColorOptions[0]);
  const [selectedIcon, setSelectedIcon] = useState<(typeof categoryIconOptions)[number]>('apartment');

  return (
    <FinanceScreen
      title="Edit Budget Category"
      subtitle="Single editor for create, edit and delete states from the design flow."
      contentStyle={styles.contentStyle}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(finance)/smart-budgeting/manage-categories')}
        >
          <MaterialIcons name="check" size={20} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard>
          <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.46) }]}>Category name</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
            <TextInput
              defaultValue="Housing"
              placeholder="Enter category name"
              placeholderTextColor={hexToRgba(colors.text, 0.34)}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <Text style={[styles.fieldLabel, styles.fieldSpacing, { color: hexToRgba(colors.text, 0.46) }]}>Choose color</Text>
          <View style={styles.colorRow}>
            {categoryColorOptions.map((item) => {
              const active = selectedColor === item;
              return (
                <Pressable
                  key={item}
                  style={[
                    styles.colorChip,
                    {
                      backgroundColor: item,
                      borderColor: active ? colors.text : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedColor(item)}
                />
              );
            })}
          </View>

          <Text style={[styles.fieldLabel, styles.fieldSpacing, { color: hexToRgba(colors.text, 0.46) }]}>Choose icon</Text>
          <View style={styles.iconGrid}>
            {categoryIconOptions.map((icon) => {
              const active = selectedIcon === icon;
              return (
                <Pressable
                  key={icon}
                  style={[
                    styles.iconCell,
                    {
                      backgroundColor: active ? hexToRgba(selectedColor, 0.14) : colors.backgroundSoft,
                      borderColor: active ? selectedColor : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <MaterialIcons name={icon} size={20} color={active ? selectedColor : colors.text} />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.buttonStack}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.primaryButtonText, { color: colors.card }]}>Save Budget Category</Text>
            </Pressable>

            <Pressable
              style={[styles.deleteButton, { backgroundColor: hexToRgba(colors.error, 0.08), borderColor: hexToRgba(colors.error, 0.18) }]}
              onPress={() => router.push('/(finance)/smart-budgeting/delete-category')}
            >
              <MaterialIcons name="delete-outline" size={18} color={colors.error} />
              <Text style={[styles.deleteText, { color: colors.error }]}>Delete Budget Category</Text>
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
    fieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    fieldSpacing: {
      marginTop: 18,
    },
    inputWrap: {
      marginTop: 8,
      minHeight: 52,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 14,
      justifyContent: 'center',
    },
    input: {
      fontSize: Typography.body,
      fontWeight: '600',
    },
    colorRow: {
      marginTop: 10,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    colorChip: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
    },
    iconGrid: {
      marginTop: 12,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    iconCell: {
      width: 48,
      height: 48,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonStack: {
      marginTop: 24,
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
    deleteButton: {
      minHeight: 48,
      borderRadius: 20,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    deleteText: {
      fontSize: 14,
      fontWeight: '800',
    },
  });
}
