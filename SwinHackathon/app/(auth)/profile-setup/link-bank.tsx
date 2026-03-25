import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { banks } from '@/components/profile-setup/data';
import { ProfileSetupShell, SetupPrimaryButton, SetupSecondaryButton } from '@/components/profile-setup/shared';

export default function LinkBankScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setLinkedBankId } = useProfileSetup();

  return (
    <ProfileSetupShell
      step={5}
      totalSteps={24}
      title="Let's link up with your bank account"
      body="Connecting an institution now lets the rest of setup personalize balances, savings and notifications."
      footer={
        <>
          <SetupPrimaryButton label="Search institutions" onPress={() => router.push('/(auth)/profile-setup/bank-search')} />
          <SetupSecondaryButton label="Continue with current bank" onPress={() => router.push('/(auth)/profile-setup/bank-linking')} />
        </>
      }
    >
      <View style={styles.cardStack}>
        {banks.slice(0, 3).map((bank) => {
          const active = state.linkedBankId === bank.id;
          return (
            <Pressable
              key={bank.id}
              style={[styles.bankRow, { backgroundColor: colors.card, borderColor: active ? colors.primaryDark : colors.border }]}
              onPress={() => setLinkedBankId(bank.id)}
            >
              <View style={[styles.bankIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}> 
                <MaterialIcons name={bank.icon} size={20} color={colors.primaryDark} />
              </View>
              <View style={styles.bankCopy}>
                <Text style={[styles.bankLabel, { color: colors.text }]}>{bank.label}</Text>
                <Text style={[styles.bankType, { color: hexToRgba(colors.text, 0.52) }]}>{bank.type}</Text>
              </View>
              {active ? <MaterialIcons name="check-circle" size={20} color={colors.primaryDark} /> : null}
            </Pressable>
          );
        })}
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    cardStack: { gap: 12 },
    bankRow: { minHeight: 72, borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    bankIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    bankCopy: { flex: 1 },
    bankLabel: { fontSize: 14, fontWeight: '800' },
    bankType: { marginTop: 3, fontSize: 12, fontWeight: '500' },
  });
}
