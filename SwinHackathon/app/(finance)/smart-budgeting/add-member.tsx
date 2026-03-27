import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from '@/lib/expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goSmartBudgetBack } from './_navigation';

export default function AddBudgetMemberScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.backgroundSoft }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting/invite-members')}>
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add Member to Budget</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.fieldStack}>
          {['Full name', 'Email address', 'Role'].map((label, index) => (
            <View key={label} style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.46) }]}>{label}</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  placeholder={index === 2 ? 'Viewer or Editor' : `Enter ${label.toLowerCase()}`}
                  placeholderTextColor={hexToRgba(colors.text, 0.34)}
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomArea}>
          <Pressable style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]} onPress={() => router.replace('/(finance)/smart-budgeting/invite-members')}>
            <Text style={[styles.primaryButtonText, { color: colors.card }]}>Add Member to Budget</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    headerButton: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800' },
    headerSpacer: { width: 40 },
    fieldStack: { marginTop: 28, gap: 16 },
    fieldGroup: { gap: 8 },
    fieldLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    inputWrap: { minHeight: 52, borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, justifyContent: 'center' },
    input: { fontSize: Typography.body, fontWeight: '600' },
    bottomArea: { marginTop: 'auto', paddingTop: 18 },
    primaryButton: { minHeight: 50, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
