import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { memberInvites } from '@/components/smart-budgeting/data';
import { goSmartBudgetBack } from './_navigation';

const inviteFilters = ['All', 'Pending', 'Editors', 'Viewers'] as const;

export default function InviteMembersScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<(typeof inviteFilters)[number]>('All');

  const filteredMembers = memberInvites.filter((member) => {
    if (activeFilter === 'Pending') return member.role === 'Pending';
    if (activeFilter === 'Editors') return member.status.toLowerCase().includes('edit');
    if (activeFilter === 'Viewers') return member.status.toLowerCase().includes('read');
    return true;
  });

  return (
    <FinanceScreen
      title="Invite Members"
      subtitle="Review who already has access and send the next invite from one workspace."
      contentStyle={styles.contentStyle}
      onBackPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting/share-budget')}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(finance)/smart-budgeting/add-member')}
        >
          <MaterialIcons name="person-add-alt-1" size={19} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryLight }]}>
          <View style={styles.heroRow}>
            <View>
              <Text style={[styles.heroEyebrow, { color: colors.primaryDark }]}>Shared budget team</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>4 members connected</Text>
            </View>
            <View style={[styles.heroCount, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroCountText, { color: colors.text }]}>+1</Text>
            </View>
          </View>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Keep permissions clean before adding more people to the same budget workspace.
          </Text>
          <Pressable
            style={[styles.heroButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => router.push('/(finance)/smart-budgeting/add-member')}
          >
            <Text style={[styles.heroButtonText, { color: colors.card }]}>Add New Member</Text>
          </Pressable>
        </FinanceCard>

        <View style={styles.filterRow}>
          {inviteFilters.map((filter) => {
            const active = filter === activeFilter;
            return (
              <Pressable
                key={filter}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primaryDark : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, { color: active ? colors.card : colors.text }]}>{filter}</Text>
              </Pressable>
            );
          })}
        </View>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Current access</Text>
            <Pressable onPress={() => router.push('/(finance)/smart-budgeting/share-qr')}>
              <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>Open QR</Text>
            </Pressable>
          </View>

          <View style={styles.memberStack}>
            {filteredMembers.map((member) => (
              <View key={member.id} style={[styles.memberRow, { borderBottomColor: colors.border }]}>
                <View style={styles.memberHead}>
                  <View style={[styles.avatar, { backgroundColor: hexToRgba(member.accent, 0.14) }]}>
                    <Text style={[styles.avatarText, { color: member.accent }]}>{member.name.slice(0, 1)}</Text>
                  </View>
                  <View style={styles.memberText}>
                    <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                    <Text style={[styles.memberRole, { color: hexToRgba(colors.text, 0.5) }]}>
                      {member.role} • {member.status}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        member.role === 'Pending' ? hexToRgba(colors.warning, 0.12) : hexToRgba(colors.primaryDark, 0.1),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: member.role === 'Pending' ? colors.warning : colors.primaryDark,
                      },
                    ]}
                  >
                    {member.role === 'Pending' ? 'Pending' : 'Active'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    headerAction: {
      width: 38,
      height: 38,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stack: {
      marginTop: 18,
      gap: 16,
    },
    heroCard: {
      borderWidth: 0,
      gap: 10,
    },
    heroRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    heroTitle: {
      marginTop: 6,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    heroCount: {
      minWidth: 48,
      height: 48,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroCountText: {
      fontSize: 18,
      fontWeight: '900',
    },
    heroBody: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },
    heroButton: {
      marginTop: 6,
      minHeight: 46,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    filterChip: {
      minHeight: 34,
      paddingHorizontal: 14,
      borderRadius: 17,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterText: {
      fontSize: 12,
      fontWeight: '700',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
    sectionLink: {
      fontSize: 13,
      fontWeight: '700',
    },
    memberStack: {
      marginTop: 14,
    },
    memberRow: {
      minHeight: 68,
      paddingVertical: 12,
      borderBottomWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    memberHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      minWidth: 0,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 16,
      fontWeight: '900',
    },
    memberText: {
      flex: 1,
      minWidth: 0,
    },
    memberName: {
      fontSize: 15,
      fontWeight: '800',
    },
    memberRole: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
    },
    statusPill: {
      minHeight: 28,
      paddingHorizontal: 10,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusText: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
}
