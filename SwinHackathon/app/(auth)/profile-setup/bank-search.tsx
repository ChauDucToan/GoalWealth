import { InputField } from '@/components/InputField';
import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { banks } from './_data';
import { ProfileSetupShell, SetupPrimaryButton, SetupSecondaryButton } from './_shared';

export default function BankSearchScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { setLinkedBankId } = useProfileSetup();

  return (
    <ProfileSetupShell
      step={6}
      totalSteps={24}
      title="Link new bank account"
      body="Search your institution and choose the account you want to connect."
      footer={
        <>
          <SetupPrimaryButton label="Link selected bank" onPress={() => router.push('/(auth)/profile-setup/bank-linking')} />
          <SetupSecondaryButton label="Show no result state" onPress={() => router.push('/(auth)/profile-setup/bank-empty')} />
        </>
      }
    >
      <InputField label="Search bank" placeholder="Type institution name..." iconName="search" />

      <View style={styles.stack}>
        {banks.map((bank) => (
          <Pressable
            key={bank.id}
            style={[styles.bankRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setLinkedBankId(bank.id)}
          >
            <View style={[styles.bankIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}> 
              <MaterialIcons name={bank.icon} size={20} color={colors.primaryDark} />
            </View>
            <View style={styles.bankCopy}>
              <Text style={[styles.bankLabel, { color: colors.text }]}>{bank.label}</Text>
              <Text style={[styles.bankType, { color: hexToRgba(colors.text, 0.52) }]}>{bank.type}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={hexToRgba(colors.text, 0.34)} />
          </Pressable>
        ))}
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    stack: { gap: 12 },
    bankRow: { minHeight: 72, borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    bankIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    bankCopy: { flex: 1 },
    bankLabel: { fontSize: 14, fontWeight: '800' },
    bankType: { marginTop: 3, fontSize: 12, fontWeight: '500' },
  });
}
