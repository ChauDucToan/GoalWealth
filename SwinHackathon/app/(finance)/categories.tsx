import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function CategoriesScreen() {
  const { categories } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <FinanceScreen title="Edit Category" subtitle="Current finance categories">
      <FinanceCard>
        <View style={styles.list}>
          {categories.map((category) => (
            <View
              key={category.id}
              style={[styles.row, { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) }]}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: hexToRgba(category.accent, 0.12) },
                  ]}
                >
                  <MaterialIcons name={category.icon} size={18} color={category.accent} />
                </View>
                <View>
                  <Text style={[styles.name, { color: colors.text }]}>{category.name}</Text>
                  <Text style={[styles.meta, { color: hexToRgba(colors.text, 0.5) }]}>
                    Limit ${category.limit.toFixed(0)} • Spent ${category.spent.toFixed(0)}
                  </Text>
                </View>
              </View>

              <MaterialIcons name="edit" size={18} color={hexToRgba(colors.text, 0.38)} />
            </View>
          ))}
        </View>

        <ThemeButton
          title="Add Category"
          onPress={() => router.push('/(finance)/add-category')}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.button}
        />
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 2,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  button: {
    marginTop: 18,
  },
});
