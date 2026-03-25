import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  aboutHighlights,
  feedbackCategories,
  premiumPerks,
  rateReasons,
  supportThreads,
} from '@/components/profile-settings/data';
import {
  ProfileSettingsBanner,
  ProfileOptionChip,
  ProfileSettingsPill,
  ProfileSettingsCard,
  ProfileSettingsSectionTitle,
  ProfileSettingsStat,
} from '@/components/profile-settings/ui';
import { FinanceScreen } from '@/components/finance/FinanceScaffold';
import { Typography } from '@/constants/theme';
import { useProfileSettings } from '@/context/profileSettingsContext';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProfileSupportScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { appRating, feedbackDraft, invite, setAppRating, setFeedbackDraft } = useProfileSettings();
  const [selectedCategory, setSelectedCategory] = useState(feedbackCategories[0]?.id ?? 'bug');

  return (
    <FinanceScreen
      title="Help & Support"
      subtitle="Feedback, rating, live chat, referral and about details now live in one support space."
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
          <Text style={[styles.heroEyebrow, { color: colors.success }]}>Support workspace</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Quick help without digging.</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Instead of scattering rating, live chat, invite and about screens, this version keeps them grouped while preserving the important states from the kit.
          </Text>
        </ProfileSettingsCard>

        <ProfileSettingsBanner
          eyebrow="Premium Member"
          title="Support is prioritized for your workspace"
          body={`Your account currently has ${premiumPerks.length} premium perks active, including faster support handling and richer finance guidance.`}
          icon="workspace-premium"
          tone="warning"
        />

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Rate our app" />
          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, index) => {
              const rating = index + 1;
              const active = rating <= appRating;

              return (
                <Pressable key={rating} onPress={() => setAppRating(rating)}>
                  <MaterialIcons
                    name={active ? 'star' : 'star-border'}
                    size={28}
                    color={active ? colors.warning : hexToRgba(colors.text, 0.28)}
                  />
                </Pressable>
              );
            })}
          </View>
          <View style={styles.reasonRow}>
            {rateReasons.map((reason) => (
              <View
                key={reason}
                style={[styles.reasonChip, { backgroundColor: colors.backgroundSoft }]}
              >
                <Text style={[styles.reasonText, { color: colors.text }]}>{reason}</Text>
              </View>
            ))}
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Leave feedback" />
          <View style={styles.feedbackCategoryRow}>
            {feedbackCategories.map((item) => (
              <ProfileOptionChip
                key={item.id}
                label={item.label}
                active={selectedCategory === item.id}
                onPress={() => setSelectedCategory(item.id)}
              />
            ))}
          </View>

          <TextInput
            value={feedbackDraft}
            onChangeText={setFeedbackDraft}
            multiline
            placeholder="Tell us what is working or where the experience still feels rough..."
            placeholderTextColor={hexToRgba(colors.text, 0.34)}
            style={[
              styles.feedbackInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.backgroundSoft,
              },
            ]}
          />

          <ThemeButton
            title="Send Feedback"
            onPress={() => router.push({ pathname: '/(profile)/result', params: { mode: 'feedback' } })}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.fullButton}
          />
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Live chat" />
          <View style={styles.chatStack}>
            {supportThreads.map((thread) => (
              <View key={thread.id} style={[styles.chatRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.chatAccent, { backgroundColor: thread.accent }]} />
                <View style={styles.chatCopy}>
                  <Text style={[styles.chatAgent, { color: colors.text }]}>{thread.agent}</Text>
                  <Text style={[styles.chatPreview, { color: hexToRgba(colors.text, 0.54) }]}>
                    {thread.preview}
                  </Text>
                </View>
                <View style={styles.chatMeta}>
                  <Text style={[styles.chatTime, { color: hexToRgba(colors.text, 0.46) }]}>
                    {thread.time}
                  </Text>
                  {thread.unread > 0 ? (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.primaryDark }]}>
                      <Text style={[styles.unreadText, { color: colors.card }]}>{thread.unread}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="Invite your friend" />
          <View style={[styles.inviteCard, { backgroundColor: colors.backgroundSoft }]}>
            <View style={styles.invitePillRow}>
              <ProfileSettingsPill label={invite.referralCode} icon="sell" tone="soft" />
              <ProfileSettingsPill label={`${invite.successfulInvites} invites`} icon="group-add" tone="success" />
            </View>
            <Text style={[styles.inviteTitle, { color: colors.text }]}>{invite.rewardLabel}</Text>
            <Text style={[styles.inviteBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Referral code: {invite.referralCode} • {invite.successfulInvites} successful invites
            </Text>
            <ThemeButton
              title="Invite Friend"
              onPress={() => router.push({ pathname: '/(profile)/result', params: { mode: 'invite' } })}
              colorBackground={colors.success}
              colorText={colors.card}
              style={styles.inviteButton}
            />
          </View>
        </ProfileSettingsCard>

        <ProfileSettingsCard>
          <ProfileSettingsSectionTitle title="About Us" />
          <View style={styles.aboutGrid}>
            {aboutHighlights.map((item) => (
              <View key={item.id} style={styles.aboutStat}>
                <ProfileSettingsStat value={item.value} label={item.label} icon={item.icon} tone="soft" />
              </View>
            ))}
          </View>
          <Text style={[styles.aboutBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Finpal is focused on clear personal finance workflows: budgeting, subscriptions, goals and assistant-guided planning, all designed to stay lightweight on mobile.
          </Text>
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
    ratingRow: {
      marginTop: 16,
      flexDirection: 'row',
      gap: 10,
    },
    reasonRow: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    reasonChip: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    reasonText: {
      fontSize: 12,
      fontWeight: '700',
    },
    feedbackCategoryRow: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    feedbackInput: {
      marginTop: 16,
      minHeight: 110,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 14,
      textAlignVertical: 'top',
      fontSize: 14,
      fontWeight: '500',
    },
    fullButton: {
      width: '100%',
      marginTop: 16,
    },
    chatStack: {
      marginTop: 16,
      gap: 12,
    },
    chatRow: {
      paddingBottom: 12,
      borderBottomWidth: 1,
      flexDirection: 'row',
      gap: 12,
    },
    chatAccent: {
      width: 10,
      borderRadius: 999,
    },
    chatCopy: {
      flex: 1,
      minWidth: 0,
    },
    chatAgent: {
      fontSize: 14,
      fontWeight: '800',
    },
    chatPreview: {
      marginTop: 4,
      fontSize: Typography.body,
      lineHeight: 18,
    },
    chatMeta: {
      alignItems: 'flex-end',
      gap: 8,
    },
    chatTime: {
      fontSize: 11,
      fontWeight: '700',
    },
    unreadBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    unreadText: {
      fontSize: 11,
      fontWeight: '800',
    },
    inviteCard: {
      marginTop: 16,
      borderRadius: 18,
      padding: 14,
    },
    invitePillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 10,
    },
    inviteTitle: {
      fontSize: 16,
      fontWeight: '800',
    },
    inviteBody: {
      marginTop: 8,
      fontSize: Typography.body,
      lineHeight: 18,
    },
    inviteButton: {
      marginTop: 14,
      width: '100%',
    },
    aboutBody: {
      marginTop: 16,
      fontSize: Typography.body,
      lineHeight: 20,
    },
    aboutGrid: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    aboutStat: {
      width: '47%',
    },
  });
}
