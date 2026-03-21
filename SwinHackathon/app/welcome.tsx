import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

type Slide = {
  id: string;
  title: string;
  description: string;
  backgroundColor: string;
  renderIllustration: (colors: ColorTheme) => React.ReactNode;
};

function AccentShape({
  colors,
  top,
  left,
  right,
  bottom,
  icon,
  tint,
}: {
  colors: ColorTheme;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  tint: 'warning' | 'secondary' | 'error' | 'background';
}) {
  const colorMap = {
    warning: colors.warning,
    secondary: colors.secondary,
    error: colors.error,
    background: colors.primaryDark,
  };

  return (
    <MaterialIcons
      name={icon}
      size={20}
      color={colorMap[tint]}
      style={{ position: 'absolute', top, left, right, bottom }}
    />
  );
}

function PhoneShell({
  colors,
  children,
  shellStyle,
  innerStyle,
}: {
  colors: ColorTheme;
  children: React.ReactNode;
  shellStyle?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={styles.phoneShellWrap}>
      <View
        style={[
          styles.phoneLeg,
          styles.phoneLegLeft,
          { backgroundColor: hexToRgba(colors.primaryDark, 0.24) },
        ]}
      />
      <View
        style={[
          styles.phoneLeg,
          styles.phoneLegRight,
          { backgroundColor: hexToRgba(colors.primaryDark, 0.24) },
        ]}
      />

      <View
        style={[
          styles.phoneShell,
          { borderColor: hexToRgba(colors.primaryDark, 0.18) },
          shellStyle,
        ]}
      >
        <View
          style={[
            styles.phoneNotch,
            { backgroundColor: colors.primaryLight },
          ]}
        />
        <View style={[styles.phoneShellInner, innerStyle]}>{children}</View>
      </View>
    </View>
  );
}

function BrandIllustration({ colors }: { colors: ColorTheme }) {
  return (
    <View style={styles.brandIllustration}>
      <View
        style={[
          styles.brandBadge,
          {
            backgroundColor: hexToRgba(colors.primaryDark, 0.08),
            shadowColor: colors.primaryDark,
          },
        ]}
      >
        <MaterialCommunityIcons name="robot-outline" size={54} color={colors.primaryDark} />
      </View>
      <Text style={[styles.brandTitle, { color: colors.text }]}>finpal</Text>
    </View>
  );
}

