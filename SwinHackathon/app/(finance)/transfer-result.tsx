import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TransferResultScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { amount, recipient, status, transactionId } = useLocalSearchParams<{
    amount: string;
    recipient: string;
    status: 'success' | 'failed';
    transactionId?: string;
  }>();

  const success = status === 'success';

  return (
    <View style={[styles.screen, { backgroundColor: colors.card }]}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: success
              ? hexToRgba(colors.primaryDark, 0.12)
              : hexToRgba(colors.error, 0.12),
          },
        ]}
      >
        <MaterialIcons
          name={success ? 'check-circle' : 'cancel'}
          size={36}
          color={success ? colors.primaryDark : colors.error}
        />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {success ? 'Transaction Complete!' : 'Unable to process transaction'}
      </Text>
      <Text style={[styles.amount, { color: colors.text }]}>${amount}</Text>
      <Text style={[styles.body, { color: hexToRgba(colors.text, 0.56) }]}>
        {success
          ? `Your transfer to ${recipient} was sent successfully.`
          : `This transfer to ${recipient} could not be completed in test mode.`}
      </Text>

      <View style={styles.buttons}>
        {success && transactionId ? (
          <ThemeButton
            title="Open Details"
            onPress={() =>
              router.replace({
                pathname: '/(finance)/transaction/[id]',
                params: { id: transactionId },
              })
            }
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.button}
          />
        ) : (
          <ThemeButton
            title="Try Again Later"
            onPress={() => router.replace('/(finance)/send-money')}
            colorBackground={colors.primaryDark}
            colorText={colors.card}
            style={styles.button}
          />
        )}

        <ThemeButton
          title={success ? 'Back to transactions' : 'Cancel'}
          onPress={() => router.replace('/(tabs)/transactions')}
          colorBackground={colors.backgroundSoft}
          colorText={colors.text}
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
  badge: {
    width: 92,
    height: 92,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 22,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  amount: {
    marginTop: 16,
    fontSize: 34,
    fontWeight: '800',
  },
  body: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
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
