import { FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ProfileSettingsCard } from '@/components/profile-settings/ui';
import { hexToRgba } from '@/components/auth/AuthKit';
import { Typography } from '@/constants/theme';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

export default function ProfilePasscodeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { updateSecurity } = useProfileSettings();
  const [firstPasscode, setFirstPasscode] = useState('');
  const [draftPasscode, setDraftPasscode] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [statusText, setStatusText] = useState('Choose a new 4-digit passcode');

  const handleDigit = (value: string) => {
    if (value === 'delete') {
      setDraftPasscode((current) => current.slice(0, -1));
      return;
    }

    if (!value || draftPasscode.length >= 4) {
      return;
    }

    const nextValue = `${draftPasscode}${value}`;
    setDraftPasscode(nextValue);

    if (nextValue.length !== 4) {
      return;
    }

    if (!confirming) {
      setFirstPasscode(nextValue);
      setDraftPasscode('');
      setConfirming(true);
      setStatusText('Confirm your new passcode');
      return;
    }

    if (nextValue === firstPasscode) {
      updateSecurity({ passcodeEnabled: true });
      router.replace({ pathname: '/(profile)/result', params: { mode: 'passcode' } });
      return;
    }

    setFirstPasscode('');
    setDraftPasscode('');
    setConfirming(false);
    setStatusText('Passcodes did not match. Try again.');
  };

  return (
    <FinanceScreen
      title="Passcode Protection"
      subtitle="The choose and confirm passcode states are combined here to shorten the flow."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <ProfileSettingsCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.success, 0.08),
              borderColor: hexToRgba(colors.success, 0.14),
            },
          ]}
        >
          <Text style={[styles.heroEyebrow, { color: colors.success }]}>Local app lock</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {confirming ? 'Confirm passcode' : 'Choose new passcode'}
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
            {statusText}
          </Text>

          <View style={styles.passcodeDots}>
            {Array.from({ length: 4 }).map((_, index) => {
              const active = index < draftPasscode.length;

              return (
                <View
                  key={`dot-${index}`}
                  style={[
                    styles.passcodeDot,
                    {
                      borderColor: active ? colors.primaryDark : colors.border,
                      backgroundColor: active ? colors.primaryDark : colors.card,
                    },
                  ]}
                />
              );
            })}
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <View style={styles.keypadGrid}>
            {keypad.map((value, index) => {
              if (!value) {
                return <View key={`empty-${index}`} style={styles.keypadSpacer} />;
              }

              return (
                <Pressable
                  key={value}
                  style={[
                    styles.keypadButton,
                    {
                      backgroundColor: value === 'delete' ? colors.backgroundSoft : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleDigit(value)}
                >
                  <Text style={[styles.keypadText, { color: colors.text }]}>
                    {value === 'delete' ? '⌫' : value}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ProfileSettingsCard>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    contentStyle: {
      paddingBottom: 30,
    },
    stack: {
      marginTop: 18,
      gap: 16,
    },
    heroCard: {
      borderWidth: 1,
      alignItems: 'center',
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    heroTitle: {
      marginTop: 8,
      fontSize: 26,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    heroBody: {
      marginTop: 10,
      fontSize: Typography.body,
      lineHeight: 20,
      textAlign: 'center',
    },
    passcodeDots: {
      marginTop: 20,
      flexDirection: 'row',
      gap: 14,
    },
    passcodeDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
    },
    keypadGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 12,
    },
    keypadButton: {
      width: '30%',
      aspectRatio: 1,
      borderWidth: 1,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    keypadSpacer: {
      width: '30%',
    },
    keypadText: {
      fontSize: 24,
      fontWeight: '800',
    },
  });
}
