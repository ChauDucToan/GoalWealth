import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { subscriptionItems } from '@/components/finance/subscription-data';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from '@/lib/expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type SubscriptionResultMode =
  | 'added'
  | 'updated'
  | 'paused'
  | 'reactivated'
  | 'cancelled';

const modeConfig: Record<
  SubscriptionResultMode,
  {
    icon: React.ComponentProps<typeof MaterialIcons>['name'];
    title: string;
    body: (name: string) => string;
    accent: 'success' | 'warning' | 'error' | 'primaryDark';
  }
> = {
  added: {
    icon: 'check-circle',
    title: 'Subscription Added',
    body: (name) => `${name} is now tracked in your recurring payments overview.`,
    accent: 'success',
  },
  updated: {
    icon: 'task-alt',
    title: 'Subscription Updated',
    body: (name) => `${name} has been refreshed with the latest billing settings.`,
    accent: 'primaryDark',
  },
  paused: {
    icon: 'pause-circle',
    title: 'Subscription Paused',
    body: (name) => `${name} has been paused and will stop renewing until you reactivate it.`,
    accent: 'warning',
  },
  reactivated: {
    icon: 'play-circle',
    title: 'Subscription Reactivated',
    body: (name) => `${name} is active again and upcoming reminders are back on schedule.`,
    accent: 'success',
  },
  cancelled: {
    icon: 'cancel',
    title: 'Subscription Cancelled',
    body: (name) => `${name} has been marked for cancellation in this demo flow.`,
    accent: 'error',
  },
};

export default function SubscriptionResultScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; mode?: SubscriptionResultMode }>();
  const subscription =
    subscriptionItems.find((item) => item.id === params.id) ?? subscriptionItems[0];
  const mode = params.mode && params.mode in modeConfig ? params.mode : 'added';
  const config = modeConfig[mode];
  const accent = colors[config.accent];
  const highlightLabel =
    mode === 'added'
      ? 'Added to recurring bills'
      : mode === 'cancelled'
        ? 'Removed from active plans'
        : mode === 'updated'
          ? 'Billing settings refreshed'
          : mode === 'paused'
            ? 'Renewals are currently paused'
            : 'Renewals are active again';

  return (
    <View style={[styles.screen, { backgroundColor: colors.card }]}>
      <View style={[styles.heroShell, { backgroundColor: hexToRgba(accent, 0.08) }]}>
        <View
          style={[
            styles.iconShell,
            { backgroundColor: hexToRgba(accent, 0.12) },
          ]}
        >
          <MaterialIcons name={config.icon} size={42} color={accent} />
        </View>
        <View style={[styles.highlightPill, { backgroundColor: colors.card }]}>
          <Text style={[styles.highlightText, { color: accent }]}>{highlightLabel}</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{config.title}</Text>
      <Text style={[styles.body, { color: hexToRgba(colors.text, 0.56) }]}>
        {config.body(subscription.name)}
      </Text>

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: colors.backgroundSoft,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.subscriptionHeader}>
          <View style={[styles.subscriptionIconWrap, { backgroundColor: hexToRgba(accent, 0.12) }]}>
            <MaterialIcons name={subscription.icon} size={20} color={accent} />
          </View>
          <View style={styles.subscriptionCopy}>
            <Text style={[styles.subscriptionTitle, { color: colors.text }]}>{subscription.name}</Text>
            <Text style={[styles.subscriptionMeta, { color: hexToRgba(colors.text, 0.54) }]}>
              {subscription.plan} • {subscription.category}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.54) }]}>
            Renewal mode
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {subscription.autoRenew ? 'Automatic' : 'Manual'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.54) }]}>
            Payment method
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{subscription.paymentMethod}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.54) }]}>
            Next payment
          </Text>
          <Text style={[styles.summaryValue, { color: accent }]}>{subscription.nextPayment}</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <ThemeButton
          title="Open Details"
          onPress={() =>
            router.replace({
              pathname: '/(finance)/subscription/[id]',
              params: { id: subscription.id },
            })
          }
          colorBackground={accent}
          colorText={colors.card}
          style={styles.button}
        />
        <ThemeButton
          title="Back to subscriptions"
          onPress={() => router.replace('/(finance)/subscriptions')}
          colorBackground={colors.backgroundSoft}
          colorText={colors.text}
          style={styles.button}
        />
        <ThemeButton
          title="Add another subscription"
          onPress={() => router.replace('/(finance)/subscription-add')}
          colorBackground={hexToRgba(colors.primaryDark, 0.1)}
          colorText={colors.primaryDark}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  heroShell: {
    width: '100%',
    borderRadius: 32,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
  },
  iconShell: {
    width: 98,
    height: 98,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightPill: {
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 24,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    marginTop: 10,
    maxWidth: 340,
    fontSize: Typography.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  subscriptionHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 2,
  },
  subscriptionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionCopy: {
    flex: 1,
    minWidth: 0,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  subscriptionMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  summaryRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  summaryValue: {
    flex: 1,
    minWidth: 0,
    fontSize: Typography.body,
    fontWeight: '800',
    textAlign: 'right',
  },
  buttons: {
    width: '100%',
    marginTop: 26,
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
