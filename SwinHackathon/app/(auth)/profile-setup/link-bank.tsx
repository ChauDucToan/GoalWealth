import { InputField } from '@/components/InputField';
import { hexToRgba } from '@/components/auth/AuthKit';
import { bankHighlights, banks, savingsAccounts } from '@/components/profile-setup/data';
import {
  ProfileSetupShell,
  SetupPill,
  SetupPrimaryButton,
  SetupSectionTitle,
  SetupSurface,
} from '@/components/profile-setup/shared';
import { ColorTheme } from '@/constants/theme';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function LinkBankScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setLinkedBankId, setSelectedSavingsAccountId } = useProfileSetup();
  const [query, setQuery] = useState('');

  const selectedBank = banks.find((item) => item.id === state.linkedBankId) ?? banks[0];
  const filteredBanks = banks.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <ProfileSetupShell
      step={2}
      totalSteps={6}
      title="Link your bank and choose a savings account"
      body="The kit splits searching, connecting, success and savings selection into multiple routes. This version keeps the same states together so the user can finish account linking with less back-and-forth."
      footer={<SetupPrimaryButton label="Continue to security" onPress={() => router.push('/(auth)/profile-setup/face-id')} />}
    >
      <SetupSurface>
        <SetupPill label="Secure Connection" icon="lock" />
        <Text style={[styles.surfaceTitle, { color: colors.text }]}>Finpal will only sync the signals needed for setup</Text>
        <View style={styles.highlightRow}>
          {bankHighlights.map((item) => (
            <View key={item.id} style={[styles.highlightCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.06) }]}>
              <MaterialIcons name={item.icon} size={18} color={colors.primaryDark} />
              <Text style={[styles.highlightText, { color: colors.text }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </SetupSurface>

      <SetupSectionTitle
        eyebrow="Search Bank"
        title="Choose your primary institution"
        body="Search is still here, but empty and success states now render inline instead of pushing you through extra screens."
      />

      <InputField
        label="Search institution"
        placeholder="Type bank name..."
        iconName="search"
        value={query}
        onChangeText={setQuery}
      />

      {filteredBanks.length === 0 ? (
        <SetupSurface>
          <View style={styles.emptyWrap}>
            <MaterialIcons name="search-off" size={34} color={hexToRgba(colors.text, 0.34)} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No institution found</Text>
            <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Try a different search keyword. The original empty-state route has been folded into this step to keep the flow tighter.
            </Text>
          </View>
        </SetupSurface>
      ) : (
        <View style={styles.bankStack}>
          {filteredBanks.map((bank) => {
            const active = state.linkedBankId === bank.id;

            return (
              <Pressable
                key={bank.id}
                style={[
                  styles.bankRow,
                  { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card, borderColor: active ? colors.primaryDark : colors.border },
                ]}
                onPress={() => setLinkedBankId(bank.id)}
              >
                <View style={[styles.bankIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                  <MaterialIcons name={bank.icon} size={20} color={colors.primaryDark} />
                </View>
                <View style={styles.bankCopy}>
                  <Text style={[styles.bankLabel, { color: colors.text }]}>{bank.label}</Text>
                  <Text style={[styles.bankType, { color: hexToRgba(colors.text, 0.52) }]}>{bank.type}</Text>
                </View>
                {active ? <MaterialIcons name="check-circle" size={20} color={colors.primaryDark} /> : null}
              </Pressable>
            );
          })}
        </View>
      )}

      <SetupSurface style={{ backgroundColor: hexToRgba(colors.primaryDark, 0.05), borderColor: hexToRgba(colors.primaryDark, 0.18) }}>
        <SetupPill label="Bank Linked" icon="check-circle" tone="success" />
        <Text style={[styles.surfaceTitle, { color: colors.text }]}>{selectedBank.label} is ready</Text>
        <Text style={[styles.surfaceBody, { color: hexToRgba(colors.text, 0.56) }]}>
          Instead of a standalone loading screen and success screen, the connection status is shown right here so the user can immediately move into savings selection.
        </Text>
      </SetupSurface>

      <SetupSectionTitle
        eyebrow="Savings Account"
        title="Select where goals and reserves should live"
        body="This remains an important choice, but it no longer interrupts the bank linking flow as a separate page."
      />

      <View style={styles.accountStack}>
        {savingsAccounts.map((item) => {
          const active = item.id === state.selectedSavingsAccountId;

          return (
            <Pressable
              key={item.id}
              style={[
                styles.accountRow,
                { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card, borderColor: active ? colors.primaryDark : colors.border },
              ]}
              onPress={() => setSelectedSavingsAccountId(item.id)}
            >
              <View style={[styles.accountIcon, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
                <MaterialIcons name="savings" size={20} color={colors.primaryDark} />
              </View>
              <View style={styles.accountCopy}>
                <Text style={[styles.accountLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.accountHelper, { color: hexToRgba(colors.text, 0.52) }]}>{item.helper}</Text>
              </View>
              <View style={styles.amountWrap}>
                <Text style={[styles.accountAmount, { color: colors.text }]}>{item.amount}</Text>
                {active ? <SetupPill label="Selected" tone="soft" /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ProfileSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    surfaceTitle: { fontSize: 15, lineHeight: 22, fontWeight: '800' },
    surfaceBody: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
    highlightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    highlightCard: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10 },
    highlightText: { fontSize: 12, fontWeight: '700' },
    bankStack: { gap: 12 },
    bankRow: { minHeight: 76, borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    bankIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    bankCopy: { flex: 1, minWidth: 0 },
    bankLabel: { fontSize: 14, fontWeight: '800' },
    bankType: { marginTop: 3, fontSize: 12, fontWeight: '500' },
    emptyWrap: { minHeight: 160, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
    emptyTitle: { marginTop: 12, fontSize: 15, fontWeight: '800' },
    emptyBody: { marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: '500', textAlign: 'center' },
    accountStack: { gap: 12 },
    accountRow: { minHeight: 82, borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    accountIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    accountCopy: { flex: 1, minWidth: 0 },
    accountLabel: { fontSize: 14, fontWeight: '800' },
    accountHelper: { marginTop: 4, fontSize: 12, fontWeight: '500' },
    amountWrap: { alignItems: 'flex-end', gap: 6 },
    accountAmount: { fontSize: 13, fontWeight: '800' },
  });
}
