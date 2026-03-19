
import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

interface ButtonProps {
    title: string;
    onPress: () => void;
    colorBackground: string;
    colorText: string;
    style?: ViewStyle | ViewStyle[];
}

export const ThemeButton = ({ title, onPress, colorBackground = '#fff', colorText='#000', style }: ButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill, 
        { backgroundColor: colorBackground, opacity: pressed ? 0.9 : 1 },
        style
      ]}
    >
      <Text style={[styles.text, { color: colorText}]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: { borderRadius: 100, paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center', width: 160, margin:6 },
  text: { fontWeight: 'bold', fontSize: 14 }
});