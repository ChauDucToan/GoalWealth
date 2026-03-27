import { hexToRgba } from '@/components/auth/AuthKit';
import { SubscriptionSetupShell, SubscriptionSetupPrimaryButton, SubscriptionSetupSecondaryButton } from './_shared';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SubscriptionSetupIntroScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <SubscriptionSetupShell
      step={1}
      totalSteps={7}
      title="Manage your subscriptions in one place"
      body="Track recurring services, due dates and spend without jumping between random bill reminders."
      footer={
        <>
          <SubscriptionSetupPrimaryButton label="Create subscription" onPress={() => router.push('/(finance)/subscription-setup/provider')} />
          <SubscriptionSetupSecondaryButton label="Skip to dashboard" onPress={() => router.replace('/(finance)/subscriptions')} />
        </>
      }
    >
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.graphPanel, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
          <View style={[styles.graphBar, { height: 48, backgroundColor: hexToRgba(colors.primaryDark, 0.18) }]} />
          <View style={[styles.graphBar, { height: 66, backgroundColor: hexToRgba(colors.primaryDark, 0.28) }]} />
          <View style={[styles.graphBar, { height: 86, backgroundColor: colors.primaryDark }]} />
          <View style={[styles.graphBar, { height: 58, backgroundColor: hexToRgba(colors.primaryDark, 0.24) }]} />
        </View>
        <View style={[styles.heroBadge, { backgroundColor: colors.primaryDark }]}>
          <MaterialIcons name="subscriptions" size={34} color={colors.card} />
        </View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Subscription control</Text>
        <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>Create, review and optimize every recurring payment in one workspace.</Text>
        <View style={styles.metricRow}>
          <View style={[styles.metricCard, { backgroundColor: colors.backgroundSoft }]}>
            <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.5) }]}>Track</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>Bills</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.backgroundSoft }]}>
            <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.5) }]}>Review</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>Renewals</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.backgroundSoft }]}>
            <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.5) }]}>Optimize</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>Costs</Text>
          </View>
        </View>
      </View>
    </SubscriptionSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    heroCard: { borderWidth: 1, borderRadius: 28, padding: 20, alignItems: 'center' },
    graphPanel: { width: '100%', height: 132, borderRadius: 22, paddingHorizontal: 18, paddingTop: 18, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    graphBar: { width: 42, borderRadius: 14 },
    heroBadge: { width: 78, height: 78, borderRadius: 26, marginTop: -26, alignItems: 'center', justifyContent: 'center' },
    heroTitle: { marginTop: 16, fontSize: 18, fontWeight: '900' },
    heroBody: { marginTop: 8, textAlign: 'center', fontSize: 13, lineHeight: 19, fontWeight: '500' },
    metricRow: { marginTop: 18, flexDirection: 'row', gap: 10 },
    metricCard: { flex: 1, borderRadius: 16, padding: 10, alignItems: 'center' },
    metricLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
    metricValue: { marginTop: 4, fontSize: 12, fontWeight: '800' },
  });
}
