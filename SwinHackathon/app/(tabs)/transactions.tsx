import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  FinanceTransaction,
  budgetCategories,
  overviewStats,
  transactionsSeed,
} from '@/components/home/mock-data';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type FilterKey = 'all' | 'income' | 'expense' | 'pending';

function formatCurrency(value: number) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toFixed(2)}`;
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState(transactionsSeed);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<FinanceTransaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draftType, setDraftType] = useState<'income' | 'expense'>('expense');
  const [draftAmount, setDraftAmount] = useState('');
  const [draftMerchant, setDraftMerchant] = useState('');
  const [draftCategory, setDraftCategory] = useState(budgetCategories[0].name);
  const addSheetTranslateY = useState(new Animated.Value(0))[0];

  const addSheetPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) {
            addSheetTranslateY.setValue(gesture.dy);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 120 || gesture.vy > 1.1) {
            Animated.timing(addSheetTranslateY, {
              toValue: 420,
              duration: 170,
              useNativeDriver: true,
            }).start(() => {
              addSheetTranslateY.setValue(0);
              setShowAddModal(false);
            });
            return;
          }

          Animated.spring(addSheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            speed: 22,
            bounciness: 0,
          }).start();
        },
      }),
    [addSheetTranslateY],
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      if (filter === 'income') return item.type === 'income';
      if (filter === 'expense') return item.type === 'expense';
      if (filter === 'pending') return item.status === 'Pending';
      return true;
    });
  }, [filter, transactions]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce<Record<string, FinanceTransaction[]>>((acc, item) => {
      if (!acc[item.dateLabel]) {
        acc[item.dateLabel] = [];
      }
      acc[item.dateLabel].push(item);
      return acc;
    }, {});
  }, [filteredTransactions]);

  const handleSaveTransaction = () => {
    const parsedAmount = Number(draftAmount.replace(/[^0-9.]/g, ''));

    if (!parsedAmount || !draftMerchant.trim()) {
      return;
    }

    const selectedCategory = budgetCategories.find((item) => item.name === draftCategory);
    const nextTransaction: FinanceTransaction = {
      id: `txn-${Date.now()}`,
      merchant: draftMerchant.trim(),
      category: draftCategory,
      amount: draftType === 'income' ? parsedAmount : -parsedAmount,
      type: draftType,
      status: 'Completed',
      dateLabel: 'Today',
      timeLabel: 'Just now',
      note: 'Created from temporary test modal',
      icon: selectedCategory?.icon ?? 'payments',
      accent: selectedCategory?.accent ?? colors.primaryDark,
    };

    setTransactions((current) => [nextTransaction, ...current]);
    setDraftAmount('');
    setDraftMerchant('');
    setDraftCategory(budgetCategories[0].name);
    setDraftType('expense');
    setShowAddModal(false);
  };

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>My Transactions</Text>
          <Text style={[styles.subtitle, { color: hexToRgba(colors.text, 0.56) }]}>
            Track all money in and out in one place.
          </Text>

          <View
            style={[
              styles.searchRow,
              {
                borderColor: hexToRgba(colors.primaryDark, 0.12),
                backgroundColor: hexToRgba(colors.primaryDark, 0.03),
              },
            ]}
          >
            <MaterialIcons name="search" size={20} color={hexToRgba(colors.text, 0.46)} />
            <Text style={[styles.searchText, { color: hexToRgba(colors.text, 0.42) }]}>
              Search merchant or category
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.58) }]}>
                Income
              </Text>
              <Text style={[styles.summaryValue, { color: colors.primaryDark }]}>
                {formatCurrency(overviewStats.income)}
              </Text>
            </View>

            <View
              style={[
                styles.summaryCard,
                { backgroundColor: hexToRgba(colors.error, 0.08) },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: hexToRgba(colors.text, 0.58) }]}>
                Expenses
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(overviewStats.expenses)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(['all', 'income', 'expense', 'pending'] as const).map((item) => {
            const selected = filter === item;
            const label = item.charAt(0).toUpperCase() + item.slice(1);

            return (
              <Pressable
                key={item}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selected ? colors.primaryDark : colors.card,
                    borderColor: selected
                      ? colors.primaryDark
                      : hexToRgba(colors.primaryDark, 0.1),
                  },
                ]}
                onPress={() => setFilter(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: selected ? colors.card : colors.text },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.listCard, { backgroundColor: colors.card }]}>
          {Object.entries(groupedTransactions).map(([group, items]) => (
            <View key={group} style={styles.groupWrap}>
              <Text style={[styles.groupLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                {group}
              </Text>

              {items.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.transactionRow}
                  onPress={() => setSelectedTransaction(item)}
                >
                  <View
                    style={[
                      styles.transactionIcon,
                      { backgroundColor: hexToRgba(item.accent, 0.12) },
                    ]}
                  >
                    <MaterialIcons name={item.icon} size={20} color={item.accent} />
                  </View>

                  <View style={styles.transactionTextWrap}>
                    <Text style={[styles.transactionMerchant, { color: colors.text }]}>
                      {item.merchant}
                    </Text>
                    <Text style={[styles.transactionMeta, { color: hexToRgba(colors.text, 0.52) }]}>
                      {item.category} • {item.timeLabel}
                    </Text>
                  </View>

                  <View style={styles.amountWrap}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: item.type === 'income' ? colors.primaryDark : colors.text },
                      ]}
                    >
                      {formatCurrency(item.amount)}
                    </Text>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: item.status === 'Pending'
                            ? '#F59E0B'
                            : colors.primaryDark,
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primaryDark }]}
        onPress={() => setShowAddModal(true)}
      >
        <MaterialIcons name="add" size={24} color={colors.card} />
      </Pressable>

      <Modal
        transparent
        animationType="slide"
        visible={selectedTransaction !== null}
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedTransaction(null)} />
          {selectedTransaction ? (
            <View style={[styles.sheet, { backgroundColor: colors.card }]}>
              <View style={[styles.handle, { backgroundColor: hexToRgba(colors.text, 0.16) }]} />
              <Text style={[styles.sheetTitle, styles.sheetTitleSpaced, { color: colors.text }]}>
                Transaction Detail
              </Text>

              <View
                style={[
                  styles.detailIcon,
                  { backgroundColor: hexToRgba(selectedTransaction.accent, 0.12) },
                ]}
              >
                <MaterialIcons
                  name={selectedTransaction.icon}
                  size={24}
                  color={selectedTransaction.accent}
                />
              </View>

              <Text style={[styles.detailMerchant, { color: colors.text }]}>
                {selectedTransaction.merchant}
              </Text>
              <Text style={[styles.detailAmount, { color: colors.text }]}>
                {formatCurrency(selectedTransaction.amount)}
              </Text>

              <View style={styles.detailGrid}>
                <View style={styles.detailCard}>
                  <Text style={[styles.detailLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                    Category
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedTransaction.category}
                  </Text>
                </View>
                <View style={styles.detailCard}>
                  <Text style={[styles.detailLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                    Status
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedTransaction.status}
                  </Text>
                </View>
                <View style={styles.detailCard}>
                  <Text style={[styles.detailLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                    Date
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedTransaction.dateLabel}
                  </Text>
                </View>
                <View style={styles.detailCard}>
                  <Text style={[styles.detailLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                    Time
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedTransaction.timeLabel}
                  </Text>
                </View>
              </View>

              <View style={[styles.noteCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.05) }]}>
                <Text style={[styles.detailLabel, { color: hexToRgba(colors.text, 0.54) }]}>
                  Note
                </Text>
                <Text style={[styles.noteValue, { color: colors.text }]}>
                  {selectedTransaction.note}
                </Text>
              </View>

              <ThemeButton
                title="Close"
                onPress={() => setSelectedTransaction(null)}
                colorBackground={colors.primaryDark}
                colorText={colors.card}
                style={styles.sheetButton}
              />
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowAddModal(false)} />
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                transform: [{ translateY: addSheetTranslateY }],
              },
            ]}
          >
            <View {...addSheetPanResponder.panHandlers}>
              <View style={[styles.handle, { backgroundColor: hexToRgba(colors.text, 0.16) }]} />
              <View style={styles.sheetHeaderRow}>
                <View style={styles.sheetHeaderSpacer} />
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Add Transaction</Text>
                <Pressable style={styles.sheetCloseButton} onPress={() => setShowAddModal(false)}>
                  <MaterialIcons name="close" size={18} color={hexToRgba(colors.text, 0.7)} />
                </Pressable>
              </View>
            </View>

            <ScrollView
              style={styles.addSheetScroll}
              contentContainerStyle={styles.addSheetScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.segmentRow}>
                {(['expense', 'income'] as const).map((item) => {
                  const selected = draftType === item;
                  return (
                    <Pressable
                      key={item}
                      style={[
                        styles.segmentButton,
                        {
                          backgroundColor: selected ? colors.primaryDark : colors.backgroundSoft,
                        },
                      ]}
                      onPress={() => setDraftType(item)}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          { color: selected ? colors.card : colors.text },
                        ]}
                      >
                        {item === 'expense' ? 'Expense' : 'Income'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Amount</Text>
                <TextInput
                  value={draftAmount}
                  onChangeText={setDraftAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={hexToRgba(colors.text, 0.34)}
                  style={[
                    styles.fieldInput,
                    {
                      backgroundColor: colors.backgroundSoft,
                      color: colors.text,
                      borderColor: hexToRgba(colors.primaryDark, 0.08),
                    },
                  ]}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Merchant</Text>
                <TextInput
                  value={draftMerchant}
                  onChangeText={setDraftMerchant}
                  placeholder="Merchant name"
                  placeholderTextColor={hexToRgba(colors.text, 0.34)}
                  style={[
                    styles.fieldInput,
                    {
                      backgroundColor: colors.backgroundSoft,
                      color: colors.text,
                      borderColor: hexToRgba(colors.primaryDark, 0.08),
                    },
                  ]}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Category</Text>
                <View style={styles.categoryWrap}>
                  {budgetCategories.map((item) => {
                    const selected = draftCategory === item.name;
                    return (
                      <Pressable
                        key={item.id}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor: selected ? hexToRgba(item.accent, 0.18) : colors.backgroundSoft,
                            borderColor: selected ? item.accent : 'transparent',
                          },
                        ]}
                        onPress={() => setDraftCategory(item.name)}
                      >
                        <MaterialIcons name={item.icon} size={16} color={item.accent} />
                        <Text style={[styles.categoryChipText, { color: colors.text }]}>
                          {item.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <ThemeButton
                title="Save Transaction"
                onPress={handleSaveTransaction}
                colorBackground={colors.primaryDark}
                colorText={colors.card}
                style={styles.sheetButton}
              />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 66,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerCard: {
    borderRadius: 28,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
  },
  searchRow: {
    marginTop: 18,
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchText: {
    fontSize: 14,
  },
  summaryRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
  },
  filterRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listCard: {
    marginTop: 18,
    borderRadius: 26,
    padding: 18,
  },
  groupWrap: {
    marginTop: 6,
  },
  groupLabel: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  transactionMerchant: {
    fontSize: 15,
    fontWeight: '700',
  },
  transactionMeta: {
    marginTop: 4,
    fontSize: 12,
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.26)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },
  handle: {
    alignSelf: 'center',
    width: 68,
    height: 5,
    borderRadius: 999,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  sheetTitleSpaced: {
    marginTop: 18,
  },
  sheetHeaderRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetHeaderSpacer: {
    width: 34,
    height: 34,
  },
  sheetCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSheetScroll: {
    marginTop: 6,
    maxHeight: 520,
  },
  addSheetScrollContent: {
    paddingBottom: 8,
  },
  detailIcon: {
    alignSelf: 'center',
    marginTop: 18,
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailMerchant: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
  detailAmount: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
  },
  detailGrid: {
    marginTop: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailCard: {
    width: '47%',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#F7FAFF',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailValue: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
  },
  noteCard: {
    marginTop: 18,
    borderRadius: 18,
    padding: 16,
  },
  noteValue: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
  },
  sheetButton: {
    marginTop: 22,
  },
  segmentRow: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 10,
  },
  segmentButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  fieldWrap: {
    marginTop: 18,
  },
  fieldLabel: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  fieldInput: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
