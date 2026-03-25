import { hexToRgba } from '@/components/auth/AuthKit';
import {
  getSubscriptionById,
  subscriptionCategories,
  subscriptionCycles,
  subscriptionPaymentMethods,
  subscriptionServices,
} from '@/components/finance/subscription-data';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { ColorTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

export default function SubscriptionAddScreen() {
  const { preset } = useLocalSearchParams<{ preset?: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const presetItem = getSubscriptionById(preset);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(presetItem.id);
  const [amount, setAmount] = useState(String(presetItem.amount));
  const [nextPayment, setNextPayment] = useState(presetItem.nextPayment);
  const [cycle, setCycle] = useState(presetItem.cycle);
  const [category, setCategory] = useState(presetItem.category);
  const [paymentMethod, setPaymentMethod] = useState(presetItem.paymentMethod);
  const [couponCode, setCouponCode] = useState('FIRSTINFO20');
  const [notes, setNotes] = useState(presetItem.description);
  const [autoRenew, setAutoRenew] = useState(presetItem.autoRenew);
  const [smartReminder, setSmartReminder] = useState(true);
  const projectedYearly = Number(amount || 0) * (cycle === 'Yearly' ? 1 : cycle === 'Bi-Monthly' ? 6 : cycle === 'Weekly' ? 52 : 12);

  const filteredServices = subscriptionServices.filter((item) =>
    item.service.toLowerCase().includes(search.toLowerCase())
  );
  const selectedService = subscriptionServices.find((item) => item.id === selectedId) ?? subscriptionServices[0];

  return (
    <FinanceScreen
      title={preset ? 'Edit Subscription' : 'Add New Subscription'}
      subtitle={preset ? 'Update billing details, reminders and payment setup.' : 'Create a recurring subscription entry with category and reminder details.'}
      contentStyle={styles.contentStyle}
    >
      <View style={styles.stack}>
        <FinanceCard style={[styles.heroCard, { backgroundColor: hexToRgba(selectedService.accent, 0.1) }]}> 
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: selectedService.accent }]}>
              <MaterialIcons name={selectedService.icon} size={22} color={colors.card} />
            </View>
            <View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>{selectedService.service}</Text>
              <Text style={[styles.heroMeta, { color: hexToRgba(colors.text, 0.56) }]}>{category} • {cycle}</Text>
            </View>
          </View>
          <Text style={[styles.heroAmount, { color: colors.text }]}>{formatCurrency(Number(amount || 0))}</Text>
          <View style={styles.heroMetaRow}>
            <View style={[styles.heroMetaPill, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMetaLabel, { color: hexToRgba(colors.text, 0.5) }]}>Yearly projection</Text>
              <Text style={[styles.heroMetaValue, { color: colors.text }]}>{formatCurrency(projectedYearly)}</Text>
            </View>
            <View style={[styles.heroMetaPill, { backgroundColor: colors.card }]}>
              <Text style={[styles.heroMetaLabel, { color: hexToRgba(colors.text, 0.5) }]}>Reminder mode</Text>
              <Text style={[styles.heroMetaValue, { color: colors.text }]}>{smartReminder ? 'Smart on' : 'Off'}</Text>
            </View>
          </View>
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose service</Text>
          <View style={[styles.searchRow, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}> 
            <MaterialIcons name="search" size={18} color={hexToRgba(colors.text, 0.5)} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search subscription service"
              placeholderTextColor={hexToRgba(colors.text, 0.4)}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>

          {filteredServices.length === 0 ? (
            <View style={[styles.emptyPanel, { backgroundColor: hexToRgba(colors.primaryDark, 0.06) }]}> 
              <MaterialIcons name="search-off" size={30} color={colors.primaryDark} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Search not found</Text>
              <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.56) }]}>Try a different keyword or keep the current service selection.</Text>
            </View>
          ) : (
            <View style={styles.serviceGrid}>
              {filteredServices.map((item) => {
                const active = item.id === selectedId;
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.serviceCard, { backgroundColor: active ? hexToRgba(item.accent, 0.1) : colors.card, borderColor: active ? item.accent : colors.border }]}
                    onPress={() => {
                      setSelectedId(item.id);
                      setAmount(String(item.amount));
                    }}
                  >
                    <View style={[styles.serviceBadge, { backgroundColor: hexToRgba(item.accent, 0.14) }]}>
                      <MaterialIcons name={item.icon} size={18} color={item.accent} />
                    </View>
                    <Text style={[styles.serviceName, { color: colors.text }]}>{item.shortLabel}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </FinanceCard>

        <FinanceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Billing details</Text>
          <View style={styles.formStack}>
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.52) }]}>Amount</Text>
              <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft }]} />
            </View>
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.52) }]}>Next payment due</Text>
              <TextInput value={nextPayment} onChangeText={setNextPayment} style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft }]} />
            </View>
          </View>

          <Text style={[styles.subLabel, { color: hexToRgba(colors.text, 0.52) }]}>Billing cycle</Text>
          <View style={styles.optionWrap}>
            {subscriptionCycles.map((item) => (
              <Pressable key={item} style={[styles.optionChip, { backgroundColor: cycle === item ? hexToRgba(colors.primaryDark, 0.1) : colors.card, borderColor: cycle === item ? colors.primaryDark : colors.border }]} onPress={() => setCycle(item)}>
                <Text style={[styles.optionChipText, { color: cycle === item ? colors.primaryDark : colors.text }]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.subLabel, { color: hexToRgba(colors.text, 0.52) }]}>Category</Text>
          <View style={styles.optionWrap}>
            {subscriptionCategories.map((item) => (
              <Pressable key={item} style={[styles.optionChip, { backgroundColor: category === item ? hexToRgba(colors.primaryDark, 0.1) : colors.card, borderColor: category === item ? colors.primaryDark : colors.border }]} onPress={() => setCategory(item)}>
                <Text style={[styles.optionChipText, { color: category === item ? colors.primaryDark : colors.text }]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.subLabel, { color: hexToRgba(colors.text, 0.52) }]}>Payment method</Text>
          <View style={styles.paymentStack}>
            {subscriptionPaymentMethods.map((item) => (
              <Pressable key={item} style={[styles.paymentRow, { backgroundColor: paymentMethod === item ? hexToRgba(colors.primaryDark, 0.08) : colors.backgroundSoft, borderColor: paymentMethod === item ? colors.primaryDark : colors.border }]} onPress={() => setPaymentMethod(item)}>
                <Text style={[styles.paymentText, { color: colors.text }]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.formStack}>
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.52) }]}>Coupon code</Text>
              <TextInput value={couponCode} onChangeText={setCouponCode} style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft }]} />
            </View>
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.52) }]}>Description</Text>
              <TextInput value={notes} onChangeText={setNotes} multiline style={[styles.fieldInput, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSoft }]} />
            </View>
          </View>

          <View style={styles.toggleStack}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleTitle, { color: colors.text }]}>Auto renew</Text>
                <Text style={[styles.toggleBody, { color: hexToRgba(colors.text, 0.56) }]}>Keep the plan active until manually cancelled.</Text>
              </View>
              <Switch value={autoRenew} onValueChange={setAutoRenew} trackColor={{ true: colors.primaryDark, false: colors.border }} />
            </View>
            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleTitle, { color: colors.text }]}>Smart reminder</Text>
                <Text style={[styles.toggleBody, { color: hexToRgba(colors.text, 0.56) }]}>Remind before payment and failed renewal events.</Text>
              </View>
              <Switch value={smartReminder} onValueChange={setSmartReminder} trackColor={{ true: colors.primaryDark, false: colors.border }} />
            </View>
          </View>
        </FinanceCard>

        <FinanceCard style={[styles.previewCard, { backgroundColor: hexToRgba(selectedService.accent, 0.08) }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preview</Text>
          <Text style={[styles.previewTitle, { color: colors.text }]}>{selectedService.service}</Text>
          <Text style={[styles.previewBody, { color: hexToRgba(colors.text, 0.56) }]}>{formatCurrency(Number(amount || 0))} • {cycle} • {paymentMethod}</Text>
          <View style={styles.previewFooter}>
            <View style={[styles.previewStat, { backgroundColor: colors.card }]}>
              <Text style={[styles.previewStatLabel, { color: hexToRgba(colors.text, 0.5) }]}>Coupon</Text>
              <Text style={[styles.previewStatValue, { color: colors.text }]}>{couponCode || 'None'}</Text>
            </View>
            <View style={[styles.previewStat, { backgroundColor: colors.card }]}>
              <Text style={[styles.previewStatLabel, { color: hexToRgba(colors.text, 0.5) }]}>Renewal</Text>
              <Text style={[styles.previewStatValue, { color: colors.text }]}>{autoRenew ? 'Auto' : 'Manual'}</Text>
            </View>
          </View>
        </FinanceCard>

        <Pressable style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]} onPress={() => router.push({ pathname: '/(finance)/subscription-result', params: { mode: preset ? 'updated' : 'added', id: selectedId } })}>
          <Text style={[styles.primaryButtonText, { color: colors.card }]}>{preset ? 'Save subscription' : 'Create subscription'}</Text>
        </Pressable>
      </View>
    </FinanceScreen>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    contentStyle: { paddingBottom: 28 },
    stack: { marginTop: 18, gap: 16 },
    heroCard: { borderWidth: 0 },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    heroIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    heroTitle: { fontSize: 16, fontWeight: '800' },
    heroMeta: { marginTop: 4, fontSize: 12, fontWeight: '600' },
    heroAmount: { marginTop: 18, fontSize: 30, fontWeight: '900' },
    heroMetaRow: { marginTop: 16, flexDirection: 'row', gap: 10 },
    heroMetaPill: { flex: 1, borderRadius: 16, padding: 12 },
    heroMetaLabel: { fontSize: 11, fontWeight: '700' },
    heroMetaValue: { marginTop: 5, fontSize: 13, fontWeight: '800' },
    sectionTitle: { fontSize: 15, fontWeight: '800' },
    searchRow: { marginTop: 16, borderWidth: 1, borderRadius: 18, minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
    searchInput: { flex: 1, fontSize: 13, fontWeight: '600' },
    emptyPanel: { marginTop: 16, borderRadius: 22, padding: 18, alignItems: 'center' },
    emptyTitle: { marginTop: 10, fontSize: 15, fontWeight: '800' },
    emptyBody: { marginTop: 6, fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: '500' },
    serviceGrid: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    serviceCard: { width: '31%', borderWidth: 1, borderRadius: 18, paddingVertical: 14, alignItems: 'center', gap: 8 },
    serviceBadge: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    serviceName: { fontSize: 12, fontWeight: '700' },
    formStack: { marginTop: 16, gap: 12 },
    fieldBlock: { gap: 0 },
    fieldLabel: { marginBottom: 8, fontSize: 12, fontWeight: '700' },
    fieldInput: { minHeight: 46, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, fontSize: 13, fontWeight: '600' },
    textArea: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
    subLabel: { marginTop: 18, fontSize: 12, fontWeight: '700' },
    optionWrap: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    optionChip: { borderWidth: 1, borderRadius: 16, minHeight: 40, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
    optionChipText: { fontSize: 12, fontWeight: '700' },
    paymentStack: { marginTop: 10, gap: 10 },
    paymentRow: { borderWidth: 1, borderRadius: 16, minHeight: 42, paddingHorizontal: 14, justifyContent: 'center' },
    paymentText: { fontSize: 12, fontWeight: '700' },
    toggleStack: { marginTop: 18, gap: 14 },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
    toggleTitle: { fontSize: 13, fontWeight: '800' },
    toggleBody: { marginTop: 4, fontSize: 11, lineHeight: 17, fontWeight: '500', maxWidth: 210 },
    previewCard: { borderWidth: 0 },
    previewTitle: { marginTop: 14, fontSize: 16, fontWeight: '800' },
    previewBody: { marginTop: 6, fontSize: 12, fontWeight: '600' },
    previewFooter: { marginTop: 16, flexDirection: 'row', gap: 10 },
    previewStat: { flex: 1, borderRadius: 16, padding: 12 },
    previewStatLabel: { fontSize: 11, fontWeight: '700' },
    previewStatValue: { marginTop: 4, fontSize: 12, fontWeight: '800' },
    primaryButton: { minHeight: 50, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
