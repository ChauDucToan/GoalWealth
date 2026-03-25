import { hexToRgba } from '@/components/auth/AuthKit';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export type ProductSurfaceTone =
  | 'primaryDark'
  | 'success'
  | 'warning'
  | 'error'
  | 'secondary'
  | 'neutral';

function resolveTone(
  colors: ReturnType<typeof useTheme>['colors'],
  tone: ProductSurfaceTone
) {
  if (tone === 'neutral') {
    return colors.textSecondary;
  }

  return colors[tone];
}

export function ProductSurfaceCard({
  children,
  style,
  compact = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: hexToRgba(colors.primaryDark, 0.06),
          shadowColor: colors.shadow,
          padding: compact ? 14 : 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ProductSectionHeader({
  title,
  meta,
  actionLabel,
  onPress,
}: {
  title: string;
  meta?: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {meta ? (
          <Text style={[styles.sectionMeta, { color: hexToRgba(colors.text, 0.46) }]}>{meta}</Text>
        ) : null}
      </View>
      {actionLabel && onPress ? (
        <Pressable onPress={onPress}>
          <Text style={[styles.sectionAction, { color: colors.primaryDark }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ProductStatusChip({
  label,
  tone = 'neutral',
  icon,
}: {
  label: string;
  tone?: ProductSurfaceTone;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
}) {
  const { colors } = useTheme();
  const accent = resolveTone(colors, tone);

  return (
    <View
      style={[
        styles.statusChip,
        { backgroundColor: hexToRgba(accent, 0.1), borderColor: hexToRgba(accent, 0.12) },
      ]}
    >
      {icon ? <MaterialIcons name={icon} size={14} color={accent} /> : null}
      <Text style={[styles.statusChipText, { color: accent }]}>{label}</Text>
    </View>
  );
}

export function ProductMetricTile({
  label,
  value,
  helper,
  tone = 'neutral',
  style,
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: ProductSurfaceTone;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const accent = resolveTone(colors, tone);

  return (
    <View style={[styles.metricTile, { backgroundColor: colors.backgroundSoft }, style]}>
      <Text style={[styles.metricLabel, { color: hexToRgba(colors.text, 0.48) }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: tone === 'neutral' ? colors.text : accent }]}>
        {value}
      </Text>
      {helper ? (
        <Text style={[styles.metricHelper, { color: hexToRgba(colors.text, 0.5) }]}>{helper}</Text>
      ) : null}
    </View>
  );
}

export function ProductRow({
  title,
  body,
  meta,
  rightText,
  icon,
  tone = 'neutral',
  onPress,
  divider = true,
  titleNumberOfLines,
  bodyNumberOfLines,
  metaNumberOfLines,
}: {
  title: string;
  body?: string;
  meta?: string;
  rightText?: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  tone?: ProductSurfaceTone;
  onPress?: () => void;
  divider?: boolean;
  titleNumberOfLines?: number;
  bodyNumberOfLines?: number;
  metaNumberOfLines?: number;
}) {
  const { colors } = useTheme();
  const accent = resolveTone(colors, tone);
  const Container = onPress ? Pressable : View;

  return (
    <Container
      style={[
        styles.row,
        divider && { borderBottomColor: hexToRgba(colors.primaryDark, 0.08), borderBottomWidth: 1 },
      ]}
      onPress={onPress}
    >
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: hexToRgba(accent, 0.1) }]}>
          <MaterialIcons name={icon} size={17} color={accent} />
        </View>
      ) : null}
      <View style={styles.rowCopy}>
        <View style={styles.rowTop}>
          <Text
            numberOfLines={titleNumberOfLines}
            style={[styles.rowTitle, { color: colors.text }]}
          >
            {title}
          </Text>
          {meta ? (
            <Text
              numberOfLines={metaNumberOfLines}
              style={[styles.rowMeta, { color: hexToRgba(colors.text, 0.44) }]}
            >
              {meta}
            </Text>
          ) : null}
        </View>
        {body ? (
          <Text
            numberOfLines={bodyNumberOfLines}
            style={[styles.rowBody, { color: hexToRgba(colors.text, 0.56) }]}
          >
            {body}
          </Text>
        ) : null}
      </View>
      {rightText ? <Text style={[styles.rowRight, { color: accent }]}>{rightText}</Text> : null}
    </Container>
  );
}

export function ProductDisclosure({
  title,
  summary,
  meta,
  children,
  defaultExpanded = false,
  style,
}: {
  title: string;
  summary: string;
  meta?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const iconName = useMemo(
    () => (expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'),
    [expanded]
  );

  return (
    <View
      style={[
        styles.disclosure,
        {
          backgroundColor: colors.backgroundSoft,
          borderColor: hexToRgba(colors.primaryDark, 0.08),
        },
        style,
      ]}
    >
      <Pressable style={styles.disclosureHeader} onPress={() => setExpanded((current) => !current)}>
        <View style={styles.disclosureCopy}>
          <Text style={[styles.disclosureTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.disclosureSummary, { color: hexToRgba(colors.text, 0.56) }]}>
            {summary}
          </Text>
        </View>
        <View style={styles.disclosureMeta}>
          {meta ? <Text style={[styles.disclosureMetaText, { color: colors.primaryDark }]}>{meta}</Text> : null}
          <MaterialIcons name={iconName} size={20} color={colors.primaryDark} />
        </View>
      </Pressable>
      {expanded ? <View style={styles.disclosureBody}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionMeta: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '800',
    paddingTop: 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metricTile: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    padding: 13,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  metricHelper: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  rowMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
  rowBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  rowRight: {
    maxWidth: 92,
    fontSize: 12,
    fontWeight: '800',
    paddingTop: 1,
    textAlign: 'right',
  },
  disclosure: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  disclosureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
  },
  disclosureCopy: {
    flex: 1,
    gap: 4,
  },
  disclosureTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  disclosureSummary: {
    fontSize: Typography.body,
    lineHeight: 18,
    fontWeight: '500',
  },
  disclosureMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  disclosureMetaText: {
    fontSize: 11,
    fontWeight: '800',
  },
  disclosureBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
  },
});
