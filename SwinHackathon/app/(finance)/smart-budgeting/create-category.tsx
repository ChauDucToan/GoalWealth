import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { categoryColorOptions, categoryIconOptions } from '@/components/smart-budgeting/data';
import { goSmartBudgetBack } from './_navigation';

const starterTemplates = [
  {
    id: 'groceries',
    label: 'Groceries',
    helper: 'Weekly essentials and market runs',
    icon: 'shopping-bag',
    color: '#6A927A',
  },
  {
    id: 'learning',
    label: 'Learning',
    helper: 'Courses, books and subscriptions',
    icon: 'school',
    color: '#7C8CF8',
  },
  {
    id: 'pets',
    label: 'Pets',
    helper: 'Food, toys and care visits',
    icon: 'pets',
    color: '#E45D93',
  },
] as const;

export default function CreateCategoryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [categoryName, setCategoryName] = useState('Dining & Coffee');
  const [monthlyLimit, setMonthlyLimit] = useState('320');
  const [selectedColor, setSelectedColor] = useState(categoryColorOptions[5]);
  const [selectedIcon, setSelectedIcon] = useState<(typeof categoryIconOptions)[number]>('restaurant');

  const applyTemplate = (template: (typeof starterTemplates)[number]) => {
    setCategoryName(template.label);
    setSelectedColor(template.color);
    setSelectedIcon(template.icon);
  };

  return (
    <FinanceScreen
      title="Create Budget Category"
      subtitle="Set up a fresh spending lane with its own icon, color and monthly cap."
      contentStyle={styles.contentStyle}
      onBackPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting/manage-categories')}
      rightAccessory={
        <View style={[styles.headerBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.12) }]}>
          <Text style={[styles.headerBadgeText, { color: colors.primaryDark }]}>New</Text>
        </View>
      }
    >
      <View style={styles.stack}>
        <FinanceCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIconWrap, { backgroundColor: hexToRgba(selectedColor, 0.12) }]}>
              <MaterialIcons name={selectedIcon} size={24} color={selectedColor} />
            </View>
            <View style={styles.heroText}>
              <Text style={[styles.heroTitle, { color: colors.text }]} numberOfLines={1}>
                {categoryName}
              </Text>
              <Text style={[styles.heroNote, { color: hexToRgba(colors.text, 0.56) }]}>
                Monthly cap ${monthlyLimit || '0'} with a separate spending pace.
              </Text>
            </View>
          </View>

          <View style={styles.heroMetrics}>
            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSoft }]}>
              <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.46) }]}>Target</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>${monthlyLimit || '0'}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSoft }]}>
              <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.46) }]}>Pacing</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>Monthly</Text>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.46) }]}>Category name</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
            <TextInput
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Enter category name"
              placeholderTextColor={hexToRgba(colors.text, 0.34)}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <Text style={[styles.fieldLabel, styles.fieldSpacing, { color: hexToRgba(colors.text, 0.46) }]}>
            Monthly limit
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
            <TextInput
              value={monthlyLimit}
              onChangeText={(value) => setMonthlyLimit(value.replace(/[^0-9.]/g, '').slice(0, 7))}
              placeholder="0"
              keyboardType="decimal-pad"
              placeholderTextColor={hexToRgba(colors.text, 0.34)}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <Text style={[styles.fieldLabel, styles.fieldSpacing, { color: hexToRgba(colors.text, 0.46) }]}>
            Starter templates
          </Text>
          <View style={styles.templateList}>
            {starterTemplates.map((template) => (
              <Pressable
                key={template.id}
                style={[styles.templateCard, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}
                onPress={() => applyTemplate(template)}
              >
                <View style={[styles.templateIcon, { backgroundColor: hexToRgba(template.color, 0.12) }]}>
                  <MaterialIcons name={template.icon} size={18} color={template.color} />
                </View>
                <View style={styles.templateText}>
                  <Text style={[styles.templateTitle, { color: colors.text }]}>{template.label}</Text>
                  <Text style={[styles.templateHelper, { color: hexToRgba(colors.text, 0.5) }]}>{template.helper}</Text>
                </View>
              </Pressable>
            ))}
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
              onPress={() => router.replace('/(finance)/smart-budgeting/manage-categories')}
            >
              <Text style={[styles.primaryButtonText, { color: colors.card }]}>Create Budget Category</Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}
              onPress={() => router.replace('/(finance)/smart-budgeting/edit-category')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Open Edit Version</Text>
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
    headerBadge: {
      minHeight: 32,
      paddingHorizontal: 12,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerBadgeText: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    stack: {
      marginTop: 18,
      gap: 16,
    },
    heroCard: {
      gap: 16,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    heroIconWrap: {
      width: 58,
      height: 58,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroText: {
      flex: 1,
      minWidth: 0,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: '800',
    },
    heroNote: {
      marginTop: 4,
      fontSize: Typography.body,
      lineHeight: 20,
      fontWeight: '500',
    },
    heroMetrics: {
      flexDirection: 'row',
      gap: 12,
    },
    metricCard: {
      flex: 1,
      minHeight: 76,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 12,
      justifyContent: 'space-between',
    },
    metricLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    metricValue: {
      fontSize: 18,
      fontWeight: '800',
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
    templateList: {
      marginTop: 10,
      gap: 10,
    },
    templateCard: {
      minHeight: 72,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    templateIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    templateText: {
      flex: 1,
      minWidth: 0,
    },
    templateTitle: {
      fontSize: 15,
      fontWeight: '800',
    },
    templateHelper: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 18,
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
