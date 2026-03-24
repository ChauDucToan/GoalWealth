import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { planOptions } from './_data';
import { ProfileSetupShell, SetupPrimaryButton } from './_shared';

export default function PickPlanScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setSelectedPlanId } = useProfileSetup();

  return (
    <ProfileSetupShell
      step={22}
      totalSteps={24}
      title="Pick Your Right Plan"
      body="Choose the plan that best matches the depth of finance guidance you want from the app."
      footer={<SetupPrimaryButton label="Start premium" onPress={() => router.push('/(auth)/profile-setup/plan-processing')} />}
    >
      <View style={styles.stack}>
        {planOptions.map((plan) => {
          const active = plan.id === state.selectedPlanId;
          return (
            <Pressable
              key={plan.id}
              style={[styles.planCard, { backgroundColor: colors.card, borderColor: active ? colors.primaryDark : colors.border }]}
              onPress={() => setSelectedPlanId(plan.id)}
            >
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planTitle, { color: colors.text }]}>{plan.title}</Text>
                  <Text style={[styles.planPrice, { color: colors.primaryDark }]}>{plan.price}</Text>
                </View>
                <View style={[styles.planBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}> 
                  <Text style={[styles.planBadgeText, { color: colors.primaryDark }]}>{plan.badge}</Text>
                </View>
              </View>
              {plan.bullets.map((bullet) => (
                <View key={bullet} style={styles.bulletRow}>
                  <MaterialIcons name="check" size={16} color={colors.primaryDark} />
                  <Text style={[styles.bulletText, { color: colors.text }]}>{bullet}</Text>
                </View>
              ))}
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
    planCard: { borderRadius: 22, borderWidth: 1, padding: 16, gap: 12 },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    planTitle: { fontSize: 16, fontWeight: '800' },
    planPrice: { marginTop: 4, fontSize: 18, fontWeight: '900' },
    planBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
    planBadgeText: { fontSize: 11, fontWeight: '800' },
    bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bulletText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  });
}
