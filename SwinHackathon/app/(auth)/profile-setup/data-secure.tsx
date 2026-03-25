import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileSetupShell, SetupPrimaryButton } from '@/components/profile-setup/shared';

export default function DataSecureScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <ProfileSetupShell
      step={16}
      totalSteps={24}
      title="Your Data is Secure With Us"
      body="We protect your identity, banking data and preferences with layered access controls."
      footer={<SetupPrimaryButton label="Continue" onPress={() => router.push('/(auth)/profile-setup/privacy-policy')} />}
    >
      <View style={[styles.securityCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={[styles.securityBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}> 
          <MaterialIcons name="verified-user" size={40} color={colors.primaryDark} />
        </View>
        {['Encrypted credentials', 'Protected financial access', 'Configurable notification privacy'].map((item) => (
          <View key={item} style={styles.securityRow}>
            <MaterialIcons name="check-circle" size={18} color={colors.primaryDark} />
            <Text style={[styles.securityText, { color: colors.text }]}>{item}</Text>
          </View>
        ))}
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    securityCard: { borderRadius: 28, borderWidth: 1, padding: 20, gap: 14 },
    securityBadge: { width: 86, height: 86, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 6 },
    securityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    securityText: { fontSize: 13, fontWeight: '600' },
  });
}
