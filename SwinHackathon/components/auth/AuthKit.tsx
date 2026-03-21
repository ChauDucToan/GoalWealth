import { ThemeButton } from '@/components/ThemeButton';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type AuthScaffoldProps = {
  title: string;
  subtitle?: string;
  illustration: React.ReactNode;
  children: React.ReactNode;
};

type RememberMeProps = {
  checked: boolean;
  label?: string;
  onPress: () => void;
};

type AuthSupportTextProps = {
  email?: string;
};

type PasswordStrengthMeterProps = {
  password: string;
};

export function hexToRgba(hex: string, alpha: number) {
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

function getPasswordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[a-zA-Z]/.test(password) && /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];

  const score = Math.max(1, checks.filter(Boolean).length);

  if (score >= 3) {
    return {
      score,
      label: 'Password strength: Great',
      tone: 'strong' as const,
    };
  }

  return {
    score,
    label: 'Weak! Please add more strength.',
    tone: 'weak' as const,
  };
}

export function AuthScaffold({
  title,
  subtitle,
  illustration,
  children,
}: AuthScaffoldProps) {
  const { colors } = useTheme();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.card }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.heroGlow,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.12) },
            ]}
          />
          <View style={styles.illustrationWrap}>{illustration}</View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                { color: hexToRgba(colors.text, 0.58) },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
          <View style={styles.childrenWrap}>{children}</View>
        </View>

        <View
          style={[
            styles.homeIndicator,
            { backgroundColor: hexToRgba(colors.text, 0.22) },
          ]}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function RobotIllustration() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.robotBadge,
        {
          backgroundColor: colors.card,
          shadowColor: colors.primaryDark,
        },
      ]}
    >
      <MaterialCommunityIcons
        name="robot-outline"
        size={42}
        color={colors.primaryDark}
      />
    </View>
  );
}

export function ShieldIllustration() {
  const { colors } = useTheme();

  return (
    <View style={styles.shieldWrap}>
      <MaterialCommunityIcons
        name="shield-lock-outline"
        size={92}
        color={colors.primaryDark}
      />

      <View
        style={[
          styles.shieldPill,
          {
            backgroundColor: colors.card,
            borderColor: hexToRgba(colors.primaryDark, 0.35),
            shadowColor: colors.primaryDark,
          },
        ]}
      >
        <Text style={[styles.shieldStars, { color: colors.text }]}>****</Text>
      </View>
    </View>
  );
}

export function PasswordResetIllustration() {
  const { colors } = useTheme();

  return (
    <View style={styles.resetArtwork}>
      <View
        style={[
          styles.spark,
          { backgroundColor: hexToRgba(colors.warning, 0.3) },
        ]}
      >
        <MaterialIcons name="auto-fix-high" size={22} color={colors.warning} />
      </View>

      <View
        style={[
          styles.sideShield,
          {
            backgroundColor: colors.card,
            borderColor: hexToRgba(colors.text, 0.15),
          },
        ]}
      >
        <MaterialCommunityIcons
          name="shield-lock-outline"
          size={42}
          color={colors.primaryDark}
        />
      </View>

      <View
        style={[
          styles.mainCard,
          {
            backgroundColor: colors.card,
            borderColor: hexToRgba(colors.text, 0.18),
            shadowColor: colors.text,
          },
        ]}
      >
        <View style={styles.topDots}>
          <View
            style={[
              styles.topDot,
              { backgroundColor: hexToRgba(colors.text, 0.3) },
            ]}
          />
          <View
            style={[
              styles.topDot,
              { backgroundColor: hexToRgba(colors.text, 0.3) },
            ]}
          />
        </View>

        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: hexToRgba(colors.primaryDark, 0.12) },
          ]}
        >
          <MaterialIcons name="person" size={28} color={colors.primaryDark} />
        </View>

        <View
          style={[
            styles.resetLine,
            { backgroundColor: hexToRgba(colors.text, 0.15) },
          ]}
        />

        <View
          style={[
            styles.passwordRow,
            { borderColor: hexToRgba(colors.text, 0.2) },
          ]}
        >
          <MaterialIcons name="alternate-email" size={15} color={colors.text} />
          <View style={styles.passwordBars}>
            <View
              style={[
                styles.passwordBar,
                { backgroundColor: hexToRgba(colors.text, 0.28) },
              ]}
            />
            <View
              style={[
                styles.passwordBar,
                { backgroundColor: hexToRgba(colors.text, 0.28) },
              ]}
            />
            <View
              style={[
                styles.passwordBar,
                { backgroundColor: hexToRgba(colors.text, 0.28) },
              ]}
            />
            <View
              style={[
                styles.passwordBar,
                { backgroundColor: hexToRgba(colors.text, 0.28) },
              ]}
            />
            <View
              style={[
                styles.passwordBar,
                { backgroundColor: hexToRgba(colors.text, 0.28) },
              ]}
            />
          </View>
        </View>

        <MaterialIcons
          name="gesture"
          size={34}
          color={hexToRgba(colors.text, 0.26)}
          style={styles.gesture}
        />
      </View>

      <View
        style={[
          styles.checkBadge,
          {
            backgroundColor: colors.card,
            borderColor: hexToRgba(colors.text, 0.12),
          },
        ]}
      >
        <MaterialIcons name="check-circle" size={34} color={colors.primaryDark} />
      </View>
    </View>
  );
}

