import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import {
  subscriptionItems,
  type SubscriptionTone,
} from '@/components/finance/subscription-data';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function toneColor(colors: ReturnType<typeof useTheme>['colors'], tone: SubscriptionTone) {
  return colors[tone];
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.infoRow, { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) }]}>
      <Text style={[styles.infoLabel, { color: hexToRgba(colors.text, 0.52) }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

export default function SubscriptionDetailScreen() {
  const { colors } = useTheme();
  const { isSmallPhone } = useResponsive();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const subscription = subscriptionItems.find((item) => item.id === params.id);

  if (!subscription) {
    return (
      <FinanceScreen
        title="Open Plan"
        subtitle="Choose a subscription to review billing details, controls and payment history"
      >
        <View style={styles.stack}>
          <FinanceCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose a plan</Text>
            <Text style={[styles.selectorBody, { color: hexToRgba(colors.text, 0.56) }]}>
              Pick the subscription you want to inspect instead of jumping into a preselected plan.
            </Text>

            <ResponsiveGrid
              minItemWidth={isSmallPhone ? 240 : 164}
              horizontalPadding={18}
              gap={12}
              maxColumns={isSmallPhone ? 1 : 2}
              style={styles.selectorGrid}
            >
              {subscriptionItems.map((item) => {
                const itemAccent = toneColor(colors, item.tone);

                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.selectorCard,
                      {
                        backgroundColor: colors.backgroundSoft,
                        borderColor: hexToRgba(itemAccent, 0.16),
                      },
                    ]}
                    onPress={() =>
                      router.replace({
                        pathname: '/(finance)/subscription/[id]',
                        params: { id: item.id },
                      })
                    }
                  >
                    <View
                      style={[
                        styles.selectorIcon,
                        { backgroundColor: hexToRgba(itemAccent, 0.12) },
                      ]}
                    >
                      <MaterialIcons name={item.icon} size={20} color={itemAccent} />
                    </View>
                    <View style={styles.selectorCopy}>
                      <Text style={[styles.selectorTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.selectorMeta, { color: hexToRgba(colors.text, 0.56) }]}
                        numberOfLines={1}
                      >
                        {item.plan} • {item.category}
                      </Text>
                      <Text style={[styles.selectorAmount, { color: itemAccent }]}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="arrow-forward"
                      size={18}
                      color={hexToRgba(colors.text, 0.32)}
                    />
                  </Pressable>
                );
              })}
            </ResponsiveGrid>
          </FinanceCard>
        </View>
      </FinanceScreen>
    );
  }

  const accent = toneColor(colors, subscription.tone);
  return (
    <FinanceScreen
      title={subscription.name}
      subtitle="Plan details, billing controls and recent charges"
      rightAccessory={
        <Pressable
          style={[
            styles.headerAction,
            {
              backgroundColor: colors.card,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
          onPress={() =>
            router.push({
              pathname: '/(finance)/subscription-add',
              params: { preset: subscription.id },
            })
          }
        >
          <MaterialIcons name="edit" size={18} color={colors.primaryDark} />
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <FinanceCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(accent, 0.12),
              borderColor: hexToRgba(accent, 0.14),
            },
          ]}
        >
          <View style={styles.heroHeader}>
            <View style={[styles.iconShell, { backgroundColor: colors.card }]}>
              <MaterialIcons name={subscription.icon} size={30} color={accent} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.planLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                {subscription.category}
              </Text>
              <Text style={[styles.planTitle, { color: colors.text }]}>
                {subscription.plan}
              </Text>
              <Text style={[styles.planBody, { color: hexToRgba(colors.text, 0.58) }]}>
                {subscription.description}
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    subscription.status === 'Active'
                      ? hexToRgba(colors.success, 0.12)
                      : hexToRgba(colors.warning, 0.12),
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      subscription.status === 'Active' ? colors.success : colors.warning,
                  },
                ]}
              >
                {subscription.status}
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              {formatCurrency(subscription.amount)}
            </Text>
            <Text style={[styles.priceCycle, { color: hexToRgba(colors.text, 0.52) }]}>
              per {subscription.cycle === 'Monthly' ? 'month' : 'year'}
            </Text>
          </View>

          <View style={[styles.timelineTrack, { backgroundColor: hexToRgba(accent, 0.14) }]}>
            <View style={[styles.timelineValue, { backgroundColor: accent, width: '68%' }]} />
          </View>

          <ResponsiveGrid minItemWidth={120} horizontalPadding={34} gap={10} maxColumns={3}>
            <View style={[styles.miniCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.miniValue, { color: colors.text }]}>{subscription.nextPayment}</Text>
              <Text style={[styles.miniLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                Next payment
              </Text>
            </View>
            <View style={[styles.miniCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.miniValue, { color: colors.text }]}>{subscription.startedOn}</Text>
              <Text style={[styles.miniLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                Started on
              </Text>
            </View>
            <View style={[styles.miniCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.miniValue, { color: accent }]}>
                {subscription.autoRenew ? 'On' : 'Off'}
              </Text>
              <Text style={[styles.miniLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                Auto renew
              </Text>
            </View>
          </ResponsiveGrid>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Billing setup</Text>
          <View style={styles.infoStack}>
            <InfoRow label="Payment method" value={subscription.paymentMethod} />
            <InfoRow label="Renewal cycle" value={subscription.cycle} />
            <InfoRow
              label="Renewal policy"
              value={subscription.autoRenew ? 'Automatic every cycle' : 'Manual renewal'}
            />
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent charges</Text>
          <View style={styles.chargeStack}>
            {subscription.charges.map((charge) => (
              <View
                key={charge.id}
                style={[styles.chargeRow, { borderBottomColor: hexToRgba(colors.primaryDark, 0.08) }]}
              >
                <View style={[styles.chargeIcon, { backgroundColor: hexToRgba(accent, 0.12) }]}>
                  <MaterialIcons name="payments" size={18} color={accent} />
                </View>
                <View style={styles.chargeCopy}>
                  <Text style={[styles.chargeLabel, { color: colors.text }]}>{charge.label}</Text>
                  <Text style={[styles.chargeDate, { color: hexToRgba(colors.text, 0.52) }]}>
                    {charge.date}
                  </Text>
                </View>
                <Text style={[styles.chargeAmount, { color: colors.text }]}>
                  {formatCurrency(charge.amount)}
                </Text>
              </View>
            ))}
          </View>
        </FinanceCard>

        <View style={styles.buttonRow}>
          <View style={styles.buttonWrap}>
            <ThemeButton
              title="Change Plan"
              onPress={() =>
                router.push({
                  pathname: '/(finance)/subscription-add',
                  params: { preset: subscription.id },
                })
              }
              colorBackground={colors.card}
              colorText={colors.text}
              style={[styles.button, styles.outlineButton, { borderColor: colors.border }]}
              textStyle={isSmallPhone ? styles.buttonTextCompact : undefined}
            />
          </View>
          <View style={styles.buttonWrap}>
            <ThemeButton
              title={subscription.status === 'Active' ? 'Pause Subscription' : 'Activate Again'}
              onPress={() =>
                router.push({
                  pathname: '/(finance)/subscription-confirm',
                  params: { id: subscription.id, action: subscription.status === 'Active' ? 'pause' : 'activate' },
                })
              }
              colorBackground={subscription.status === 'Active' ? colors.warning : colors.success}
              colorText={colors.card}
              style={styles.button}
              textStyle={isSmallPhone ? styles.buttonTextCompact : undefined}
            />
          </View>
        </View>

        {subscription.status === 'Active' ? (
          <ThemeButton
            title="Cancel Subscription"
            onPress={() =>
              router.push({
                pathname: '/(finance)/subscription-confirm',
                params: { id: subscription.id, action: 'cancel' },
              })
            }
            colorBackground={hexToRgba(colors.error, 0.12)}
            colorText={colors.error}
          />
        ) : null}
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    marginTop: 18,
    gap: 14,
  },
  heroCard: {
    borderWidth: 1,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  iconShell: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  planLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  planTitle: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '800',
  },
  planBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  priceRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  priceCycle: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  timelineTrack: {
    marginTop: 18,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  timelineValue: {
    height: '100%',
    borderRadius: 999,
  },
  miniCard: {
    width: '100%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 16,
  },
  miniValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  miniLabel: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  infoStack: {
    marginTop: 16,
  },
  infoRow: {
    minHeight: 56,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
  },
  infoLabel: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: '700',
    textAlign: 'right',
  },
  chargeStack: {
    marginTop: 16,
    gap: 12,
  },
  chargeRow: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chargeIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chargeCopy: {
    flex: 1,
    minWidth: 0,
  },
  chargeLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  chargeDate: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  chargeAmount: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  selectorBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  selectorGrid: {
    marginTop: 16,
  },
  selectorCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectorIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorCopy: {
    flex: 1,
    minWidth: 0,
  },
  selectorTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  selectorMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  selectorAmount: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '800',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  buttonWrap: {
    flex: 1,
    minWidth: 0,
  },
  button: {
    width: '100%',
  },
  outlineButton: {
    borderWidth: 1,
  },
  buttonTextCompact: {
    fontSize: 13,
  },
});
