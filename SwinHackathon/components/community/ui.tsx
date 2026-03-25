import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { type ReactNode } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { CommunityAuthor, CommunityPost } from './mock-data';

const postPhoto = require('../../assets/images/loading-budget-photo.png');

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
};

type CommunityCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

type TagChipProps = {
  label: string;
  active?: boolean;
  muted?: boolean;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  onPress?: () => void;
};

type CommunityPostCardProps = {
  post: CommunityPost;
  onPressAuthor?: (author: CommunityAuthor) => void;
  onPressComments?: (post: CommunityPost) => void;
  onPressDelete?: (post: CommunityPost) => void;
  footerLabel?: string;
};

export function CommunityScreenHeader({
  title,
  subtitle,
  onBack,
  rightSlot,
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont, isCompact } = useResponsive();

  return (
    <View style={[styles.headerRow, { minHeight: verticalScale(46, 0.76) }]}>
      <View style={[styles.headerEdge, isCompact && styles.headerEdgeCompact]}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={[
              styles.headerIconButton,
              {
                width: scale(42, 0.78),
                height: scale(42, 0.78),
                borderRadius: scale(21, 0.72),
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <MaterialIcons name="arrow-back-ios-new" size={scale(20, 0.75)} color={colors.text} />
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.headerCenter, isCompact && styles.headerCenterCompact]}>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: scaleFont(21, 0.78) }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.headerSubtitle,
              { color: hexToRgba(colors.text, 0.56), fontSize: scaleFont(Typography.body, 0.76) },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.headerEdge, styles.headerRight, isCompact && styles.headerEdgeCompact]}>
        {rightSlot}
      </View>
    </View>
  );
}

