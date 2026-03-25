import { hexToRgba } from '@/components/auth/AuthKit';
import { subscriptionTypes } from '@/components/finance/subscription-data';
import { ColorTheme } from '@/constants/theme';
import { useSubscriptionSetup } from '@/hooks/use-subscription-setup';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SubscriptionSetupPrimaryButton, SubscriptionSetupShell } from './_shared';

const typeMeta = {
  Entertainment: { icon: 'play-circle-outline', body: 'Streaming, music or video subscriptions.' },
  Software: { icon: 'lightbulb-outline', body: 'Tools, apps and work-related recurring plans.' },
  Fitness: { icon: 'fitness-center', body: 'Gym, workouts and wellness memberships.' },
  Delivery: { icon: 'local-shipping', body: 'Food, logistics or convenience recurring charges.' },
} as const;

export default function SubscriptionSetupTypeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setType } = useSubscriptionSetup();

  return (
    <SubscriptionSetupShell
      step={3}
      totalSteps={7}
      title="What type of subscription is it?"
      body="This is used for grouping, reminders and later optimization suggestions."
      footer={<SubscriptionSetupPrimaryButton label="Continue" onPress={() => router.push('/(finance)/subscription-setup/amount')} />}
    >
      <View style={styles.wrap}>
        {subscriptionTypes.map((item) => {
          const active = item === state.type;
          return (
            <Pressable
              key={item}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? hexToRgba(colors.primaryDark, 0.1) : colors.card,
                  borderColor: active ? colors.primaryDark : colors.border,
                },
              ]}
              onPress={() => setType(item)}
            >
              <View style={[styles.iconWrap, { backgroundColor: active ? hexToRgba(colors.primaryDark, 0.16) : colors.backgroundSoft }]}>
                <MaterialIcons name={typeMeta[item].icon} size={20} color={active ? colors.primaryDark : colors.text} />
              </View>
              <Text style={[styles.chipText, { color: active ? colors.primaryDark : colors.text }]}>{item}</Text>
              <Text style={[styles.chipBody, { color: hexToRgba(colors.text, 0.54) }]}>{typeMeta[item].body}</Text>
            </Pressable>
          );
        })}
      </View>
    </SubscriptionSetupShell>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    chip: { minWidth: '47%', borderWidth: 1, borderRadius: 22, paddingVertical: 18, paddingHorizontal: 14, alignItems: 'center' },
    iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    chipText: { marginTop: 10, fontSize: 14, fontWeight: '800' },
    chipBody: { marginTop: 6, fontSize: 11, lineHeight: 16, fontWeight: '500', textAlign: 'center' },
  });
}