function BudgetLine({
  colors,
  icon,
  label,
  value,
}: {
  colors: ColorTheme;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.budgetLine}>
      <View style={styles.rowGap}>
        <MaterialIcons name={icon} size={16} color={hexToRgba(colors.text, 0.46)} />
        <Text style={[styles.budgetLineLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Text style={[styles.budgetLineValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function BudgetIllustration({ colors }: { colors: ColorTheme }) {
  return (
    <View style={styles.illustrationStage}>
      <AccentShape colors={colors} top={24} right={26} icon="stars" tint="warning" />
      <AccentShape colors={colors} top={154} left={18} icon="stars" tint="warning" />

      <PhoneShell colors={colors} shellStyle={styles.budgetShell}>
        <View
          style={[
            styles.ledgerCard,
            {
              backgroundColor: colors.card,
              shadowColor: colors.primaryDark,
            },
          ]}
        >
          <View style={styles.rowBetween}>
            <View style={styles.rowGap}>
              <View
                style={[
                  styles.smallRoundBadge,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.12) },
                ]}
              >
                <MaterialIcons name="settings" size={15} color={colors.primaryDark} />
              </View>
              <View style={styles.ledgerCopy}>
                <Text style={[styles.ledgerTitle, { color: colors.text }]}>
                  Your budget this month
                </Text>
                <Text style={[styles.ledgerMeta, { color: hexToRgba(colors.text, 0.56) }]}>
                  Good job! You have $200 left.
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={18} color={hexToRgba(colors.text, 0.34)} />
          </View>

          <View
            style={[
              styles.progressTrack,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
            ]}
          >
            <View
              style={[
                styles.progressValue,
                { width: '68%', backgroundColor: colors.primaryDark },
              ]}
            />
          </View>

          <BudgetLine
            colors={colors}
            icon="restaurant"
            label="Food & Dining"
            value="$158 of $200"
          />
          <BudgetLine
            colors={colors}
            icon="sports-esports"
            label="Entertainment"
            value="$99 of $150"
          />
        </View>
      </PhoneShell>
    </View>
  );
}

function AssistantIllustration({ colors }: { colors: ColorTheme }) {
  return (
    <View style={styles.illustrationStage}>
      <AccentShape colors={colors} top={28} left={18} icon="stars" tint="warning" />
      <AccentShape colors={colors} top={162} right={18} icon="stars" tint="warning" />
      <AccentShape colors={colors} top={116} left={10} icon="change-history" tint="secondary" />

      <PhoneShell colors={colors} shellStyle={styles.assistantShell}>
        <View
          style={[
            styles.chatBubbleRight,
            {
              backgroundColor: colors.card,
              shadowColor: colors.primaryDark,
            },
          ]}
        >
          <Text style={[styles.chatPrompt, { color: colors.primaryDark }]}>
            What&apos;s my total spending on grocery last month?
          </Text>
          <View
            style={[
              styles.avatarBadge,
              { backgroundColor: hexToRgba(colors.text, 0.1) },
            ]}
          >
            <MaterialIcons name="person" size={17} color={colors.text} />
          </View>
        </View>

        <View
          style={[
            styles.chatBubbleLeft,
            {
              backgroundColor: colors.card,
              shadowColor: colors.primaryDark,
            },
          ]}
        >
          <View
            style={[
              styles.avatarBadge,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.12) },
            ]}
          >
            <MaterialCommunityIcons name="robot-outline" size={17} color={colors.primaryDark} />
          </View>
          <Text style={[styles.chatReply, { color: colors.text }]}>
            Based on history & habits, your total spending in January 2025 is $1,541.15.
          </Text>
        </View>
      </PhoneShell>
    </View>
  );
}

function GoalCard({
  colors,
  title,
  progress,
  rightLabel,
  footerLeft,
  footerRight,
  icon,
  compact = false,
}: {
  colors: ColorTheme;
  title: string;
  progress: number;
  rightLabel: string;
  footerLeft: string;
  footerRight: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.goalCard,
        {
          width: compact ? 228 : 252,
          borderRadius: compact ? 20 : 22,
          padding: compact ? 13 : 15,
          backgroundColor: colors.card,
          shadowColor: colors.primaryDark,
        },
      ]}
    >
      <View style={styles.rowBetween}>
        <View style={[styles.rowGap, styles.goalHeaderTextWrap]}>
          <MaterialIcons name={icon} size={17} color={hexToRgba(colors.text, 0.44)} />
          <Text
            style={[
              styles.goalTitle,
              {
                color: colors.text,
                fontSize: compact ? 13 : Typography.body,
                lineHeight: compact ? 16 : 18,
              },
            ]}
          >
            {title}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.goalPercent,
            {
              color: hexToRgba(colors.text, 0.54),
              fontSize: compact ? 12 : Typography.body,
            },
          ]}
        >
          {rightLabel}
        </Text>
      </View>
      <View
        style={[
          styles.progressTrack,
          { marginTop: 10, backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
        ]}
      >
        <View
          style={[
            styles.progressValue,
            { width: `${progress * 100}%`, backgroundColor: colors.primaryDark },
          ]}
        />
      </View>
      <View style={[styles.rowBetween, styles.goalFooterRow, { marginTop: 8 }]}>
        <Text
          numberOfLines={1}
          style={[
            styles.goalMeta,
            styles.goalMetaLeft,
            {
              color: hexToRgba(colors.text, 0.46),
              fontSize: compact ? 11 : Typography.body,
            },
          ]}
        >
          {footerLeft}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            styles.goalMeta,
            styles.goalMetaRight,
            {
              color: hexToRgba(colors.text, 0.46),
              fontSize: compact ? 11 : Typography.body,
            },
          ]}
        >
          {footerRight}
        </Text>
      </View>
    </View>
  );
}

