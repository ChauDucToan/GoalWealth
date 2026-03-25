import { hexToRgba } from '@/components/auth/AuthKit';
import { financeReportHighlights, scoreBreakdown, trialBenefits } from '@/components/profile-setup/data';
import {
  ProfileSetupShell,
  SetupPill,
  SetupPrimaryButton,
  SetupSectionTitle,
  SetupSurface,
} from '@/components/profile-setup/shared';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export default function FinancialScoreScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width < 390), [colors, width]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={5}
      totalSteps={6}
      title="Your setup is ready to personalize the app"
      body="The kit shows separate score, finance report and free-trial screens. This version combines them into one high-value overview so the user gets the same payoff in a cleaner flow."
      footer={<SetupPrimaryButton label="Continue to plans" onPress={() => router.push('/(auth)/profile-setup/pick-plan')} />}
    >
      <SetupSurface>
        <SetupPill label="Profile Ready" icon="auto-awesome" tone="success" />
        <View style={styles.scoreWrap}>
          <View style={[styles.scoreRing, { borderColor: hexToRgba(colors.primaryDark, 0.16), borderTopColor: colors.primaryDark }]}>
            <Text style={[styles.scoreValue, { color: colors.primaryDark }]}>78%</Text>
            <Text style={[styles.scoreLabel, { color: hexToRgba(colors.text, 0.52) }]}>setup score</Text>
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
      </SetupSurface>

      <SetupSectionTitle
        eyebrow="Finance Report"
        title="What Finpal already understands"
        body="These cards carry over the best parts of the finance-report board without forcing another route between setup and plan selection."
      />

      <View style={styles.reportStack}>
        {financeReportHighlights.map((item) => (
          <SetupSurface key={item.id}>
            <View style={styles.reportHeader}>
              <View style={[styles.reportIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                <MaterialIcons name={item.icon} size={20} color={colors.primaryDark} />
              </View>
              <View style={styles.reportCopy}>
                <Text style={[styles.reportTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.reportBody, { color: hexToRgba(colors.text, 0.56) }]}>{item.body}</Text>
              </View>
            </View>
          </SetupSurface>
        ))}
      </View>

      <SetupSurface style={{ backgroundColor: hexToRgba(colors.primaryDark, 0.05), borderColor: hexToRgba(colors.primaryDark, 0.16) }}>
        <SetupPill label="7-Day Trial" icon="workspace-premium" tone="warning" />
        <Text style={[styles.trialTitle, { color: colors.text }]}>Here is how your free trial works</Text>
        <View style={styles.trialStack}>
          {trialBenefits.map((item) => (
            <View key={item} style={styles.trialRow}>
              <MaterialIcons name="check-circle" size={18} color={colors.primaryDark} />
              <Text style={[styles.trialText, { color: colors.text }]}>{item}</Text>
            </View>
          ))}
        </View>
      </SetupSurface>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme, isCompact: boolean) {
  return StyleSheet.create({
    scoreWrap: { flexDirection: isCompact ? 'column' : 'row', gap: 20, alignItems: isCompact ? 'center' : 'center' },
    scoreRing: { width: 186, height: 186, borderRadius: 93, borderWidth: 18, alignItems: 'center', justifyContent: 'center' },
    scoreValue: { fontSize: 34, fontWeight: '900', letterSpacing: -0.8 },
    scoreLabel: { marginTop: 4, fontSize: 12, fontWeight: '700' },
    breakdownStack: { flex: 1, gap: 12, width: '100%' },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    breakdownLabel: { fontSize: 12, fontWeight: '700' },
    breakdownValue: { fontSize: 12, fontWeight: '800' },
    reportStack: { gap: 12 },
    reportHeader: { flexDirection: 'row', gap: 12 },
    reportIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    reportCopy: { flex: 1, minWidth: 0 },
    reportTitle: { fontSize: 14, fontWeight: '800' },
    reportBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    trialTitle: { fontSize: 16, fontWeight: '800' },
    trialStack: { gap: 12 },
    trialRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    trialText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  });
}
