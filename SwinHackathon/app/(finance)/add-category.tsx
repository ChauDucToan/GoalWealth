import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import {
  categoryColorOptions,
  categoryIconOptions,
} from '@/components/home/mock-data';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function AddCategoryScreen() {
  const { addCategory } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(categoryIconOptions[0]);
  const [accent, setAccent] = useState(categoryColorOptions[0]);

  return (
    <FinanceScreen title="Add New Category" subtitle="Create a category for the transaction flow">
      <FinanceCard>
        <Text style={[styles.label, { color: colors.text }]}>Category Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Family & Friends"
          placeholderTextColor={hexToRgba(colors.text, 0.34)}
          style={[
            styles.input,
            {
              backgroundColor: colors.backgroundSoft,
              color: colors.text,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Category Icon</Text>
        <View style={styles.optionRow}>
          {categoryIconOptions.map((option) => {
            const selected = option === icon;
            return (
              <Pressable
                key={option}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor: selected ? hexToRgba(accent, 0.12) : colors.backgroundSoft,
                    borderColor: selected ? accent : 'transparent',
                  },
                ]}
                onPress={() => setIcon(option)}
              >
                <MaterialIcons name={option} size={20} color={accent} />
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Category Color</Text>
        <View style={styles.colorRow}>
          {categoryColorOptions.map((option) => {
            const selected = option === accent;
            return (
              <Pressable
                key={option}
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: option,
                    borderColor: selected ? colors.text : 'transparent',
                  },
                ]}
                onPress={() => setAccent(option)}
              />
            );
          })}
        </View>

        <View style={[styles.preview, { backgroundColor: hexToRgba(accent, 0.12) }]}>
          <MaterialIcons name={icon} size={18} color={accent} />
          <Text style={[styles.previewText, { color: colors.text }]}>
            {name.trim() || 'New Category'}
          </Text>
        </View>

        <ThemeButton
          title="Add Category"
          onPress={() => {
            if (!name.trim()) {
              return;
            }

            addCategory({
              name: name.trim(),
              spent: 0,
              limit: 250,
              icon,
              accent,
            });
            router.replace('/(finance)/categories');
          }}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.button}
        />
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  input: {
    marginTop: 10,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: Typography.body,
  },
  optionRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  preview: {
    marginTop: 18,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  button: {
    marginTop: 20,
  },
});
