import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import {
  subscriptionCategories,
  subscriptionCycles,
  subscriptionItems,
  subscriptionPaymentMethods,
  type SubscriptionItem,
  type SubscriptionTone,
} from '@/components/finance/subscription-data';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

function toneColor(colors: ReturnType<typeof useTheme>['colors'], tone: SubscriptionTone) {
  return colors[tone];
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();

  return <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.56) }]}>{children}</Text>;
}

function IconPreview({
  item,
  accent,
}: {
  item: SubscriptionItem;
  accent: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.iconPreview, { backgroundColor: hexToRgba(accent, 0.12) }]}>
      <MaterialIcons name={item.icon} size={24} color={accent} />
      <Text style={[styles.iconPreviewText, { color: colors.text }]}>{item.name}</Text>
    </View>
  );
}

export default function SubscriptionAddScreen() {
  const { colors } = useTheme();
  const { isSmallPhone, scaleFont } = useResponsive();
  const router = useRouter();
  const params = useLocalSearchParams<{ preset?: string }>();
  const preset = params.preset
    ? subscriptionItems.find((item) => item.id === params.preset) ?? null
    : null;
  const editing = Boolean(preset);
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(preset?.id ?? null);
  const selectedSubscription = selectedId
    ? subscriptionItems.find((item) => item.id === selectedId) ?? null
    : null;
  const accent = selectedSubscription ? toneColor(colors, selectedSubscription.tone) : colors.primaryDark;
  const [amount, setAmount] = React.useState(preset ? String(preset.amount) : '');
  const [nextPayment, setNextPayment] = React.useState(
    preset ? (preset.nextPayment === 'Paused' ? 'Jul 04' : preset.nextPayment) : ''
  );
  const [cycle, setCycle] = React.useState(preset?.cycle ?? subscriptionCycles[0]);
  const [category, setCategory] = React.useState(preset?.category ?? '');
  const [paymentMethod, setPaymentMethod] = React.useState(preset?.paymentMethod ?? '');
  const [autoRenew, setAutoRenew] = React.useState(preset?.autoRenew ?? true);
  const filteredItems = subscriptionItems.filter((item) =>
    item.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <FinanceScreen
      title={editing ? 'Edit Plan' : 'Add Plan'}
      subtitle="Choose the service and billing setup for this recurring plan"
    >
      <View style={styles.stack}>
        <FinanceCard
          style={[
            styles.heroCard,
            {
              backgroundColor: hexToRgba(accent, 0.12),
              borderColor: hexToRgba(accent, 0.16),
            },
          ]}
        >
          <View style={[styles.heroHeader, isSmallPhone && styles.heroHeaderCompact]}>
            <View style={styles.heroCopy}>
              <View style={[styles.heroBadge, { backgroundColor: colors.card }]}>
                <MaterialIcons name="subscriptions" size={16} color={accent} />
                <Text style={[styles.heroBadgeText, { color: accent }]}>
                  {editing ? 'Plan details' : selectedSubscription ? 'Plan selected' : 'Choose a plan'}
                </Text>
              </View>
              <Text
                style={[
                  styles.heroTitle,
                  {
                    color: colors.text,
                    fontSize: scaleFont(isSmallPhone ? 24 : 28, 0.7),
                    lineHeight: isSmallPhone ? 30 : 34,
                  },
                ]}
              >
                {selectedSubscription ? selectedSubscription.name : 'Choose a subscription'}
              </Text>
              <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.58) }]}>
                {editing
                  ? 'Adjust the billing settings so this plan stays easy to manage.'
                  : selectedSubscription
                    ? 'Review the billing details below, then save this plan into your recurring list.'
                    : 'Pick a service below first, then complete the billing details for that plan.'}
              </Text>
            </View>

            <View
              style={[
                styles.priceChip,
                isSmallPhone && styles.priceChipCompact,
                { backgroundColor: colors.card },
              ]}
            >
              <Text style={[styles.priceValue, { color: colors.text }]}>
                {selectedSubscription ? `$${amount || '0.00'}` : 'Select'}
              </Text>
              <Text style={[styles.priceMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                {selectedSubscription ? `every ${cycle === 'Monthly' ? 'month' : 'year'}` : 'a plan first'}
              </Text>
            </View>
          </View>

          <ResponsiveGrid
            minItemWidth={isSmallPhone ? 112 : 118}
            horizontalPadding={isSmallPhone ? 12 : 34}
            gap={10}
            maxColumns={isSmallPhone ? 2 : 3}
            style={styles.heroMiniGrid}
          >
            <View style={[styles.heroMiniCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMiniValue, { color: colors.text }]}>
                {selectedSubscription ? nextPayment : 'Choose'}
              </Text>
              <Text style={[styles.heroMiniLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                Next payment
              </Text>
            </View>
            <View style={[styles.heroMiniCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMiniValue, { color: colors.text }]}>
                {category || 'Select'}
              </Text>
              <Text style={[styles.heroMiniLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                Category
              </Text>
            </View>
            <View style={[styles.heroMiniCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMiniValue, { color: selectedSubscription ? accent : colors.primaryDark }]}>
                {selectedSubscription ? (autoRenew ? 'Auto' : 'Manual') : 'Pending'}
              </Text>
              <Text style={[styles.heroMiniLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                Renewal
              </Text>
            </View>
          </ResponsiveGrid>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose service</Text>
          <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Search and pick the service tile that best matches the subscription you want to track.
          </Text>

          <View
            style={[
              styles.searchWrap,
              {
                backgroundColor: colors.backgroundSoft,
                borderColor: colors.border,
              },
            ]}
          >
            <MaterialIcons name="search" size={18} color={hexToRgba(colors.text, 0.42)} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search plan or service"
              placeholderTextColor={hexToRgba(colors.text, 0.36)}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>

          <ResponsiveGrid
            minItemWidth={isSmallPhone ? 240 : 146}
            horizontalPadding={isSmallPhone ? 18 : 36}
            gap={10}
            maxColumns={isSmallPhone ? 1 : 2}
            style={styles.serviceGrid}
          >
            {filteredItems.length ? (
              filteredItems.map((item) => {
                const itemAccent = toneColor(colors, item.tone);
                const selected = item.id === selectedId;

                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.serviceCard,
                      {
                        backgroundColor: selected ? hexToRgba(itemAccent, 0.12) : colors.backgroundSoft,
                        borderColor: selected ? itemAccent : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedId(item.id);
                      setAmount(String(item.amount));
                      setNextPayment(item.nextPayment === 'Paused' ? 'Jul 04' : item.nextPayment);
                      setCycle(item.cycle);
                      setCategory(item.category);
                      setPaymentMethod(item.paymentMethod);
                      setAutoRenew(item.autoRenew);
                    }}
                  >
                    <IconPreview item={item} accent={itemAccent} />
                    <Text style={[styles.servicePlan, { color: hexToRgba(colors.text, 0.56) }]}>
                      {item.plan}
                    </Text>
                  </Pressable>
                );
              })
            ) : (
              <View
                style={[
                  styles.serviceEmptyCard,
                  {
                    backgroundColor: colors.backgroundSoft,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.serviceEmptyIcon,
                    { backgroundColor: hexToRgba(colors.warning, 0.14) },
                  ]}
                >
                  <MaterialIcons name="search-off" size={24} color={colors.warning} />
                </View>
                <Text style={[styles.serviceEmptyTitle, { color: colors.text }]}>
                  No matching service found
                </Text>
                <Text style={[styles.serviceEmptyBody, { color: hexToRgba(colors.text, 0.56) }]}>
                  Try another keyword or clear the search to browse the sample plans available in this demo.
                </Text>
                <ThemeButton
                  title="Clear Search"
                  onPress={() => setSearch('')}
                  colorBackground={colors.primaryDark}
                  colorText={colors.card}
                  style={styles.serviceEmptyButton}
                />
              </View>
            )}
          </ResponsiveGrid>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Subscription setup</Text>

          <ResponsiveGrid
            minItemWidth={isSmallPhone ? 240 : 150}
            horizontalPadding={isSmallPhone ? 18 : 36}
            gap={12}
            maxColumns={isSmallPhone ? 1 : 2}
            style={styles.formGrid}
          >
            <View style={styles.fieldBlock}>
              <FieldLabel>Amount</FieldLabel>
              <View
                style={[
                  styles.inputShell,
                  { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.prefix, { color: hexToRgba(colors.text, 0.56) }]}>$</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={hexToRgba(colors.text, 0.34)}
                  style={[styles.inlineInput, { color: colors.text }]}
                />
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <FieldLabel>Next payment due</FieldLabel>
              <View
                style={[
                  styles.inputShell,
                  { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
                ]}
              >
                <MaterialIcons name="calendar-month" size={18} color={hexToRgba(colors.text, 0.48)} />
                <TextInput
                  value={nextPayment}
                  onChangeText={setNextPayment}
                  placeholder="Jun 28"
                  placeholderTextColor={hexToRgba(colors.text, 0.34)}
                  style={[styles.inlineInput, { color: colors.text }]}
                />
              </View>
            </View>
          </ResponsiveGrid>

          <View style={styles.fieldBlock}>
            <FieldLabel>Billing cycle</FieldLabel>
            <View style={styles.optionRow}>
              {subscriptionCycles.map((item) => {
                const selected = item === cycle;
                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: selected ? accent : colors.backgroundSoft,
                        borderColor: selected ? accent : colors.border,
                      },
                    ]}
                    onPress={() => setCycle(item)}
                  >
                    <Text style={[styles.optionText, { color: selected ? colors.card : colors.text }]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel>Category</FieldLabel>
            <View style={styles.optionRow}>
              {subscriptionCategories.map((item) => {
                const selected = item === category;
                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: selected ? hexToRgba(accent, 0.12) : colors.backgroundSoft,
                        borderColor: selected ? accent : colors.border,
                      },
                    ]}
                    onPress={() => setCategory(item)}
                  >
                    <Text style={[styles.optionText, { color: selected ? accent : colors.text }]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel>Payment method</FieldLabel>
            <View style={styles.optionRow}>
              {subscriptionPaymentMethods.map((item) => {
                const selected = item === paymentMethod;
                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: selected ? hexToRgba(colors.primaryDark, 0.12) : colors.backgroundSoft,
                        borderColor: selected ? colors.primaryDark : colors.border,
                      },
                    ]}
                    onPress={() => setPaymentMethod(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: selected ? colors.primaryDark : colors.text },
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel>Renewal settings</FieldLabel>
            <View style={styles.switchStack}>
              <View style={styles.switchRow}>
                <View
                  style={styles.switchCopy}
                >
                  <Text style={[styles.switchTitle, { color: colors.text }]}>Auto renew</Text>
                  <Text style={[styles.switchBody, { color: hexToRgba(colors.text, 0.56) }]}>
                    Continue the subscription every cycle until you pause or cancel it.
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.switchTrack,
                    {
                      backgroundColor: autoRenew ? accent : hexToRgba(colors.text, 0.16),
                    },
                  ]}
                  onPress={() => setAutoRenew((value) => !value)}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      {
                        backgroundColor: colors.card,
                        transform: [{ translateX: autoRenew ? 16 : 0 }],
                      },
                    ]}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard
          style={[
            styles.summaryCard,
            {
              backgroundColor: hexToRgba(accent, 0.08),
              borderColor: hexToRgba(accent, 0.12),
            },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Subscription Preview</Text>
          <Text style={[styles.summaryBody, { color: hexToRgba(colors.text, 0.72) }]}>
            {selectedSubscription
              ? 'A compact preview of the plan you are about to save.'
              : 'Select a plan above, then complete the core billing fields before saving.'}
          </Text>

          {selectedSubscription ? (
            <View
              style={[
                styles.previewCard,
                { backgroundColor: colors.card, borderColor: hexToRgba(accent, 0.14) },
              ]}
            >
              <View style={styles.previewHeader}>
                <View style={[styles.previewIconWrap, { backgroundColor: hexToRgba(accent, 0.12) }]}>
                  <MaterialIcons name={selectedSubscription.icon} size={22} color={accent} />
                </View>
                <View style={styles.previewCopy}>
                  <Text style={[styles.previewTitle, { color: colors.text }]}>
                    {selectedSubscription.name}
                  </Text>
                  <Text style={[styles.previewMeta, { color: hexToRgba(colors.text, 0.56) }]}>
                    {selectedSubscription.plan} • {category || 'Choose category'}
                  </Text>
                </View>
                <View style={[styles.previewAmountPill, { backgroundColor: hexToRgba(accent, 0.1) }]}>
                  <Text style={[styles.previewAmountValue, { color: accent }]}>{`$${amount || '0.00'}`}</Text>
                </View>
              </View>

              <View style={styles.previewPillRow}>
                <View style={[styles.previewPill, { backgroundColor: colors.backgroundSoft }]}>
                  <MaterialIcons name="event-repeat" size={14} color={accent} />
                  <Text style={[styles.previewPillText, { color: colors.text }]}>{cycle}</Text>
                </View>
                <View style={[styles.previewPill, { backgroundColor: colors.backgroundSoft }]}>
                  <MaterialIcons name="calendar-month" size={14} color={colors.primaryDark} />
                  <Text style={[styles.previewPillText, { color: colors.text }]}>
                    {nextPayment || 'Pick due date'}
                  </Text>
                </View>
                <View style={[styles.previewPill, { backgroundColor: colors.backgroundSoft }]}>
                  <MaterialIcons name="credit-card" size={14} color={colors.primaryDark} />
                  <Text style={[styles.previewPillText, { color: colors.text }]}>
                    {paymentMethod || 'Choose payment'}
                  </Text>
                </View>
              </View>

              <View style={[styles.previewNotice, { backgroundColor: hexToRgba(colors.success, 0.08) }]}>
                <MaterialIcons name="check-circle" size={16} color={colors.success} />
                <Text style={[styles.previewNoticeText, { color: hexToRgba(colors.text, 0.7) }]}>
                  {autoRenew
                    ? 'Auto renew is enabled for this subscription.'
                    : 'Manual renewal is enabled for this subscription.'}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.summaryActions}>
            <View style={styles.summaryButtonWrap}>
              <ThemeButton
                title={editing ? 'Save Changes' : 'Save Plan'}
                onPress={() => {
                  if (!selectedSubscription) {
                    return;
                  }

                  router.replace({
                    pathname: '/(finance)/subscription-result',
                    params: {
                      id: selectedSubscription.id,
                      mode: editing ? 'updated' : 'added',
                    },
                  });
                }}
                colorBackground={colors.success}
                colorText={colors.card}
                style={styles.summaryButton}
                textStyle={isSmallPhone ? styles.summaryButtonTextCompact : undefined}
                disabled={!selectedSubscription}
              />
            </View>
            <View style={styles.summaryButtonWrap}>
              <ThemeButton
                title="Cancel"
                onPress={() => router.back()}
                colorBackground={colors.card}
                colorText={colors.text}
                style={[styles.summaryButton, styles.summaryOutline, { borderColor: colors.border }]}
                textStyle={isSmallPhone ? styles.summaryButtonTextCompact : undefined}
              />
            </View>
          </View>
        </FinanceCard>
      </View>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginTop: 18,
    gap: 14,
  },
  heroCard: {
    borderWidth: 1,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
    flexWrap: 'wrap',
  },
  heroHeaderCompact: {
    flexDirection: 'column',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroBadgeText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  heroTitle: {
    marginTop: 14,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  heroBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  priceChip: {
    minWidth: 146,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  priceChipCompact: {
    width: '100%',
    minWidth: 0,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  priceMeta: {
    marginTop: 4,
    fontSize: Typography.body,
    lineHeight: 18,
  },
  heroMiniCard: {
    width: '100%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  heroMiniGrid: {
    marginTop: 16,
  },
  heroMiniValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  heroMiniLabel: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  searchWrap: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: Typography.body,
    paddingVertical: 12,
  },
  serviceGrid: {
    marginTop: 16,
  },
  serviceEmptyCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  serviceEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceEmptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  serviceEmptyBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 20,
    textAlign: 'center',
  },
  serviceEmptyButton: {
    width: '100%',
    marginTop: 18,
  },
  serviceCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },
  iconPreview: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconPreviewText: {
    flex: 1,
    minWidth: 0,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  servicePlan: {
    fontSize: 12,
    fontWeight: '600',
  },
  formGrid: {
    marginTop: 16,
  },
  fieldBlock: {
    marginTop: 16,
  },
  fieldLabel: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputShell: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prefix: {
    fontSize: 18,
    fontWeight: '700',
  },
  inlineInput: {
    flex: 1,
    minWidth: 0,
    fontSize: Typography.body,
    paddingVertical: 12,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  optionText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  textAreaShell: {
    minHeight: 116,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 88,
    fontSize: Typography.body,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  switchStack: {
    marginTop: 20,
  },
  switchRow: {
    minHeight: 72,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
  },
  switchCopy: {
    flex: 1,
    minWidth: 0,
  },
  switchTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  switchBody: {
    marginTop: 4,
    fontSize: Typography.body,
    lineHeight: 19,
  },
  switchTrack: {
    width: 44,
    height: 28,
    borderRadius: 999,
    padding: 3,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  summaryCard: {
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 21,
  },
  previewCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCopy: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  previewMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  previewAmountPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewAmountValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  previewPillRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  previewPill: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewNotice: {
    marginTop: 14,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  previewNoticeText: {
    flex: 1,
    minWidth: 0,
    fontSize: Typography.body,
    lineHeight: 19,
  },
  summaryActions: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryButtonWrap: {
    flex: 1,
    minWidth: 0,
  },
  summaryButton: {
    width: '100%',
  },
  summaryOutline: {
    borderWidth: 1,
  },
  summaryButtonTextCompact: {
    fontSize: 13,
  },
});
