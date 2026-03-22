import { hexToRgba } from '@/components/auth/AuthKit';
import { communityAuthors, communityMessages } from '@/components/community/mock-data';
import { CommunityAvatar } from '@/components/community/ui';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
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

export default function CommunityChatScreen() {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const author = communityAuthors.melissa;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.card }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingHorizontal: scale(18, 0.8), paddingTop: verticalScale(10, 0.76) }]}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.headerButton,
              {
                width: scale(42, 0.76),
                height: scale(42, 0.76),
                borderRadius: scale(21, 0.72),
                backgroundColor: colors.backgroundSoft,
                borderColor: colors.border,
              },
            ]}
          >
            <MaterialIcons name="arrow-back-ios-new" size={scale(18, 0.72)} color={colors.text} />
          </Pressable>

          <View style={styles.headerIdentity}>
            <CommunityAvatar author={author} size={scale(38, 0.76)} />
            <View>
              <Text style={[styles.headerName, { color: colors.text, fontSize: scaleFont(15, 0.76) }]}>
                {author.name}
              </Text>
              <Text
                style={[
                  styles.headerRole,
                  { color: hexToRgba(colors.text, 0.48), fontSize: scaleFont(12, 0.76) },
                ]}
              >
                {author.role}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/news-resources-instructor')}
            style={[
              styles.headerButton,
              {
                width: scale(42, 0.76),
                height: scale(42, 0.76),
                borderRadius: scale(21, 0.72),
                backgroundColor: colors.backgroundSoft,
                borderColor: colors.border,
              },
            ]}
          >
            <MaterialIcons name="person-outline" size={scale(20, 0.72)} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.messages,
            {
              paddingHorizontal: scale(18, 0.8),
              paddingTop: verticalScale(18, 0.76),
              paddingBottom: verticalScale(140, 0.76),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {communityMessages.map((item) => {
            const mine = item.sender === 'me';

            return (
              <View
                key={item.id}
                style={[
                  styles.messageWrap,
                  mine ? styles.messageWrapEnd : styles.messageWrapStart,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    {
                      backgroundColor: mine ? colors.primaryDark : colors.backgroundSoft,
                      borderColor: mine ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.08),
                      borderTopRightRadius: mine ? 8 : 24,
                      borderTopLeftRadius: mine ? 24 : 8,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      {
                        color: mine ? colors.card : colors.text,
                        fontSize: scaleFont(Typography.body, 0.76),
                      },
                    ]}
                  >
                    {item.body}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.messageTime,
                    { color: hexToRgba(colors.text, 0.38), fontSize: scaleFont(11, 0.76) },
                  ]}
                >
                  {item.time}
                </Text>
              </View>
            );
          })}
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
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message here..."
              placeholderTextColor={hexToRgba(colors.text, 0.34)}
              style={[
                styles.input,
                { color: colors.text, fontSize: scaleFont(Typography.body, 0.76) },
              ]}
            />
            <Pressable style={[styles.sendButton, { backgroundColor: colors.primaryDark }]}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerName: {
    fontWeight: '800',
  },
  headerRole: {
    marginTop: 2,
    fontWeight: '500',
  },
  messages: {
    gap: 14,
  },
  messageWrap: {
    gap: 6,
  },
  messageWrapStart: {
    alignItems: 'flex-start',
  },
  messageWrapEnd: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '82%',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageText: {
    lineHeight: 20,
    fontWeight: '500',
  },
  messageTime: {
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
  input: {
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