function GoalsIllustration({
  colors,
  compact = false,
}: {
  colors: ColorTheme;
  compact?: boolean;
}) {
  return (
    <View style={styles.illustrationStage}>
      <AccentShape colors={colors} top={24} left={20} icon="blur-circular" tint="secondary" />
      <AccentShape colors={colors} top={166} right={22} icon="stars" tint="warning" />

      <PhoneShell colors={colors} shellStyle={styles.goalsShell} innerStyle={styles.goalStack}>
        <GoalCard
          colors={colors}
          title="Trip to Paris"
          progress={0.5}
          rightLabel="50%"
          footerLeft="Jan 13, 2025"
          footerRight="1y 22d left"
          icon="flight-takeoff"
          compact={compact}
        />
        <GoalCard
          colors={colors}
          title="University Saving"
          progress={0.8}
          rightLabel="80%"
          footerLeft="Dec 18, 2026"
          footerRight="2y 188d left"
          icon="school"
          compact={compact}
        />
      </PhoneShell>
    </View>
  );
}

function SavingsCard({
  colors,
  month,
  amount,
  delta,
  tone,
  compact = false,
}: {
  colors: ColorTheme;
  month: string;
  amount: string;
  delta: string;
  tone: 'positive' | 'negative';
  compact?: boolean;
}) {
  const fillColor = tone === 'positive' ? colors.primaryDark : '#E11D48';
  const deltaColor = tone === 'positive' ? colors.primaryDark : '#E11D48';

  return (
    <View
      style={[
        styles.savingsCard,
        {
          width: compact ? 108 : 120,
          minHeight: compact ? 144 : 158,
          borderRadius: compact ? 22 : 24,
          padding: compact ? 13 : 15,
          backgroundColor: colors.card,
          shadowColor: colors.primaryDark,
        },
      ]}
    >
      <Text
        style={[
          styles.savingsMonth,
          { color: hexToRgba(colors.text, 0.48), fontSize: compact ? 11 : Typography.body },
        ]}
      >
        {month}
      </Text>
      <Text
        style={[
          styles.savingsAmount,
          { color: colors.text, fontSize: compact ? 18 : 22, lineHeight: compact ? 22 : 26 },
        ]}
      >
        {amount}
      </Text>
      <Text
        style={[
          styles.savingsDelta,
          { color: deltaColor, fontSize: compact ? 11 : Typography.body },
        ]}
      >
        {delta}
      </Text>
      <View
        style={[
          styles.savingsFill,
          {
            backgroundColor: hexToRgba(fillColor, 0.18),
            height: compact ? 74 : 88,
            marginTop: compact ? 10 : 12,
          },
        ]}
      >
        <View
          style={[
            styles.savingsFillValue,
            { backgroundColor: fillColor, height: compact ? 28 : 34 },
          ]}
        />
      </View>
    </View>
  );
}

function SavingsIllustration({
  colors,
  compact = false,
}: {
  colors: ColorTheme;
  compact?: boolean;
}) {
  return (
    <View style={styles.illustrationStage}>
      <AccentShape colors={colors} top={16} left={26} icon="close" tint="secondary" />
      <AccentShape colors={colors} top={170} right={28} icon="lens" tint="background" />

      <PhoneShell colors={colors} shellStyle={styles.savingsShell}>
        <View style={[styles.savingsRow, compact && styles.savingsRowCompact]}>
          <SavingsCard
            colors={colors}
            month="January"
            amount="$1,487"
            delta="+11.5%"
            tone="positive"
            compact={compact}
          />
          <SavingsCard
            colors={colors}
            month="December"
            amount="$2,487"
            delta="-1.88%"
            tone="negative"
            compact={compact}
          />
        </View>
      </PhoneShell>
    </View>
  );
}

