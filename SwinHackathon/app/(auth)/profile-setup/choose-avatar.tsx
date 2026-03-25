import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { avatars } from '@/components/profile-setup/data';
import { ProfileSetupShell, SetupPrimaryButton, SetupSecondaryButton } from '@/components/profile-setup/shared';

export default function ChooseAvatarScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setSelectedAvatarId } = useProfileSetup();

  return (
    <ProfileSetupShell
      step={2}
      totalSteps={24}
      title="Choose avatars"
      body="Pick a look that feels personal enough for your account identity."
      footer={
        <>
          <SetupPrimaryButton label="Save avatar" onPress={() => router.push('/(auth)/profile-setup/avatar-uploading')} />
          <SetupSecondaryButton label="View invalid format state" onPress={() => router.push('/(auth)/profile-setup/avatar-invalid')} />
        </>
      }
    >
      <View style={styles.avatarRow}>
        {avatars.map((item) => {
          const active = item.id === state.selectedAvatarId;
          return (
            <Pressable
              key={item.id}
              style={[
                styles.avatarCard,
                {
                  backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                  borderColor: active ? colors.primaryDark : colors.border,
                },
              ]}
              onPress={() => setSelectedAvatarId(item.id)}
            >
              <View style={[styles.avatarCircle, { backgroundColor: hexToRgba(item.accent, 0.14) }]}> 
                <MaterialIcons name={item.icon} size={30} color={item.accent} />
              </View>
              <Text style={[styles.avatarLabel, { color: colors.text }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    avatarRow: { flexDirection: 'row', gap: 12 },
    avatarCard: { flex: 1, minHeight: 176, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 14 },
    avatarCircle: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    avatarLabel: { marginTop: 14, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  });
}
