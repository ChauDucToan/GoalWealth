import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function SendingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    amount: string;
    recipient: string;
    status: 'success' | 'failed';
    transactionId?: string;
  }>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace({
        pathname: '/(finance)/transfer-result',
        params,
      });
    }, 1200);

    return () => clearTimeout(timeout);
  }, [params, router]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.card }]}>
      <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
        <MaterialIcons name="sync" size={28} color={colors.primaryDark} />
      </View>
      <ActivityIndicator
        size="small"
        color={colors.primaryDark}
        style={styles.spinner}
      />
      <Text style={[styles.title, { color: colors.text }]}>Sending your money...</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        We&apos;re preparing the transfer to {params.recipient}.
      </Text>
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
    width: 78,
    height: 78,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 24,
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
