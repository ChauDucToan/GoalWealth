import { FinanceScreen } from '@/components/finance/FinanceScaffold';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  ProfileSettingsBanner,
  ProfileSettingsCard,
  ProfileSettingsPill,
  ProfileSettingsSectionTitle,
  ProfileSettingsStat,
} from '@/components/profile-settings/ui';
import { Typography } from '@/constants/theme';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileLinkedAccountsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { linkedAccounts } = useProfileSettings();
  const activeAccounts = linkedAccounts.filter((item) => item.status === 'Active').length;
  const pendingAccounts = linkedAccounts.filter((item) => item.status === 'Pending').length;

  return (
    <FinanceScreen
      title="Linked Accounts & Cards"
      subtitle="Review connected banks, wallets and cards from one concise overview."
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <ProfileSettingsCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(colors.primaryDark, 0.06),
              borderColor: hexToRgba(colors.primaryDark, 0.1),
            },
          ]}
        >
          <Text style={[styles.heroEyebrow, { color: colors.primaryDark }]}>Payment workspace</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{activeAccounts} active connections</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
            This brings together the account and card states shown in the kit into a single management screen.
          </Text>
        </ProfileSettingsCard>

        <View style={styles.statGrid}>
          <View style={styles.statItem}>
            <ProfileSettingsStat value={`${activeAccounts}`} label="Active sources" icon="account-balance" />
          </View>
          <View style={styles.statItem}>
            <ProfileSettingsStat value={`${pendingAccounts}`} label="Pending sources" icon="hourglass-top" tone="warning" />
          </View>
        </View>

        <ProfileSettingsBanner
          eyebrow="Connection Health"
          title="Accounts, wallets and cards stay in one clean list"
          body="The kit has several account-management states. This screen keeps the most useful summary and makes active versus pending sources obvious."
          icon="credit-card"
        />

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Connected sources" />
          <View style={styles.accountStack}>
            {linkedAccounts.map((account) => (
              <View
                key={account.id}
                style={[
                  styles.accountCard,
                  {
                    backgroundColor: colors.backgroundSoft,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.accountIconWrap, { backgroundColor: hexToRgba(account.accent, 0.12) }]}>
                  <MaterialIcons name={account.icon} size={20} color={account.accent} />
                </View>
                <View style={styles.accountCopy}>
                  <Text style={[styles.accountLabel, { color: colors.text }]}>{account.label}</Text>
                  <Text style={[styles.accountMeta, { color: hexToRgba(colors.text, 0.54) }]}>
                    {account.type} • {account.subtitle}
                  </Text>
                </View>
                <View style={styles.accountRight}>
                  <Text style={[styles.accountValue, { color: colors.text }]}>{account.balanceLabel}</Text>
                  <ProfileSettingsPill label={account.status} tone={account.status === 'Active' ? 'success' : 'warning'} />
                </View>
              </View>
            ))}
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="What you can do next" />
          <View style={styles.taskStack}>
            {[
              'Review limits and disable any card you do not actively use.',
              'Use one primary savings account for goals and recurring transfers.',
              'Keep pending cards short-lived so account clutter stays low.',
            ].map((item) => (
              <View key={item} style={styles.taskRow}>
                <View style={[styles.taskDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.taskText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
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
    },
    statGrid: {
      flexDirection: 'row',
      gap: 10,
    },
    statItem: {
      flex: 1,
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
    accountStack: {
      marginTop: 16,
      gap: 12,
    },
    accountCard: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    accountIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountCopy: {
      flex: 1,
      minWidth: 0,
    },
    accountLabel: {
      fontSize: 14,
      fontWeight: '800',
    },
    accountMeta: {
      marginTop: 4,
      fontSize: Typography.body,
      lineHeight: 18,
    },
    accountRight: {
      alignItems: 'flex-end',
      gap: 4,
    },
    accountValue: {
      fontSize: 13,
      fontWeight: '800',
    },
    taskStack: {
      marginTop: 16,
      gap: 12,
    },
    taskRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    taskDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 6,
    },
    taskText: {
      flex: 1,
      fontSize: Typography.body,
      lineHeight: 19,
      fontWeight: '600',
    },
  });
}
