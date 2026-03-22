import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { memberInvites } from './_data';

export default function ShareBudgetScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <FinanceScreen
      title="Budget Together Easily"
      subtitle="QR share, add members and review invite status like the collaboration screens in the kit."
      contentStyle={styles.contentStyle}
      rightAccessory={
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(finance)/smart-budgeting/share-qr')}
        >
          <MaterialIcons name="qr-code-2" size={20} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.heroEyebrow, { color: colors.primaryDark }]}>Share QR Code</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Add member to budget together</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Invite a partner or family member with QR or direct share link.
          </Text>

          <View style={[styles.qrShell, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.qrGrid}>
              {Array.from({ length: 36 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.qrPixel,
                    {
                      backgroundColor:
                        index % 5 === 0 || index % 7 === 0 ? colors.text : colors.card,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.heroButtons}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
              onPress={() => router.push('/(finance)/smart-budgeting/share-qr')}
            >
              <Text style={[styles.primaryButtonText, { color: colors.card }]}>Share QR Code</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(finance)/smart-budgeting/add-member')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Invite Members</Text>
            </Pressable>
          </View>
        </FinanceCard>

        <FinanceCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Invite members</Text>
            <Text style={[styles.sectionLink, { color: colors.primaryDark }]}>4 members</Text>
          </View>

          <View style={styles.memberStack}>
            {memberInvites.map((member) => (
              <View key={member.id} style={[styles.memberRow, { borderBottomColor: colors.border }]}>
                <View style={styles.memberHead}>
                  <View style={[styles.avatar, { backgroundColor: hexToRgba(member.accent, 0.14) }]}>
                    <Text style={[styles.avatarText, { color: member.accent }]}>{member.name.slice(0, 1)}</Text>
                  </View>
                  <View>
                    <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                    <Text style={[styles.memberRole, { color: hexToRgba(colors.text, 0.5) }]}>
                      {member.role} • {member.status}
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={hexToRgba(colors.text, 0.34)} />
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
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    heroTitle: {
      marginTop: 8,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    heroBody: {
      marginTop: 6,
      fontSize: Typography.body,
      lineHeight: 20,
    },
    qrShell: {
      marginTop: 18,
      alignSelf: 'center',
      width: 180,
      height: 180,
      borderRadius: 26,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qrGrid: {
      width: 118,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      justifyContent: 'center',
    },
    qrPixel: {
      width: 16,
      height: 16,
      borderRadius: 3,
    },
    heroButtons: {
      marginTop: 18,
      gap: 10,
    },
    primaryButton: {
      minHeight: 48,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
    },
    secondaryButton: {
      minHeight: 48,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '800',
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
      minHeight: 64,
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
    memberName: {
      fontSize: 15,
      fontWeight: '800',
    },
    memberRole: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
    },
  });
}
