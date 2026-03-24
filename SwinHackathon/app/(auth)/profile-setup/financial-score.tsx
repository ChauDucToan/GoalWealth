import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { scoreBreakdown } from './_data';
import { ProfileSetupShell, SetupPrimaryButton } from './_shared';

export default function FinancialScoreScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={19}
      totalSteps={24}
      title="Your Financial Setup Experience"
      body="The setup signal is already strong enough to personalize your account and recommendations."
      footer={<SetupPrimaryButton label="See finance report" onPress={() => router.push('/(auth)/profile-setup/finance-report')} />}
    >
      <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={[styles.ring, { borderColor: hexToRgba(colors.primaryDark, 0.14), borderTopColor: colors.primaryDark }]}> 
          <Text style={[styles.scoreValue, { color: colors.primaryDark }]}>78%</Text>
        </View>
        <View style={styles.breakdownStack}>
          {scoreBreakdown.map((item) => (
            <View key={item.label} style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: hexToRgba(colors.text, 0.56) }]}>{item.label}</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    scoreCard: { borderRadius: 28, borderWidth: 1, padding: 20, alignItems: 'center' },
    ring: { width: 170, height: 170, borderRadius: 85, borderWidth: 16, alignItems: 'center', justifyContent: 'center' },
    scoreValue: { fontSize: 34, fontWeight: '900', letterSpacing: -0.8 },
    breakdownStack: { marginTop: 20, width: '100%', gap: 10 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    breakdownLabel: { fontSize: 12, fontWeight: '700' },
    breakdownValue: { fontSize: 12, fontWeight: '800' },
  });
}
