import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { formatCurrency } from '@/components/finance/finance-utils';
import { getSubscriptionPayments } from '@/components/finance/subscription-data';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SubscriptionPaymentsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const payments = getSubscriptionPayments();
  const filteredPayments = payments.filter((item) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return [item.subscriptionName, item.plan, item.paymentMethod].some((value) =>
      value.toLowerCase().includes(keyword)
    );
  });

  return (
    <FinanceScreen
      title="My Payments"
      subtitle="Search recent subscription payments and review recurring billing history"
    >
      <View style={styles.stack}>
        <FinanceCard>
          <View
            style={[
              styles.searchWrap,
              { backgroundColor: colors.backgroundSoft, borderColor: colors.border },
            ]}
          >
            <MaterialIcons name="search" size={18} color={hexToRgba(colors.text, 0.42)} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search subscription or service"
              placeholderTextColor={hexToRgba(colors.text, 0.36)}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>

          {filteredPayments.length ? (
            <View style={styles.listStack}>
              {filteredPayments.map((item) => {
                const accent = colors[item.tone];

                return (
                  <Pressable
                    key={`${item.subscriptionId}-${item.id}`}
                    style={[
                      styles.paymentRow,
                      {
                        backgroundColor: colors.backgroundSoft,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: '/(finance)/subscription/[id]',
                        params: { id: item.subscriptionId },
                      })
                    }
                  >
                    <View style={[styles.iconWrap, { backgroundColor: hexToRgba(accent, 0.12) }]}>
                      <MaterialIcons name={item.icon} size={18} color={accent} />
                    </View>
                    <View style={styles.paymentCopy}>
                      <Text style={[styles.paymentTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.subscriptionName}
                      </Text>
                      <Text style={[styles.paymentMeta, { color: hexToRgba(colors.text, 0.56) }]} numberOfLines={1}>
                        {item.label} • {item.date} • {item.paymentMethod}
                      </Text>
                    </View>
                    <View style={styles.paymentAside}>
                      <Text style={[styles.paymentAmount, { color: colors.text }]}>
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text
                        style={[
                          styles.paymentStatus,
                          {
                            color: item.status === 'Paid' ? colors.success : colors.warning,
                          },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.backgroundSoft }]}>
              <MaterialIcons name="search-off" size={32} color={colors.warning} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Result not found</Text>
              <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.56) }]}>
                Try another keyword to find the payment or subscription you are looking for.
              </Text>
              <ThemeButton
                title="Clear Search"
                onPress={() => setSearch('')}
                colorBackground={colors.primaryDark}
                colorText={colors.card}
                style={styles.emptyButton}
              />
            </View>
          )}
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
  searchWrap: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
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
  listStack: {
    marginTop: 16,
    gap: 12,
  },
  paymentRow: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCopy: {
    flex: 1,
    minWidth: 0,
  },
  paymentTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  paymentMeta: {
    marginTop: 4,
    fontSize: Typography.body,
  },
  paymentAside: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentAmount: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyBody: {
    marginTop: 6,
    fontSize: Typography.body,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    width: '100%',
  },
});
