import { hexToRgba } from '@/components/auth/AuthKit';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export function AssistantScreen({
  title,
  subtitle,
  children,
  rightAccessory,
  contentStyle,
  scroll = true,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightAccessory?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const body = (
    <View style={[styles.content, contentStyle]}>
      <View style={styles.headerRow}>
        <Pressable
          style={[
            styles.backButton,
            { backgroundColor: colors.card, borderColor: hexToRgba(colors.primaryDark, 0.08) },
          ]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: hexToRgba(colors.text, 0.56) }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightAccessory}>{rightAccessory}</View>
      </View>

      {children}
    </View>
  );

  if (!scroll) {
    return <View style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}>{body}</View>;
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.backgroundSoft }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {body}
    </ScrollView>
  );
}

export function AssistantCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: hexToRgba(colors.primaryDark, 0.06),
          shadowColor: colors.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 44,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 21,
  },
  rightAccessory: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
});
