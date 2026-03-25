import { hexToRgba } from '@/components/auth/AuthKit';
import { ColorTheme, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goSmartBudgetBack } from './_navigation';

export default function DeleteBudgetCategoryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: hexToRgba(colors.text, 0.32) }]} edges={['top', 'bottom']}>
      <Pressable style={styles.scrim} onPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting/manage-categories')} />
      <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: hexToRgba(colors.error, 0.1) }]}>
          <MaterialIcons name="delete-outline" size={28} color={colors.error} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Delete Budget Category</Text>
        <Text style={[styles.body, { color: hexToRgba(colors.text, 0.56) }]}>
          This action removes the category from the current planner. The UI mirrors the destructive confirmation screen in the kit.
        </Text>
        <View style={styles.buttonStack}>
          <Pressable style={[styles.dangerButton, { backgroundColor: colors.error }]} onPress={() => router.replace('/(finance)/smart-budgeting/manage-categories')}>
            <Text style={[styles.dangerButtonText, { color: colors.card }]}>Delete Category</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]} onPress={() => goSmartBudgetBack(router, '/(finance)/smart-budgeting/manage-categories')}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorTheme) {
  return StyleSheet.create({
    screen: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
    scrim: { ...StyleSheet.absoluteFillObject },
    sheet: { borderRadius: 28, borderWidth: 1, padding: 22, alignItems: 'center' },
    iconWrap: { width: 66, height: 66, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    title: { marginTop: 18, fontSize: 24, fontWeight: '900', textAlign: 'center' },
    body: { marginTop: 10, fontSize: Typography.body, lineHeight: 21, textAlign: 'center' },
    buttonStack: { marginTop: 24, width: '100%', gap: 12 },
    dangerButton: { minHeight: 48, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    dangerButtonText: { fontSize: 14, fontWeight: '800' },
    cancelButton: { minHeight: 48, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    cancelButtonText: { fontSize: 14, fontWeight: '800' },
  });
}
