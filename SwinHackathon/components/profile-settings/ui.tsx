import { MotionPressable } from '@/components/MotionPressable';
import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Switch, Text, View, ViewStyle } from 'react-native';

export function ProfileSettingsCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ProfileSettingsSectionTitle({ title }: { title: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>;
}

export function ProfileSettingsPill({
  label,
  icon,
  tone = 'accent',
}: {
  label: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  tone?: 'accent' | 'soft' | 'success' | 'warning';
}) {
  const { colors } = useTheme();

  const backgroundColor =
    tone === 'success'
      ? hexToRgba(colors.success, 0.12)
      : tone === 'warning'
        ? hexToRgba(colors.warning, 0.14)
        : tone === 'soft'
          ? colors.backgroundSoft
          : hexToRgba(colors.primaryDark, 0.1);

  const color =
    tone === 'success'
      ? colors.success
      : tone === 'warning'
        ? colors.warning
        : tone === 'soft'
          ? colors.text
          : colors.primaryDark;

  return (
    <View style={[styles.pill, { backgroundColor }]}>
      {icon ? <MaterialIcons name={icon} size={14} color={color} /> : null}
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function ProfileSettingsStat({
  value,
  label,
  icon,
  tone = 'accent',
}: {
  value: string;
  label: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  tone?: 'accent' | 'soft' | 'success' | 'warning';
}) {
  const { colors } = useTheme();

  const backgroundColor =
    tone === 'success'
      ? hexToRgba(colors.success, 0.1)
      : tone === 'warning'
        ? hexToRgba(colors.warning, 0.14)
        : tone === 'soft'
          ? colors.backgroundSoft
          : hexToRgba(colors.primaryDark, 0.06);

  const iconColor =
    tone === 'success'
      ? colors.success
      : tone === 'warning'
        ? colors.warning
        : tone === 'soft'
          ? colors.text
          : colors.primaryDark;

  return (
    <View style={[styles.statCard, { backgroundColor }]}>
      {icon ? <MaterialIcons name={icon} size={17} color={iconColor} /> : null}
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: hexToRgba(colors.text, 0.54) }]}>{label}</Text>
    </View>
  );
}