function GraphBubble({
  colors,
  label,
  tiny = false,
  textColor,
  top,
  left,
  right,
  bottom,
}: {
  colors: ColorTheme;
  label: string;
  tiny?: boolean;
  textColor?: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}) {
  return (
    <View
      style={[
        tiny ? styles.graphBubbleTiny : styles.graphBubble,
        {
          top,
          left,
          right,
          bottom,
          borderColor: hexToRgba(colors.primaryDark, 0.26),
          backgroundColor: colors.card,
        },
      ]}
    >
      <Text
        style={[
          tiny ? styles.graphBubbleTinyText : styles.graphBubbleText,
          { color: textColor ?? colors.primaryDark },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function SubscriptionsIllustration({ colors }: { colors: ColorTheme }) {
  return (
    <View style={styles.illustrationStage}>
      <AccentShape colors={colors} top={78} right={12} icon="stars" tint="warning" />
      <AccentShape colors={colors} top={184} left={34} icon="stars" tint="error" />

      <View style={[styles.graphWrap, { borderColor: hexToRgba(colors.primaryDark, 0.18) }]}>
        <View
          style={[
            styles.graphCenter,
            { backgroundColor: colors.primaryDark, shadowColor: colors.primaryDark },
          ]}
        >
          <MaterialCommunityIcons name="robot-outline" size={44} color={colors.card} />
        </View>

        <GraphBubble
          colors={colors}
          label="NETFLIX"
          top={54}
          left={8}
          textColor="#E11D48"
        />
        <GraphBubble
          colors={colors}
          label="Pay"
          top={20}
          right={8}
          textColor="#1E40AF"
        />
        <GraphBubble
          colors={colors}
          label="Star"
          bottom={48}
          left={6}
          textColor="#16A34A"
        />
        <GraphBubble
          colors={colors}
          label="Coke"
          bottom={48}
          right={6}
          textColor="#EF4444"
        />
        <GraphBubble
          colors={colors}
          label="$15"
          top={14}
          left={96}
          tiny
        />
        <GraphBubble
          colors={colors}
          label="$50"
          bottom={20}
          right={92}
          tiny
        />
      </View>
    </View>
  );
}

function HomeIndicator({ colors }: { colors: ColorTheme }) {
  return (
    <View
      style={[
        styles.homeIndicator,
        { backgroundColor: hexToRgba(colors.text, 0.82) },
      ]}
    />
  );
}

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const isCompactHeight = height < 860;
  const isShortHeight = height < 760;
  const illustrationViewportHeight = isShortHeight ? 236 : isCompactHeight ? 286 : 356;
  const illustrationScaleFactor = isShortHeight ? 0.76 : isCompactHeight ? 0.88 : 1;
  const headlineFontSize = isShortHeight ? 22 : isCompactHeight ? 24 : 26;
  const headlineLineHeight = isShortHeight ? 29 : isCompactHeight ? 32 : 34;
  const bodyMaxWidth = isShortHeight ? 302 : 322;
  const headlineMaxWidth = isShortHeight ? 304 : 328;
  const featureListMaxWidth = isShortHeight ? 304 : 316;
  const isSmallDevice = width < 360 || height < 760;

  const slides = useMemo<Slide[]>(
    () => [
      {
        id: 'intro',
        title: 'Your Smart Personal\nFinance AI Companion\nUI Kit',
        description: '',
        backgroundColor: colors.card,
        renderIllustration: (themeColors) => <BrandIllustration colors={themeColors} />,
      },
      {
        id: 'budget',
        title: 'Control Your Finances\nwith Personal Budgets',
        description:
          'Invest your spare change with every transaction and let it grow effortlessly.',
        backgroundColor: colors.primaryLight,
        renderIllustration: (themeColors) => <BudgetIllustration colors={themeColors} />,
      },
      {
        id: 'assistant',
        title: 'AI Finance Assistant,\nEverywhere, Anywhere.',
        description:
          'Invest your spare change everytime you do something and let it grows.',
        backgroundColor: colors.primaryLight,
        renderIllustration: (themeColors) => <AssistantIllustration colors={themeColors} />,
      },
      {
        id: 'goals',
        title: 'Set Your Own Financial\nGoals Easily',
        description:
          'Invest your spare change everytime you do something and let it grows.',
        backgroundColor: colors.primaryLight,
        renderIllustration: (themeColors) => (
          <GoalsIllustration colors={themeColors} compact={isSmallDevice} />
        ),
      },
      {
        id: 'save',
        title: 'Save More & Spend\nMore Smarter',
        description:
          'Invest your spare change everytime you do something and let it grows.',
        backgroundColor: colors.primaryLight,
        renderIllustration: (themeColors) => (
          <SavingsIllustration colors={themeColors} compact={isSmallDevice} />
        ),
      },
      {
        id: 'subs',
        title: 'Manage subscriptions in\none single place.',
        description:
          'Invest your spare change everytime you do something and let it grows.',
        backgroundColor: colors.primaryLight,
        renderIllustration: (themeColors) => <SubscriptionsIllustration colors={themeColors} />,
      },
    ],
    [colors.card, colors.primaryLight, isSmallDevice]
  );

  const currentSlide = slides[currentIndex] ?? slides[0];
  const hasSecondaryButton = currentIndex > 0;
  const isLastSlide = currentIndex === slides.length - 1;

  const goToSlide = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handlePrimaryPress = () => {
    if (currentIndex === 0) {
      goToSlide(1);
      return;
    }

    if (isLastSlide) {
      router.push('/(auth)/signUp');
      return;
    }

    goToSlide(currentIndex + 1);
  };

  const renderSlide = ({ item, index }: ListRenderItemInfo<Slide>) => {
    const introSlide = item.id === 'intro';
    const earlySlide = introSlide || item.id === 'budget' || item.id === 'assistant';
    const slideIllustrationHeight = introSlide
      ? isShortHeight
        ? 188
        : isCompactHeight
        ? 224
        : 272
      : illustrationViewportHeight;
    const slideIllustrationScaleFactor = introSlide
      ? isShortHeight
        ? 0.64
        : isCompactHeight
        ? 0.78
        : 0.88
      : earlySlide
        ? isShortHeight
          ? 0.78
          : isCompactHeight
            ? 0.9
            : 1.02
        : illustrationScaleFactor;
    const slideHeadlineFontSize = introSlide
      ? isShortHeight
        ? 20
        : isCompactHeight
          ? 22
          : 24
      : headlineFontSize;
    const slideHeadlineLineHeight = introSlide
      ? isShortHeight
        ? 26
        : isCompactHeight
          ? 29
          : 31
      : headlineLineHeight;
    const slideHeadlineMaxWidth = introSlide
      ? isShortHeight
        ? 292
        : isCompactHeight
          ? 304
          : 316
      : headlineMaxWidth;
    const slideTextTopMargin = introSlide
      ? isShortHeight
        ? 0
        : isCompactHeight
          ? 4
          : 8
      : isShortHeight
        ? 2
        : isCompactHeight
          ? 8
          : 12;
    const slideFeatureGap = introSlide
      ? isShortHeight
        ? 8
        : isCompactHeight
          ? 10
          : 12
      : isShortHeight
        ? 10
        : 14;
    const slideFeatureMarginTop = introSlide
      ? isShortHeight
        ? 14
        : isCompactHeight
          ? 18
          : 22
      : isShortHeight
        ? 18
        : isCompactHeight
          ? 24
          : 32;
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const illustrationOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.45, 1, 0.45],
      extrapolate: 'clamp',
    });
    const illustrationTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [26, 0, 26],
      extrapolate: 'clamp',
    });
    const illustrationScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: 'clamp',
    });
    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });
    const textTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [18, 0, 18],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width }]}>
        <View style={[styles.slideInner, { paddingTop: isShortHeight ? 8 : 0 }]}>
          <Animated.View
            style={[
              styles.topSpace,
              {
                height: slideIllustrationHeight,
                opacity: illustrationOpacity,
                transform: [
                  { translateY: illustrationTranslateY },
                  { scale: illustrationScale },
                  { scale: slideIllustrationScaleFactor },
                ],
              },
            ]}
          >
            {item.renderIllustration(colors)}
          </Animated.View>

          <Animated.View
            style={[
              styles.textBlock,
              {
                marginTop: slideTextTopMargin,
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <Text
              style={[
                styles.headline,
                {
                  color: colors.text,
                  maxWidth: slideHeadlineMaxWidth,
                  fontSize: slideHeadlineFontSize,
                  lineHeight: slideHeadlineLineHeight,
                },
              ]}
            >
              {item.title}
            </Text>
            {introSlide ? (
              <View
                style={[
                  styles.featureList,
                  {
                    maxWidth: featureListMaxWidth,
                    marginTop: slideFeatureMarginTop,
                    gap: slideFeatureGap,
                  },
                ]}
              >
                {[
                  'Smart Goal Tracking',
                  'Subscription Management',
                  'Finance Companion',
                  'AI-Powered Budgeting',
                  'Achievements & More!',
                ].map((feature) => (
                  <View key={feature} style={styles.featureRow}>
                    <View
                      style={[
                        styles.featureIconWrap,
                        { backgroundColor: colors.primaryDark },
                      ]}
                    >
                      <MaterialIcons name="check" size={12} color={colors.card} />
                    </View>
                    <Text
                      style={[
                        styles.featureText,
                        { color: hexToRgba(colors.text, 0.72) },
                      ]}
                    >
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text
                style={[
                  styles.body,
                  {
                    color: hexToRgba(colors.text, 0.52),
                    maxWidth: bodyMaxWidth,
                    marginTop: isShortHeight ? 10 : 14,
                    lineHeight: isShortHeight ? 21 : 23,
                  },
                ]}
              >
                {item.description}
              </Text>
            )}
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: currentSlide.backgroundColor },
      ]}
    >
      <Animated.FlatList
        ref={listRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        key={width}
        style={styles.carousel}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(nextIndex);
        }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View
        style={[
          styles.footer,
          { backgroundColor: currentSlide.backgroundColor },
        ]}
      >
        <View style={styles.dotRow}>
          {currentIndex === 0 ? (
            <View style={styles.dotRowSpacer} />
          ) : (
            slides.slice(1).map((slide, index) => {
              const active = currentSlide.id === slide.id;
              return (
                <Pressable
                  key={slide.id}
                  style={[
                    active ? styles.dotActive : styles.dot,
                    {
                      backgroundColor: active
                        ? colors.primaryDark
                        : hexToRgba(colors.primaryDark, 0.22),
                    },
                  ]}
                  onPress={() => goToSlide(index + 1)}
                />
              );
            })
          )}
        </View>

        <ThemeButton
          title="Get Started"
          onPress={handlePrimaryPress}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          textStyle={styles.primaryButtonText}
          style={styles.primaryButton}
        />

        <View style={styles.secondarySlot}>
          {hasSecondaryButton ? (
            <ThemeButton
              title="Sign In"
              onPress={() => router.push('/(auth)/signIn')}
              colorBackground={hexToRgba(colors.primaryDark, 0)}
              colorText={colors.primaryDark}
              textStyle={styles.secondaryButtonText}
              style={[
                styles.secondaryButton,
                { borderColor: hexToRgba(colors.primaryDark, 0.3) },
              ]}
            />
          ) : null}
        </View>
      </View>

      <HomeIndicator colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-between',
  },
  carousel: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingTop: 46,
    paddingBottom: 8,
  },
  slideInner: {
    flex: 1,
    paddingHorizontal: 28,
    overflow: 'hidden',
  },
  topSpace: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
    flexShrink: 1,
  },
  headline: {
    width: '100%',
    paddingHorizontal: 8,
    alignSelf: 'center',
    fontWeight: '800',
    textAlign: 'center',
    flexShrink: 1,
  },
  body: {
    width: '100%',
    fontSize: Typography.body,
    textAlign: 'center',
    paddingHorizontal: 14,
  },
  featureList: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  featureIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    flexShrink: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  dotRow: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    minHeight: 16,
  },
  dotRowSpacer: {
    height: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  primaryButton: {
    width: '100%',
    minHeight: 58,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  secondarySlot: {
    minHeight: 72,
    justifyContent: 'flex-start',
  },
  secondaryButton: {
    width: '100%',
    minHeight: 58,
    marginTop: 10,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  homeIndicator: {
    alignSelf: 'center',
    width: 120,
    height: 5,
    borderRadius: 999,
    marginTop: 4,
    marginBottom: 12,
  },
  brandIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadge: {
    width: 116,
    height: 116,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  brandTitle: {
    marginTop: 18,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  illustrationStage: {
    width: '100%',
    height: 324,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  phoneShellWrap: {
    width: 300,
    height: 282,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  phoneLeg: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 56,
    borderRadius: 999,
  },
  phoneLegLeft: {
    left: 66,
  },
  phoneLegRight: {
    right: 66,
  },
  phoneShell: {
    width: 286,
    height: 228,
    borderRadius: 40,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  phoneNotch: {
    position: 'absolute',
    top: -1,
    width: 74,
    height: 18,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  phoneShellInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetShell: {
    justifyContent: 'flex-start',
    paddingTop: 26,
  },
  assistantShell: {
    justifyContent: 'center',
  },
  goalsShell: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  savingsShell: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  goalStack: {
    gap: 12,
  },
  ledgerCard: {
    width: 248,
    borderRadius: 26,
    padding: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    minWidth: 0,
  },
  ledgerCopy: {
    flex: 1,
    minWidth: 0,
  },
  smallRoundBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledgerTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
    flexShrink: 1,
  },
  ledgerMeta: {
    marginTop: 2,
    fontSize: Typography.body,
    fontWeight: '600',
    flexShrink: 1,
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
  },
  progressValue: {
    height: 7,
    borderRadius: 999,
  },
  budgetLine: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  budgetLineLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
    flex: 1,
    flexShrink: 1,
  },
  budgetLineValue: {
    fontSize: Typography.body,
    fontWeight: '800',
    textAlign: 'right',
  },
  chatBubbleRight: {
    position: 'absolute',
    top: 28,
    left: 18,
    right: 8,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  chatBubbleLeft: {
    position: 'absolute',
    left: 10,
    right: 12,
    bottom: 18,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  avatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatPrompt: {
    flex: 1,
    flexShrink: 1,
    fontSize: Typography.body,
    lineHeight: 19,
    fontWeight: '700',
    marginRight: 10,
  },
  chatReply: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
    fontWeight: '700',
    flexShrink: 1,
  },
  goalHeaderTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  goalCard: {
    width: 252,
    borderRadius: 22,
    padding: 15,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  goalTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
    flexShrink: 1,
  },
  goalPercent: {
    fontSize: Typography.body,
    fontWeight: '800',
    marginLeft: 10,
  },
  goalFooterRow: {
    gap: 10,
  },
  goalMeta: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  goalMetaLeft: {
    flex: 1,
  },
  goalMetaRight: {
    flex: 1,
    textAlign: 'right',
  },
  savingsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  savingsRowCompact: {
    gap: 10,
  },
  savingsCard: {
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  savingsMonth: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  savingsAmount: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
  },
  savingsDelta: {
    marginTop: 4,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  savingsFill: {
    marginTop: 12,
    height: 88,
    borderRadius: 14,
    justifyContent: 'flex-end',
    padding: 6,
  },
  savingsFillValue: {
    width: '100%',
    height: 34,
    borderRadius: 8,
  },
  graphWrap: {
    width: 300,
    height: 250,
    borderRadius: 40,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphCenter: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  graphBubble: {
    position: 'absolute',
    minWidth: 70,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  graphBubbleTiny: {
    position: 'absolute',
    minWidth: 48,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  graphBubbleText: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  graphBubbleTinyText: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
});