export function CommunityCard({ children, style }: CommunityCardProps) {
  const { colors } = useTheme();
  const { scale, verticalScale } = useResponsive();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: hexToRgba(colors.primaryDark, 0.07),
          borderRadius: scale(22, 0.75),
          padding: scale(16, 0.78),
          shadowColor: colors.shadow,
          shadowOpacity: 0.14,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: verticalScale(10, 0.76) },
          elevation: 5,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CommunityAvatar({
  author,
  size = 42,
}: {
  author: CommunityAuthor;
  size?: number;
}) {
  const { colors } = useTheme();
  const initialsSize = Math.max(12, Math.round(size * 0.34));

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: hexToRgba(author.accent, 0.22),
          borderColor: hexToRgba(author.accent, 0.28),
        },
      ]}
    >
      <Text style={[styles.avatarText, { color: colors.text, fontSize: initialsSize }]}>
        {author.initials}
      </Text>
      {author.online ? (
        <View
          style={[
            styles.onlineDot,
            {
              width: Math.max(10, size * 0.24),
              height: Math.max(10, size * 0.24),
              borderRadius: Math.max(5, size * 0.12),
              backgroundColor: colors.primaryDark,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

export function CommunityTagChip({
  label,
  active,
  muted,
  icon,
  onPress,
}: TagChipProps) {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const content = (
    <View
      style={[
        styles.tagChip,
        {
          minHeight: verticalScale(34, 0.76),
          paddingHorizontal: scale(12, 0.76),
          borderRadius: scale(17, 0.72),
          backgroundColor: active
            ? colors.primaryDark
            : muted
              ? colors.backgroundSoft
              : hexToRgba(colors.primaryDark, 0.08),
          borderColor: active
            ? colors.primaryDark
            : muted
              ? colors.border
              : hexToRgba(colors.primaryDark, 0.12),
        },
      ]}
    >
      {icon ? (
        <MaterialIcons
          name={icon}
          size={scale(16, 0.72)}
          color={active ? colors.card : colors.primaryDark}
        />
      ) : null}
      <Text
        style={[
          styles.tagChipText,
          {
            color: active ? colors.card : muted ? hexToRgba(colors.text, 0.64) : colors.primaryDark,
            fontSize: scaleFont(Typography.body, 0.76),
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export function CommunityPostCard({
  post,
  onPressAuthor,
  onPressComments,
  onPressDelete,
  footerLabel,
}: CommunityPostCardProps) {
  const { colors } = useTheme();
  const { scale, scaleFont, isCompact } = useResponsive();

  return (
    <CommunityCard style={styles.postCard}>
      <View style={[styles.postHeaderRow, isCompact && styles.postHeaderRowCompact]}>
        <Pressable
          onPress={() => onPressAuthor?.(post.author)}
          style={[styles.postAuthorRow, isCompact && styles.postAuthorRowCompact]}
        >
          <CommunityAvatar author={post.author} size={scale(42, 0.78)} />
          <View style={styles.postAuthorBody}>
            <View style={styles.postNameRow}>
              <Text
                style={[
                  styles.postAuthorName,
                  { color: colors.text, fontSize: scaleFont(15, 0.76) },
                ]}
              >
                {post.author.name}
              </Text>
              {post.author.verified ? (
                <MaterialIcons
                  name="verified"
                  size={scale(14, 0.72)}
                  color={colors.primaryDark}
                />
              ) : null}
            </View>
            <Text
              style={[
                styles.postMeta,
                { color: hexToRgba(colors.text, 0.48), fontSize: scaleFont(12, 0.76) },
              ]}
            >
              {post.author.role} • {post.time}
            </Text>
          </View>
        </Pressable>

        {post.isMine && onPressDelete ? (
          <Pressable
            onPress={() => onPressDelete(post)}
            style={[
              styles.headerIconButton,
              {
                width: scale(36, 0.76),
                height: scale(36, 0.76),
                borderRadius: scale(18, 0.72),
                backgroundColor: colors.backgroundSoft,
                borderColor: colors.border,
              },
            ]}
          >
            <MaterialIcons
              name="more-horiz"
              size={scale(20, 0.72)}
              color={hexToRgba(colors.text, 0.56)}
            />
          </Pressable>
        ) : null}
      </View>

      <Text
        style={[
          styles.postBody,
          { color: hexToRgba(colors.text, 0.82), fontSize: scaleFont(Typography.body, 0.76) },
        ]}
      >
        {post.body}
      </Text>

      <View style={styles.tagRow}>
        {post.tags.map((tag) => (
          <Text
            key={tag}
            style={[
              styles.inlineTag,
              { color: colors.primaryDark, fontSize: scaleFont(12, 0.76) },
            ]}
          >
            {tag}
          </Text>
        ))}
      </View>

      {post.poll ? (
        <View
          style={[
            styles.pollCard,
            {
              backgroundColor: colors.backgroundSoft,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
        >
          <Text
            style={[
              styles.pollTitle,
              { color: colors.text, fontSize: scaleFont(Typography.body, 0.76) },
            ]}
          >
            {post.poll.title}
          </Text>
          {post.poll.options.map((option) => (
            <View key={option.label} style={styles.pollRow}>
              <View style={[styles.pollTrack, { backgroundColor: hexToRgba(colors.text, 0.08) }]}>
                <View
                  style={[
                    styles.pollFill,
                    {
                      width: `${option.progress * 100}%`,
                      backgroundColor: colors.primaryDark,
                    },
                  ]}
                />
              </View>
              <View style={styles.pollMetaRow}>
                <Text
                  style={[
                    styles.pollLabel,
                    { color: hexToRgba(colors.text, 0.74), fontSize: scaleFont(12, 0.76) },
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.pollPercent,
                    { color: colors.text, fontSize: scaleFont(12, 0.76) },
                  ]}
                >
                  {Math.round(option.progress * 100)}%
                </Text>
              </View>
            </View>
          ))}
          <Text
            style={[
              styles.pollTotal,
              { color: hexToRgba(colors.text, 0.46), fontSize: scaleFont(11, 0.76) },
            ]}
          >
            {post.poll.totalLabel}
          </Text>
        </View>
      ) : null}

      {post.hasPhoto ? (
        <View style={styles.photoWrap}>
          <Image source={postPhoto} style={styles.photo} />
          <View
            style={[
              styles.photoOverlay,
              { backgroundColor: hexToRgba(colors.text, 0.18) },
            ]}
          />
          <View
            style={[
              styles.photoPlay,
              { backgroundColor: hexToRgba(colors.card, 0.16), borderColor: hexToRgba(colors.card, 0.24) },
            ]}
          >
            <MaterialIcons name="play-arrow" size={scale(24, 0.72)} color={colors.card} />
          </View>
        </View>
      ) : null}

      <View style={[styles.postFooter, isCompact && styles.postFooterCompact, { borderTopColor: hexToRgba(colors.text, 0.08) }]}>
        <View style={[styles.postFooterMetrics, isCompact && styles.postFooterMetricsCompact]}>
          <FooterStat icon="favorite-border" value={post.likes} />
          <Pressable onPress={() => onPressComments?.(post)} style={styles.footerStatPressable}>
            <FooterStat icon="chat-bubble-outline" value={`${post.comments}`} />
          </Pressable>
          <FooterStat icon="visibility" value={post.views} />
        </View>
        <Text
          style={[
            styles.footerLabel,
            isCompact && styles.footerLabelCompact,
            { color: hexToRgba(colors.text, 0.42), fontSize: scaleFont(11, 0.76) },
          ]}
        >
          {footerLabel ?? 'Save'}
        </Text>
      </View>
    </CommunityCard>
  );
}

function FooterStat({
  icon,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  value: string;
}) {
  const { colors } = useTheme();
  const { scale, scaleFont } = useResponsive();

  return (
    <View style={styles.footerStat}>
      <MaterialIcons name={icon} size={scale(14, 0.72)} color={hexToRgba(colors.text, 0.42)} />
      <Text style={[styles.footerStatText, { color: hexToRgba(colors.text, 0.54), fontSize: scaleFont(11, 0.76) }]}>
        {value}
      </Text>
    </View>
  );
}

export function CommunityLandingIllustration() {
  const { colors } = useTheme();
  const { scale } = useResponsive();

  return (
    <View style={styles.landingWrap}>
      <View
        style={[
          styles.landingPeopleRow,
          { borderColor: hexToRgba(colors.primaryDark, 0.12) },
        ]}
      >
        {['groups', 'forum', 'savings'].map((icon, index) => (
          <View
            key={icon}
            style={[
              styles.landingAvatarCircle,
              {
                backgroundColor:
                  index === 1 ? colors.primaryDark : hexToRgba(colors.primaryDark, 0.1),
              },
            ]}
          >
            <MaterialIcons
              name={icon as React.ComponentProps<typeof MaterialIcons>['name']}
              size={scale(28, 0.74)}
              color={index === 1 ? colors.card : colors.primaryDark}
            />
          </View>
        ))}
      </View>
      <View
        style={[
          styles.landingBar,
          {
            backgroundColor: colors.primaryDark,
            width: scale(112, 0.76),
          },
        ]}
      />
    </View>
  );
}

export function CommunityRulesIllustration() {
  const { colors } = useTheme();
  const { scale } = useResponsive();

  return (
    <View
      style={[
        styles.rulesCard,
        {
          backgroundColor: colors.card,
          borderColor: hexToRgba(colors.primaryDark, 0.08),
        },
      ]}
    >
      <View
        style={[
          styles.rulesPaper,
          {
            backgroundColor: colors.backgroundSoft,
            borderColor: hexToRgba(colors.primaryDark, 0.08),
          },
        ]}
      >
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.rulesRow}>
            <View
              style={[
                styles.rulesCheck,
                {
                  backgroundColor: hexToRgba(colors.primaryDark, 0.12),
                  borderColor: hexToRgba(colors.primaryDark, 0.2),
                },
              ]}
            >
              <MaterialIcons name="check" size={scale(16, 0.72)} color={colors.primaryDark} />
            </View>
            <View style={[styles.rulesLine, { backgroundColor: hexToRgba(colors.text, 0.12) }]} />
          </View>
        ))}
      </View>
      <View
        style={[
          styles.rulesWarning,
          {
            backgroundColor: hexToRgba(colors.error, 0.12),
            borderColor: hexToRgba(colors.error, 0.18),
          },
        ]}
      >
        <MaterialIcons name="warning-amber" size={scale(34, 0.72)} color={colors.error} />
      </View>
    </View>
  );
}

export function PostSuccessIllustration() {
  const { colors } = useTheme();
  const { scale } = useResponsive();

  return (
    <View style={styles.successWrap}>
      <View
        style={[
          styles.successCard,
          {
            backgroundColor: colors.card,
            borderColor: hexToRgba(colors.primaryDark, 0.08),
          },
        ]}
      >
        <View style={[styles.successCircle, { backgroundColor: hexToRgba(colors.primaryDark, 0.12) }]}>
          <MaterialIcons name="celebration" size={scale(38, 0.72)} color={colors.primaryDark} />
        </View>
      </View>
      {[
        { top: 4, left: 26 },
        { top: 18, right: 32 },
        { top: 72, left: 18 },
        { top: 90, right: 18 },
      ].map((confetti, index) => (
        <View
          key={index}
          style={[
            styles.confettiDot,
            {
              backgroundColor:
                index % 2 === 0 ? colors.primaryDark : hexToRgba(colors.warning, 0.9),
              top: confetti.top,
              left: confetti.left,
              right: confetti.right,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function CommunityPrimaryButton({
  title,
  onPress,
  subtle,
}: {
  title: string;
  onPress: () => void;
  subtle?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <ThemeButton
      title={title}
      onPress={onPress}
      colorBackground={subtle ? colors.card : colors.primaryDark}
      colorText={subtle ? colors.primaryDark : colors.card}
      style={{
        borderWidth: subtle ? 1 : 0,
        borderColor: subtle ? hexToRgba(colors.primaryDark, 0.14) : 'transparent',
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerEdge: {
    width: 48,
  },
  headerEdgeCompact: {
    width: 42,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerCenterCompact: {
    paddingHorizontal: 4,
  },
  headerIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },
  tagChip: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagChipText: {
    fontWeight: '700',
  },
  postCard: {
    gap: 12,
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  postHeaderRowCompact: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  postAuthorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  postAuthorRowCompact: {
    alignItems: 'flex-start',
  },
  postAuthorBody: {
    flex: 1,
    minWidth: 0,
  },
  postNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  postAuthorName: {
    fontWeight: '800',
    flexShrink: 1,
  },
  postMeta: {
    marginTop: 2,
    fontWeight: '500',
    flexShrink: 1,
  },
  postBody: {
    lineHeight: 20,
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: -4,
  },
  inlineTag: {
    fontWeight: '700',
  },
  pollCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  pollTitle: {
    fontWeight: '700',
  },
  pollRow: {
    gap: 5,
  },
  pollTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  pollFill: {
    height: '100%',
    borderRadius: 999,
  },
  pollMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  pollLabel: {
    fontWeight: '600',
    flex: 1,
    minWidth: 0,
  },
  pollPercent: {
    fontWeight: '800',
  },
  pollTotal: {
    fontWeight: '500',
  },
  photoWrap: {
    height: 146,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  photoPlay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postFooter: {
    marginTop: 2,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  postFooterCompact: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  postFooterMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
    flex: 1,
    minWidth: 0,
  },
  postFooterMetricsCompact: {
    width: '100%',
  },
  footerStatPressable: {
    alignSelf: 'stretch',
  },
  footerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerStatText: {
    fontWeight: '600',
  },
  footerLabel: {
    fontWeight: '700',
  },
  footerLabelCompact: {
    width: '100%',
    textAlign: 'left',
  },
  landingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 18,
  },
  landingPeopleRow: {
    width: '100%',
    maxWidth: 230,
    height: 134,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 18,
  },
  landingAvatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landingSketch: {
    width: '100%',
    maxWidth: 230,
    height: 76,
    borderRadius: 26,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  landingBar: {
    height: 12,
    borderRadius: 999,
  },
  rulesCard: {
    height: 200,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesPaper: {
    width: '64%',
    maxWidth: 128,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  rulesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rulesCheck: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulesLine: {
    flex: 1,
    height: 8,
    borderRadius: 999,
  },
  rulesWarning: {
    position: 'absolute',
    right: 46,
    bottom: 28,
    width: 68,
    height: 68,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successWrap: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCard: {
    width: '70%',
    maxWidth: 160,
    height: 120,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
