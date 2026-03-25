import { hexToRgba } from '@/components/auth/AuthKit';
import { securityHighlights } from '@/components/profile-setup/data';
import {
  ProfileSetupShell,
  SetupCodePreview,
  SetupPill,
  SetupPrimaryButton,
  SetupSectionTitle,
  SetupSurface,
} from '@/components/profile-setup/shared';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View, useWindowDimensions } from 'react-native';

export default function FaceIdScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width < 390), [colors, width]);
  const router = useRouter();
  const { state, setBiometricEnabled, setFaceIdEnabled, setOtpCode, setPasscode } = useProfileSetup();
  const otpRef = useRef<TextInput>(null);
  const passcodeRef = useRef<TextInput>(null);

  const updateOtp = (value: string) => setOtpCode(value.replace(/[^0-9]/g, '').slice(0, 4));
  const updatePasscode = (value: string) => setPasscode(value.replace(/[^0-9]/g, '').slice(0, 4));

  return (
    <ProfileSetupShell
      step={3}
      totalSteps={6}
      title="Protect your account with biometrics and quick verification"
      body="Face ID, OTP and passcode setup were previously split into separate routes. They now live in one security step so the user can finish protection in a single pass."
      footer={<SetupPrimaryButton label="Continue to account review" onPress={() => router.push('/(auth)/profile-setup/confirm-account')} />}
    >
      <SetupSurface>
        <SetupPill label="Security" icon="shield" />
        <View style={styles.securityHero}>
          <View style={[styles.heroBadge, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
            <MaterialIcons name="fingerprint" size={64} color={colors.primaryDark} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Fast sign-in, strong fallback</Text>
            <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Use biometrics for speed and a private passcode for backup. This preserves the visual language of the kit without forcing several tiny confirmation screens.
            </Text>
          </View>
        </View>

        <View style={styles.toggleGrid}>
          <View style={[styles.toggleCard, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
            <View style={styles.toggleCopy}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Enable Face ID</Text>
              <Text style={[styles.toggleBody, { color: hexToRgba(colors.text, 0.56) }]}>Unlock the app faster with face authentication.</Text>
            </View>
            <Switch value={state.faceIdEnabled} onValueChange={setFaceIdEnabled} trackColor={{ true: colors.primaryDark, false: colors.border }} />
          </View>

          <View style={[styles.toggleCard, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
            <View style={styles.toggleCopy}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Use fingerprint</Text>
              <Text style={[styles.toggleBody, { color: hexToRgba(colors.text, 0.56) }]}>Keep another biometric option ready for secure actions.</Text>
            </View>
            <Switch value={state.biometricEnabled} onValueChange={setBiometricEnabled} trackColor={{ true: colors.primaryDark, false: colors.border }} />
          </View>
        </View>
      </SetupSurface>

      <SetupSectionTitle
        eyebrow="Quick Verification"
        title="Set your OTP and fallback passcode"
        body="Tap a code row to edit it. This keeps the nice boxed visuals from the kit, but the user does not have to wait through separate OTP and passcode screens."
      />

      <SetupSurface>
        <Text style={[styles.inputLabel, { color: colors.text }]}>OTP code</Text>
        <Pressable onPress={() => otpRef.current?.focus()}>
          <SetupCodePreview value={state.otpCode} highlight={state.otpCode.length > 2 ? 2 : state.otpCode.length - 1} />
        </Pressable>
        <TextInput
          ref={otpRef}
          value={state.otpCode}
          onChangeText={updateOtp}
          keyboardType="number-pad"
          maxLength={4}
          style={styles.hiddenInput}
        />
        <Text style={[styles.inputHelper, { color: hexToRgba(colors.text, 0.56) }]}>
          Enter the 4-digit code that was sent to the trusted device.
        </Text>
      </SetupSurface>

      <SetupSurface>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Passcode</Text>
        <Pressable onPress={() => passcodeRef.current?.focus()}>
          <SetupCodePreview value={state.passcode} highlight={state.passcode.length > 2 ? 2 : state.passcode.length - 1} />
        </Pressable>
        <TextInput
          ref={passcodeRef}
          value={state.passcode}
          onChangeText={updatePasscode}
          keyboardType="number-pad"
          maxLength={4}
          style={styles.hiddenInput}
        />
        <Text style={[styles.inputHelper, { color: hexToRgba(colors.text, 0.56) }]}>
          This private code is used when biometrics are unavailable.
        </Text>
      </SetupSurface>

      <View style={styles.highlightStack}>
        {securityHighlights.map((item) => (
          <SetupSurface key={item.id} style={{ gap: 10 }}>
            <View style={styles.highlightHeader}>
              <View style={[styles.highlightIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                <MaterialIcons name={item.icon} size={20} color={colors.primaryDark} />
              </View>
              <View style={styles.highlightCopy}>
                <Text style={[styles.highlightTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.highlightBody, { color: hexToRgba(colors.text, 0.56) }]}>{item.body}</Text>
              </View>
            </View>
          </SetupSurface>
        ))}
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme, isCompact: boolean) {
  return StyleSheet.create({
    securityHero: { flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'center' : 'flex-start', gap: 16 },
    heroBadge: { width: 130, height: 130, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
    heroCopy: { flex: 1, gap: 8 },
    heroTitle: { fontSize: 18, fontWeight: '900', textAlign: isCompact ? 'center' : 'left' },
    heroBody: { fontSize: 12, lineHeight: 18, fontWeight: '500', textAlign: isCompact ? 'center' : 'left' },
    toggleGrid: { gap: 12 },
    toggleCard: { borderRadius: 22, borderWidth: 1, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14 },
    toggleCopy: { flex: 1 },
    toggleTitle: { fontSize: 14, fontWeight: '800' },
    toggleBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
    inputLabel: { fontSize: 14, fontWeight: '800' },
    inputHelper: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
    hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
    highlightStack: { gap: 12 },
    highlightHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    highlightIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    highlightCopy: { flex: 1, minWidth: 0 },
    highlightTitle: { fontSize: 14, fontWeight: '800' },
    highlightBody: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  });
}
