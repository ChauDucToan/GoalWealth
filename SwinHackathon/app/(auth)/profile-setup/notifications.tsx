import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { notificationOptions } from '@/components/profile-setup/data';
import { ProfileSetupShell, SetupPrimaryButton } from '@/components/profile-setup/shared';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setNotificationsEnabled } = useProfileSetup();

  return (
    <ProfileSetupShell
      step={18}
      totalSteps={24}
      title="Enable Notifications"
      body="This lets Finpal nudge you about transactions, goals and security events at the right time."
      footer={<SetupPrimaryButton label="Create profile experience" onPress={() => router.push('/(auth)/profile-setup/financial-score')} />}
    >
      <View style={[styles.topRow, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View>
          <Text style={[styles.toggleTitle, { color: colors.text }]}>All notifications</Text>
          <Text style={[styles.toggleBody, { color: hexToRgba(colors.text, 0.56) }]}>Turn on account and recommendation alerts</Text>
        </View>
        <Switch value={state.notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ true: colors.primaryDark, false: colors.border }} />
      </View>

      <View style={styles.optionStack}>
        {notificationOptions.map((item) => (
          <View key={item.id} style={[styles.optionRow, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[styles.optionTitle, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.optionBody, { color: hexToRgba(colors.text, 0.56) }]}>{item.helper}</Text>
          </View>
        ))}
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    topRow: { borderRadius: 22, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
    toggleTitle: { fontSize: 14, fontWeight: '800' },
    toggleBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    optionStack: { gap: 12 },
    optionRow: { borderRadius: 20, borderWidth: 1, padding: 14 },
    optionTitle: { fontSize: 13, fontWeight: '800' },
    optionBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  });
}
