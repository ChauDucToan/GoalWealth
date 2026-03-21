import { ThemeButton } from '@/components/ThemeButton';
import { AssistantCard, AssistantScreen } from '@/components/assistant/AssistantScaffold';
import { hexToRgba } from '@/components/auth/AuthKit';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ResetMemoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { resetAssistantMemory } = useAssistant();

  return (
    <AssistantScreen
      title="Clear Chatbot Data"
      subtitle="Reset stored assistant memory, notes and demo conversation history"
    >
      <View style={styles.stack}>
        <AssistantCard style={[styles.warningCard, { backgroundColor: colors.darkBackground }]}>
          <View
            style={[
              styles.warningIcon,
              { backgroundColor: hexToRgba(colors.error, 0.18) },
            ]}
          >
            <MaterialIcons name="delete-outline" size={28} color={colors.error} />
          </View>
          <Text style={[styles.warningTitle, { color: colors.card }]}>
            This will reset the assistant workspace
          </Text>
          <Text style={[styles.warningBody, { color: hexToRgba(colors.card, 0.78) }]}>
            Your current demo thread, adaptive memory and saved assistant notes will be cleared.
          </Text>
        </AssistantCard>

        <AssistantCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Items that will be cleared</Text>
          <View style={styles.listStack}>
            {[
              'Current assistant conversation',
              'Adaptive memory preferences',
              'Custom memory notes',
              'Selected scenario state',
            ].map((item) => (
              <View key={item} style={styles.listRow}>
                <MaterialIcons name="check-circle" size={18} color={colors.primaryDark} />
                <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>
        </AssistantCard>

        <View style={styles.buttonRow}>
          <ThemeButton
            title="Cancel"
            onPress={() => router.back()}
            colorBackground={colors.card}
            colorText={colors.primaryDark}
            style={[styles.button, styles.outlineButton]}
          />
          <ThemeButton
            title="Reset now"
            onPress={() => {
              resetAssistantMemory();
              router.replace('/(tabs)/assistant');
            }}
            colorBackground={colors.error}
            colorText={colors.card}
            style={styles.button}
          />
        </View>
      </View>
    </AssistantScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginTop: 18,
    gap: 16,
  },
  warningCard: {
    borderWidth: 0,
    alignItems: 'center',
  },
  warningIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningTitle: {
    marginTop: 16,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  warningBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  listStack: {
    marginTop: 14,
    gap: 14,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
  },
  outlineButton: {
    borderWidth: 1,
  },
});
