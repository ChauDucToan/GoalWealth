import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { budgetCategories, spendingInsights } from '@/components/home/mock-data';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function InsightsScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
        <Text style={[styles.eyebrow, { color: hexToRgba(colors.card, 0.74) }]}>
          Smart overview
        </Text>
        <Text style={[styles.title, { color: colors.card }]}>
          Your weekly spending is stable and still below the target range.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Activity</Text>
        <View style={styles.chartRow}>
          {spendingInsights.map((item) => (
            <View key={item.label} style={styles.chartColumn}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: 30 + item.value,
                    backgroundColor: item.value > 80
                      ? colors.primaryDark
                      : hexToRgba(colors.primaryDark, 0.2),
                  },
                ]}
              />
              <Text style={[styles.chartLabel, { color: hexToRgba(colors.text, 0.52) }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
        {budgetCategories.map((item) => (
          <View key={item.id} style={styles.categoryRow}>
            <View style={styles.categoryTextWrap}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: hexToRgba(item.accent, 0.12) },
                ]}
              >
                <MaterialIcons name={item.icon} size={18} color={item.accent} />
              </View>
              <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
            </View>
            <Text style={[styles.categoryValue, { color: item.accent }]}>
              ${item.spent.toFixed(0)}
            </Text>
          </View>
        ))}
      </View>

      <ThemeButton
        title="Review budget strategy"
        onPress={() => {}}
        colorBackground={colors.primaryDark}
        colorText={colors.card}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 66,
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 18,
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    marginTop: 10,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
  },
  card: {
    borderRadius: 24,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  chartRow: {
    marginTop: 20,
    height: 150,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartColumn: {
    alignItems: 'center',
  },
  chartBar: {
    width: 24,
    borderRadius: 12,
  },
  chartLabel: {
    marginTop: 10,
    fontSize: 12,
  },
  categoryRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
  },
  categoryValue: {
    fontSize: 15,
    fontWeight: '800',
  },
});
