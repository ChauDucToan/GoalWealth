import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

export default function MerchantEditScreen() {
  const { merchant } = useLocalSearchParams<{ merchant: string }>();
  const { renameMerchant } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();
  const [name, setName] = useState(merchant ?? '');

  return (
    <FinanceScreen title="Edit Merchant Details" subtitle="Rename merchant label in mock data">
      <FinanceCard>
        <Text style={[styles.label, { color: colors.text }]}>Merchant Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Merchant name"
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

        <Text style={[styles.helper, { color: hexToRgba(colors.text, 0.56) }]}>
          This will rename all matching mock transactions for the selected merchant.
        </Text>

        <ThemeButton
          title="Save Details"
          onPress={() => {
            renameMerchant(merchant ?? '', name);
            router.replace({
              pathname: '/(finance)/merchant/[merchant]',
              params: { merchant: name },
            });
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
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    marginTop: 10,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  helper: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
  },
  button: {
    marginTop: 20,
  },
});
