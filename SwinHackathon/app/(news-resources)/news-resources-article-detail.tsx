import { hexToRgba } from '@/components/auth/AuthKit';
import { communityComments, getCommunityPost } from '@/components/community/mock-data';
import {
  CommunityAvatar,
  CommunityCard,
  CommunityPostCard,
  CommunityScreenHeader,
} from '@/components/community/ui';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CommunityCommentsScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ postId?: string }>();
  const post = getCommunityPost(params.postId);
  const [comment, setComment] = useState('');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.backgroundSoft }]} edges={['top']}>
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
              paddingBottom: verticalScale(150, 0.76),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <CommunityScreenHeader title="14 Comments" onBack={() => router.back()} />

          <CommunityPostCard post={post} />

          {communityComments.map((item) => (
            <CommunityCard key={item.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <CommunityAvatar author={item.author} size={scale(38, 0.76)} />
                <View style={styles.commentBody}>
                  <View style={styles.commentTopLine}>
                    <Text
                      style={[
                        styles.commentAuthor,
                        { color: colors.text, fontSize: scaleFont(14, 0.76) },
                      ]}
                    >
                      {item.author.name}
                    </Text>
                    <Text
                      style={[
                        styles.commentMeta,
                        { color: hexToRgba(colors.text, 0.38), fontSize: scaleFont(11, 0.76) },
                      ]}
                    >
                      {item.time}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.commentText,
                      {
                        color: hexToRgba(colors.text, 0.72),
                        fontSize: scaleFont(Typography.body, 0.76),
                      },
                    ]}
                  >
                    {item.body}
                  </Text>
                  <View style={styles.commentActions}>
                    {[
                      { icon: 'favorite-border', label: `${item.likes}` },
                      { icon: 'chat-bubble-outline', label: `${item.replies} replies` },
                    ].map((action) => (
                      <View key={action.label} style={styles.commentAction}>
                        <MaterialIcons
                          name={action.icon as React.ComponentProps<typeof MaterialIcons>['name']}
                          size={scale(14, 0.72)}
                          color={hexToRgba(colors.text, 0.44)}
                        />
                        <Text
                          style={[
                            styles.commentActionText,
                            { color: hexToRgba(colors.text, 0.48), fontSize: scaleFont(11, 0.76) },
                          ]}
                        >
                          {action.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </CommunityCard>
          ))}
        </ScrollView>

        <View
          style={[
            styles.composerWrap,
            {
              backgroundColor: colors.card,
              borderTopColor: hexToRgba(colors.primaryDark, 0.08),
              paddingBottom: Math.max(insets.bottom, verticalScale(10, 0.76)),
            },
          ]}
        >
          <View
            style={[
              styles.composer,
              {
                backgroundColor: colors.backgroundSoft,
                borderColor: hexToRgba(colors.primaryDark, 0.08),
              },
            ]}
          >
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Add a comment..."
              placeholderTextColor={hexToRgba(colors.text, 0.34)}
              style={[
                styles.composerInput,
                { color: colors.text, fontSize: scaleFont(Typography.body, 0.76) },
              ]}
            />
            <Pressable
              onPress={() => setComment('')}
              style={[styles.sendButton, { backgroundColor: colors.primaryDark }]}
            >
              <MaterialIcons name="send" size={scale(18, 0.72)} color={colors.card} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    gap: 14,
  },
  commentCard: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  commentBody: {
    flex: 1,
    gap: 8,
  },
  commentTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  commentAuthor: {
    fontWeight: '800',
  },
  commentMeta: {
    fontWeight: '700',
  },
  commentText: {
    lineHeight: 20,
    fontWeight: '500',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontWeight: '700',
  },
  composerWrap: {
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  composer: {
    minHeight: 54,
    borderRadius: 28,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  composerInput: {
    flex: 1,
    paddingVertical: 0,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
