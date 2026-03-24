import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton } from './_shared';

export default function FinanceReportScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={20}
      totalSteps={24}
      title="Here's our finance analysis of your profile"
      body="This is a first-pass overview before you choose the premium path shown in the kit."
      footer={<SetupPrimaryButton label="Continue to free trial" onPress={() => router.push('/(auth)/profile-setup/free-trial')} />}
    >
      <View style={styles.cardStack}>
        {[
          { title: 'Money habits', body: 'Your setup suggests strong discipline with room to automate more saving.' },
          { title: 'Risk overview', body: 'Identity, bank linking and safety buffers create a healthy onboarding signal.' },
          { title: 'Next recommendation', body: 'Start with smart goals and guided notifications to build momentum.' },
        ].map((item) => (
          <View key={item.title} style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <View style={[styles.reportIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}> 
              <MaterialIcons name="insights" size={20} color={colors.primaryDark} />
            </View>
            <View style={styles.reportCopy}>
              <Text style={[styles.reportTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.reportBody, { color: hexToRgba(colors.text, 0.56) }]}>{item.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    cardStack: { gap: 12 },
    reportCard: { borderRadius: 22, borderWidth: 1, padding: 16, flexDirection: 'row', gap: 12 },
    reportIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    reportCopy: { flex: 1 },
    reportTitle: { fontSize: 14, fontWeight: '800' },
    reportBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  });
}
