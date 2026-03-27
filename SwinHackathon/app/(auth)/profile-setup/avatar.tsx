import { hexToRgba } from '@/components/auth/AuthKit';
import { avatarHighlights, avatars } from '@/components/profile-setup/data';
import {
  ProfileSetupShell,
  SetupPill,
  SetupPrimaryButton,
  SetupSecondaryButton,
  SetupSectionTitle,
  SetupSurface,
} from '@/components/profile-setup/shared';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export default function ProfileSetupAvatarScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width < 380), [colors, width]);
  const router = useRouter();
  const { state, setAvatarMode, setSelectedAvatarId } = useProfileSetup();

  const selectedAvatar = avatars.find((item) => item.id === state.selectedAvatarId) ?? avatars[0];
  const usingUpload = state.avatarMode === 'upload';

  return (
    <ProfileSetupShell
      step={1}
      totalSteps={6}
      title="Let's set up your profile avatar or image"
      body="Keep the visual setup personal, lightweight and easy to change later. This screen now combines avatar selection and upload intent into one place."
      footer={
        <>
          <SetupPrimaryButton label="Continue to bank setup" onPress={() => router.push('/(auth)/profile-setup/link-bank')} />
          <SetupSecondaryButton label="Skip for now" onPress={() => router.push('/(auth)/profile-setup/link-bank')} />
        </>
      }
    >
      <SetupSurface>
        <SetupPill label="Profile Identity" icon="account-circle" />
        <View style={styles.heroRow}>
          <View style={styles.previewColumn}>
            <View style={[styles.previewOrb, { backgroundColor: hexToRgba(usingUpload ? colors.primaryDark : selectedAvatar.accent, 0.14) }]}>
              <MaterialIcons name={usingUpload ? 'image' : selectedAvatar.icon} size={44} color={usingUpload ? colors.primaryDark : selectedAvatar.accent} />
            </View>
            <Text style={[styles.previewTitle, { color: colors.text }]}>
              {usingUpload ? 'Custom image ready' : selectedAvatar.label}
            </Text>
            <Text style={[styles.previewBody, { color: hexToRgba(colors.text, 0.56) }]}>
              {usingUpload
                ? 'Use your own image for a more personal profile. You can still change it later in settings.'
                : 'A curated avatar keeps setup fast while still giving the account a recognizable identity.'}
            </Text>
          </View>

          <View style={styles.modeColumn}>
            {[
              { id: 'avatar', icon: 'account-circle', title: 'Use avatar', body: 'Quickest way to personalize the account.' },
              { id: 'upload', icon: 'image', title: 'Upload image', body: 'Great if you want your own visual or team photo.' },
            ].map((option) => {
              const active = state.avatarMode === option.id;

              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.modeCard,
                    {
                      backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => setAvatarMode(option.id as 'avatar' | 'upload')}
                >
                  <View style={[styles.modeIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.1) }]}>
                    <MaterialIcons name={option.icon as React.ComponentProps<typeof MaterialIcons>['name']} size={22} color={colors.primaryDark} />
                  </View>
                  <View style={styles.modeCopy}>
                    <Text style={[styles.modeTitle, { color: colors.text }]}>{option.title}</Text>
                    <Text style={[styles.modeBody, { color: hexToRgba(colors.text, 0.56) }]}>{option.body}</Text>
                  </View>
                  {active ? <MaterialIcons name="check-circle" size={20} color={colors.primaryDark} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.highlightRow}>
          {avatarHighlights.map((item) => (
            <View key={item.id} style={[styles.highlightCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.06) }]}>
              <MaterialIcons name={item.icon} size={18} color={colors.primaryDark} />
              <Text style={[styles.highlightValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.highlightLabel, { color: hexToRgba(colors.text, 0.52) }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </SetupSurface>

      <SetupSectionTitle
        eyebrow="Choose Avatar"
        title="Pick a style that feels right"
        body="The kit has separate avatar, upload, invalid and uploading states. Here they are condensed into one flexible selection area."
      />

      <View style={styles.avatarGrid}>
        {avatars.map((item) => {
          const active = item.id === state.selectedAvatarId;

          return (
            <Pressable
              key={item.id}
              style={[
                styles.avatarCard,
                {
                  backgroundColor: active ? hexToRgba(item.accent, 0.12) : colors.card,
                  borderColor: active ? item.accent : colors.border,
                },
              ]}
              onPress={() => {
                setSelectedAvatarId(item.id);
                setAvatarMode('avatar');
              }}
            >
              <View style={[styles.avatarCircle, { backgroundColor: hexToRgba(item.accent, 0.16) }]}>
                <MaterialIcons name={item.icon} size={30} color={item.accent} />
              </View>
              <Text style={[styles.avatarLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.avatarHelper, { color: hexToRgba(colors.text, 0.52) }]}>Curated profile style</Text>
              {active ? <MaterialIcons name="check-circle" size={18} color={item.accent} /> : null}
            </Pressable>
          );
        })}
      </View>

      {usingUpload ? (
        <SetupSurface style={{ backgroundColor: hexToRgba(colors.primaryDark, 0.05), borderColor: hexToRgba(colors.primaryDark, 0.2) }}>
          <SetupPill label="Upload Ready" icon="check-circle" tone="success" />
          <Text style={[styles.uploadTitle, { color: colors.text }]}>Image upload flow condensed</Text>
          <Text style={[styles.uploadBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Instead of forcing a separate uploading screen and an invalid file screen, this route keeps upload feedback inline. If you later wire a real picker, success and error can render right here without breaking the step flow.
          </Text>
        </SetupSurface>
      ) : null}
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme, isCompact: boolean) {
  return StyleSheet.create({
    heroRow: { flexDirection: isCompact ? 'column' : 'row', gap: 16 },
    previewColumn: { flex: 1, alignItems: isCompact ? 'center' : 'flex-start' },
    previewOrb: { width: 128, height: 128, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
    previewTitle: { marginTop: 16, fontSize: 18, fontWeight: '900', textAlign: isCompact ? 'center' : 'left' },
    previewBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500', textAlign: isCompact ? 'center' : 'left' },
    modeColumn: { flex: 1, gap: 12 },
    modeCard: { borderRadius: 22, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    modeIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    modeCopy: { flex: 1, minWidth: 0 },
    modeTitle: { fontSize: 14, fontWeight: '800' },
    modeBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    highlightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    highlightCard: { minWidth: isCompact ? '47%' : '31%', flexGrow: 1, borderRadius: 18, padding: 12 },
    highlightValue: { marginTop: 12, fontSize: 13, fontWeight: '800' },
    highlightLabel: { marginTop: 4, fontSize: 11, fontWeight: '700' },
    avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    avatarCard: {
      width: isCompact ? '47%' : '31%',
      minHeight: 184,
      borderRadius: 24,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      gap: 6,
    },
    avatarCircle: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    avatarLabel: { marginTop: 10, fontSize: 13, fontWeight: '800', textAlign: 'center' },
    avatarHelper: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
    uploadTitle: { fontSize: 15, fontWeight: '800' },
    uploadBody: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
  });
}
