import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { profileActions } from '@/components/home/mock-data';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
          ]}
        >
          <MaterialIcons name="person" size={30} color={colors.primaryDark} />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>Jonathan Doe</Text>
        <Text style={[styles.email, { color: hexToRgba(colors.text, 0.56) }]}>
          testmode@goalwealth.ai
        </Text>
      </View>

      <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
        {profileActions.map((item) => (
          <View key={item.id} style={styles.menuRow}>
            <View style={styles.menuLabelWrap}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
              >
                <MaterialIcons name={item.icon} size={18} color={colors.primaryDark} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>{item.label}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={hexToRgba(colors.text, 0.34)} />
          </View>
        ))}
      </View>

      <ThemeButton
        title="Back to Sign In"
        onPress={() => router.replace('/(auth)/signIn')}
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
  profileCard: {
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
  },
  email: {
    marginTop: 8,
    fontSize: 14,
  },
  menuCard: {
    borderRadius: 24,
    padding: 18,
  },
  menuRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
