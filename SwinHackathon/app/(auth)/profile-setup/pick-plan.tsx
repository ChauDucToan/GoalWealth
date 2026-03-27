import { hexToRgba } from '@/components/auth/AuthKit';
import { planOptions, trialBenefits } from '@/components/profile-setup/data';
import {
  ProfileSetupShell,
  SetupPill,
  SetupPrimaryButton,
  SetupSectionTitle,
  SetupSurface,
} from '@/components/profile-setup/shared';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PickPlanScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setSelectedPlanId } = useProfileSetup();

  return (
    <ProfileSetupShell
      step={6}
      totalSteps={6}
      title="Choose the plan that completes your setup"
      body="The plan board stays close to the kit, but processing is no longer separated into its own route. The user chooses once and lands directly on the final success state."
      footer={<SetupPrimaryButton label="Start premium trial" onPress={() => router.push('/(auth)/profile-setup/premium-success')} />}
    >
      <SetupSurface style={{ backgroundColor: hexToRgba(colors.primaryDark, 0.05), borderColor: hexToRgba(colors.primaryDark, 0.16) }}>
        <SetupPill label="7-Day Premium Trial" icon="workspace-premium" tone="warning" />
        <Text style={[styles.heroTitle, { color: colors.text }]}>Unlock the most helpful parts of Finpal right away</Text>
        <View style={styles.benefitStack}>
          {trialBenefits.map((item) => (
            <View key={item} style={styles.benefitRow}>
              <MaterialIcons name="check-circle" size={18} color={colors.primaryDark} />
              <Text style={[styles.benefitText, { color: colors.text }]}>{item}</Text>
            </View>
          ))}
        </View>
      </SetupSurface>

      <SetupSectionTitle
        eyebrow="Pick Plan"
        title="Choose the right depth of guidance"
        body="This keeps the premium-style cards from the board, but trims the friction by removing the extra processing screen."
      />

      <View style={styles.planStack}>
        {planOptions.map((plan) => {
          const active = plan.id === state.selectedPlanId;

          return (
            <Pressable
              key={plan.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                  borderColor: active ? colors.primaryDark : colors.border,
                },
              ]}
              onPress={() => setSelectedPlanId(plan.id)}
            >
              <View style={styles.planHeader}>
                <View style={styles.planHeading}>
                  <Text style={[styles.planTitle, { color: colors.text }]}>{plan.title}</Text>
                  <Text style={[styles.planPrice, { color: colors.primaryDark }]}>{plan.price}</Text>
                </View>
                <View style={[styles.planBadge, { backgroundColor: active ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.12) }]}>
                  <Text style={[styles.planBadgeText, { color: active ? colors.card : colors.primaryDark }]}>{plan.badge}</Text>
                </View>
              </View>

              <View style={styles.planDivider} />

              {plan.bullets.map((bullet) => (
                <View key={bullet} style={styles.bulletRow}>
                  <MaterialIcons name="check" size={16} color={colors.primaryDark} />
                  <Text style={[styles.bulletText, { color: colors.text }]}>{bullet}</Text>
                </View>
              ))}

              <View style={styles.footerRow}>
                <SetupPill label={active ? 'Selected' : 'Available'} tone={active ? 'accent' : 'soft'} />
                {active ? <MaterialIcons name="check-circle" size={22} color={colors.primaryDark} /> : null}
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
    heroTitle: { fontSize: 16, lineHeight: 22, fontWeight: '800' },
    benefitStack: { gap: 12 },
    benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    benefitText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '600' },
    planStack: { gap: 12 },
    planCard: { borderRadius: 24, borderWidth: 1, padding: 18, gap: 12 },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    planHeading: { flex: 1, minWidth: 0 },
    planTitle: { fontSize: 16, fontWeight: '900' },
    planPrice: { marginTop: 4, fontSize: 20, fontWeight: '900' },
    planBadge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
    planBadgeText: { fontSize: 11, fontWeight: '800' },
    planDivider: { height: 1, backgroundColor: hexToRgba(colors.text, 0.08) },
    bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bulletText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    footerRow: { marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  });
}
