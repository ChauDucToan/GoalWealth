import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton } from './_shared';

export default function BankEmptyScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={7}
      totalSteps={24}
      title="Link new bank account"
      body="No institution matched the current search. Try another name or go back to the bank list."
      footer={<SetupPrimaryButton label="Back to search" onPress={() => router.replace('/(auth)/profile-setup/bank-search')} />}
    >
      <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <MaterialIcons name="search-off" size={42} color={hexToRgba(colors.text, 0.34)} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No result found</Text>
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    emptyCard: { minHeight: 220, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { marginTop: 14, fontSize: 16, fontWeight: '800' },
  });
}
