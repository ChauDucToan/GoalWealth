import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SelectCategoryScreen() {
  const { categories, transactionDraft, updateTransactionDraft } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <FinanceScreen title="Select Category" subtitle="Choose a category for the current draft">
      <FinanceCard>
        <View style={styles.grid}>
          {categories.map((item) => {
            const selected = item.name === transactionDraft.category;
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.option,
                  {
                    backgroundColor: selected ? colors.primaryLight : colors.backgroundSoft,
                    borderColor: selected ? item.accent : 'transparent',
                  },
                ]}
                onPress={() => {
                  updateTransactionDraft({ category: item.name });
                  router.back();
                }}
              >
                <View style={[styles.iconBadge, { backgroundColor: item.accent }]}>
                  <MaterialIcons name={item.icon} size={18} color={colors.card} />
                </View>
                <Text style={[styles.label, { color: colors.text }]}>{item.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    width: '30%',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
