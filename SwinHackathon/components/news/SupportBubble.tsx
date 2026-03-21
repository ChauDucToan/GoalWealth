import { hexToRgba } from '@/components/auth/AuthKit';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Typography } from '@/constants/theme';

export function SupportBubble() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      {open ? (
        <View style={styles.chatCard}>
          <Text style={styles.chatTitle}>Support Assistant</Text>
          <Text style={styles.chatText}>Hi, can I help you find an article or workshop?</Text>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Type here..."
              placeholderTextColor={hexToRgba(colors.text, 0.4)}
              style={styles.input}
            />
            <Pressable style={styles.sendButton}>
              <MaterialIcons name="send" size={14} color={colors.card} />
            </Pressable>
          </View>
        </View>
      ) : null}

      <Pressable style={styles.bubble} onPress={() => setOpen((prev) => !prev)}>
        <MaterialIcons name={open ? 'close' : 'support-agent'} size={20} color={colors.card} />
      </Pressable>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    overlay: {
      position: 'absolute',
      right: 16,
      bottom: 18,
      alignItems: 'flex-end',
      gap: 10,
    },
    bubble: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryDark,
    },
    chatCard: {
      width: 250,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 10,
      gap: 8,
    },
    chatTitle: {
      fontSize: Typography.body,
      fontWeight: '800',
      color: colors.text,
    },
    chatText: {
      fontSize: Typography.body,
      lineHeight: 16,
      color: hexToRgba(colors.text, 0.66),
    },
    inputRow: {
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.primaryLight,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 10,
      paddingRight: 4,
      gap: 6,
    },
    input: {
      flex: 1,
      fontSize: Typography.body,
      color: colors.text,
      paddingVertical: 0,
    },
    sendButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryDark,
    },
  });
}
