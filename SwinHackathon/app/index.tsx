import { useTheme } from '@/hooks/use-theme-colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Typography } from '@/constants/theme';
import {
  Animated,
  Easing,
  ImageBackground,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

const loadingPhoto = require('../assets/images/loading-budget-photo.png');

type LoadingPhase = 'splash' | 'progress' | 'photo' | 'message';

function hexToRgba(hex: string, alpha: number) {
  const cleanHex = hex.replace('#', '');
  const normalized = cleanHex.length === 3
    ? cleanHex.split('').map((value) => `${value}${value}`).join('')
    : cleanHex;

  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function LoaderRing({
  color,
  size,
  style,
  trackColor,
}: {
  color: string;
  size: number;
  style?: StyleProp<ViewStyle>;
  trackColor: string;
}) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
      spin.stopAnimation();
    };
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const stroke = Math.max(4, Math.round(size * 0.1));

  return (
    <View style={[styles.loaderWrap, { width: size, height: size }, style]}>
      <View
        style={[
          styles.loaderTrack,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: trackColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.loaderArc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderTopColor: color,
            borderRightColor: color,
            transform: [{ rotate }],
          },
        ]}
      />
    </View>
  );
}

function LogoBot({
  color,
  elevated = false,
}: {
  color: string;
  elevated?: boolean;
}) {
  return (
    <View style={elevated ? styles.logoShadow : undefined}>
      <MaterialCommunityIcons name="robot-outline" size={44} color={color} />
    </View>
  );
}

function HomeIndicator({
  color,
}: {
  color: string;
}) {
  return <View style={[styles.homeIndicator, { backgroundColor: color }]} />;
}

export default function Index() {
  const { colors } = useTheme();
  const router = useRouter();

  const [phase, setPhase] = useState<LoadingPhase>('splash');
  const [progress, setProgress] = useState(0);

  const phaseSchedule = useMemo(
    () => ({
      splash: 900,
      progress: 1400,
      photo: 1200,
      message: 1600,
    }),
    []
  );

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('progress'), phaseSchedule.splash),
      setTimeout(() => setPhase('photo'), phaseSchedule.splash + phaseSchedule.progress),
      setTimeout(
        () => setPhase('message'),
        phaseSchedule.splash + phaseSchedule.progress + phaseSchedule.photo
      ),
      setTimeout(
        () => router.replace('/welcome'),
        phaseSchedule.splash +
          phaseSchedule.progress +
          phaseSchedule.photo +
          phaseSchedule.message
      ),
    ];

    return () => timers.forEach(clearTimeout);
  }, [phaseSchedule, router]);

  useEffect(() => {
    if (phase !== 'progress') {
      return;
    }

    setProgress(0);

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(
        100,
        Math.round((elapsed / phaseSchedule.progress) * 100)
      );

      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(interval);
      }
    }, 32);

    return () => clearInterval(interval);
  }, [phase, phaseSchedule.progress]);

  if (phase === 'splash') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.primaryDark }]}>
        <View style={styles.centerContent}>
          <LogoBot color={colors.card} />
        </View>

        <View style={styles.bottomLoaderArea}>
          <LoaderRing
            size={52}
            color={colors.textLight}
            trackColor={hexToRgba(colors.textLight, 0.22)}
          />
        </View>

        <HomeIndicator color={hexToRgba(colors.textLight, 0.92)} />
      </View>
    );
  }

  if (phase === 'progress') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.card }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {progress}%
          </Text>
        </View>

        <View style={styles.bottomLogoArea}>
          <View
            style={[
              styles.progressLogoBadge,
              {
                backgroundColor: colors.card,
                shadowColor: colors.primaryDark,
              },
            ]}
          >
            <LogoBot color={colors.primaryDark} elevated />
          </View>
        </View>

        <HomeIndicator color={hexToRgba(colors.text, 0.84)} />
      </View>
    );
  }

  if (phase === 'photo') {
    return (
      <ImageBackground source={loadingPhoto} resizeMode="cover" style={styles.photoScreen}>
        <View
          style={[
            styles.photoOverlay,
            { backgroundColor: hexToRgba(colors.primaryDark, 0.06) },
          ]}
        />
        <HomeIndicator color={hexToRgba(colors.card, 0.92)} />
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.card }]}>
      <View style={styles.messageContent}>
        <View
          style={[
            styles.messageBadge,
            { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
          ]}
        >
          <LogoBot color={colors.primaryDark} />
        </View>
        <Text style={[styles.loadingLabel, { color: colors.primaryDark }]}>
          LOADING...
        </Text>
        <Text style={[styles.loadingBody, { color: hexToRgba(colors.text, 0.78) }]}>
          We&apos;re getting ready managing{'\n'}your budget.
        </Text>
      </View>

      <HomeIndicator color={hexToRgba(colors.text, 0.84)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 86,
    paddingBottom: 12,
  },
  centerContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 52,
  },
  bottomLoaderArea: {
    marginBottom: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLogoArea: {
    marginBottom: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 32,
    fontWeight: '500',
    letterSpacing: -1,
  },
  progressLogoBadge: {
    minWidth: 68,
    minHeight: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  photoScreen: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  messageContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 36,
  },
  messageBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLabel: {
    marginTop: 14,
    fontSize: Typography.body,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  loadingBody: {
    marginTop: 16,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderTrack: {
    opacity: 1,
  },
  loaderArc: {
    position: 'absolute',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  logoShadow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  homeIndicator: {
    width: 124,
    height: 5,
    borderRadius: 999,
  },
});
