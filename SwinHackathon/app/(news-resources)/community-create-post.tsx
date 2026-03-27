import { hexToRgba } from '@/components/auth/AuthKit';
import {
  communityAuthors,
  communityComposerActions,
  communityComposerTags,
} from '@/components/community/mock-data';
import {
  CommunityAvatar,
  CommunityCard,
  CommunityPrimaryButton,
  CommunityScreenHeader,
  CommunityTagChip,
} from '@/components/community/ui';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const postPhoto = require('../../assets/images/loading-budget-photo.png');

export default function CommunityAddPostScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const router = useRouter();
  const [draft, setDraft] = useState(
    'Hi all! We are able to save over $1200 in just three months. It is all about being disciplined and tracking every expense.'
  );
  const [selectedTags, setSelectedTags] = useState(['budgeting', 'opportunity']);
  const [hasPhoto, setHasPhoto] = useState(true);

  const toggleTag = (value: string) => {
    setSelectedTags((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.card }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: scale(18, 0.8),
              paddingTop: verticalScale(10, 0.76),
              paddingBottom: verticalScale(36, 0.76),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <CommunityScreenHeader title="Add New Post" onBack={() => router.back()} />

          <CommunityCard style={styles.composerCard}>
            <View style={styles.composerRow}>
              <CommunityAvatar author={communityAuthors.melissa} size={scale(42, 0.76)} />
              <View style={styles.promptWrap}>
                <Text
                  style={[
                    styles.promptLabel,
                    { color: hexToRgba(colors.text, 0.48), fontSize: scaleFont(12, 0.76) },
                  ]}
                >
                  What&apos;s on your mind pal?
                </Text>
                <TextInput
                  multiline
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Write your update for the community"
                  placeholderTextColor={hexToRgba(colors.text, 0.28)}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      fontSize: scaleFont(Typography.body, 0.76),
                      minHeight: verticalScale(150, 0.76),
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.tagWrap}>
              {communityComposerTags.map((tag) => (
                <CommunityTagChip
                  key={tag.id}
                  label={tag.label}
                  active={selectedTags.includes(tag.id)}
                  onPress={() => toggleTag(tag.id)}
                />
              ))}
            </View>

            <View style={styles.actionRow}>
              {communityComposerActions.map((action) => (
                <Pressable
                  key={action.id}
                  onPress={() => {
                    if (action.id === 'image') {
                      setHasPhoto((current) => !current);
                    }
                  }}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.backgroundSoft,
                      borderColor: hexToRgba(colors.primaryDark, 0.08),
                    },
                  ]}
                >
                  <MaterialIcons name={action.icon} size={scale(18, 0.72)} color={colors.primaryDark} />
                  <Text
                    style={[
                      styles.actionText,
                      { color: hexToRgba(colors.text, 0.64), fontSize: scaleFont(12, 0.76) },
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </CommunityCard>

          {hasPhoto ? (
            <CommunityCard style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={[styles.previewTitle, { color: colors.text, fontSize: scaleFont(15, 0.76) }]}>
                  Media Preview
                </Text>
                <Pressable onPress={() => setHasPhoto(false)}>
                  <MaterialIcons name="close" size={scale(18, 0.72)} color={hexToRgba(colors.text, 0.48)} />
                </Pressable>
              </View>
              <Image source={postPhoto} style={[styles.previewImage, { height: verticalScale(170, 0.76) }]} />
            </CommunityCard>
          ) : null}

          <CommunityPrimaryButton
            title="Submit Post"
            onPress={() => router.push('/community-post-success')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    gap: 16,
  },
  composerCard: {
    gap: 14,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  promptWrap: {
    flex: 1,
  },
  promptLabel: {
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    lineHeight: 21,
    fontWeight: '500',
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'top',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    minHeight: 40,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontWeight: '700',
  },
  previewCard: {
    gap: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewTitle: {
    fontWeight: '800',
  },
  previewImage: {
    width: '100%',
    borderRadius: 18,
  },
});
