import { hexToRgba } from '@/components/auth/AuthKit';
import {
  appearanceOptions,
  currencyOptions,
  languageOptions,
} from '@/components/profile-settings/data';
import {
  ProfileOptionChip,
  ProfilePrimaryActions,
  ProfileSettingsCard,
  ProfileSettingsSectionTitle,
} from '@/components/profile-settings/ui';
import { FinanceScreen } from '@/components/finance/FinanceScaffold';
import { Typography } from '@/constants/theme';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useTheme } from '@/hooks/use-theme-colors';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfilePreferencesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { display, updateDisplay } = useProfileSettings();
  const [draft, setDraft] = useState(display);

  return (
    <FinanceScreen
      title="Preferences"
      subtitle="Appearance, language and currency are grouped here to keep the settings flow shorter."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <ProfileSettingsCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.success, 0.1),
              borderColor: hexToRgba(colors.success, 0.16),
            },
          ]}
        >
          <Text style={[styles.heroEyebrow, { color: colors.success }]}>Workspace preferences</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Tune how Finpal feels daily.</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
            The original kit splits some of these into separate screens. Here they are combined to
            reduce taps while keeping the same intent.
          </Text>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Appearance" />
          <Text style={[styles.helperText, { color: hexToRgba(colors.text, 0.54) }]}>
            Choose how the interface should adapt to device theme.
          </Text>
          <View style={styles.optionRow}>
            {appearanceOptions.map((option) => (
              <ProfileOptionChip
                key={option}
                label={option}
                active={draft.appearance === option}
                onPress={() => setDraft((current) => ({ ...current, appearance: option }))}
              />
            ))}
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Language" />
          <Text style={[styles.helperText, { color: hexToRgba(colors.text, 0.54) }]}>
            Pick the app language for labels, onboarding and assistant defaults.
          </Text>
          <View style={styles.optionWrap}>
            {languageOptions.map((option) => (
              <ProfileOptionChip
                key={option}
                label={option}
                active={draft.language === option}
                onPress={() => setDraft((current) => ({ ...current, language: option }))}
                accent={colors.success}
              />
            ))}
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Currency" />
          <Text style={[styles.helperText, { color: hexToRgba(colors.text, 0.54) }]}>
            Used across balances, goals and transaction previews.
          </Text>
          <View style={styles.optionRow}>
            {currencyOptions.map((option) => (
              <ProfileOptionChip
                key={option}
                label={option}
                active={draft.currency === option}
                onPress={() => setDraft((current) => ({ ...current, currency: option }))}
                accent={colors.warning}
              />
            ))}
          </View>

          <View style={[styles.previewCard, { backgroundColor: colors.backgroundSoft }]}>
            <Text style={[styles.previewLabel, { color: hexToRgba(colors.text, 0.54) }]}>
              Preview
            </Text>
            <Text style={[styles.previewValue, { color: colors.text }]}>
              {draft.currency} • {draft.language}
            </Text>
            <Text style={[styles.previewMeta, { color: hexToRgba(colors.text, 0.56) }]}>
              Appearance will follow: {draft.appearance}
            </Text>
          </View>
        </ProfileSettingsCard>

        <ProfilePrimaryActions
          primaryLabel="Save Preferences"
          onPrimary={() => updateDisplay(draft)}
          secondaryLabel="Reset"
          onSecondary={() => setDraft(display)}
        />
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
      letterSpacing: -0.5,
    },
    heroBody: {
      marginTop: 10,
      fontSize: Typography.body,
      lineHeight: 20,
    },
    helperText: {
      marginTop: 8,
      fontSize: Typography.body,
      lineHeight: 19,
    },
    optionRow: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    optionWrap: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    previewCard: {
      marginTop: 18,
      borderRadius: 18,
      padding: 14,
    },
    previewLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    previewValue: {
      marginTop: 6,
      fontSize: 18,
      fontWeight: '800',
    },
    previewMeta: {
      marginTop: 4,
      fontSize: Typography.body,
      lineHeight: 18,
    },
  });
}