export function RememberMe({
  checked,
  label = 'Remember for 30 days',
  onPress,
}: RememberMeProps) {
  const { colors } = useTheme();

  return (
    <Pressable style={styles.rememberRow} onPress={onPress}>
      <MaterialCommunityIcons
        name={checked ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
        size={19}
        color={checked ? colors.primaryDark : hexToRgba(colors.text, 0.32)}
      />
      <Text style={[styles.rememberText, { color: hexToRgba(colors.text, 0.78) }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  const { colors } = useTheme();

  if (!password) {
    return null;
  }

  const strength = getPasswordStrength(password);
  const activeColor = strength.tone === 'strong'
    ? colors.primaryDark
    : colors.error;

  return (
    <View style={styles.strengthWrap}>
      <View style={styles.segmentRow}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[
              styles.segment,
              {
                backgroundColor: index < strength.score
                  ? activeColor
                  : hexToRgba(colors.text, 0.12),
              },
            ]}
          />
        ))}
      </View>
      <Text
        style={[
          styles.strengthLabel,
          { color: strength.tone === 'strong' ? colors.primaryDark : colors.error },
        ]}
      >
        {strength.label}
      </Text>
    </View>
  );
}

export function AuthSupportText({
  email = 'help@finpal.ai',
}: AuthSupportTextProps) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.supportText, { color: hexToRgba(colors.text, 0.52) }]}>
      Don&apos;t remember your email?{'\n'}
      Contact us at{' '}
      <Text style={[styles.supportLink, { color: colors.primaryDark }]}>
        {email}
      </Text>
    </Text>
  );
}

export function AuthPrimaryButton(props: React.ComponentProps<typeof ThemeButton>) {
  return <ThemeButton {...props} style={[styles.authButton, props.style]} />;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 18,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  heroGlow: {
    position: 'absolute',
    top: 24,
    width: 132,
    height: 132,
    borderRadius: 66,
  },
  illustrationWrap: {
    minHeight: 108,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  childrenWrap: {
    width: '100%',
    marginTop: 28,
  },
  homeIndicator: {
    alignSelf: 'center',
    width: 120,
    height: 5,
    borderRadius: 999,
  },
  robotBadge: {
    width: 74,
    height: 74,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  shieldWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldPill: {
    position: 'absolute',
    bottom: 10,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  shieldStars: {
    letterSpacing: 6,
    fontSize: 18,
    fontWeight: '700',
  },
  resetArtwork: {
    width: 182,
    height: 154,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spark: {
    position: 'absolute',
    top: 14,
    left: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideShield: {
    position: 'absolute',
    left: 18,
    top: 34,
    width: 58,
    height: 78,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  mainCard: {
    marginLeft: 42,
    width: 104,
    height: 126,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  topDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  topDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  avatarCircle: {
    marginTop: 12,
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetLine: {
    marginTop: 10,
    width: '80%',
    height: 6,
    borderRadius: 999,
    alignSelf: 'center',
  },
  passwordRow: {
    marginTop: 12,
    height: 30,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passwordBars: {
    flexDirection: 'row',
    gap: 3,
  },
  passwordBar: {
    width: 8,
    height: 4,
    borderRadius: 999,
  },
  gesture: {
    marginTop: 8,
    alignSelf: 'center',
  },
  checkBadge: {
    position: 'absolute',
    right: 10,
    bottom: 22,
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '500',
  },
  strengthWrap: {
    marginTop: 10,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
  strengthLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  supportText: {
    marginTop: 18,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  supportLink: {
    fontWeight: '700',
  },
  authButton: {
    width: '100%',
    minHeight: 52,
  },
});
