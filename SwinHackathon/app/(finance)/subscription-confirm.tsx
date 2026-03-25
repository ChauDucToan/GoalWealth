import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { getSubscriptionById } from '@/components/finance/subscription-data';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ConfirmAction = 'pause' | 'activate' | 'cancel';

const actionConfig: Record<
  ConfirmAction,
  {
    title: string;
    body: (name: string) => string;
    confirmLabel: string;
    accent: 'warning' | 'success' | 'error';
    resultMode: 'paused' | 'reactivated' | 'cancelled';
    icon: React.ComponentProps<typeof MaterialIcons>['name'];
  }
> = {
  pause: {
    title: 'Pause Subscription',
    body: (name) => `Pause ${name} for now and stop renewal reminders until you activate it again.`,
    confirmLabel: 'Pause Subscription',
    accent: 'warning',
    resultMode: 'paused',
    icon: 'pause-circle',
  },
  activate: {
    title: 'Activate Subscription',
    body: (name) => `Activate ${name} again and bring renewal reminders back into the dashboard.`,
    confirmLabel: 'Activate Subscription',
    accent: 'success',
    resultMode: 'reactivated',
    icon: 'play-circle',
  },
  cancel: {
    title: 'Cancel Subscription',
    body: (name) => `Cancel ${name} in this demo flow and mark it as no longer renewing.`,
    confirmLabel: 'Cancel Subscription',
    accent: 'error',
    resultMode: 'cancelled',
    icon: 'cancel',
  },
};

export default function SubscriptionConfirmScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; action?: ConfirmAction }>();
  const subscription = getSubscriptionById(params.id);
  const action =
    params.action && params.action in actionConfig ? params.action : 'pause';
  const config = actionConfig[action];
  const accent = colors[config.accent];

  if (!subscription) {
    return null;
  }

  return (
    <View style={[styles.screen, { backgroundColor: hexToRgba(colors.primaryDark, 0.14) }]}>
      <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconShell, { backgroundColor: hexToRgba(accent, 0.12) }]}>
          <MaterialIcons name={config.icon} size={42} color={accent} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{config.title}</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.56) }]}>
          {config.body(subscription.name)}
        </Text>

        <View
          style={[
            styles.planCard,
            { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
          ]}
        >
          <View style={styles.planHeader}>
            <View style={[styles.planIconWrap, { backgroundColor: hexToRgba(accent, 0.12) }]}>
              <MaterialIcons name={subscription.icon} size={20} color={accent} />
            </View>
            <View style={styles.planCopy}>
              <Text style={[styles.planTitle, { color: colors.text }]}>{subscription.name}</Text>
              <Text style={[styles.planMeta, { color: hexToRgba(colors.text, 0.56) }]}>
                {subscription.plan} • {subscription.paymentMethod}
              </Text>
            </View>
          </View>

          <View style={styles.planInfoRow}>
            <View style={[styles.planInfoChip, { backgroundColor: colors.card }]}>
              <Text style={[styles.planInfoValue, { color: accent }]}>{subscription.nextPayment}</Text>
              <Text style={[styles.planInfoLabel, { color: hexToRgba(colors.text, 0.5) }]}>Next bill</Text>
            </View>
            <View style={[styles.planInfoChip, { backgroundColor: colors.card }]}>
              <Text style={[styles.planInfoValue, { color: colors.text }]}>
                {subscription.autoRenew ? 'Auto' : 'Manual'}
              </Text>
              <Text style={[styles.planInfoLabel, { color: hexToRgba(colors.text, 0.5) }]}>Renewal</Text>
            </View>
          </View>

          {action === 'cancel' ? (
            <View style={[styles.warningCard, { backgroundColor: hexToRgba(colors.error, 0.08) }]}>
              <MaterialIcons name="info-outline" size={16} color={colors.error} />
              <Text style={[styles.warningText, { color: hexToRgba(colors.text, 0.7) }]}>
                Cancelling will remove this plan from your active recurring list in this demo flow.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.buttonStack}>
          <ThemeButton
            title={config.confirmLabel}
            onPress={() =>
              router.replace({
                pathname: '/(finance)/subscription-result',
                params: { id: subscription.id, mode: config.resultMode },
              })
            }
            colorBackground={accent}
            colorText={colors.card}
            style={styles.button}
          />
          <ThemeButton
            title={action === 'cancel' ? 'No, Keep It' : 'Go Back'}
            onPress={() => router.back()}
            colorBackground={colors.backgroundSoft}
            colorText={colors.text}
            style={styles.button}
          />
        </View>
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
  sheet: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  iconShell: {
    width: 98,
    height: 98,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: Typography.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  planCard: {
    width: '100%',
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCopy: {
    flex: 1,
    minWidth: 0,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  planMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  planInfoRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  planInfoChip: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  planInfoValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  planInfoLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  warningCard: {
    marginTop: 14,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningText: {
    flex: 1,
    minWidth: 0,
    fontSize: Typography.body,
    lineHeight: 19,
  },
  buttonStack: {
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