export function ProfileSettingsBanner({
  eyebrow,
  title,
  body,
  icon,
  tone = 'accent',
  style,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  tone?: 'accent' | 'success' | 'warning';
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();

  const accentColor = tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : colors.primaryDark;

  return (
    <ProfileSettingsCard
      style={[
        {
          backgroundColor: hexToRgba(accentColor, 0.08),
          borderColor: hexToRgba(accentColor, 0.16),
        },
        style,
      ]}
    >
      <View style={styles.bannerHeader}>
        <View style={[styles.bannerIconWrap, { backgroundColor: hexToRgba(accentColor, 0.14) }]}>
          <MaterialIcons name={icon} size={20} color={accentColor} />
        </View>
        <View style={styles.bannerCopy}>
          {eyebrow ? <Text style={[styles.bannerEyebrow, { color: accentColor }]}>{eyebrow}</Text> : null}
          <Text style={[styles.bannerTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.bannerBody, { color: hexToRgba(colors.text, 0.56) }]}>{body}</Text>
        </View>
      </View>
    </ProfileSettingsCard>
  );
}

export function ProfileSettingsRow({
  icon,
  label,
  summary,
  onPress,
  trailing,
  danger = false,
  density = 'default',
  summaryNumberOfLines,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  summary?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
  density?: 'default' | 'compact';
  summaryNumberOfLines?: number;
}) {
  const { colors } = useTheme();
  const iconColor = danger ? colors.error : colors.primaryDark;
  const compact = density === 'compact';
  const singleLineCompact = compact && !summary;

  return (
    <MotionPressable
      style={[
        styles.row,
        compact ? styles.rowCompact : null,
        singleLineCompact ? styles.rowSingleLineCompact : null,
      ]}
      onPress={onPress}
      scaleTo={0.985}
      translateYTo={1}
    >
      <View style={styles.leading}>
        <View
          style={[
            styles.iconWrap,
            compact ? styles.iconWrapCompact : null,
            singleLineCompact ? styles.iconWrapSingleLineCompact : null,
            {
              backgroundColor: danger
                ? hexToRgba(colors.error, 0.12)
                : hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
        >
          <MaterialIcons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.rowLabel, { color: danger ? colors.error : colors.text }]}>
            {label}
          </Text>
          {summary ? (
            <Text
              numberOfLines={summaryNumberOfLines}
              style={[
                styles.rowSummary,
                compact ? styles.rowSummaryCompact : null,
                { color: hexToRgba(colors.text, 0.54) },
              ]}
            >
              {summary}
            </Text>
          ) : null}
        </View>
      </View>

      {trailing ?? (
        <MaterialIcons name="chevron-right" size={20} color={hexToRgba(colors.text, 0.34)} />
      )}
    </MotionPressable>
  );
}

export function ProfileSettingsSwitchRow({
  icon,
  label,
  summary,
  value,
  onValueChange,
  density = 'default',
  summaryNumberOfLines,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  summary?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  density?: 'default' | 'compact';
  summaryNumberOfLines?: number;
}) {
  const { colors } = useTheme();
  const compact = density === 'compact';

  return (
    <View style={[styles.switchRow, compact ? styles.switchRowCompact : null]}>
      <Pressable
        onPress={() => onValueChange(!value)}
        style={[styles.switchPressArea, compact ? styles.switchPressAreaCompact : null]}
        android_ripple={{ color: hexToRgba(colors.primaryDark, 0.08), borderless: false }}
      >
        <View style={styles.leading}>
          <View
            style={[
              styles.iconWrap,
              compact ? styles.iconWrapCompact : null,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
            ]}
          >
            <MaterialIcons name={icon} size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
            {summary ? (
              <Text
                numberOfLines={summaryNumberOfLines}
                style={[
                  styles.rowSummary,
                  compact ? styles.rowSummaryCompact : null,
                  { color: hexToRgba(colors.text, 0.54) },
                ]}
              >
                {summary}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
      <View style={styles.switchTrailing}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          thumbColor={colors.card}
          trackColor={{ false: colors.border, true: colors.primaryDark }}
        />
      </View>
    </View>
  );
}

export function ProfileOptionChip({
  label,
  active,
  onPress,
  accent,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accent?: string;
}) {
  const { colors } = useTheme();
  const tint = accent ?? colors.primaryDark;

  return (
    <MotionPressable
      style={[
        styles.optionChip,
        {
          backgroundColor: active ? hexToRgba(tint, 0.12) : colors.backgroundSoft,
          borderColor: active ? tint : colors.border,
        },
      ]}
      onPress={onPress}
      scaleTo={0.975}
      translateYTo={1}
    >
      <Text
        style={[
          styles.optionChipText,
          { color: active ? tint : colors.text },
        ]}
      >
        {label}
      </Text>
    </MotionPressable>
  );
}

export function ProfilePrimaryActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.actionRow}>
      <View style={styles.actionButtonWrap}>
        <ThemeButton
          title={secondaryLabel}
          onPress={onSecondary}
          colorBackground={colors.card}
          colorText={colors.text}
          style={[styles.fullButton, { borderWidth: 1, borderColor: colors.border }]}
        />
      </View>
      <View style={styles.actionButtonWrap}>
        <ThemeButton
          title={primaryLabel}
          onPress={onPrimary}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.fullButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  pill: {
    alignSelf: 'flex-start',
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statCard: {
    minHeight: 96,
    borderRadius: 18,
    padding: 12,
    justifyContent: 'space-between',
    gap: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCopy: {
    flex: 1,
    minWidth: 0,
  },
  bannerEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: '800',
  },
  bannerBody: {
    marginTop: 4,
    fontSize: Typography.body,
    lineHeight: 18,
  },
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowCompact: {
    minHeight: 52,
  },
  rowSingleLineCompact: {
    minHeight: 44,
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapCompact: {
    width: 32,
    height: 32,
    borderRadius: 12,
  },
  iconWrapSingleLineCompact: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowSummary: {
    marginTop: 4,
    fontSize: Typography.body,
    lineHeight: 18,
  },
  rowSummaryCompact: {
    marginTop: 2,
    lineHeight: 16,
  },
  switchRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchRowCompact: {
    minHeight: 52,
  },
  switchPressArea: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    paddingVertical: 6,
  },
  switchPressAreaCompact: {
    paddingVertical: 4,
  },
  switchTrailing: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  optionChip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonWrap: {
    flex: 1,
  },
  fullButton: {
    width: '100%',
  },
});
