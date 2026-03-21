
import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";

interface ButtonProps {
    title: string;
    onPress: () => void;
    colorBackground: string;
    colorText: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
}

export const ThemeButton = ({ title, onPress, colorBackground = '#fff', colorText='#000', style, textStyle, disabled = false }: ButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pill, 
        { backgroundColor: colorBackground, opacity: disabled ? 0.55 : pressed ? 0.9 : 1 },
        style
      ]}
    >
      <Text style={[styles.text, { color: colorText}, textStyle]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    minHeight: 48,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    fontSize: 14,
  }
});
