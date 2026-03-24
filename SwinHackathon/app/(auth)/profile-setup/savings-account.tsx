import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { savingsAccounts } from './_data';
import { ProfileSetupShell, SetupPrimaryButton } from './_shared';

export default function SavingsAccountScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setSelectedSavingsAccountId } = useProfileSetup();

  return (
    <ProfileSetupShell
      step={10}
      totalSteps={24}
      title="Select Savings Account"
      body="Choose the savings account you want Finpal to use for goals and reserves."
      footer={<SetupPrimaryButton label="Continue" onPress={() => router.push('/(auth)/profile-setup/face-id')} />}
    >
      <View style={styles.stack}>
        {savingsAccounts.map((item) => {
          const active = item.id === state.selectedSavingsAccountId;
          return (
            <Pressable
              key={item.id}
              style={[styles.accountRow, { backgroundColor: colors.card, borderColor: active ? colors.primaryDark : colors.border }]}
              onPress={() => setSelectedSavingsAccountId(item.id)}
            >
              <View style={[styles.accountIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}> 
                <MaterialIcons name="savings" size={20} color={colors.primaryDark} />
              </View>
              <View style={styles.accountCopy}>
                <Text style={[styles.accountLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.accountHelper, { color: hexToRgba(colors.text, 0.52) }]}>{item.helper}</Text>
              </View>
              <View>
                <Text style={[styles.accountAmount, { color: colors.text }]}>{item.amount}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    stack: { gap: 12 },
    accountRow: { minHeight: 78, borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    accountIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    accountCopy: { flex: 1 },
    accountLabel: { fontSize: 14, fontWeight: '800' },
    accountHelper: { marginTop: 3, fontSize: 12, fontWeight: '500' },
    accountAmount: { fontSize: 13, fontWeight: '800' },
  });
}
