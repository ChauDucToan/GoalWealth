import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton } from '@/components/profile-setup/shared';

export default function FreeTrialScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={21}
      totalSteps={24}
      title="Here's How your free trial works!"
      body="Before plan selection, this screen explains the value window and what gets unlocked immediately."
      footer={<SetupPrimaryButton label="Pick your plan" onPress={() => router.push('/(auth)/profile-setup/pick-plan')} />}
    >
      <View style={[styles.trialCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        {['7-day premium trial', 'Cancel anytime during trial', 'Instant access to reports and premium tools'].map((item) => (
          <View key={item} style={styles.trialRow}>
            <MaterialIcons name="check-circle" size={18} color={colors.primaryDark} />
            <Text style={[styles.trialText, { color: colors.text }]}>{item}</Text>
          </View>
        ))}
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    trialCard: { borderRadius: 24, borderWidth: 1, padding: 18, gap: 14 },
    trialRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    trialText: { fontSize: 13, fontWeight: '600' },
  });
}
