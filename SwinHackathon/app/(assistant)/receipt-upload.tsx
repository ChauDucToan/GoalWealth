import { ThemeButton } from '@/components/ThemeButton';
import { AssistantCard, AssistantScreen } from '@/components/assistant/AssistantScaffold';
import { hexToRgba } from '@/components/auth/AuthKit';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const recentReceipts = [
  { id: 'r1', title: 'FreshMart Grocery', amount: '$88.00', icon: 'shopping-bag' },
  { id: 'r2', title: 'Home Utilities', amount: '$124.00', icon: 'bolt' },
  { id: 'r3', title: 'Metro Transit', amount: '$14.50', icon: 'directions-bus' },
  { id: 'r4', title: 'Coffee Subscription', amount: '$9.99', icon: 'local-cafe' },
] as const;

const importSources: {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}[] = [
  { label: 'Take photo', icon: 'photo-camera' },
  { label: 'Browse files', icon: 'folder-open' },
  { label: 'Gallery', icon: 'collections' },
];

export default function ReceiptUploadScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { selectAssistantScenario } = useAssistant();

  return (
    <AssistantScreen
      title="Receipt Upload"
      subtitle="Upload a receipt, scan it, then send the extracted result back into chat"
    >
      <View style={styles.stack}>
        <AssistantCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
          <View
            style={[
              styles.heroBadge,
              { backgroundColor: hexToRgba(colors.card, 0.14) },
            ]}
          >
            <MaterialIcons name="receipt-long" size={16} color={colors.card} />
            <Text style={[styles.heroBadgeText, { color: colors.card }]}>Receipt OCR</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.card }]}>Add your latest bill or receipt</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.8) }]}>
            Finpal can extract merchant, amount, date and suggest a category.
          </Text>
          <View style={styles.heroActions}>
            <ThemeButton
              title="Start demo scan"
              onPress={() => router.push('/(assistant)/receipt-scan')}
              colorBackground={colors.card}
              colorText={colors.primaryDark}
              style={styles.heroButton}
            />
            <ThemeButton
              title="Use demo result"
              onPress={() => {
                selectAssistantScenario('receipt');
                router.replace({
                  pathname: '/(assistant)/chat/[scenario]',
                  params: { scenario: 'receipt' },
                });
              }}
              colorBackground={hexToRgba(colors.card, 0.14)}
              colorText={colors.card}
              style={[styles.heroButton, styles.heroOutline]}
            />
          </View>
        </AssistantCard>

        <AssistantCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Import source</Text>
          <View style={styles.sourceGrid}>
            {importSources.map((item) => (
              <Pressable
                key={item.label}
                style={[
                  styles.sourceCard,
                  { backgroundColor: colors.backgroundSoft },
                ]}
                onPress={() => router.push('/(assistant)/receipt-scan')}
              >
                <View
                  style={[
                    styles.sourceIcon,
                    { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
                  ]}
                >
                  <MaterialIcons name={item.icon} size={20} color={colors.primaryDark} />
                </View>
                <Text style={[styles.sourceText, { color: colors.text }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </AssistantCard>

        <AssistantCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent receipts</Text>
          <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Demo tiles to mirror the uploaded history state from the design board.
          </Text>

          <View style={styles.receiptGrid}>
            {recentReceipts.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.receiptCard, { backgroundColor: colors.backgroundSoft }]}
                onPress={() => router.push('/(assistant)/receipt-scan')}
              >
                <View
                  style={[
                    styles.receiptIcon,
                    { backgroundColor: hexToRgba(colors.success, 0.14) },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={18}
                    color={colors.success}
                  />
                </View>
                <Text style={[styles.receiptTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.receiptAmount, { color: colors.primaryDark }]}>
                  {item.amount}
                </Text>
              </Pressable>
            ))}
          </View>
        </AssistantCard>
      </View>
    </AssistantScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginTop: 18,
    gap: 16,
  },
  heroCard: {
    borderWidth: 0,
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
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    marginTop: 18,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  heroBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
  },
  heroActions: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  heroButton: {
    flex: 1,
  },
  heroOutline: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  sourceGrid: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  sourceCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    gap: 12,
  },
  sourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  receiptGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  receiptCard: {
    width: '47%',
    borderRadius: 20,
    padding: 14,
  },
  receiptIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
  },
  receiptAmount: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
  },
});
